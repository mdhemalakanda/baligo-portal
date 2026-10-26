import * as React from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Search field                                                        */
/* ------------------------------------------------------------------ */

export function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  className,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        type="search"
        value={value}
        aria-label={ariaLabel ?? placeholder}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Pagination                                                          */
/* ------------------------------------------------------------------ */

export function Pagination({
  page,
  pageCount,
  onPageChange,
  totalLabel,
}: {
  page: number;
  pageCount: number;
  onPageChange: (p: number) => void;
  totalLabel?: string;
}) {
  if (pageCount <= 0) return null;
  return (
    <div className="flex flex-col-reverse items-center justify-between gap-3 py-3 sm:flex-row">
      <p className="text-[13px] text-muted-foreground">{totalLabel}</p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft aria-hidden="true" /> Previous
        </Button>
        <span className="min-w-16 text-center text-sm tabular-nums text-muted-foreground">
          Page {page} of {pageCount}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
        >
          Next <ChevronRight aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* DataTable                                                           */
/* ------------------------------------------------------------------ */

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  className?: string;
  headerClassName?: string;
  /** Visually hide column on mobile (table still scrolls horizontally). */
  render: (row: T) => React.ReactNode;
}

/**
 * Generic demo data table: client-side sort + pagination over mock rows.
 * Wraps in the responsive Table container (horizontal scroll on narrow screens).
 */
export function DataTable<T extends { id: string }>({
  columns,
  rows,
  searchable,
  pageSize = 8,
  page: controlledPage,
  onRowClick,
  emptyState,
  toolbar,
}: {
  columns: Column<T>[];
  rows: T[];
  /** When provided, the table renders its own search input above. */
  searchable?: (row: T) => string;
  pageSize?: number;
  page?: number;
  onRowClick?: (row: T) => void;
  emptyState?: React.ReactNode;
  toolbar?: React.ReactNode;
}) {
  const [internalPage, setPage] = React.useState(1);
  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const page = controlledPage ?? internalPage;

  const filtered = React.useMemo(() => {
    let out = rows;
    if (searchable && query.trim()) {
      const q = query.trim().toLowerCase();
      out = out.filter((r) => searchable(r).toLowerCase().includes(q));
    }
    if (sort) {
      const col = columns.find((c) => c.key === sort.key);
      if (col) {
        out = [...out].sort((a, b) => {
          const av = String(rawSortValue(a, col));
          const bv = String(rawSortValue(b, col));
          const cmp = av.localeCompare(bv, undefined, { numeric: true });
          return sort.dir === "asc" ? cmp : -cmp;
        });
      }
    }
    return out;
  }, [rows, query, sort, columns, searchable]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  function toggleSort(col: Column<T>) {
    if (!col.sortable) return;
    setSort((s) =>
      s?.key === col.key
        ? s.dir === "asc"
          ? { key: col.key, dir: "desc" }
          : null
        : { key: col.key, dir: "asc" },
    );
  }

  return (
    <div>
      {(searchable || toolbar) && (
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {searchable && (
            <SearchInput value={query} onChange={setQuery} className="sm:w-72" />
          )}
          {toolbar && <div className="flex flex-wrap items-center gap-2">{toolbar}</div>}
        </div>
      )}

      {paged.length === 0 && emptyState ? (
        emptyState
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                {columns.map((col) => (
                  <TableHead key={col.key} className={col.headerClassName}>
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(col)}
                        className="inline-flex items-center gap-1 uppercase tracking-wide hover:text-foreground cursor-pointer"
                        aria-label={`Sort by ${col.header}`}
                      >
                        {col.header}
                        {sort?.key === col.key ? (
                          sort.dir === "asc" ? (
                            <ArrowUp className="h-3 w-3" aria-hidden="true" />
                          ) : (
                            <ArrowDown className="h-3 w-3" aria-hidden="true" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-50" aria-hidden="true" />
                        )}
                      </button>
                    ) : (
                      col.header
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(onRowClick && "cursor-pointer")}
                >
                  {columns.map((col) => (
                    <TableCell key={col.key} className={col.className}>
                      {col.render(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Pagination
        page={safePage}
        pageCount={pageCount}
        onPageChange={setPage}
        totalLabel={`${filtered.length} ${filtered.length === 1 ? "record" : "records"}`}
      />
    </div>
  );
}

/** Extract a comparable value from a row for a column. */
function rawSortValue<T extends { id: string }>(row: T, col: Column<T>): unknown {
  const rec = row as unknown as Record<string, unknown>;
  return rec[col.key];
}

/* ------------------------------------------------------------------ */
/* Page-size selector (standalone, optional)                           */
/* ------------------------------------------------------------------ */

export function PageSizeSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-8 w-[110px]" aria-label="Rows per page">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="8">8 / page</SelectItem>
        <SelectItem value="16">16 / page</SelectItem>
        <SelectItem value="32">32 / page</SelectItem>
      </SelectContent>
    </Select>
  );
}
