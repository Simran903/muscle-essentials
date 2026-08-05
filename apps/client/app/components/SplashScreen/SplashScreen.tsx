"use client"

import { motion, useReducedMotion } from "motion/react"
import { useTheme } from "@/app/components/theme-provider"

export const SPLASH_DURATION_MS = 2800

const TAGLINE = "Premium performance nutrition"
const SUBMARK = "NUTRITION"

const D = SPLASH_DURATION_MS
const DELAY = {
  emblem: 0.08 * D,
  emblemInner: 0.2 * D,
  wordmark: 0.34 * D,
  rule: 0.58 * D,
  submark: 0.66 * D,
  tagline: 0.74 * D,
}

type SplashPalette = {
  bg: string
  vignette: string
  accent: string
  accentSoft: string
  accentFaint: string
  text: string
  textMuted: string
  rule: string
  progressTrack: string
  gridDot: string
}

const DARK: SplashPalette = {
  bg: "#080908",
  vignette: "rgba(0,0,0,0.5)",
  accent: "#9CD400",
  accentSoft: "rgba(156,212,0,0.45)",
  accentFaint: "rgba(156,212,0,0.12)",
  text: "#F5F7F3",
  textMuted: "rgba(245,247,243,0.5)",
  rule: "rgba(156,212,0,0.65)",
  progressTrack: "rgba(255,255,255,0.08)",
  gridDot: "rgba(255,255,255,0.06)",
}

const LIGHT: SplashPalette = {
  bg: "#F6F7F3",
  vignette: "rgba(40,58,0,0.12)",
  accent: "#7FA300",
  accentSoft: "rgba(156,212,0,0.5)",
  accentFaint: "rgba(156,212,0,0.16)",
  text: "#14170E",
  textMuted: "rgba(20,23,14,0.5)",
  rule: "#8AB300",
  progressTrack: "rgba(20,23,14,0.08)",
  gridDot: "rgba(20,23,14,0.06)",
}

const PALETTES: Record<"light" | "dark", SplashPalette> = {
  light: LIGHT,
  dark: DARK,
}

const easeOutExpo: [number, number, number, number] = [0.22, 1, 0.36, 1]

const HEX_OUTER = "M 120 32 L 196.2 76 L 196.2 164 L 120 208 L 43.8 164 L 43.8 76 Z"
const HEX_INNER = "M 120 68 L 165 94 L 165 146 L 120 172 L 75 146 L 75 94 Z"

export const SplashScreen = () => {
  const reduced = useReducedMotion() ?? false
  const { theme } = useTheme()
  const p = PALETTES[theme]

  return (
    <motion.section
      key="splash-screen"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } }}
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
      style={{ backgroundColor: p.bg }}
      aria-label="Loading website"
    >
      <SplashBackground palette={p} />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-8 px-6 text-center">
        <motion.div
          className="relative aspect-square w-[min(28vh,190px)]"
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={
            reduced
              ? { duration: 0.3 }
              : { duration: 0.8, delay: DELAY.emblem / 1000, ease: easeOutExpo }
          }
        >
          <Emblem palette={p} reduced={reduced} />
        </motion.div>

        <div className="flex flex-col items-center gap-5">
          <motion.h1
            initial={reduced ? { opacity: 0 } : { opacity: 0, letterSpacing: "0.55em", filter: "blur(6px)" }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, letterSpacing: "0.2em", filter: "blur(0px)" }}
            transition={
              reduced
                ? { duration: 0.3, delay: 0.1 }
                : { duration: 0.9, delay: DELAY.wordmark / 1000, ease: easeOutExpo }
            }
            className="text-5xl font-extrabold leading-none sm:text-6xl"
            style={{ color: p.text }}
          >
            GEN1
          </motion.h1>

          <motion.div
            className="h-px w-16"
            style={{ backgroundColor: p.rule }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={
              reduced
                ? { duration: 0.2, delay: 0.2 }
                : { duration: 0.6, delay: DELAY.rule / 1000, ease: "easeOut" }
            }
          />

          <motion.p
            className="text-[11px] font-medium uppercase tracking-[0.55em]"
            style={{ color: p.textMuted }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              reduced
                ? { duration: 0.2, delay: 0.25 }
                : { duration: 0.5, delay: DELAY.submark / 1000, ease: "easeOut" }
            }
          >
            {SUBMARK}
          </motion.p>

          <motion.p
            className="mt-3 text-sm tracking-[0.08em]"
            style={{ color: p.textMuted }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={
              reduced
                ? { duration: 0.2, delay: 0.3 }
                : { duration: 0.5, delay: DELAY.tagline / 1000, ease: "easeOut" }
            }
          >
            {TAGLINE}
          </motion.p>
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-30"
        style={{
          background: `radial-gradient(130% 110% at 50% 10%, transparent 55%, ${p.vignette})`,
        }}
        aria-hidden
      />

      <GlowProgress palette={p} />
    </motion.section>
  )
}

const SplashBackground = ({ palette }: { palette: SplashPalette }) => (
  <div className="absolute inset-0" aria-hidden>
    <motion.div
      className="absolute inset-0"
      style={{
        background: `radial-gradient(circle at 50% 42%, ${palette.accentFaint}, transparent 62%)`,
      }}
      animate={{ opacity: [0.75, 1, 0.75] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    />
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: `radial-gradient(${palette.gridDot} 1px, transparent 1px)`,
        backgroundSize: "26px 26px",
        maskImage: "radial-gradient(circle at 50% 45%, black, transparent 72%)",
        WebkitMaskImage: "radial-gradient(circle at 50% 45%, black, transparent 72%)",
      }}
    />
  </div>
)

const Emblem = ({ palette, reduced }: { palette: SplashPalette; reduced: boolean }) => (
  <svg viewBox="0 0 240 240" className="h-full w-full" aria-hidden>
    <defs>
      <linearGradient id="hex-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={palette.accent} />
        <stop offset="100%" stopColor={palette.accent} stopOpacity="0.3" />
      </linearGradient>
      <radialGradient id="emblem-glow" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stopColor={palette.accent} stopOpacity="0.22" />
        <stop offset="100%" stopColor={palette.accent} stopOpacity="0" />
      </radialGradient>
    </defs>

    <motion.circle
      cx="120"
      cy="120"
      r="120"
      fill="url(#emblem-glow)"
      initial={{ opacity: 0 }}
      animate={reduced ? { opacity: 1 } : { opacity: [0, 1, 0.55] }}
      transition={
        reduced
          ? { duration: 0.2 }
          : { duration: 2.2, delay: DELAY.emblem / 1000, ease: "easeOut" }
      }
    />

    <motion.path
      d={HEX_OUTER}
      fill="none"
      stroke={palette.accent}
      strokeWidth="1.5"
      strokeLinejoin="round"
      initial={reduced ? { opacity: 0.8 } : { pathLength: 0, opacity: 0 }}
      animate={reduced ? { opacity: 1 } : { pathLength: 1, opacity: 1 }}
      transition={
        reduced
          ? { duration: 0.3 }
          : {
              pathLength: {
                duration: 1.1,
                delay: DELAY.emblem / 1000,
                ease: "easeInOut",
              },
              opacity: { duration: 0.4, delay: DELAY.emblem / 1000 },
            }
      }
    />

    <motion.path
      d={HEX_INNER}
      fill="none"
      stroke={palette.accent}
      strokeOpacity="0.5"
      strokeWidth="1"
      strokeLinejoin="round"
      initial={reduced ? { opacity: 0.5 } : { pathLength: 0, opacity: 0 }}
      animate={reduced ? { opacity: 1 } : { pathLength: 1, opacity: 1 }}
      transition={
        reduced
          ? { duration: 0.3 }
          : {
              pathLength: {
                duration: 1,
                delay: DELAY.emblemInner / 1000,
                ease: "easeInOut",
              },
              opacity: { duration: 0.4, delay: DELAY.emblemInner / 1000 },
            }
      }
    />

    <motion.g
      stroke={palette.accent}
      strokeLinecap="round"
      fill="none"
      initial={reduced ? { opacity: 0.8 } : { opacity: 0 }}
      animate={reduced ? { opacity: 1 } : { opacity: 1 }}
      transition={{ duration: 0.4, delay: reduced ? 0.15 : DELAY.emblemInner / 1000 + 0.3 }}
    >
      {[
        { d: "M 79 106 L 79 134", width: 11 },
        { d: "M 93 110 L 93 130", width: 11 },
        { d: "M 93 120 L 147 120", width: 5 },
        { d: "M 147 110 L 147 130", width: 11 },
        { d: "M 161 106 L 161 134", width: 11 },
      ].map((bar, i) => (
        <motion.path
          key={i}
          d={bar.d}
          strokeWidth={bar.width}
          initial={reduced ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={
            reduced
              ? { duration: 0.2, delay: 0.15 + i * 0.03 }
              : {
                  pathLength: {
                    duration: 0.45,
                    delay: DELAY.emblemInner / 1000 + 0.3 + i * 0.08,
                    ease: "easeInOut",
                  },
                  opacity: {
                    duration: 0.25,
                    delay: DELAY.emblemInner / 1000 + 0.3 + i * 0.08,
                  },
                }
          }
        />
      ))}
    </motion.g>
  </svg>
)

const GlowProgress = ({ palette }: { palette: SplashPalette }) => (
  <div className="pointer-events-none absolute inset-x-0 bottom-8 z-10 flex justify-center">
    <div
      className="relative h-px w-[min(64vw,260px)] overflow-hidden rounded-full"
      style={{ backgroundColor: palette.progressTrack }}
    >
      <motion.div
        className="absolute inset-y-0 left-0 w-full origin-left rounded-full"
        style={{
          backgroundColor: palette.accent,
          boxShadow: `0 0 12px ${palette.accentSoft}`,
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: SPLASH_DURATION_MS / 1000, ease: "linear" }}
      />
    </div>
  </div>
)
