"use client"

import { useEffect, useState } from "react"
import { fetchWithAuth, useAuth } from "@/lib/auth-context"
import { PageHeader } from "@/components/layout/page-header"
import { StatCard } from "@/components/dashboard/stat-card"
import { WargaTable } from "@/components/warga/warga-table"
import { Users, UserCheck } from "lucide-react"
import type { Warga } from "@/lib/types"

export default function WargaDaftarPage() {
  const { user } = useAuth()
  if (!user || !user.rt) return null

  const rt = user.rt
  const [wargaRT, setWargaRT] = useState<Warga[]>([])

  const fetchData = async () => {
    const res = await fetchWithAuth("/portal-warga/data-warga?limit=200")
    const json = await res.json()
    if (json.success) {
      const mapped = (json.data || []).map((w: any) => {
        const statusRaw = String(w.status_warga || "").toLowerCase()
        const statusKependudukan =
          statusRaw === "tetap" ? "Tetap" : statusRaw === "kontrak" ? "Kontrak" : "Domisili"

        const jenisKelamin = w.jenis_kelamin === "P" ? "Perempuan" : "Laki-laki"

        const statusPerkawinanRaw = String(w.status_pernikahan || "").toLowerCase()
        const statusPerkawinan =
          statusPerkawinanRaw === "menikah"
            ? "Kawin"
            : statusPerkawinanRaw === "cerai"
              ? "Cerai Hidup"
              : "Belum Kawin"

        return {
          id: String(w.id),
          nik: String(w.nik || ""),
          noKK: "—",
          nama: String(w.nama || ""),
          jenisKelamin,
          tempatLahir: String(w.tempat_lahir || ""),
          tanggalLahir: String(w.tanggal_lahir || ""),
          agama: "Islam",
          pendidikan: String(w.pendidikan || ""),
          pekerjaan: String(w.pekerjaan || ""),
          pendapatan: Number(w.pendapatan || 0),
          statusPerkawinan,
          hubunganKeluarga: "Anggota",
          kewarganegaraan: "WNI",
          alamat_ktp: String(w.alamat_ktp || ""),
          alamat_sekarang: String(w.alamat_sekarang || ""),
          rt: String(w.rt || rt),
          rw: String(w.rw || "08"),
          statusKependudukan,
          noTelepon: w.no_hp ? String(w.no_hp) : "",
        } as Warga
      })
      setWargaRT(mapped)
    }
  }

  useEffect(() => {
    fetchData().catch(() => null)
  }, [])

  const total = wargaRT.length
  const tetap = wargaRT.filter((w) => w.statusKependudukan === "Tetap").length

  return (
    <>
      <PageHeader title={`Daftar Warga RT ${rt}`} description="Lihat informasi warga di lingkungan Anda." />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <StatCard title="Total Warga" value={total} icon={Users} variant="primary" />
        <StatCard
          title="Warga Tetap"
          value={tetap}
          description={`${total - tetap} pendatang`}
          icon={UserCheck}
          variant="success"
        />
      </div>

      <WargaTable data={wargaRT} detailHrefBase="#" showRT={false} canManage={false} allowSelfEdit onAdd={fetchData} />
    </>
  )
}
