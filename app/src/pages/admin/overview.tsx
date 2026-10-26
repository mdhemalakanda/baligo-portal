/**
 * Admin dashboard overview.
 * UI-only demo — all figures derive from @/data/mock; nothing is persisted.
 */
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BedDouble,
  Building2,
  FileWarning,
  Plus,
  SearchX,
  Settings,
  Upload,
  UserCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { RateStatus } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import {
  agents,
  contractImports,
  hotels,
  recentActivity,
  roomById,
  roomTypes,
  seasonalRates,
  hotelById,
} from "@/data/mock";
import { fmtDate, idr } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Derived demo figures                                                */
/* ------------------------------------------------------------------ */

const activeAgents = agents.filter((a) => a.status === "active").length;
const contractsInReview = contractImports.length;

/** Rates that need an admin decision, most severe first. */
const ATTENTION_ORDER: Record<string, number> = {
  conflict: 0,
  expiring: 1,
  incomplete: 2,
  expired: 3,
};

const attentionRates = seasonalRates
  .filter((r) => r.status in ATTENTION_ORDER)
  .sort((a, b) => ATTENTION_ORDER[a.status] - ATTENTION_ORDER[b.status])
  .slice(0, 5);

const pendingAgents = agents.filter((a) => a.status === "pending");

const recentlyUpdatedRates = [...seasonalRates]
  .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  .slice(0, 5);

/* Seasonal pricing overview — share of rates per status. */
const PRICING_SEGMENTS = [
  { status: "valid", label: "Valid", bar: "bg-primary" },
  { status: "expiring", label: "Expiring soon", bar: "bg-amber-400" },
  { status: "expired", label: "Expired", bar: "bg-red-400" },
  { status: "conflict", label: "Conflict", bar: "bg-red-600" },
  { status: "incomplete", label: "Incomplete", bar: "bg-slate-300" },
].map((s) => ({
  ...s,
  count: seasonalRates.filter((r) => r.status === s.status).length,
}));
const totalRates = seasonalRates.length;

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function AdminOverview() {
  return (
    <div>
      <PageHeader
        title="Overview"
        description="Portfolio health, pricing risks and what your team touched last."
        actions={
          <>
            <Button asChild size="sm">
              <Link to="/admin/hotels/new">
                <Plus aria-hidden="true" /> Add hotel
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to="/admin/contracts">
                <Upload aria-hidden="true" /> Import contract
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to="/admin/agents">
                <UserCheck aria-hidden="true" /> Review agents
              </Link>
            </Button>
            <Button asChild size="sm" variant="ghost">
              <Link to="/admin/settings">
                <Settings aria-hidden="true" /> Settings
              </Link>
            </Button>
          </>
        }
      />

      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total hotels"
          value={hotels.length}
          icon={Building2}
          trend={14}
          to="/admin/hotels"
        />
        <StatCard
          label="Room types"
          value={roomTypes.length}
          icon={BedDouble}
          trend={12}
          to="/admin/rooms"
        />
        <StatCard
          label="Active agents"
          value={activeAgents}
          icon={Users}
          trend={20}
          tone="teal"
          to="/admin/agents"
        />
        <StatCard
          label="Contracts awaiting review"
          value={contractsInReview}
          icon={FileWarning}
          trend={-25}
          tone="warning"
          to="/admin/contracts"
        />
      </div>

      {/* Attention + recently updated rates */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-base">Needs attention</CardTitle>
              <CardDescription>Rate issues and approvals waiting on you</CardDescription>
            </div>
            <Link
              to="/admin/rates"
              className="inline-flex items-center gap-1 text-[13px] font-medium text-primary hover:underline"
            >
              All rates <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-1">
            {attentionRates.length === 0 && pendingAgents.length === 0 ? (
              <EmptyState
                compact
                icon={SearchX}
                title="Nothing needs attention"
                description="All rates and agent approvals are in good shape."
              />
            ) : (
              <ul className="divide-y">
                {attentionRates.map((r) => {
                  const hotel = hotelById(r.hotelId);
                  const room = roomById(r.roomId);
                  return (
                    <li key={r.id}>
                      <Link
                        to={`/admin/rates/${r.id}`}
                        className="flex items-center gap-3 rounded-lg px-1 py-2 transition-colors hover:bg-secondary/60"
                      >
                        <span className="w-[112px] shrink-0 whitespace-nowrap">
                          <RateStatus status={r.status} />
                        </span>
                        <span className="min-w-0 flex-1 truncate text-[13px]">
                          <span className="font-medium">{hotel?.name ?? r.hotelId}</span>
                          <span className="text-muted-foreground">
                            {" "}
                            · {r.seasonName} · {room?.name ?? r.roomId}
                          </span>
                        </span>
                        <ArrowRight
                          className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                          aria-hidden="true"
                        />
                      </Link>
                    </li>
                  );
                })}
                {pendingAgents.map((a) => (
                  <li key={a.id}>
                    <Link
                      to="/admin/agents"
                      className="flex items-center gap-3 rounded-lg px-1 py-2 transition-colors hover:bg-secondary/60"
                    >
                      <span className="w-[112px] shrink-0 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-xs font-semibold text-amber-700 [&_svg]:size-3">
                          <UserCheck aria-hidden="true" />
                          Approval
                        </span>
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[13px]">
                        <span className="font-medium">{a.name}</span>
                        <span className="text-muted-foreground">
                          {" "}
                          · {a.company} · registered {fmtDate(a.registeredAt)}
                        </span>
                      </span>
                      <ArrowRight
                        className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-base">Recently updated rates</CardTitle>
              <CardDescription>Latest supplier rate changes across the portfolio</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead>Hotel</TableHead>
                    <TableHead>Season</TableHead>
                    <TableHead className="text-right">Net (IDR)</TableHead>
                    <TableHead className="text-right">Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentlyUpdatedRates.map((r) => {
                    const hotel = hotelById(r.hotelId);
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="max-w-[180px]">
                          <Link
                            to={`/admin/rates/${r.id}`}
                            className="block truncate font-medium hover:underline"
                          >
                            {hotel?.name ?? r.hotelId}
                          </Link>
                          <p className="truncate text-xs text-muted-foreground">
                            {roomById(r.roomId)?.name}
                          </p>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-[13px]">
                          {r.seasonName}
                        </TableCell>
                        <TableCell className="amount tabular-nums whitespace-nowrap text-right text-[13px]">
                          {idr(r.netRateIdr)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-right text-[13px] text-muted-foreground">
                          {fmtDate(r.updatedAt)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity + seasonal pricing overview */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader className="space-y-1">
            <CardTitle className="text-base">Recent agent activity</CardTitle>
            <CardDescription>Latest quotations and account changes</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {recentActivity.map((a) => (
                <li key={a.id} className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary"
                  >
                    {initials(a.actor)}
                  </span>
                  <p className="min-w-0 flex-1 text-[13px] leading-snug">
                    <span className="font-medium">{a.actor}</span>{" "}
                    <span className="text-muted-foreground">
                      {a.action} <span className="font-medium text-foreground/80">{a.target}</span>
                    </span>
                  </p>
                  <span className="whitespace-nowrap text-xs text-muted-foreground">{a.at}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="space-y-1">
            <CardTitle className="text-base">Seasonal pricing overview</CardTitle>
            <CardDescription>
              Share of {totalRates} seasonal rates by validation status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              role="img"
              aria-label={`Rate status split: ${PRICING_SEGMENTS.map((s) => `${s.count} ${s.label.toLowerCase()}`).join(", ")}`}
              className="flex h-3 w-full overflow-hidden rounded-full bg-muted"
            >
              {PRICING_SEGMENTS.filter((s) => s.count > 0).map((s) => (
                <div
                  key={s.status}
                  className={s.bar}
                  style={{ width: `${(s.count / totalRates) * 100}%` }}
                />
              ))}
            </div>
            <ul className="mt-4 space-y-2">
              {PRICING_SEGMENTS.map((s) => (
                <li key={s.status} className="flex items-center gap-2 text-[13px]">
                  <span
                    aria-hidden="true"
                    className={`h-2.5 w-2.5 shrink-0 rounded-sm ${s.bar}`}
                  />
                  <span className="flex-1 text-muted-foreground">{s.label}</span>
                  <span className="amount tabular-nums font-medium">{s.count}</span>
                  <span className="w-10 text-right tabular-nums text-muted-foreground">
                    {Math.round((s.count / totalRates) * 100)}%
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/** "Amelia R." -> "AR" for the avatar fallback. */
function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}
