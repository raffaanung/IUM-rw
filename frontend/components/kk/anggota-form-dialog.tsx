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
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Check, ChevronsUpDown, UserPlus } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { fetchWithAuth, useAuth } from "@/lib/auth-context"
import type { Warga } from "@/lib/types"

interface AnggotaFormDialogProps {
  kkId: string
  rt: string
  onSuccess?: () => void
}

const HUBUNGAN_OPTIONS = [
  "Istri",
  "Anak",
  "Orang Tua",
  "Mertua",
  "Cucu",
  "Famili Lain",
  "Lainnya",
]

export function AnggotaFormDialog({ kkId, rt, onSuccess }: AnggotaFormDialogProps) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [openSearch, setOpenSearch] = useState(false)
  const [loading, setLoading] = useState(false)
  const [wargaList, setWargaList] = useState<Warga[]>([])
  const [formData, setFormData] = useState({
    warga_id: "",
    hubungan_keluarga: "",
  })

  const selectedWarga = wargaList.find((w) => String(w.id) === formData.warga_id)

  useEffect(() => {
    if (open) {
      const fetchWarga = async () => {
        try {
          const endpoint = user?.role === "super-admin" ? "/rw/warga" : "/rt/warga"
          // We might want to filter by RT if RW is adding
          const res = await fetchWithAuth(`${endpoint}?rt=${rt}`)
          const data = await res.json()
          if (data.success) {
            // Filter out warga who already have a KK if needed, 
            // but for now just show all in that RT
            setWargaList(data.data)
          }
        } catch (e) {
          console.error(e)
        }
      }
      fetchWarga()
    }
  }, [open, user, rt])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.warga_id) {
      toast.error("Silakan pilih warga")
      return
    }

    if (!formData.hubungan_keluarga) {
      toast.error("Silakan pilih hubungan keluarga")
      return
    }

    setLoading(true)
    try {
      const baseEndpoint = user?.role === "super-admin" ? "/rw/kartu-keluarga" : "/rt/kartu-keluarga"
      const response = await fetchWithAuth(`${baseEndpoint}/${kkId}/anggota`, {
        method: "POST",
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Anggota keluarga berhasil ditambahkan")
        setOpen(false)
        onSuccess?.()
        setFormData({ warga_id: "", hubungan_keluarga: "" })
      } else {
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
        <Button>
          <UserPlus className="size-4" />
          Tambah Anggota
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Tambah Anggota Keluarga</DialogTitle>
            <DialogDescription>
              Pilih warga untuk ditambahkan ke dalam Kartu Keluarga ini.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label>Pilih Warga</Label>
              <Popover open={openSearch} onOpenChange={setOpenSearch}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openSearch}
                    className="w-full justify-between font-normal"
                  >
                    {selectedWarga 
                      ? `${selectedWarga.nama} (${selectedWarga.nik})` 
                      : "Cari warga..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Nama atau NIK..." />
                    <CommandList>
                      <CommandEmpty>Warga tidak ditemukan.</CommandEmpty>
                      <CommandGroup>
                        {wargaList.map((w) => (
                          <CommandItem
                            key={w.id}
                            value={`${w.nama} ${w.nik}`}
                            onSelect={() => {
                              setFormData({ ...formData, warga_id: String(w.id) })
                              setOpenSearch(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.warga_id === String(w.id) ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span>{w.nama}</span>
                              <span className="text-xs text-muted-foreground">{w.nik}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="hubungan">Hubungan Keluarga</Label>
              <Select
                value={formData.hubungan_keluarga}
                onValueChange={(v) => setFormData({ ...formData, hubungan_keluarga: v })}
              >
                <SelectTrigger id="hubungan">
                  <SelectValue placeholder="Pilih hubungan..." />
                </SelectTrigger>
                <SelectContent>
                  {HUBUNGAN_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Proses..." : "Simpan Anggota"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
