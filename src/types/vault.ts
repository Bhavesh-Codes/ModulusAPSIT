export interface VaultFolder {
  id: string
  name: string
  parent_id: string | null
}

export interface VaultFile {
  id: string
  filename: string
  mime_type: string
  size_bytes: number
}

export interface VaultItem {
  id: string
  created_at: string
  item_type?: string | null
  title?: string | null
  url?: string | null
  tags: string[] | null
  folder_id: string | null
  files: VaultFile | null
  resource_type?: string | null
  academic_year?: string | null
  description?: string | null
  content_hash?: string | null
  uploaded_by_name?: string | null
}
