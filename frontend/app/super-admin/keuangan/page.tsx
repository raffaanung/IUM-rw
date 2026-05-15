"use client"

import { useEffect, useState } from "react"
import { useAuth, fetchWithAuth } from "@/lib/auth-context"
import { PageHeader } from "@/components/layout/page-header"
import { KeuanganSummary } from "@/components/keuangan/keuangan-summary"
import { TransaksiTable } from "@/components/keuangan/transaksi-table"
import { LaporanFormDialog } from "@/components/keuangan/laporan-form-dialog"
import type { Transaksi } from "@/lib/types"

export default function SuperAdminKeuanganPage() {
  const { user } = useAuth()
  const [transaksi, setTransaksi] = useState<Transaksi[]>([])
  const [summary, setSummary] = useState({ saldo: 0, masuk: 0, keluar: 0 })
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const [dashRes, listRes] = await Promise.all([
        fetchWithAuth("/rw/dashboard"),
        fetchWithAuth("/rw/keuangan?limit=200"),
      ])

      const dashJson = await dashRes.json()
      if (dashJson.success) {
        setSummary({
          saldo: dashJson.data.total_saldo || 0,
          masuk: dashJson.data.total_masuk || 0,
          keluar: dashJson.data.total_keluar || 0,
        })
      }

      const listJson = await listRes.json()
      if (listJson.success) {
        const items = listJson.data?.data ?? []
        const mappedData = items.map((t: any) => ({
          id: String(t.id),
          tanggal: t.tanggal,
          keterangan: t.judul,
          kategori: t.kategori,
          jumlah: Number(t.jumlah),
          jenis: t.jenis === "pemasukan" ? "masuk" : "keluar",
          pencatat: t.user?.name || t.pencatat || "Sistem",
          rt: t.rt,
        }))
        setTransaksi(mappedData)
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
        title="Keuangan RW"
        description="Pantau dan kelola arus kas pemasukan dan pengeluaran seluruh wilayah RW."
        actions={<LaporanFormDialog onSuccess={fetchData} />}
      />

      <KeuanganSummary saldo={summary.saldo} masuk={summary.masuk} keluar={summary.keluar} />

      <TransaksiTable data={transaksi} />
    </>
  )
}
