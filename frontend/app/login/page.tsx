import { LoginForm } from "@/components/auth/login-form"
import { Building2 } from "lucide-react"

export default function LoginPage() {
  return (
    <main className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left brand panel */}
      <section className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -left-24 size-96 rounded-full bg-primary-foreground blur-3xl" />
          <div className="absolute bottom-0 right-0 size-80 rounded-full bg-primary-foreground blur-3xl" />
        </div>

        <header className="relative flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary-foreground/15 backdrop-blur">
            <Building2 className="size-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest opacity-80">Sistem Informasi</p>
            <p className="font-semibold text-lg">SIWARGA RW 05</p>
          </div>
        </header>

        <div className="relative space-y-4 max-w-md">
          <h1 className="text-4xl font-bold leading-tight text-balance">
            Kelola data warga dan keuangan RW dalam satu sistem.
          </h1>
          <p className="text-primary-foreground/80 leading-relaxed text-pretty">
            Platform terpadu untuk Ketua RW, Ketua RT, dan Warga. Pantau demografi, kelola Kartu Keluarga, dan jaga
            transparansi keuangan kas RW.
          </p>
        </div>

        <div className="relative grid grid-cols-3 gap-4 max-w-md">
          <Stat label="Total Warga" value="20" />
          <Stat label="Total KK" value="13" />
          <Stat label="RT Aktif" value="5" />
        </div>
      </section>

      {/* Right form panel */}
      <section className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Building2 className="size-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Sistem Informasi</p>
              <p className="font-semibold text-lg">SIWARGA RW 05</p>
            </div>
          </div>

          <div className="space-y-2 mb-8">
            <h2 className="text-3xl font-bold tracking-tight">Masuk ke akun Anda</h2>
            <p className="text-muted-foreground leading-relaxed">
              Gunakan username dan password yang diberikan oleh Ketua RW.
            </p>
          </div>

          <LoginForm />

          <div className="mt-8 rounded-lg border border-dashed border-border bg-muted/40 p-4 text-sm">
            <p className="font-medium mb-2">Akun Demo</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>
                <span className="font-mono text-foreground">superadmin</span> — Ketua RW
              </li>
              <li>
                <span className="font-mono text-foreground">admin01</span> — Ketua RT 01
              </li>
              <li>
                <span className="font-mono text-foreground">warga</span> — Warga
              </li>
              <li className="pt-1">
                Password semua akun: <span className="font-mono text-foreground">password</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-primary-foreground/10 backdrop-blur p-4 border border-primary-foreground/15">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs opacity-80 mt-1">{label}</p>
    </div>
  )
}
