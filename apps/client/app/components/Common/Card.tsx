"use client"

import Image from "next/image"
import { ShoppingCart, Star } from "lucide-react"
import React from "react"

import { Button } from "@/app/components/ui/button"
import { Skeleton } from "@/app/components/ui/skeleton"
import { cn } from "@/lib/utils"

type ProductCardProps = {
  imageSrc: string
  imageAlt: string
  title: string
  subtitle?: string
  price: number
  originalPrice?: number
  rating?: number
  countryCode?: string
  onAddToCart?: () => void
  onBuyNow?: () => void
  onCardClick?: () => void
  className?: string
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
  originalPrice,
  rating = 4.2,
  onAddToCart,
  onCardClick,
  className,
}: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = React.useState(false)

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
        "flex w-full max-w-[20rem] flex-col overflow-hidden rounded-3xl border border-border bg-card text-card-foreground shadow-sm",
        onCardClick
          ? "cursor-pointer transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
          : "",
        className
      )}
    >
      <div className="relative">
        <div className="overflow-hidden rounded-2xl">
          {!imageLoaded && <Skeleton className="h-64 w-full rounded-2xl" />}
          <Image
            src={imageSrc}
            alt={imageAlt}
            width={600}
            height={600}
            className={cn(
              "h-64 w-full object-cover transition-opacity duration-500",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setImageLoaded(true)}
          />
        </div>

        
      </div>

      <div className="flex flex-1 flex-col space-y-3 p-5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-md bg-cyan-500 px-2 py-1 text-xs font-semibold text-white">
            {rating.toFixed(1)}
            <Star className="size-3 fill-current" />
          </span>
        </div>

        {subtitle ? (
          <p className="text-sm text-zinc-500">{subtitle}</p>
        ) : null}

        <h3 className="line-clamp-2 text-base font-medium leading-6 sm:text-lg">{title}</h3>

        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold sm:text-3xl">{formatPrice(price)}</span>
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
            className="w-full cursor-pointer"
            onClick={onCardClick}
            disabled={!onCardClick}
          >
            View Product
          </Button>
          <Button
            type="button"
            variant="default"
            size="lg"
            className="w-full cursor-pointer"
            onClick={onAddToCart}
          >
            <ShoppingCart className="size-4" />
            Add to Cart
          </Button>
        </div>
      </div>
    </article>
  )
}
