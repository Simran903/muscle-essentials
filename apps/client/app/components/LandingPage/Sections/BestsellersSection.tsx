"use client"

import { Card } from "@/app/components/Common/Card"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { SectionHeading } from "@/app/components/Common/SectionHeading"

import { Button } from "@/app/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/app/components/ui/carousel"

const bestSellerProducts = [
  {
    id: "1",
    slug: "muscleblaze-biozyme-performance-whey-4-4-lb",
    imageSrc: "https://img10.hkrtcdn.com/44105/bnr_4410499_o.jpg",
    imageAlt: "MuscleBlaze Biozyme Whey",
    title: "MuscleBlaze Biozyme Performance Whey, 4.4 lb",
    price: 5599,
    originalPrice: 6299,
    rating: 4.4,
  },
  {
    id: "2",
    slug: "nakpro-impact-whey-protein-2-2-lb-malai-kulfi",
    imageSrc: "https://img2.hkrtcdn.com/43582/bnr_4358161_o.jpg",
    imageAlt: "Nakpro Impact Whey",
    title: "Nakpro Impact Whey Protein, 2.2 lb Malai Kulfi",
    price: 1299,
    originalPrice: 2600,
    rating: 4.2,
  },
  {
    id: "3",
    slug: "ronnie-coleman-pro-antium-protein-2-lb",
    imageSrc: "https://img2.hkrtcdn.com/44106/bnr_4410581_o.jpg",
    imageAlt: "Ronnie Coleman Pro-Antium",
    title: "Ronnie Coleman Pro-Antium Protein, 2 lb",
    price: 2999,
    originalPrice: 4799,
    rating: 4.5,
  },
  {
    id: "4",
    slug: "as-it-is-nutrition-atom-whey-protein-with-enzymes",
    imageSrc: "https://img4.hkrtcdn.com/44106/bnr_4410503_o.jpg",
    imageAlt: "AS-IT-IS ATOM Whey Protein",
    title: "AS-IT-IS Nutrition ATOM Whey Protein with Enzymes",
    price: 2597,
    originalPrice: 4499,
    rating: 4.2,
  },
  {
    id: "5",
    slug: "muscleblaze-micronized-creatine-monohydrate-250-g",
    imageSrc: "https://img10.hkrtcdn.com/44105/bnr_4410499_o.jpg",
    imageAlt: "MuscleBlaze Creatine",
    title: "MuscleBlaze Micronized Creatine Monohydrate, 250 g",
    price: 899,
    originalPrice: 1299,
    rating: 4.6,
  },
  {
    id: "6",
    slug: "gnc-triple-strength-fish-oil-60-softgels",
    imageSrc: "https://img2.hkrtcdn.com/43582/bnr_4358161_o.jpg",
    imageAlt: "GNC Fish Oil",
    title: "GNC Triple Strength Fish Oil, 60 Softgels",
    price: 1099,
    originalPrice: 1699,
    rating: 4.3,
  },
  {
    id: "7",
    slug: "optimum-nutrition-gold-standard-100-whey-2-lb",
    imageSrc: "https://img2.hkrtcdn.com/44106/bnr_4410581_o.jpg",
    imageAlt: "ON Gold Standard Whey",
    title: "Optimum Nutrition Gold Standard 100% Whey, 2 lb",
    price: 3799,
    originalPrice: 4899,
    rating: 4.7,
  },
  {
    id: "8",
    slug: "nakpro-high-protein-peanut-butter-crunchy-1-kg",
    imageSrc: "https://img4.hkrtcdn.com/44106/bnr_4410503_o.jpg",
    imageAlt: "Nakpro Peanut Butter",
    title: "Nakpro High Protein Peanut Butter, Crunchy, 1 kg",
    price: 699,
    originalPrice: 899,
    rating: 4.1,
  },
  {
    id: "9",
    slug: "advanced-pre-workout-formula-fruit-blast-300-g",
    imageSrc: "https://img10.hkrtcdn.com/44105/bnr_4410499_o.jpg",
    imageAlt: "Pre Workout Powder",
    title: "Advanced Pre-Workout Formula, Fruit Blast, 300 g",
    price: 1499,
    originalPrice: 2199,
    rating: 4.4,
  },
  {
    id: "10",
    slug: "high-calorie-mass-gainer-chocolate-3-kg",
    imageSrc: "https://img2.hkrtcdn.com/43582/bnr_4358161_o.jpg",
    imageAlt: "Mass Gainer",
    title: "High Calorie Mass Gainer, Chocolate, 3 kg",
    price: 2199,
    originalPrice: 3199,
    rating: 4.2,
  },
]

export const BestsellersSection = () => {
  const router = useRouter()

  return (
    <section id="bestsellers" className="mx-auto w-full max-w-360 px-4 pt-12 pb-0">
      <div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            title="BEST SELLERS"
            description="Most-loved picks from athletes and everyday performers."
          />
          <Button asChild variant="outline" className="rounded-full px-5">
            <Link href="/shop/bestsellers">View more</Link>
          </Button>
        </div>

        <Carousel opts={{ align: "start", loop: true }} className="mt-6 w-full">
          <CarouselContent>
            {bestSellerProducts.map((product) => (
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
