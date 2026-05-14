"use client"

import { useMemo, useState } from "react"
import type { Transaksi } from "@/lib/types"
import { formatRupiah, formatTanggal } from "@/lib/mock-data"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowDownCircle, ArrowUpCircle, Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface TransaksiTableProps {
  data: Transaksi[]
  showRT?: boolean
}

export function TransaksiTable({ data, showRT = true }: TransaksiTableProps) {
  const [search, setSearch] = useState("")
  const [jenisFilter, setJenisFilter] = useState("all")

  const filtered = useMemo(() => {
    return data.filter((t) => {
      const q = search.toLowerCase().trim()
      const matchSearch =
        !q ||
        t.keterangan.toLowerCase().includes(q) ||
        t.kategori.toLowerCase().includes(q) ||
        t.pencatat.toLowerCase().includes(q)
      const matchJenis = jenisFilter === "all" || t.jenis === jenisFilter
      return matchSearch && matchJenis
    })
  }, [data, search, jenisFilter])

  return (
    <Card className="overflow-hidden">
      <div className="p-4 border-b flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Cari transaksi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={jenisFilter} onValueChange={setJenisFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Transaksi</SelectItem>
            <SelectItem value="masuk">Hanya Pemasukan</SelectItem>
            <SelectItem value="keluar">Hanya Pengeluaran</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Keterangan</TableHead>
              <TableHead>Kategori</TableHead>
              {showRT ? <TableHead>RT</TableHead> : null}
              <TableHead>Pencatat</TableHead>
              <TableHead className="text-right">Jumlah</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={showRT ? 6 : 5} className="text-center text-muted-foreground py-12">
                  Belum ada transaksi.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {formatTanggal(t.tanggal)}
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {t.jenis === "masuk" ? (
                        <ArrowUpCircle className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      ) : (
                        <ArrowDownCircle className="size-4 text-destructive shrink-0" />
                      )}
                      <span>{t.keterangan}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{t.kategori}</Badge>
                  </TableCell>
                  {showRT ? <TableCell>{t.rt ? `RT ${t.rt}` : "RW"}</TableCell> : null}
                  <TableCell className="text-sm text-muted-foreground">{t.pencatat}</TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-semibold whitespace-nowrap",
                      t.jenis === "masuk" ? "text-emerald-600 dark:text-emerald-400" : "text-destructive",
                    )}
                  >
                    {t.jenis === "masuk" ? "+" : "-"} {formatRupiah(t.jumlah)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
