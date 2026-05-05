"use client"

import Image from "next/image"
import Link from "next/link"
import React from "react"

import { SectionHeading } from "@/app/components/Common/SectionHeading"
import { Skeleton } from "@/app/components/ui/skeleton"
import { BentoGrid, BentoGridItem } from "@/app/components/ui/bento-grid"
import { cn } from "@/lib/utils"

type BrandTile = {
  id: string
  name: string
  image: string
  bgClassName: string
  borderClassName: string
  className?: string
}

const brands: BrandTile[] = [
  {
    id: "1",
    name: "MuscleBlaze",
    image:
      "https://images.unsplash.com/photo-1545231027-637d2f6210f8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bG9nb3xlbnwwfHwwfHx8MA%3D%3D",
    bgClassName: "bg-sky-100/70",
    borderClassName: "border-sky-200",
  },
  {
    id: "2",
    name: "Optimum Nutrition",
    image:
      "https://images.unsplash.com/photo-1545231027-637d2f6210f8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bG9nb3xlbnwwfHwwfHx8MA%3D%3D",
    bgClassName: "bg-lime-100/70",
    borderClassName: "border-lime-200",
  },
  {
    id: "3",
    name: "AS-IT-IS",
    image:
      "https://images.unsplash.com/photo-1545231027-637d2f6210f8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bG9nb3xlbnwwfHwwfHx8MA%3D%3D",
    bgClassName: "bg-yellow-100/70",
    borderClassName: "border-yellow-200",
  },
  {
    id: "4",
    name: "Nakpro",
    image:
      "https://images.unsplash.com/photo-1545231027-637d2f6210f8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bG9nb3xlbnwwfHwwfHx8MA%3D%3D",
    bgClassName: "bg-zinc-100/80",
    borderClassName: "border-zinc-200",
    className: "md:col-span-2 xl:col-span-3",
  },
  {
    id: "5",
    name: "GNC",
    image:
      "https://images.unsplash.com/photo-1545231027-637d2f6210f8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bG9nb3xlbnwwfHwwfHx8MA%3D%3D",
    bgClassName: "bg-amber-100/70",
    borderClassName: "border-amber-200",
  },
  {
    id: "6",
    name: "Ronnie Coleman",
    image:
      "https://images.unsplash.com/photo-1545231027-637d2f6210f8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bG9nb3xlbnwwfHwwfHx8MA%3D%3D",
    bgClassName: "bg-rose-100/70",
    borderClassName: "border-rose-200",
    className: "md:col-span-2 xl:col-span-3",
  },
  {
    id: "7",
    name: "MuscleTech",
    image:
      "https://images.unsplash.com/photo-1545231027-637d2f6210f8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bG9nb3xlbnwwfHwwfHx8MA%3D%3D",
    bgClassName: "bg-violet-100/70",
    borderClassName: "border-violet-200",
  },
  {
    id: "8",
    name: "Dymatize",
    image:
      "https://images.unsplash.com/photo-1545231027-637d2f6210f8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bG9nb3xlbnwwfHwwfHx8MA%3D%3D",
    bgClassName: "bg-cyan-100/70",
    borderClassName: "border-cyan-200",
    className: "md:col-span-2 xl:col-span-1",
  },
  {
    id: "9",
    name: "BPI Sports",
    image:
      "https://images.unsplash.com/photo-1545231027-637d2f6210f8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bG9nb3xlbnwwfHwwfHx8MA%3D%3D",
    bgClassName: "bg-orange-100/70",
    borderClassName: "border-orange-200",
    className: "md:col-span-2 xl:col-span-2",
  },
  {
    id: "10",
    name: "Isopure",
    image:
      "https://images.unsplash.com/photo-1545231027-637d2f6210f8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bG9nb3xlbnwwfHwwfHx8MA%3D%3D",
    bgClassName: "bg-fuchsia-100/70",
    borderClassName: "border-fuchsia-200",
  },
  {
    id: "11",
    name: "Rule 1",
    image:
      "https://images.unsplash.com/photo-1545231027-637d2f6210f8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bG9nb3xlbnwwfHwwfHx8MA%3D%3D",
    bgClassName: "bg-indigo-100/70",
    borderClassName: "border-indigo-200",
    className: "md:col-span-2 xl:col-span-1",
  },
  {
    id: "12",
    name: "Universal Nutrition",
    image:
      "https://images.unsplash.com/photo-1545231027-637d2f6210f8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bG9nb3xlbnwwfHwwfHx8MA%3D%3D",
    bgClassName: "bg-teal-100/70",
    borderClassName: "border-teal-200",
    className: "md:col-span-2 xl:col-span-2",
  },
]

function BrandHeader({ tile }: { tile: BrandTile }) {
  const [imageLoaded, setImageLoaded] = React.useState(false)

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border bg-background/70 dark:bg-black/20",
        tile.borderClassName
      )}
    >
      {!imageLoaded && <Skeleton className="h-42 w-full rounded-lg" />}
      <Image
        src={tile.image}
        alt={tile.name}
        width={400}
        height={280}
        className={cn(
          "h-42 w-full object-cover transition-all duration-500 group-hover/bento:scale-105",
          imageLoaded ? "opacity-100" : "opacity-0"
        )}
        onLoad={() => setImageLoaded(true)}
      />
    </div>
  )
}

export const BrandSection = () => {
  return (
    <section id="brands" className="mx-auto w-full max-w-360 px-4 py-12">
      <div>
        <SectionHeading
          title="SHOP BY BRAND"
          description="Explore trusted supplement brands and discover their best-selling products."
        />

        <BentoGrid className="mt-6 max-w-none grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 md:auto-rows-[minmax(16rem,auto)]">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href="#shop"
              className="contents"
              aria-label={`${brand.name} brand`}
            >
              <BentoGridItem
                className={cn(
                  "h-full cursor-pointer transition-transform hover:-translate-y-0.5",
                  brand.bgClassName,
                  brand.borderClassName,
                  brand.className
                )}
                header={<BrandHeader tile={brand} />}
                title={brand.name}
              />
            </Link>
          ))}
        </BentoGrid>
      </div>
    </section>
  )
}
