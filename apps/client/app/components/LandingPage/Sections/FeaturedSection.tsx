"use client"

import React from "react"
import { Card } from "@/app/components/Common/Card"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { SectionHeading } from "@/app/components/Common/SectionHeading"
import { type ProductItem } from "@/lib/api"
import { Button } from "@/app/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/app/components/ui/carousel"

import { ProductCarouselSkeleton } from "../ProductCarouselSkeleton"

type FeaturedSectionProps = {
  products: ProductItem[]
  isLoading?: boolean
}

export const FeaturedSection = ({ products, isLoading = false }: FeaturedSectionProps) => {
  const router = useRouter()

  return (
    <section id="featured" className="mx-auto w-full max-w-360 px-5 pb-4 pt-2 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <SectionHeading
          title="Featured products"
          description="Explore curated picks and benefits tailored to your fitness goals."
        />
        <Button asChild variant="outline" className="rounded-full px-6 shadow-none">
          <Link href="/shop?featured=1">View more</Link>
        </Button>
      </div>
      <div className="mt-6">
        {isLoading ? (
          <ProductCarouselSkeleton />
        ) : (
          <Carousel opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent>
              {products.map((product) => (
                <CarouselItem
                  key={product.id}
                  className="basis-[85%] sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                >
                  <Card
                    imageSrc={product.images.find((image) => image.isPrimary)?.url ?? product.images[0]?.url ?? "/images/placeholder.jpg"}
                    imageAlt={product.images.find((image) => image.isPrimary)?.altText ?? product.title}
                    title={product.title}
                    subtitle={product.brand?.name ?? "Muscle Essentials"}
                    price={Number(product.price)}
                    priceFrom={
                      product.maxPrice != null &&
                      Number(product.maxPrice) > Number(product.price)
                    }
                    productId={product.id}
                    productSlug={product.slug}
                    flavourOptionCount={product.flavours?.length ?? 0}
                    sizeOptionCount={product.sizes?.length ?? 0}
                    flavourLabels={product.flavours?.map((f) => f.label)}
                    sizeLabels={product.sizes?.map((s) => s.label)}
                    outOfStock={product.stockQuantity <= 0}
                    defaultFlavourLabel={
                      product.flavours?.length === 1 ? product.flavours[0]!.label : undefined
                    }
                    defaultSizeLabel={product.sizes?.length === 1 ? product.sizes[0]!.label : undefined}
                    onCardClick={() => router.push(`/shop/${product.slug}`)}
                    className="max-w-none rounded-2xl"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        )}
      </div>
    </section>
  )
}
