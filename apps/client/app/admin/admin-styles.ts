import { cn } from "@/lib/utils"

export const adminInput = cn(
  "flex h-10 w-full rounded-md border border-border/80 bg-background px-3 py-2 text-sm text-foreground shadow-none",
  "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
)

export const adminLabel = "text-xs font-medium uppercase tracking-wide text-muted-foreground"

export const adminCard = "rounded-xl border border-border/60 bg-card/80 p-6 shadow-none"

export const adminTableWrap = "overflow-x-auto rounded-xl border border-border/60"

export const adminTable = "w-full min-w-[640px] text-left text-sm"

export const adminTh = "border-b border-border/60 bg-muted/30 px-4 py-3 font-semibold text-foreground"

export const adminTd = "border-b border-border/40 px-4 py-3 text-muted-foreground"
