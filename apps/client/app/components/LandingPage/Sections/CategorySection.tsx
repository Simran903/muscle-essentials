"use client"

import Image from "next/image"
import Link from "next/link"
import React from "react"

import { Skeleton } from "@/app/components/ui/skeleton"
import { SectionHeading } from "@/app/components/Common/SectionHeading"
import { cn } from "@/lib/utils"

type CategoryTile = {
  id: string
  name: string
  slug: string
  discount: string
  title: string
  imageSrc: string
  imageAlt: string
}

const categoryTiles: CategoryTile[] = [
  { id: "1", name: "PROTEIN", slug: "protein", discount: "70%", title: "Protein category", imageSrc: "https://img10.hkrtcdn.com/44105/bnr_4410499_o.jpg", imageAlt: "Protein category" },
  { id: "2", name: "GAINER", slug: "gainer", discount: "55%", title: "Gainer category", imageSrc: "https://img2.hkrtcdn.com/43582/bnr_4358161_o.jpg", imageAlt: "Gainer category" },
  { id: "3", name: "FISH OIL", slug: "fish-oil", discount: "50%", title: "Fish oil category", imageSrc: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=80", imageAlt: "Fish oil category" },
  { id: "4", name: "CREATINE", slug: "creatine", discount: "60%", title: "Creatine category", imageSrc: "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?auto=format&fit=crop&w=1200&q=80", imageAlt: "Creatine category" },
  { id: "5", name: "EAA / BCAA", slug: "eaa-bcaa", discount: "60%", title: "EAA and BCAA category", imageSrc: "https://images.unsplash.com/photo-1610725664285-7c57e6eeac3f?auto=format&fit=crop&w=1200&q=80", imageAlt: "EAA and BCAA category" },
  { id: "6", name: "SNACKS", slug: "snacks", discount: "35%", title: "Snacks category", imageSrc: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1200&q=80", imageAlt: "Snacks category" },
  { id: "7", name: "T-BOOSTERS", slug: "t-boosters", discount: "50%", title: "Testosterone boosters category", imageSrc: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=1200&q=80", imageAlt: "Testosterone boosters category" },
  { id: "8", name: "PRE WORKOUT", slug: "pre-workout", discount: "60%", title: "Pre workout category", imageSrc: "https://images.unsplash.com/photo-1610725664285-7c57e6eeac3f?auto=format&fit=crop&w=1200&q=80", imageAlt: "Pre workout category" },
  { id: "9", name: "FAT BURNER", slug: "fat-burner", discount: "60%", title: "Fat burner category", imageSrc: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=1200&q=80", imageAlt: "Fat burner category" },
  { id: "10", name: "PEANUT BUTTER", slug: "peanut-butter", discount: "35%", title: "Peanut butter category", imageSrc: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=1200&q=80", imageAlt: "Peanut butter category" },
  { id: "11", name: "MULTIVITAMINS", slug: "multivitamins", discount: "55%", title: "Multivitamins category", imageSrc: "https://images.unsplash.com/photo-1620892604314-51750d76e6ec?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGl2aXRhbWluc3xlbnwwfHwwfHx8MA%3D%3D", imageAlt: "Multivitamins category" },
  { id: "12", name: "COLLAGEN", slug: "collagen", discount: "50%", title: "Collagen category", imageSrc: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1200&q=80", imageAlt: "Collagen category" },
]

function CategoryTileCard({ tile }: { tile: CategoryTile }) {
  const [imageLoaded, setImageLoaded] = React.useState(false)
  const href = `/shop?category=${tile.slug}`

  return (
    <Link
      href={href}
      className={cn(
        "group rounded-2xl border border-border/40 bg-card/60 p-2 shadow-sm transition-all duration-300 hover:shadow-card-hover hover:border-primary/20 hover:bg-primary/[0.02]",
      )}
      aria-label={tile.title}
    >
      <div className="overflow-hidden rounded-xl bg-background/50 dark:bg-black/15">
        {!imageLoaded && <Skeleton className="h-32 w-full rounded-xl" />}
        <Image
          src={tile.imageSrc}
          alt={tile.imageAlt}
          width={400}
          height={280}
          className={cn(
            "h-32 w-full object-cover transition-all duration-500",
            imageLoaded ? "opacity-100 group-hover:scale-105" : "opacity-0"
          )}
          onLoad={() => setImageLoaded(true)}
        />
      </div>
      <div className="px-1 pt-3 pb-1 text-center">
        <p className="text-base font-semibold tracking-tight text-foreground">
          {tile.name}
        </p>
        <p className="mt-0.5 text-xs font-medium text-muted-foreground">Up to {tile.discount} off</p>
      </div>
    </Link>
  )
}

export const CategorySection = () => {
  return (
    <section id="categories" className="mx-auto w-full max-w-360 px-5 sm:px-8">
      <div>
        <SectionHeading
          title="Shop by category"
          description="Quick entry points based on your goal, routine, or nutrient focus."
        />
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categoryTiles.map((tile) => (
            <CategoryTileCard key={tile.id} tile={tile} />
          ))}
        </div>
      </div>
    </section>
  )
}
