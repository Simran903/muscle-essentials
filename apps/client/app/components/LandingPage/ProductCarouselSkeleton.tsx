"use client"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/app/components/ui/carousel"
import { Skeleton } from "@/app/components/ui/skeleton"

const SLIDE_COUNT = 5

type ProductCarouselSkeletonProps = {
  className?: string
}

/** Matches product carousel slide widths (Card rail) while landing API data loads. */
export function ProductCarouselSkeleton({ className }: ProductCarouselSkeletonProps) {
  return (
    <div aria-busy="true" aria-label="Loading products" className={className}>
      <Carousel opts={{ align: "start", loop: false }} className="w-full">
        <CarouselContent>
          {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
            <CarouselItem
              key={i}
              className="basis-[85%] sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
            >
              <div className="space-y-3 pr-1">
                <Skeleton className="aspect-3/4 w-full rounded-2xl sm:aspect-4/5" />
                <Skeleton className="h-4 w-[88%]" />
                <Skeleton className="h-4 w-[55%]" />
                <Skeleton className="h-6 w-24" />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  )
}
