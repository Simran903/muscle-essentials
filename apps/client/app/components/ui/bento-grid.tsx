import { cn } from "@/lib/utils";

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "mx-auto grid max-w-7xl grid-cols-1 gap-5 md:auto-rows-[18rem] md:grid-cols-4 xl:grid-cols-5",
        className,
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "group/bento row-span-1 flex flex-col justify-between space-y-4 rounded-2xl border border-border/50 bg-card p-5 shadow-none transition-[border-color,background-color] duration-200 hover:border-primary/20 dark:border-border! dark:bg-card/50! dark:hover:border-primary/25",
        className,
      )}
    >
      {header}
      <div>
        {icon}
        <div className="mt-2 mb-2 font-sans text-sm font-semibold tracking-tight text-foreground">
          {title}
        </div>
        <div className="font-sans text-xs font-normal text-muted-foreground">
          {description}
        </div>
      </div>
    </div>
  );
};
