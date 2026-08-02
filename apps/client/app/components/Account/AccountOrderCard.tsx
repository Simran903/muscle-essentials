import type { AccountOrder } from "@/lib/api"
import { cn } from "@/lib/utils"

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const

function formatDate(iso: string | null): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return `${MONTHS_SHORT[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`
}

function formatInr(value: number | string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value))
}

function titleCaseStatus(value: string): string {
  if (!value) return ""
  return value
    .toLowerCase()
    .split("_")
    .map((seg) => (seg ? seg[0]!.toUpperCase() + seg.slice(1) : seg))
    .join(" ")
}

const STATUS_TONE: Record<string, string> = {
  PLACED:
    "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  CONFIRMED:
    "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  PROCESSING:
    "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  SHIPPED:
    "border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
  DELIVERED:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  CANCELLED:
    "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  REFUNDED:
    "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
}

function StatusPill({ status }: { status: string }) {
  const tone =
    STATUS_TONE[status.toUpperCase()] ??
    "border-border/60 bg-muted/50 text-muted-foreground"
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide",
        tone,
      )}
    >
      {titleCaseStatus(status)}
    </span>
  )
}

export function AccountOrderCard({ order }: { order: AccountOrder }) {
  const placed = formatDate(order.placedAt) ?? "—"
  const itemSummary =
    order.items.length === 0
      ? "No items"
      : order.items.length === 1
        ? order.items[0]!.productTitle
        : `${order.items[0]!.productTitle} +${order.items.length - 1} more`
  const itemCount = order.items.reduce((n, i) => n + i.quantity, 0)

  return (
    <li className="rounded-xl border border-border/30 bg-card/50 p-4 shadow-sm transition-all hover:border-border/60 hover:bg-muted/20 hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
              #{order.orderNumber}
            </span>
            <StatusPill status={order.status} />
          </div>
          <p className="mt-2 line-clamp-2 text-sm leading-snug text-muted-foreground">
            {itemSummary}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {placed} · {itemCount} {itemCount === 1 ? "item" : "items"}
          </p>
        </div>
        <p className="shrink-0 text-lg font-semibold tabular-nums tracking-tight text-foreground">
          {formatInr(order.totalAmount)}
        </p>
      </div>
    </li>
  )
}
