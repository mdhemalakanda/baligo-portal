/**
 * Admin · Supplier rates — seasonal net-rate pricing hub.
 * UI-only demo; net rates are commercial data and stay inside admin screens.
 */
import * as React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BedDouble,
  CalendarRange,
  Clock3,
  History as HistoryIcon,
  Pencil,
  Plus,
  Scale,
  Settings2,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { RateStatus } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { WarningBanner } from "@/components/shared/warning-banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
  defaultSettings,
  hotelById,
  hotels,
  rateHistory,
  roomById,
  roomsByHotel,
  seasonalRates,
  type RateStatus as RateStatusType,
  type SeasonalRate,
} from "@/data/mock";
import { fmtDate, idr } from "@/lib/utils";

const ROUNDING_OPTIONS = [
  { value: "none", label: "None" },
  { value: "up-0.5", label: "Round up to 0.5" },
  { value: "up-1", label: "Round up to 1" },
  { value: "nearest-1", label: "Nearest 1" },
];

const STATUS_HEALTH: { status: RateStatusType; label: string; dotClass: string }[] = [
  { status: "valid", label: "Valid", dotClass: "bg-emerald-500" },
  { status: "expiring", label: "Expiring soon", dotClass: "bg-amber-500" },
  { status: "expired", label: "Expired", dotClass: "bg-red-500" },
  { status: "conflict", label: "Conflict", dotClass: "bg-red-600" },
  { status: "incomplete", label: "Incomplete", dotClass: "bg-gray-400" },
  { status: "draft", label: "Draft", dotClass: "bg-sky-500" },
];

function StatusIcon({ status }: { status: RateStatusType }) {
  if (status === "expired")
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600">
        <Clock3 className="h-3.5 w-3.5" aria-hidden="true" /> Expired
      </span>
    );
  if (status === "conflict")
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600">
        <Scale className="h-3.5 w-3.5" aria-hidden="true" /> Conflict
      </span>
    );
  if (status === "incomplete")
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600">
        <Settings2 className="h-3.5 w-3.5" aria-hidden="true" /> Incomplete
      </span>
    );
  return null;
}

export function RatesList() {
  const [hotelId, setHotelId] = React.useState(hotels[0]?.id ?? "");
  const [roomId, setRoomId] = React.useState("all");
  const [comparing, setComparing] = React.useState<SeasonalRate | null>(null);
  const [markup, setMarkup] = React.useState(String(defaultSettings.defaultMarkupPercent));
  const [rounding, setRounding] = React.useState(defaultSettings.rounding);
  const [idrPerUsd, setIdrPerUsd] = React.useState(String(defaultSettings.idrPerUsd));

  const roomOptions = React.useMemo(() => roomsByHotel(hotelId), [hotelId]);

  const visibleRates = React.useMemo(
    () =>
      seasonalRates.filter(
        (r) => r.hotelId === hotelId && (roomId === "all" || r.roomId === roomId),
      ),
    [hotelId, roomId],
  );

  const healthCounts = React.useMemo(() => {
    const hotelRates = seasonalRates.filter((r) => r.hotelId === hotelId);
    return STATUS_HEALTH.map((s) => ({
      ...s,
      count: hotelRates.filter((r) => r.status === s.status).length,
    })).filter((s) => s.count > 0);
  }, [hotelId]);

  const historyFor = (rate: SeasonalRate) =>
    rateHistory.filter((h) => h.hotelId === rate.hotelId && h.roomId === rate.roomId);

  const hotel = hotelById(hotelId);

  const changeRoom = (v: string) => {
    setRoomId(v);
  };

  const changeHotel = (v: string) => {
    setHotelId(v);
    setRoomId("all");
  };

  const saveConfig = () => {
    toast.success("Pricing configuration saved (demo — nothing was stored)");
  };

  return (
    <div>
      <PageHeader
        title="Supplier rates"
        description="Seasonal net rates, validity windows and surcharges straight from supplier contracts."
        breadcrumbs={[
          { label: "Admin", to: "/admin" },
          { label: "Supplier rates" },
        ]}
        actions={
          <Button asChild>
            <Link to="/admin/rates/new">
              <Plus aria-hidden="true" /> Add seasonal rate
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* ------------------------------------------------ main column */}
        <div className="min-w-0">
          {/* Hotel / room selectors */}
          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="rates-hotel" className="text-[13px] font-medium">
                Hotel
              </Label>
              <Select value={hotelId} onValueChange={changeHotel}>
                <SelectTrigger id="rates-hotel" aria-label="Hotel">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {hotels.map((h) => (
                    <SelectItem key={h.id} value={h.id}>
                      {h.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="rates-room" className="text-[13px] font-medium">
                Room type
              </Label>
              <Select value={roomId} onValueChange={changeRoom}>
                <SelectTrigger id="rates-room" aria-label="Room type">
                  <SelectValue />
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
            </div>
          </div>

          <p className="mb-3 text-sm text-muted-foreground">
            {visibleRates.length} seasonal {visibleRates.length === 1 ? "rate" : "rates"} for{" "}
            {hotel?.name}
            {roomId !== "all" && <> · {roomById(roomId)?.name}</>}
          </p>

          {visibleRates.length === 0 ? (
            <EmptyState
              icon={CalendarRange}
              title="No seasonal rates yet"
              description="This selection has no seasonal rates. Add one to start quoting."
              action={
                <Button asChild variant="outline">
                  <Link to="/admin/rates/new">
                    <Plus aria-hidden="true" /> Add seasonal rate
                  </Link>
                </Button>
              }
            />
          ) : (
            <div className="flex flex-col gap-3">
              {visibleRates.map((rate) => {
                const room = roomById(rate.roomId);
                const surcharged = rate.holidaySurcharge.enabled;
                return (
                  <Card key={rate.id} className="overflow-hidden p-0">
                    <div className="flex flex-col gap-4 p-4 sm:p-5">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold">{rate.seasonName}</h3>
                            <RateStatus status={rate.status} />
                            <StatusIcon status={rate.status} />
                          </div>
                          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <BedDouble className="h-3.5 w-3.5" aria-hidden="true" />
                              {room?.name ?? "—"}
                            </span>
                            <span>
                              {fmtDate(rate.startDate)} – {fmtDate(rate.endDate)}
                            </span>
                            <span>
                              Valid {fmtDate(rate.validityFrom)} – {fmtDate(rate.validityTo)}
                            </span>
                            <span>Min stay {rate.minStay} night{rate.minStay === 1 ? "" : "s"}</span>
                          </p>
                        </div>
                        {surcharged && (
                          <Badge variant="warning" className="shrink-0">
                            <Sparkles aria-hidden="true" />
                            Holiday surcharge +{rate.holidaySurcharge.percent}%
                          </Badge>
                        )}
                      </div>

                      <div className="grid gap-3 sm:grid-cols-[auto_1fr] sm:items-end">
                        <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
                          <p className="text-xs font-medium text-muted-foreground">
                            Net rate / night
                          </p>
                          <p className="amount text-lg font-bold tabular-nums text-primary">
                            {idr(rate.netRateIdr)}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1 text-[13px] text-muted-foreground sm:items-end">
                          <p>
                            Extra bed{" "}
                            <span className="amount font-medium tabular-nums text-foreground">
                              {rate.extraBedChargeIdr > 0 ? idr(rate.extraBedChargeIdr) : "—"}
                            </span>
                          </p>
                          <div className="flex flex-wrap gap-2 sm:justify-end">
                            <Button asChild size="sm" variant="outline">
                              <Link to={`/admin/rates/${rate.id}`}>
                                <Pencil aria-hidden="true" /> Edit
                              </Link>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setComparing(rate)}
                            >
                              <Scale aria-hidden="true" /> Compare
                            </Button>
                            <Button asChild size="sm" variant="ghost">
                              <Link to="/admin/history">
                                <HistoryIcon aria-hidden="true" /> History
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* ------------------------------------------------ side column */}
        <aside className="flex min-w-0 flex-col gap-4 lg:w-80">
          <Card className="p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <TrendingUp className="h-4 w-4 text-primary" aria-hidden="true" />
              Pricing configuration
            </h3>
            <div className="mt-4 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="markup" className="text-[13px] font-medium">
                  Default markup %
                </Label>
                <Input
                  id="markup"
                  type="number"
                  min={0}
                  value={markup}
                  onChange={(e) => setMarkup(e.target.value)}
                  className="amount tabular-nums"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="rounding" className="text-[13px] font-medium">
                  Rounding rule
                </Label>
                <Select value={rounding} onValueChange={(v) => setRounding(v as typeof rounding)}>
                  <SelectTrigger id="rounding" aria-label="Rounding rule">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROUNDING_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="fx" className="text-[13px] font-medium">
                  IDR per USD
                </Label>
                <Input
                  id="fx"
                  type="number"
                  min={0}
                  value={idrPerUsd}
                  onChange={(e) => setIdrPerUsd(e.target.value)}
                  className="amount tabular-nums"
                />
                <p className="text-xs text-muted-foreground">
                  Updated {fmtDate(defaultSettings.fxUpdatedAt)} · System FX sync
                </p>
              </div>
              <Button onClick={saveConfig} className="w-full">
                Save configuration
              </Button>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-semibold">Rate health</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {hotel?.name} — {seasonalRates.filter((r) => r.hotelId === hotelId).length} rates
            </p>
            <Separator className="my-3" />
            {healthCounts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No rates for this hotel yet.</p>
            ) : (
              <ul className="flex flex-col gap-2.5">
                {healthCounts.map((s) => (
                  <li key={s.status} className="flex items-center justify-between gap-2 text-sm">
                    <span className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${s.dotClass}`}
                        aria-hidden="true"
                      />
                      {s.label}
                    </span>
                    <span className="amount font-semibold tabular-nums">{s.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {healthCounts.some((s) => s.status === "conflict" || s.status === "incomplete") && (
            <WarningBanner tone="warning" title="Attention needed">
              One or more rates for this hotel are flagged as conflicting or incomplete. Review
              them before sharing quotations.
            </WarningBanner>
          )}
        </aside>
      </div>

      {/* Compare dialog */}
      <Dialog open={comparing !== null} onOpenChange={(o) => !o && setComparing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Compare rate changes</DialogTitle>
            <DialogDescription>
              {comparing && (
                <>
                  {hotelById(comparing.hotelId)?.name} · {roomById(comparing.roomId)?.name} ·{" "}
                  {comparing.seasonName}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {comparing && (
            <div>
              {historyFor(comparing).length === 0 ? (
                <p className="py-4 text-sm text-muted-foreground">
                  No recorded changes for this room — the current rate is the original.
                </p>
              ) : (
                <div className="overflow-hidden rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Field</TableHead>
                        <TableHead>Previous</TableHead>
                        <TableHead>Current</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historyFor(comparing).map((h) => (
                        <TableRow key={h.id}>
                          <TableCell className="text-[13px]">{h.field}</TableCell>
                          <TableCell className="amount text-[13px] tabular-nums text-muted-foreground">
                            {h.previous}
                          </TableCell>
                          <TableCell className="amount text-[13px] font-semibold tabular-nums">
                            <span className="inline-flex items-center gap-1">
                              {h.updated}
                              <ArrowRight className="h-3 w-3 text-teal-600" aria-hidden="true" />
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
