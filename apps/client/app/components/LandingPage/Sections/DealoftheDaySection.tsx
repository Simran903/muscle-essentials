"use client"

import React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Card } from "@/app/components/Common/Card"
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

type DealoftheDaySectionProps = {
  products: ProductItem[]
}

export const DealoftheDaySection = ({ products }: DealoftheDaySectionProps) => {
  const router = useRouter()

  return (
    <section id="deal-of-the-day" className="mx-auto w-full max-w-360 px-4 py-12">
      <div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            title="DEAL OF THE DAY"
            description="Grab today’s top picks at special prices before the offer ends."
          />
          <Button asChild variant="outline" className="rounded-full px-5">
            <Link href="/shop/deals">View more</Link>
          </Button>
        </div>

        <Carousel opts={{ align: "start", loop: true }} className="mt-6 w-full">
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
