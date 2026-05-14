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
import { Plus } from "lucide-react"
import { toast } from "sonner"

interface KKFormDialogProps {
  rt?: string
}

export function KKFormDialog({ rt }: KKFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulasi simpan data
    setTimeout(() => {
      setLoading(false)
      setOpen(false)
      toast.success("Data Kartu Keluarga berhasil ditambahkan")
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700 text-white">
          <Plus className="size-4" />
          Tambah KK
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Tambah Kartu Keluarga</DialogTitle>
            <DialogDescription>
              Isi data Kartu Keluarga baru di bawah ini.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="no_kk">
                No. KK
              </Label>
              <Input
                id="no_kk"
                placeholder="16 digit No. KK"
                required
                maxLength={16}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="kepala_keluarga">
                Kepala Keluarga
              </Label>
              <Input id="kepala_keluarga" placeholder="Nama Kepala Keluarga" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="alamat">
                Alamat
              </Label>
              <Input id="alamat" placeholder="Alamat lengkap" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="rt">
                RT
              </Label>
              <Input
                id="rt"
                defaultValue={rt}
                placeholder="00"
                required
                disabled={!!rt}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="anggota">
                Anggota
              </Label>
              <Input id="anggota" placeholder="Jumlah anggota keluarga" type="number" required />
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
