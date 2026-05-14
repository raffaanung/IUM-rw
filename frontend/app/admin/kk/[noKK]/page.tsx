import { notFound } from "next/navigation"
import { KKDetail } from "@/components/kk/kk-detail"
import { getKartuKeluargaList } from "@/lib/mock-data"

export default async function AdminKKDetailPage({ params }: { params: Promise<{ noKK: string }> }) {
  const { noKK } = await params
  const kk = getKartuKeluargaList().find((k) => k.noKK === noKK)
  if (!kk) notFound()

  return <KKDetail kk={kk} backHref="/admin/kk" wargaHrefBase="/admin/warga" />
}
