/**
 * Admin hotel management list.
 * UI-only demo — filtering/sorting happen locally over @/data/mock.
 */
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Copy,
  Eye,
  MoreHorizontal,
  Pencil,
  Plus,
  Power,
  SearchX,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { CategoryBadge, HotelStatus } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { hotels, type Hotel } from "@/data/mock";
import { fmtDate } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Placeholder artwork (CSS gradient — no photos in the demo)          */
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
/* Component                                                           */
/* ------------------------------------------------------------------ */

const DESTINATIONS = [...new Set(hotels.map((h) => h.destination))].sort();

export function HotelsList() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("all");
  const [destinationFilter, setDestinationFilter] = useState("all");
  const [confirmTarget, setConfirmTarget] = useState<Hotel | null>(null);

  const rows = useMemo(
    () =>
      hotels.filter(
        (h) =>
          (statusFilter === "all" || h.status === statusFilter) &&
          (destinationFilter === "all" || h.destination === destinationFilter),
      ),
    [statusFilter, destinationFilter],
  );

  const activating = confirmTarget?.status === "inactive";

  function clearFilters() {
    setStatusFilter("all");
    setDestinationFilter("all");
  }

  const columns: Column<Hotel>[] = [
    {
      key: "name",
      header: "Hotel",
      render: (h) => (
        <div className="flex items-center gap-3 py-1">
          <HotelThumb
            hue={h.imageHue}
            name={h.name}
            className="h-8 w-8 shrink-0 rounded-lg ring-1 ring-black/5"
          />
          <div className="min-w-0">
            <p className="max-w-[220px] truncate font-medium">{h.name}</p>
            <p className="truncate text-[13px] text-muted-foreground">{h.destination}</p>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      sortable: true,
      render: (h) => <CategoryBadge stars={h.category} />,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (h) => <HotelStatus status={h.status} />,
    },
    {
      key: "lastUpdated",
      header: "Last updated",
      sortable: true,
      render: (h) => (
        <span className="whitespace-nowrap text-[13px] text-muted-foreground">
          {fmtDate(h.lastUpdated)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      headerClassName: "w-12",
      render: (h) => (
        // Keep row-click navigation out of the action cell.
        <div
          className="flex justify-end"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Actions for ${h.name}`}
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onSelect={() => navigate(`/admin/hotels/${h.id}`)}>
                <Eye aria-hidden="true" /> View
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => navigate(`/admin/hotels/${h.id}/edit`)}>
                <Pencil aria-hidden="true" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() =>
                  toast.success(`${h.name} duplicated (demo — nothing was stored)`)
                }
              >
                <Copy aria-hidden="true" /> Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => setConfirmTarget(h)}
                className={activating ? "" : "text-destructive focus:text-destructive"}
              >
                <Power aria-hidden="true" />
                {activating ? "Activate" : "Deactivate"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Hotels"
        description="Manage the property portfolio, classifications and publication status."
        breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Hotels" }]}
        actions={
          <Button asChild>
            <Link to="/admin/hotels/new">
              <Plus aria-hidden="true" /> Add hotel
            </Link>
          </Button>
        }
      />

      <DataTable
        columns={columns}
        rows={rows}
        searchable={(h) => `${h.name} ${h.destination} ${h.country}`}
        pageSize={8}
        onRowClick={(h) => navigate(`/admin/hotels/${h.id}`)}
        emptyState={
          <EmptyState
            icon={SearchX}
            title="No hotels match"
            description="Try a different search term, or clear the status and destination filters."
            action={
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            }
          />
        }
        toolbar={
          <>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-[150px]" aria-label="Filter by status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={destinationFilter} onValueChange={setDestinationFilter}>
              <SelectTrigger className="h-9 w-[170px]" aria-label="Filter by destination">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All destinations</SelectItem>
                {DESTINATIONS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        }
      />

      <ConfirmDialog
        open={confirmTarget !== null}
        onOpenChange={(open) => !open && setConfirmTarget(null)}
        destructive={!activating}
        title={activating ? "Activate this hotel?" : "Deactivate this hotel?"}
        description={
          activating
            ? `${confirmTarget?.name ?? "This hotel"} will become bookable again in agent quotations.`
            : `${confirmTarget?.name ?? "This hotel"} will be hidden from new agent quotations. Existing quotations are unaffected.`
        }
        confirmLabel={activating ? "Activate" : "Deactivate"}
        onConfirm={() => {
          if (!confirmTarget) return;
          toast.success(
            `${confirmTarget.name} ${activating ? "activated" : "deactivated"} (demo — nothing was stored)`,
          );
        }}
      />
    </div>
  );
}
