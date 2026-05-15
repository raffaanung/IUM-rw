"use client"

import { useEffect, useState, use } from "react"
import { notFound } from "next/navigation"
import { WargaDetail } from "@/components/warga/warga-detail"
import { fetchWithAuth } from "@/lib/auth-context"
import type { Warga } from "@/lib/types"
import { Loader2 } from "lucide-react"

export default function SuperAdminWargaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [warga, setWarga] = useState<Warga | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchWithAuth(`/rw/warga/${id}`)
        const json = await response.json()
        if (json.success || json.data) {
          const data = json.data || json
          setWarga({
            ...data,
            id: String(data.id),
            noKK: data.noKK || "Belum Ada",
            jenisKelamin: data.jenisKelamin,
            tempatLahir: data.tempatLahir,
            tanggalLahir: data.tanggalLahirFormatted || data.tanggal_lahir,
            statusKependudukan: data.statusKependudukan,
            statusPerkawinan: data.statusPerkawinan,
            noTelepon: data.noTelepon || data.no_hp,
            agama: data.agama || "Islam",
            pendidikan: data.pendidikan || "—",
            pekerjaan: data.pekerjaan || "—",
            pendapatan: Number(data.pendapatan || 0),
            hubunganKeluarga: data.hubunganKeluarga || "Kepala Keluarga",
            kewarganegaraan: data.kewarganegaraan || "WNI",
          })
        } else {
          setError(true)
        }
      } catch (err) {
        console.error(err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !warga) return notFound()

  return <WargaDetail warga={warga} backHref="/super-admin/warga" />
}
