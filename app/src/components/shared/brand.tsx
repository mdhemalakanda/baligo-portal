import { cn } from "@/lib/utils";

/** Baligo brand mark: stylised "B" monogram with a teal accent dot. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={cn("h-8 w-8", className)} aria-hidden="true">
      <rect width="32" height="32" rx="9" className="fill-primary" />
      <path
        d="M10 23V9h6.4c2.6 0 4.35 1.35 4.35 3.55 0 1.5-.8 2.6-2.1 3.05 1.65.35 2.75 1.6 2.75 3.35 0 2.45-1.9 4.05-4.75 4.05H10Zm2.75-8.3h3.35c1.35 0 2.2-.7 2.2-1.85s-.85-1.8-2.2-1.8h-3.35v3.65Zm0 6.1h3.75c1.5 0 2.4-.8 2.4-2.05 0-1.25-.9-2-2.4-2h-3.75v4.05Z"
        className="fill-primary-foreground"
      />
      <circle cx="24.5" cy="7.5" r="2.5" className="fill-teal" />
    </svg>
  );
}

/**
 * Baligo wordmark. Use tone="dark" when placed on the navy sidebar.
 */
export function BrandLogo({
  className,
  markClassName,
  subtitle,
  tone = "light",
}: {
  className?: string;
  markClassName?: string;
  subtitle?: string;
  tone?: "light" | "dark";
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <BrandMark className={markClassName} />
      <div className="leading-none">
        <div className={cn("text-[17px] font-bold tracking-tight", tone === "dark" && "text-white")}>
          Bali<span className={tone === "dark" ? "text-teal-300" : "text-teal-600"}>go</span>
        </div>
        {subtitle && (
          <div
            className={cn(
              "mt-0.5 text-[10.5px] font-medium uppercase tracking-[0.14em]",
              tone === "dark" ? "text-white/50" : "text-muted-foreground",
            )}
          >
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}
