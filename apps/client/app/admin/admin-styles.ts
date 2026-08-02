import { cn } from "@/lib/utils"

export const adminInput = cn(
  "flex h-10 w-full rounded-xl border border-border/40 bg-background px-3 py-2 text-sm text-foreground shadow-sm",
  "placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/40",
  "transition-all",
)

export const adminLabel = "text-xs font-semibold uppercase tracking-wide text-muted-foreground"

export const adminCard = "rounded-2xl border border-border/20 bg-card/50 p-6 shadow-sm backdrop-blur-sm"

export const adminTableWrap = "overflow-x-auto rounded-xl border border-border/20 shadow-sm"

export const adminTable = "w-full min-w-[640px] text-left text-sm"

export const adminTh = "border-b border-border/30 bg-muted/20 px-4 py-3 font-semibold text-foreground text-xs uppercase tracking-wide"

export const adminTd = "border-b border-border/20 px-4 py-3 text-muted-foreground"
