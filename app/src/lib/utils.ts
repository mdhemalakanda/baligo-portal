import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as USD, e.g. 1250 -> "$1,250.00" */
export function usd(value: number, opts: { compact?: boolean } = {}) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: opts.compact ? "compact" : "standard",
    minimumFractionDigits: opts.compact ? 0 : 2,
    maximumFractionDigits: opts.compact ? 1 : 2,
  }).format(value);
}

/** Format IDR without decimals, e.g. 19250000 -> "IDR 19,250,000" */
export function idr(value: number) {
  return "IDR " + new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

/** "2026-08-14" -> "Aug 14, 2026" */
export function fmtDate(iso: string, style: "short" | "long" = "short") {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(
    "en-US",
    style === "short"
      ? { month: "short", day: "numeric", year: "numeric" }
      : { weekday: "short", month: "long", day: "numeric", year: "numeric" },
  );
}

/** Nights between two ISO dates. */
export function nights(checkIn: string, checkOut: string) {
  const a = new Date(checkIn + "T00:00:00").getTime();
  const b = new Date(checkOut + "T00:00:00").getTime();
  return Math.max(0, Math.round((b - a) / 86_400_000));
}
