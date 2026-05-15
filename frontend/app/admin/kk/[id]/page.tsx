"use client"

import { useEffect, useState, use } from "react"
import { notFound } from "next/navigation"
import { KKDetail } from "@/components/kk/kk-detail"
import { fetchWithAuth } from "@/lib/auth-context"
import type { KartuKeluarga } from "@/lib/types"
import { Loader2 } from "lucide-react"

export default function AdminKKDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [kk, setKK] = useState<KartuKeluarga | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    const response = await fetchWithAuth(`/rt/kartu-keluarga/${id}`)
    const json = await response.json()
    if (json.success) {
      const data = json.data
      setKK({
        id: String(data.id),
        noKK: data.no_kk,
        kepalaKeluarga: data.kepala_keluarga?.nama || "Tidak Ada",
        alamat: data.alamat,
        rt: data.rt,
        rw: data.rw,
        jumlahAnggota: data.anggota_kk?.length || 0,
        tanggalDibuat: data.created_at,
        anggota: (data.anggota_kk || []).map((a: any) => ({
          ...a.warga,
          id: String(a.warga.id),
          tanggalLahir: a.warga.tanggal_lahir,
          jenisKelamin: a.warga.jenisKelamin,
          hubunganKeluarga: a.hubungan_keluarga
        }))
      })
    }
  }

  useEffect(() => {
    const run = async () => {
      try {
        await fetchData()
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [id])

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!kk) notFound()

  return <KKDetail kk={kk} backHref="/admin/kk" wargaHrefBase="/admin/warga" onChanged={fetchData} />
}
