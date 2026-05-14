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
import { UserPlus } from "lucide-react"
import { toast } from "sonner"

import { fetchWithAuth } from "@/lib/auth-context"

interface WargaFormDialogProps {
  rt?: string
  onSuccess?: () => void
}

export function WargaFormDialog({ rt, onSuccess }: WargaFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nik: "",
    nama: "",
    jenis_kelamin: "",
    alamat: "",
    rt: rt || "",
    status_warga: "",
    pekerjaan: "",
    no_hp: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!/^\d{16}$/.test(formData.nik)) {
      toast.error("NIK harus berjumlah 16 digit angka")
      return
    }

    setLoading(true)
    try {
      // Menggunakan FormData untuk mendukung upload file
      const dataToSend = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        dataToSend.append(key, value)
      })
      
      const fileInput = document.getElementById('foto') as HTMLInputElement
      if (fileInput?.files?.[0]) {
        dataToSend.append('foto', fileInput.files[0])
      }

      const response = await fetchWithAuth("/rt/warga", {
        method: "POST",
        body: dataToSend, // Fetch otomatis mengatur Content-Type jika body adalah FormData
        headers: {
          // Penting: Jangan set Content-Type secara manual jika menggunakan FormData
          "Accept": "application/json",
        }
      } as any) // Typecast as any karena fetchWithAuth mengharapkan RequestInit standar

      const data = await response.json()

      if (response.ok) {
        toast.success("Data warga berhasil ditambahkan")
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
          <UserPlus className="size-4" />
          Tambah Warga
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Tambah Warga</DialogTitle>
            <DialogDescription>
              Isi data warga baru di bawah ini. Pastikan NIK valid.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="nik">NIK</Label>
              <Input
                id="nik"
                placeholder="16 digit NIK"
                value={formData.nik}
                onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                required
                maxLength={16}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="nama">Nama</Label>
              <Input
                id="nama"
                placeholder="Nama Lengkap"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="jenis_kelamin">Jenis Kelamin</Label>
              <Select
                value={formData.jenis_kelamin}
                onValueChange={(v) => setFormData({ ...formData, jenis_kelamin: v })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Jenis Kelamin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                  <SelectItem value="Perempuan">Perempuan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="alamat">Alamat</Label>
              <Input
                id="alamat"
                placeholder="Alamat lengkap"
                value={formData.alamat}
                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
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
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status_warga}
                onValueChange={(v) => setFormData({ ...formData, status_warga: v })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Status Kependudukan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tetap">Tetap</SelectItem>
                  <SelectItem value="domisili">Domisili</SelectItem>
                  <SelectItem value="kontrak">Kontrak</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="foto">Foto Warga</Label>
              <Input
                id="foto"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    // Dalam implementasi nyata, kita akan menggunakan FormData
                    // Untuk sekarang kita simpan referensinya
                    toast.info(`File ${file.name} dipilih`)
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Data"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
