import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  BedDouble,
  Check,
  ChevronDown,
  ChevronUp,
  Coffee,
  Maximize,
  RotateCcw,
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
import { SearchInput } from "@/components/shared/data-table";
import { hotels, roomTypes, type Hotel, type RoomType } from "@/data/mock";
import { demoNightlyUsd } from "@/data/pricing";
import { nights } from "@/lib/utils";

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

const DEFAULTS = {
  q: "",
  checkIn: "2027-02-10",
  checkOut: "2027-02-14",
  rooms: 1,
  adults: 2,
  childAges: [] as number[],
  extraBeds: 0,
  sort: "recommended",
};

function parseParams(sp: URLSearchParams) {
  const childrenCsv = sp.get("children") ?? "";
  const childAges = childrenCsv
    ? childrenCsv.split(",").map((a) => Math.min(17, Math.max(0, Number(a) || 0)))
    : [];
  return {
    q: sp.get("q") ?? DEFAULTS.q,
    checkIn: sp.get("checkIn") || DEFAULTS.checkIn,
    checkOut: sp.get("checkOut") || DEFAULTS.checkOut,
    rooms: Number(sp.get("rooms")) || DEFAULTS.rooms,
    adults: Number(sp.get("adults")) || DEFAULTS.adults,
    childAges,
    extraBeds: Number(sp.get("extraBeds")) || DEFAULTS.extraBeds,
    sort: sp.get("sort") || DEFAULTS.sort,
    run: sp.get("run") === "1",
  };
}

function buildParams(values: {
  q: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  adults: number;
  childAges: number[];
  extraBeds: number;
  sort?: string;
  run?: boolean;
}) {
  const p = new URLSearchParams();
  if (values.q.trim()) p.set("q", values.q.trim());
  p.set("checkIn", values.checkIn);
  p.set("checkOut", values.checkOut);
  p.set("rooms", String(values.rooms));
  p.set("adults", String(values.adults));
  if (values.childAges.length) p.set("children", values.childAges.join(","));
  p.set("extraBeds", String(values.extraBeds));
  if (values.sort && values.sort !== DEFAULTS.sort) p.set("sort", values.sort);
  if (values.run) p.set("run", "1");
  return p;
}

function occupancyLabel(room: RoomType) {
  return `Up to ${room.maxOccupancy.total} guests`;
}

/* ------------------------------------------------------------------ */
/* Expandable room list for one hotel card                             */
/* ------------------------------------------------------------------ */

function RoomList({ hotel, query }: { hotel: Hotel; query: ReturnType<typeof parseParams> }) {
  const navigate = useNavigate();
  const rooms = roomTypes.filter((r) => r.hotelId === hotel.id);
  const datesOk =
    query.checkIn &&
    query.checkOut &&
    nights(query.checkIn, query.checkOut) > 0;

  function selectRoom(room: RoomType) {
    const p = new URLSearchParams();
    p.set("checkIn", query.checkIn);
    p.set("checkOut", query.checkOut);
    p.set("rooms", String(query.rooms));
    p.set("adults", String(query.adults));
    if (query.childAges.length) p.set("children", query.childAges.join(","));
    p.set("extraBeds", String(query.extraBeds));
    navigate(`/agent/stay/${hotel.id}/${room.id}?${p.toString()}`);
  }

  return (
    <div className="mt-3 rounded-lg border bg-muted/30">
      {rooms.map((room, i) => {
        const nightly =
          datesOk && query.checkIn
            ? demoNightlyUsd(hotel.id, room.id, query.checkIn)
            : null;
        return (
          <div key={room.id}>
            {i > 0 && <Separator />}
            <div className="flex flex-col gap-3 p-3.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold">{room.name}</p>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <BedDouble className="h-3.5 w-3.5" aria-hidden="true" />
                    {room.bedType}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" aria-hidden="true" />
                    {occupancyLabel(room)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Maximize className="h-3.5 w-3.5" aria-hidden="true" />
                    {room.sizeSqm} m²
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Coffee className="h-3.5 w-3.5" aria-hidden="true" />
                    {room.meals}
                  </span>
                </p>
              </div>
              <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-center sm:gap-1">
                {nightly !== null ? (
                  <p className="text-sm">
                    <span className="amount tabular-nums text-base font-semibold">
                      ${nightly}
                    </span>{" "}
                    <span className="text-muted-foreground">/night</span>
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {datesOk
                      ? "Rate unavailable for your dates"
                      : "Select your dates to see rates"}
                  </p>
                )}
                {nightly !== null ? (
                  <Button size="sm" onClick={() => selectRoom(room)}>
                    Select
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      toast.info(
                        "Quotation request noted (demo — nothing was sent)",
                      )
                    }
                  >
                    Request quotation
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function HotelSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = useMemo(() => parseParams(searchParams), [searchParams]);

  // Draft form state — committed to the URL only when Search is pressed.
  const [draftQ, setDraftQ] = useState(query.q);
  const [draftCheckIn, setDraftCheckIn] = useState(query.checkIn);
  const [draftCheckOut, setDraftCheckOut] = useState(query.checkOut);
  const [draftRooms, setDraftRooms] = useState(query.rooms);
  const [draftAdults, setDraftAdults] = useState(query.adults);
  const [draftChildAges, setDraftChildAges] = useState<number[]>(query.childAges);
  const [draftExtraBeds, setDraftExtraBeds] = useState(query.extraBeds);
  const [expandedHotelId, setExpandedHotelId] = useState<string | null>(null);

  const dateError =
    draftCheckIn &&
    draftCheckOut &&
    nights(draftCheckIn, draftCheckOut) <= 0
      ? "Check-out must be after check-in."
      : undefined;

  const hasRun = query.run;

  function commit(next: Partial<{ sort: string }> = {}) {
    const p = buildParams({
      q: draftQ,
      checkIn: draftCheckIn,
      checkOut: draftCheckOut,
      rooms: draftRooms,
      adults: draftAdults,
      childAges: draftChildAges,
      extraBeds: draftExtraBeds,
      run: true,
      ...next,
    });
    setSearchParams(p);
  }

  function reset() {
    setDraftQ(DEFAULTS.q);
    setDraftCheckIn(DEFAULTS.checkIn);
    setDraftCheckOut(DEFAULTS.checkOut);
    setDraftRooms(DEFAULTS.rooms);
    setDraftAdults(DEFAULTS.adults);
    setDraftChildAges(DEFAULTS.childAges);
    setDraftExtraBeds(DEFAULTS.extraBeds);
    setSearchParams(new URLSearchParams());
    setExpandedHotelId(null);
  }

  function setChildCount(n: number) {
    const next = Array.from(
      { length: n },
      (_, i) => draftChildAges[i] ?? 8,
    );
    setDraftChildAges(next);
  }

  /* Results ---------------------------------------------------------- */

  const results = useMemo(() => {
    const q = query.q.trim().toLowerCase();
    let list = hotels.filter((h) => h.status === "active");
    if (q) {
      list = list.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.destination.toLowerCase().includes(q),
      );
    }
    if (query.sort === "price-asc") {
      const minNightly = (h: Hotel) => {
        const rates = roomTypes
          .filter((r) => r.hotelId === h.id)
          .map((r) => demoNightlyUsd(h.id, r.id, query.checkIn))
          .filter((n): n is number => n !== null);
        return rates.length ? Math.min(...rates) : Infinity;
      };
      list = [...list].sort((a, b) => minNightly(a) - minNightly(b));
    }
    return list;
  }, [query.q, query.sort, query.checkIn]);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Hotel search
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Find contracted hotels and build a stay for your client.
          </p>
        </div>
        <Badge variant="teal">Demo data</Badge>
      </div>

      {/* Search panel */}
      <Card>
        <CardContent className="p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2">
              <span className="mb-1.5 block text-[13px] font-medium">
                Destination or hotel
              </span>
              <SearchInput
                value={draftQ}
                onChange={setDraftQ}
                placeholder="e.g. Ubud or beachfront resort"
                ariaLabel="Destination or hotel"
              />
            </div>
            <div>
              <label htmlFor="search-checkin" className="mb-1.5 block text-[13px] font-medium">
                Check-in
              </label>
              <Input
                id="search-checkin"
                type="date"
                value={draftCheckIn}
                onChange={(e) => setDraftCheckIn(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="search-checkout" className="mb-1.5 block text-[13px] font-medium">
                Check-out
              </label>
              <Input
                id="search-checkout"
                type="date"
                value={draftCheckOut}
                onChange={(e) => setDraftCheckOut(e.target.value)}
                aria-invalid={Boolean(dateError)}
              />
              {dateError && (
                <p className="mt-1 text-xs font-medium text-destructive" role="alert">
                  {dateError}
                </p>
              )}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <span className="mb-1.5 block text-[13px] font-medium">Rooms</span>
              <Select value={String(draftRooms)} onValueChange={(v) => setDraftRooms(Number(v))}>
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
            </div>
            <div>
              <span className="mb-1.5 block text-[13px] font-medium">Adults</span>
              <Select value={String(draftAdults)} onValueChange={(v) => setDraftAdults(Number(v))}>
                <SelectTrigger aria-label="Adults">
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
            </div>
            <div>
              <span className="mb-1.5 block text-[13px] font-medium">Children</span>
              <Select
                value={String(draftChildAges.length)}
                onValueChange={(v) => setChildCount(Number(v))}
              >
                <SelectTrigger aria-label="Children">
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
            </div>
            <div>
              <span className="mb-1.5 block text-[13px] font-medium">Extra beds</span>
              <Select
                value={String(draftExtraBeds)}
                onValueChange={(v) => setDraftExtraBeds(Number(v))}
              >
                <SelectTrigger aria-label="Extra beds">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[0, 1, 2].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {draftChildAges.length > 0 && (
            <div className="mt-3">
              <span className="mb-1.5 block text-[13px] font-medium">
                Children&apos;s ages
              </span>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                {draftChildAges.map((age, i) => (
                  <div key={i}>
                    <label
                      htmlFor={`child-age-${i}`}
                      className="mb-1 block text-xs text-muted-foreground"
                    >
                      Child {i + 1}
                    </label>
                    <Select
                      value={String(age)}
                      onValueChange={(v) => {
                        const next = [...draftChildAges];
                        next[i] = Number(v);
                        setDraftChildAges(next);
                      }}
                    >
                      <SelectTrigger id={`child-age-${i}`} aria-label={`Age of child ${i + 1}`}>
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

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button onClick={() => commit()} disabled={Boolean(dateError)}>
              <Search aria-hidden="true" />
              Search
            </Button>
            <Button variant="ghost" onClick={reset}>
              <RotateCcw aria-hidden="true" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results / empty states */}
      {!hasRun ? (
        <div className="mt-6">
          <EmptyState
            icon={Search}
            title="Enter your client's stay details"
            description="Pick a destination, dates and party size above, then press Search to see contracted hotels and live demo pricing."
          />
        </div>
      ) : results.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Search}
            title="No hotels match your search"
            description="Try different dates or clear filters — or search by destination, e.g. “Ubud” or “Seminyak”."
            action={
              <Button variant="outline" onClick={reset}>
                <RotateCcw aria-hidden="true" />
                Clear filters
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {results.length} hotel{results.length === 1 ? "" : "s"} found
              {query.q.trim() ? <> for “{query.q.trim()}”</> : null}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-muted-foreground">Sort</span>
              <Select
                value={query.sort}
                onValueChange={(v) => {
                  const p = buildParams({ ...query, childAges: query.childAges, run: true, sort: v });
                  setSearchParams(p);
                }}
              >
                <SelectTrigger className="w-44" aria-label="Sort results">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recommended">Recommended</SelectItem>
                  <SelectItem value="price-asc">Price: low to high</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-3 grid gap-4">
            {results.map((hotel) => {
              const expanded = expandedHotelId === hotel.id;
              const chips = hotel.inclusions.slice(0, 3);
              const extra = hotel.inclusions.length - chips.length;
              return (
                <Card key={hotel.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-4 sm:flex-row">
                      <HotelThumb
                        hue={hotel.imageHue}
                        name={hotel.name}
                        className="aspect-[4/3] w-full shrink-0 rounded-lg sm:aspect-auto sm:h-36 sm:w-52"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-base font-semibold">{hotel.name}</h2>
                          <CategoryBadge stars={hotel.category} />
                        </div>
                        <p className="mt-0.5 text-[13px] text-muted-foreground">
                          {hotel.destination}
                        </p>
                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                          {hotel.description}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-1.5">
                          {chips.map((inc) => (
                            <Badge key={inc} variant="secondary" className="gap-1">
                              <Check aria-hidden="true" />
                              {inc}
                            </Badge>
                          ))}
                          {extra > 0 && (
                            <Badge variant="outline">+{extra} more</Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpandedHotelId(expanded ? null : hotel.id)}
                        aria-expanded={expanded}
                      >
                        {expanded ? (
                          <ChevronUp aria-hidden="true" />
                        ) : (
                          <ChevronDown aria-hidden="true" />
                        )}
                        {expanded ? "Hide rooms" : "View rooms"}
                      </Button>
                      {expanded && (
                        <RoomList hotel={hotel} query={query} />
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Rates shown are demo data for this prototype.
          </p>
        </>
      )}
    </div>
  );
}
