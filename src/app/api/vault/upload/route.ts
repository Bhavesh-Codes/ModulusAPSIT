import { NextResponse } from "next/server";
import { uploadFileToR2 } from "@/lib/r2";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const admin = createAdminClient()

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const customFilename = (formData.get("filename") as string | null)?.trim() || null;
    // Parse tags JSON array sent by the client (e.g. '["lecture","notes"]')
    let initialTags: string[] = [];
    const tagsRaw = formData.get("tags") as string | null;
    if (tagsRaw) {
      try { initialTags = JSON.parse(tagsRaw); } catch { /* ignore bad JSON */ }
    }
    // SHA-256 of the file, computed in the browser (used to spot duplicate shares)
    const hashRaw = (formData.get("content_hash") as string | null)?.trim().toLowerCase() || null;
    const contentHash = hashRaw && /^[a-f0-9]{64}$/.test(hashRaw) ? hashRaw : null;
    // Optional folder_id — null means root
    const folderId = (formData.get("folder_id") as string | null) || null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File exceeds 20MB limit." }, { status: 400 });
    }

    // 1. Quota Check (using admin client for minimal latency)
    const { data: userData, error: userQueryError } = await admin
      .from('users')
      .select('storage_used_bytes')
      .eq('id', user.id)
      .maybeSingle()

    if (userQueryError) {
      console.error("Storage lookup error:", userQueryError)
    }

    const currentUsed = userData?.storage_used_bytes || 0
    const MAX_STORAGE = 500 * 1024 * 1024 // 500 MB
    if (currentUsed + file.size > MAX_STORAGE) {
      return NextResponse.json({ error: "Upload would exceed your 500MB storage quota." }, { status: 400 })
    }

    // 2. Process & Upload to R2
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExt = file.name.split('.').pop() || 'bin';
    const uniqueFileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    await uploadFileToR2(buffer, uniqueFileName, file.type || "application/octet-stream");

    // 3. Database Metadata Sync
    const { data: fileData, error: fileInsertError } = await admin
      .from('files')
      .insert({
        owner_id: user.id,
        r2_object_key: uniqueFileName,
        filename: customFilename || file.name,
        mime_type: file.type || "application/octet-stream",
        size_bytes: file.size,
      })
      .select()
      .single()

    if (fileInsertError || !fileData) {
      console.error("File DB Insert Error:", fileInsertError)
      return NextResponse.json({ error: "Database metadata sync failed." }, { status: 500 })
    }

    // Insert into vault_items and update storage quota in parallel
    const [vaultItemResult, updateQuotaResult] = await Promise.all([
      admin
        .from('vault_items')
        .insert({
          file_id: fileData.id,
          owner_id: user.id,
          item_type: 'file',
          is_private: true,
          ...(contentHash ? { content_hash: contentHash } : {}),
          ...(initialTags.length > 0 ? { tags: initialTags } : {}),
          ...(folderId ? { folder_id: folderId } : {}),
        })
        .select()
        .single(),
      admin
        .from('users')
        .update({ storage_used_bytes: currentUsed + file.size })
        .eq('id', user.id)
    ])

    if (vaultItemResult.error) {
      console.error("Vault DB Insert Error:", vaultItemResult.error)
      return NextResponse.json({ error: "Vault linkage failed." }, { status: 500 })
    }

    if (updateQuotaResult.error) {
      console.error("Quota increment error:", updateQuotaResult.error)
    }

    return NextResponse.json({
      success: true,
      data: fileData,
      vaultItem: vaultItemResult.data
    });
  } catch (error: any) {
    console.error("Upload route error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}
