"use client"

import { type ReactNode } from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { AppSidebar } from "./app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import type { Role } from "@/lib/types"

interface DashboardShellProps {
  children: ReactNode
  allowedRoles: Role[]
}

export function DashboardShell({ children, allowedRoles }: DashboardShellProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return
    if (!user) {
      router.replace("/login")
      return
    }
    if (!allowedRoles.includes(user.role)) {
      const target =
        user.role === "super-admin"
          ? "/super-admin/dashboard"
          : user.role === "admin"
            ? "/admin/dashboard"
            : "/warga/dashboard"
      router.replace(target)
    }
  }, [user, isLoading, allowedRoles, router])

  if (isLoading || !user || !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="space-y-4 w-full max-w-md p-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              Selamat datang, <span className="text-primary">{user.nama}</span>
            </p>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
