import Link from "next/link"
import type { Warga } from "@/lib/types"
import { calculateAge, formatRupiah, formatTanggal } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { StatusBadge } from "./warga-table"
import { ArrowLeft, Briefcase, Calendar, GraduationCap, Heart, Mail, MapPin, Phone, Pencil, Wallet } from "lucide-react"

import { WargaFormDialog } from "./warga-form-dialog"
import { useRouter } from "next/navigation"

interface WargaDetailProps {
  warga: Warga
  backHref: string
  canEdit?: boolean
}

export function WargaDetail({ warga, backHref, canEdit = true }: WargaDetailProps) {
  const router = useRouter()
  const initials = warga.nama
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
  const age = calculateAge(warga.tanggalLahir)

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link href={backHref}>
            <ArrowLeft className="size-4" />
            Kembali
          </Link>
        </Button>
        {canEdit ? (
          <WargaFormDialog 
            mode="edit" 
            initialData={warga} 
            onSuccess={() => router.refresh()} 
            rt={warga.rt}
            triggerVariant="button"
          />
        ) : null}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main info card */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6 text-center">
            <Avatar className="size-24 mx-auto mb-4">
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">{initials}</AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold">{warga.nama}</h2>
            <p className="text-sm text-muted-foreground font-mono mt-1">{warga.nik}</p>
            <div className="mt-3 flex justify-center">
              <StatusBadge status={warga.statusKependudukan} />
            </div>
            <Separator className="my-6" />
            <div className="space-y-3 text-left">
              <InfoRow icon={Calendar} label="Usia" value={`${age} tahun`} />
              <InfoRow icon={MapPin} label="Domisili" value={`RT ${warga.rt} / RW ${warga.rw}`} />
              {warga.noTelepon ? <InfoRow icon={Phone} label="Telepon" value={warga.noTelepon} /> : null}
              {warga.email ? <InfoRow icon={Mail} label="Email" value={warga.email} /> : null}
            </div>
          </CardContent>
        </Card>

        {/* Detail biodata */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Biodata Lengkap</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <DetailItem label="Nama Lengkap" value={warga.nama} />
              <DetailItem label="NIK" value={warga.nik} mono />
              <DetailItem label="No. Kartu Keluarga" value={warga.noKK} mono />
              <DetailItem label="Jenis Kelamin" value={warga.jenisKelamin} />
              <DetailItem label="Tempat Lahir" value={warga.tempatLahir} />
              <DetailItem label="Tanggal Lahir" value={formatTanggal(warga.tanggalLahir)} />
              <DetailItem label="Agama" value={warga.agama} />
              <DetailItem label="Kewarganegaraan" value={warga.kewarganegaraan} />
              <DetailItem label="Status Perkawinan" value={warga.statusPerkawinan} />
              <DetailItem label="Hubungan dalam Keluarga" value={warga.hubunganKeluarga} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Data Sosial Ekonomi</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SocioCard icon={GraduationCap} label="Pendidikan" value={warga.pendidikan} />
              <SocioCard icon={Briefcase} label="Pekerjaan" value={warga.pekerjaan} />
              <SocioCard
                icon={Wallet}
                label="Pendapatan / Bulan"
                value={warga.pendapatan > 0 ? formatRupiah(warga.pendapatan) : "—"}
              />
              <SocioCard icon={Heart} label="Status" value={warga.statusPerkawinan} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Alamat & Domisili</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <DetailItem label="Alamat Lengkap" value={warga.alamat} className="sm:col-span-2" />
              <DetailItem label="RT" value={warga.rt} />
              <DetailItem label="RW" value={warga.rw} />
              <DetailItem label="Status Kependudukan" value={warga.statusKependudukan} />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Calendar; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="size-8 shrink-0 rounded-md bg-muted flex items-center justify-center">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  )
}

function DetailItem({
  label,
  value,
  mono,
  className,
}: {
  label: string
  value: string
  mono?: boolean
  className?: string
}) {
  return (
    <div className={className}>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={mono ? "font-mono text-sm" : "font-medium text-sm"}>{value}</p>
    </div>
  )
}

function SocioCard({ icon: Icon, label, value }: { icon: typeof Briefcase; label: string; value: string }) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="size-4 text-primary" />
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
      <p className="font-semibold">{value}</p>
    </div>
  )
}
