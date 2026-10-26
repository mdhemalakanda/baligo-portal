/**
 * Admin · Rate editor — create/edit a seasonal supplier rate.
 * UI-only demo; populated from mock data when the :id matches.
 */
import * as React from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BadgeInfo,
  CircleAlert,
  Lock,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import type { DateRange } from "react-day-picker";
import { PageHeader } from "@/components/shared/page-header";
import { FormSection, Field } from "@/components/shared/form-section";
import { DateRangePicker } from "@/components/shared/date-range-picker";
import { RateStatus } from "@/components/shared/status-badge";
import { WarningBanner } from "@/components/shared/warning-banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
  hotelById,
  hotels,
  roomById,
  roomsByHotel,
  seasonalRates,
} from "@/data/mock";
import { cn, fmtDate, idr } from "@/lib/utils";

const INCLUSION_OPTIONS = [
  "Daily breakfast",
  "Welcome drink",
  "Afternoon tea",
  "Evening canapés",
  "Return airport transfer",
  "1-hour spa credit",
  "Kids-eat-free dinner",
  "Free WiFi",
];

function isoToDate(iso: string) {
  return iso ? new Date(iso + "T00:00:00") : undefined;
}

function toIso(d: Date | undefined) {
  if (!d) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

interface ChildChargeRow {
  ageFrom: string;
  ageTo: string;
  charge: string;
}

interface SupplementRow {
  name: string;
  charge: string;
}

interface FormState {
  hotelId: string;
  roomId: string;
  seasonName: string;
  seasonRange: DateRange | undefined;
  validityRange: DateRange | undefined;
  minStay: string;
  netRate: string;
  extraBedCharge: string;
  surchargeEnabled: boolean;
  surchargePercent: string;
  surchargeNote: string;
  childCharges: ChildChargeRow[];
  inclusions: string[];
  supplements: SupplementRow[];
}

function blankForm(): FormState {
  return {
    hotelId: "",
    roomId: "",
    seasonName: "",
    seasonRange: undefined,
    validityRange: undefined,
    minStay: "2",
    netRate: "",
    extraBedCharge: "",
    surchargeEnabled: false,
    surchargePercent: "",
    surchargeNote: "",
    childCharges: [{ ageFrom: "0", ageTo: "", charge: "" }],
    inclusions: [],
    supplements: [],
  };
}

function formFromRate(id: string): FormState {
  const rate = seasonalRates.find((r) => r.id === id);
  if (!rate) return blankForm();
  return {
    hotelId: rate.hotelId,
    roomId: rate.roomId,
    seasonName: rate.seasonName,
    seasonRange: { from: isoToDate(rate.startDate), to: isoToDate(rate.endDate) },
    validityRange: { from: isoToDate(rate.validityFrom), to: isoToDate(rate.validityTo) },
    minStay: String(rate.minStay),
    netRate: String(rate.netRateIdr),
    extraBedCharge: rate.extraBedChargeIdr ? String(rate.extraBedChargeIdr) : "",
    surchargeEnabled: rate.holidaySurcharge.enabled,
    surchargePercent: rate.holidaySurcharge.enabled ? String(rate.holidaySurcharge.percent) : "",
    surchargeNote: rate.holidaySurcharge.note,
    childCharges: rate.childCharges.map((c) => ({
      ageFrom: String(c.ageFrom),
      ageTo: String(c.ageTo),
      charge: c.charge,
    })),
    inclusions: [...rate.inclusions],
    supplements: rate.supplements.map((s) => ({ ...s })),
  };
}

export function RateEditor() {
  const { id } = useParams<{ id: string }>();
  const existing = id ? seasonalRates.find((r) => r.id === id) : undefined;

  const [form, setForm] = React.useState<FormState>(() =>
    existing ? formFromRate(existing.id) : blankForm(),
  );
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = React.useState(false);

  const patch = (p: Partial<FormState>) => setForm((f) => ({ ...f, ...p }));
  const touch = (k: string) => setTouched((t) => ({ ...t, [k]: true }));

  const roomOptions = React.useMemo(() => roomsByHotel(form.hotelId), [form.hotelId]);

  const show = (key: string) => touched[key] || submitted;
  const nameError =
    show("seasonName") && !form.seasonName.trim() ? "Season name is required." : undefined;
  const hotelError =
    show("hotelId") && !form.hotelId ? "Select a hotel." : undefined;
  const roomError = show("roomId") && !form.roomId ? "Select a room type." : undefined;
  const netError =
    show("netRate") && (!form.netRate || Number(form.netRate) <= 0)
      ? "Net rate is required."
      : undefined;

  const missing: string[] = [];
  if (!form.hotelId) missing.push("hotel");
  if (!form.roomId) missing.push("room type");
  if (!form.seasonName.trim()) missing.push("season name");
  if (!form.seasonRange?.from || !form.seasonRange?.to) missing.push("season dates");
  if (!form.netRate || Number(form.netRate) <= 0) missing.push("net rate");

  const statusPreview: "draft" | "valid" =
    missing.length === 0 ? "valid" : "draft";

  const save = () => {
    setSubmitted(true);
    if (missing.length > 0) {
      toast.error("Please complete the highlighted fields before saving.");
      return;
    }
    toast.success(
      `Seasonal rate “${form.seasonName.trim()}” saved (demo — nothing was stored)`,
    );
  };

  const hotel = form.hotelId ? hotelById(form.hotelId) : undefined;
  const room = form.roomId ? roomById(form.roomId) : undefined;
  const netRateNum = Number(form.netRate) || 0;

  const headerTitle = existing
    ? `${hotel?.name ?? "Hotel"} · ${form.seasonName || existing.seasonName}`
    : "New seasonal rate";

  return (
    <div>
      <PageHeader
        title={headerTitle}
        description={
          existing
            ? `Last updated ${fmtDate(existing.updatedAt)} by ${existing.updatedBy}.`
            : "Configure a supplier net rate for one room type across a season."
        }
        breadcrumbs={[
          { label: "Admin", to: "/admin" },
          { label: "Supplier rates", to: "/admin/rates" },
          { label: existing ? `${hotelById(existing.hotelId)?.name ?? "Hotel"} · ${form.seasonName || existing.seasonName}` : "New seasonal rate" },
        ]}
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/admin/rates">
                <ArrowLeft aria-hidden="true" /> Cancel
              </Link>
            </Button>
            <Button onClick={save}>{existing ? "Save rate" : "Create rate"}</Button>
          </>
        }
      />

      <div className="grid gap-8 xl:grid-cols-[1fr_320px]">
        {/* ------------------------------------------------ main column */}
        <div className="min-w-0">
          <FormSection
            title="Scope"
            description="Which hotel and room type this seasonal rate applies to."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Hotel" required error={hotelError}>
                <div onBlur={() => touch("hotelId")}>
                  <Select
                    value={form.hotelId}
                    onValueChange={(v) => patch({ hotelId: v, roomId: "" })}
                  >
                    <SelectTrigger aria-label="Hotel" aria-invalid={!!hotelError} className={cn(hotelError && "border-destructive")}>
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
                </div>
              </Field>
              <Field label="Room type" required error={roomError}>
                <div onBlur={() => touch("roomId")}>
                  <Select
                    value={form.roomId}
                    onValueChange={(v) => patch({ roomId: v })}
                    disabled={!form.hotelId}
                  >
                    <SelectTrigger aria-label="Room type" aria-invalid={!!roomError} className={cn(roomError && "border-destructive")}>
                      <SelectValue placeholder={form.hotelId ? "Select a room type" : "Pick a hotel first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {roomOptions.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </Field>
            </div>
          </FormSection>

          <FormSection
            title="Season & validity"
            description="The season dates apply to guest stays; the validity window is when this contract price can be quoted."
          >
            <div className="grid gap-4">
              <Field label="Season name" required error={nameError}>
                <Input
                  value={form.seasonName}
                  onChange={(e) => patch({ seasonName: e.target.value })}
                  onBlur={() => touch("seasonName")}
                  placeholder="e.g. Green Season 2027"
                  aria-invalid={!!nameError}
                  className={cn(nameError && "border-destructive")}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Season dates" required>
                  <DateRangePicker
                    value={form.seasonRange}
                    onChange={(r) => patch({ seasonRange: r })}
                    placeholder="Stay dates"
                  />
                </Field>
                <Field label="Contract validity" required>
                  <DateRangePicker
                    value={form.validityRange}
                    onChange={(r) => patch({ validityRange: r })}
                    placeholder="Quoting window"
                  />
                </Field>
              </div>
              <Field label="Minimum stay (nights)" htmlFor="min-stay">
                <Input
                  id="min-stay"
                  type="number"
                  min={1}
                  value={form.minStay}
                  onChange={(e) => patch({ minStay: e.target.value })}
                  className="amount w-32 tabular-nums"
                />
              </Field>
            </div>
          </FormSection>

          <FormSection
            title="Net pricing"
            description="Supplier cost figures. Never shown to agents — quotations apply your markup."
          >
            <div className="rounded-xl border bg-muted/30 p-4">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Badge variant="default">
                  <Lock aria-hidden="true" /> Commercial — internal only
                </Badge>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Net rate / night (IDR)" required error={netError}>
                  <Input
                    type="number"
                    min={0}
                    value={form.netRate}
                    onChange={(e) => patch({ netRate: e.target.value })}
                    onBlur={() => touch("netRate")}
                    placeholder="2050000"
                    aria-invalid={!!netError}
                    className={cn("amount tabular-nums", netError && "border-destructive")}
                  />
                  {netRateNum > 0 && !netError && (
                    <p className="text-xs text-muted-foreground">
                      Preview: <span className="amount font-medium tabular-nums">{idr(netRateNum)}</span> per night
                    </p>
                  )}
                </Field>
                <Field label="Extra-bed charge / night (IDR)">
                  <Input
                    type="number"
                    min={0}
                    value={form.extraBedCharge}
                    onChange={(e) => patch({ extraBedCharge: e.target.value })}
                    placeholder="450000"
                    className="amount tabular-nums"
                  />
                </Field>
              </div>

              <Separator className="my-4" />

              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <Label htmlFor="surcharge" className="text-[13px] font-medium">
                    Holiday surcharge
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Percentage added to the nightly net rate on designated holiday dates.
                  </p>
                </div>
                <Switch
                  id="surcharge"
                  checked={form.surchargeEnabled}
                  onCheckedChange={(v) => patch({ surchargeEnabled: v })}
                  className="mt-1 shrink-0"
                />
              </div>
              {form.surchargeEnabled && (
                <div className="mt-4 grid gap-4 sm:grid-cols-[140px_1fr]">
                  <Field label="Percent">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={form.surchargePercent}
                      onChange={(e) => patch({ surchargePercent: e.target.value })}
                      className="amount tabular-nums"
                    />
                  </Field>
                  <Field label="Note" hint="Shown to admins only, e.g. which dates it covers.">
                    <Input
                      value={form.surchargeNote}
                      onChange={(e) => patch({ surchargeNote: e.target.value })}
                      placeholder="Applies Mar 28–31 (Nyepi week)"
                    />
                  </Field>
                </div>
              )}
            </div>
          </FormSection>

          <FormSection
            title="Child charges"
            description="Age-banded child pricing for this season. Ages are inclusive."
          >
            <div className="flex flex-col gap-3">
              {form.childCharges.map((row, i) => (
                <div
                  key={i}
                  className="grid grid-cols-2 items-start gap-3 rounded-lg border p-3 sm:grid-cols-[92px_92px_1fr_auto]"
                >
                  <Field label="Age from">
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={row.ageFrom}
                      onChange={(e) => {
                        const next = [...form.childCharges];
                        next[i] = { ...row, ageFrom: e.target.value };
                        patch({ childCharges: next });
                      }}
                      className="amount tabular-nums"
                      aria-label={`Child charge ${i + 1} age from`}
                    />
                  </Field>
                  <Field label="Age to">
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={row.ageTo}
                      onChange={(e) => {
                        const next = [...form.childCharges];
                        next[i] = { ...row, ageTo: e.target.value };
                        patch({ childCharges: next });
                      }}
                      className="amount tabular-nums"
                      aria-label={`Child charge ${i + 1} age to`}
                    />
                  </Field>
                  <Field label="Charge description" className="col-span-2 sm:col-span-1">
                    <Input
                      value={row.charge}
                      onChange={(e) => {
                        const next = [...form.childCharges];
                        next[i] = { ...row, charge: e.target.value };
                        patch({ childCharges: next });
                      }}
                      placeholder="e.g. IDR 250,000/night incl. breakfast"
                      aria-label={`Child charge ${i + 1} description`}
                    />
                  </Field>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mt-7 text-muted-foreground hover:text-destructive"
                    aria-label={`Remove child charge row ${i + 1}`}
                    disabled={form.childCharges.length === 1}
                    onClick={() =>
                      patch({ childCharges: form.childCharges.filter((_, j) => j !== i) })
                    }
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                </div>
              ))}
              <div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    patch({
                      childCharges: [...form.childCharges, { ageFrom: "", ageTo: "", charge: "" }],
                    })
                  }
                >
                  <Plus aria-hidden="true" /> Add age band
                </Button>
              </div>
            </div>
          </FormSection>

          <FormSection
            title="Inclusions & supplements"
            description="What the rate includes, plus any compulsory or optional extras."
          >
            <div className="flex flex-col gap-6">
              <Field label="Inclusions" hint="Select everything included in the nightly rate.">
                <div className="flex flex-wrap gap-2" role="group" aria-label="Inclusions">
                  {INCLUSION_OPTIONS.map((inc) => {
                    const checked = form.inclusions.includes(inc);
                    return (
                      <label
                        key={inc}
                        className={cn(
                          "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                          checked
                            ? "border-primary/30 bg-primary/10 text-primary"
                            : "bg-muted/50 text-muted-foreground hover:bg-muted",
                        )}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() =>
                            patch({
                              inclusions: checked
                                ? form.inclusions.filter((x) => x !== inc)
                                : [...form.inclusions, inc],
                            })
                          }
                          aria-label={inc}
                          className="sr-only"
                        />
                        {inc}
                      </label>
                    );
                  })}
                </div>
              </Field>

              <div>
                <p className="text-[13px] font-medium">Supplements</p>
                <div className="mt-3 flex flex-col gap-3">
                  {form.supplements.map((row, i) => (
                    <div key={i} className="flex flex-col gap-3 sm:flex-row sm:items-start">
                      <Input
                        value={row.name}
                        onChange={(e) => {
                          const next = [...form.supplements];
                          next[i] = { ...row, name: e.target.value };
                          patch({ supplements: next });
                        }}
                        placeholder="Supplement name"
                        className="sm:flex-1"
                        aria-label={`Supplement ${i + 1} name`}
                      />
                      <Input
                        value={row.charge}
                        onChange={(e) => {
                          const next = [...form.supplements];
                          next[i] = { ...row, charge: e.target.value };
                          patch({ supplements: next });
                        }}
                        placeholder="Charge, e.g. IDR 850,000/person"
                        className="sm:w-64"
                        aria-label={`Supplement ${i + 1} charge`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                        aria-label={`Remove supplement ${i + 1}`}
                        onClick={() =>
                          patch({ supplements: form.supplements.filter((_, j) => j !== i) })
                        }
                      >
                        <Trash2 aria-hidden="true" />
                      </Button>
                    </div>
                  ))}
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        patch({ supplements: [...form.supplements, { name: "", charge: "" }] })
                      }
                    >
                      <Plus aria-hidden="true" /> Add supplement
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </FormSection>
        </div>

        {/* ------------------------------------------------ right column */}
        <aside className="min-w-0 xl:sticky xl:top-[calc(var(--baligo-header-h)+16px)] xl:self-start">
          <Card className="p-5">
            <h3 className="text-sm font-semibold">Summary</h3>
            <Separator className="my-3" />
            <dl className="flex flex-col gap-3 text-sm">
              <div className="flex items-start justify-between gap-3">
                <dt className="text-muted-foreground">Hotel</dt>
                <dd className="text-right font-medium">{hotel?.name ?? "—"}</dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-muted-foreground">Room type</dt>
                <dd className="text-right font-medium">{room?.name ?? "—"}</dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-muted-foreground">Season</dt>
                <dd className="text-right font-medium">{form.seasonName || "—"}</dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-muted-foreground">Season window</dt>
                <dd className="text-right font-medium">
                  {form.seasonRange?.from
                    ? `${fmtDate(toIso(form.seasonRange.from))} – ${
                        form.seasonRange.to ? fmtDate(toIso(form.seasonRange.to)) : "…"
                      }`
                    : "—"}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-muted-foreground">Min stay</dt>
                <dd className="amount tabular-nums font-medium">
                  {form.minStay} night{Number(form.minStay) === 1 ? "" : "s"}
                </dd>
              </div>
              <Separator />
              <div>
                <dt className="text-xs font-medium text-muted-foreground">Net rate / night</dt>
                <dd className="amount mt-1 text-2xl font-bold tabular-nums text-primary">
                  {netRateNum > 0 ? idr(netRateNum) : "—"}
                </dd>
              </div>
              {form.surchargeEnabled && Number(form.surchargePercent) > 0 && (
                <div className="flex items-start justify-between gap-3">
                  <dt className="text-muted-foreground">Holiday surcharge</dt>
                  <dd className="font-medium">+{form.surchargePercent}%</dd>
                </div>
              )}
              <Separator />
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Status preview</dt>
                <dd>
                  <RateStatus status={statusPreview} />
                </dd>
              </div>
            </dl>
          </Card>

          {missing.length > 0 && (
            <WarningBanner tone="warning" title="Incomplete rate" className="mt-4">
              <span className="inline-flex items-start gap-1">
                <BadgeInfo className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  Still needed: {missing.join(", ")}. The rate stays in draft until these are
                  filled in.
                </span>
              </span>
            </WarningBanner>
          )}
          {missing.length === 0 && (
            <div className="mt-4 flex gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3.5 text-sm text-emerald-900">
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <p>
                All required fields are filled — saving will mark this rate{" "}
                <strong>valid</strong>.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
