"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus } from "lucide-react"
import { toast } from "sonner"

import { fetchWithAuth, useAuth } from "@/lib/auth-context"
import { RT_LIST } from "@/lib/mock-data"

interface LaporanFormDialogProps {
  rt?: string
  pencatat?: string
  onSuccess?: () => void
}

export function LaporanFormDialog({ rt, pencatat, onSuccess }: LaporanFormDialogProps) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    judul: "",
    kategori: "Iuran Bulanan",
    jenis: "masuk",
    jumlahText: "",
    rt: rt || "",
  })

  const isRw = user?.role === "super-admin"
  const isRtAdmin = user?.role === "admin"

  const pencatatLabel = pencatat ?? (isRw ? "RW 08" : (user?.nama ?? ""))

  // Update RT value based on user/role
  useEffect(() => {
    if (!user) return
    if (isRtAdmin) {
      setFormData((prev) => ({
        ...prev,
        rt: user.rt || rt || "",
      }))
    }
  }, [isRtAdmin, rt, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const jumlah = Number(formData.jumlahText)
    if (!Number.isFinite(jumlah) || jumlah <= 0) {
      toast.error("Jumlah harus lebih dari 0")
      return
    }

    if (isRw && !formData.rt) {
      toast.error("RT wajib dipilih")
      return
    }

    setLoading(true)
    
    try {
      const endpoint = isRw ? "/rw/keuangan" : "/rt/keuangan"
      const payload: Record<string, unknown> = {
        tanggal: formData.tanggal,
        judul: formData.judul,
        kategori: formData.kategori,
        jenis: formData.jenis === "masuk" ? "pemasukan" : "pengeluaran",
        jumlah,
      }
      if (isRw) payload.rt = formData.rt

      const response = await fetchWithAuth(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Laporan keuangan berhasil ditambahkan")
        setOpen(false)
        onSuccess?.()
        // Reset form
        setFormData({
          tanggal: new Date().toISOString().split('T')[0],
          judul: "",
          kategori: "Iuran Bulanan",
          jenis: "masuk",
          jumlahText: "",
          rt: isRw ? "" : (rt || user?.rt || ""),
        })
      } else {
        // Jika ada detail error validasi dari Laravel
        if (data.data && typeof data.data === 'object') {
          const firstError = Object.values(data.data)[0] as string[]
          toast.error(firstError[0] || data.message)
        } else {
          toast.error(data.message || "Gagal menyimpan data")
        }
      }
    } catch (error) {
      toast.error("Terjadi kesalahan koneksi")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700 text-white">
          <Plus className="size-4" />
          Tambah Laporan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Tambah Laporan Keuangan</DialogTitle>
            <DialogDescription>
              Catat transaksi pemasukan atau pengeluaran baru.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="tanggal">Tanggal</Label>
              <Input
                id="tanggal"
                type="date"
                value={formData.tanggal}
                onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="keterangan">Keterangan</Label>
              <Input
                id="keterangan"
                placeholder="Contoh: Iuran Sampah Jan 2024"
                value={formData.judul}
                onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="kategori">Kategori</Label>
              <Select
                value={formData.kategori}
                onValueChange={(v) => setFormData({ ...formData, kategori: v })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Iuran Bulanan">Iuran Bulanan</SelectItem>
                  <SelectItem value="Sosial">Sosial</SelectItem>
                  <SelectItem value="Keamanan">Keamanan</SelectItem>
                  <SelectItem value="Kebersihan">Kebersihan</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="jenis">Jenis</Label>
              <Select
                value={formData.jenis}
                onValueChange={(v) => setFormData({ ...formData, jenis: v })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Jenis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="masuk">Pemasukan</SelectItem>
                  <SelectItem value="keluar">Pengeluaran</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="jumlah">Jumlah (Rp)</Label>
              <Input
                id="jumlah"
                type="number"
                placeholder="0"
                min={0}
                value={formData.jumlahText}
                onChange={(e) => setFormData({ ...formData, jumlahText: e.target.value })}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="rt">RT</Label>
              {isRw ? (
                <Select
                  value={formData.rt}
                  onValueChange={(v) => setFormData({ ...formData, rt: v })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih RT" />
                  </SelectTrigger>
                  <SelectContent>
                    {RT_LIST.map((rtItem) => (
                      <SelectItem key={rtItem} value={rtItem}>
                        RT {rtItem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="rt"
                  value={formData.rt}
                  placeholder="00"
                  disabled
                  required
                />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="pencatat">Pencatat</Label>
              <Input
                id="pencatat"
                value={pencatatLabel}
                placeholder="Nama Petugas"
                required
                disabled
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Laporan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
