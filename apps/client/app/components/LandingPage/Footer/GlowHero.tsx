export function GlowHero() {
  const headline = "Muscle Essentials"
  const textClass =
    "block w-full min-w-0 whitespace-nowrap text-center font-[family-name:var(--font-michroma)] font-extrabold leading-none tracking-widest"

  return (
    <div
      className="@container relative z-1 w-screen max-w-[100vw]"
      style={{ marginLeft: "calc(50% - 50vw)", marginRight: "calc(50% - 50vw)" }}
    >
      <div
        className="relative w-full overflow-visible px-0 pt-4 pb-2"
        style={{ fontSize: "clamp(1rem, calc(100cqw / 10.5), 14rem)" }}
      >
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-0 flex items-center justify-center ${textClass} text-cyan-400 opacity-45 blur-md dark:text-cyan-300 dark:opacity-20 dark:blur-sm`}
        >
          {headline}
        </span>
        <h1
          className={`glow-hero-text relative z-10 m-0 ${textClass} text-white dark:text-black dark:[-webkit-text-fill-color:#000]`}
        >
          {headline}
        </h1>
      </div>
    </div>
  )
}
