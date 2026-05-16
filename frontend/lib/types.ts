export type Role = "super-admin" | "admin" | "warga"

export type StatusKependudukan = "Tetap" | "Domisili" | "Kontrak"

export type JenisKelamin = "Laki-laki" | "Perempuan"

export type StatusPerkawinan = "Belum Kawin" | "Kawin" | "Cerai Hidup" | "Cerai Mati"

export type Agama = "Islam" | "Kristen" | "Katolik" | "Hindu" | "Buddha" | "Konghucu"

export type HubunganKeluarga =
  | "Kepala Keluarga"
  | "Istri"
  | "Suami"
  | "Anak"
  | "Orang Tua"
  | "Mertua"
  | "Cucu"
  | "Famili Lain"
  | "Anggota"
  | "Lainnya"

export interface Warga {
  id: string
  nik: string
  noKK: string
  nama: string
  jenisKelamin: JenisKelamin
  tempatLahir: string
  tanggalLahir: string
  agama: Agama
  pendidikan: string
  pekerjaan: string
  pendapatan: number
  statusPerkawinan: StatusPerkawinan
  hubunganKeluarga: HubunganKeluarga
  kewarganegaraan: string
  alamat_ktp?: string
  alamat_sekarang?: string
  rt: string
  rw: string
  statusKependudukan: StatusKependudukan
  noTelepon?: string
  email?: string
}

export interface KartuKeluarga {
  id: string
  noKK: string
  kepalaKeluarga: string
  alamat: string
  rt: string
  rw: string
  jumlahAnggota: number
  tanggalDibuat: string
  anggota: Warga[]
}

export type JenisTransaksi = "masuk" | "keluar"

export interface Transaksi {
  id: string
  tanggal: string
  keterangan: string
  kategori: string
  jumlah: number
  jenis: JenisTransaksi
  rt?: string
  pencatat: string
}

export interface User {
  id: string
  username: string
  nama: string
  role: Role
  rt?: string
  rw: string
  nik?: string
}
