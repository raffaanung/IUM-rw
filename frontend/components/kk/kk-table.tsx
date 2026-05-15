"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import type { KartuKeluarga } from "@/lib/types"
import { RT_LIST } from "@/lib/mock-data"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Eye, Plus, Search } from "lucide-react"
import { toast } from "sonner"
import { KKFormDialog } from "./kk-form-dialog"

interface KKTableProps {
  data: KartuKeluarga[]
  detailHrefBase: string
  showRT?: boolean
  canAdd?: boolean
  rt?: string
  onAdd?: () => void
}

export function KKTable({ data, detailHrefBase, showRT = true, canAdd = true, rt, onAdd }: KKTableProps) {
  const [search, setSearch] = useState("")
  const [rtFilter, setRtFilter] = useState("all")

  const filtered = useMemo(() => {
    return data.filter((kk) => {
      const q = search.toLowerCase().trim()
      const matchSearch =
        !q ||
        kk.kepalaKeluarga.toLowerCase().includes(q) ||
        kk.noKK.includes(q) ||
        kk.alamat.toLowerCase().includes(q)
      const matchRT = rtFilter === "all" || kk.rt === rtFilter
      return matchSearch && matchRT
    })
  }, [data, search, rtFilter])

  return (
    <Card className="overflow-hidden">
      <div className="p-4 border-b flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama, no KK, atau alamat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {showRT ? (
            <Select value={rtFilter} onValueChange={setRtFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="RT" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua RT</SelectItem>
                {RT_LIST.map((rt) => (
                  <SelectItem key={rt} value={rt}>
                    RT {rt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
          {canAdd ? <KKFormDialog rt={rt} onSuccess={onAdd} /> : null}
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No. KK</TableHead>
              <TableHead>Kepala Keluarga</TableHead>
              <TableHead>Alamat</TableHead>
              {showRT ? <TableHead>RT</TableHead> : null}
              <TableHead className="text-center">Anggota</TableHead>
              <TableHead className="w-[100px] text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={showRT ? 6 : 5} className="text-center text-muted-foreground py-12">
                  Tidak ada Kartu Keluarga yang cocok.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((kk) => (
                <TableRow key={kk.noKK}>
                  <TableCell className="font-mono text-xs">{kk.noKK}</TableCell>
                  <TableCell className="font-medium">{kk.kepalaKeluarga}</TableCell>
                  <TableCell className="max-w-[260px] truncate">{kk.alamat}</TableCell>
                  {showRT ? <TableCell>RT {kk.rt}</TableCell> : null}
                  <TableCell className="text-center">
                    <Badge variant="secondary">
                      {kk.jumlahAnggota} {kk.jumlahAnggota === 1 ? "orang" : "orang"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`${detailHrefBase}/${kk.id}`}>
                        <Eye className="size-4" />
                        Detail
                      </Link>
                    </Button>
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
