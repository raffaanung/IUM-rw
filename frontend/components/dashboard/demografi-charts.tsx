"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts"

interface StatusData {
  tetap: number
  domisili: number
  kontrak: number
  lakiLaki: number
  perempuan: number
}

const statusConfig: ChartConfig = {
  jumlah: { label: "Jumlah" },
  Tetap: { label: "Tetap", color: "var(--chart-1)" },
  Domisili: { label: "Domisili", color: "var(--chart-2)" },
  Kontrak: { label: "Kontrak", color: "var(--chart-3)" },
}

const genderConfig: ChartConfig = {
  jumlah: { label: "Jumlah" },
  "Laki-laki": { label: "Laki-laki", color: "var(--chart-1)" },
  Perempuan: { label: "Perempuan", color: "var(--chart-4)" },
}

export function StatusKependudukanChart({ data }: { data: StatusData }) {
  const chartData = [
    { status: "Tetap", jumlah: data.tetap, fill: "var(--chart-1)" },
    { status: "Domisili", jumlah: data.domisili, fill: "var(--chart-2)" },
    { status: "Kontrak", jumlah: data.kontrak, fill: "var(--chart-3)" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status Kependudukan</CardTitle>
        <CardDescription>Sebaran warga berdasarkan status kependudukan</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={statusConfig} className="h-[260px] w-full">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie data={chartData} dataKey="jumlah" nameKey="status" innerRadius={60} strokeWidth={2}>
              {chartData.map((entry) => (
                <Cell key={entry.status} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {chartData.map((d) => (
            <div key={d.status} className="space-y-1">
              <div className="flex items-center justify-center gap-1.5">
                <span className="size-2.5 rounded-full" style={{ backgroundColor: d.fill }} />
                <span className="text-xs text-muted-foreground">{d.status}</span>
              </div>
              <p className="text-lg font-semibold">{d.jumlah}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function JenisKelaminChart({ data }: { data: StatusData }) {
  const chartData = [
    { jenis: "Laki-laki", jumlah: data.lakiLaki, fill: "var(--chart-1)" },
    { jenis: "Perempuan", jumlah: data.perempuan, fill: "var(--chart-4)" },
  ]
  const total = data.lakiLaki + data.perempuan

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sebaran Jenis Kelamin</CardTitle>
        <CardDescription>
          {data.lakiLaki} Laki-laki · {data.perempuan} Perempuan
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={genderConfig} className="h-[260px] w-full">
          <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 24 }}>
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="jenis" tickLine={false} axisLine={false} width={80} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="jumlah" radius={[0, 6, 6, 0]}>
              {chartData.map((entry) => (
                <Cell key={entry.jenis} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
        <div className="mt-2 grid grid-cols-2 gap-4 text-center text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Persentase Laki-laki</p>
            <p className="font-semibold">{total ? Math.round((data.lakiLaki / total) * 100) : 0}%</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Persentase Perempuan</p>
            <p className="font-semibold">{total ? Math.round((data.perempuan / total) * 100) : 0}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface SebaranRT {
  rt: string
  warga: number
  kk: number
}

const rtConfig: ChartConfig = {
  warga: { label: "Warga", color: "var(--chart-1)" },
  kk: { label: "KK", color: "var(--chart-2)" },
}

export function SebaranRTChart({ data }: { data: SebaranRT[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sebaran per RT</CardTitle>
        <CardDescription>Jumlah warga dan Kartu Keluarga di setiap RT</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={rtConfig} className="h-[280px] w-full">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="rt" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={28} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="warga" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
            <Bar dataKey="kk" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
