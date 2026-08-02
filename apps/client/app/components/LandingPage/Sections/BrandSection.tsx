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
  slug: string
  image: string
  className?: string
}

const brands: BrandTile[] = [
  { id: "1", name: "MuscleBlaze", slug: "muscleblaze", image: "https://images.unsplash.com/photo-1545231027-637d2f6210f8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bG9nb3xlbnwwfHwwfHx8MA%3D%3D" },
  { id: "2", name: "Optimum Nutrition", slug: "optimum-nutrition", image: "https://images.unsplash.com/photo-1545231027-637d2f6210f8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bG9nb3xlbnwwfHwwfHx8MA%3D%3D" },
  { id: "3", name: "AS-IT-IS", slug: "as-it-is", image: "https://images.unsplash.com/photo-1545231027-637d2f6210f8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bG9nb3xlbnwwfHwwfHx8MA%3D%3D" },
  { id: "4", name: "Nakpro", slug: "nakpro", image: "https://images.unsplash.com/photo-1545231027-637d2f6210f8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bG9nb3xlbnwwfHwwfHx8MA%3D%3D", className: "md:col-span-2 xl:col-span-3" },
  { id: "5", name: "GNC", slug: "gnc", image: "https://images.unsplash.com/photo-1545231027-637d2f6210f8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bG9nb3xlbnwwfHwwfHx8MA%3D%3D" },
  { id: "6", name: "Ronnie Coleman", slug: "ronnie-coleman", image: "https://images.unsplash.com/photo-1545231027-637d2f6210f8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bG9nb3xlbnwwfHwwfHx8MA%3D%3D", className: "md:col-span-2 xl:col-span-3" },
  { id: "7", name: "MuscleTech", slug: "muscletech", image: "https://images.unsplash.com/photo-1545231027-637d2f6210f8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bG9nb3xlbnwwfHwwfHx8MA%3D%3D" },
  { id: "8", name: "Dymatize", slug: "dymatize", image: "https://images.unsplash.com/photo-1545231027-637d2f6210f8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bG9nb3xlbnwwfHwwfHx8MA%3D%3D", className: "md:col-span-2 xl:col-span-1" },
  { id: "9", name: "BPI Sports", slug: "bpi-sports", image: "https://images.unsplash.com/photo-1545231027-637d2f6210f8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bG9nb3xlbnwwfHwwfHx8MA%3D%3D", className: "md:col-span-2 xl:col-span-2" },
  { id: "10", name: "Isopure", slug: "isopure", image: "https://images.unsplash.com/photo-1545231027-637d2f6210f8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bG9nb3xlbnwwfHwwfHx8MA%3D%3D" },
  { id: "11", name: "Rule 1", slug: "rule-1", image: "https://images.unsplash.com/photo-1545231027-637d2f6210f8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bG9nb3xlbnwwfHwwfHx8MA%3D%3D", className: "md:col-span-2 xl:col-span-1" },
  { id: "12", name: "Universal Nutrition", slug: "universal-nutrition", image: "https://images.unsplash.com/photo-1545231027-637d2f6210f8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bG9nb3xlbnwwfHwwfHx8MA%3D%3D", className: "md:col-span-2 xl:col-span-2" },
]

function BrandHeader({ tile }: { tile: BrandTile }) {
  const [imageLoaded, setImageLoaded] = React.useState(false)

  return (
    <div className="overflow-hidden rounded-xl border border-border/30 bg-muted/15">
      {!imageLoaded && <Skeleton className="h-42 w-full rounded-xl" />}
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
    <section id="brands" className="mx-auto w-full max-w-360 px-5 sm:px-8">
      <div>
        <SectionHeading
          title="Shop by brand"
          description="Explore trusted supplement brands and discover their best-selling products."
        />

        <BentoGrid className="mt-6 max-w-none grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 md:auto-rows-[minmax(16rem,auto)]">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/shop?brand=${brand.slug}`}
              className="contents"
              aria-label={`${brand.name} brand`}
            >
              <BentoGridItem
                className={cn(
                  "h-full cursor-pointer border-border/40 bg-card/60 shadow-sm transition-all duration-300 hover:shadow-card-hover hover:border-foreground/10 hover:bg-muted/20",
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
