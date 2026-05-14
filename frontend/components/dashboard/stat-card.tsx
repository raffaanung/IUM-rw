import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: { value: string; positive?: boolean }
  variant?: "default" | "primary" | "success" | "warning" | "danger"
}

const variantStyles: Record<NonNullable<StatCardProps["variant"]>, string> = {
  default: "bg-muted text-foreground",
  primary: "bg-primary/10 text-primary",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  danger: "bg-destructive/10 text-destructive",
}

export function StatCard({ title, value, description, icon: Icon, trend, variant = "default" }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-2xl font-bold tracking-tight truncate">{value}</p>
            {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
          </div>
          <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", variantStyles[variant])}>
            <Icon className="size-5" />
          </div>
        </div>
        {trend ? (
          <p
            className={cn(
              "mt-3 text-xs font-medium",
              trend.positive ? "text-emerald-600 dark:text-emerald-400" : "text-destructive",
            )}
          >
            {trend.value}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
