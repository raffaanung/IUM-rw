"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/layout/page-header"
import { StatCard } from "@/components/dashboard/stat-card"
import { WargaTable } from "@/components/warga/warga-table"
import { fetchWithAuth } from "@/lib/auth-context"
import { Users, UserCheck, UserMinus } from "lucide-react"
import type { Warga } from "@/lib/types"

export default function SuperAdminWargaPage() {
  const [warga, setWarga] = useState<Warga[]>([])
  const [stats, setStats] = useState({ total: 0, tetap: 0, domisili: 0, kontrak: 0 })
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const response = await fetchWithAuth("/rw/warga")
      const data = await response.json()
      if (data.success) {
        setWarga(data.data)
        
        // Hitung statistik sederhana dari data yang ada
        const total = data.data.length
        const tetap = data.data.filter((w: Warga) => w.statusKependudukan === "Tetap").length
        const domisili = data.data.filter((w: Warga) => w.statusKependudukan === "Domisili").length
        const kontrak = data.data.filter((w: Warga) => w.statusKependudukan === "Kontrak").length
        
        setStats({ total, tetap, domisili, kontrak })
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <>
      <PageHeader
        title="Data Warga"
        description="Kelola seluruh data warga di lingkup RW 8. Tambah, edit, hapus, dan filter data warga."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard title="Total Warga" value={stats.total} icon={Users} variant="primary" />
        <StatCard
          title="Warga Tetap"
          value={stats.tetap}
          description={stats.total > 0 ? `${Math.round((stats.tetap / stats.total) * 100)}% dari total` : "0% dari total"}
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

      <WargaTable 
        data={warga} 
        detailHrefBase="/super-admin/warga" 
        onAdd={fetchData}
      />
    </>
  )
}
