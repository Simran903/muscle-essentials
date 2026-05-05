"use client"

import * as React from "react"
import Image from "next/image"
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/app/components/ui/carousel"

export function CarouselComponent() {
  const [api, setApi] = React.useState<CarouselApi>()
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const [isPaused, setIsPaused] = React.useState(false)

  React.useEffect(() => {
    if (!api) return

    const autoplay = window.setInterval(() => {
      if (isPaused) return
      api.scrollNext()
    }, 3000)

    return () => window.clearInterval(autoplay)
  }, [api, isPaused])

  React.useEffect(() => {
    if (!api) return

    const onSelect = () => setSelectedIndex(api.selectedScrollSnap())
    onSelect()
    api.on("select", onSelect)

    return () => {
      api.off("select", onSelect)
    }
  }, [api])

  const slides = [
    {
      src: "https://img2.hkrtcdn.com/43582/bnr_4358161_o.jpg",
      alt: "A",
    },
    {
      src: "https://img4.hkrtcdn.com/44106/bnr_4410503_o.jpg",
      alt: "B",
    },
    {
      src: "https://img2.hkrtcdn.com/44106/bnr_4410581_o.jpg",
      alt: "C",
    },
    {
      src: "https://img2.hkrtcdn.com/44055/bnr_4405401_o.jpg",
      alt: "D",
    },
    {
      src: "https://img10.hkrtcdn.com/44105/bnr_4410499_o.jpg",
      alt: "E",
    },
  ]

  return (
    <Carousel
      setApi={setApi}
      opts={{ loop: true }}
      className="w-full"
    >
      <CarouselContent>
        {slides.map((slide, idx) => (
          <CarouselItem key={slide.src}>
            <div
              className="group relative overflow-hidden sm:mx-4 sm:rounded-3xl sm:border sm:border-border sm:bg-card sm:shadow-sm"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <Image
                src={slide.src}
                alt={slide.alt}
                width={1600}
                height={1040}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px"
                priority={idx === 0}
                className="h-80 w-full object-cover transition-transform duration-700 group-hover:scale-[1.03] sm:h-112 md:h-165"
              />

              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                <p className="max-w-[70%] text-sm font-medium text-white drop-shadow sm:text-base">
                  {slide.alt}
                </p>
                <div className="hidden items-center gap-1.5 sm:flex">
                  {slides.map((_, dotIndex) => (
                    <span
                      key={dotIndex}
                      className={
                        dotIndex === selectedIndex
                          ? "h-1.5 w-5 rounded-full bg-white/95"
                          : "h-1.5 w-1.5 rounded-full bg-white/50"
                      }
                    />
                  ))}
                </div>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-4 z-10 bg-background/90 shadow-sm backdrop-blur hover:bg-background sm:left-10" />
      <CarouselNext className="right-4 z-10 bg-background/90 shadow-sm backdrop-blur hover:bg-background sm:right-10" />
    </Carousel>
  )
}
