export function GlowHero() {
  const headline = "Muscle Essentials"
  const type =
    "w-full min-w-0 whitespace-nowrap text-center font-sans font-semibold leading-none tracking-[-0.02em] text-[clamp(1.25rem,min(6vw,5.5rem),5.5rem)]"

  return (
    <div className="relative z-1 w-full min-w-0 overflow-visible px-4 pb-0 sm:px-6">
      <div className={`relative w-full min-w-0 pt-6 pb-2 ${type}`}>
        <h1 className={`relative z-10 m-0 w-full text-cyan-600/[0.11] dark:text-cyan-400/[0.09] ${type}`}>
          {headline}
        </h1>
      </div>
    </div>
  )
}
