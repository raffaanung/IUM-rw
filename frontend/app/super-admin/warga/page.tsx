import { PageHeader } from "@/components/layout/page-header"
import { StatCard } from "@/components/dashboard/stat-card"
import { WargaTable } from "@/components/warga/warga-table"
import { Button } from "@/components/ui/button"
import { MOCK_WARGA, getStatistikDemografi } from "@/lib/mock-data"
import { Download, Users, UserCheck, UserMinus } from "lucide-react"

export default function SuperAdminWargaPage() {
  const stats = getStatistikDemografi()

  return (
    <>
      <PageHeader
        title="Data Warga"
        description="Kelola seluruh data warga di lingkup RW 05. Tambah, edit, hapus, dan filter data warga."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard title="Total Warga" value={stats.total} icon={Users} variant="primary" />
        <StatCard
          title="Warga Tetap"
          value={stats.tetap}
          description={`${Math.round((stats.tetap / stats.total) * 100)}% dari total`}
          icon={UserCheck}
          variant="success"
        />
        <StatCard
          title="Pendatang"
          value={stats.domisili + stats.kontrak}
          description={`${stats.domisili} domisili · ${stats.kontrak} kontrak`}
          icon={UserMinus}
          variant="warning"
        />
      </div>

      <WargaTable data={MOCK_WARGA} detailHrefBase="/super-admin/warga" />
    </>
  )
}
