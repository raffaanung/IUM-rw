"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { fetchWithAuth } from "@/lib/auth-context"
import { PageHeader } from "@/components/layout/page-header"
import { KeuanganSummary } from "@/components/keuangan/keuangan-summary"
import { TransaksiTable } from "@/components/keuangan/transaksi-table"
import { LaporanFormDialog } from "@/components/keuangan/laporan-form-dialog"
import { getStatistikKeuangan } from "@/lib/mock-data"
import type { Transaksi } from "@/lib/types"

export default function AdminKeuanganPage() {
  const { user } = useAuth()
  const [transaksi, setTransaksi] = useState<Transaksi[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const response = await fetchWithAuth("/rt/keuangan")
      const data = await response.json()
      if (data.success) {
        // Transform backend data to FE types if necessary
        const mappedData = data.data.map((t: any) => ({
          id: String(t.id),
          tanggal: t.tanggal,
          keterangan: t.judul,
          kategori: t.kategori,
          jumlah: Number(t.jumlah),
          jenis: t.jenis,
          pencatat: t.user?.name || "Sistem"
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
    if (user?.rt) {
      fetchData()
    }
  }, [user])

  if (!user || !user.rt) return null

  const rt = user.rt
  const stats = getStatistikKeuangan(rt)

  // Hitung saldo dinamis dari data asli jika ada
  const saldoAsli = transaksi.reduce((acc, curr) => 
    curr.jenis === 'pemasukan' ? acc + curr.jumlah : acc - curr.jumlah, 0
  )
  const masukAsli = transaksi.filter(t => t.jenis === 'pemasukan').reduce((s, t) => s + t.jumlah, 0)
  const keluarAsli = transaksi.filter(t => t.jenis === 'pengeluaran').reduce((s, t) => s + t.jumlah, 0)

  return (
    <>
      <PageHeader
        title={`Keuangan RT ${rt}`}
        description={`Kelola arus kas pemasukan dan pengeluaran khusus RT ${rt}.`}
        actions={<LaporanFormDialog rt={rt} pencatat={user.nama} onSuccess={fetchData} />}
      />

      <KeuanganSummary 
        saldo={transaksi.length > 0 ? saldoAsli : stats.saldo} 
        masuk={transaksi.length > 0 ? masukAsli : stats.masuk} 
        keluar={transaksi.length > 0 ? keluarAsli : stats.keluar} 
      />

      <TransaksiTable data={transaksi} showRT={false} />
    </>
  )
}
