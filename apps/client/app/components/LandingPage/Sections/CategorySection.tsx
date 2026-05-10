"use client"

import Image from "next/image"
import React from "react"

import { Skeleton } from "@/app/components/ui/skeleton"
import { SectionHeading } from "@/app/components/Common/SectionHeading"
import { cn } from "@/lib/utils"

type CategoryTile = {
  id: string
  name: string
  discount: string
  title: string
  imageSrc: string
  imageAlt: string
  bgClassName: string
  borderClassName: string
}

const categoryTiles: CategoryTile[] = [
  {
    id: "1",
    name: "PROTEIN",
    discount: "70%",
    title: "Protein category",
    imageSrc: "https://img10.hkrtcdn.com/44105/bnr_4410499_o.jpg",
    imageAlt: "Protein category",
    bgClassName: "bg-sky-100/70 dark:bg-sky-500/15",
    borderClassName: "border-sky-200 dark:border-sky-500/40",
  },
  {
    id: "2",
    name: "GAINER",
    discount: "55%",
    title: "Gainer category",
    imageSrc: "https://img2.hkrtcdn.com/43582/bnr_4358161_o.jpg",
    imageAlt: "Gainer category",
    bgClassName: "bg-lime-100/70 dark:bg-lime-500/15",
    borderClassName: "border-lime-200 dark:border-lime-500/40",
  },
  {
    id: "3",
    name: "FISH OIL",
    discount: "50%",
    title: "Fish oil category",
    imageSrc: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Fish oil category",
    bgClassName: "bg-yellow-100/70 dark:bg-yellow-500/15",
    borderClassName: "border-yellow-200 dark:border-yellow-500/40",
  },
  {
    id: "4",
    name: "CREATINE",
    discount: "60%",
    title: "Creatine category",
    imageSrc: "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Creatine category",
    bgClassName: "bg-zinc-100/80 dark:bg-zinc-500/15",
    borderClassName: "border-zinc-200 dark:border-zinc-500/40",
  },
  {
    id: "5",
    name: "EAA / BCAA",
    discount: "60%",
    title: "EAA and BCAA category",
    imageSrc: "https://images.unsplash.com/photo-1610725664285-7c57e6eeac3f?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "EAA and BCAA category",
    bgClassName: "bg-amber-100/70 dark:bg-amber-500/15",
    borderClassName: "border-amber-200 dark:border-amber-500/40",
  },
  {
    id: "6",
    name: "SNACKS",
    discount: "35%",
    title: "Snacks category",
    imageSrc: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Snacks category",
    bgClassName: "bg-sky-100/70 dark:bg-sky-500/15",
    borderClassName: "border-sky-200 dark:border-sky-500/40",
  },
  {
    id: "7",
    name: "T-BOOSTERS",
    discount: "50%",
    title: "Testosterone boosters category",
    imageSrc: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Testosterone boosters category",
    bgClassName: "bg-orange-100/60 dark:bg-orange-500/15",
    borderClassName: "border-orange-200 dark:border-orange-500/40",
  },
  {
    id: "8",
    name: "PRE WORKOUT",
    discount: "60%",
    title: "Pre workout category",
    imageSrc: "https://images.unsplash.com/photo-1610725664285-7c57e6eeac3f?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Pre workout category",
    bgClassName: "bg-rose-100/70 dark:bg-rose-500/15",
    borderClassName: "border-rose-200 dark:border-rose-500/40",
  },
  {
    id: "9",
    name: "FAT BURNER",
    discount: "60%",
    title: "Fat burner category",
    imageSrc: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Fat burner category",
    bgClassName: "bg-sky-100/70 dark:bg-sky-500/15",
    borderClassName: "border-sky-200 dark:border-sky-500/40",
  },
  {
    id: "10",
    name: "PEANUT BUTTER",
    discount: "35%",
    title: "Peanut butter category",
    imageSrc: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Peanut butter category",
    bgClassName: "bg-yellow-100/70 dark:bg-yellow-500/15",
    borderClassName: "border-yellow-200 dark:border-yellow-500/40",
  },
  {
    id: "11",
    name: "MULTIVITAMINS",
    discount: "55%",
    title: "Multivitamins category",
    imageSrc: "https://images.unsplash.com/photo-1620892604314-51750d76e6ec?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGl2aXRhbWluc3xlbnwwfHwwfHx8MA%3D%3D",
    imageAlt: "Multivitamins category",
    bgClassName: "bg-violet-100/70 dark:bg-violet-500/15",
    borderClassName: "border-violet-200 dark:border-violet-500/40",
  },
  {
    id: "12",
    name: "COLLAGEN",
    discount: "50%",
    title: "Collagen category",
    imageSrc: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Collagen category",
    bgClassName: "bg-cyan-100/70 dark:bg-cyan-500/15",
    borderClassName: "border-cyan-200 dark:border-cyan-500/40",
  },
]

function CategoryTileCard({ tile }: { tile: CategoryTile }) {
  const [imageLoaded, setImageLoaded] = React.useState(false)

  return (
    <a
      href="#shop"
      className={cn(
        "group rounded-2xl border border-border/50 bg-card/70 p-2 shadow-none transition-[border-color,background-color] duration-200 hover:border-cyan-500/30 hover:bg-cyan-500/[0.04] dark:hover:border-cyan-400/35 dark:hover:bg-cyan-400/[0.06]",
      )}
      aria-label={tile.title}
    >
      <div className="overflow-hidden rounded-lg bg-background/70 dark:bg-black/20">
        {!imageLoaded && <Skeleton className="h-32 w-full rounded-lg" />}
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
      <div className="px-1 pt-2 pb-1 text-center">
        <p className="text-base font-bold tracking-tight text-foreground">
          {tile.name}
        </p>
        <p className="text-xs font-medium text-muted-foreground">Up to {tile.discount} off</p>
      </div>
    </a>
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
