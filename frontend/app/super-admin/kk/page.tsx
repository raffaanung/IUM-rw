import { PageHeader } from "@/components/layout/page-header"
import { StatCard } from "@/components/dashboard/stat-card"
import { KKTable } from "@/components/kk/kk-table"
import { getKartuKeluargaList, MOCK_WARGA } from "@/lib/mock-data"
import { IdCard, User, Users } from "lucide-react"

export default function SuperAdminKKPage() {
  const kkList = getKartuKeluargaList()
  const totalWarga = MOCK_WARGA.length
  const kkTunggal = kkList.filter((kk) => kk.jumlahAnggota === 1).length

  return (
    <>
      <PageHeader
        title="Kartu Keluarga"
        description="Kelola seluruh Kartu Keluarga di tingkat RW. Filter berdasarkan RT untuk fokus per wilayah."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard title="Jumlah KK" value={kkList.length} icon={IdCard} variant="primary" />
        <StatCard
          title="Total Warga"
          value={totalWarga}
          description={`Rata-rata ${(totalWarga / kkList.length).toFixed(1)} orang/KK`}
          icon={Users}
          variant="success"
        />
        <StatCard title="KK Tunggal" value={kkTunggal} description="Hanya 1 anggota" icon={User} variant="warning" />
      </div>

      <KKTable data={kkList} detailHrefBase="/super-admin/kk" />
    </>
  )
}
