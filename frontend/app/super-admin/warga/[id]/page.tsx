import { notFound } from "next/navigation"
import { WargaDetail } from "@/components/warga/warga-detail"
import { MOCK_WARGA } from "@/lib/mock-data"

export default async function SuperAdminWargaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const warga = MOCK_WARGA.find((w) => w.id === id)
  if (!warga) notFound()

  return <WargaDetail warga={warga} backHref="/super-admin/warga" />
}
