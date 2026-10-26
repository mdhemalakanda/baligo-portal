import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  FileSearch,
  FileText,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { contractImports, type ContractImport } from "@/data/mock";
import { cn, fmtDate } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Upload dropzone (simulated)                                         */
/* ------------------------------------------------------------------ */

function UploadDropzone() {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);

  function announceFile() {
    toast.info("File ready (demo — no upload performed)");
  }

  return (
    <Card className="p-0">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload a contract document"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          announceFile();
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-4 py-8 text-center transition-colors sm:py-10",
          dragging
            ? "border-primary bg-primary/5"
            : "border-border bg-muted/30 hover:border-primary/40 hover:bg-primary/5",
        )}
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
          <UploadCloud className="h-5 w-5 text-primary" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-semibold">
            Drop a contract file here, or{" "}
            <span className="text-primary underline underline-offset-2">browse</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Scanned documents and standard PDFs supported
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            inputRef.current?.click();
          }}
        >
          <FileText aria-hidden="true" /> Browse files
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
          onChange={() => {
            announceFile();
            if (inputRef.current) inputRef.current.value = "";
          }}
        />
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const STATUS_TONE: Record<
  ContractImport["status"],
  { tone: "neutral" | "info" | "warning" | "success" | "teal"; label: string }
> = {
  extracting: { tone: "neutral", label: "Extracting" },
  review: { tone: "info", label: "Review" },
  issues: { tone: "warning", label: "Issues" },
  ready: { tone: "success", label: "Ready" },
  imported: { tone: "teal", label: "Imported" },
};

function WarningsCell({ warnings }: { warnings: ContractImport["warnings"] }) {
  if (warnings.length === 0) {
    return (
      <Badge variant="success">
        <Check aria-hidden="true" /> None
      </Badge>
    );
  }
  const hasHigh = warnings.some((w) => w.severity === "high");
  const hasMedium = warnings.some((w) => w.severity === "medium");
  if (hasHigh) {
    return (
      <Badge variant="destructive">
        <AlertTriangle aria-hidden="true" /> {warnings.length}
      </Badge>
    );
  }
  if (hasMedium) {
    return (
      <Badge variant="warning">
        <AlertTriangle aria-hidden="true" /> {warnings.length}
      </Badge>
    );
  }
  return (
    <Badge variant="success">
      <CheckCircle2 aria-hidden="true" /> {warnings.length}
    </Badge>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function ContractsList() {
  const navigate = useNavigate();

  const columns: Column<ContractImport>[] = [
    {
      key: "fileName",
      header: "File",
      sortable: true,
      render: (row) => (
        <div className="min-w-0">
          <p className="flex items-center gap-2 truncate font-medium">
            <FileText className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span className="truncate">{row.fileName}</span>
          </p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{row.supplier}</p>
        </div>
      ),
    },
    {
      key: "uploadedAt",
      header: "Uploaded",
      sortable: true,
      className: "whitespace-nowrap",
      render: (row) => (
        <div className="text-sm">
          <p>{fmtDate(row.uploadedAt.slice(0, 10))}</p>
          <p className="text-xs tabular-nums text-muted-foreground">{row.uploadedAt.slice(11, 16)}</p>
        </div>
      ),
    },
    {
      key: "rates",
      header: "Rates found",
      className: "tabular-nums",
      render: (row) => <span className="text-sm tabular-nums">{row.rates.length}</span>,
    },
    {
      key: "warnings",
      header: "Warnings",
      render: (row) => <WarningsCell warnings={row.warnings} />,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <StatusBadge tone={STATUS_TONE[row.status].tone} label={STATUS_TONE[row.status].label} />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Contract imports"
        description="Upload supplier contracts and let Baligo extract rates, seasons and policies for review."
        breadcrumbs={[{ label: "Admin" }, { label: "Contracts" }]}
        actions={
          <Button asChild>
            <Link to="/admin/contracts/imp-001">
              <UploadCloud aria-hidden="true" /> New import
            </Link>
          </Button>
        }
      />

      <div className="mb-6">
        <UploadDropzone />
      </div>

      <DataTable
        columns={columns}
        rows={contractImports}
        searchable={(row) => `${row.fileName} ${row.supplier}`}
        onRowClick={(row) => navigate(`/admin/contracts/${row.id}`)}
        emptyState={
          <EmptyState
            icon={FileSearch}
            title="No imports match your search"
            description="Try a different file name or supplier."
          />
        }
      />
    </>
  );
}
