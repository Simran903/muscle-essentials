"use client"

import Link from "next/link"

import { Card } from "@/app/components/Common/Card"
import { SectionHeading } from "@/app/components/Common/SectionHeading"
import { Button } from "@/app/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/app/components/ui/carousel"

const dealOfTheDayProducts = [
  {
    id: "1",
    imageSrc: "https://img10.hkrtcdn.com/44105/bnr_4410499_o.jpg",
    imageAlt: "Whey protein daily deal",
    title: "MuscleBlaze Biozyme Whey Protein - Deal of the Day",
    price: 4399,
    originalPrice: 6299,
    rating: 4.5,
  },
  {
    id: "2",
    imageSrc: "https://img2.hkrtcdn.com/43582/bnr_4358161_o.jpg",
    imageAlt: "Creatine daily deal",
    title: "Micronized Creatine Monohydrate - Limited Day Offer",
    price: 799,
    originalPrice: 1299,
    rating: 4.4,
  },
  {
    id: "3",
    imageSrc: "https://img2.hkrtcdn.com/44106/bnr_4410581_o.jpg",
    imageAlt: "Pre-workout daily deal",
    title: "Pre-Workout Performance Formula - Flash Price",
    price: 1399,
    originalPrice: 2199,
    rating: 4.3,
  },
  {
    id: "4",
    imageSrc: "https://img4.hkrtcdn.com/44106/bnr_4410503_o.jpg",
    imageAlt: "Fish oil daily deal",
    title: "Triple Strength Fish Oil Softgels - Today Only",
    price: 699,
    originalPrice: 1199,
    rating: 4.2,
  },
]

export const DealoftheDaySection = () => {
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
            {dealOfTheDayProducts.map((product) => (
              <CarouselItem
                key={product.id}
                className="basis-[85%] sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
              >
                <Card
                  imageSrc={product.imageSrc}
                  imageAlt={product.imageAlt}
                  title={product.title}
                  price={product.price}
                  originalPrice={product.originalPrice}
                  rating={product.rating}
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
