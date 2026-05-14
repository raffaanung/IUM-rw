"use client"

import { useAuth } from "@/lib/auth-context"
import { PageHeader } from "@/components/layout/page-header"
import { KeuanganSummary } from "@/components/keuangan/keuangan-summary"
import { TransaksiTable } from "@/components/keuangan/transaksi-table"
import { LaporanFormDialog } from "@/components/keuangan/laporan-form-dialog"
import { getStatistikKeuangan } from "@/lib/mock-data"

export default function SuperAdminKeuanganPage() {
  const { user } = useAuth()
  const stats = getStatistikKeuangan()

  return (
    <>
      <PageHeader
        title="Keuangan RW"
        description="Pantau dan kelola arus kas pemasukan dan pengeluaran seluruh wilayah RW."
        actions={<LaporanFormDialog pencatat={user?.nama} />}
      />

      <KeuanganSummary saldo={stats.saldo} masuk={stats.masuk} keluar={stats.keluar} />

      <TransaksiTable data={stats.transaksi} />
    </>
  )
}
