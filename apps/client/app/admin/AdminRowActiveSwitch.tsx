"use client"

type AdminRowActiveSwitchProps = {
  isActive: boolean
  disabled: boolean
  noun: "product" | "brand" | "category"
  onToggle: () => void
}

export function AdminRowActiveSwitch({ isActive, disabled, noun, onToggle }: AdminRowActiveSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isActive}
      aria-label={
        isActive ? `Active — click to deactivate ${noun}` : `Inactive — click to activate ${noun}`
      }
      disabled={disabled}
      onClick={onToggle}
      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border border-border/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${
        isActive ? "bg-primary" : "bg-muted"
      }`}
    >
      <span
        className={`pointer-events-none absolute top-0.5 h-5 w-5 rounded-full bg-background shadow-sm ring-1 ring-border/40 transition-transform ${
          isActive ? "translate-x-6" : "translate-x-0.5"
        }`}
      />
    </button>
  )
}
