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
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
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
import { UserPlus, Pencil } from "lucide-react"
import { toast } from "sonner"

import { fetchWithAuth, useAuth } from "@/lib/auth-context"
import type { Warga } from "@/lib/types"

interface WargaFormDialogProps {
  rt?: string
  onSuccess?: () => void
  initialData?: Warga
  mode?: "add" | "edit"
  triggerVariant?: "button" | "dropdown"
}

export function WargaFormDialog({ rt, onSuccess, initialData, mode = "add", triggerVariant }: WargaFormDialogProps) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Auto-set variant based on mode if not provided
  const variant = triggerVariant || (mode === "edit" ? "dropdown" : "button")
  const isWargaSelf = user?.role === "warga" && mode === "edit"

  // Helper to safely format date for input[type="date"]
  const formatDateForInput = (dateStr: string | undefined) => {
    if (!dateStr) return ""
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return ""
    return date.toISOString().split('T')[0]
  }

  const [formData, setFormData] = useState({
    nik: initialData?.nik || "",
    nama: initialData?.nama || "",
    jenis_kelamin: initialData?.jenisKelamin === "Laki-laki" ? "L" : initialData?.jenisKelamin === "Perempuan" ? "P" : "",
    tempat_lahir: initialData?.tempatLahir || "",
    tanggal_lahir: formatDateForInput(initialData?.tanggalLahir),
    alamat: initialData?.alamat || "",
    rt: initialData?.rt || rt || "",
    rw: initialData?.rw || "8",
    status_warga: initialData?.statusKependudukan?.toLowerCase() || "",
    status_pernikahan: initialData?.statusPerkawinan?.toLowerCase().replace(' ', '_') || "",
    pekerjaan: initialData?.pekerjaan || "",
    pendidikan: initialData?.pendidikan || "",
    pendapatan: initialData?.pendapatan || 0,
    no_hp: initialData?.noTelepon || "",
    password: "password123", // Default password for new users
  })

  // Update form if initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        nik: initialData.nik,
        nama: initialData.nama,
        jenis_kelamin: initialData.jenisKelamin === "Laki-laki" ? "L" : "P",
        tempat_lahir: initialData.tempatLahir,
        tanggal_lahir: formatDateForInput(initialData.tanggalLahir),
        alamat: initialData.alamat,
        rt: initialData.rt,
        rw: initialData.rw,
        status_warga: initialData.statusKependudukan.toLowerCase(),
        status_pernikahan: initialData.statusPerkawinan.toLowerCase().replace(' ', '_'),
        pekerjaan: initialData.pekerjaan,
        pendidikan: initialData.pendidikan || "",
        pendapatan: initialData.pendapatan || 0,
        no_hp: initialData.noTelepon || "",
        password: "password123",
      })
    }
  }, [initialData])

  // Update RT value if prop changes
  useEffect(() => {
    if (rt && !initialData) {
      setFormData(prev => ({ ...prev, rt }))
    }
  }, [rt, initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isWargaSelf && !/^\d{16}$/.test(formData.nik)) {
      toast.error("NIK harus berjumlah 16 digit angka")
      return
    }

    setLoading(true)
    try {
      // Determine endpoint and method based on mode
      const isEdit = mode === "edit"
      const baseEndpoint =
        user?.role === "warga"
          ? "/portal-warga/data-warga"
          : user?.role === "super-admin"
            ? "/rw/warga"
            : "/rt/warga"
      const endpoint = isEdit ? `${baseEndpoint}/${initialData?.id}` : baseEndpoint
      const method = isEdit ? "PUT" : "POST"

      const body =
        isWargaSelf
          ? {
              alamat: formData.alamat,
              pekerjaan: formData.pekerjaan || null,
              pendidikan: formData.pendidikan || null,
              pendapatan: Number(formData.pendapatan) || 0,
              no_hp: formData.no_hp || null,
            }
          : formData
      
      const response = await fetchWithAuth(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(body)
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(isEdit ? "Data warga berhasil diperbarui" : "Data warga berhasil ditambahkan")
        setOpen(false)
        onSuccess?.()
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
        {variant === "dropdown" ? (
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Pencil className="size-4" />
            Edit Data
          </DropdownMenuItem>
        ) : (
          <Button className={mode === "edit" ? "" : "bg-green-600 hover:bg-green-700 text-white"}>
            {mode === "edit" ? <Pencil className="size-4" /> : <UserPlus className="size-4" />}
            {mode === "edit" ? "Edit Data" : "Tambah Warga"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{mode === "edit" ? "Edit Data Warga" : "Tambah Warga"}</DialogTitle>
            <DialogDescription>
              {mode === "edit" 
                ? "Perbarui data warga di bawah ini." 
                : "Isi data warga baru di bawah ini. Pastikan NIK valid."}
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
                disabled={isWargaSelf}
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
                disabled={isWargaSelf}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="jenis_kelamin">Jenis Kelamin</Label>
              <Select
                value={formData.jenis_kelamin}
                onValueChange={(v) => setFormData({ ...formData, jenis_kelamin: v })}
                required
                disabled={isWargaSelf}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Jenis Kelamin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="L">Laki-laki</SelectItem>
                  <SelectItem value="P">Perempuan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="tempat_lahir">Tempat Lahir</Label>
                <Input
                  id="tempat_lahir"
                  placeholder="Kota"
                  value={formData.tempat_lahir}
                  onChange={(e) => setFormData({ ...formData, tempat_lahir: e.target.value })}
                  required
                  disabled={isWargaSelf}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="tanggal_lahir">Tanggal Lahir</Label>
                <Input
                  id="tanggal_lahir"
                  type="date"
                  value={formData.tanggal_lahir}
                  onChange={(e) => setFormData({ ...formData, tanggal_lahir: e.target.value })}
                  required
                  disabled={isWargaSelf}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="status_pernikahan">Status Pernikahan</Label>
              <Select
                value={formData.status_pernikahan}
                onValueChange={(v) => setFormData({ ...formData, status_pernikahan: v })}
                required
                disabled={isWargaSelf}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Status Pernikahan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="belum_menikah">Belum Menikah</SelectItem>
                  <SelectItem value="menikah">Menikah</SelectItem>
                  <SelectItem value="cerai">Cerai</SelectItem>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="rt">RT</Label>
                <Input
                  id="rt"
                  value={formData.rt}
                  placeholder="00"
                  onChange={(e) => setFormData({ ...formData, rt: e.target.value })}
                  disabled={isWargaSelf || !!rt}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="rw">RW</Label>
                <Input
                  id="rw"
                  value={formData.rw}
                  placeholder="8"
                  disabled
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="status">Status Kependudukan</Label>
              <Select
                value={formData.status_warga}
                onValueChange={(v) => setFormData({ ...formData, status_warga: v })}
                required
                disabled={isWargaSelf}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Status Kependudukan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tetap">Tetap</SelectItem>
                  <SelectItem value="pendatang">Pendatang</SelectItem>
                  <SelectItem value="kontrak">Kontrak</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="pendidikan">Pendidikan</Label>
                <Input
                  id="pendidikan"
                  placeholder="Pendidikan terakhir"
                  value={formData.pendidikan}
                  onChange={(e) => setFormData({ ...formData, pendidikan: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="pendapatan">Pendapatan / Bulan</Label>
                <Input
                  id="pendapatan"
                  type="number"
                  placeholder="0"
                  value={formData.pendapatan}
                  onChange={(e) => setFormData({ ...formData, pendapatan: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="pekerjaan">Pekerjaan</Label>
                <Input
                  id="pekerjaan"
                  placeholder="Pekerjaan"
                  value={formData.pekerjaan}
                  onChange={(e) => setFormData({ ...formData, pekerjaan: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="no_hp">No HP</Label>
                <Input
                  id="no_hp"
                  placeholder="08..."
                  value={formData.no_hp}
                  onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
                />
              </div>
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
                disabled={isWargaSelf}
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
