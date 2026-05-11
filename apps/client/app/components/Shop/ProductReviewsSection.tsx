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
    createdAt: "2026-05-05T12:00:00.000Z",
    user: { id: "demo-user-1", name: "Arjun M." },
  },
  {
    id: "demo-2",
    rating: 4,
    title: "Solid quality",
    body: "Does what it says on the label. Would buy again during the next sale.",
    createdAt: "2026-04-22T12:00:00.000Z",
    user: { id: "demo-user-2", name: "Priya K." },
  },
  {
    id: "demo-3",
    rating: 5,
    title: null,
    body: "Been using this for a month — happy with results and packaging.",
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

type ProductReviewsSectionProps = {
  productSlug: string
  reviews: ProductReviewItem[]
}

export function ProductReviewsSection({ productSlug, reviews }: ProductReviewsSectionProps) {
  const showingDevDemo =
    process.env.NODE_ENV === "development" && reviews.length === 0

  const displayReviews = showingDevDemo ? DEMO_REVIEWS : reviews

  const count = displayReviews.length
  const average =
    count > 0 ? Math.round((displayReviews.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10 : null

  const [isWriting, setIsWriting] = React.useState(false)

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
            onCancel={() => setIsWriting(false)}
          />
        </div>
      ) : null}

      {count === 0 ? (
        <p className="mt-6 text-base leading-7 text-muted-foreground">
          No reviews yet. Be the first to share how this product worked for you — reviews appear here once approved.
        </p>
      ) : (
        <ul className="mt-8 space-y-6">
          {displayReviews.map((review) => (
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
              <p className="mt-3 text-xs text-muted-foreground">— {reviewerLabel(review)}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
