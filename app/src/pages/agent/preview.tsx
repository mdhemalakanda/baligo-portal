import * as React from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Copy,
  FileWarning,
  Mail,
  MessageCircle,
  PencilLine,
  Printer,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BrandLogo } from "@/components/shared/brand";
import { DemoNote } from "@/components/shared/demo-note";
import { EmptyState } from "@/components/shared/empty-state";
import { CategoryBadge } from "@/components/shared/status-badge";
import { defaultSettings, hotelById, quotations, roomById } from "@/data/mock";
import { demoRef, demoStaySummary } from "@/data/pricing";
import type { QuotationBreakdownLine } from "@/data/mock";
import { fmtDate, nights, usd } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Shared param parsing (mirrors quotation.tsx — local, by design)     */
/* ------------------------------------------------------------------ */

function parseStayInput(params: URLSearchParams) {
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
  if (extraBeds > 0) parts.push(`${extraBeds} extra bed${extraBeds === 1 ? "" : "s"}`);
  return parts.join(" · ");
}

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
  validUntil: string;
  onRequest?: boolean;
}) {
  const head = [
    "Baligo Travel Group — Hotel Quotation (demo)",
    `Ref: ${opts.ref} · Valid until ${fmtDate(opts.validUntil)}`,
    "",
    `Hotel: ${opts.hotelName}, ${opts.destination}`,
    `Room: ${opts.roomName}`,
    `Stay: ${fmtDate(opts.checkIn)} → ${fmtDate(opts.checkOut)} (${nights(opts.checkIn, opts.checkOut)} nights)`,
    `Guests: ${opts.guests}`,
    "",
  ];
  if (opts.onRequest) {
    head.push("Price: on request — this stay needs review by the Baligo team.");
  } else {
    head.push(
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

const DEMO_ISSUE_DATE = "2026-10-26";
const DEMO_VALID_UNTIL = "2026-11-09";

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function QuotationPreview() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const refParam = params.get("ref");
  const savedQuote = refParam ? quotations.find((q) => q.ref === refParam) : undefined;
  const stayInput = savedQuote ? null : parseStayInput(params);

  if (!savedQuote && !stayInput) {
    return (
      <div className="py-10">
        <EmptyState
          icon={FileWarning}
          title="Nothing to preview"
          description="This preview needs a saved quotation reference (?ref=…) or a configured stay."
          action={
            <Button asChild>
              <Link to="/agent/search">Find hotels</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const summary = stayInput ? demoStaySummary(stayInput) : null;
  const validState = savedQuote || summary!.state === "valid";

  const ref = savedQuote?.ref ?? demoRef();
  const issueDate = savedQuote?.createdAt ?? DEMO_ISSUE_DATE;
  const validUntil = savedQuote?.validUntil ?? DEMO_VALID_UNTIL;
  const hotel = hotelById(savedQuote?.hotelId ?? stayInput!.hotelId);
  const room = savedQuote ? undefined : roomById(stayInput!.roomId);
  const roomName = savedQuote?.roomName ?? room?.name ?? "Selected room";
  const destination = savedQuote?.destination ?? hotel?.destination ?? "";
  const checkIn = savedQuote?.checkIn ?? stayInput!.checkIn;
  const checkOut = savedQuote?.checkOut ?? stayInput!.checkOut;
  const nightsCount = nights(checkIn, checkOut);
  const guests = guestsSummary(
    savedQuote?.adults ?? stayInput!.adults,
    savedQuote?.children ?? stayInput!.children,
    savedQuote?.rooms ?? stayInput!.rooms,
    savedQuote?.extraBeds ?? stayInput!.extraBeds,
  );

  const lines: QuotationBreakdownLine[] = savedQuote
    ? savedQuote.breakdown
    : [...summary!.roomLines, ...summary!.extras].map((l) => ({
        label: l.label,
        detail: l.detail,
        amount: l.amount,
      }));
  const total = savedQuote?.total ?? summary!.total;

  const summaryText = buildSummaryText({
    ref,
    hotelName: hotel?.name ?? roomName,
    destination,
    roomName,
    checkIn,
    checkOut,
    guests,
    lines,
    total,
    validUntil,
    onRequest: !validState,
  });

  function copyText() {
    navigator.clipboard?.writeText(summaryText).then(
      () => toast.success("Quotation text copied to clipboard (demo)"),
      () => toast.error("Could not access the clipboard in this browser"),
    );
  }

  function whatsappShare() {
    window.open(`https://wa.me/?text=${encodeURIComponent(summaryText)}`, "_blank", "noopener");
    toast("WhatsApp opened in a new tab (demo — nothing was sent)");
  }

  const mailto = `mailto:?subject=${encodeURIComponent(
    `Hotel quotation ${ref} — Baligo Travel Group`,
  )}&body=${encodeURIComponent(summaryText)}`;

  return (
    <div>
      {/* Non-printing action bar */}
      <div className="print:hidden mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Quotation preview</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Share, print or download this illustrative document for your client.
            </p>
          </div>
          <Link
            to="/agent"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:underline"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to portal
          </Link>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button onClick={copyText}>
            <Copy aria-hidden="true" /> Copy quotation text
          </Button>
          <Button variant="teal" onClick={whatsappShare}>
            <MessageCircle aria-hidden="true" /> WhatsApp
          </Button>
          <Button variant="outline" asChild>
            <a href={mailto} aria-label="Share quotation by email">
              <Mail aria-hidden="true" /> Email
            </a>
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer aria-hidden="true" /> Print
          </Button>
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <PencilLine aria-hidden="true" /> Edit
          </Button>
        </div>
        <div className="mt-3">
          <DemoNote>Demo document — sharing is simulated</DemoNote>
        </div>
      </div>

      {/* A4-style document */}
      <div className="print:max-w-none mx-auto max-w-3xl rounded-xl border bg-card p-6 shadow-sm sm:p-10 print:rounded-none print:border-0 print:shadow-none">
        <style>{`@media print { body { background: #fff; } }`}</style>

        {/* Brand header */}
        <header className="flex flex-wrap items-start justify-between gap-4 border-b pb-6">
          <BrandLogo subtitle="Travel Group" />
          <div className="text-right text-[13px] text-muted-foreground">
            <p className="font-medium text-foreground">Baligo Travel Group</p>
            <p>{defaultSettings.companyEmail}</p>
            <p>{defaultSettings.companyPhone}</p>
            <p>Denpasar, Bali, Indonesia</p>
          </div>
        </header>

        {/* Ref / dates strip */}
        <div className="flex flex-wrap items-start justify-between gap-4 pt-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Hotel Quotation</h2>
            <p className="mt-1 font-mono text-sm text-muted-foreground">{ref}</p>
          </div>
          <dl className="text-right text-[13px]">
            <div>
              <dt className="text-muted-foreground">Issued</dt>
              <dd className="font-medium">{fmtDate(issueDate)}</dd>
            </div>
            <div className="mt-1">
              <dt className="text-muted-foreground">Valid until</dt>
              <dd className="font-medium">{fmtDate(validUntil)}</dd>
            </div>
          </dl>
        </div>

        {/* Hotel & room */}
        <section className="mt-6 rounded-lg bg-muted/50 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold">{hotel?.name ?? roomName}</h3>
            {hotel && <CategoryBadge stars={hotel.category} />}
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">{destination}</p>
          <Separator className="my-3" />
          <dl className="grid gap-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Room
              </dt>
              <dd className="mt-0.5 font-medium">{roomName}</dd>
              {room && <dd className="text-[13px] text-muted-foreground">{room.bedType}</dd>}
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Stay
              </dt>
              <dd className="mt-0.5 font-medium">
                {fmtDate(checkIn)} → {fmtDate(checkOut)}
              </dd>
              <dd className="text-[13px] text-muted-foreground">
                {nightsCount} night{nightsCount === 1 ? "" : "s"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Guests
              </dt>
              <dd className="mt-0.5 font-medium">{guests}</dd>
            </div>
          </dl>
        </section>

        {/* Inclusions */}
        {hotel && (
          <section className="mt-6">
            <h4 className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
              Included in your stay
            </h4>
            <ul className="mt-2 grid gap-1.5 text-sm sm:grid-cols-2">
              {hotel.inclusions.map((inc) => (
                <li key={inc} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" aria-hidden="true" />
                  {inc}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Breakdown */}
        <section className="mt-6">
          <h4 className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
            Rate breakdown
          </h4>
          {validState ? (
            <table className="mt-2 w-full text-sm">
              <caption className="sr-only">Illustrative rate breakdown in US dollars</caption>
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
                    <td className="py-2.5 pr-4">
                      <span className="font-medium">{line.label}</span>
                      {line.detail && (
                        <span className="block text-[13px] text-muted-foreground">{line.detail}</span>
                      )}
                    </td>
                    <td className="amount tabular-nums py-2.5 text-right">
                      {line.amount === 0 ? "—" : usd(line.amount)}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="pt-4 text-base font-semibold">Total (USD)</td>
                  <td className="amount tabular-nums pt-4 text-right text-2xl font-bold">
                    {usd(total)}
                  </td>
                </tr>
              </tbody>
            </table>
          ) : (
            <div className="mt-2 rounded-lg border border-dashed p-5 text-center">
              <p className="font-medium">Price on request</p>
              <p className="mt-1 text-sm text-muted-foreground">
                This stay needs review by the Baligo team before a price can be confirmed. Contact us
                for a fresh quotation.
              </p>
            </div>
          )}
        </section>

        {/* Policies (client-facing) */}
        {hotel && (
          <section className="mt-6">
            <h4 className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
              Hotel policies
            </h4>
            <dl className="mt-2 space-y-2 text-sm">
              <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
                <dt className="w-40 shrink-0 font-medium">Check-in / check-out</dt>
                <dd className="text-muted-foreground">
                  {hotel.policies.checkIn} · {hotel.policies.checkOut}
                </dd>
              </div>
              <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
                <dt className="w-40 shrink-0 font-medium">Cancellation</dt>
                <dd className="text-muted-foreground">{hotel.policies.cancellation}</dd>
              </div>
              <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
                <dt className="w-40 shrink-0 font-medium">Children</dt>
                <dd className="text-muted-foreground">{hotel.policies.children}</dd>
              </div>
            </dl>
          </section>
        )}

        {/* Terms & conditions */}
        <section className="mt-8 border-t pt-6">
          <h4 className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
            Terms &amp; conditions
          </h4>
          <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-[13px] leading-relaxed text-muted-foreground">
            <li>
              All rates are indicative, subject to availability at the time of booking confirmation,
              and guaranteed only once a booking has been confirmed in writing by Baligo Travel Group.
            </li>
            <li>
              Quotations expire on the “Valid until” date shown above. Bookings requested after this
              date are subject to re-quotation at then-current rates.
            </li>
            <li>
              Cancellation and amendment conditions follow the individual property’s policy as stated
              above; please pass these terms on to your client before confirming.
            </li>
            <li>
              Prices are quoted in US dollars inclusive of taxes and service charges currently
              applicable. Any government levy introduced after the issue date will be charged at cost.
            </li>
          </ol>
        </section>

        {/* Document footer */}
        <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t pt-5 text-[13px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-teal-600" aria-hidden="true" />
            Thank you for booking with Baligo Travel Group.
          </span>
          <Badge variant="secondary" className="print:border print:border-border">
            Demo document — sample data
          </Badge>
        </footer>
      </div>

      <p className="print:hidden mt-6 text-center text-xs text-muted-foreground">
        Illustrative demo document · prices are sample data and do not represent a live offer.
      </p>
    </div>
  );
}
