import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  FileText,
  MapPin,
  Search,
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
import { CategoryBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { hotels, quotations, roomTypes } from "@/data/mock";
import { demoNightlyUsd } from "@/data/pricing";
import { fmtDate, usd } from "@/lib/utils";

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

function guestsSummary(rooms: number, adults: number, children: number) {
  const parts = [`${adults} adult${adults === 1 ? "" : "s"}`];
  if (children > 0) parts.push(`${children} child${children === 1 ? "" : "ren"}`);
  parts.push(`${rooms} room${rooms === 1 ? "" : "s"}`);
  return parts.join(" · ");
}

/** Recently viewed hotels (fixed demo list). */
const RECENT_HOTEL_IDS = ["htl-001", "htl-003", "htl-005", "htl-006"];
const DEMO_PRICE_DATE = "2027-02-10"; // valid demo season date

/** Cheapest nightly demo USD rate across a hotel's rooms, or null. */
function cheapestNightly(hotelId: string, dateIso: string): number | null {
  const rates = roomTypes
    .filter((r) => r.hotelId === hotelId)
    .map((r) => demoNightlyUsd(hotelId, r.id, dateIso))
    .filter((n): n is number => n !== null);
  return rates.length ? Math.min(...rates) : null;
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function AgentHome() {
  const navigate = useNavigate();

  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState("2027-02-10");
  const [checkOut, setCheckOut] = useState("2027-02-14");
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const recentQuotations = quotations.slice(0, 3);
  const recentHotels = useMemo(
    () =>
      RECENT_HOTEL_IDS.map((id) => hotels.find((h) => h.id === id)).filter(
        (h): h is (typeof hotels)[number] => Boolean(h),
      ),
    [],
  );

  function runSearch() {
    const params = new URLSearchParams();
    if (destination.trim()) params.set("q", destination.trim());
    params.set("checkIn", checkIn);
    params.set("checkOut", checkOut);
    params.set("rooms", String(rooms));
    params.set("adults", String(adults));
    params.set("children", Array.from({ length: children }, () => "8").join(","));
    params.set("extraBeds", "0");
    params.set("run", "1");
    navigate(`/agent/search?${params.toString()}`);
  }

  return (
    <div>
      {/* Welcome hero + search launcher */}
      <section className="rounded-xl border bg-gradient-to-br from-primary/5 via-card to-teal/5 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              {greeting}, Hana
            </h1>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Search contracted rates, build a stay for your client, and share a
              polished quotation in minutes.
            </p>
          </div>
          <Badge variant="teal">Demo data</Badge>
        </div>

        <Card className="mt-5 border shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
              <div className="sm:col-span-2 lg:col-span-1">
                <label htmlFor="home-destination" className="mb-1.5 block text-[13px] font-medium">
                  Destination or hotel
                </label>
                <div className="relative">
                  <MapPin
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    id="home-destination"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Ubud, Bali"
                    className="pl-9"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="home-checkin" className="mb-1.5 block text-[13px] font-medium">
                  Check-in
                </label>
                <Input
                  id="home-checkin"
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="home-checkout" className="mb-1.5 block text-[13px] font-medium">
                  Check-out
                </label>
                <Input
                  id="home-checkout"
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                />
              </div>
              <div>
                <span className="mb-1.5 block text-[13px] font-medium">Guests</span>
                <div className="grid grid-cols-3 gap-2">
                  <Select
                    value={String(rooms)}
                    onValueChange={(v) => setRooms(Number(v))}
                  >
                    <SelectTrigger aria-label="Rooms">
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
                  <Select
                    value={String(adults)}
                    onValueChange={(v) => setAdults(Number(v))}
                  >
                    <SelectTrigger aria-label="Adults">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n} ad{n === 1 ? "ult" : "ults"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={String(children)}
                    onValueChange={(v) => setChildren(Number(v))}
                  >
                    <SelectTrigger aria-label="Children">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 1, 2, 3, 4].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n} ch{n === 1 ? "ild" : "ildren"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground">
                <Users className="h-3.5 w-3.5" aria-hidden="true" />
                {guestsSummary(rooms, adults, children)}
                <span aria-hidden="true">·</span>
                <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                {fmtDate(checkIn)} – {fmtDate(checkOut)}
              </p>
              <Button onClick={runSearch} className="sm:w-auto">
                <Search aria-hidden="true" />
                Search hotels
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Continue your work — recent quotations */}
      <section className="mt-8">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-base font-semibold">Continue your work</h2>
          <Link
            to="/agent/quotations"
            className="inline-flex items-center gap-0.5 text-sm text-muted-foreground hover:text-foreground hover:underline"
          >
            All quotations
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        {recentQuotations.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No quotations yet"
            description="Start a hotel search to build your first quotation for a client."
          />
        ) : (
          <div className="grid gap-3">
            {recentQuotations.map((q) => (
              <Card key={q.id} className="transition-shadow hover:shadow-md">
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-semibold">{q.hotelName}</p>
                      {q.status === "shared" ? (
                        <Badge variant="teal">Shared</Badge>
                      ) : (
                        <Badge variant="neutral">Draft</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-[13px] text-muted-foreground">
                      {fmtDate(q.checkIn)} – {fmtDate(q.checkOut)} ·{" "}
                      {q.nights} night{q.nights === 1 ? "" : "s"} ·{" "}
                      {guestsSummary(q.rooms, q.adults, q.children.length)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <p className="amount tabular-nums text-base font-semibold">
                      {usd(q.total)}
                    </p>
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/agent/quotations/${q.id}`}>
                        View
                        <ArrowRight aria-hidden="true" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Separator className="my-8" />

      {/* Recently viewed hotels */}
      <section>
        <h2 className="mb-3 text-base font-semibold">Recently viewed hotels</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {recentHotels.map((h) => {
            const nightly = cheapestNightly(h.id, DEMO_PRICE_DATE);
            return (
              <Link
                key={h.id}
                to={`/agent/hotels/${h.id}`}
                className="group overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md"
              >
                <HotelThumb
                  hue={h.imageHue}
                  name={h.name}
                  className="aspect-[4/3] w-full transition-transform group-hover:opacity-90"
                />
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="line-clamp-2 text-sm font-semibold leading-snug">
                      {h.name}
                    </p>
                    <CategoryBadge stars={h.category} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{h.destination}</p>
                  <Separator className="my-2.5" />
                  {nightly !== null ? (
                    <p className="text-sm">
                      <span className="text-muted-foreground">From </span>
                      <span className="amount tabular-nums font-semibold">
                        ${nightly}
                      </span>
                      <span className="text-muted-foreground"> /night</span>
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">On request</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Rates shown are demo data for this prototype.
        </p>
      </section>
    </div>
  );
}
