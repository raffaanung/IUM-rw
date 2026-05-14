"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { fetchWithAuth } from "@/lib/auth-context"
import { PageHeader } from "@/components/layout/page-header"
import { StatCard } from "@/components/dashboard/stat-card"
import { WargaTable } from "@/components/warga/warga-table"
import { getStatistikDemografi } from "@/lib/mock-data"
import { Users, UserCheck, UserMinus } from "lucide-react"
import type { Warga } from "@/lib/types"

export default function AdminWargaPage() {
  const { user } = useAuth()
  const [warga, setWarga] = useState<Warga[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const response = await fetchWithAuth("/rt/warga")
      const data = await response.json()
      if (data.success) {
        setWarga(data.data)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.rt) {
      fetchData()
    }
  }, [user])

  if (!user || !user.rt) return null

  const rt = user.rt
  const stats = getStatistikDemografi(rt)

  return (
    <>
      <PageHeader title={`Data Warga RT ${rt}`} description={`Kelola data warga di lingkup RT ${rt} saja.`} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard title="Total Warga" value={warga.length || stats.total} icon={Users} variant="primary" />
        <StatCard title="Warga Tetap" value={warga.filter(w => w.statusKependudukan === 'Tetap').length || stats.tetap} icon={UserCheck} variant="success" />
        <StatCard
          title="Pendatang"
          value={warga.filter(w => w.statusKependudukan !== 'Tetap').length || (stats.domisili + stats.kontrak)}
          description="Berdasarkan data terbaru"
          icon={UserMinus}
          variant="warning"
        />
      </div>

      <WargaTable data={warga} detailHrefBase="/admin/warga" showRT={false} rt={rt} onAdd={fetchData} />
    </>
  )
}
