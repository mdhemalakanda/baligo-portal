import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  Clock,
  HelpCircle,
  PauseCircle,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Tone = "success" | "warning" | "destructive" | "info" | "neutral" | "teal";

const TONE_CONFIG: Record<Tone, { icon: LucideIcon }> = {
  success: { icon: CheckCircle2 },
  warning: { icon: AlertTriangle },
  destructive: { icon: XCircle },
  info: { icon: Clock },
  neutral: { icon: CircleDashed },
  teal: { icon: CheckCircle2 },
};

/**
 * Consistent status badge — icon + label so color is never the only indicator.
 * `variant` maps to badge tone; a dot+icon always accompanies the label.
 */
export function StatusBadge({
  tone,
  label,
  withIcon = true,
  className,
}: {
  tone: Tone;
  label: string;
  withIcon?: boolean;
  className?: string;
}) {
  const Icon = TONE_CONFIG[tone].icon;
  return (
    <Badge variant={tone} className={className}>
      {withIcon && <Icon aria-hidden="true" />}
      {label}
    </Badge>
  );
}

/** Well-known status vocabularies shared across admin + agent screens. */
export const HotelStatus = ({ status }: { status: string }) => {
  const map: Record<string, { tone: Tone; label: string }> = {
    active: { tone: "success", label: "Active" },
    draft: { tone: "neutral", label: "Draft" },
    inactive: { tone: "warning", label: "Inactive" },
  };
  const cfg = map[status] ?? { tone: "neutral" as Tone, label: status };
  return <StatusBadge tone={cfg.tone} label={cfg.label} />;
};

export const RateStatus = ({ status }: { status: string }) => {
  const map: Record<string, { tone: Tone; label: string }> = {
    valid: { tone: "success", label: "Valid" },
    expiring: { tone: "warning", label: "Expiring soon" },
    expired: { tone: "destructive", label: "Expired" },
    incomplete: { tone: "warning", label: "Incomplete" },
    conflict: { tone: "destructive", label: "Conflict" },
    draft: { tone: "neutral", label: "Draft" },
  };
  const cfg = map[status] ?? { tone: "neutral" as Tone, label: status };
  return <StatusBadge tone={cfg.tone} label={cfg.label} />;
};

export const AgentStatus = ({ status }: { status: string }) => {
  const map: Record<string, { tone: Tone; label: string }> = {
    active: { tone: "success", label: "Active" },
    pending: { tone: "warning", label: "Pending approval" },
    deactivated: { tone: "neutral", label: "Deactivated" },
    rejected: { tone: "destructive", label: "Rejected" },
  };
  const cfg = map[status] ?? { tone: "neutral" as Tone, label: status };
  return <StatusBadge tone={cfg.tone} label={cfg.label} />;
};

/** Simple category star treatment (e.g. "5★"). */
export function CategoryBadge({ stars }: { stars: number }) {
  return (
    <span
      className="inline-flex items-center gap-0.5 rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-xs font-semibold text-amber-700"
      aria-label={`${stars} star property`}
    >
      {stars}
      <span aria-hidden="true">★</span>
    </span>
  );
}

export const UncertainBadge = () => (
  <Badge variant="warning" className="gap-0.5">
    <HelpCircle aria-hidden="true" /> Needs review
  </Badge>
);
