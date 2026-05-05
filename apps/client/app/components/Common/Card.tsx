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
  className,
}: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = React.useState(false)

  return (
    <article
      className={cn(
        "w-full max-w-[20rem] overflow-hidden rounded-3xl border border-border bg-card text-card-foreground shadow-sm",
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

        {subtitle ? (
          <p className="mt-3 text-sm text-zinc-300">{subtitle}</p>
        ) : null}
      </div>

      <div className="space-y-5 p-5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-md bg-cyan-500 px-2 py-1 text-xs font-semibold text-white">
            {rating.toFixed(1)}
            <Star className="size-3 fill-current" />
          </span>
        </div>

        <h3 className="line-clamp-2 text-base font-medium leading-6 sm:text-lg">{title}</h3>

        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold sm:text-3xl">{formatPrice(price)}</span>
          {originalPrice ? (
            <span className="text-base text-muted-foreground line-through sm:text-lg">
              {formatPrice(originalPrice)}
            </span>
          ) : null}
        </div>

        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full bg-[#F1C232] text-[#2d2a2a] hover:bg-[#dfb42f] dark:bg-[#F1C232] dark:text-[#2d2a2a] dark:hover:bg-[#dfb42f] cursor-pointer"
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
