import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { error } = await supabase
    .from("vault_items")
    .select("id")
    .limit(1);

  if (error) {
    return NextResponse.json({ status: "Error", message: error.message }, { status: 500 });
  }

  return NextResponse.json({ status: "Success", message: "Supabase pinged successfully." });
}
