export function AccountBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden
    >
      <div className="absolute -left-48 top-[-10%] size-120 rounded-full bg-primary/10 blur-3xl dark:bg-primary/6" />
      <div className="absolute right-[-20%] top-[28%] size-104 rounded-full bg-primary/8 blur-3xl dark:bg-primary/6" />
      <div className="absolute bottom-[-15%] left-[20%] size-88 rounded-full bg-emerald-500/10 blur-3xl" />
    </div>
  )
}
