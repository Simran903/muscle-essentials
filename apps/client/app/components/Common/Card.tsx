"use client"

import Image from "next/image"
import { ShoppingCart, Star } from "lucide-react"
import { useRouter } from "next/navigation"
import React from "react"

import { Button } from "@/app/components/ui/button"
import { Skeleton } from "@/app/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { getProductBySlug } from "@/lib/api"
import { addProductToCart } from "@/lib/cart-client"
import { toast } from "sonner"

type ProductCardProps = {
  imageSrc: string
  imageAlt: string
  title: string
  subtitle?: string
  price: number
  /** When size tiers use different prices, show “From” before the listing price. */
  priceFrom?: boolean
  originalPrice?: number
  rating?: number
  countryCode?: string
  /** Server product id — used for Add to cart when set. */
  productId?: string
  /** Resolved to id on Add when `productId` is omitted (e.g. marketing slugs). */
  productSlug?: string
  /** From listing data: number of flavour options (0 = none). Used to block quick-add when there is more than one. */
  flavourOptionCount?: number
  /** From listing data: number of size options (0 = none). */
  sizeOptionCount?: number
  /** Labels for available flavours. When provided, rendered as pills and used to derive the count. */
  flavourLabels?: string[]
  /** Labels for available sizes. When provided, rendered as pills and used to derive the count. */
  sizeLabels?: string[]
  /** When true, Add to cart is disabled. */
  outOfStock?: boolean
  /** Sent with add-to-cart when product has a single flavour (e.g. from listing data). */
  defaultFlavourLabel?: string | null
  /** Sent with add-to-cart when product has a single size. */
  defaultSizeLabel?: string | null
  onAddToCart?: () => void
  onBuyNow?: () => void
  onCardClick?: () => void
  className?: string
  /** Small labels on the image for variant- or product-level merchandising. */
  merchBadges?: {
    isFeatured?: boolean
    isBestseller?: boolean
    isDealoftheDay?: boolean
  }
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)
}

export function Card({
  imageSrc,
  imageAlt,
  title,
  subtitle,
  price,
  priceFrom = false,
  originalPrice,
  rating = 4.2,
  productId,
  productSlug,
  flavourOptionCount,
  sizeOptionCount,
  flavourLabels,
  sizeLabels,
  outOfStock = false,
  defaultFlavourLabel,
  defaultSizeLabel,
  onAddToCart,
  onCardClick,
  className,
  merchBadges,
}: ProductCardProps) {
  const router = useRouter()
  const [imageLoaded, setImageLoaded] = React.useState(false)
  const [isAdding, setIsAdding] = React.useState(false)
  const imageRef = React.useRef<HTMLImageElement | null>(null)

  const canUseCartApi = Boolean(productId || productSlug)

  const effectiveFlavourCount = flavourLabels?.length ?? flavourOptionCount
  const effectiveSizeCount = sizeLabels?.length ?? sizeOptionCount

  const listingNeedsVariantChoice =
    productId != null &&
    effectiveFlavourCount !== undefined &&
    effectiveSizeCount !== undefined &&
    (effectiveFlavourCount > 1 || effectiveSizeCount > 1)

  const MAX_VISIBLE_PILLS = 3
  const visibleFlavours = (flavourLabels ?? []).slice(0, MAX_VISIBLE_PILLS)
  const flavourOverflow = (flavourLabels?.length ?? 0) - visibleFlavours.length
  const visibleSizes = (sizeLabels ?? []).slice(0, MAX_VISIBLE_PILLS)
  const sizeOverflow = (sizeLabels?.length ?? 0) - visibleSizes.length
  const hasOptionPills = visibleFlavours.length > 0 || visibleSizes.length > 0

  const handleAddToCart = async (event: React.MouseEvent) => {
    event.stopPropagation()
    event.preventDefault()
    if (onAddToCart) {
      onAddToCart()
      return
    }
    if (!canUseCartApi || outOfStock) return

    if (listingNeedsVariantChoice) {
      if (productSlug) router.push(`/shop/${productSlug}`)
      else onCardClick?.()
      return
    }

    setIsAdding(true)
    try {
      let id = productId
      let flavour = (defaultFlavourLabel ?? "").trim()
      let size = (defaultSizeLabel ?? "").trim()
      if (!id && productSlug) {
        try {
          const item = await getProductBySlug(productSlug)
          id = item.id
          const nFl = item.flavours?.length ?? 0
          const nSz = item.sizes?.length ?? 0
          if (nFl > 1 || nSz > 1) {
            toast.message("Choose flavour and size on the product page.", {
              description: "This item has multiple options.",
            })
            router.push(`/shop/${productSlug}`)
            return
          }
          if (nFl === 1) flavour = item.flavours![0]!.label
          if (nSz === 1) size = item.sizes![0]!.label
        } catch {
          toast.error("Product not available.")
          return
        }
      }
      if (!id) return
      const result = await addProductToCart(id, 1, {
        selectedFlavourLabel: flavour,
        selectedSizeLabel: size,
      })
      if (result.ok) {
        toast.success(`Added ${title} to your bag.`)
        return
      }
      if (result.reason === "auth") {
        toast.error("Sign in to add items to your cart.")
        return
      }
      toast.error(result.message ?? "Couldn't add to cart.")
    } finally {
      setIsAdding(false)
    }
  }

  React.useEffect(() => {
    setImageLoaded(false)
  }, [imageSrc])

  React.useEffect(() => {
    if (imageRef.current?.complete) {
      setImageLoaded(true)
    }
  }, [imageSrc])

  return (
    <article
      role={onCardClick ? "button" : undefined}
      tabIndex={onCardClick ? 0 : undefined}
      onClick={(event) => {
        if (!onCardClick) return
        if ((event.target as HTMLElement).closest("button")) return
        onCardClick()
      }}
      onKeyDown={(event) => {
        if (!onCardClick) return
        if (event.key !== "Enter" && event.key !== " ") return
        event.preventDefault()
        onCardClick()
      }}
      className={cn(
        "flex w-full max-w-[20rem] flex-col overflow-hidden rounded-xl border border-border/60 bg-card text-card-foreground shadow-none",
        onCardClick
          ? "cursor-pointer transition-[border-color,background-color] duration-200 hover:border-border/80 hover:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
          : "",
        className
      )}
    >
      <div className="relative">
        <div className="relative h-64 overflow-hidden rounded-t-xl bg-muted/25">
          {!imageLoaded && (
            <Skeleton className="absolute inset-0 z-10 h-full w-full rounded-none" />
          )}
          <Image
            ref={imageRef}
            src={imageSrc}
            alt={imageAlt}
            width={600}
            height={600}
            className="h-full w-full object-cover transition-opacity duration-300"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
          />
          {(merchBadges?.isFeatured ||
            merchBadges?.isBestseller ||
            merchBadges?.isDealoftheDay) && (
            <div className="pointer-events-none absolute left-2 top-2 z-5 flex max-w-[calc(100%-1rem)] flex-wrap gap-1">
              {merchBadges?.isFeatured ? (
                <span className="rounded-md border border-primary/35 bg-primary/15 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-foreground shadow-sm dark:bg-primary/20">
                  Featured
                </span>
              ) : null}
              {merchBadges?.isBestseller ? (
                <span className="rounded-md border border-emerald-500/35 bg-emerald-500/15 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-200">
                  Bestseller
                </span>
              ) : null}
              {merchBadges?.isDealoftheDay ? (
                <span className="rounded-md border border-cyan-500/40 bg-cyan-500/15 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-cyan-950 dark:text-cyan-100">
                  Deal
                </span>
              ) : null}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col space-y-3 p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-md border border-border/70 bg-muted/40 px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
            {rating.toFixed(1)}
            <Star className="size-3 fill-muted-foreground/25 text-muted-foreground/70" />
          </span>
        </div>

        {subtitle ? (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        ) : null}

        <h3 className="line-clamp-2 text-base font-semibold leading-snug tracking-tight sm:text-[1.05rem]">
          {title}
        </h3>

        {hasOptionPills ? (
          <ul
            aria-label="Available flavours and sizes"
            className="flex flex-wrap gap-1.5"
          >
            {visibleFlavours.map((label) => (
              <li
                key={`fl-${label}`}
                className="inline-flex items-center rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[0.7rem] font-medium text-muted-foreground"
              >
                {label}
              </li>
            ))}
            {flavourOverflow > 0 ? (
              <li className="inline-flex items-center rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[0.7rem] font-medium text-muted-foreground">
                +{flavourOverflow}
              </li>
            ) : null}
            {visibleSizes.map((label) => (
              <li
                key={`sz-${label}`}
                className="inline-flex items-center rounded-full border border-border/70 bg-foreground/5 px-2 py-0.5 text-[0.7rem] font-medium tabular-nums text-foreground/80 dark:bg-foreground/10"
              >
                {label}
              </li>
            ))}
            {sizeOverflow > 0 ? (
              <li className="inline-flex items-center rounded-full border border-border/70 bg-foreground/5 px-2 py-0.5 text-[0.7rem] font-medium text-foreground/80 dark:bg-foreground/10">
                +{sizeOverflow}
              </li>
            ) : null}
          </ul>
        ) : null}

        <div className="flex flex-wrap items-baseline gap-2">
          {priceFrom ? (
            <span className="text-sm font-medium text-muted-foreground">From</span>
          ) : null}
          <span className="text-xl font-semibold tracking-tight sm:text-2xl">{formatPrice(price)}</span>
          {originalPrice ? (
            <span className="text-base text-muted-foreground line-through sm:text-lg">
              {formatPrice(originalPrice)}
            </span>
          ) : null}
        </div>

        <div className="mt-auto space-y-2">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full cursor-pointer rounded-md border-border/70"
            onClick={onCardClick}
            disabled={!onCardClick}
          >
            View Product
          </Button>
          <Button
            type="button"
            variant="default"
            size="lg"
            className="w-full cursor-pointer rounded-md shadow-none"
            disabled={
              outOfStock || isAdding || (!onAddToCart && !canUseCartApi)
            }
            onClick={handleAddToCart}
          >
            <ShoppingCart className="size-4" />
            {outOfStock
              ? "Out of stock"
              : listingNeedsVariantChoice
                ? "Choose options"
                : isAdding
                  ? "Adding…"
                  : "Add to Cart"}
          </Button>
        </div>
      </div>
    </article>
  )
}
