"use client"

import * as React from "react"
import { Star } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/app/components/ui/button"
import { InputField } from "@/app/components/Common/InputField"
import { cn } from "@/lib/utils"
import { submitProductReview } from "@/lib/api"
import { getAccessToken } from "@/lib/auth-storage"

const BODY_MAX = 5000
const TITLE_MAX = 200

type ProductReviewFormProps = {
  productSlug: string
  requiresFlavour?: boolean
  requiresSize?: boolean
  variantId?: string | null
  flavourLabel?: string
  sizeLabel?: string
  onSubmitted?: () => void
  onCancel?: () => void
}

function StarPicker({
  value,
  onChange,
}: {
  value: number
  onChange: (next: number) => void
}) {
  const [hover, setHover] = React.useState<number | null>(null)
  const display = hover ?? value

  return (
    <div
      className="inline-flex items-center gap-1"
      role="radiogroup"
      aria-label="Rating"
      onMouseLeave={() => setHover(null)}
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= display
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} ${n === 1 ? "star" : "stars"}`}
            onClick={() => onChange(n)}
            onMouseEnter={() => setHover(n)}
            onFocus={() => setHover(n)}
            onBlur={() => setHover(null)}
            className="rounded-lg p-1 text-amber-500 transition-all outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 dark:text-amber-400"
          >
            <Star
              className={cn(
                "size-7 shrink-0 transition-all duration-200",
                filled ? "fill-current scale-110" : "fill-transparent opacity-40",
              )}
              strokeWidth={filled ? 0 : 1.5}
            />
          </button>
        )
      })}
      <span className="ml-2 text-sm text-muted-foreground tabular-nums">
        {value > 0 ? `${value} / 5` : "Select a rating"}
      </span>
    </div>
  )
}

export function ProductReviewForm({
  productSlug,
  requiresFlavour = false,
  requiresSize = false,
  variantId = null,
  flavourLabel = "",
  sizeLabel = "",
  onSubmitted,
  onCancel,
}: ProductReviewFormProps) {
  const [token, setToken] = React.useState<string | null>(null)
  const [authChecked, setAuthChecked] = React.useState(false)
  const [rating, setRating] = React.useState(0)
  const [title, setTitle] = React.useState("")
  const [body, setBody] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)
  const [submitted, setSubmitted] = React.useState(false)
  const [duplicate, setDuplicate] = React.useState(false)
  const [notPurchased, setNotPurchased] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const flavourOk = !requiresFlavour || flavourLabel.length > 0
  const sizeOk = !requiresSize || sizeLabel.length > 0
  const productHasVariants = requiresFlavour || requiresSize
  const variantOk = flavourOk && sizeOk && (!productHasVariants || variantId != null)
  const variantBits = [flavourLabel, sizeLabel].filter(Boolean)
  const variantSummary = variantBits.join(" · ")

  React.useEffect(() => {
    const sync = () => {
      setToken(getAccessToken())
      setAuthChecked(true)
    }
    sync()
    window.addEventListener("auth:force-check", sync)
    return () => window.removeEventListener("auth:force-check", sync)
  }, [])

  const currentVariantKey = variantId ?? `${flavourLabel}//${sizeLabel}`
  const [trackedVariant, setTrackedVariant] = React.useState(currentVariantKey)
  if (trackedVariant !== currentVariantKey) {
    setTrackedVariant(currentVariantKey)
    setDuplicate(false)
    setNotPurchased(false)
    setError(null)
    setSubmitted(false)
  }

  if (!authChecked) {
    return (
      <div className="rounded-xl border border-border/30 bg-card/60 p-5 text-sm text-muted-foreground backdrop-blur-sm">
        Loading…
      </div>
    )
  }

  if (!token) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/30 bg-card/60 p-5 backdrop-blur-sm">
        <p className="text-sm text-muted-foreground">
          Sign in to share your experience with this product.
        </p>
        {onCancel ? (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Close
          </Button>
        ) : null}
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-primary/20 bg-primary/8 p-5 text-primary backdrop-blur-sm dark:border-primary/20 dark:bg-primary/8 dark:text-primary">
        <div className="space-y-1">
          <p className="text-sm font-semibold">Thanks for the review!</p>
          <p className="text-sm opacity-80">
            We&apos;ll publish it after our team has approved it.
          </p>
        </div>
        {onCancel ? (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Close
          </Button>
        ) : null}
      </div>
    )
  }

  const trimmedTitle = title.trim()
  const trimmedBody = body.trim()
  const bodyRemaining = BODY_MAX - trimmedBody.length
  const titleTooLong = trimmedTitle.length > TITLE_MAX
  const bodyTooLong = trimmedBody.length > BODY_MAX
  const canSubmit =
    rating > 0 && variantOk && !titleTooLong && !bodyTooLong && !submitting

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    setDuplicate(false)
    setNotPurchased(false)
    try {
      const active = getAccessToken()
      if (!active) {
        setToken(null)
        return
      }
      const result = await submitProductReview(active, productSlug, {
        rating,
        title: trimmedTitle.length > 0 ? trimmedTitle : undefined,
        body: trimmedBody.length > 0 ? trimmedBody : undefined,
        variantId: variantId ?? undefined,
        flavourLabel: requiresFlavour ? flavourLabel : undefined,
        sizeLabel: requiresSize ? sizeLabel : undefined,
      })
      if (result.ok) {
        setSubmitted(true)
        setRating(0)
        setTitle("")
        setBody("")
        toast.success("Review submitted for approval.")
        onSubmitted?.()
        return
      }
      if (result.reason === "auth") {
        setToken(null)
        toast.error("Please sign in again to submit your review.")
        return
      }
      if (result.reason === "duplicate") {
        setDuplicate(true)
        return
      }
      if (result.reason === "not-purchased") {
        setNotPurchased(true)
        return
      }
      setError(result.message ?? "Unable to submit review. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (duplicate) {
    return (
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-amber-500/20 bg-amber-500/8 p-5 text-amber-900 backdrop-blur-sm dark:border-amber-400/20 dark:bg-amber-400/8 dark:text-amber-200">
        <div className="space-y-1">
          <p className="text-sm font-semibold">
            You&apos;ve already reviewed {variantSummary ? `${variantSummary}` : "this variant"}
          </p>
          <p className="text-sm opacity-80">
            Each customer can post one review per variant. Switch to a different flavour or size above to review another, or contact support to update an existing review.
          </p>
        </div>
        {onCancel ? (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Close
          </Button>
        ) : null}
      </div>
    )
  }

  if (notPurchased) {
    return (
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-amber-500/20 bg-amber-500/8 p-5 text-amber-900 backdrop-blur-sm dark:border-amber-400/20 dark:bg-amber-400/8 dark:text-amber-200">
        <div className="space-y-1">
          <p className="text-sm font-semibold">
            Purchase {variantSummary ? variantSummary : "this variant"} to leave a review
          </p>
          <p className="text-sm opacity-80">
            Reviews are limited to verified buyers. Once your order for this exact flavour and size is placed, you&apos;ll be able to share your experience.
          </p>
        </div>
        {onCancel ? (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Close
          </Button>
        ) : null}
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-xl border border-border/30 bg-card/50 p-5 shadow-sm backdrop-blur-sm sm:p-6"
      noValidate
    >
      {requiresFlavour || requiresSize ? (
        variantOk ? (
          <div className="rounded-lg border border-border/40 bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
            Reviewing{" "}
            <span className="font-medium text-foreground">{variantSummary}</span>
          </div>
        ) : (
          <div
            role="alert"
            className="rounded-lg border border-amber-500/20 bg-amber-500/8 px-3 py-2 text-sm text-amber-900 dark:border-amber-400/20 dark:bg-amber-400/8 dark:text-amber-200"
          >
            Choose a {requiresFlavour && !flavourOk ? "flavour" : null}
            {requiresFlavour && !flavourOk && requiresSize && !sizeOk ? " and " : null}
            {requiresSize && !sizeOk ? "size" : null}{" "}
            above before writing a review.
          </div>
        )
      ) : null}

      <div className="space-y-2">
        <p className="text-sm font-semibold text-foreground">Your rating</p>
        <StarPicker value={rating} onChange={setRating} />
      </div>

      <div className="space-y-2">
        <label htmlFor="review-title" className="text-sm font-semibold text-foreground">
          Headline
          <span className="ml-1 font-normal text-muted-foreground">(optional)</span>
        </label>
        <InputField
          id="review-title"
          name="title"
          placeholder="Sum it up in a sentence"
          maxLength={TITLE_MAX}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={submitting}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="review-body" className="text-sm font-semibold text-foreground">
          What stood out?
          <span className="ml-1 font-normal text-muted-foreground">(optional)</span>
        </label>
        <textarea
          id="review-body"
          name="body"
          rows={5}
          placeholder="Share how the product worked for you, mixability, taste, results — anything that would help other shoppers."
          maxLength={BODY_MAX}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          disabled={submitting}
          className={cn(
            "flex w-full resize-y rounded-xl border border-input/70 bg-background px-3 py-2 text-sm leading-6 text-foreground shadow-sm transition-all outline-none",
            "placeholder:text-muted-foreground/70",
            "focus-visible:border-primary/45 focus-visible:ring-2 focus-visible:ring-primary/15",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        />
        <p
          className={cn(
            "text-xs tabular-nums",
            bodyTooLong ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {bodyRemaining.toLocaleString("en-IN")} characters remaining
        </p>
      </div>

      {error ? (
        <p className="rounded-lg border border-destructive/20 bg-destructive/8 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <p className="text-xs text-muted-foreground">
        Reviews are moderated and appear publicly once approved by our team.
      </p>

      <div className="flex flex-wrap items-center justify-end gap-2">
        {onCancel ? (
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </Button>
        ) : null}
        <Button
          type="submit"
          variant="default"
          size="lg"
          disabled={!canSubmit}
        >
          {submitting ? "Submitting…" : "Submit review"}
        </Button>
      </div>
    </form>
  )
}
