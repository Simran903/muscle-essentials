"use client"

import { Card } from "@/app/components/Common/Card"
import { SectionHeading } from "@/app/components/Common/SectionHeading"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/app/components/ui/carousel"

const featuredProducts = [
  {
    id: "1",
    imageSrc: "https://img10.hkrtcdn.com/44105/bnr_4410499_o.jpg",
    imageAlt: "Performance nutrition supplements",
    title: "Performance Nutrition — whey, creatine & pre-workout picks",
    price: 3499,
    originalPrice: 4499,
    rating: 4.6,
    className: "max-w-none rounded-2xl",
  },
  {
    id: "2",
    imageSrc: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Recovery essentials",
    title: "Recovery Essentials — aminos, hydration & sleep support",
    price: 1899,
    originalPrice: 2499,
    rating: 4.5,
    className: "max-w-none rounded-2xl",
  },
  {
    id: "3",
    imageSrc: "https://img2.hkrtcdn.com/43582/bnr_4358161_o.jpg",
    imageAlt: "Goal-based supplement stacks",
    title: "Goal-Based Combos — stacks for strength, lean gain & fat loss",
    price: 5299,
    originalPrice: 6999,
    rating: 4.4,
    className: "max-w-none rounded-2xl",
  },
  {
    id: "4",
    imageSrc: "https://images.unsplash.com/photo-1545231027-637d2f6210f8?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Trusted supplement brands",
    title: "Authentic Brands Only — transparent labels & quality sourcing",
    price: 2799,
    originalPrice: 3599,
    rating: 4.7,
    className: "max-w-none rounded-2xl",
  },
]

export const FeaturedSection = () => {
  return (
    <section id="featured" className="mx-auto w-full max-w-360 px-4 pb-12 pt-6 sm:pt-8">
      <SectionHeading
        title="FEATURED PRODUCTS"
        description="Explore curated picks and benefits tailored to your fitness goals."
      />
      <div className="mt-6">
        <Carousel
          opts={{ align: "start", loop: true }}
          className="w-full sm:hidden"
        >
          <CarouselContent>
            {featuredProducts.map((product) => (
              <CarouselItem key={product.id} className="basis-[85%]">
                <Card
                  imageSrc={product.imageSrc}
                  imageAlt={product.imageAlt}
                  title={product.title}
                  price={product.price}
                  originalPrice={product.originalPrice}
                  rating={product.rating}
                  className={product.className}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>

        <div className="hidden gap-6 sm:grid sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <Card
              key={product.id}
              imageSrc={product.imageSrc}
              imageAlt={product.imageAlt}
              title={product.title}
              price={product.price}
              originalPrice={product.originalPrice}
              rating={product.rating}
              className={product.className}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
