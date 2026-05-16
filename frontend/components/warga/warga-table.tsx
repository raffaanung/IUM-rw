"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import type { Warga, StatusKependudukan } from "@/lib/types"
import { RT_LIST } from "@/lib/mock-data"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Eye, MoreHorizontal, Pencil, Search, Trash2, UserPlus, Download, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { WargaFormDialog } from "./warga-form-dialog"
import { fetchWithAuth, useAuth } from "@/lib/auth-context"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface WargaTableProps {
  data: Warga[]
  detailHrefBase: string
  showRT?: boolean
  canManage?: boolean
  allowSelfEdit?: boolean
  onAdd?: () => void
  rt?: string
}

export function WargaTable({ data, detailHrefBase, showRT = true, canManage = true, allowSelfEdit = false, onAdd, rt }: WargaTableProps) {
  const { user } = useAuth()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [rtFilter, setRtFilter] = useState<string>("all")
  const [page, setPage] = useState(1)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const pageSize = 8
  const showActions = canManage || allowSelfEdit

  const handleDelete = async (id: string) => {
    setIsDeleting(id)
    try {
      const baseEndpoint = user?.role === "super-admin" ? "/rw/warga" : "/rt/warga"
      const response = await fetchWithAuth(`${baseEndpoint}/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Data warga berhasil dihapus")
        onAdd?.() // Refresh data
      } else {
        const err = await response.json()
        toast.error(err.message || "Gagal menghapus data")
      }
    } catch (error) {
      toast.error("Terjadi kesalahan koneksi")
    } finally {
      setIsDeleting(null)
    }
  }

  const filtered = useMemo(() => {
    if (!Array.isArray(data)) return []
    return data.filter((w) => {
      const q = search.toLowerCase().trim()
      const matchSearch =
        !q ||
        w.nama.toLowerCase().includes(q) ||
        w.nik.includes(q) ||
        (w.alamat_sekarang || "").toLowerCase().includes(q)
      const matchStatus = statusFilter === "all" || w.statusKependudukan === statusFilter
      const matchRT = rtFilter === "all" || w.rt === rtFilter
      return matchSearch && matchStatus && matchRT
    })
  }, [data, search, statusFilter, rtFilter])

  const exportToCSV = () => {
    const headers = ["NIK", "Nama", "Jenis Kelamin", "Alamat", "RT", "Status"]
    const rows = filtered.map(w => [
      w.nik,
      w.nama,
      w.jenisKelamin,
      w.alamat_sekarang || "",
      w.rt,
      w.statusKependudukan
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `data-warga-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Data berhasil diekspor")
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pageData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <Card className="overflow-hidden">
      <div className="p-4 border-b flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama, NIK, atau alamat..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="size-4" />
            Export Data
          </Button>
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="Tetap">Tetap</SelectItem>
              <SelectItem value="Domisili">Domisili</SelectItem>
              <SelectItem value="Kontrak">Kontrak</SelectItem>
            </SelectContent>
          </Select>
          {showRT ? (
            <Select
              value={rtFilter}
              onValueChange={(v) => {
                setRtFilter(v)
                setPage(1)
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="RT" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua RT</SelectItem>
                {RT_LIST.map((rt) => (
                  <SelectItem key={rt} value={rt}>
                    RT {rt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
          {canManage ? <WargaFormDialog rt={rt} onSuccess={onAdd} /> : null}
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>NIK</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Jenis Kelamin</TableHead>
              <TableHead>Alamat</TableHead>
              {showRT ? <TableHead>RT</TableHead> : null}
              <TableHead>Status</TableHead>
              {showActions ? <TableHead className="w-[120px] text-right">Aksi</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={showActions ? 7 : 6} className="text-center text-muted-foreground py-12">
                  Tidak ada data warga yang cocok dengan filter.
                </TableCell>
              </TableRow>
            ) : (
              pageData.map((w) => (
                <TableRow key={w.id}>
                  <TableCell className="font-mono text-xs">{w.nik}</TableCell>
                  <TableCell className="font-medium">{w.nama}</TableCell>
                  <TableCell>{w.jenisKelamin}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{w.alamat_sekarang || "—"}</TableCell>
                  {showRT ? <TableCell>RT {w.rt}</TableCell> : null}
                  <TableCell>
                    <StatusBadge status={w.statusKependudukan} />
                  </TableCell>
                  {canManage ? (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                            <span className="sr-only">Aksi</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`${detailHrefBase}/${w.id}`}>
                              <Eye className="size-4" />
                              Lihat Detail
                            </Link>
                          </DropdownMenuItem>
                          {canManage && (
                            <>
                              <WargaFormDialog 
                                mode="edit" 
                                initialData={w} 
                                onSuccess={onAdd} 
                                rt={rt} 
                              />
                              <DropdownMenuSeparator />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem 
                                    className="text-destructive focus:text-destructive"
                                    onSelect={(e) => e.preventDefault()}
                                  >
                                    {isDeleting === String(w.id) ? (
                                      <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="size-4" />
                                    )}
                                    Hapus
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Apakah Anda yakin ingin menghapus data warga <strong>{w.nama}</strong>? Tindakan ini tidak dapat dibatalkan.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction 
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      onClick={() => handleDelete(String(w.id))}
                                    >
                                      Hapus
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  ) : allowSelfEdit ? (
                    <TableCell className="text-right">
                      {user?.nik && w.nik === user.nik ? (
                        <WargaFormDialog mode="edit" initialData={w} onSuccess={onAdd} triggerVariant="button" />
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  ) : null}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="p-4 border-t flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-muted-foreground">
          Menampilkan {pageData.length} dari {filtered.length} warga
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Sebelumnya
          </Button>
          <span className="text-sm text-muted-foreground">
            Halaman {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Berikutnya
          </Button>
        </div>
      </div>
    </Card>
  )
}

export function StatusBadge({ status }: { status: StatusKependudukan }) {
  const styles: Record<StatusKependudukan, string> = {
    Tetap: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    Domisili: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20",
    Kontrak: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20",
  }
  return (
    <Badge variant="outline" className={styles[status]}>
      {status}
    </Badge>
  )
}
