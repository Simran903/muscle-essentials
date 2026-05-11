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
  /** Called after a successful submission so the parent can collapse the form, etc. */
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
            className="rounded-md p-1 text-amber-500 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 dark:text-amber-400"
          >
            <Star
              className={cn(
                "size-7 shrink-0 transition-transform",
                filled ? "fill-current" : "fill-transparent opacity-40",
                value === n && "scale-105",
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
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const sync = () => {
      setToken(getAccessToken())
      setAuthChecked(true)
    }
    sync()
    window.addEventListener("auth:force-check", sync)
    return () => window.removeEventListener("auth:force-check", sync)
  }, [])

  if (!authChecked) {
    return (
      <div className="rounded-xl border border-border/50 bg-card/60 p-5 text-sm text-muted-foreground">
        Loading…
      </div>
    )
  }

  if (!token) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/50 bg-card/60 p-5">
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
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-emerald-900 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-100">
        <div className="space-y-1">
          <p className="text-sm font-semibold">Thanks for the review!</p>
          <p className="text-sm opacity-90">
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
  const canSubmit = rating > 0 && !titleTooLong && !bodyTooLong && !submitting

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    setDuplicate(false)
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
      setError(result.message ?? "Unable to submit review. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (duplicate) {
    return (
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-amber-500/35 bg-amber-500/10 p-5 text-amber-950 dark:border-amber-400/35 dark:bg-amber-400/10 dark:text-amber-100">
        <div className="space-y-1">
          <p className="text-sm font-semibold">You&apos;ve already reviewed this product</p>
          <p className="text-sm opacity-90">
            Each customer can only post one review per product. Reach out to support if you&apos;d like to update yours.
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
      className="space-y-5 rounded-xl border border-border/50 bg-card/60 p-5 sm:p-6"
      noValidate
    >
      <div className="space-y-2">
        <p className="text-sm font-semibold text-foreground">Your rating</p>
        <StarPicker value={rating} onChange={setRating} />
      </div>

      <div className="space-y-2">
        <label htmlFor="review-title" className="text-sm font-semibold text-foreground">
          Headline
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
            "flex w-full resize-y rounded-xl border border-input/80 bg-background px-3 py-2 text-sm leading-6 text-foreground shadow-none transition-[border-color,box-shadow] outline-none",
            "placeholder:text-muted-foreground",
            "focus-visible:border-cyan-500/45 focus-visible:ring-2 focus-visible:ring-cyan-500/15",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "dark:focus-visible:border-cyan-400/50 dark:focus-visible:ring-cyan-400/12",
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
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
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
          className="rounded-md shadow-none"
        >
          {submitting ? "Submitting…" : "Submit review"}
        </Button>
      </div>
    </form>
  )
}
