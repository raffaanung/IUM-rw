"use client"

import { useAuth } from "@/lib/auth-context"
import { PageHeader } from "@/components/layout/page-header"
import { StatCard } from "@/components/dashboard/stat-card"
import { WargaTable } from "@/components/warga/warga-table"
import { MOCK_WARGA, getStatistikDemografi } from "@/lib/mock-data"
import { Users, UserCheck } from "lucide-react"

export default function WargaDaftarPage() {
  const { user } = useAuth()
  if (!user || !user.rt) return null

  const rt = user.rt
  const wargaRT = MOCK_WARGA.filter((w) => w.rt === rt)
  const stats = getStatistikDemografi(rt)

  return (
    <>
      <PageHeader title={`Daftar Warga RT ${rt}`} description="Lihat informasi warga di lingkungan Anda." />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <StatCard title="Total Warga" value={stats.total} icon={Users} variant="primary" />
        <StatCard
          title="Warga Tetap"
          value={stats.tetap}
          description={`${stats.domisili + stats.kontrak} pendatang`}
          icon={UserCheck}
          variant="success"
        />
      </div>

      <WargaTable data={wargaRT} detailHrefBase="#" showRT={false} canManage={false} />
    </>
  )
}
