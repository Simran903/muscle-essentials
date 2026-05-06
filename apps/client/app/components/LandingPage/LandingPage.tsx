"use client"

import React from "react"
import { motion } from "motion/react"
import { Skeleton } from "@/app/components/ui/skeleton"
import { CarouselComponent } from "./Carousel/Carousel"
import { FeaturedSection } from "./Sections/FeaturedSection"
import { BestsellersSection } from "./Sections/BestsellersSection"
import { CombosSection } from "./Sections/CombosSection"
import { DealoftheDaySection } from "./Sections/DealoftheDaySection"
import { CategorySection } from "./Sections/CategorySection"
import { BrandSection } from "./Sections/BrandSection"
import { FAQSection } from "./Sections/FAQSection"
import { TestimonialsSection } from "./Sections/Testimonials"
import { ThemeFloatingToggle } from "./ThemeFloatingToggle"
import { BrandCarousel } from "./Carousel/BrandCarousel"
import { Footer } from "./Footer/Footer"

function SectionBlockSkeleton({
  withCtaRow,
  cardCount = 4,
}: {
  withCtaRow?: boolean
  cardCount?: number
}) {
  return (
    <div className="mx-auto w-full max-w-360 px-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 sm:h-10 sm:w-64" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        {withCtaRow ? <Skeleton className="h-9 w-28 rounded-full" /> : null}
      </div>
      <div className="mt-6 flex gap-4 overflow-hidden">
        {Array.from({ length: cardCount }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-72 w-[85%] shrink-0 rounded-2xl sm:h-80 sm:w-[calc(50%-0.5rem)] lg:w-[calc(25%-0.75rem)]"
          />
        ))}
      </div>
    </div>
  )
}

export function LandingMainSkeleton() {
  return (
    <main
      className="flex w-full flex-col gap-10 pt-4 pb-24 sm:gap-12 sm:pb-16"
      aria-busy="true"
      aria-label="Loading page content"
    >
      <div className="mx-auto w-full max-w-360 px-4 sm:px-4">
        <Skeleton className="h-80 w-full rounded-none sm:rounded-3xl sm:h-112 md:h-165" />
      </div>

      <div className="mx-auto w-full max-w-360 px-4">
        <div className="flex gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-18 w-28 shrink-0 rounded-xl" />
          ))}
        </div>
      </div>

      <SectionBlockSkeleton withCtaRow cardCount={4} />
      <SectionBlockSkeleton withCtaRow cardCount={5} />
      <SectionBlockSkeleton cardCount={4} />

      <div className="mx-auto w-full max-w-360 px-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56 sm:h-10 sm:w-72" />
          <Skeleton className="h-4 w-full max-w-lg" />
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="aspect-4/5 w-full rounded-xl" />
          ))}
        </div>
      </div>

      <SectionBlockSkeleton withCtaRow cardCount={4} />

      <div className="mx-auto w-full max-w-360 px-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 sm:h-10 sm:w-56" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        <div className="mt-6 grid grid-cols-2 auto-rows-fr gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton
              key={i}
              className={i % 5 === 0 ? "min-h-48 rounded-xl md:col-span-2" : "min-h-40 rounded-xl"}
            />
          ))}
        </div>
      </div>

      <div className="mx-auto w-full max-w-360 px-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-full max-w-md sm:h-10" />
          <Skeleton className="h-4 w-full max-w-lg" />
        </div>
        <div className="mt-6 flex flex-col gap-5">
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-72 shrink-0 rounded-2xl sm:h-52 sm:w-80" />
            ))}
          </div>
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-72 shrink-0 rounded-2xl sm:h-52 sm:w-80" />
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-360 px-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32 sm:h-10 sm:w-40" />
          <Skeleton className="h-4 w-full max-w-lg" />
        </div>
        <div className="mt-6 rounded-xl border border-border p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="border-b border-border py-3 last:border-b-0">
              <Skeleton className="h-5 w-full max-w-xl" />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

const LandingPage = () => {
  React.useEffect(() => {
    window.dispatchEvent(new Event("auth:force-check"))
  }, [])

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <main className="flex w-full flex-1 flex-col pb-24 sm:pb-16">
        <motion.div
          className="py-4 pb-8"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.25 }}
        >
          <CarouselComponent />
        </motion.div>
          <BrandCarousel />
        <motion.div
          className="py-10"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.06, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <DealoftheDaySection />
        </motion.div>
        <motion.div
          className="py-10"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <BestsellersSection />
        </motion.div>
        <motion.div
          className="py-10"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <FeaturedSection />
        </motion.div>
        <motion.div
          className="py-10"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.12, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <CategorySection />
        </motion.div>
        <motion.div
          className="py-10"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.14, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <CombosSection />
        </motion.div>
        <motion.div
          className="py-10"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.16, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <BrandSection />
        </motion.div>
        <motion.div
          className="py-10"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.18, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <TestimonialsSection />
        </motion.div>
        <motion.div
          className="py-10"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <FAQSection />
        </motion.div>
      </main>
      <Footer />
      <ThemeFloatingToggle />
    </div>
  )
}

export default LandingPage
