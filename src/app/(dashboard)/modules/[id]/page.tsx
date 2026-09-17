import { redirect } from "next/navigation"

export default async function ModuleHomePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/modules/${id}/vault`)
}
