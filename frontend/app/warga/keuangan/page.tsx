"use client"

import { useEffect, useState } from "react"
import { fetchWithAuth, useAuth } from "@/lib/auth-context"
import { PageHeader } from "@/components/layout/page-header"
import { KeuanganSummary } from "@/components/keuangan/keuangan-summary"
import { TransaksiTable } from "@/components/keuangan/transaksi-table"
import { Card, CardContent } from "@/components/ui/card"
import { Info } from "lucide-react"
import type { Transaksi } from "@/lib/types"

export default function WargaKeuanganPage() {
  const { user } = useAuth()
  if (!user || !user.rt) return null

  const [effectiveRt, setEffectiveRt] = useState(user.rt)
  const [loading, setLoading] = useState(true)
  const [saldo, setSaldo] = useState(0)
  const [masuk, setMasuk] = useState(0)
  const [keluar, setKeluar] = useState(0)
  const [transaksi, setTransaksi] = useState<Transaksi[]>([])

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetchWithAuth("/portal-warga/laporan-keuangan?limit=200")
        const json = await res.json()
        if (json.success) {
          if (json.statistik?.rt) setEffectiveRt(String(json.statistik.rt))
          setSaldo(Number(json.statistik?.total_kas || 0))
          setMasuk(Number(json.statistik?.total_pemasukan || 0))
          setKeluar(Number(json.statistik?.total_pengeluaran || 0))

          const items = Array.isArray(json.data) ? json.data : []
          setTransaksi(
            items.map((t: any) => ({
              id: String(t.id),
              tanggal: String(t.tanggal),
              keterangan: String(t.keterangan || ""),
              kategori: String(t.kategori || ""),
              jenis: t.jenis === "keluar" ? "keluar" : "masuk",
              jumlah: Number(t.jumlah || 0),
              rt: String(t.rt || effectiveRt),
              pencatat: String(t.pencatat || "Sistem"),
            })),
          )
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  return (
    <>
      <PageHeader
        title={`Keuangan RT ${effectiveRt}`}
        description="Transparansi arus kas pemasukan dan pengeluaran lingkungan Anda."
      />

      <Card className="mb-6 border-primary/30 bg-primary/5">
        <CardContent className="p-4 flex items-start gap-3">
          <div className="size-9 shrink-0 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
            <Info className="size-4" />
          </div>
          <div className="text-sm">
            <p className="font-medium">Mode Transparansi</p>
            <p className="text-muted-foreground mt-0.5">
              Anda dapat melihat seluruh transaksi keuangan RT untuk memastikan akuntabilitas pengelolaan kas. Hubungi
              Ketua RT bila ada pertanyaan.
            </p>
          </div>
        </CardContent>
      </Card>

      <KeuanganSummary saldo={saldo} masuk={masuk} keluar={keluar} />

      {loading ? <p className="text-sm text-muted-foreground text-center py-6">Memuat...</p> : null}
      <TransaksiTable data={transaksi} showRT={false} />
    </>
  )
}
