"use client"

import Link from "next/link"
import type { KartuKeluarga } from "@/lib/types"
import { calculateAge } from "@/lib/mock-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, IdCard, MapPin, UserPlus, Users, Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { AnggotaFormDialog } from "./anggota-form-dialog"
import { fetchWithAuth, useAuth } from "@/lib/auth-context"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface KKDetailProps {
  kk: KartuKeluarga
  backHref: string
  wargaHrefBase: string
  canManage?: boolean
  onChanged?: () => void
}

const HUBUNGAN_OPTIONS = [
  "Kepala Keluarga",
  "Istri",
  "Suami",
  "Anak",
  "Orang Tua",
  "Mertua",
  "Cucu",
  "Famili Lain",
  "Anggota",
  "Lainnya",
]

export function KKDetail({ kk, backHref, wargaHrefBase, canManage = true, onChanged }: KKDetailProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const kepala = kk.anggota.find((a) => a.hubunganKeluarga === "Kepala Keluarga")

  const refreshData = () => {
    if (onChanged) onChanged()
    else router.refresh()
  }

  const handleRemoveAnggota = async (wargaId: string) => {
    if (!confirm("Hapus anggota ini dari Kartu Keluarga?")) return

    setIsDeleting(wargaId)
    try {
      const baseEndpoint = user?.role === "super-admin" ? "/rw/kartu-keluarga" : "/rt/kartu-keluarga"
      const response = await fetchWithAuth(`${baseEndpoint}/${kk.id}/anggota/${wargaId}`, {
        method: "DELETE"
      })

      if (response.ok) {
        toast.success("Anggota berhasil dihapus")
        refreshData()
      } else {
        toast.error("Gagal menghapus anggota")
      }
    } catch (e) {
      toast.error("Kesalahan koneksi")
    } finally {
      setIsDeleting(null)
    }
  }

  const handleUpdateHubungan = async (wargaId: string, hubungan_keluarga: string) => {
    setIsUpdating(wargaId)
    try {
      const baseEndpoint = user?.role === "super-admin" ? "/rw/kartu-keluarga" : "/rt/kartu-keluarga"
      const response = await fetchWithAuth(`${baseEndpoint}/${kk.id}/anggota/${wargaId}`, {
        method: "PUT",
        body: JSON.stringify({ hubungan_keluarga }),
      })

      if (response.ok) {
        toast.success("Hubungan keluarga berhasil diupdate")
        refreshData()
      } else {
        const err = await response.json().catch(() => null)
        toast.error(err?.message || "Gagal mengupdate hubungan keluarga")
      }
    } catch {
      toast.error("Kesalahan koneksi")
    } finally {
      setIsUpdating(null)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link href={backHref}>
            <ArrowLeft className="size-4" />
            Kembali
          </Link>
        </Button>
        {canManage ? (
          <AnggotaFormDialog 
            kkId={kk.id} 
            rt={kk.rt} 
            onSuccess={refreshData} 
          />
        ) : null}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <IdCard className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">No. Kartu Keluarga</p>
                <p className="font-mono font-semibold text-sm truncate">{kk.noKK}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Users className="size-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Jumlah Anggota</p>
                <p className="font-semibold">{kk.jumlahAnggota} orang</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <MapPin className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Wilayah</p>
                <p className="font-semibold">
                  RT {kk.rt} / RW {kk.rw}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Kepala Keluarga & Alamat</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Nama Kepala Keluarga</p>
            <p className="font-semibold">{kk.kepalaKeluarga}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">NIK Kepala Keluarga</p>
            <p className="font-mono text-sm">{kepala?.nik ?? "—"}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs text-muted-foreground mb-1">Alamat Lengkap</p>
            <p className="font-medium">
              {kk.alamat}, RT {kk.rt} / RW {kk.rw}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Anggota Keluarga</CardTitle>
          <CardDescription>{kk.jumlahAnggota} anggota terdaftar pada KK ini</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>NIK</TableHead>
                  <TableHead>Hubungan</TableHead>
                  <TableHead>Jenis Kelamin</TableHead>
                  <TableHead>Usia</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kk.anggota.map((a) => {
                  const initials = a.nama
                    .split(" ")
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                  return (
                    <TableRow key={a.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{a.nama}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{a.nik}</TableCell>
                      <TableCell>
                        {canManage ? (
                          <Select
                            value={a.hubunganKeluarga || ""}
                            onValueChange={(v) => handleUpdateHubungan(String(a.id), v)}
                            disabled={isUpdating === String(a.id)}
                          >
                            <SelectTrigger className="h-8 w-[170px]">
                              <SelectValue placeholder="Pilih hubungan" />
                            </SelectTrigger>
                            <SelectContent>
                              {HUBUNGAN_OPTIONS.map((opt) => (
                                <SelectItem key={opt} value={opt}>
                                  {opt}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : a.hubunganKeluarga === "Kepala Keluarga" ? (
                          <Badge className="bg-primary text-primary-foreground">{a.hubunganKeluarga}</Badge>
                        ) : (
                          <Badge variant="secondary">{a.hubunganKeluarga}</Badge>
                        )}
                      </TableCell>
                      <TableCell>{a.jenisKelamin}</TableCell>
                      <TableCell>{calculateAge(a.tanggalLahir)} thn</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`${wargaHrefBase}/${a.id}`}>Detail</Link>
                          </Button>
                          {canManage && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleRemoveAnggota(String(a.id))}
                              disabled={isDeleting === String(a.id)}
                            >
                              {isDeleting === String(a.id) ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <Trash2 className="size-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
