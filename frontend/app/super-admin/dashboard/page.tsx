"use client"

import { useEffect, useState } from "react"
import { useAuth, fetchWithAuth } from "@/lib/auth-context"
import { PageHeader } from "@/components/layout/page-header"
import { StatCard } from "@/components/dashboard/stat-card"
import {
  JenisKelaminChart,
  StatusKependudukanChart,
} from "@/components/dashboard/demografi-charts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatRupiah, formatTanggal } from "@/lib/mock-data"
import { ArrowDownCircle, ArrowUpCircle, IdCard, Users, Wallet } from "lucide-react"

export default function SuperAdminDashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState({
    totalWarga: 0,
    totalKK: 0,
    saldoRW: 0,
    masukRW: 0,
    keluarRW: 0,
    wargaTetap: 0,
    lakiLaki: 0,
    perempuan: 0,
    tetap: 0,
    domisili: 0,
    kontrak: 0,
    transaksi: []
  })

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetchWithAuth("/rw/dashboard")
        const json = await res.json()
        if (json.success) {
          setData({
            totalWarga: json.data.total_warga,
            totalKK: json.data.total_kk,
            saldoRW: json.data.total_saldo,
            masukRW: json.data.total_masuk,
            keluarRW: json.data.total_keluar,
            wargaTetap: json.data.warga_tetap,
            lakiLaki: json.data.laki_laki,
            perempuan: json.data.perempuan,
            tetap: json.data.warga_tetap,
            domisili: json.data.warga_domisili,
            kontrak: json.data.warga_kontrak,
            transaksi: json.data.transaksi_terbaru || []
          })
        }
      } catch (e) {
        console.error(e)
      }
    }
    fetchDashboardData()
  }, [])

  return (
    <>
      <PageHeader title="Dashboard RW" description="Ringkasan data seluruh warga dan keuangan tingkat RW." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total KK" value={data.totalKK} icon={IdCard} variant="primary" />
        <StatCard
          title="Total Warga"
          value={data.totalWarga}
          description={`${data.lakiLaki} L · ${data.perempuan} P`}
          icon={Users}
          variant="primary"
        />
        <StatCard
          title="Total Kas RW"
          value={formatRupiah(data.saldoRW)}
          description={`${formatRupiah(data.masukRW)} total masuk`}
          icon={Wallet}
          variant="success"
        />
        <StatCard title="Warga Tetap" value={data.wargaTetap} icon={Users} variant="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <StatusKependudukanChart data={{ tetap: data.tetap, domisili: data.domisili, kontrak: data.kontrak }} />
        <JenisKelaminChart data={{ lakiLaki: data.lakiLaki, perempuan: data.perempuan }} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaksi Terbaru (RW)</CardTitle>
          <CardDescription>Aktivitas keuangan lintas RT</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.transaksi.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Belum ada transaksi tercatat.</p>
          ) : (
            data.transaksi.map((t: any) => (
              <div key={t.id} className="flex items-center justify-between gap-3 pb-3 border-b last:border-0 last:pb-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={
                      t.jenis === "pemasukan"
                        ? "size-9 shrink-0 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center"
                        : "size-9 shrink-0 rounded-full bg-destructive/15 text-destructive flex items-center justify-center"
                    }
                  >
                    {t.jenis === "pemasukan" ? <ArrowUpCircle className="size-4" /> : <ArrowDownCircle className="size-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{t.judul}</p>
                    <p className="text-xs text-muted-foreground">{formatTanggal(t.tanggal)} • RT {t.rt}</p>
                  </div>
                </div>
                <p
                  className={
                    t.jenis === "pemasukan"
                      ? "font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap"
                      : "font-semibold text-destructive whitespace-nowrap"
                  }
                >
                  {t.jenis === "pemasukan" ? "+" : "-"} {formatRupiah(t.jumlah)}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </>
  )
}
