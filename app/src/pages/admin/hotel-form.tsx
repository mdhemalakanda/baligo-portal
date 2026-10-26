/**
 * Add / edit hotel screen.
 * UI-only demo — validation is visual, saving shows a toast and navigates back.
 */
import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormSection, Field } from "@/components/shared/form-section";
import { DemoNote } from "@/components/shared/demo-note";
import { hotels, hotelById, type HotelStatus } from "@/data/mock";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Presets                                                             */
/* ------------------------------------------------------------------ */

const AMENITY_PRESET = [...new Set(hotels.flatMap((h) => h.amenities))].sort();
const INCLUSION_PRESET = [...new Set(hotels.flatMap((h) => h.inclusions))].sort();
const COUNTRIES = ["Indonesia", "Malaysia", "Thailand", "Vietnam", "Sri Lanka"];
const CATEGORIES = [3, 4, 5];
const STATUSES: { value: HotelStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "inactive", label: "Inactive" },
];

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function HotelForm({ mode }: { mode: "create" | "edit" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  // Edit mode: load by route param, fall back to the first mock hotel.
  const hotel = mode === "edit" ? hotelById(id ?? "") ?? hotels[0] : undefined;

  const [name, setName] = useState(hotel?.name ?? "");
  const [destination, setDestination] = useState(hotel?.destination ?? "");
  const [country, setCountry] = useState(hotel?.country ?? "Indonesia");
  const [address, setAddress] = useState(hotel?.address ?? "");
  const [category, setCategory] = useState(String(hotel?.category ?? 4));
  const [status, setStatus] = useState<HotelStatus>(hotel?.status ?? "draft");
  const [description, setDescription] = useState(hotel?.description ?? "");
  const [amenities, setAmenities] = useState<Set<string>>(new Set(hotel?.amenities ?? []));
  const [inclusions, setInclusions] = useState<Set<string>>(new Set(hotel?.inclusions ?? []));
  const [checkIn, setCheckIn] = useState(hotel?.policies.checkIn ?? "");
  const [checkOut, setCheckOut] = useState(hotel?.policies.checkOut ?? "");
  const [cancellation, setCancellation] = useState(hotel?.policies.cancellation ?? "");
  const [children, setChildren] = useState(hotel?.policies.children ?? "");
  const [extraBed, setExtraBed] = useState(hotel?.policies.extraBed ?? "");
  const [errors, setErrors] = useState<{ name?: string; destination?: string }>({});

  function toggle(set: Set<string>, value: string, apply: (next: Set<string>) => void) {
    const next = new Set(set);
    if (next.has(value)) {
      next.delete(value);
    } else {
      next.add(value);
    }
    apply(next);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors: { name?: string; destination?: string } = {};
    if (!name.trim()) nextErrors.name = "Hotel name is required.";
    if (!destination.trim()) nextErrors.destination = "Destination is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please fix the highlighted fields before saving.");
      return;
    }
    toast.success(
      `Hotel ${mode === "edit" ? "updated" : "created"} (demo — nothing was stored)`,
    );
    navigate("/admin/hotels");
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Sticky action bar */}
      <div className="sticky top-[var(--baligo-header-h)] z-10 -mx-[30px] mb-6 border-b bg-background/95 px-[30px] py-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Button asChild variant="ghost" size="icon-sm" aria-label="Back to hotels">
              <Link to="/admin/hotels">
                <ArrowLeft aria-hidden="true" />
              </Link>
            </Button>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold tracking-tight">
                {mode === "edit" ? "Edit hotel" : "Add hotel"}
              </h1>
              {hotel && (
                <p className="truncate text-xs text-muted-foreground">{hotel.name}</p>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {mode === "edit" && (
              <span className="hidden sm:block">
                <DemoNote>Demo content — edits are simulated</DemoNote>
              </span>
            )}
            <Button asChild variant="outline">
              <Link to="/admin/hotels">Cancel</Link>
            </Button>
            <Button type="submit">Save hotel</Button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5 sm:p-8">
        <FormSection
          title="Basic information"
          description="The property's identity as agents will see it in the portal."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Hotel name" htmlFor="hotel-name" required error={errors.name}>
              <Input
                id="hotel-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
                }}
                placeholder="e.g. Nusa Dua Beachfront Resort & Spa"
                aria-invalid={!!errors.name}
              />
            </Field>
            <Field
              label="Destination"
              htmlFor="hotel-destination"
              hint="Area as shown to agents, e.g. “Ubud, Bali”"
              required
              error={errors.destination}
            >
              <Input
                id="hotel-destination"
                value={destination}
                onChange={(e) => {
                  setDestination(e.target.value);
                  if (errors.destination) setErrors((p) => ({ ...p, destination: undefined }));
                }}
                placeholder="e.g. Ubud, Bali"
                aria-invalid={!!errors.destination}
              />
            </Field>
            <Field label="Country" htmlFor="hotel-country">
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger id="hotel-country" aria-label="Country">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Address" htmlFor="hotel-address">
              <Input
                id="hotel-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address"
              />
            </Field>
          </div>
        </FormSection>

        <FormSection
          title="Classification"
          description="Star rating drives the badge shown on quotations."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category" htmlFor="hotel-category">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="hotel-category" aria-label="Category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={String(c)}>
                      {c} stars
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field
              label="Status"
              htmlFor="hotel-status"
              hint="Only active hotels appear in agent quotations."
            >
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as HotelStatus)}
              >
                <SelectTrigger id="hotel-status" aria-label="Status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        </FormSection>

        <FormSection
          title="Description"
          description="A short overview shown at the top of the hotel page."
        >
          <Field label="Overview" htmlFor="hotel-description">
            <Textarea
              id="hotel-description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the setting, pools, dining and what makes this property sell."
            />
          </Field>
        </FormSection>

        <FormSection
          title="Amenities & inclusions"
          description="Toggle what applies to this property. Lists are shared across the demo catalogue."
        >
          <div className="space-y-5">
            <div>
              <p className="mb-2 text-[13px] font-medium">Amenities</p>
              <div className="flex flex-wrap gap-2">
                {AMENITY_PRESET.map((a) => (
                  <ChipToggle
                    key={a}
                    label={a}
                    checked={amenities.has(a)}
                    onToggle={() => toggle(amenities, a, setAmenities)}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-[13px] font-medium">Inclusions</p>
              <div className="flex flex-wrap gap-2">
                {INCLUSION_PRESET.map((i) => (
                  <ChipToggle
                    key={i}
                    label={i}
                    checked={inclusions.has(i)}
                    onToggle={() => toggle(inclusions, i, setInclusions)}
                  />
                ))}
              </div>
            </div>
          </div>
        </FormSection>

        <FormSection
          title="Policies"
          description="Free-text policies rendered on the hotel page and shared with agents."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Check-in" htmlFor="policy-checkin">
              <Textarea
                id="policy-checkin"
                rows={2}
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                placeholder="From 14:00"
              />
            </Field>
            <Field label="Check-out" htmlFor="policy-checkout">
              <Textarea
                id="policy-checkout"
                rows={2}
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                placeholder="Until 12:00"
              />
            </Field>
            <Field label="Cancellation" htmlFor="policy-cancellation" className="sm:col-span-2">
              <Textarea
                id="policy-cancellation"
                rows={3}
                value={cancellation}
                onChange={(e) => setCancellation(e.target.value)}
                placeholder="Free cancellation up to X days before check-in…"
              />
            </Field>
            <Field label="Children policy" htmlFor="policy-children">
              <Textarea
                id="policy-children"
                rows={2}
                value={children}
                onChange={(e) => setChildren(e.target.value)}
                placeholder="Children under 12 stay free…"
              />
            </Field>
            <Field label="Extra-bed policy" htmlFor="policy-extrabed">
              <Textarea
                id="policy-extrabed"
                rows={2}
                value={extraBed}
                onChange={(e) => setExtraBed(e.target.value)}
                placeholder="Extra bed available at IDR …/night."
              />
            </Field>
          </div>
        </FormSection>
      </div>

      {/* Bottom action row (mirror of the sticky bar) */}
      <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
        <Button asChild variant="outline">
          <Link to="/admin/hotels">Cancel</Link>
        </Button>
        <Button type="submit">Save hotel</Button>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Checkbox chip                                                       */
/* ------------------------------------------------------------------ */

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
      {checked && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
      {label}
    </button>
  );
}
