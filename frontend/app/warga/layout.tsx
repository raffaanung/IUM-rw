import { DashboardShell } from "@/components/layout/dashboard-shell"

export default function WargaLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell allowedRoles={["warga"]}>{children}</DashboardShell>
}
