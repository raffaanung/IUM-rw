"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Building2, LayoutDashboard, Users, IdCard, Wallet, LogOut, type LucideIcon } from "lucide-react"

interface NavItem {
  title: string
  url: string
  icon: LucideIcon
}

const NAV_BY_ROLE: Record<string, NavItem[]> = {
  "super-admin": [
    { title: "Dashboard", url: "/super-admin/dashboard", icon: LayoutDashboard },
    { title: "Data Warga", url: "/super-admin/warga", icon: Users },
    { title: "Kartu Keluarga", url: "/super-admin/kk", icon: IdCard },
    { title: "Keuangan", url: "/super-admin/keuangan", icon: Wallet },
  ],
  admin: [
    { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
    { title: "Data Warga", url: "/admin/warga", icon: Users },
    { title: "Kartu Keluarga", url: "/admin/kk", icon: IdCard },
    { title: "Keuangan", url: "/admin/keuangan", icon: Wallet },
  ],
  warga: [
    { title: "Dashboard", url: "/warga/dashboard", icon: LayoutDashboard },
    { title: "Daftar Warga", url: "/warga/daftar-warga", icon: Users },
    { title: "Keuangan", url: "/warga/keuangan", icon: Wallet },
  ],
}

const ROLE_LABEL: Record<string, string> = {
  "super-admin": "Ketua RW",
  admin: "Ketua RT",
  warga: "Warga",
}

export function AppSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  if (!user) return null
  const items = NAV_BY_ROLE[user.role] ?? []
  const rwLabel = String(user.rw).padStart(2, "0")
  const initials = user.nama
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Building2 className="size-5" />
          </div>
          <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="font-semibold leading-tight truncate">SITEGAR</span>
            <span className="text-xs text-muted-foreground truncate">RW {rwLabel}</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = pathname === item.url || pathname.startsWith(item.url + "/")
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link href={item.url}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <div className="flex items-center gap-3 px-2 py-2 group-data-[collapsible=icon]:hidden">
          <Avatar className="size-9">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-medium leading-tight truncate">{user.nama}</span>
            <span className="text-xs text-muted-foreground truncate">
              {ROLE_LABEL[user.role]}
              {user.rt ? ` ${user.rt}` : ""}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
            onClick={logout}
            aria-label="Keluar"
            title="Keluar"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
        <div className="hidden group-data-[collapsible=icon]:flex justify-center pb-2">
          <Button variant="ghost" size="icon" className="size-8" onClick={logout} aria-label="Keluar" title="Keluar">
            <LogOut className="size-4" />
          </Button>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
