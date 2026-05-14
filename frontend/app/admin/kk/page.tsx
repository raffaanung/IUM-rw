"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { fetchWithAuth } from "@/lib/auth-context"
import { PageHeader } from "@/components/layout/page-header"
import { StatCard } from "@/components/dashboard/stat-card"
import { KKTable } from "@/components/kk/kk-table"
import { getKartuKeluargaList } from "@/lib/mock-data"
import { IdCard, Users } from "lucide-react"
import type { KartuKeluarga } from "@/lib/types"

export default function AdminKKPage() {
  const { user } = useAuth()
  const [kkList, setKkList] = useState<KartuKeluarga[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const response = await fetchWithAuth("/rt/kartu-keluarga")
      const data = await response.json()
      if (data.success) {
        // Map backend to FE types
        const mapped = data.data.map((item: any) => ({
          noKK: item.no_kk,
          kepalaKeluarga: item.kepala_keluarga?.nama || "Tidak Ada",
          alamat: item.alamat,
          rt: item.kepala_keluarga?.rt || user?.rt || "",
          rw: "05",
          jumlahAnggota: item.anggota_kk_count || 0,
          tanggalDibuat: item.created_at,
          anggota: []
        }))
        setKkList(mapped)
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
  const totalAnggota = kkList.reduce((s, kk) => s + kk.jumlahAnggota, 0)

  return (
    <>
      <PageHeader title={`Kartu Keluarga RT ${rt}`} description={`Daftar Kartu Keluarga di RT ${rt}.`} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <StatCard title="Jumlah KK" value={kkList.length} icon={IdCard} variant="primary" />
        <StatCard
          title="Total Anggota"
          value={totalAnggota}
          description={`Rata-rata ${kkList.length ? (totalAnggota / kkList.length).toFixed(1) : 0} orang/KK`}
          icon={Users}
          variant="success"
        />
      </div>

      <KKTable data={kkList} detailHrefBase="/admin/kk" showRT={false} rt={rt} />
    </>
  )
}
