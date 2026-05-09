"use client"

import * as React from "react"
import { ShoppingCart } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/app/components/ui/button"
import { cn } from "@/lib/utils"

export type PurchaseVariantOption = {
  id: string
  label: string
  sortOrder: number
}

type ProductPurchasePanelProps = {
  productTitle: string
  flavours: PurchaseVariantOption[]
  sizes: PurchaseVariantOption[]
  isInStock: boolean
}

function sortOptions<T extends { sortOrder: number; label: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label))
}

export function ProductPurchasePanel({
  productTitle,
  flavours,
  sizes,
  isInStock,
}: ProductPurchasePanelProps) {
  const flavourList = React.useMemo(() => sortOptions(flavours), [flavours])
  const sizeList = React.useMemo(() => sortOptions(sizes), [sizes])

  const [flavourId, setFlavourId] = React.useState<string | null>(() =>
    flavourList.length === 1 ? flavourList[0]!.id : null,
  )
  const [sizeId, setSizeId] = React.useState<string | null>(() =>
    sizeList.length === 1 ? sizeList[0]!.id : null,
  )

  const flavourOk = flavourList.length === 0 || flavourId !== null
  const sizeOk = sizeList.length === 0 || sizeId !== null
  const canPurchase = isInStock && flavourOk && sizeOk

  const flavourLabel = flavourList.find((f) => f.id === flavourId)?.label
  const sizeLabel = sizeList.find((s) => s.id === sizeId)?.label

  const announceSelection = () => {
    const bits = [flavourLabel, sizeLabel].filter(Boolean)
    const variant = bits.length ? ` (${bits.join(" · ")})` : ""
    return `${productTitle}${variant}`
  }

  const validate = () => {
    if (!isInStock) return false
    if (flavourList.length > 0 && !flavourId) {
      toast.error("Please select a flavour.")
      return false
    }
    if (sizeList.length > 0 && !sizeId) {
      toast.error("Please select a size.")
      return false
    }
    return true
  }

  const handleAddToCart = () => {
    if (!validate()) return
    toast.success(`Added ${announceSelection()} to your bag.`)
  }

  const handleBuyNow = () => {
    if (!validate()) return
    toast.message("Buy now", {
      description: `${announceSelection()} — checkout will open here when payments go live.`,
    })
  }

  const optionButtonClass = (active: boolean) =>
    cn(
      "h-10 min-w-[2.75rem] rounded-2xl border px-3 text-sm font-medium transition-colors",
      active
        ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-900 dark:border-cyan-400/40 dark:bg-cyan-500/15 dark:text-cyan-100"
        : "border-border bg-background/80 text-foreground hover:bg-muted dark:bg-muted/30",
    )

  return (
    <div className="mt-6 space-y-6">
      {flavourList.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Flavour
            {flavourList.length > 1 && !flavourId ? (
              <span className="ml-2 font-normal normal-case text-amber-600 dark:text-amber-400">
                — choose one
              </span>
            ) : null}
          </p>
          <div className="flex flex-wrap gap-2">
            {flavourList.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFlavourId(f.id)}
                className={optionButtonClass(flavourId === f.id)}
                aria-pressed={flavourId === f.id}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {sizeList.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Size
            {sizeList.length > 1 && !sizeId ? (
              <span className="ml-2 font-normal normal-case text-amber-600 dark:text-amber-400">
                — choose one
              </span>
            ) : null}
          </p>
          <div className="flex flex-wrap gap-2">
            {sizeList.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSizeId(s.id)}
                className={optionButtonClass(sizeId === s.id)}
                aria-pressed={sizeId === s.id}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          type="button"
          size="lg"
          className="h-12 rounded-2xl text-base"
          disabled={!canPurchase}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="size-4" />
          Add to Cart
        </Button>

        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-12 rounded-2xl text-base"
          disabled={!canPurchase}
          onClick={handleBuyNow}
        >
          Buy Now
        </Button>
      </div>
    </div>
  )
}
