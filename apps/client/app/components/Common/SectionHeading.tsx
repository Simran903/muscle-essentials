"use client"

type SectionHeadingProps = {
  title: string
  description?: string
  className?: string
}

export function SectionHeading({ title, description, className }: SectionHeadingProps) {
  return (
    <div className={className}>
      <h2 className="text-2xl font-medium tracking-tight text-foreground sm:text-3xl lg:text-[2rem] lg:leading-[1.15]">
        {title}
      </h2>
      {description ? (
        <p className="mt-2 max-w-2xl text-[0.9375rem] leading-relaxed text-muted-foreground sm:text-base">
          {description}
        </p>
      ) : null}
    </div>
  )
}
