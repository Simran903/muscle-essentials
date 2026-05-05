export function GlowHero() {
  const headline = "Muscle Essentials"
  const type =
    "w-full min-w-0 whitespace-nowrap text-center font-[family-name:var(--font-michroma)] font-extrabold leading-none tracking-widest text-[clamp(1rem,min(11rem,calc((100svw-3.5rem)/14)),11rem)]"

  return (
    <div className="relative z-1 w-full min-w-0 overflow-visible px-4 pb-0 sm:px-6">
      <div className={`relative w-full min-w-0 pt-4 pb-0 ${type}`}>
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-0 flex items-center justify-center ${type} text-[#F1C232] opacity-45 blur-md dark:opacity-20 dark:blur-sm`}
        >
          {headline}
        </span>
        <h1
          className={`glow-hero-text relative z-10 m-0 w-full text-zinc-950 dark:text-black dark:[-webkit-text-fill-color:#000] ${type}`}
        >
          {headline}
        </h1>
      </div>
    </div>
  )
}
