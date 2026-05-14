"use client"

import { useState } from "react"
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

import { fetchWithAuth } from "@/lib/auth-context"

interface LaporanFormDialogProps {
  rt?: string
  pencatat?: string
  onSuccess?: () => void
}

export function LaporanFormDialog({ rt, pencatat, onSuccess }: LaporanFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    judul: "",
    kategori: "",
    jenis: "",
    jumlah: 0,
    rt: rt || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetchWithAuth("/rt/keuangan", {
        method: "POST",
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Laporan keuangan berhasil ditambahkan")
        setOpen(false)
        onSuccess?.()
      } else {
        toast.error(data.message || "Gagal menyimpan data")
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
                  <SelectItem value="pemasukan">Pemasukan</SelectItem>
                  <SelectItem value="pengeluaran">Pengeluaran</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="jumlah">Jumlah (Rp)</Label>
              <Input
                id="jumlah"
                type="number"
                placeholder="0"
                value={formData.jumlah}
                onChange={(e) => setFormData({ ...formData, jumlah: Number(e.target.value) })}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="rt">RT</Label>
              <Input
                id="rt"
                value={formData.rt}
                placeholder="00"
                disabled={!!rt}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="pencatat">Pencatat</Label>
              <Input
                id="pencatat"
                defaultValue={pencatat}
                placeholder="Nama Petugas"
                required
                disabled={!!pencatat}
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
