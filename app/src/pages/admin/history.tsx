/**
 * Admin · Rate history — audit trail of every pricing change.
 * UI-only demo over the rateHistory mock.
 */
import * as React from "react";
import type { DateRange } from "react-day-picker";
import { ArrowRight, History, Inbox } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/data-table";
import { DateRangePicker } from "@/components/shared/date-range-picker";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  hotelById,
  hotels,
  rateHistory,
  roomById,
  roomsByHotel,
  type RateHistoryEntry,
} from "@/data/mock";
import { cn, fmtDate } from "@/lib/utils";

type HistoryType = RateHistoryEntry["type"];

const TYPE_META: Record<HistoryType, { label: string; dot: string; chip: string }> = {
  rate: { label: "Rate", dot: "bg-primary", chip: "bg-primary/10 text-primary border-primary/20" },
  season: { label: "Season", dot: "bg-teal-500", chip: "border-teal-200 bg-teal-50 text-teal-700" },
  validity: { label: "Validity", dot: "bg-sky-500", chip: "border-sky-200 bg-sky-50 text-sky-700" },
  fx: { label: "FX", dot: "bg-amber-500", chip: "border-amber-200 bg-amber-50 text-amber-700" },
  markup: { label: "Markup", dot: "bg-gray-400", chip: "border-gray-200 bg-gray-50 text-gray-700" },
  surcharge: { label: "Surcharge", dot: "bg-red-500", chip: "border-red-200 bg-red-50 text-red-700" },
};

const TYPE_FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All types" },
  { value: "rate", label: "Rate" },
  { value: "season", label: "Season" },
  { value: "validity", label: "Validity" },
  { value: "fx", label: "FX" },
  { value: "markup", label: "Markup" },
  { value: "surcharge", label: "Surcharge" },
];

function initials(name: string) {
  const parts = name.replace(/\(.*\)/, "").trim().split(/\s+/);
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");
}

/** "2026-10-21 16:40" -> date part used for grouping + range filter. */
const dateOf = (at: string) => at.slice(0, 10);
const timeOf = (at: string) => at.slice(11);

function groupLabel(isoDate: string) {
  const today = new Date();
  const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  if (isoDate === todayIso) return "Today";
  return fmtDate(isoDate);
}

export function RateHistory() {
  const [hotelId, setHotelId] = React.useState("all");
  const [roomId, setRoomId] = React.useState("all");
  const [type, setType] = React.useState("all");
  const [query, setQuery] = React.useState("");
  const [range, setRange] = React.useState<DateRange | undefined>();
  const [detail, setDetail] = React.useState<RateHistoryEntry | null>(null);

  const roomOptions = React.useMemo(
    () => (hotelId === "all" ? [] : roomsByHotel(hotelId)),
    [hotelId],
  );

  const toIso = (d: Date | undefined) =>
    d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` : "";

  const filtered = React.useMemo(() => {
    const fromIso = range?.from ? toIso(range.from) : "";
    const toIsoV = range?.to ? toIso(range.to) : "";
    const q = query.trim().toLowerCase();
    return rateHistory
      .filter((e) => hotelId === "all" || e.hotelId === hotelId)
      .filter((e) => roomId === "all" || e.roomId === roomId)
      .filter((e) => type === "all" || e.type === type)
      .filter((e) => {
        if (!fromIso && !toIsoV) return true;
        const d = dateOf(e.at);
        if (fromIso && d < fromIso) return false;
        if (toIsoV && d > toIsoV) return false;
        return true;
      })
      .filter((e) => {
        if (!q) return true;
        const hotelName = hotelById(e.hotelId)?.name ?? "";
        const roomName = roomById(e.roomId)?.name ?? "";
        return `${e.actor} ${e.field} ${e.previous} ${e.updated} ${hotelName} ${roomName}`
          .toLowerCase()
          .includes(q);
      })
      .sort((a, b) => b.at.localeCompare(a.at));
  }, [hotelId, roomId, type, query, range]);

  /* Summary chips over the unfiltered set */
  const total = rateHistory.length;
  const fxCount = rateHistory.filter((e) => e.type === "fx").length;
  const seasonCount = rateHistory.filter((e) => e.type === "season").length;

  /* Group by date heading */
  const groups = React.useMemo(() => {
    const map = new Map<string, RateHistoryEntry[]>();
    for (const e of filtered) {
      const key = dateOf(e.at);
      const list = map.get(key);
      if (list) list.push(e);
      else map.set(key, [e]);
    }
    return [...map.entries()];
  }, [filtered]);

  const changeRoom = (v: string) => setRoomId(v);

  return (
    <div>
      <PageHeader
        title="Rate history"
        description="Every change to supplier rates, seasons, FX and pricing configuration — who changed what, and when."
        breadcrumbs={[
          { label: "Admin", to: "/admin" },
          { label: "Rate history" },
        ]}
      />

      {/* Summary chips */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{total} changes</Badge>
        <Badge variant="info">{fxCount} FX</Badge>
        <Badge variant="teal">{seasonCount} seasonal</Badge>
      </div>

      {/* Filters */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Select
          value={hotelId}
          onValueChange={(v) => {
            setHotelId(v);
            setRoomId("all");
          }}
        >
          <SelectTrigger aria-label="Filter by hotel">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All hotels</SelectItem>
            {hotels.map((h) => (
              <SelectItem key={h.id} value={h.id}>
                {h.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={roomId} onValueChange={changeRoom} disabled={hotelId === "all"}>
          <SelectTrigger aria-label="Filter by room type">
            <SelectValue placeholder="All rooms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All rooms</SelectItem>
            {roomOptions.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={type} onValueChange={setType}>
          <SelectTrigger aria-label="Filter by change type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TYPE_FILTERS.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DateRangePicker
          value={range}
          onChange={setRange}
          placeholder="Any date"
          numberOfMonths={1}
          className="w-full"
        />

        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search field, value or actor…"
          className="sm:col-span-2 xl:col-span-4 xl:max-w-md"
        />
      </div>

      {/* Timeline */}
      {groups.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No changes match these filters"
          description="Try widening the date range or clearing the hotel, room or type filters."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setHotelId("all");
                setRoomId("all");
                setType("all");
                setQuery("");
                setRange(undefined);
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-8">
          {groups.map(([date, entries]) => (
            <section key={date}>
              <h2 className="mb-3 flex items-center gap-3 text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
                {groupLabel(date)}
                <span className="h-px flex-1 bg-border" aria-hidden="true" />
                <span className="amount font-normal tabular-nums normal-case tracking-normal">
                  {entries.length} {entries.length === 1 ? "change" : "changes"}
                </span>
              </h2>

              <ol className="relative flex flex-col">
                {/* vertical line */}
                <span
                  className="absolute bottom-3 left-[13px] top-3 w-px bg-border"
                  aria-hidden="true"
                />
                {entries.map((e) => {
                  const meta = TYPE_META[e.type];
                  return (
                    <li key={e.id} className="relative flex gap-4 pb-5 last:pb-0">
                      <span
                        className={cn(
                          "relative z-10 mt-1 h-[26px] w-[26px] shrink-0 rounded-full border-2 border-background shadow-sm",
                          meta.dot,
                        )}
                        aria-hidden="true"
                      />
                      <button
                        type="button"
                        onClick={() => setDetail(e)}
                        className="min-w-0 flex-1 rounded-xl border bg-card p-4 text-left shadow-sm transition-shadow hover:shadow-md"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex min-w-0 flex-wrap items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-[10px] font-semibold">
                                {initials(e.actor)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-[13px] font-medium">{e.actor}</span>
                            <Badge variant="outline" className={cn("border", meta.chip)}>
                              {meta.label}
                            </Badge>
                          </div>
                          <time
                            dateTime={e.at.replace(" ", "T")}
                            className="amount shrink-0 text-xs tabular-nums text-muted-foreground"
                          >
                            {fmtDate(dateOf(e.at))} · {timeOf(e.at)}
                          </time>
                        </div>

                        <p className="mt-2 text-sm font-medium">{e.field}</p>
                        <p className="mt-1 flex flex-wrap items-center gap-2 text-[13px]">
                          <span className="amount text-muted-foreground line-through decoration-muted-foreground/40 tabular-nums">
                            {e.previous}
                          </span>
                          <ArrowRight
                            className="h-3.5 w-3.5 shrink-0 text-teal-600"
                            aria-hidden="true"
                          />
                          <span className="amount font-bold tabular-nums">{e.updated}</span>
                        </p>

                        {(e.hotelId || e.roomId) && (
                          <p className="mt-1.5 truncate text-xs text-muted-foreground">
                            {[hotelById(e.hotelId)?.name, roomById(e.roomId)?.name]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </div>
      )}

      {/* Change details dialog */}
      <Dialog open={detail !== null} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-4 w-4 text-primary" aria-hidden="true" />
              Change details
            </DialogTitle>
            <DialogDescription>
              {detail && (
                <>
                  {detail.actor} · {dateOf(detail.at)} at {timeOf(detail.at)}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {detail && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={cn("border", TYPE_META[detail.type].chip)}>
                  {TYPE_META[detail.type].label}
                </Badge>
                {detail.hotelId && (
                  <Badge variant="secondary">{hotelById(detail.hotelId)?.name}</Badge>
                )}
                {detail.roomId && <Badge variant="secondary">{roomById(detail.roomId)?.name}</Badge>}
              </div>
              <div className="overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-1/3">Field</TableHead>
                      <TableHead>Previous</TableHead>
                      <TableHead>Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="text-[13px] font-medium">{detail.field}</TableCell>
                      <TableCell className="amount text-[13px] tabular-nums text-muted-foreground">
                        {detail.previous}
                      </TableCell>
                      <TableCell className="amount text-[13px] font-bold tabular-nums">
                        {detail.updated}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
