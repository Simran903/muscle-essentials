"use client"

type SectionHeadingProps = {
  title: string
  description?: string
  className?: string
}

export function SectionHeading({ title, description, className }: SectionHeadingProps) {
  return (
    <div className={className}>
      <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">{description}</p>
      ) : null}
    </div>
  )
}
