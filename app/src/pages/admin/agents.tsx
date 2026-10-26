import * as React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Check,
  Mail,
  MoreHorizontal,
  SearchX,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable, type Column } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { Field } from "@/components/shared/form-section";
import { PageHeader } from "@/components/shared/page-header";
import { AgentStatus } from "@/components/shared/status-badge";
import { agents as seedAgents, type Agent } from "@/data/mock";
import { fmtDate } from "@/lib/utils";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

type ConfirmAction = { agent: Agent; kind: "deactivate" | "activate" | "reject" };

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function AgentsList() {
  const navigate = useNavigate();
  const [list, setList] = React.useState<Agent[]>(seedAgents);
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [confirm, setConfirm] = React.useState<ConfirmAction | null>(null);

  const pending = list.filter((a) => a.status === "pending");
  const allRows = statusFilter === "all" ? list : list.filter((a) => a.status === statusFilter);

  function approve(agent: Agent) {
    setList((ls) => ls.map((a) => (a.id === agent.id ? { ...a, status: "active" } : a)));
    toast.success(`${agent.name} approved (demo — nothing was stored)`);
  }

  function runConfirm(kind: ConfirmAction["kind"], agent: Agent) {
    if (kind === "deactivate") {
      setList((ls) => ls.map((a) => (a.id === agent.id ? { ...a, status: "deactivated" } : a)));
      toast.info(`${agent.name} deactivated (demo — nothing was stored)`);
    } else if (kind === "activate") {
      setList((ls) => ls.map((a) => (a.id === agent.id ? { ...a, status: "active" } : a)));
      toast.success(`${agent.name} reactivated (demo — nothing was stored)`);
    } else {
      setList((ls) => ls.map((a) => (a.id === agent.id ? { ...a, status: "rejected" } : a)));
      toast.error(`${agent.name}'s application rejected (demo — nothing was stored)`);
    }
  }

  const columns: Column<Agent>[] = [
    {
      key: "name",
      header: "Agent",
      sortable: true,
      render: (a) => (
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarFallback className="text-xs font-semibold">{initials(a.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium">{a.name}</p>
            <p className="truncate text-xs text-muted-foreground">{a.company}</p>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      header: "Contact",
      render: (a) => (
        <div className="min-w-0 text-sm">
          <p className="max-w-[200px] truncate">{a.email}</p>
          <p className="max-w-[200px] truncate text-xs tabular-nums text-muted-foreground">{a.phone}</p>
        </div>
      ),
    },
    {
      key: "city",
      header: "Location",
      render: (a) => (
        <span className="whitespace-nowrap text-sm">
          {a.city}, {a.country}
        </span>
      ),
    },
    {
      key: "registeredAt",
      header: "Registered",
      sortable: true,
      render: (a) => <span className="whitespace-nowrap text-sm">{fmtDate(a.registeredAt)}</span>,
    },
    {
      key: "lastActivity",
      header: "Last activity",
      render: (a) => <span className="whitespace-nowrap text-sm">{fmtDate(a.lastActivity)}</span>,
    },
    {
      key: "quotations",
      header: "Quotations",
      sortable: true,
      render: (a) => <span className="text-sm tabular-nums">{a.quotations}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (a) => <AgentStatus status={a.status} />,
    },
    {
      key: "actions",
      header: "",
      render: (a) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Actions for ${a.name}`}
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onClick={() => navigate(`/admin/agents/${a.id}`)}>View</DropdownMenuItem>
            {a.status === "pending" && (
              <DropdownMenuItem onClick={() => approve(a)}>
                <Check aria-hidden="true" /> Approve
              </DropdownMenuItem>
            )}
            {a.status === "active" && (
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setConfirm({ agent: a, kind: "deactivate" })}
              >
                Deactivate
              </DropdownMenuItem>
            )}
            {a.status === "deactivated" && (
              <DropdownMenuItem onClick={() => setConfirm({ agent: a, kind: "activate" })}>
                Activate
              </DropdownMenuItem>
            )}
            {a.status === "rejected" && <DropdownMenuSeparator />}
            {a.status === "rejected" && (
              <DropdownMenuItem onClick={() => navigate(`/admin/agents/${a.id}`)}>
                View application
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Agents"
        description="Travel agents with access to the Baligo quotation portal."
        breadcrumbs={[{ label: "Admin" }, { label: "Agents" }]}
        actions={
          <Button onClick={() => setInviteOpen(true)}>
            <UserPlus aria-hidden="true" /> Invite agent
          </Button>
        }
      />

      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All agents</TabsTrigger>
          <TabsTrigger value="pending">Pending approval ({pending.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <DataTable
            columns={columns}
            rows={allRows}
            searchable={(a) => `${a.name} ${a.company} ${a.email} ${a.city} ${a.country}`}
            toolbar={
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[170px]" aria-label="Filter by status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="deactivated">Deactivated</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            }
            onRowClick={(a) => navigate(`/admin/agents/${a.id}`)}
            emptyState={
              <EmptyState
                icon={SearchX}
                title="No agents match"
                description="Try a different search term or clear the status filter."
              />
            }
          />
        </TabsContent>

        <TabsContent value="pending">
          {pending.length === 0 ? (
            <EmptyState
              icon={UserCheck}
              title="No pending approvals"
              description="New agent registrations will appear here for review."
            />
          ) : (
            <div className="grid gap-3">
              {pending.map((a) => (
                <Card key={a.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={() => navigate(`/admin/agents/${a.id}`)}
                    className="flex min-w-0 flex-1 items-center gap-3 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`View ${a.name}`}
                  >
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className="text-xs font-semibold">
                        {initials(a.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{a.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {a.company} · {a.city}, {a.country}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                        <Mail className="h-3 w-3 shrink-0" aria-hidden="true" />
                        <span className="truncate">{a.email}</span>
                      </p>
                    </div>
                  </button>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <span className="mr-auto text-xs text-muted-foreground sm:mr-4">
                      Registered {fmtDate(a.registeredAt)}
                    </span>
                    <Button size="sm" variant="teal" onClick={() => approve(a)}>
                      <Check aria-hidden="true" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setConfirm({ agent: a, kind: "reject" })}
                    >
                      <X aria-hidden="true" /> Reject
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <InviteDialog open={inviteOpen} onOpenChange={setInviteOpen} />

      <ConfirmDialog
        open={confirm !== null}
        onOpenChange={(open) => {
          if (!open) setConfirm(null);
        }}
        title={
          confirm?.kind === "reject"
            ? `Reject ${confirm.agent.name}'s application?`
            : confirm?.kind === "deactivate"
              ? `Deactivate ${confirm.agent.name}?`
              : `Reactivate ${confirm?.agent.name ?? ""}?`
        }
        description={
          confirm?.kind === "reject"
            ? "They will lose access to the portal and their pending registration will be marked rejected."
            : confirm?.kind === "deactivate"
              ? "They will immediately lose access to the portal. You can reactivate the account later."
              : "Their portal access will be restored immediately."
        }
        confirmLabel={
          confirm?.kind === "reject"
            ? "Reject"
            : confirm?.kind === "deactivate"
              ? "Deactivate"
              : "Reactivate"
        }
        destructive={confirm?.kind !== "activate"}
        onConfirm={() => {
          if (confirm) runConfirm(confirm.kind, confirm.agent);
        }}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Invite dialog                                                       */
/* ------------------------------------------------------------------ */

function InviteDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [errors, setErrors] = React.useState<{ name?: string; email?: string; company?: string }>({});

  function submit() {
    const next: typeof errors = {};
    if (!name.trim()) next.name = "Name is required";
    if (!email.trim()) next.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = "Enter a valid email address";
    if (!company.trim()) next.company = "Company is required";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    toast.success(`Invite sent to ${email.trim()} (demo — nothing was sent)`);
    setName("");
    setEmail("");
    setCompany("");
    setErrors({});
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          setErrors({});
        }
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-4 w-4" aria-hidden="true" /> Invite agent
          </DialogTitle>
          <DialogDescription>
            Send a portal invitation. This is a demo — no email will be sent.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-1">
          <Field label="Full name" htmlFor="invite-name" required error={errors.name}>
            <Input
              id="invite-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Maria Santos"
              aria-invalid={!!errors.name}
              className={errors.name ? "border-destructive" : undefined}
            />
          </Field>
          <Field label="Work email" htmlFor="invite-email" required error={errors.email}>
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@agency.com"
              aria-invalid={!!errors.email}
              className={errors.email ? "border-destructive" : undefined}
            />
          </Field>
          <Field label="Company" htmlFor="invite-company" required error={errors.company}>
            <Input
              id="invite-company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Sakura Travels"
              aria-invalid={!!errors.company}
              className={errors.company ? "border-destructive" : undefined}
            />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>Send invite</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
