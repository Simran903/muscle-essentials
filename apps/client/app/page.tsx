"use client"

import React from "react"
import { AnimatePresence, motion } from "motion/react"
import LandingPage, {
  LandingMainSkeleton,
} from "@/app/components/LandingPage/LandingPage"

const SPLASH_DURATION_MS = 1000
const SPLASH_SEEN_KEY = "muscle-essentials-splash-seen"

const HomePage = () => {
  const [showSplash, setShowSplash] = React.useState<boolean | null>(null)

  React.useEffect(() => {
    const hasSeenSplash = window.localStorage.getItem(SPLASH_SEEN_KEY) === "true"
    let timeout: number | undefined

    if (hasSeenSplash) {
      const frame = window.requestAnimationFrame(() => {
        setShowSplash(false)
      })
      return () => window.cancelAnimationFrame(frame)
    }

    const frame = window.requestAnimationFrame(() => {
      setShowSplash(true)
      timeout = window.setTimeout(() => {
        window.localStorage.setItem(SPLASH_SEEN_KEY, "true")
        setShowSplash(false)
      }, SPLASH_DURATION_MS)
    })

    return () => {
      window.cancelAnimationFrame(frame)
      if (timeout) window.clearTimeout(timeout)
    }
  }, [])

  if (showSplash === null) {
    return (
      <div className="min-h-screen bg-background">
        <LandingMainSkeleton />
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      {showSplash ? (
        <motion.section
          key="splash-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.55, ease: "easeInOut" } }}
          className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background"
          aria-label="Loading website"
        >
          <motion.div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.92_0.06_198/0.32),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.32_0.08_210/0.28),transparent)]"
            aria-hidden
          />
          <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Muscle Essentials
              </h1>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">Loading your experience</p>
            </motion.div>
            <div className="flex items-center gap-1.5" aria-hidden>
              {[0, 1, 2].map((dot) => (
                <motion.span
                  key={dot}
                  className="h-1 w-1 rounded-full bg-cyan-500/50 dark:bg-cyan-400/55"
                  animate={{ opacity: [0.35, 1, 0.35] }}
                  transition={{ duration: 1.1, repeat: Infinity, delay: dot * 0.15 }}
                />
              ))}
            </div>
          </div>
        </motion.section>
      ) : (
        <motion.div
          key="landing-page"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <LandingPage />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default HomePage