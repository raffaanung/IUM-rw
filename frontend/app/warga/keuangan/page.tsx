"use client"

import { useAuth } from "@/lib/auth-context"
import { PageHeader } from "@/components/layout/page-header"
import { KeuanganSummary } from "@/components/keuangan/keuangan-summary"
import { TransaksiTable } from "@/components/keuangan/transaksi-table"
import { getStatistikKeuangan } from "@/lib/mock-data"
import { Card, CardContent } from "@/components/ui/card"
import { Info } from "lucide-react"

export default function WargaKeuanganPage() {
  const { user } = useAuth()
  if (!user || !user.rt) return null

  const rt = user.rt
  const stats = getStatistikKeuangan(rt)

  return (
    <>
      <PageHeader
        title={`Keuangan RT ${rt}`}
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

      <KeuanganSummary saldo={stats.saldo} masuk={stats.masuk} keluar={stats.keluar} />

      <TransaksiTable data={stats.transaksi} showRT={false} />
    </>
  )
}
