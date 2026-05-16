"use client"

import { useEffect, useMemo, useState } from "react"
import { fetchWithAuth, useAuth } from "@/lib/auth-context"
import { PageHeader } from "@/components/layout/page-header"
import { StatCard } from "@/components/dashboard/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatRupiah, formatTanggal } from "@/lib/mock-data"
import {
  JenisKelaminChart,
  StatusKependudukanChart,
} from "@/components/dashboard/demografi-charts"
import { ArrowDownCircle, ArrowUpCircle, Eye, IdCard, Loader2, Users, Wallet } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function WargaDashboardClient() {
  const { user } = useAuth()
  if (!user || !user.rt) return null

  const [effectiveRt, setEffectiveRt] = useState(user.rt)
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
    statusWarga: null as string | null,
  })

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetchWithAuth("/portal-warga/dashboard")
        const json = await res.json()
        if (json.success) {
          if (json.data.user?.rt) setEffectiveRt(String(json.data.user.rt))
          
          setData({
            totalKK: json.data.statistik?.total_kk || 0,
            totalWarga: json.data.statistik?.total_warga || 0,
            lakiLaki: json.data.statistik?.laki_laki || 0,
            perempuan: json.data.statistik?.perempuan || 0,
            tetap: json.data.statistik?.tetap || 0,
            domisili: json.data.statistik?.domisili || 0,
            kontrak: json.data.statistik?.kontrak || 0,
            saldo: Number(json.data.keuangan?.saldo_kas || 0),
            pemasukan: Number(json.data.keuangan?.total_pemasukan || 0),
            pengeluaran: Number(json.data.keuangan?.total_pengeluaran || 0),
            transaksi: Array.isArray(json.data.transaksi_terbaru) ? json.data.transaksi_terbaru : [],
            statusWarga: json.data.profil_warga?.status_warga ? String(json.data.profil_warga.status_warga) : null,
          })
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  const initials = useMemo(() => {
    return user.nama
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }, [user.nama])

  return (
    <>
      <PageHeader title="Dashboard Warga" description={`Informasi umum dan transparansi keuangan RT ${effectiveRt}.`} />

      {/* Welcome card */}
      <Card className="mb-6 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-0">
        <CardContent className="p-6 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="size-14 ring-2 ring-primary-foreground/30">
              <AvatarFallback className="bg-primary-foreground/15 text-primary-foreground text-lg font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm opacity-80">Selamat datang kembali,</p>
              <h2 className="text-xl font-bold">{user.nama}</h2>
              <p className="text-sm opacity-80 mt-1">
                Warga RT {user.rt} / RW {user.rw}
                {data.statusWarga ? ` · ${data.statusWarga}` : ""}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="secondary" size="sm">
              <Link href="/warga/daftar-warga">
                <Eye className="size-4 mr-2" />
                Lihat Profil
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

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
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Transaksi Terbaru</CardTitle>
            <CardDescription>Transparansi arus kas RT {effectiveRt}</CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/warga/keuangan">Lihat Semua</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : data.transaksi.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Belum ada transaksi tercatat.</p>
          ) : (
            data.transaksi.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-3 pb-3 border-b last:border-0 last:pb-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={
                      (t.jenis === "masuk" || t.jenis === "pemasukan")
                        ? "size-9 shrink-0 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center"
                        : "size-9 shrink-0 rounded-full bg-destructive/15 text-destructive flex items-center justify-center"
                    }
                  >
                    {(t.jenis === "masuk" || t.jenis === "pemasukan") ? <ArrowUpCircle className="size-4" /> : <ArrowDownCircle className="size-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{t.keterangan}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-muted-foreground">{formatTanggal(t.tanggal)}</p>
                      <Badge variant="secondary" className="text-xs">
                        {t.kategori}
                      </Badge>
                    </div>
                  </div>
                </div>
                <p
                  className={
                    (t.jenis === "masuk" || t.jenis === "pemasukan")
                      ? "font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap"
                      : "font-semibold text-destructive whitespace-nowrap"
                  }
                >
                  {(t.jenis === "masuk" || t.jenis === "pemasukan") ? "+" : "-"} {formatRupiah(Number(t.jumlah))}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </>
  )
}
