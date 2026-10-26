import * as React from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  CalendarDays,
  CalendarX2,
  Check,
  Copy,
  FileWarning,
  HelpCircle,
  History,
  Hotel,
  MapPin,
  MessageSquareQuote,
  PencilLine,
  Send,
  Share2,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { DemoNote } from "@/components/shared/demo-note";
import { CategoryBadge } from "@/components/shared/status-badge";
import { hotelById, quotations, roomById } from "@/data/mock";
import type { QuotationBreakdownLine } from "@/data/mock";
import { demoStaySummary, demoRef } from "@/data/pricing";
import type { StayInput, StayState } from "@/data/pricing";
import { cn, fmtDate, nights, usd } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function parseStayInput(params: URLSearchParams): StayInput | null {
  const hotelId = params.get("hotel");
  const roomId = params.get("room");
  const checkIn = params.get("checkIn") ?? "";
  const checkOut = params.get("checkOut") ?? "";
  if (!hotelId || !roomId || !checkIn || !checkOut) return null;
  const num = (key: string, fallback: number) => {
    const v = Number(params.get(key) ?? fallback);
    return Number.isFinite(v) ? v : fallback;
  };
  return {
    hotelId,
    roomId,
    checkIn,
    checkOut,
    rooms: Math.max(1, num("rooms", 1)),
    adults: Math.max(1, num("adults", 2)),
    children: (params.get("children") ?? "")
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n) && n >= 0),
    extraBeds: Math.max(0, num("extraBeds", 0)),
  };
}

function guestsSummary(adults: number, childAges: number[], rooms: number, extraBeds: number) {
  const parts = [`${adults} adult${adults === 1 ? "" : "s"}`];
  if (childAges.length > 0) {
    parts.push(
      `${childAges.length} child${childAges.length === 1 ? "" : "ren"} (age${childAges.length === 1 ? "" : "s"} ${childAges.join(", ")})`,
    );
  }
  parts.push(`${rooms} room${rooms === 1 ? "" : "s"}`);
  if (extraBeds > 0) {
    parts.push(`${extraBeds} extra bed${extraBeds === 1 ? "" : "s"}`);
  }
  return parts.join(" · ");
}

/** Plain-text quotation summary for copy/share actions. */
function buildSummaryText(opts: {
  ref: string;
  hotelName: string;
  destination: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  lines: QuotationBreakdownLine[];
  total: number;
  onRequest?: boolean;
}) {
  const head = [
    "Baligo Travel Group — Hotel Quotation (demo)",
    `Ref: ${opts.ref}`,
    "",
    `Hotel: ${opts.hotelName}, ${opts.destination}`,
    `Room: ${opts.roomName}`,
    `Stay: ${fmtDate(opts.checkIn)} → ${fmtDate(opts.checkOut)} (${nights(opts.checkIn, opts.checkOut)} nights)`,
    `Guests: ${opts.guests}`,
  ];
  if (opts.onRequest) {
    head.push("", "Price: on request — this stay needs review by the Baligo team.");
  } else {
    head.push(
      "",
      "Illustrative breakdown (USD):",
      ...opts.lines.map((l) => `- ${l.label}${l.detail ? ` (${l.detail})` : ""}: ${usd(l.amount)}`),
      `Total: ${usd(opts.total)}`,
    );
  }
  head.push(
    "",
    "All prices are indicative, in USD, and subject to availability at the time of booking.",
    "Demo document — sample data only.",
  );
  return head.join("\n");
}

const STATE_UI: Record<
  Exclude<StayState, "valid">,
  { icon: LucideIcon; ring: string; iconColor: string; badge: "warning" | "destructive" | "info"; headline: string }
> = {
  "missing-rate": {
    icon: FileWarning,
    ring: "bg-amber-100",
    iconColor: "text-amber-600",
    badge: "warning",
    headline: "No contracted rate yet",
  },
  "expired-rate": {
    icon: History,
    ring: "bg-red-100",
    iconColor: "text-red-600",
    badge: "destructive",
    headline: "Contract expired",
  },
  "unresolved-rate": {
    icon: AlertTriangle,
    ring: "bg-amber-100",
    iconColor: "text-amber-600",
    badge: "warning",
    headline: "Rate under review",
  },
  "occupancy-limit": {
    icon: Users,
    ring: "bg-amber-100",
    iconColor: "text-amber-600",
    badge: "warning",
    headline: "Occupancy limit exceeded",
  },
  "invalid-dates": {
    icon: CalendarX2,
    ring: "bg-red-100",
    iconColor: "text-red-600",
    badge: "destructive",
    headline: "Check your dates",
  },
  "more-info": {
    icon: HelpCircle,
    ring: "bg-sky-100",
    iconColor: "text-sky-600",
    badge: "info",
    headline: "A few details needed",
  },
};

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function QuotationDetail({ saved }: { saved?: boolean }) {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const savedQuote = saved ? quotations.find((q) => q.id === id) : undefined;
  if (saved && !savedQuote) {
    return (
      <EmptyState
        icon={FileWarning}
        title="Quotation not found"
        description={`No saved quotation matches “${id}”. It may have been removed from the demo data set.`}
        action={
          <Button asChild>
            <Link to="/agent/quotations">Back to my quotations</Link>
          </Button>
        }
      />
    );
  }

  const stayInput = savedQuote
    ? ({
        hotelId: savedQuote.hotelId,
        roomId: "",
        checkIn: savedQuote.checkIn,
        checkOut: savedQuote.checkOut,
        rooms: savedQuote.rooms,
        adults: savedQuote.adults,
        children: savedQuote.children,
        extraBeds: savedQuote.extraBeds,
      } as StayInput)
    : parseStayInput(params);

  if (!savedQuote && !stayInput) {
    return (
      <EmptyState
        icon={Hotel}
        title="No stay selected"
        description="Pick a hotel and configure your stay first — the quotation will appear here."
        action={
          <Button asChild>
            <Link to="/agent/search">Find hotels</Link>
          </Button>
        }
      />
    );
  }

  const forcedState = (params.get("state") as StayState | null) ?? undefined;
  const summary = savedQuote ? null : demoStaySummary(stayInput!, forcedState);
  const state = savedQuote ? "valid" : summary!.state;
  const hotel = hotelById(savedQuote?.hotelId ?? stayInput!.hotelId);
  const room = savedQuote ? undefined : roomById(stayInput!.roomId);

  const ref = savedQuote?.ref ?? demoRef();
  const checkIn = savedQuote?.checkIn ?? stayInput!.checkIn;
  const checkOut = savedQuote?.checkOut ?? stayInput!.checkOut;
  const roomCount = savedQuote?.rooms ?? stayInput!.rooms;
  const adults = savedQuote?.adults ?? stayInput!.adults;
  const childAges = savedQuote?.children ?? stayInput!.children;
  const extraBeds = savedQuote?.extraBeds ?? stayInput!.extraBeds;
  const roomName = savedQuote?.roomName ?? room?.name ?? "Selected room";
  const guests = guestsSummary(adults, childAges, roomCount, extraBeds);

  const lines: QuotationBreakdownLine[] = savedQuote
    ? savedQuote.breakdown
    : [...summary!.roomLines, ...summary!.extras].map((l) => ({
        label: l.label,
        detail: l.detail,
        amount: l.amount,
      }));
  const total = savedQuote?.total ?? summary!.total;
  const validState = state === "valid";

  const shareParams = savedQuote ? `ref=${encodeURIComponent(savedQuote.ref)}` : params.toString();

  function copySummary() {
    const text = buildSummaryText({
      ref,
      hotelName: hotel?.name ?? roomName,
      destination: hotel?.destination ?? "",
      roomName,
      checkIn,
      checkOut,
      guests,
      lines,
      total,
      onRequest: !validState,
    });
    navigator.clipboard?.writeText(text).then(
      () => toast.success("Quotation summary copied to clipboard (demo)"),
      () => toast.error("Could not access the clipboard in this browser"),
    );
  }

  function copyRef() {
    navigator.clipboard?.writeText(ref).then(() =>
      toast.success(`Reference ${ref} copied (demo)`),
    );
  }

  return (
    <div>
      <PageHeader
        title={
          <span className="inline-flex items-center gap-2">
            {saved ? "Quotation" : "Quotation draft"}
            <span className="font-mono text-base text-muted-foreground">{ref}</span>
            <button
              type="button"
              onClick={copyRef}
              aria-label="Copy quotation reference"
              className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer"
            >
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </span>
        }
        description={
          saved
            ? "Saved quotation — review, share it with your client, or print a copy."
            : "Review this illustrative quotation before sharing it with your client."
        }
        breadcrumbs={[
          { label: "Find Hotels", to: "/agent/search" },
          {
            label: "Stay details",
            to: savedQuote ? "/agent/quotations" : `/agent/stay/${stayInput!.hotelId}/${stayInput!.roomId}`,
          },
          { label: saved ? "Quotation" : "Quotation draft" },
        ]}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate(-1)}>
              <PencilLine aria-hidden="true" /> Edit stay
            </Button>
            <Button onClick={() => navigate(`/agent/preview?${shareParams}`)}>
              <Share2 aria-hidden="true" /> Share
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: hotel header card + breakdown / state panel */}
        <div className="space-y-6 lg:col-span-2">
          {/* Hotel & stay header card */}
          <Card>
            <CardContent className="p-5">
              <div
                role="img"
                aria-label={hotel?.name ?? roomName}
                className="mb-4 h-28 w-full rounded-lg sm:aspect-[16/6]"
                style={{
                  background: `linear-gradient(135deg, hsl(${hotel?.imageHue ?? 200} 55% 72%), hsl(${(hotel?.imageHue ?? 200) + 30} 45% 45%))`,
                }}
              />
              <div className="mt-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold">{hotel?.name ?? roomName}</h2>
                  {hotel && <CategoryBadge stars={hotel.category} />}
                </div>
                <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                  {hotel?.destination ?? savedQuote?.destination}
                </p>
                <p className="mt-1 text-sm font-medium">{roomName}</p>
                {room && (
                  <p className="text-[13px] text-muted-foreground">
                    {room.bedType} · {room.sizeSqm} m² · {room.meals.toLowerCase()}
                  </p>
                )}

                <Separator className="my-4" />

                <dl className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Stay
                    </dt>
                    <dd className="mt-1 flex items-center gap-1.5 text-sm">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      {fmtDate(checkIn)} → {fmtDate(checkOut)}
                      <Badge variant="secondary">{nights(checkIn, checkOut)} nights</Badge>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Guests
                    </dt>
                    <dd className="mt-1 flex items-center gap-1.5 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      {guests}
                    </dd>
                  </div>
                </dl>

                {room && (
                  <p className="mt-4 rounded-lg bg-muted/60 px-3 py-2 text-[13px] text-muted-foreground">
                    <span className="font-medium text-foreground">Occupancy:</span> standard{" "}
                    {room.standardOccupancy.adults} adults + {room.standardOccupancy.children} children ·
                    maximum {room.maxOccupancy.adults} adults + {room.maxOccupancy.children} children (
                    {room.maxOccupancy.total} guests total)
                    {room.extraBedEligible
                      ? ` · up to ${room.maxExtraBeds} extra bed${room.maxExtraBeds === 1 ? "" : "s"}`
                      : " · no extra beds"}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {validState ? (
            /* Illustrative breakdown */
            <Card>
              <CardContent className="p-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-base font-semibold">Illustrative breakdown</h3>
                  <DemoNote>Demo pricing — sample data</DemoNote>
                </div>
                <table className="w-full text-sm">
                  <caption className="sr-only">Illustrative price breakdown in US dollars</caption>
                  <thead>
                    <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th scope="col" className="py-2 font-medium">
                        Item
                      </th>
                      <th scope="col" className="py-2 text-right font-medium">
                        Amount (USD)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((line, i) => (
                      <tr key={i} className="border-b last:border-b-0">
                        <td className="py-3 pr-4">
                          <span className="font-medium">{line.label}</span>
                          {line.detail && (
                            <span className="block text-[13px] text-muted-foreground">{line.detail}</span>
                          )}
                        </td>
                        <td className="amount tabular-nums py-3 text-right font-medium">
                          {line.amount === 0 ? "—" : usd(line.amount)}
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td className="pt-4 font-semibold">Total</td>
                      <td className="amount tabular-nums pt-4 text-right text-lg font-bold">
                        {usd(total)}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">
                    Indicative total in USD, taxes included. Subject to availability at confirmation.
                  </p>
                  <Button variant="outline" size="sm" onClick={copySummary}>
                    <Copy aria-hidden="true" /> Copy summary
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Non-valid state panel — never fabricates a price */
            <StatePanel
              state={state as Exclude<StayState, "valid">}
              message={summary?.stateMessage}
              onRequest={() =>
                toast.success("Request sent to Baligo team (demo — nothing was sent)")
              }
            />
          )}
        </div>

        {/* Right column: inclusions & policy */}
        <Card className="self-start">
          <CardContent className="p-5">
            <h3 className="text-base font-semibold">Inclusions &amp; policy</h3>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Client-facing summary for {hotel?.name ?? "this property"}.
            </p>
            <Separator className="my-4" />
            {hotel ? (
              <>
                <h4 className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Included in your stay
                </h4>
                <ul className="mt-2 space-y-1.5">
                  {hotel.inclusions.map((inc) => (
                    <li key={inc} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" aria-hidden="true" />
                      {inc}
                    </li>
                  ))}
                </ul>
                <Separator className="my-4" />
                <h4 className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Hotel policies
                </h4>
                <dl className="mt-2 space-y-3 text-sm">
                  <div>
                    <dt className="font-medium">Check-in / check-out</dt>
                    <dd className="text-muted-foreground">
                      {hotel.policies.checkIn} · {hotel.policies.checkOut}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium">Cancellation</dt>
                    <dd className="text-muted-foreground">{hotel.policies.cancellation}</dd>
                  </div>
                  <div>
                    <dt className="font-medium">Children</dt>
                    <dd className="text-muted-foreground">{hotel.policies.children}</dd>
                  </div>
                  {extraBeds > 0 && (
                    <div>
                      <dt className="font-medium">Extra bed</dt>
                      <dd className="text-muted-foreground">{hotel.policies.extraBed}</dd>
                    </div>
                  )}
                </dl>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Policy details follow the property’s standard terms and will be confirmed with the
                quotation.
              </p>
            )}
            {room && (
              <>
                <Separator className="my-4" />
                <h4 className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Room notes
                </h4>
                <p className="mt-2 text-sm text-muted-foreground">{room.childPolicy}</p>
                {room.extraBedEligible && (
                  <p className="mt-1 text-sm text-muted-foreground">{room.extraBedPolicy}</p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        All amounts on this page are illustrative demo data — nothing is priced, stored or sent.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* State panel (non-valid stay states)                                 */
/* ------------------------------------------------------------------ */

function StatePanel({
  state,
  message,
  onRequest,
}: {
  state: Exclude<StayState, "valid">;
  message?: string;
  onRequest: () => void;
}) {
  const ui = STATE_UI[state];
  const Icon = ui.icon;
  return (
    <Card>
      <CardContent className="flex flex-col items-center p-8 text-center">
        <span
          className={cn("flex h-14 w-14 items-center justify-center rounded-full", ui.ring)}
          aria-hidden="true"
        >
          <Icon className={cn("h-6 w-6", ui.iconColor)} />
        </span>
        <Badge variant={ui.badge} className="mt-4">
          {ui.headline}
        </Badge>
        <h3 className="mt-3 text-lg font-semibold">{ui.headline}</h3>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          {message ??
            "We couldn't price this stay automatically. Send a request and the Baligo team will confirm the details."}
        </p>
        <Button className="mt-5" onClick={onRequest}>
          <Send aria-hidden="true" /> Request quotation
        </Button>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <MessageSquareQuote className="h-3.5 w-3.5" aria-hidden="true" />
          Typical response within one business day (demo).
        </p>
      </CardContent>
    </Card>
  );
}
