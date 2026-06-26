import { cn } from "@/lib/utils";
import { initials } from "@/lib/format";

const SIZE_CLASSES = {
  sm: "h-7 w-7 text-[11px]",
  md: "h-9 w-9 text-xs",
  lg: "h-12 w-12 text-sm",
};

export function Avatar({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-teal-light font-medium text-accent-foreground",
        SIZE_CLASSES[size],
        className
      )}
    >
      {initials(name)}
    </div>
  );
}
