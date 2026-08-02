import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "relative isolate overflow-hidden rounded-xl bg-muted/70 before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/15 before:to-transparent dark:before:via-white/5",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
