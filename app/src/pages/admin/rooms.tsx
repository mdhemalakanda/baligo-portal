/**
 * Admin · Room types — global room-type management across all hotels.
 * UI-only demo over mock data.
 */
import * as React from "react";
import { Plus, Ruler, Users, Utensils, BedDouble } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { Field } from "@/components/shared/form-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { hotels, roomTypes, hotelById, type RoomType } from "@/data/mock";
import { cn } from "@/lib/utils";

const MEALS_OPTIONS = [
  "Room only",
  "Breakfast",
  "Half board",
  "Breakfast + dinner",
  "All inclusive",
];

const AMENITY_OPTIONS = [
  "Balcony",
  "Rain shower",
  "Bathtub",
  "Mini bar",
  "Safe",
  "Smart TV",
  "Espresso machine",
  "Living area",
  "Private pool",
  "Outdoor shower",
  "Kitchenette",
  "Butler service",
];

function numSelect(n: number) {
  return Array.from({ length: n + 1 }, (_, i) => String(i));
}

/* ------------------------------------------------------------------ */
/* Room form (shared by Edit sheet + Add sheet)                        */
/* ------------------------------------------------------------------ */

interface RoomFormState {
  hotelId: string;
  name: string;
  description: string;
  sizeSqm: string;
  bedType: string;
  stdAdults: string;
  stdChildren: string;
  maxAdults: string;
  maxChildren: string;
  maxTotal: string;
  extraBedEligible: boolean;
  maxExtraBeds: string;
  amenities: string[];
  meals: string;
  childPolicy: string;
  extraBedPolicy: string;
}

const EMPTY_FORM: RoomFormState = {
  hotelId: "",
  name: "",
  description: "",
  sizeSqm: "",
  bedType: "",
  stdAdults: "2",
  stdChildren: "0",
  maxAdults: "2",
  maxChildren: "0",
  maxTotal: "2",
  extraBedEligible: false,
  maxExtraBeds: "0",
  amenities: [],
  meals: "Breakfast",
  childPolicy: "",
  extraBedPolicy: "",
};

function formFromRoom(room: RoomType): RoomFormState {
  const meals = MEALS_OPTIONS.find((m) => room.meals.toLowerCase().includes(m.toLowerCase()));
  return {
    hotelId: room.hotelId,
    name: room.name,
    description: room.description,
    sizeSqm: String(room.sizeSqm),
    bedType: room.bedType,
    stdAdults: String(room.standardOccupancy.adults),
    stdChildren: String(room.standardOccupancy.children),
    maxAdults: String(room.maxOccupancy.adults),
    maxChildren: String(room.maxOccupancy.children),
    maxTotal: String(room.maxOccupancy.total),
    extraBedEligible: room.extraBedEligible,
    maxExtraBeds: String(room.maxExtraBeds),
    amenities: [...room.amenities],
    meals: meals ?? room.meals,
    childPolicy: room.childPolicy,
    extraBedPolicy: room.extraBedPolicy,
  };
}

function RoomForm({
  mode,
  form,
  onChange,
  nameError,
}: {
  mode: "create" | "edit";
  form: RoomFormState;
  onChange: (patch: Partial<RoomFormState>) => void;
  nameError?: string;
}) {
  const toggleAmenity = (a: string) =>
    onChange({
      amenities: form.amenities.includes(a)
        ? form.amenities.filter((x) => x !== a)
        : [...form.amenities, a],
    });

  return (
    <div className="flex flex-col gap-5">
      {mode === "create" && (
        <Field label="Hotel" required>
          <Select value={form.hotelId} onValueChange={(v) => onChange({ hotelId: v })}>
            <SelectTrigger aria-label="Hotel">
              <SelectValue placeholder="Select a hotel" />
            </SelectTrigger>
            <SelectContent>
              {hotels.map((h) => (
                <SelectItem key={h.id} value={h.id}>
                  {h.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      )}

      <Field label="Room name" required error={nameError}>
        <Input
          value={form.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="e.g. Deluxe Garden Room"
          aria-invalid={!!nameError}
        />
      </Field>

      <Field label="Description" hint="Short selling description shown on quotations.">
        <Textarea
          value={form.description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={3}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Size (m²)">
          <Input
            type="number"
            min={0}
            value={form.sizeSqm}
            onChange={(e) => onChange({ sizeSqm: e.target.value })}
            inputMode="numeric"
          />
        </Field>
        <Field label="Bed type">
          <Input
            value={form.bedType}
            onChange={(e) => onChange({ bedType: e.target.value })}
            placeholder="King or 2 twins"
          />
        </Field>
      </div>

      <div>
        <p className="text-[13px] font-medium">Standard occupancy</p>
        <p className="mb-2 text-xs text-muted-foreground">
          Guests included in the base room rate.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Adults">
            <Select value={form.stdAdults} onValueChange={(v) => onChange({ stdAdults: v })}>
              <SelectTrigger aria-label="Standard adults">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>{numSelect(6).map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Children">
            <Select value={form.stdChildren} onValueChange={(v) => onChange({ stdChildren: v })}>
              <SelectTrigger aria-label="Standard children">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>{numSelect(4).map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
        </div>
      </div>

      <div>
        <p className="text-[13px] font-medium">Maximum occupancy</p>
        <p className="mb-2 text-xs text-muted-foreground">
          Hard ceiling including extra beds — the total cannot be exceeded even with paid extras.
        </p>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Adults">
            <Select value={form.maxAdults} onValueChange={(v) => onChange({ maxAdults: v })}>
              <SelectTrigger aria-label="Max adults">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>{numSelect(8).map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Children">
            <Select value={form.maxChildren} onValueChange={(v) => onChange({ maxChildren: v })}>
              <SelectTrigger aria-label="Max children">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>{numSelect(6).map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Total">
            <Select value={form.maxTotal} onValueChange={(v) => onChange({ maxTotal: v })}>
              <SelectTrigger aria-label="Max total guests">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>{numSelect(10).map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <Label htmlFor="extra-bed-switch" className="text-[13px] font-medium">
              Extra bed eligible
            </Label>
            <p className="text-xs text-muted-foreground">
              Whether a paid extra bed can be added to this room type.
            </p>
          </div>
          <Switch
            id="extra-bed-switch"
            checked={form.extraBedEligible}
            onCheckedChange={(v) =>
              onChange({ extraBedEligible: v, maxExtraBeds: v ? form.maxExtraBeds || "1" : "0" })
            }
          />
        </div>
        {form.extraBedEligible && (
          <Field label="Max extra beds" className="mt-4">
            <Select value={form.maxExtraBeds} onValueChange={(v) => onChange({ maxExtraBeds: v })}>
              <SelectTrigger aria-label="Max extra beds">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>{numSelect(3).map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
        )}
      </div>

      <Field label="Amenities" hint="Select everything included in this room type.">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Amenities">
          {AMENITY_OPTIONS.map((a) => {
            const checked = form.amenities.includes(a);
            return (
              <label
                key={a}
                className={cn(
                  "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  checked
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted",
                )}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => toggleAmenity(a)}
                  aria-label={a}
                  className="sr-only"
                />
                {a}
              </label>
            );
          })}
        </div>
      </Field>

      <Field label="Meals">
        <Select value={form.meals} onValueChange={(v) => onChange({ meals: v })}>
          <SelectTrigger aria-label="Meals">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MEALS_OPTIONS.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Child policy">
        <Textarea
          value={form.childPolicy}
          onChange={(e) => onChange({ childPolicy: e.target.value })}
          rows={3}
          placeholder="e.g. Children under 12 stay free using existing bedding."
        />
      </Field>

      <Field label="Extra-bed policy">
        <Textarea
          value={form.extraBedPolicy}
          onChange={(e) => onChange({ extraBedPolicy: e.target.value })}
          rows={2}
          placeholder="e.g. One extra bed permitted; IDR 450,000/night."
        />
      </Field>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

interface RoomRow extends RoomType {
  hotelName: string;
}

export function RoomTypesList() {
  const [hotelFilter, setHotelFilter] = React.useState<string>("all");
  const [editing, setEditing] = React.useState<RoomRow | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [form, setForm] = React.useState<RoomFormState>(EMPTY_FORM);
  const [nameError, setNameError] = React.useState<string | undefined>(undefined);

  const rows: RoomRow[] = React.useMemo(
    () =>
      roomTypes
        .filter((r) => hotelFilter === "all" || r.hotelId === hotelFilter)
        .map((r) => ({ ...r, hotelName: hotelById(r.hotelId)?.name ?? "—" })),
    [hotelFilter],
  );

  const openEdit = (room: RoomRow) => {
    setEditing(room);
    setCreating(false);
    setNameError(undefined);
    setForm(formFromRoom(room));
  };

  const openCreate = () => {
    setCreating(true);
    setEditing(null);
    setNameError(undefined);
    setForm({ ...EMPTY_FORM, hotelId: hotelFilter !== "all" ? hotelFilter : "" });
  };

  const close = () => {
    setEditing(null);
    setCreating(false);
  };

  const save = () => {
    if (!form.name.trim()) {
      setNameError("Room name is required.");
      return;
    }
    const hotel = hotelById(form.hotelId)?.name ?? "hotel";
    toast.success(
      `Room type “${form.name.trim()}” saved for ${hotel} (demo — nothing was stored)`,
    );
    close();
  };

  const columns: Column<RoomRow>[] = [
    {
      key: "name",
      header: "Room",
      sortable: true,
      render: (r) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{r.name}</p>
          <p className="truncate text-xs text-muted-foreground">{r.hotelName}</p>
        </div>
      ),
    },
    {
      key: "size",
      header: "Size / bed",
      render: (r) => (
        <div className="min-w-0">
          <p className="amount tabular-nums">{r.sizeSqm} m²</p>
          <p className="truncate text-xs text-muted-foreground">{r.bedType}</p>
        </div>
      ),
    },
    {
      key: "occupancy",
      header: "Occupancy",
      render: (r) => {
        const { adults, children } = r.standardOccupancy;
        const parts = [`${adults} adult${adults === 1 ? "" : "s"}`];
        if (children > 0) parts.push(`${children} child${children === 1 ? "" : "ren"}`);
        return (
          <div className="min-w-0">
            <p className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              {parts.join(" + ")}
            </p>
            <p className="text-xs text-muted-foreground">
              Max {r.maxOccupancy.adults}+{r.maxOccupancy.children} / {r.maxOccupancy.total}
            </p>
          </div>
        );
      },
    },
    {
      key: "extraBed",
      header: "Extra bed",
      render: (r) =>
        r.extraBedEligible ? (
          <Badge variant="success">Yes, up to {r.maxExtraBeds}</Badge>
        ) : (
          <Badge variant="neutral">Not eligible</Badge>
        ),
    },
    {
      key: "meals",
      header: "Meals",
      render: (r) => (
        <span className="flex items-center gap-1.5 text-sm">
          <Utensils className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span className="truncate">{r.meals}</span>
        </span>
      ),
    },
  ];

  const sheetOpen = creating || editing !== null;

  return (
    <div>
      <PageHeader
        title="Room types"
        description="Standard room inventory shared by every quotation — sizes, occupancy and meal plans per hotel."
        breadcrumbs={[
          { label: "Admin", to: "/admin" },
          { label: "Room types" },
        ]}
        actions={
          <Button onClick={openCreate}>
            <Plus aria-hidden="true" /> Add room type
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {rows.length} room {rows.length === 1 ? "type" : "types"}
          {hotelFilter !== "all" && <> at {hotelById(hotelFilter)?.name}</>}
        </p>
        <Select value={hotelFilter} onValueChange={setHotelFilter}>
          <SelectTrigger className="sm:w-72" aria-label="Filter by hotel">
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
      </div>

      <DataTable<RoomRow>
        columns={columns}
        rows={rows}
        searchable={(r) => `${r.name} ${r.hotelName} ${r.bedType} ${r.meals}`}
        onRowClick={openEdit}
        pageSize={8}
        emptyState={
          <EmptyState
            icon={BedDouble}
            title="No room types found"
            description={
              hotelFilter !== "all"
                ? "This hotel has no room types yet. Add one to start building rates."
                : "Add your first room type to start building rates."
            }
            action={
              <Button onClick={openCreate} variant="outline">
                <Plus aria-hidden="true" /> Add room type
              </Button>
            }
          />
        }
      />

      <Sheet open={sheetOpen} onOpenChange={(o) => !o && close()}>
        <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
          <SheetHeader className="border-b p-5">
            <SheetTitle className="flex items-center gap-2">
              <Ruler className="h-4 w-4 text-primary" aria-hidden="true" />
              {editing ? `Edit ${editing.name}` : "Add room type"}
            </SheetTitle>
            <SheetDescription>
              {editing
                ? hotelById(editing.hotelId)?.name
                : "Room details apply to every season and rate for this hotel."}
            </SheetDescription>
          </SheetHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
            <RoomForm
              mode={editing ? "edit" : "create"}
              form={form}
              onChange={(patch) => {
                setForm((f) => ({ ...f, ...patch }));
                if (patch.name !== undefined && patch.name.trim()) setNameError(undefined);
              }}
              nameError={nameError}
            />
          </div>

          <Separator />
          <div className="flex flex-row items-center justify-end gap-2 p-5">
            <Button variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button onClick={save}>{editing ? "Save changes" : "Create room type"}</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
