"use client"

import { useEffect, useState } from "react"
import { fetchWithAuth, useAuth } from "@/lib/auth-context"
import { PageHeader } from "@/components/layout/page-header"
import { StatCard } from "@/components/dashboard/stat-card"
import {
  JenisKelaminChart,
  StatusKependudukanChart,
} from "@/components/dashboard/demografi-charts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  formatRupiah,
  formatTanggal,
} from "@/lib/mock-data"
import { ArrowDownCircle, ArrowUpCircle, IdCard, Loader2, Users, Wallet } from "lucide-react"

export function AdminDashboardClient() {
  const { user } = useAuth()
  if (!user || !user.rt) return null

  const rt = user.rt
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({
    totalKK: 0,
    totalWarga: 0,
    lakiLaki: 0,
    perempuan: 0,
    tetap: 0,
    domisili: 0,
    kontrak: 0,
    saldo: 0,
    pemasukan: 0,
    pengeluaran: 0,
    transaksi: [] as any[],
  })

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetchWithAuth("/rt/dashboard")
        const json = await res.json()
        if (json.success) {
          setData({
            totalKK: json.data.statistik.total_kk || 0,
            totalWarga: json.data.statistik.total_warga || 0,
            lakiLaki: json.data.statistik.laki_laki || 0,
            perempuan: json.data.statistik.perempuan || 0,
            tetap: json.data.statistik.tetap || 0,
            domisili: json.data.statistik.domisili || 0,
            kontrak: json.data.statistik.kontrak || 0,
            saldo: json.data.keuangan.saldo || 0,
            pemasukan: json.data.keuangan.pemasukan || 0,
            pengeluaran: json.data.keuangan.pengeluaran || 0,
            transaksi: json.data.transaksi_terbaru || [],
          })
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  return (
    <>
      <PageHeader title={`Dashboard RT ${rt}`} description={`Ringkasan kondisi warga dan keuangan di RT ${rt}.`} />

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
          title="Saldo Kas RT"
          value={formatRupiah(data.saldo)}
          description={`${formatRupiah(data.pemasukan)} masuk`}
          icon={Wallet}
          variant="success"
        />
        <StatCard
          title="Warga Tetap"
          value={data.tetap}
          description={`${data.domisili + data.kontrak} pendatang`}
          icon={Users}
          variant="warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <StatusKependudukanChart data={data} />
        <JenisKelaminChart data={data} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaksi Terbaru</CardTitle>
          <CardDescription>5 aktivitas keuangan terkini di RT {rt}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : data.transaksi.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Belum ada transaksi tercatat di RT ini.</p>
          ) : (
            data.transaksi.map((t: any) => (
              <div key={t.id} className="flex items-center justify-between gap-3 pb-3 border-b last:border-0 last:pb-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={
                      (t.jenis === "pemasukan" || t.jenis === "masuk")
                        ? "size-9 shrink-0 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center"
                        : "size-9 shrink-0 rounded-full bg-destructive/15 text-destructive flex items-center justify-center"
                    }
                  >
                    {(t.jenis === "pemasukan" || t.jenis === "masuk") ? (
                      <ArrowUpCircle className="size-4" />
                    ) : (
                      <ArrowDownCircle className="size-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{t.keterangan}</p>
                    <p className="text-xs text-muted-foreground">{formatTanggal(t.tanggal)}</p>
                  </div>
                </div>
                <p
                  className={
                    (t.jenis === "pemasukan" || t.jenis === "masuk")
                      ? "font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap"
                      : "font-semibold text-destructive whitespace-nowrap"
                  }
                >
                  {(t.jenis === "pemasukan" || t.jenis === "masuk") ? "+" : "-"} {formatRupiah(Number(t.jumlah))}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </>
  )
}
