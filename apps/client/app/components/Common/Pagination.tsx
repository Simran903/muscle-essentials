"use client"

import { cn } from "@/lib/utils"

export type PaginationProps = {
  page: number
  totalPages: number
  onPrevious: () => void
  onNext: () => void
  className?: string
  previousLabel?: string
  nextLabel?: string
  isPreviousDisabled?: boolean
  isNextDisabled?: boolean
}

export function Pagination({
  page,
  totalPages,
  onPrevious,
  onNext,
  className,
  previousLabel = "Previous",
  nextLabel = "Next",
  isPreviousDisabled,
  isNextDisabled,
}: PaginationProps) {
  const previousDisabled = isPreviousDisabled ?? page <= 1
  const nextDisabled =
    isNextDisabled ?? (page >= totalPages || totalPages < 1)

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4",
        className
      )}
    >
      <p className="text-sm tabular-nums text-muted-foreground">
        Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrevious}
          disabled={previousDisabled}
          className="inline-flex h-9 items-center rounded-full border border-border/70 bg-background px-4 text-sm font-medium text-foreground shadow-sm transition-all hover:border-border hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {previousLabel}
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          className="inline-flex h-9 items-center rounded-full border border-border/70 bg-background px-4 text-sm font-medium text-foreground shadow-sm transition-all hover:border-border hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {nextLabel}
        </button>
      </div>
    </div>
  )
}
