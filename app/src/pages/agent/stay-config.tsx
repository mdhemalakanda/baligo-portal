import { useMemo } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  AlertTriangle,
  BedDouble,
  CalendarDays,
  Check,
  FileText,
  Maximize,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CategoryBadge } from "@/components/shared/status-badge";
import { DemoNote } from "@/components/shared/demo-note";
import { EmptyState } from "@/components/shared/empty-state";
import { Field } from "@/components/shared/form-section";
import { hotelById, roomById } from "@/data/mock";
import { demoStaySummary } from "@/data/pricing";
import { fmtDate, nights, usd } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Local helpers                                                       */
/* ------------------------------------------------------------------ */

function HotelThumb({ hue, name, className }: { hue: number; name: string; className?: string }) {
  return (
    <div
      role="img"
      aria-label={name}
      className={className}
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 55% 72%), hsl(${hue + 30} 45% 45%))`,
      }}
    />
  );
}

function parseAges(csv: string | null): number[] {
  if (!csv) return [];
  return csv
    .split(",")
    .map((a) => Math.min(17, Math.max(0, Number(a) || 0)));
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function StayConfig() {
  const params = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const hotelId = params.hotelId ?? "";
  const roomId = params.roomId ?? "";
  const hotel = hotelById(hotelId);
  const room = roomById(roomId);

  const checkIn = searchParams.get("checkIn") || "2027-02-10";
  const checkOut = searchParams.get("checkOut") || "2027-02-14";
  const rooms = Number(searchParams.get("rooms")) || 1;
  const adults = Number(searchParams.get("adults")) || 2;
  const childAges = parseAges(searchParams.get("children"));
  const extraBeds = Number(searchParams.get("extraBeds")) || 0;

  function update(next: Record<string, string | undefined>) {
    const p = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(next)) {
      if (value === undefined) p.delete(key);
      else p.set(key, value);
    }
    setSearchParams(p, { replace: true });
  }

  const stayNights = nights(checkIn, checkOut);
  const datesInvalid = stayNights <= 0;
  const maxOccupancy = room?.maxOccupancy.total ?? 0;
  const occupancyExceeded = Boolean(room) && adults + childAges.length > maxOccupancy;
  const extraBedAllowed = Boolean(room?.extraBedEligible);

  // Keep extra beds within the room's limit if the room changes underneath us.
  const effectiveExtraBeds = extraBedAllowed
    ? Math.min(extraBeds, room?.maxExtraBeds ?? 0)
    : 0;

  const summary = useMemo(
    () =>
      hotel && room
        ? demoStaySummary({
            hotelId: hotel.id,
            roomId: room.id,
            checkIn,
            checkOut,
            rooms,
            adults,
            children: childAges,
            extraBeds: effectiveExtraBeds,
          })
        : null,
    [hotel, room, checkIn, checkOut, rooms, adults, childAges, effectiveExtraBeds],
  );

  const blocked = datesInvalid || occupancyExceeded;

  if (!hotel || !room) {
    return (
      <EmptyState
        icon={BedDouble}
        title="Hotel or room not found"
        description="This stay configuration refers to a hotel or room type that doesn't exist in the demo data."
        action={
          <Button asChild variant="outline">
            <Link to="/agent/search">Back to search</Link>
          </Button>
        }
      />
    );
  }

  function setChildCount(n: number) {
    const next = Array.from({ length: n }, (_, i) => childAges[i] ?? 8);
    update({ children: next.length ? next.join(",") : undefined });
  }

  function goQuote() {
    const p = new URLSearchParams();
    p.set("hotel", hotel!.id);
    p.set("room", room!.id);
    p.set("checkIn", checkIn);
    p.set("checkOut", checkOut);
    p.set("rooms", String(rooms));
    p.set("adults", String(adults));
    if (childAges.length) p.set("children", childAges.join(","));
    p.set("extraBeds", String(effectiveExtraBeds));
    navigate(`/agent/quote?${p.toString()}`);
  }

  return (
    <div>
      {/* Breadcrumb-ish back link */}
      <div className="mb-4">
        <Link
          to="/agent/search"
          className="text-sm text-muted-foreground hover:text-foreground hover:underline"
        >
          ← Back to search results
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Main column */}
        <div className="min-w-0">
          <Card>
            <CardContent className="p-4 sm:p-5">
              {/* Hotel + room header */}
              <div className="flex flex-col gap-4 sm:flex-row">
                <HotelThumb
                  hue={hotel.imageHue}
                  name={hotel.name}
                  className="aspect-[4/3] w-full shrink-0 rounded-lg sm:aspect-auto sm:h-28 sm:w-40"
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-lg font-bold tracking-tight">{hotel.name}</h1>
                    <CategoryBadge stars={hotel.category} />
                  </div>
                  <p className="mt-0.5 text-[13px] text-muted-foreground">
                    {hotel.destination}
                  </p>
                  <Separator className="my-3" />
                  <p className="text-sm font-semibold">{room.name}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <BedDouble className="h-3.5 w-3.5" aria-hidden="true" />
                      {room.bedType}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Maximize className="h-3.5 w-3.5" aria-hidden="true" />
                      {room.sizeSqm} m²
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" aria-hidden="true" />
                      Sleeps up to {room.maxOccupancy.total}
                    </span>
                  </p>
                </div>
              </div>

              <Separator className="my-5" />

              {/* Stay details form */}
              <h2 className="text-sm font-semibold">Stay details</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Field label="Check-in" htmlFor="stay-checkin">
                  <Input
                    id="stay-checkin"
                    type="date"
                    value={checkIn}
                    onChange={(e) => update({ checkIn: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    <CalendarDays className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
                    Hotel check-in {hotel.policies.checkIn.toLowerCase()}
                  </p>
                </Field>
                <Field
                  label="Check-out"
                  htmlFor="stay-checkout"
                  error={
                    datesInvalid
                      ? "Check-out must be after check-in."
                      : undefined
                  }
                  hint={datesInvalid ? undefined : `${stayNights} night${stayNights === 1 ? "" : "s"}`}
                >
                  <Input
                    id="stay-checkout"
                    type="date"
                    value={checkOut}
                    aria-invalid={datesInvalid}
                    onChange={(e) => update({ checkOut: e.target.value })}
                  />
                  {datesInvalid && (
                    <p className="text-xs text-muted-foreground">
                      Hotel check-out {hotel.policies.checkOut.toLowerCase()}
                    </p>
                  )}
                </Field>
                <Field label="Rooms" htmlFor="stay-rooms">
                  <Select
                    value={String(rooms)}
                    onValueChange={(v) => update({ rooms: v })}
                  >
                    <SelectTrigger id="stay-rooms" aria-label="Number of rooms">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n} room{n === 1 ? "" : "s"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Adults" htmlFor="stay-adults">
                  <Select
                    value={String(adults)}
                    onValueChange={(v) => update({ adults: v })}
                  >
                    <SelectTrigger id="stay-adults" aria-label="Number of adults">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n} adult{n === 1 ? "" : "s"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Children" htmlFor="stay-children">
                  <Select
                    value={String(childAges.length)}
                    onValueChange={(v) => setChildCount(Number(v))}
                  >
                    <SelectTrigger id="stay-children" aria-label="Number of children">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 1, 2, 3, 4].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n} child{n === 1 ? "" : "ren"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Extra beds" htmlFor="stay-extrabeds">
                  {extraBedAllowed ? (
                    <Select
                      value={String(effectiveExtraBeds)}
                      onValueChange={(v) => update({ extraBeds: v })}
                    >
                      <SelectTrigger id="stay-extrabeds" aria-label="Number of extra beds">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from(
                          { length: (room.maxExtraBeds || 0) + 1 },
                          (_, n) => (
                            <SelectItem key={n} value={String(n)}>
                              {n}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex h-9 items-center rounded-md border border-input bg-muted/50 px-3 text-sm text-muted-foreground">
                      Not eligible
                    </div>
                  )}
                </Field>
              </div>

              {/* Child ages */}
              {childAges.length > 0 && (
                <div className="mt-4">
                  <span className="mb-1.5 block text-[13px] font-medium">
                    Children&apos;s ages
                  </span>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {childAges.map((age, i) => (
                      <div key={i}>
                        <label
                          htmlFor={`stay-child-age-${i}`}
                          className="mb-1 block text-xs text-muted-foreground"
                        >
                          Child {i + 1}
                        </label>
                        <Select
                          value={String(age)}
                          onValueChange={(v) => {
                            const next = [...childAges];
                            next[i] = Number(v);
                            update({ children: next.join(",") });
                          }}
                        >
                          <SelectTrigger
                            id={`stay-child-age-${i}`}
                            aria-label={`Age of child ${i + 1}`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 18 }, (_, a) => (
                              <SelectItem key={a} value={String(a)}>
                                {a} {a === 1 ? "year" : "years"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Occupancy guard */}
              {occupancyExceeded && (
                <div
                  role="alert"
                  className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <p>
                    <span className="font-semibold">Exceeds maximum occupancy ({maxOccupancy}).</span>{" "}
                    Reduce the number of guests or choose a larger room type.
                  </p>
                </div>
              )}

              <Separator className="my-5" />

              {/* Included benefits */}
              <h2 className="text-sm font-semibold">Included benefits</h2>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                <Badge variant="secondary" className="gap-1">
                  <Check aria-hidden="true" />
                  {room.meals}
                </Badge>
                {hotel.inclusions.map((inc) => (
                  <Badge key={inc} variant="secondary" className="gap-1">
                    <Check aria-hidden="true" />
                    {inc}
                  </Badge>
                ))}
              </div>

              <Separator className="my-5" />

              {/* Policies */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <h3 className="text-sm font-semibold">Child policy</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                    {room.childPolicy}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Extra bed</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                    {room.extraBedPolicy}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right rail — quotation summary */}
        <div className="min-w-0">
          <Card className="lg:sticky lg:top-[calc(var(--baligo-header-h)+16px)]">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold">Quotation summary</h2>
                <DemoNote>Demo data</DemoNote>
              </div>

              <p className="mt-3 text-xs text-muted-foreground">
                {fmtDate(checkIn)} – {fmtDate(checkOut)} ·{" "}
                {guestsLine(rooms, adults, childAges.length, effectiveExtraBeds)}
              </p>

              <Separator className="my-3" />

              {summary && summary.state === "valid" ? (
                <>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[13px] text-muted-foreground">Nightly rate</span>
                    <span className="amount tabular-nums text-sm font-semibold">
                      {usd(summary.nightlyUsd ?? 0)}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2">
                    {summary.roomLines.map((line) => (
                      <div key={line.label} className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium">{line.label}</p>
                          <p className="text-xs text-muted-foreground">{line.detail}</p>
                        </div>
                        <p className="amount tabular-nums whitespace-nowrap text-[13px]">
                          {usd(line.amount)}
                        </p>
                      </div>
                    ))}
                    {summary.extras.map((line) => (
                      <div key={line.label} className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium">{line.label}</p>
                          <p className="text-xs text-muted-foreground">{line.detail}</p>
                        </div>
                        <p className="amount tabular-nums whitespace-nowrap text-[13px]">
                          {usd(line.amount)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-3" />

                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-sm font-semibold">Total</span>
                    <span className="amount tabular-nums text-xl font-bold">
                      {usd(summary.total)}
                    </span>
                  </div>
                </>
              ) : (
                <div className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                  {datesInvalid
                    ? "Set valid stay dates to see pricing."
                    : occupancyExceeded
                      ? `Reduce guests to ${maxOccupancy} or fewer to price this stay.`
                      : (summary?.stateMessage ??
                        "Pricing is unavailable for this selection.")}
                </div>
              )}

              <Separator className="my-4" />

              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="block">
                      <Button className="w-full" onClick={goQuote} disabled={blocked}>
                        <FileText aria-hidden="true" />
                        View quotation details
                      </Button>
                    </span>
                  </TooltipTrigger>
                  {blocked && (
                    <TooltipContent>
                      {datesInvalid
                        ? "Fix the stay dates first."
                        : "Resolve the occupancy warning first."}
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
              {blocked && (
                <p className="mt-2 text-xs font-medium text-destructive" role="alert">
                  {datesInvalid
                    ? "Fix the stay dates to continue."
                    : `Guests exceed this room's maximum occupancy (${maxOccupancy}).`}
                </p>
              )}

              <Button
                variant="ghost"
                className="mt-2 w-full"
                onClick={() =>
                  toast.success("Draft quotation saved (demo — nothing saved)")
                }
              >
                Save as draft quotation
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function guestsLine(rooms: number, adults: number, children: number, extraBeds: number) {
  const parts = [`${adults} adult${adults === 1 ? "" : "s"}`];
  if (children > 0) parts.push(`${children} child${children === 1 ? "" : "ren"}`);
  parts.push(`${rooms} room${rooms === 1 ? "" : "s"}`);
  if (extraBeds > 0) parts.push(`${extraBeds} extra bed${extraBeds === 1 ? "" : "s"}`);
  return parts.join(" · ");
}
