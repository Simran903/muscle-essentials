"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"

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

const comboProducts = [
  {
    id: "1",
    slug: "biozyme-whey-micronized-creatine-stack",
    imageSrc: "https://img10.hkrtcdn.com/44105/bnr_4410499_o.jpg",
    imageAlt: "Whey and creatine combo",
    title: "Biozyme Whey + Micronized Creatine Stack",
    price: 6499,
    originalPrice: 7999,
    rating: 4.6,
  },
  {
    id: "2",
    slug: "mass-gainer-natural-peanut-butter-combo",
    imageSrc: "https://img2.hkrtcdn.com/43582/bnr_4358161_o.jpg",
    imageAlt: "Mass gainer and peanut butter combo",
    title: "Mass Gainer + Natural Peanut Butter Combo",
    price: 2399,
    originalPrice: 3199,
    rating: 4.3,
  },
  {
    id: "3",
    slug: "pre-workout-eaa-recovery-combo-pack",
    imageSrc: "https://img2.hkrtcdn.com/44106/bnr_4410581_o.jpg",
    imageAlt: "Pre-workout and amino combo",
    title: "Pre-Workout + EAA Recovery Combo Pack",
    price: 2999,
    originalPrice: 3899,
    rating: 4.4,
  },
  {
    id: "4",
    slug: "multivitamin-fish-oil-daily-wellness-stack",
    imageSrc: "https://img4.hkrtcdn.com/44106/bnr_4410503_o.jpg",
    imageAlt: "Daily wellness combo",
    title: "Multivitamin + Fish Oil Daily Wellness Stack",
    price: 1799,
    originalPrice: 2499,
    rating: 4.2,
  },
]

export const CombosSection = () => {
  const router = useRouter()

  return (
    <section id="combos" className="mx-auto w-full max-w-360 px-5 sm:px-8">
      <div>
        <div className="flex flex-wrap items-end justify-between gap-5">
          <SectionHeading
            title="Bundle stacks"
            description="Power-packed stacks curated for muscle gain, recovery, and performance."
          />
          <Button asChild variant="outline" className="rounded-full px-6 shadow-none">
            <Link href="/shop?combo=1">View more</Link>
          </Button>
        </div>

        <Carousel opts={{ align: "start", loop: true }} className="mt-6 w-full">
          <CarouselContent>
            {comboProducts.map((product) => (
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
                  productSlug={product.slug}
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
