/**
 * Admin hotel detail: overview, room types and seasonal rates.
 * UI-only demo — room editing is a local dialog; saving only shows a toast.
 */
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  BedDouble,
  Building2,
  MapPin,
  Pencil,
  Plus,
  Ruler,
  Trash2,
  UtensilsCrossed,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { CategoryBadge, HotelStatus, RateStatus } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Field } from "@/components/shared/form-section";
import {
  hotelById,
  roomById,
  roomTypes,
  roomsByHotel,
  seasonalRates,
  type HotelStatus as HotelStatusValue,
  type RoomType,
} from "@/data/mock";
import { cn, fmtDate, idr } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Placeholder artwork                                                 */
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

/* ------------------------------------------------------------------ */
/* Room dialog presets + helpers                                       */
/* ------------------------------------------------------------------ */

const BED_TYPES = ["King", "Queen", "Twin", "King or 2 twins", "2 × Queen", "2 × King"];
const MEALS = [
  "Room only",
  "Breakfast included",
  "Breakfast + dinner included",
  "Breakfast + evening canapés",
  "Half board",
  "Full board",
  "All inclusive",
];
/** Preset room-amenity chips derived from the full mock catalogue. */
const ALL_ROOM_AMENITIES = [...new Set(roomTypes.flatMap((r) => r.amenities))].sort();

const STATUS_LABEL: Record<HotelStatusValue, string> = {
  active: "Active",
  draft: "Draft",
  inactive: "Inactive",
};

function occupancyLabel(adults: number, children: number) {
  return `${adults} adult${adults === 1 ? "" : "s"} + ${children} child${children === 1 ? "" : "ren"}`;
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function HotelDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const hotel = id ? hotelById(id) : undefined;

  const [status, setStatus] = useState<HotelStatusValue>(hotel?.status ?? "draft");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [roomDialogOpen, setRoomDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomType | null>(null);

  // Re-sync the demo status if the route param changes.
  useEffect(() => {
    setStatus(hotel?.status ?? "draft");
  }, [hotel?.status, id]);

  if (!hotel) {
    return (
      <div>
        <PageHeader
          title="Hotel"
          breadcrumbs={[{ label: "Hotels", to: "/admin/hotels" }, { label: "Not found" }]}
        />
        <EmptyState
          icon={Building2}
          title="Hotel not found"
          description="The hotel you are looking for does not exist in the demo catalogue."
          action={
            <Button asChild>
              <Link to="/admin/hotels">Back to hotels</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const rooms = roomsByHotel(hotel.id);
  const rates = seasonalRates.filter((r) => r.hotelId === hotel.id);

  function openRoomDialog(room: RoomType | null) {
    setEditingRoom(room);
    setRoomDialogOpen(true);
  }

  return (
    <div>
      <PageHeader
        title={hotel.name}
        breadcrumbs={[{ label: "Hotels", to: "/admin/hotels" }, { label: hotel.name }]}
        actions={
          <>
            <Button asChild variant="outline">
              <Link to={`/admin/hotels/${hotel.id}/edit`}>
                <Pencil aria-hidden="true" /> Edit
              </Link>
            </Button>
            <Select
              value={status}
              onValueChange={(v) => {
                const next = v as HotelStatusValue;
                setStatus(next);
                toast.success(
                  `${hotel.name} status set to ${STATUS_LABEL[next]} (demo — nothing was stored)`,
                );
              }}
            >
              <SelectTrigger className="w-[132px]" aria-label="Hotel status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(STATUS_LABEL) as HotelStatusValue[]).map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
              <Trash2 aria-hidden="true" /> Delete
            </Button>
          </>
        }
      />

      {/* Hero strip */}
      <div className="mb-6 overflow-hidden rounded-xl border bg-card shadow-sm">
        <HotelThumb hue={hotel.imageHue} name={hotel.name} className="h-24 w-full sm:h-32" />
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4 sm:p-5">
          <CategoryBadge stars={hotel.category} />
          <HotelStatus status={status} />
          <span className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            {hotel.destination}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
            {hotel.address}
          </span>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList aria-label="Hotel sections">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rooms">Room types ({rooms.length})</TabsTrigger>
          <TabsTrigger value="rates">Rates ({rates.length})</TabsTrigger>
        </TabsList>

        {/* ------------------------------ Overview ------------------------------ */}
        <TabsContent value="overview" className="mt-6 space-y-4">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-base">About this property</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
                {hotel.description}
              </p>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="mb-2 text-[13px] font-semibold">Amenities</h3>
                  <ul className="flex flex-wrap gap-2">
                    {hotel.amenities.map((a) => (
                      <li key={a}>
                        <Chip label={a} />
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="mb-2 text-[13px] font-semibold">Inclusions</h3>
                  <ul className="flex flex-wrap gap-2">
                    {hotel.inclusions.map((i) => (
                      <li key={i}>
                        <Chip label={i} variant="teal" />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div>
                <h3 className="mb-3 text-[13px] font-semibold">Policies</h3>
                <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <PolicyTerm label="Check-in" value={hotel.policies.checkIn} />
                  <PolicyTerm label="Check-out" value={hotel.policies.checkOut} />
                  <PolicyTerm label="Cancellation" value={hotel.policies.cancellation} />
                  <PolicyTerm label="Children" value={hotel.policies.children} />
                  <PolicyTerm label="Extra bed" value={hotel.policies.extraBed} />
                </dl>
              </div>
              <p className="border-t pt-4 text-xs text-muted-foreground">
                Last updated {fmtDate(hotel.lastUpdated)} by {hotel.updatedBy} · ID {hotel.id}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ------------------------------ Rooms ------------------------------ */}
        <TabsContent value="rooms" className="mt-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">Room types</h2>
            <Button size="sm" onClick={() => openRoomDialog(null)}>
              <Plus aria-hidden="true" /> Add room type
            </Button>
          </div>
          {rooms.length === 0 ? (
            <EmptyState
              icon={BedDouble}
              title="No room types yet"
              description="Add the first room type so this hotel can be quoted to agents."
              action={
                <Button size="sm" onClick={() => openRoomDialog(null)}>
                  <Plus aria-hidden="true" /> Add room type
                </Button>
              }
            />
          ) : (
            <Card>
              <ul className="divide-y">
                {rooms.map((r) => (
                  <li
                    key={r.id}
                    className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-start lg:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold">{r.name}</p>
                      <p className="mt-0.5 text-[13px] leading-snug text-muted-foreground">
                        {r.description}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[13px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <Ruler className="h-3.5 w-3.5" aria-hidden="true" />
                          {r.sizeSqm} m²
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <BedDouble className="h-3.5 w-3.5" aria-hidden="true" />
                          {r.bedType}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5" aria-hidden="true" />
                          {occupancyLabel(r.standardOccupancy.adults, r.standardOccupancy.children)}
                        </span>
                        <span>
                          Max occupancy:{" "}
                          <span className="amount tabular-nums font-medium text-foreground">
                            {r.maxOccupancy.total}
                          </span>{" "}
                          ({occupancyLabel(r.maxOccupancy.adults, r.maxOccupancy.children)})
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <UtensilsCrossed className="h-3.5 w-3.5" aria-hidden="true" />
                          {r.meals}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {r.extraBedEligible ? (
                        <Badge variant="teal">Extra bed · up to {r.maxExtraBeds}</Badge>
                      ) : (
                        <Badge variant="neutral">No extra bed</Badge>
                      )}
                      <Button variant="outline" size="sm" onClick={() => openRoomDialog(r)}>
                        <Pencil aria-hidden="true" /> Edit
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </TabsContent>

        {/* ------------------------------ Rates ------------------------------ */}
        <TabsContent value="rates" className="mt-6">
          <RateTable rates={rates} />
        </TabsContent>
      </Tabs>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        destructive
        title="Delete this hotel?"
        description={`${hotel.name} and its rates will be removed from the catalogue. This cannot be undone.`}
        confirmLabel="Delete hotel"
        onConfirm={() => {
          toast.success(`${hotel.name} deleted (demo — nothing was stored)`);
          navigate("/admin/hotels");
        }}
      />

      {/* Room create / edit dialog */}
      <RoomDialog
        open={roomDialogOpen}
        onOpenChange={setRoomDialogOpen}
        room={editingRoom}
        onSaved={() => setRoomDialogOpen(false)}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Rates table                                                         */
/* ------------------------------------------------------------------ */

interface RateRow {
  id: string;
  roomId: string;
  seasonName: string;
  startDate: string;
  endDate: string;
  minStay: number;
  status: string;
  netRateIdr: number;
}

function RateTable({ rates }: { rates: RateRow[] }) {
  const navigate = useNavigate();

  const columns: Column<RateRow>[] = [
    {
      key: "roomId",
      header: "Room",
      render: (r) => (
        <span className="max-w-[200px] truncate font-medium">
          {roomById(r.roomId)?.name ?? r.roomId}
        </span>
      ),
    },
    {
      key: "seasonName",
      header: "Season",
      sortable: true,
      render: (r) => <span className="whitespace-nowrap text-[13px]">{r.seasonName}</span>,
    },
    {
      key: "startDate",
      header: "Dates",
      sortable: true,
      render: (r) => (
        <span className="whitespace-nowrap text-[13px] text-muted-foreground">
          {fmtDate(r.startDate)} – {fmtDate(r.endDate)}
        </span>
      ),
    },
    {
      key: "minStay",
      header: "Min stay",
      sortable: true,
      render: (r) => (
        <span className="amount tabular-nums whitespace-nowrap text-[13px]">
          {r.minStay} {r.minStay === 1 ? "night" : "nights"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => <RateStatus status={r.status} />,
    },
    {
      key: "netRateIdr",
      header: "Net (IDR)",
      sortable: true,
      headerClassName: "text-right",
      className: "text-right",
      render: (r) => (
        <span className="amount tabular-nums whitespace-nowrap font-medium">{idr(r.netRateIdr)}</span>
      ),
    },
  ];

  if (rates.length === 0) {
    return (
      <EmptyState
        icon={BedDouble}
        title="No seasonal rates"
        description="No supplier rates have been loaded for this hotel yet. Import a contract or add rates manually."
        action={
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/contracts">Import contract</Link>
          </Button>
        }
      />
    );
  }

  return (
    <DataTable
      columns={columns}
      rows={rates}
      searchable={(r) => `${r.seasonName} ${roomById(r.roomId)?.name ?? ""}`}
      pageSize={8}
      onRowClick={(r) => navigate(`/admin/rates/${r.id}`)}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Room dialog                                                         */
/* ------------------------------------------------------------------ */

interface RoomDraft {
  name: string;
  description: string;
  sizeSqm: number;
  bedType: string;
  adults: number;
  children: number;
  maxTotal: number;
  extraBedEligible: boolean;
  maxExtraBeds: number;
  meals: string;
  childPolicy: string;
  extraBedPolicy: string;
  amenities: Set<string>;
}

function draftFromRoom(room: RoomType | null): RoomDraft {
  return {
    name: room?.name ?? "",
    description: room?.description ?? "",
    sizeSqm: room?.sizeSqm ?? 30,
    bedType: room?.bedType ?? "King",
    adults: room?.standardOccupancy.adults ?? 2,
    children: room?.standardOccupancy.children ?? 0,
    maxTotal: room?.maxOccupancy.total ?? 3,
    extraBedEligible: room?.extraBedEligible ?? false,
    maxExtraBeds: room?.maxExtraBeds ?? 0,
    meals: room?.meals ?? "Breakfast included",
    childPolicy: room?.childPolicy ?? "",
    extraBedPolicy: room?.extraBedPolicy ?? "",
    amenities: new Set(room?.amenities ?? []),
  };
}

function RoomDialog({
  open,
  onOpenChange,
  room,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: RoomType | null;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState<RoomDraft>(() => draftFromRoom(room));

  // Re-seed the form whenever a different room (or "new") is opened.
  useEffect(() => {
    if (open) setDraft(draftFromRoom(room));
  }, [open, room]);

  function set<K extends keyof RoomDraft>(key: K, value: RoomDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function toggleAmenity(a: string) {
    setDraft((d) => {
      const next = new Set(d.amenities);
      if (next.has(a)) {
        next.delete(a);
      } else {
        next.add(a);
      }
      return { ...d, amenities: next };
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.name.trim()) {
      toast.error("Room name is required.");
      return;
    }
    toast.success(`Room type “${draft.name.trim()}” saved (demo — nothing was stored)`);
    onSaved();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{room ? `Edit ${room.name}` : "Add room type"}</DialogTitle>
          <DialogDescription>
            Occupancy and extra-bed rules drive what agents can quote for this hotel.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
          <Field label="Room name" htmlFor="room-name" required className="sm:col-span-2">
            <Input
              id="room-name"
              value={draft.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Deluxe Garden Room"
            />
          </Field>
          <Field label="Description" htmlFor="room-description" className="sm:col-span-2">
            <Textarea
              id="room-description"
              rows={2}
              value={draft.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Short selling description"
            />
          </Field>
          <Field label="Size (m²)" htmlFor="room-size">
            <Input
              id="room-size"
              type="number"
              min={10}
              max={600}
              className="amount tabular-nums"
              value={draft.sizeSqm}
              onChange={(e) => set("sizeSqm", Number(e.target.value) || 0)}
            />
          </Field>
          <Field label="Bed type" htmlFor="room-bed">
            <Select value={draft.bedType} onValueChange={(v) => set("bedType", v)}>
              <SelectTrigger id="room-bed" aria-label="Bed type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BED_TYPES.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Adults (standard)" htmlFor="room-adults">
            <NumberSelect
              id="room-adults"
              ariaLabel="Standard adults"
              value={draft.adults}
              onChange={(v) => set("adults", v)}
              from={1}
              to={6}
              suffix="adults"
            />
          </Field>
          <Field label="Children (standard)" htmlFor="room-children">
            <NumberSelect
              id="room-children"
              ariaLabel="Standard children"
              value={draft.children}
              onChange={(v) => set("children", v)}
              from={0}
              to={4}
              suffix="children"
            />
          </Field>
          <Field
            label="Max occupancy (total)"
            htmlFor="room-max"
            hint="Total guests including children and extra beds."
            className="sm:col-span-2"
          >
            <NumberSelect
              id="room-max"
              ariaLabel="Maximum total occupancy"
              value={draft.maxTotal}
              onChange={(v) => set("maxTotal", v)}
              from={1}
              to={8}
              suffix="guests"
            />
          </Field>

          {/* Extra bed */}
          <div className="flex items-center justify-between gap-3 rounded-lg border p-3 sm:col-span-2">
            <div>
              <p className="text-[13px] font-medium">Extra bed eligible</p>
              <p className="text-xs text-muted-foreground">
                Allow agents to add extra beds to this room type.
              </p>
            </div>
            <Switch
              checked={draft.extraBedEligible}
              onCheckedChange={(checked) => {
                set("extraBedEligible", checked);
                if (!checked) set("maxExtraBeds", 0);
              }}
              aria-label="Extra bed eligible"
            />
          </div>
          {draft.extraBedEligible && (
            <Field
              label="Max extra beds"
              htmlFor="room-extrabeds"
              className="sm:col-span-2"
            >
              <NumberSelect
                id="room-extrabeds"
                ariaLabel="Maximum extra beds"
                value={draft.maxExtraBeds}
                onChange={(v) => set("maxExtraBeds", v)}
                from={1}
                to={3}
                suffix="beds"
              />
            </Field>
          )}

          <Field label="Meals" htmlFor="room-meals" className="sm:col-span-2">
            <Select value={draft.meals} onValueChange={(v) => set("meals", v)}>
              <SelectTrigger id="room-meals" aria-label="Meals">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MEALS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Child policy" htmlFor="room-childpolicy">
            <Textarea
              id="room-childpolicy"
              rows={3}
              value={draft.childPolicy}
              onChange={(e) => set("childPolicy", e.target.value)}
              placeholder="Children under X stay free…"
            />
          </Field>
          <Field label="Extra-bed policy" htmlFor="room-extrabedpolicy">
            <Textarea
              id="room-extrabedpolicy"
              rows={3}
              value={draft.extraBedPolicy}
              onChange={(e) => set("extraBedPolicy", e.target.value)}
              placeholder="Extra bed at IDR …/night…"
            />
          </Field>
          <Field label="Room amenities" htmlFor="room-amenities" className="sm:col-span-2">
            <div id="room-amenities" className="flex flex-wrap gap-2">
              {ALL_ROOM_AMENITIES.map((a) => (
                <ChipToggle
                  key={a}
                  label={a}
                  checked={draft.amenities.has(a)}
                  onToggle={() => toggleAmenity(a)}
                />
              ))}
            </div>
          </Field>
          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save room type</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Small shared bits                                                   */
/* ------------------------------------------------------------------ */

function NumberSelect({
  id,
  ariaLabel,
  value,
  onChange,
  from,
  to,
  suffix,
}: {
  id: string;
  ariaLabel: string;
  value: number;
  onChange: (v: number) => void;
  from: number;
  to: number;
  suffix?: string;
}) {
  const options = Array.from({ length: to - from + 1 }, (_, i) => from + i);
  return (
    <Select
      value={String(value)}
      onValueChange={(v) => onChange(Number(v))}
    >
      <SelectTrigger id={id} aria-label={ariaLabel}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((n) => (
          <SelectItem key={n} value={String(n)}>
            <span className="amount tabular-nums">
              {n} {suffix}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function Chip({ label, variant = "default" }: { label: React.ReactNode; variant?: "default" | "teal" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-[13px]",
        variant === "teal"
          ? "border-teal/25 bg-teal/10 text-teal-800"
          : "bg-card text-muted-foreground",
      )}
    >
      {label}
    </span>
  );
}

function ChipToggle({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onToggle}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        checked
          ? "border-primary/40 bg-primary/10 text-primary"
          : "bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

function PolicyTerm({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[13px] font-medium">{label}</dt>
      <dd className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">{value}</dd>
    </div>
  );
}
