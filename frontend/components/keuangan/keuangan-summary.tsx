import { StatCard } from "@/components/dashboard/stat-card"
import { formatRupiah } from "@/lib/mock-data"
import { ArrowDownCircle, ArrowUpCircle, Wallet } from "lucide-react"

interface KeuanganSummaryProps {
  saldo: number
  masuk: number
  keluar: number
}

export function KeuanganSummary({ saldo, masuk, keluar }: KeuanganSummaryProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <StatCard
        title="Total Kas"
        value={formatRupiah(saldo)}
        description="Saldo aktif saat ini"
        icon={Wallet}
        variant="primary"
      />
      <StatCard
        title="Total Pemasukan"
        value={formatRupiah(masuk)}
        description="Periode keseluruhan"
        icon={ArrowUpCircle}
        variant="success"
      />
      <StatCard
        title="Total Pengeluaran"
        value={formatRupiah(keluar)}
        description="Periode keseluruhan"
        icon={ArrowDownCircle}
        variant="danger"
      />
    </div>
  )
}
