"use client"

import React from "react"
import { motion } from "motion/react"
import Image from "next/image"
// import { SectionHeading } from "@/app/components/Common/SectionHeading"

import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  // CarouselNext,
  // CarouselPrevious,
} from "@/app/components/ui/carousel"

const popularBrands = [
  { name: "All Brands", logoSrc: "/brands/all-brands.png" },
  { name: "Nuts 'N More", logoSrc: "/brands/nuts-n-more.png" },
  { name: "HealthFarm", logoSrc: "/brands/healthfarm.png" },
  { name: "MyFitness", logoSrc: "/brands/myfitness.png" },
  { name: "MuscleBlaze", logoSrc: "/brands/muscleblaze.png" },
  { name: "Atom", logoSrc: "/brands/atom.png" },
  { name: "MuscleTech", logoSrc: "/brands/muscletech.png" },
  { name: "Optimum Nutrition", logoSrc: "/brands/optimum-nutrition.png" },
  { name: "GNC", logoSrc: "/brands/gnc.png" },
  { name: "Ronnie Coleman", logoSrc: "/brands/ronnie-coleman.png" },
  { name: "Dymatize", logoSrc: "/brands/dymatize.png" },
  { name: "BPI Sports", logoSrc: "/brands/bpi-sports.png" },
  { name: "Isopure", logoSrc: "/brands/isopure.png" },
  { name: "Rule 1", logoSrc: "/brands/rule1.png" },
  { name: "Universal Nutrition", logoSrc: "/brands/universal-nutrition.png" },
  { name: "Labrada", logoSrc: "/brands/labrada.png" },
  { name: "Ultimate Nutrition", logoSrc: "/brands/ultimate-nutrition.png" },
  { name: "Gaspari", logoSrc: "/brands/gaspari.png" },
]

export function BrandCarousel() {
  const [api, setApi] = React.useState<CarouselApi>()
  const [isPaused, setIsPaused] = React.useState(false)

  React.useEffect(() => {
    if (!api) return

    const autoplay = window.setInterval(() => {
      if (isPaused) return
      api.scrollNext()
    }, 500)

    return () => window.clearInterval(autoplay)
  }, [api, isPaused])

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.3 }}
      className="mx-auto w-full max-w-360 px-5 sm:px-8"
    >
      {/* <SectionHeading title="POPULAR BRANDS" /> */}
      <Carousel
        setApi={setApi}
        opts={{ align: "start", loop: true }}
        className="mt-4 w-full"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <CarouselContent>
          {popularBrands.map((brand) => (
            <CarouselItem
              key={brand.name}
              className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/6"
            >
              <div className="flex h-18 items-center justify-center rounded-2xl border border-border/50 bg-card/60 px-3 shadow-none transition-colors hover:border-cyan-500/20 hover:bg-cyan-500/[0.04] dark:hover:border-cyan-400/25">
                <Image
                  src={brand.logoSrc}
                  alt={brand.name}
                  width={120}
                  height={40}
                  className="h-10 w-auto object-contain"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {/* <CarouselPrevious />
        <CarouselNext /> */}
      </Carousel>
    </motion.section>
  )
}
