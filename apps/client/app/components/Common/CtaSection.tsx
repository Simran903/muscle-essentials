"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { ArrowRight, Zap } from "lucide-react"

import { Button } from "@/app/components/ui/button"

const DEFAULT_DESCRIPTION =
  "Join thousands of customers who trust GEN 1 Nutrition for genuine supplements at honest prices. Your fitness goals start here."

export function CtaSection({ description = DEFAULT_DESCRIPTION }: { description?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: 0.05, ease: "easeOut" }}
    >
      <section className="mt-16 sm:mt-20">
        <div className="relative overflow-hidden rounded-3xl border border-primary/15 bg-linear-to-br from-primary/8 via-primary/5 to-transparent p-8 text-center shadow-sm sm:p-12 lg:p-16">
          <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(ellipse_at_top_right,var(--primary)_0%,transparent_70%)] opacity-[0.07]" />
          <div className="relative">
            <Zap className="mx-auto size-8 text-primary" aria-hidden />
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              BUY GEN1. BE GEN1.
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-muted-foreground">
              {description}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="rounded-xl shadow-sm">
                <Link href="/shop">
                  Browse supplements
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl">
                <Link href="/contact">Contact us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  )
}
