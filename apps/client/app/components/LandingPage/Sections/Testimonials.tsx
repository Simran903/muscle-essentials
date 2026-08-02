"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { SectionHeading } from "@/app/components/Common/SectionHeading"
import { cn } from "@/lib/utils"

type Testimonial = {
  id: string
  quote: string
  name: string
  avatarSrc: string
}

const testimonials: Testimonial[] = [
  {
    id: "1",
    quote:
      "Quality is obvious the first time you open a tub — no chalky mix, labels match what's inside, and delivery was faster than my gym rest day.",
    name: "Rohan Mehta",
    avatarSrc:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: "2",
    quote:
      "Finally a store that doesn't make me second-guess authenticity. Stack recommendations actually match how I train.",
    name: "Ananya Krishnan",
    avatarSrc:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: "3",
    quote: "Clean checkout, transparent pricing, and support that replies like humans.",
    name: "Vikram Singh",
    avatarSrc:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: "4",
    quote:
      "I rotate between whey, creatine, and electrolytes every season — inventory here stays fresh and well stored.",
    name: "Priya Nambiar",
    avatarSrc:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: "5",
    quote:
      "It's incredibly easy to reorder staples. Even teammates who rarely shop online managed without hand-holding.",
    name: "Grace Hall",
    avatarSrc:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: "6",
    quote:
      "This crew treats supplements like performance gear — curated, no noise, and built for people who actually lift.",
    name: "Arjun Desai",
    avatarSrc:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: "7",
    quote:
      "From pre-workout to recovery aminos, everything feels vetted. That trust is worth more than a coupon code.",
    name: "Meera Iyer",
    avatarSrc:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
  },
]

const rowOne = testimonials.filter((_, i) => i % 2 === 0)
const rowTwo = testimonials.filter((_, i) => i % 2 === 1)

const MIN_CARDS_PER_HALF = 16

function buildHalfStrip(items: Testimonial[]): Testimonial[] {
  if (items.length === 0) return []
  const count = Math.max(MIN_CARDS_PER_HALF, items.length * 2)
  return Array.from({ length: count }, (_, i) => items[i % items.length])
}

function buildSeamlessLoop(items: Testimonial[]): Testimonial[] {
  const half = buildHalfStrip(items)
  return [...half, ...half]
}

function TestimonialCard({
  quote,
  name,
  avatarSrc,
  className,
}: Omit<Testimonial, "id"> & { className?: string }) {
  return (
    <article
      className={cn(
        "flex h-full min-h-48 w-[min(20rem,calc(100vw-4rem))] shrink-0 flex-col justify-between gap-5 rounded-2xl border border-border/30 bg-card/80 p-5 shadow-sm backdrop-blur-sm sm:min-h-52 sm:w-80 sm:p-6",
        className
      )}
    >
      <p className="line-clamp-4 text-sm leading-relaxed text-foreground sm:text-base">{quote}</p>
      <div className="flex items-center gap-3 border-t border-border/30 pt-4">
        <Image
          src={avatarSrc}
          alt={`Portrait of ${name}`}
          width={40}
          height={40}
          className="size-10 shrink-0 rounded-full object-cover ring-2 ring-primary/15"
        />
        <div className="min-w-0">
          <p className="truncate font-semibold text-foreground">{name}</p>
        </div>
      </div>
    </article>
  )
}

function TestimonialMarqueeRow({
  items,
  durationSec,
  reverse,
}: {
  items: Testimonial[]
  durationSec: number
  reverse?: boolean
}) {
  const [paused, setPaused] = useState(false)
  const loop = useMemo(() => buildSeamlessLoop(items), [items])

  return (
    <div
      className="relative overflow-hidden py-1"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      <div
        className={cn(
          "testimonial-marquee-inner flex w-max gap-4 will-change-transform"
        )}
        style={{
          animationName: "testimonial-marquee",
          animationDuration: `${durationSec}s`,
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
          animationDirection: reverse ? "reverse" : "normal",
          animationFillMode: "none",
          animationPlayState: paused ? "paused" : "running",
        }}
      >
        {loop.map((t, i) => (
          <TestimonialCard
            key={`marquee-${i}-${t.id}`}
            quote={t.quote}
            name={t.name}
            avatarSrc={t.avatarSrc}
          />
        ))}
      </div>
    </div>
  )
}

export const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="w-full overflow-hidden">
      <div className="mx-auto w-full max-w-360 px-5 sm:px-8">
        <SectionHeading
          title="What customers say"
          description="Everyone refuels with our stack — except the people who don&apos;t. (We&apos;re still convinced they&apos;ll come around.)"
        />
      </div>

      <div className="relative mt-6">
        <div className="relative z-0 flex flex-col gap-5">
          <TestimonialMarqueeRow items={rowOne} durationSec={80} />
          <TestimonialMarqueeRow items={rowTwo} durationSec={90} reverse />
        </div>

        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-20 w-40 bg-background mask-[linear-gradient(to_right,rgba(255,255,255,1)_0%,rgba(255,255,255,0.92)_18%,rgba(255,255,255,0.45)_52%,rgba(255,255,255,0)_100%)] [-webkit-mask-image:linear-gradient(to_right,rgba(255,255,255,1)_0%,rgba(255,255,255,0.92)_18%,rgba(255,255,255,0.45)_52%,rgba(255,255,255,0)_100%)] sm:w-52 md:w-72 lg:w-80"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-20 w-40 bg-background mask-[linear-gradient(to_left,rgba(255,255,255,1)_0%,rgba(255,255,255,0.92)_18%,rgba(255,255,255,0.45)_52%,rgba(255,255,255,0)_100%)] [-webkit-mask-image:linear-gradient(to_left,rgba(255,255,255,1)_0%,rgba(255,255,255,0.92)_18%,rgba(255,255,255,0.45)_52%,rgba(255,255,255,0)_100%)] sm:w-52 md:w-72 lg:w-80"
          aria-hidden
        />
      </div>
    </section>
  )
}
