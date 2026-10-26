import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  Eye,
  EyeOff,
  KeyRound,
  LifeBuoy,
  Lock,
  Save,
  TriangleAlert,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/page-header";
import { FormSection, Field } from "@/components/shared/form-section";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { AgentStatus } from "@/components/shared/status-badge";
import { agents } from "@/data/mock";
import { cn } from "@/lib/utils";

const ME = agents[0]; // demo signed-in agent: Hana Kobayashi / Sakura Travels

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AgentProfile() {
  const navigate = useNavigate();

  /* Account details */
  const [name, setName] = React.useState(ME.name);
  const [email, setEmail] = React.useState(ME.email);
  const [phone, setPhone] = React.useState(ME.phone);
  const [company, setCompany] = React.useState(ME.company);
  const [city, setCity] = React.useState(ME.city);
  const [country, setCountry] = React.useState(ME.country);
  const [accountErrors, setAccountErrors] = React.useState<{ name?: string; email?: string }>({});

  function saveAccount() {
    const errs: typeof accountErrors = {};
    if (!name.trim()) errs.name = "Name is required.";
    if (!email.trim()) errs.email = "Email is required.";
    else if (!EMAIL_RE.test(email.trim())) errs.email = "Enter a valid email address.";
    setAccountErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error("Please fix the highlighted fields (demo)");
      return;
    }
    toast.success("Profile saved (demo — nothing was stored)");
  }

  /* Password */
  const [currentPw, setCurrentPw] = React.useState("");
  const [newPw, setNewPw] = React.useState("");
  const [confirmPw, setConfirmPw] = React.useState("");
  const [showCurrent, setShowCurrent] = React.useState(false);
  const [showNew, setShowNew] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);

  const rules = [
    { label: "At least 8 characters", ok: newPw.length >= 8 },
    { label: "Contains a number", ok: /\d/.test(newPw) },
    { label: "Passwords match", ok: newPw.length > 0 && newPw === confirmPw },
  ];
  const pwValid = rules.every((r) => r.ok);

  function savePassword() {
    if (!currentPw) {
      toast.error("Enter your current password (demo)");
      return;
    }
    if (!pwValid) {
      toast.error("New password doesn't meet the rules yet (demo)");
      return;
    }
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
    toast.success("Password updated (demo — password not changed)");
  }

  /* Preferences */
  const [dateFormat, setDateFormat] = React.useState("d MMM yyyy");
  const [notifyQuotations, setNotifyQuotations] = React.useState(true);
  const [notifyRates, setNotifyRates] = React.useState(true);
  const [notifyDigest, setNotifyDigest] = React.useState(false);

  /* Danger zone */
  const [deactivateOpen, setDeactivateOpen] = React.useState(false);

  return (
    <div>
      <PageHeader
        title="My profile"
        description="Your agent account details, sign-in security and notification preferences."
      />

      {/* Header card */}
      <div className="mb-2 flex items-center gap-4 rounded-xl border bg-card p-5 shadow-sm">
        <Avatar className="h-14 w-14">
          <AvatarFallback className="bg-teal/15 text-base text-teal-700">
            {initials(ME.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-lg font-semibold">{ME.name}</h2>
            <AgentStatus status={ME.status} />
          </div>
          <p className="truncate text-sm text-muted-foreground">
            {ME.company} · {ME.city}, {ME.country}
          </p>
          <p className="text-[13px] text-muted-foreground">
            Member since {ME.registeredAt.slice(0, 4)}
          </p>
        </div>
      </div>

      <div className="mt-4">
        {/* Account details */}
        <FormSection
          title="Account details"
          description="How the Baligo team contacts you. These details also appear on your quotations."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" htmlFor="pf-name" required error={accountErrors.name}>
              <Input
                id="pf-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={!!accountErrors.name}
                autoComplete="name"
              />
            </Field>
            <Field label="Email" htmlFor="pf-email" required error={accountErrors.email}>
              <Input
                id="pf-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!accountErrors.email}
                autoComplete="email"
              />
            </Field>
            <Field label="Phone" htmlFor="pf-phone">
              <Input
                id="pf-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
              />
            </Field>
            <Field label="Company" htmlFor="pf-company">
              <Input
                id="pf-company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                autoComplete="organization"
              />
            </Field>
            <Field label="City" htmlFor="pf-city">
              <Input id="pf-city" value={city} onChange={(e) => setCity(e.target.value)} />
            </Field>
            <Field label="Country" htmlFor="pf-country">
              <Input id="pf-country" value={country} onChange={(e) => setCountry(e.target.value)} />
            </Field>
          </div>
          <div className="mt-4">
            <Button onClick={saveAccount}>
              <Save aria-hidden="true" /> Save changes
            </Button>
          </div>
        </FormSection>

        {/* Password */}
        <FormSection
          title="Password"
          description="Use at least 8 characters including a number. The new rules tick as you type."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Current password" htmlFor="pw-current">
              <div className="relative">
                <Input
                  id="pw-current"
                  type={showCurrent ? "text" : "password"}
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  aria-label={showCurrent ? "Hide current password" : "Show current password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer"
                >
                  {showCurrent ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </Field>
            <div aria-hidden="true" />
            <Field label="New password" htmlFor="pw-new">
              <div className="relative">
                <Input
                  id="pw-new"
                  type={showNew ? "text" : "password"}
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  autoComplete="new-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  aria-label={showNew ? "Hide new password" : "Show new password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer"
                >
                  {showNew ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </Field>
            <Field label="Confirm new password" htmlFor="pw-confirm">
              <div className="relative">
                <Input
                  id="pw-confirm"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  autoComplete="new-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? "Hide password confirmation" : "Show password confirmation"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer"
                >
                  {showConfirm ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </Field>
          </div>

          <ul className="mt-4 space-y-1.5" aria-label="Password requirements">
            {rules.map((rule) => (
              <li
                key={rule.label}
                className={cn(
                  "flex items-center gap-2 text-sm",
                  rule.ok ? "text-emerald-700" : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex h-4 w-4 items-center justify-center rounded-full border",
                    rule.ok
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-border bg-muted",
                  )}
                  aria-hidden="true"
                >
                  {rule.ok ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <X className="h-2.5 w-2.5 opacity-50" />
                  )}
                </span>
                {rule.label}
                <span className="sr-only">{rule.ok ? " — met" : " — not met yet"}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4">
            <Button onClick={savePassword}>
              <KeyRound aria-hidden="true" /> Update password
            </Button>
          </div>
        </FormSection>

        {/* Preferences */}
        <FormSection
          title="Preferences"
          description="How quotations are displayed and which emails you receive from Baligo."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Display currency"
              htmlFor="pref-currency"
              hint="Only USD is available in this demo."
            >
              <Select value="USD" disabled>
                <SelectTrigger id="pref-currency" aria-label="Display currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD — US Dollar</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Date format" htmlFor="pref-dateformat">
              <Select value={dateFormat} onValueChange={setDateFormat}>
                <SelectTrigger id="pref-dateformat" aria-label="Date format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="d MMM yyyy">12 Apr 2027</SelectItem>
                  <SelectItem value="yyyy-MM-dd">2027-04-12</SelectItem>
                  <SelectItem value="MM/dd/yyyy">04/12/2027</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="mt-6 space-y-4">
            {(
              [
                {
                  id: "pref-nq",
                  label: "Quotation status updates",
                  hint: "Email me when the Baligo team responds to a quotation request.",
                  checked: notifyQuotations,
                  set: setNotifyQuotations,
                },
                {
                  id: "pref-nr",
                  label: "Rate changes on saved hotels",
                  hint: "Email me when rates change for hotels I have quoted recently.",
                  checked: notifyRates,
                  set: setNotifyRates,
                },
                {
                  id: "pref-nd",
                  label: "Weekly digest",
                  hint: "A short weekly summary of my portal activity.",
                  checked: notifyDigest,
                  set: setNotifyDigest,
                },
              ] as const
            ).map((n) => (
              <div key={n.id} className="flex items-start justify-between gap-4">
                <label htmlFor={n.id} className="text-sm">
                  <span className="font-medium">{n.label}</span>
                  <span className="block text-[13px] text-muted-foreground">{n.hint}</span>
                </label>
                <Switch
                  id={n.id}
                  checked={n.checked}
                  onCheckedChange={(v) => {
                    n.set(v);
                    toast.success(`Preference saved (demo — nothing was stored)`);
                  }}
                />
              </div>
            ))}
          </div>
        </FormSection>

        {/* Danger zone */}
        <FormSection
          title="Danger zone"
          description="Deactivating hides your account and signs you out of the portal."
        >
          <div className="rounded-lg border border-destructive/25 bg-destructive/5 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <TriangleAlert className="mt-0.5 h-4 w-4 text-destructive" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium">Deactivate my account</p>
                  <p className="text-[13px] text-muted-foreground">
                    Your saved quotations stay on file and can be restored by the Baligo team.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="shrink-0 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setDeactivateOpen(true)}
              >
                <Lock aria-hidden="true" /> Deactivate
              </Button>
            </div>
          </div>
        </FormSection>
      </div>

      <Separator className="my-2" />
      <p className="flex items-center justify-center gap-1.5 py-4 text-xs text-muted-foreground">
        <LifeBuoy className="h-3.5 w-3.5" aria-hidden="true" />
        Need help? Email {`contracts@baligo.example`} — demo support, no real inbox.
      </p>

      <ConfirmDialog
        open={deactivateOpen}
        onOpenChange={setDeactivateOpen}
        title="Deactivate your account?"
        description="Your portal access will be paused and you will be signed out. This is a demo action — nothing is stored."
        confirmLabel="Deactivate account"
        destructive
        onConfirm={() => {
          toast.success("Account deactivated (demo — nothing was changed)");
          navigate("/agent/deactivated");
        }}
      />
    </div>
  );
}
