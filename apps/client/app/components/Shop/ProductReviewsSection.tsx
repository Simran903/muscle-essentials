"use client"

import * as React from "react"
import { PenSquare, Star } from "lucide-react"

import { Button } from "@/app/components/ui/button"
import type { ProductReviewItem } from "@/lib/api"

import { ProductReviewForm } from "./ProductReviewForm"

/** Shown only in development when the API returns no reviews, so the PDP layout can be previewed. */
const DEMO_REVIEWS: ProductReviewItem[] = [
  {
    id: "demo-1",
    rating: 5,
    title: "Great mixability and taste",
    body: "Blends smooth with water, no gritty texture. Chocolate flavour is rich without being too sweet. Delivery was quick.",
    variantId: "demo-variant-1",
    flavourLabel: "",
    sizeLabel: "",
    createdAt: "2026-05-05T12:00:00.000Z",
    user: { id: "demo-user-1", name: "Arjun M." },
  },
  {
    id: "demo-2",
    rating: 4,
    title: "Solid quality",
    body: "Does what it says on the label. Would buy again during the next sale.",
    variantId: "demo-variant-1",
    flavourLabel: "",
    sizeLabel: "",
    createdAt: "2026-04-22T12:00:00.000Z",
    user: { id: "demo-user-2", name: "Priya K." },
  },
  {
    id: "demo-3",
    rating: 5,
    title: null,
    body: "Been using this for a month — happy with results and packaging.",
    variantId: "demo-variant-1",
    flavourLabel: "",
    sizeLabel: "",
    createdAt: "2026-03-31T12:00:00.000Z",
    user: { id: "demo-user-3", name: null },
  },
]

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const

/** UTC-based label so SSR and the browser always match (avoids hydration issues from `toLocaleDateString`). */
function formatReviewDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return `${MONTHS_SHORT[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`
}

function StarRating({ value }: { value: number }) {
  return (
    <div
      className="flex gap-0.5 text-amber-500 dark:text-amber-400"
      aria-label={`${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`size-4 shrink-0 ${n <= value ? "fill-current" : "fill-transparent opacity-35"}`}
          strokeWidth={n <= value ? 0 : 1.5}
        />
      ))}
    </div>
  )
}

function reviewerLabel(review: ProductReviewItem): string {
  const n = review.user.name?.trim()
  if (n) return n
  return "Verified customer"
}

function variantBits(review: ProductReviewItem): string[] {
  return [review.flavourLabel, review.sizeLabel].filter(
    (s): s is string => typeof s === "string" && s.length > 0,
  )
}

type ProductReviewsSectionProps = {
  productSlug: string
  reviews: ProductReviewItem[]
  productHasFlavours: boolean
  productHasSizes: boolean
  /** Variant id that the PDP picker resolved to, or null while the user is still choosing. */
  selectedVariantId: string | null
  selectedFlavourLabel: string
  selectedSizeLabel: string
}

export function ProductReviewsSection({
  productSlug,
  reviews,
  productHasFlavours,
  productHasSizes,
  selectedVariantId,
  selectedFlavourLabel,
  selectedSizeLabel,
}: ProductReviewsSectionProps) {
  const showingDevDemo =
    process.env.NODE_ENV === "development" && reviews.length === 0

  const allReviews = showingDevDemo ? DEMO_REVIEWS : reviews

  const flavourResolved = !productHasFlavours || selectedFlavourLabel.length > 0
  const sizeResolved = !productHasSizes || selectedSizeLabel.length > 0
  const variantResolved =
    flavourResolved && sizeResolved && selectedVariantId !== null

  // When the picker has resolved to a real variant id we narrow to that
  // variant's reviews. Until then (or when the dev demo is on) we keep the
  // full list so first paint isn't empty.
  const displayReviews = React.useMemo(() => {
    if (showingDevDemo || !variantResolved) return allReviews
    return allReviews.filter((r) => r.variantId === selectedVariantId)
  }, [allReviews, showingDevDemo, variantResolved, selectedVariantId])

  const count = displayReviews.length
  const average =
    count > 0 ? Math.round((displayReviews.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10 : null

  const [isWriting, setIsWriting] = React.useState(false)

  const selectedBits = [selectedFlavourLabel, selectedSizeLabel].filter(Boolean)
  const variantSummary = selectedBits.length ? selectedBits.join(" · ") : null

  // Render the per-review variant chip only when reviews vary across variants
  // (avoids visual noise on products with a single variant).
  const showVariantChip = React.useMemo(() => {
    const seen = new Set<string>()
    for (const r of allReviews) {
      if (!r.variantId) continue
      seen.add(r.variantId)
      if (seen.size > 1) return true
    }
    return false
  }, [allReviews])

  return (
    <section className="mt-10 rounded-2xl border border-border/50 bg-card/80 p-6 shadow-none backdrop-blur-sm sm:p-8 lg:p-10">
      {showingDevDemo ? (
        <p className="mb-6 rounded-lg border border-dashed border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:border-amber-400/35 dark:bg-amber-400/10 dark:text-amber-100">
          <span className="font-medium">Development preview:</span> sample reviews are shown because this product has
          none in the database. Production visitors only see real approved reviews.
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Reviews
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            What customers say
          </h2>
          {variantSummary ? (
            <p className="mt-1 text-sm text-muted-foreground">
              Showing reviews for <span className="font-medium text-foreground">{variantSummary}</span>
            </p>
          ) : productHasFlavours || productHasSizes ? (
            <p className="mt-1 text-sm text-muted-foreground">
              Pick a flavour and size above to see reviews for that specific variant.
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {average !== null ? (
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-2 tabular-nums">
                <span className="text-2xl font-semibold text-foreground">{average}</span>
                <StarRating value={Math.round(average)} />
              </span>
              <span className="text-muted-foreground">
                Based on {count} {count === 1 ? "review" : "reviews"}
              </span>
            </div>
          ) : null}
          {!isWriting ? (
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setIsWriting(true)}
              className="rounded-md"
            >
              <PenSquare className="size-4" />
              Write a review
            </Button>
          ) : null}
        </div>
      </div>

      {isWriting ? (
        <div className="mt-6">
          <ProductReviewForm
            productSlug={productSlug}
            requiresFlavour={productHasFlavours}
            requiresSize={productHasSizes}
            variantId={selectedVariantId}
            flavourLabel={selectedFlavourLabel}
            sizeLabel={selectedSizeLabel}
            onCancel={() => setIsWriting(false)}
          />
        </div>
      ) : null}

      {count === 0 ? (
        <p className="mt-6 text-base leading-7 text-muted-foreground">
          {variantResolved && (productHasFlavours || productHasSizes)
            ? "No reviews yet for this variant. Be the first to share how it worked for you — reviews appear here once approved."
            : "No reviews yet. Be the first to share how this product worked for you — reviews appear here once approved."}
        </p>
      ) : (
        <ul className="mt-8 space-y-6">
          {displayReviews.map((review) => {
            const bits = variantBits(review)
            return (
              <li
                key={review.id}
                className="border-b border-border/40 pb-6 last:border-0 last:pb-0"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-2">
                    <StarRating value={review.rating} />
                    {review.title ? (
                      <p className="font-medium text-foreground">{review.title}</p>
                    ) : null}
                  </div>
                  <time
                    className="shrink-0 text-xs text-muted-foreground"
                    dateTime={review.createdAt}
                  >
                    {formatReviewDate(review.createdAt)}
                  </time>
                </div>
                {review.body ? (
                  <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted-foreground">
                    {review.body}
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>— {reviewerLabel(review)}</span>
                  {showVariantChip && bits.length > 0 ? (
                    <span className="inline-flex items-center rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[0.7rem] font-medium text-muted-foreground">
                      {bits.join(" · ")}
                    </span>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
