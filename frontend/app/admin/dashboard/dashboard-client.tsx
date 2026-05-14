"use client"

import { useAuth } from "@/lib/auth-context"
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
  getKartuKeluargaList,
  getStatistikDemografi,
  getStatistikKeuangan,
} from "@/lib/mock-data"
import { ArrowDownCircle, ArrowUpCircle, IdCard, Users, Wallet } from "lucide-react"

export function AdminDashboardClient() {
  const { user } = useAuth()
  if (!user || !user.rt) return null

  const rt = user.rt
  const demografi = getStatistikDemografi(rt)
  const keuangan = getStatistikKeuangan(rt)
  const kkRT = getKartuKeluargaList().filter((k) => k.rt === rt)
  const recent = [...keuangan.transaksi]
    .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
    .slice(0, 5)

  return (
    <>
      <PageHeader title={`Dashboard RT ${rt}`} description={`Ringkasan kondisi warga dan keuangan di RT ${rt}.`} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total KK" value={kkRT.length} icon={IdCard} variant="primary" />
        <StatCard
          title="Total Warga"
          value={demografi.total}
          description={`${demografi.lakiLaki} L · ${demografi.perempuan} P`}
          icon={Users}
          variant="primary"
        />
        <StatCard
          title="Saldo Kas RT"
          value={formatRupiah(keuangan.saldo)}
          description={`${formatRupiah(keuangan.masuk)} masuk`}
          icon={Wallet}
          variant="success"
        />
        <StatCard
          title="Warga Tetap"
          value={demografi.tetap}
          description={`${demografi.domisili + demografi.kontrak} pendatang`}
          icon={Users}
          variant="warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <StatusKependudukanChart data={demografi} />
        <JenisKelaminChart data={demografi} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaksi Terbaru</CardTitle>
          <CardDescription>5 aktivitas keuangan terkini di RT {rt}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Belum ada transaksi tercatat di RT ini.</p>
          ) : (
            recent.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-3 pb-3 border-b last:border-0 last:pb-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={
                      t.jenis === "masuk"
                        ? "size-9 shrink-0 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center"
                        : "size-9 shrink-0 rounded-full bg-destructive/15 text-destructive flex items-center justify-center"
                    }
                  >
                    {t.jenis === "masuk" ? <ArrowUpCircle className="size-4" /> : <ArrowDownCircle className="size-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{t.keterangan}</p>
                    <p className="text-xs text-muted-foreground">{formatTanggal(t.tanggal)}</p>
                  </div>
                </div>
                <p
                  className={
                    t.jenis === "masuk"
                      ? "font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap"
                      : "font-semibold text-destructive whitespace-nowrap"
                  }
                >
                  {t.jenis === "masuk" ? "+" : "-"} {formatRupiah(t.jumlah)}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </>
  )
}
