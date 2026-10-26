import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FileText, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import type { Column } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { quotations } from "@/data/mock";
import type { Quotation } from "@/data/mock";
import { fmtDate, nights, usd } from "@/lib/utils";

/** Demo-only status chip: draft = neutral, shared = success (icon + label, never color-only). */
function QuotationStatus({ status }: { status: Quotation["status"] }) {
  if (status === "shared") {
    return <Badge variant="success">Shared</Badge>;
  }
  return <Badge variant="neutral">Draft</Badge>;
}

export function QuotationsList() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  const rows = React.useMemo(
    () =>
      statusFilter === "all"
        ? quotations
        : quotations.filter((q) => q.status === statusFilter),
    [statusFilter],
  );

  const columns: Column<Quotation>[] = [
    {
      key: "ref",
      header: "Ref",
      sortable: true,
      render: (q) => (
        <span className="font-mono text-[13px] tabular-nums">{q.ref}</span>
      ),
    },
    {
      key: "hotelName",
      header: "Hotel",
      sortable: true,
      render: (q) => (
        <span>
          <span className="font-medium">{q.hotelName}</span>
          <span className="block text-[13px] text-muted-foreground">{q.destination}</span>
        </span>
      ),
    },
    {
      key: "checkIn",
      header: "Stay",
      sortable: true,
      className: "whitespace-nowrap",
      render: (q) => (
        <span className="text-[13px]">
          {fmtDate(q.checkIn)} → {fmtDate(q.checkOut)}
          <span className="block text-muted-foreground">
            {q.nights} night{q.nights === 1 ? "" : "s"}
          </span>
        </span>
      ),
    },
    {
      key: "guests",
      header: "Guests",
      render: (q) => (
        <span className="whitespace-nowrap text-[13px]">
          {q.adults} adult{q.adults === 1 ? "" : "s"}
          {q.children.length > 0 &&
            ` · ${q.children.length} child${q.children.length === 1 ? "" : "ren"}`}
          {" · "}
          {q.rooms} room{q.rooms === 1 ? "" : "s"}
        </span>
      ),
    },
    {
      key: "total",
      header: "Total (USD)",
      sortable: true,
      className: "text-right whitespace-nowrap",
      headerClassName: "text-right",
      render: (q) => <span className="amount tabular-nums font-semibold">{usd(q.total)}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (q) => <QuotationStatus status={q.status} />,
    },
    {
      key: "createdAt",
      header: "Created",
      sortable: true,
      className: "whitespace-nowrap",
      render: (q) => (
        <span className="text-[13px] text-muted-foreground">{fmtDate(q.createdAt)}</span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="My quotations"
        description="Every quotation you have drafted or shared with clients. Click a row to review it."
      />

      <DataTable
        columns={columns}
        rows={rows}
        pageSize={8}
        searchable={(q) => `${q.ref} ${q.hotelName} ${q.destination} ${q.roomName}`}
        onRowClick={(q) => navigate(`/agent/quotations/${q.id}`)}
        toolbar={
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40" aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="shared">Shared</SelectItem>
            </SelectContent>
          </Select>
        }
        emptyState={
          <EmptyState
            icon={FileText}
            title={statusFilter === "all" ? "No quotations yet" : "No matching quotations"}
            description={
              statusFilter === "all"
                ? "Configure a stay from Find Hotels and your quotation will appear here."
                : "No quotations match your search and status filter."
            }
            action={
              <Button asChild>
                <Link to="/agent/search">Find hotels</Link>
              </Button>
            }
          />
        }
      />

      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <Info className="h-3.5 w-3.5" aria-hidden="true" />
        Demo data — quotations shown are sample records and nothing is stored.
      </p>
    </div>
  );
}
