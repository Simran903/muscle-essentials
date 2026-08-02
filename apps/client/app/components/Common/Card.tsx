"use client"

import Image from "next/image"
import { ShoppingCart, Star } from "lucide-react"
import { useRouter } from "next/navigation"
import React from "react"

import { Button } from "@/app/components/ui/button"
import { Skeleton } from "@/app/components/ui/skeleton"
import { DietTypeSymbol } from "@/app/components/Common/DietTypeSymbol"
import { cn } from "@/lib/utils"
import { getProductBySlug, type ProductDietType } from "@/lib/api"
import { addProductToCart } from "@/lib/cart-client"
import { toast } from "sonner"

type ProductCardProps = {
  imageSrc: string
  imageAlt: string
  title: string
  subtitle?: string
  price: number
  priceFrom?: boolean
  originalPrice?: number
  rating?: number
  countryCode?: string
  productId?: string
  productSlug?: string
  flavourOptionCount?: number
  sizeOptionCount?: number
  flavourLabels?: string[]
  sizeLabels?: string[]
  outOfStock?: boolean
  defaultFlavourLabel?: string | null
  defaultSizeLabel?: string | null
  onAddToCart?: () => void
  onBuyNow?: () => void
  onCardClick?: () => void
  className?: string
  merchBadges?: {
    isFeatured?: boolean
    isBestseller?: boolean
    isDealoftheDay?: boolean
  }
  dietType?: ProductDietType
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
  dietType,
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
        "group/card flex w-full max-w-[20rem] flex-col overflow-hidden rounded-2xl border border-border/50 bg-card text-card-foreground shadow-card transition-all duration-300",
        onCardClick
          ? "cursor-pointer hover:shadow-card-hover hover:border-border/80"
          : "",
        className
      )}
    >
      <div className="relative overflow-hidden">
        <div className="relative aspect-[4/5] overflow-hidden bg-muted/20">
          {!imageLoaded && (
            <Skeleton className="absolute inset-0 z-10 h-full w-full rounded-none" />
          )}
          <Image
            ref={imageRef}
            src={imageSrc}
            alt={imageAlt}
            width={600}
            height={750}
            className={cn(
              "h-full w-full object-cover transition-all duration-500 group-hover/card:scale-105",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
          />
          {dietType ? (
            <span
              className="pointer-events-none absolute right-2.5 top-2.5 z-10 drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)]"
              title={dietType === "VEG" ? "Vegetarian" : "Non-vegetarian"}
            >
              <DietTypeSymbol dietType={dietType} size={20} />
            </span>
          ) : null}
          {(merchBadges?.isFeatured ||
            merchBadges?.isBestseller ||
            merchBadges?.isDealoftheDay) && (
            <div className="pointer-events-none absolute left-2.5 top-2.5 z-10 flex max-w-[calc(100%-1.25rem)] flex-wrap gap-1.5">
              {merchBadges?.isBestseller ? (
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wide text-emerald-800 backdrop-blur-sm dark:text-emerald-200">
                  Bestseller
                </span>
              ) : null}
              {merchBadges?.isDealoftheDay ? (
                <span className="rounded-full border border-primary/30 bg-primary/15 px-2.5 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wide text-foreground backdrop-blur-sm">
                  Deal
                </span>
              ) : null}
              {merchBadges?.isFeatured && !merchBadges?.isBestseller && !merchBadges?.isDealoftheDay ? (
                <span className="rounded-full border border-amber-500/30 bg-amber-500/15 px-2.5 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wide text-amber-900 backdrop-blur-sm dark:text-amber-200">
                  Featured
                </span>
              ) : null}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col space-y-2.5 p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-lg border border-border/60 bg-muted/30 px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
            <Star className="size-3 fill-amber-500/30 text-amber-500/70" />
            {rating.toFixed(1)}
          </span>
        </div>

        {subtitle ? (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        ) : null}

        <h3 className="line-clamp-2 text-base font-semibold leading-snug tracking-tight text-foreground sm:text-[1.05rem]">
          {title}
        </h3>

        {hasOptionPills ? (
          <ul
            aria-label="Available flavours and sizes"
            className="flex flex-wrap gap-1"
          >
            {visibleFlavours.map((label) => (
              <li
                key={`fl-${label}`}
                className="inline-flex items-center rounded-full border border-border/50 bg-muted/30 px-2 py-0.5 text-[0.65rem] font-medium text-muted-foreground"
              >
                {label}
              </li>
            ))}
            {flavourOverflow > 0 ? (
              <li className="inline-flex items-center rounded-full border border-border/50 bg-muted/30 px-2 py-0.5 text-[0.65rem] font-medium text-muted-foreground">
                +{flavourOverflow}
              </li>
            ) : null}
            {visibleSizes.map((label) => (
              <li
                key={`sz-${label}`}
                className="inline-flex items-center rounded-full border border-border/50 bg-foreground/5 px-2 py-0.5 text-[0.65rem] font-medium tabular-nums text-foreground/70 dark:bg-foreground/10"
              >
                {label}
              </li>
            ))}
            {sizeOverflow > 0 ? (
              <li className="inline-flex items-center rounded-full border border-border/50 bg-foreground/5 px-2 py-0.5 text-[0.65rem] font-medium text-foreground/70 dark:bg-foreground/10">
                +{sizeOverflow}
              </li>
            ) : null}
          </ul>
        ) : null}

        <div className="flex flex-wrap items-baseline gap-2">
          {priceFrom ? (
            <span className="text-sm font-medium text-muted-foreground">From</span>
          ) : null}
          <span className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{formatPrice(price)}</span>
          {originalPrice ? (
            <span className="text-base text-muted-foreground/60 line-through sm:text-lg">
              {formatPrice(originalPrice)}
            </span>
          ) : null}
        </div>

        <div className="mt-auto space-y-2">
          <Button
            type="button"
            variant="default"
            size="lg"
            className="w-full cursor-pointer rounded-xl"
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
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full cursor-pointer rounded-xl"
            onClick={onCardClick}
            disabled={!onCardClick}
          >
            View Product
          </Button>
        </div>
      </div>
    </article>
  )
}
