"use client"

import * as React from "react"
import { PackageCheck, ShieldCheck, Truck } from "lucide-react"

import { ProductGallery } from "@/app/components/Shop/ProductGallery"
import { ProductPurchasePanel } from "@/app/components/Shop/ProductPurchasePanel"
import { DietTypeSymbol } from "@/app/components/Common/DietTypeSymbol"
import {
  effectiveVariantFlags,
  resolveVariantId,
  type ProductItem,
  type ProductReviewItem,
} from "@/lib/api"
import { pageMainClassName } from "@/lib/page-layout"

import { ProductReviewsSection } from "../../components/Shop/ProductReviewsSection"

type ProductShopExperienceProps = {
  product: ProductItem
  reviews: ProductReviewItem[]
}

export function ProductShopExperience({ product, reviews }: ProductShopExperienceProps) {
  const images = React.useMemo(
    () => [...product.images].sort((a, b) => a.sortOrder - b.sortOrder),
    [product.images],
  )
  const isInStock = product.stockQuantity > 0

  const presetLabels = React.useMemo(() => {
    const flavourLabel =
      (product.flavours?.length ?? 0) === 1 ? product.flavours![0]!.label : ""
    const sizeLabel = (product.sizes?.length ?? 0) === 1 ? product.sizes![0]!.label : ""
    return { flavourLabel, sizeLabel }
  }, [product.flavours, product.sizes])

  const [merch, setMerch] = React.useState(() =>
    effectiveVariantFlags(product, presetLabels.flavourLabel, presetLabels.sizeLabel),
  )

  const [selection, setSelection] = React.useState<{
    variantId: string | null
    flavourLabel: string
    sizeLabel: string
  }>(() => ({
    variantId: resolveVariantId(
      product,
      presetLabels.flavourLabel,
      presetLabels.sizeLabel,
    ),
    flavourLabel: presetLabels.flavourLabel,
    sizeLabel: presetLabels.sizeLabel,
  }))

  const onResolvedSelection = React.useCallback(
    (sel: {
      variantId: string | null
      flavourLabel: string
      sizeLabel: string
    }) => {
      setSelection(sel)
      setMerch(effectiveVariantFlags(product, sel.flavourLabel, sel.sizeLabel))
    },
    [product],
  )

  return (
    <main className={pageMainClassName({ maxWidth: "7xl", className: "overflow-hidden" })}>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)] lg:gap-10">
        <ProductGallery
          images={images}
          productTitle={product.title}
          isDealOfTheDay={merch.isDealoftheDay}
        />

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border/20 bg-card/50 p-5 text-card-foreground shadow-sm backdrop-blur-sm sm:p-6 lg:p-8">
            <div className="mb-4 flex flex-wrap gap-2">
              {merch.isFeatured && (
                <span className="rounded-lg border border-primary/20 bg-primary/8 px-3 py-1 text-xs font-medium text-foreground">
                  Featured
                </span>
              )}

              {merch.isBestseller && (
                <span className="rounded-lg border border-primary/20 bg-primary/8 px-3 py-1 text-xs font-semibold text-primary">
                  Bestseller
                </span>
              )}

              <span className="inline-flex items-center gap-2 rounded-lg border border-border/40 bg-muted/20 px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm">
                <DietTypeSymbol dietType={product.dietType} size={22} />
                {product.dietType === "VEG" ? "Vegetarian" : "Non-vegetarian"}
              </span>

              <span
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-1 text-xs font-semibold shadow-sm ${
                  isInStock
                    ? "border border-emerald-500/20 bg-emerald-500/8 text-emerald-700 dark:text-emerald-300"
                    : "border border-red-500/20 bg-red-500/8 text-red-700 dark:text-red-300"
                }`}
              >
                <span
                  className={`size-2 rounded-full ${isInStock ? "bg-emerald-500" : "bg-red-500"}`}
                />
                {isInStock ? "In Stock" : "Out of Stock"}
              </span>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">
                {product.brand?.name ?? "GEN1 NUTRITION"}
              </p>

              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-[2.8rem] lg:leading-tight">
                {product.title}
              </h1>

              {product.shortDesc && (
                <p className="text-base leading-7 text-muted-foreground">{product.shortDesc}</p>
              )}
            </div>

            <ProductPurchasePanel
              productId={product.id}
              productTitle={product.title}
              flavours={product.flavours}
              sizes={product.sizes}
              variants={product.variants ?? []}
              isInStock={isInStock}
              stockQuantity={product.stockQuantity}
              onResolvedSelection={onResolvedSelection}
            />

            <div className="mt-6 grid gap-3 border-t border-border/30 pt-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-3">
                <Truck className="size-5 text-muted-foreground/70" />
                Fast delivery across India
              </div>

              <div className="flex items-center gap-3">
                <ShieldCheck className="size-5 text-muted-foreground/70" />
                Genuine supplements, curated for quality
              </div>

              <div className="flex items-center gap-3">
                <PackageCheck className="size-5 text-muted-foreground/70" />
                Packed and shipped with care
              </div>
            </div>
          </div>
        </aside>
      </section>

      {product.description && (
        <section className="mt-10 rounded-2xl border border-border/20 bg-card/50 p-6 shadow-sm backdrop-blur-sm sm:p-8 lg:p-10">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Details
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Product Description
            </h2>

            <p className="mt-4 whitespace-pre-line text-base leading-8 text-muted-foreground">
              {product.description}
            </p>
          </div>
        </section>
      )}

      <ProductReviewsSection
        productSlug={product.slug}
        reviews={reviews}
        productHasFlavours={(product.flavours?.length ?? 0) > 0}
        productHasSizes={(product.sizes?.length ?? 0) > 0}
        selectedVariantId={selection.variantId}
        selectedFlavourLabel={selection.flavourLabel}
        selectedSizeLabel={selection.sizeLabel}
      />
    </main>
  )
}
