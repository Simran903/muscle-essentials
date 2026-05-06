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

type FeaturedSectionProps = {
  products: ProductItem[]
}

export const FeaturedSection = ({ products }: FeaturedSectionProps) => {
  const router = useRouter()

  return (
    <section id="featured" className="mx-auto w-full max-w-360 px-4 pb-12 pt-6 sm:pt-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading
          title="FEATURED PRODUCTS"
          description="Explore curated picks and benefits tailored to your fitness goals."
        />
        <Button asChild variant="outline" className="rounded-full px-5">
          <Link href="/shop/featured">View more</Link>
        </Button>
      </div>
      <div className="mt-6">
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
                  onCardClick={() => router.push(`/shop/${product.slug}`)}
                  className="max-w-none rounded-2xl"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  )
}
