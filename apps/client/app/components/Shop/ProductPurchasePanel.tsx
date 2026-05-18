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

export type PurchaseVariant = {
  id: string
  flavourLabel: string
  sizeLabel: string
  isActive: boolean
}

type ProductPurchasePanelProps = {
  productId: string
  productTitle: string
  flavours: PurchaseFlavourOption[]
  sizes: PurchaseSizeOption[]
  variants: PurchaseVariant[]
  isInStock: boolean
  stockQuantity: number
  /** Called when the selection has been resolved to a concrete variant id. */
  onResolvedSelection?: (selection: {
    variantId: string | null
    flavourLabel: string
    sizeLabel: string
  }) => void
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
  variants,
  isInStock,
  stockQuantity,
  onResolvedSelection,
}: ProductPurchasePanelProps) {
  const router = useRouter()
  const [isCartBusy, setIsCartBusy] = React.useState(false)

  const flavourList = React.useMemo(() => sortOptions(flavours), [flavours])
  const sizeList = React.useMemo(() => sortOptions(sizes), [sizes])

  const maxSelectable = React.useMemo(
    () => (isInStock ? Math.max(1, stockQuantity) : 1),
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

  const resolvedFlavour = flavourList.length > 0 ? (flavourLabel ?? "") : ""
  const resolvedSize = sizeList.length > 0 ? (sizeLabel ?? "") : ""

  const selectedVariantId = React.useMemo(() => {
    if (flavourList.length > 0 && !resolvedFlavour) return null
    if (sizeList.length > 0 && !resolvedSize) return null
    const match = variants.find(
      (v) =>
        v.isActive &&
        v.flavourLabel === resolvedFlavour &&
        v.sizeLabel === resolvedSize,
    )
    return match?.id ?? null
  }, [variants, flavourList.length, sizeList.length, resolvedFlavour, resolvedSize])

  React.useEffect(() => {
    if (!onResolvedSelection) return
    if (flavourList.length > 0 && flavourLabel == null) return
    if (sizeList.length > 0 && sizeLabel == null) return
    onResolvedSelection({
      variantId: selectedVariantId,
      flavourLabel: resolvedFlavour,
      sizeLabel: resolvedSize,
    })
  }, [
    onResolvedSelection,
    flavourList.length,
    sizeList.length,
    flavourLabel,
    sizeLabel,
    selectedVariantId,
    resolvedFlavour,
    resolvedSize,
  ])

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
        variantId: selectedVariantId ?? undefined,
        selectedFlavourLabel: resolvedFlavour,
        selectedSizeLabel: resolvedSize,
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
      "h-10 min-w-[2.75rem] rounded-md border px-3 text-sm font-medium transition-colors cursor-pointer",
      active
        ? "border-primary/35 bg-primary/8 text-foreground"
        : "border-border/70 bg-background text-foreground hover:border-border dark:bg-muted/20",
    )

  return (
    <div className="mt-6 space-y-6">

      {flavourList.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-medium tracking-wide text-muted-foreground">
            Flavour
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
          <p className="text-xs font-medium tracking-wide text-muted-foreground">
            Size
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
                <span className="inline-flex items-baseline gap-1.5 whitespace-nowrap text-sm">
                  <span className="font-medium">{s.label}</span>
                  <span className="text-muted-foreground">-</span>
                  <span className="tabular-nums font-normal text-muted-foreground">
                    {formatInr(s.price)}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {isInStock ? (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-medium tracking-wide text-muted-foreground">
              Quantity
            </p>
          </div>
          <div
            className={cn(
              "flex h-12 max-w-44 items-center justify-between gap-1 rounded-lg border border-border/70 bg-background px-1 dark:bg-muted/20",
              !canPurchase && "opacity-50",
            )}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-10 shrink-0 rounded-md"
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
              className="size-10 shrink-0 rounded-md"
              disabled={!canPurchase || resolvedQuantity >= maxSelectable}
              onClick={() => bumpQuantity(1)}
              aria-label="Increase quantity"
            >
              <Plus className="size-4" />
            </Button>
          </div>
        </div>
      ) : null}

      {displayUnitPrice != null ? (
        <div className="rounded-xl border border-border/60 bg-muted/20 p-4 dark:bg-muted/15">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-medium tracking-wide text-muted-foreground">
                Price
              </p>
              <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
                {showFromPrefix ? (
                  <>
                    <span className="text-xl font-medium text-muted-foreground">From </span>
                    {formatInr(displayUnitPrice)}
                  </>
                ) : (
                  formatInr(displayUnitPrice)
                )}
              </p>
            </div>
            <span className="rounded-md border border-border/60 bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground">
              Inclusive of taxes
            </span>
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          type="button"
          size="lg"
          className="h-12 rounded-lg text-base shadow-none"
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
          className="h-12 rounded-lg text-base border-border/70"
          disabled={!canPurchase || isCartBusy}
          onClick={() => void handleBuyNow()}
        >
          Buy Now
        </Button>
      </div>
    </div>
  )
}
