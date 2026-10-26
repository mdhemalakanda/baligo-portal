import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Clock,
  FileSignature,
  Mail,
  MapPin,
  Phone,
  Save,
  UserCheck,
  UserX,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Field, FormSection } from "@/components/shared/form-section";
import { PageHeader } from "@/components/shared/page-header";
import { AgentStatus } from "@/components/shared/status-badge";
import { agentById, recentActivity, type AgentStatus as AgentStatusType } from "@/data/mock";
import { fmtDate } from "@/lib/utils";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function AgentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const base = agentById(id ?? "");

  const [status, setStatus] = React.useState<AgentStatusType>(base?.status ?? "pending");
  const [rejectOpen, setRejectOpen] = React.useState(false);
  const [deactivateOpen, setDeactivateOpen] = React.useState(false);

  const [name, setName] = React.useState(base?.name ?? "");
  const [email, setEmail] = React.useState(base?.email ?? "");
  const [phone, setPhone] = React.useState(base?.phone ?? "");
  const [company, setCompany] = React.useState(base?.company ?? "");
  const [city, setCity] = React.useState(base?.city ?? "");
  const [country, setCountry] = React.useState(base?.country ?? "");
  const [errors, setErrors] = React.useState<{ name?: string; email?: string }>({});

  if (!base) {
    return (
      <>
        <PageHeader
          title="Agent not found"
          breadcrumbs={[{ label: "Admin" }, { label: "Agents", to: "/admin/agents" }]}
        />
        <EmptyState
          icon={UserX}
          title="Agent not found"
          description="This agent may have been removed or the link is incorrect."
          action={
            <Button onClick={() => navigate("/admin/agents")}>
              <ArrowLeft aria-hidden="true" /> Back to agents
            </Button>
          }
        />
      </>
    );
  }

  function saveProfile() {
    const next: { name?: string; email?: string } = {};
    if (!name.trim()) next.name = "Name is required";
    if (!email.trim()) next.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = "Enter a valid email address";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    toast.success("Agent profile saved (demo — nothing was stored)");
  }

  function approve() {
    setStatus("active");
    toast.success(`${base?.name} approved (demo — nothing was stored)`);
  }

  function confirmAction(kind: "reject" | "deactivate" | "activate") {
    if (kind === "reject") {
      setStatus("rejected");
      toast.error(`${base?.name}'s application rejected (demo — nothing was stored)`);
    } else if (kind === "deactivate") {
      setStatus("deactivated");
      toast.info(`${base?.name} deactivated (demo — nothing was stored)`);
    } else {
      setStatus("active");
      toast.success(`${base?.name} reactivated (demo — nothing was stored)`);
    }
  }

  const actions = (() => {
    if (status === "pending") {
      return (
        <>
          <Button variant="teal" onClick={approve}>
            <Check aria-hidden="true" /> Approve
          </Button>
          <Button
            variant="outline"
            className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setRejectOpen(true)}
          >
            <X aria-hidden="true" /> Reject
          </Button>
        </>
      );
    }
    if (status === "active") {
      return (
        <Button variant="outline" onClick={() => setDeactivateOpen(true)}>
          <UserX aria-hidden="true" /> Deactivate
        </Button>
      );
    }
    if (status === "deactivated") {
      return (
        <Button variant="teal" onClick={() => confirmAction("activate")}>
          <UserCheck aria-hidden="true" /> Reactivate
        </Button>
      );
    }
    return (
      <Button variant="teal" onClick={() => confirmAction("activate")}>
        <UserCheck aria-hidden="true" /> Reactivate
      </Button>
    );
  })();

  return (
    <>
      <PageHeader
        title={base.name}
        description={base.company}
        breadcrumbs={[{ label: "Admin" }, { label: "Agents", to: "/admin/agents" }, { label: base.company }]}
        actions={actions}
      />

      {/* Header card */}
      <Card className="mb-6 p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <Avatar className="h-14 w-14 shrink-0">
              <AvatarFallback className="text-base font-semibold">
                {initials(base.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-lg font-bold tracking-tight">{base.name}</h2>
                <AgentStatus status={status} />
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">{base.company}</p>
              <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                <div className="flex min-w-0 items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span className="truncate" title={base.email}>
                    {base.email}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span className="tabular-nums">{base.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span>
                    {base.city}, {base.country}
                  </span>
                </div>
              </dl>
            </div>
          </div>

          <dl className="grid shrink-0 grid-cols-3 gap-4 rounded-xl border bg-muted/30 p-4 text-center sm:gap-6 lg:text-left">
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Quotations
              </dt>
              <dd className="amount mt-1 text-2xl font-bold tabular-nums leading-none">
                {base.quotations}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Registered
              </dt>
              <dd className="mt-1 whitespace-nowrap text-sm font-medium leading-none">
                {fmtDate(base.registeredAt)}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Last activity
              </dt>
              <dd className="mt-1 whitespace-nowrap text-sm font-medium leading-none">
                {fmtDate(base.lastActivity)}
              </dd>
            </div>
          </dl>
        </div>
      </Card>

      {/* Account */}
      <Card className="mb-6 p-5 sm:p-6">
        <FormSection
          title="Account"
          description="Profile details shown to your team. Changes here are simulated in the demo."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" htmlFor="agent-name" required error={errors.name}>
              <Input
                id="agent-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={!!errors.name}
                className={errors.name ? "border-destructive" : undefined}
              />
            </Field>
            <Field label="Company" htmlFor="agent-company">
              <Input id="agent-company" value={company} onChange={(e) => setCompany(e.target.value)} />
            </Field>
            <Field label="Email" htmlFor="agent-email" required error={errors.email}>
              <Input
                id="agent-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!errors.email}
                className={errors.email ? "border-destructive" : undefined}
              />
            </Field>
            <Field label="Phone" htmlFor="agent-phone">
              <Input
                id="agent-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="tabular-nums"
              />
            </Field>
            <Field label="City" htmlFor="agent-city">
              <Input id="agent-city" value={city} onChange={(e) => setCity(e.target.value)} />
            </Field>
            <Field label="Country" htmlFor="agent-country">
              <Input id="agent-country" value={country} onChange={(e) => setCountry(e.target.value)} />
            </Field>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={saveProfile}>
              <Save aria-hidden="true" /> Save changes
            </Button>
          </div>
        </FormSection>
      </Card>

      {/* Recent activity */}
      <Card className="mb-6 p-5 sm:p-6">
        <CardHeader className="p-0 pb-2">
          <CardTitle className="text-base">Recent activity</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y">
            {recentActivity.slice(0, 4).map((a) => (
              <li key={a.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <FileSignature className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{a.actor}</span> {a.action}{" "}
                    <span className="text-muted-foreground">{a.target}</span>
                  </p>
                </div>
                <span className="flex shrink-0 items-center gap-1 text-xs tabular-nums text-muted-foreground">
                  <Clock className="h-3 w-3" aria-hidden="true" /> {a.at}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Danger zone */}
      {status === "active" && (
        <Card className="border-destructive/30 p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
              <div>
                <h3 className="text-sm font-semibold text-destructive">Danger zone</h3>
                <p className="mt-0.5 text-[13px] text-muted-foreground">
                  Deactivating this account immediately revokes portal access. The agent's existing
                  quotations remain in the system.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="shrink-0 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setDeactivateOpen(true)}
            >
              <UserX aria-hidden="true" /> Deactivate account
            </Button>
          </div>
        </Card>
      )}

      <ConfirmDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        title={`Reject ${base.name}'s application?`}
        description="They will lose access to the portal and their registration will be marked rejected."
        confirmLabel="Reject"
        destructive
        onConfirm={() => confirmAction("reject")}
      />
      <ConfirmDialog
        open={deactivateOpen}
        onOpenChange={setDeactivateOpen}
        title={`Deactivate ${base.name}?`}
        description="They will immediately lose access to the portal. You can reactivate the account later."
        confirmLabel="Deactivate"
        destructive
        onConfirm={() => confirmAction("deactivate")}
      />
    </>
  );
}
