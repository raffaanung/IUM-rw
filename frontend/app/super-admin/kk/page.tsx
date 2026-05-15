"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/layout/page-header"
import { StatCard } from "@/components/dashboard/stat-card"
import { KKTable } from "@/components/kk/kk-table"
import { fetchWithAuth } from "@/lib/auth-context"
import { IdCard, Users } from "lucide-react"
import type { KartuKeluarga } from "@/lib/types"

export default function SuperAdminKKPage() {
  const [kkList, setKKList] = useState<KartuKeluarga[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const response = await fetchWithAuth("/rw/kartu-keluarga")
      const data = await response.json()
      if (data.success) {
        // Map backend data to frontend types
        const mapped = data.data.data.map((kk: any) => ({
          id: String(kk.id),
          noKK: kk.no_kk,
          kepalaKeluarga: kk.kepala_keluarga?.nama || "Belum diatur",
          alamat: kk.alamat,
          rt: kk.rt,
          rw: kk.rw,
          jumlahAnggota: kk.anggota_kk_count || 0,
          tanggalDibuat: kk.created_at,
        }))
        setKKList(mapped)
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
        title="Kartu Keluarga"
        description="Kelola seluruh Kartu Keluarga di tingkat RW. Filter berdasarkan RT untuk fokus per wilayah."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <StatCard title="Jumlah KK" value={kkList.length} icon={IdCard} variant="primary" />
        <StatCard
          title="Total Data"
          value={kkList.length}
          description="Total Kartu Keluarga terdaftar"
          icon={Users}
          variant="success"
        />
      </div>

      <KKTable 
        data={kkList} 
        detailHrefBase="/super-admin/kk" 
        onAdd={fetchData}
      />
    </>
  )
}
