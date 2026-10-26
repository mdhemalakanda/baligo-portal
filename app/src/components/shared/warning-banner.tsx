import * as React from "react";
import { AlertTriangle, Info, ShieldAlert, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type BannerTone = "info" | "warning" | "danger";

const TONES: Record<BannerTone, { icon: LucideIcon; className: string }> = {
  info: { icon: Info, className: "border-sky-200 bg-sky-50 text-sky-900" },
  warning: { icon: AlertTriangle, className: "border-amber-200 bg-amber-50 text-amber-900" },
  danger: { icon: ShieldAlert, className: "border-red-200 bg-red-50 text-red-900" },
};

/** Full-width informational banner (demo notices, conflicts, missing data). */
export function WarningBanner({
  tone = "info",
  title,
  children,
  action,
  className,
}: {
  tone?: BannerTone;
  title?: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  const { icon: Icon, className: toneClass } = TONES[tone];
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn("flex gap-3 rounded-lg border p-3.5 text-sm", toneClass, className)}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cn("text-[13px] leading-relaxed", title && "mt-0.5")}>{children}</div>}
      </div>
      {action && <div className="shrink-0 self-center">{action}</div>}
    </div>
  );
}
