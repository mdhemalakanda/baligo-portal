import * as React from "react";
import { Link } from "react-router-dom";
import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** Dashboard summary tile. */
export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendLabel = "vs last month",
  to,
  tone = "default",
  className,
}: {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  trend?: number; // percentage, + or -
  trendLabel?: string;
  to?: string;
  tone?: "default" | "teal" | "warning";
  className?: string;
}) {
  const inner = (
    <Card
      className={cn(
        "group flex flex-col justify-between gap-3 p-5 transition-shadow",
        to && "hover:shadow-md",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[13px] font-medium text-muted-foreground">{label}</span>
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg",
            tone === "teal"
              ? "bg-teal/10 text-teal-700"
              : tone === "warning"
                ? "bg-amber-100 text-amber-700"
                : "bg-primary/10 text-primary",
          )}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <div>
        <div className="amount text-[26px] font-bold leading-none tracking-tight">{value}</div>
        {typeof trend === "number" && (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
            {trend >= 0 ? (
              <TrendingUp className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-destructive" aria-hidden="true" />
            )}
            <span className={cn("font-medium", trend >= 0 ? "text-emerald-700" : "text-destructive")}>
              {trend >= 0 ? "+" : ""}
              {trend}%
            </span>
            <span>{trendLabel}</span>
          </p>
        )}
      </div>
    </Card>
  );
  return to ? (
    <Link to={to} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
      {inner}
    </Link>
  ) : (
    inner
  );
}
