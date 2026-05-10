"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Minus, Plus, ShoppingCart } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/app/components/ui/button"
import { cn } from "@/lib/utils"
import { addProductToCart } from "@/lib/cart-client"

export type PurchaseFlavourOption = {
  id: string
  label: string
  sortOrder: number
}

export type PurchaseSizeOption = {
  id: string
  label: string
  sortOrder: number
  price: number | string
}

const MAX_QUANTITY_PER_ADD = 5

type ProductPurchasePanelProps = {
  productId: string
  productTitle: string
  flavours: PurchaseFlavourOption[]
  sizes: PurchaseSizeOption[]
  isInStock: boolean
  stockQuantity: number
}

function formatInr(value: number | string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value))
}

function sortOptions<T extends { sortOrder: number; label: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label))
}

export function ProductPurchasePanel({
  productId,
  productTitle,
  flavours,
  sizes,
  isInStock,
  stockQuantity,
}: ProductPurchasePanelProps) {
  const router = useRouter()
  const [isCartBusy, setIsCartBusy] = React.useState(false)

  const flavourList = React.useMemo(() => sortOptions(flavours), [flavours])
  const sizeList = React.useMemo(() => sortOptions(sizes), [sizes])

  const maxSelectable = React.useMemo(
    () => (isInStock ? Math.min(MAX_QUANTITY_PER_ADD, Math.max(1, stockQuantity)) : 1),
    [isInStock, stockQuantity],
  )

  const [quantity, setQuantity] = React.useState(1)
  const resolvedQuantity = Math.max(1, Math.min(quantity, maxSelectable))

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
  const selectedSize = sizeList.find((s) => s.id === sizeId)
  const sizeLabel = selectedSize?.label

  const displayUnitPrice = React.useMemo(() => {
    if (sizeList.length === 0) return null
    if (selectedSize) return selectedSize.price
    const prices = sizeList.map((s) => Number(s.price))
    return Math.min(...prices)
  }, [sizeList, selectedSize])

  const showFromPrefix =
    sizeList.length > 1 &&
    selectedSize == null &&
    displayUnitPrice != null &&
    new Set(sizeList.map((s) => Number(s.price))).size > 1

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

  const addWithApi = async (q: number) => {
    setIsCartBusy(true)
    try {
      const result = await addProductToCart(productId, q, {
        selectedFlavourLabel: flavourList.length > 0 ? (flavourLabel ?? "") : "",
        selectedSizeLabel: sizeList.length > 0 ? (sizeLabel ?? "") : "",
      })
      if (result.ok) return true
      if (result.reason === "auth") {
        toast.error("Sign in to add items to your cart.")
        return false
      }
      toast.error(result.message ?? "Couldn't add to cart.")
      return false
    } finally {
      setIsCartBusy(false)
    }
  }

  const handleAddToCart = async () => {
    if (!validate()) return
    const ok = await addWithApi(resolvedQuantity)
    if (ok) {
      toast.success(`Added ${resolvedQuantity} × ${announceSelection()} to your bag.`)
    }
  }

  const handleBuyNow = async () => {
    if (!validate()) return
    const ok = await addWithApi(resolvedQuantity)
    if (ok) {
      router.push("/cart")
    }
  }

  const bumpQuantity = (delta: number) => {
    setQuantity((q) => {
      const current = Math.max(1, Math.min(q, maxSelectable))
      return Math.min(maxSelectable, Math.max(1, current + delta))
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
      {displayUnitPrice != null ? (
        <div className="rounded-2xl border border-border bg-muted/40 p-4 dark:bg-muted/30">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Price
              </p>
              <p className="mt-1 text-4xl font-bold tracking-tight text-foreground">
                {showFromPrefix ? (
                  <>
                    <span className="text-2xl font-semibold text-muted-foreground">From </span>
                    {formatInr(displayUnitPrice)}
                  </>
                ) : (
                  formatInr(displayUnitPrice)
                )}
              </p>
            </div>
            <span className="rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground">
              Inclusive of taxes
            </span>
          </div>
        </div>
      ) : null}

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
                <span className="block">{s.label}</span>
                <span className="mt-0.5 block text-[11px] font-normal tabular-nums text-muted-foreground">
                  {formatInr(s.price)}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {isInStock ? (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Quantity
            </p>
            <p className="text-xs text-muted-foreground">
              {maxSelectable < MAX_QUANTITY_PER_ADD
                ? `${maxSelectable} available`
                : `Up to ${MAX_QUANTITY_PER_ADD} per add`}
            </p>
          </div>
          <div
            className={cn(
              "flex h-12 max-w-44 items-center justify-between gap-1 rounded-2xl border border-border bg-background/80 px-1 dark:bg-muted/30",
              !canPurchase && "opacity-50",
            )}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-10 shrink-0 rounded-xl"
              disabled={!canPurchase || resolvedQuantity <= 1}
              onClick={() => bumpQuantity(-1)}
              aria-label="Decrease quantity"
            >
              <Minus className="size-4" />
            </Button>
            <span className="min-w-[2ch] text-center text-base font-semibold tabular-nums">
              {resolvedQuantity}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-10 shrink-0 rounded-xl"
              disabled={!canPurchase || resolvedQuantity >= maxSelectable}
              onClick={() => bumpQuantity(1)}
              aria-label="Increase quantity"
            >
              <Plus className="size-4" />
            </Button>
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          type="button"
          size="lg"
          className="h-12 rounded-2xl text-base"
          disabled={!canPurchase || isCartBusy}
          onClick={() => void handleAddToCart()}
        >
          <ShoppingCart className="size-4" />
          {isCartBusy ? "Adding…" : "Add to Cart"}
        </Button>

        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-12 rounded-2xl text-base"
          disabled={!canPurchase || isCartBusy}
          onClick={() => void handleBuyNow()}
        >
          Buy Now
        </Button>
      </div>
    </div>
  )
}
