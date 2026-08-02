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
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${
        isActive ? "border-primary/30 bg-primary" : "border-border/50 bg-muted"
      }`}
    >
      <span
        className={`pointer-events-none absolute top-0.5 h-5 w-5 rounded-full bg-background shadow-sm ring-1 ring-border/30 transition-transform duration-200 ${
          isActive ? "translate-x-[1.375rem]" : "translate-x-[0.125rem]"
        }`}
      />
    </button>
  )
}
