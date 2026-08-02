"use client"

import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { X, Zap } from "lucide-react"

import { type ProductItem } from "@/lib/api"

type ProductImage = ProductItem["images"][number]
const HIDE_NAVBAR_CLASS = "image-viewer-open"

type ProductGalleryProps = {
  images: ProductImage[]
  productTitle: string
  isDealOfTheDay: boolean
}

export function ProductGallery({
  images,
  productTitle,
  isDealOfTheDay,
}: ProductGalleryProps) {
  const initialImageId = images.find((image) => image.isPrimary)?.id ?? images[0]?.id
  const [selectedImageId, setSelectedImageId] = useState(initialImageId)
  const [isViewerOpen, setIsViewerOpen] = useState(false)

  const selectedImage = useMemo(
    () => images.find((image) => image.id === selectedImageId) ?? images[0],
    [images, selectedImageId]
  )

  useEffect(() => {
    if (!isViewerOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsViewerOpen(false)
    }

    document.addEventListener("keydown", handleKeyDown)
    document.body.style.overflow = "hidden"
    document.body.classList.add(HIDE_NAVBAR_CLASS)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
      document.body.classList.remove(HIDE_NAVBAR_CLASS)
    }
  }, [isViewerOpen])

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-border/30 bg-card/60 p-2 shadow-sm backdrop-blur-sm sm:p-3">
        <button
          type="button"
          onClick={() => selectedImage && setIsViewerOpen(true)}
          disabled={!selectedImage}
          className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted/20 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 disabled:cursor-default"
        >
          {selectedImage ? (
            <Image
              key={selectedImage.id}
              src={selectedImage.url}
              alt={selectedImage.altText ?? productTitle}
              fill
              priority
              className="object-cover transition-transform duration-500 hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 55vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No Image Available
            </div>
          )}

          {isDealOfTheDay && (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground shadow-sm">
              <Zap className="size-3.5" />
              Deal of the Day
            </span>
          )}
        </button>
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
          {images.map((image) => {
            const isSelected = image.id === selectedImage?.id

            return (
              <button
                key={image.id}
                type="button"
                aria-label={`View ${image.altText ?? productTitle}`}
                aria-pressed={isSelected}
                onClick={() => setSelectedImageId(image.id)}
                className={`relative aspect-square overflow-hidden rounded-xl border bg-card shadow-none transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 ${
                  isSelected
                    ? "border-primary/50 ring-1 ring-primary/20 shadow-elevated"
                    : "border-border/40 hover:border-primary/30 hover:shadow-sm"
                }`}
              >
                <Image
                  src={image.url}
                  alt={image.altText ?? productTitle}
                  fill
                  className="object-cover"
                  sizes="120px"
                />
              </button>
            )
          })}
        </div>
      )}

      {isViewerOpen && selectedImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Full view of ${selectedImage.altText ?? productTitle}`}
          className="fixed inset-0 z-120 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
          onClick={() => setIsViewerOpen(false)}
        >
          <button
            type="button"
            aria-label="Close full image view"
            onClick={() => setIsViewerOpen(false)}
            className="absolute right-4 top-4 z-10 inline-flex size-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            <X className="size-5" />
          </button>

          <div
            className="relative h-full max-h-[92vh] w-full max-w-6xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={selectedImage.url}
              alt={selectedImage.altText ?? productTitle}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>
        </div>
      )}
    </div>
  )
}
