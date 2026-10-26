import * as React from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { FormSection, Field } from "@/components/shared/form-section";
import { DemoNote } from "@/components/shared/demo-note";
import { WarningBanner } from "@/components/shared/warning-banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { defaultSettings, type PortalSettings } from "@/data/mock";

type Draft = PortalSettings;

const initial: Draft = { ...defaultSettings };

/** Well-organized, display-only settings area. Nothing is persisted. */
export function SettingsPage() {
  const [draft, setDraft] = React.useState<Draft>(initial);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  function validate() {
    const e: Record<string, string> = {};
    if (!draft.companyName.trim()) e.companyName = "Company name is required.";
    if (!/^\S+@\S+\.\S+$/.test(draft.companyEmail)) e.companyEmail = "Enter a valid email address.";
    if (!(draft.idrPerUsd > 0)) e.idrPerUsd = "Exchange rate must be greater than zero.";
    if (draft.defaultMarkupPercent < 0 || draft.defaultMarkupPercent > 100)
      e.defaultMarkupPercent = "Markup must be between 0 and 100.";
    if (draft.quotationValidityDays < 1 || draft.quotationValidityDays > 90)
      e.quotationValidityDays = "Validity must be between 1 and 90 days.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (validate()) {
      toast.success("Settings validated and saved (demo — nothing was stored)");
    } else {
      toast.error("Please fix the highlighted fields");
    }
  }

  function handleReset() {
    setDraft(initial);
    setErrors({});
    toast.info("Settings reset to saved defaults (demo)");
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Portal-wide configuration. Values below are demo defaults — saving is simulated."
        breadcrumbs={[{ label: "Settings" }]}
        actions={
          <>
            <DemoNote>Display-only demo</DemoNote>
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button variant="outline" onClick={() => setDraft(initial)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save changes</Button>
          </>
        }
      />

      <div className="rounded-xl border bg-card px-5 py-2 shadow-sm">
        <FormSection
          title="General"
          description="How the portal identifies itself to agents and in documents."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Company name" required error={errors.companyName}>
              <Input
                value={draft.companyName}
                aria-invalid={!!errors.companyName}
                onChange={(e) => set("companyName", e.target.value)}
              />
            </Field>
            <Field label="Contact email" required error={errors.companyEmail}>
              <Input
                type="email"
                value={draft.companyEmail}
                aria-invalid={!!errors.companyEmail}
                onChange={(e) => set("companyEmail", e.target.value)}
              />
            </Field>
            <Field label="Contact phone" hint="Shown on quotations and the agent portal footer.">
              <Input value={draft.companyPhone} onChange={(e) => set("companyPhone", e.target.value)} />
            </Field>
            <Field label="Timezone" hint="Used for rate cutoffs and audit timestamps.">
              <Select value={draft.timezone} onValueChange={(v) => set("timezone", v)}>
                <SelectTrigger aria-label="Timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Makassar (GMT+8)">Asia/Makassar (GMT+8)</SelectItem>
                  <SelectItem value="Asia/Jakarta (GMT+7)">Asia/Jakarta (GMT+7)</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
        </FormSection>

        <FormSection
          title="Currency & pricing"
          description="Defaults applied to supplier rates before they become agent-facing selling prices."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Default selling currency">
              <Select value={draft.defaultCurrency} onValueChange={(v) => set("defaultCurrency", v as "USD")}>
                <SelectTrigger aria-label="Default selling currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD — US Dollar</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field
              label="IDR per USD exchange rate"
              required
              error={errors.idrPerUsd}
              hint={`Manually maintained. Last updated ${draft.fxUpdatedAt} (demo value).`}
            >
              <Input
                type="number"
                min={1}
                value={draft.idrPerUsd}
                aria-invalid={!!errors.idrPerUsd}
                onChange={(e) => set("idrPerUsd", Number(e.target.value))}
              />
            </Field>
            <Field
              label="Default markup"
              required
              error={errors.defaultMarkupPercent}
              hint="Applied to net rates to produce selling prices. Internal value — never shown to agents."
            >
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={draft.defaultMarkupPercent}
                  aria-invalid={!!errors.defaultMarkupPercent}
                  onChange={(e) => set("defaultMarkupPercent", Number(e.target.value))}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </Field>
            <Field label="Rounding rule" hint="Applied to the final selling price per night.">
              <Select value={draft.rounding} onValueChange={(v) => set("rounding", v as Draft["rounding"])}>
                <SelectTrigger aria-label="Rounding rule">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No rounding</SelectItem>
                  <SelectItem value="up-0.5">Round up to $0.50</SelectItem>
                  <SelectItem value="up-1">Round up to $1</SelectItem>
                  <SelectItem value="nearest-1">Nearest $1</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
        </FormSection>

        <FormSection
          title="Quotations & dates"
          description="How quotations are presented to agents and their clients."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Quotation validity"
              required
              error={errors.quotationValidityDays}
              hint="How long a quotation remains valid after it is issued."
            >
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={90}
                  value={draft.quotationValidityDays}
                  aria-invalid={!!errors.quotationValidityDays}
                  onChange={(e) => set("quotationValidityDays", Number(e.target.value))}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">days</span>
              </div>
            </Field>
            <Field label="Date format" hint="Used across the portal and printed quotations.">
              <Select value={draft.dateFormat} onValueChange={(v) => set("dateFormat", v as Draft["dateFormat"])}>
                <SelectTrigger aria-label="Date format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="d MMM yyyy">14 Aug 2026</SelectItem>
                  <SelectItem value="yyyy-MM-dd">2026-08-14</SelectItem>
                  <SelectItem value="MM/dd/yyyy">08/14/2026</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
        </FormSection>

        <FormSection
          title="Hotel pricing defaults"
          description="Fallbacks used when a contract does not specify them."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Default minimum stay" hint="Nights, unless the contract overrides it.">
              <Input
                type="number"
                min={1}
                value={draft.defaultMinStay}
                onChange={(e) => set("defaultMinStay", Number(e.target.value))}
                className="w-24"
              />
            </Field>
            <Field label="Maximum child age" hint="Children above this age are priced as adults.">
              <Input
                type="number"
                min={0}
                max={17}
                value={draft.defaultChildAgeMax}
                onChange={(e) => set("defaultChildAgeMax", Number(e.target.value))}
                className="w-24"
              />
            </Field>
          </div>
        </FormSection>

        <FormSection
          title="Agent portal display"
          description="What agents see when reviewing quotations."
        >
          <div className="flex flex-col gap-3">
            {(
              [
                ["showTaxes", "Show tax and service breakdown", "Display the tax/service split on quotation summaries."],
                ["showInclusions", "Show inclusions list", "Display meal plans and benefits on room cards."],
                ["showValidity", "Show rate validity dates", "Display contract validity alongside quoted prices."],
              ] as const
            ).map(([key, label, hint]) => (
              <label
                key={key}
                className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border p-3.5 transition-colors hover:bg-secondary/40"
              >
                <span>
                  <span className="block text-sm font-medium">{label}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{hint}</span>
                </span>
                <Switch
                  checked={draft.agentPortal[key]}
                  onCheckedChange={(v) => set("agentPortal", { ...draft.agentPortal, [key]: v })}
                  aria-label={label}
                />
              </label>
            ))}
          </div>
        </FormSection>

        <FormSection
          title="Notifications"
          description="Email alerts for portal administrators."
        >
          <div className="flex flex-col gap-3">
            {(
              [
                ["newAgent", "New agent registration", "When an agent account awaits approval."],
                ["contractImported", "Contract import finished", "When document extraction completes."],
                ["rateExpiring", "Rates expiring soon", "When contracted rates approach their validity end."],
                ["weeklyDigest", "Weekly activity digest", "A summary of portal activity every Monday."],
              ] as const
            ).map(([key, label, hint]) => (
              <label
                key={key}
                className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border p-3.5 transition-colors hover:bg-secondary/40"
              >
                <span>
                  <span className="block text-sm font-medium">{label}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{hint}</span>
                </span>
                <Switch
                  checked={draft.notifications[key]}
                  onCheckedChange={(v) => set("notifications", { ...draft.notifications, [key]: v })}
                  aria-label={label}
                />
              </label>
            ))}
          </div>
        </FormSection>

        <FormSection
          title="Document import"
          description="Behavior of the contract import workflow."
        >
          <div className="grid gap-4">
            <div className="flex flex-col gap-3">
              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border p-3.5 transition-colors hover:bg-secondary/40">
                <span>
                  <span className="block text-sm font-medium">Start extraction automatically</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    Process uploads without a manual "Extract" step.
                  </span>
                </span>
                <Switch
                  checked={draft.importPrefs.autoExtract}
                  onCheckedChange={(v) => set("importPrefs", { ...draft.importPrefs, autoExtract: v })}
                  aria-label="Start extraction automatically"
                />
              </label>
              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border p-3.5 transition-colors hover:bg-secondary/40">
                <span>
                  <span className="block text-sm font-medium">Require human review before publishing</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    Extracted rates always wait for explicit approval. Recommended.
                  </span>
                </span>
                <Switch
                  checked={draft.importPrefs.requireReview}
                  onCheckedChange={(v) => set("importPrefs", { ...draft.importPrefs, requireReview: v })}
                  aria-label="Require human review before publishing"
                />
              </label>
            </div>
            <Field
              label="When extracted rates duplicate existing rates"
              hint="How the importer should treat overlapping contracted rates."
            >
              <Select
                value={draft.importPrefs.duplicateStrategy}
                onValueChange={(v) =>
                  set("importPrefs", { ...draft.importPrefs, duplicateStrategy: v as Draft["importPrefs"]["duplicateStrategy"] })
                }
              >
                <SelectTrigger className="sm:max-w-sm" aria-label="Duplicate strategy">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flag">Flag for manual resolution (recommended)</SelectItem>
                  <SelectItem value="overwrite">Overwrite existing rates</SelectItem>
                  <SelectItem value="skip">Skip duplicates</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
        </FormSection>

        <FormSection
          title="Access & privacy"
          description="Presentation of access controls in this prototype."
        >
          <div className="flex flex-col gap-4">
            <WarningBanner tone="info" title="Presentation only">
              Role-based access, authentication and audit enforcement are not part of this UI
              prototype. The options below illustrate what the production settings will offer.
            </WarningBanner>
            <Field label="Who can approve contract imports">
              <Select defaultValue="admins">
                <SelectTrigger className="sm:max-w-sm" aria-label="Who can approve contract imports">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admins">Administrators only</SelectItem>
                  <SelectItem value="admins-managers">Administrators and rate managers</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Agent data retention" hint="How long inactive agent accounts and their quotations are kept.">
              <Select defaultValue="24">
                <SelectTrigger className="sm:max-w-sm" aria-label="Agent data retention">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12 months after last activity</SelectItem>
                  <SelectItem value="24">24 months after last activity</SelectItem>
                  <SelectItem value="never">Until manually deleted</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Internal notes">
              <Textarea
                placeholder="Internal policy notes (never shown to agents)…"
                aria-label="Internal notes"
              />
            </Field>
          </div>
        </FormSection>

        <div className="sticky bottom-0 -mx-5 flex items-center justify-end gap-2 border-t bg-card/90 px-5 py-3 backdrop-blur">
          <span className="mr-auto hidden text-xs text-muted-foreground sm:block">
            Changes are kept in this demo session only.
          </span>
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button onClick={handleSave}>Save changes</Button>
        </div>
      </div>
      <Separator className="my-0" />
    </div>
  );
}
