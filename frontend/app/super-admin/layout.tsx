import { DashboardShell } from "@/components/layout/dashboard-shell"

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell allowedRoles={["super-admin"]}>{children}</DashboardShell>
}
