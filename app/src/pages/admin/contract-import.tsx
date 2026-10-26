import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  FileText,
  Flag,
  HelpCircle,
  Info,
  MinusCircle,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge, UncertainBadge } from "@/components/shared/status-badge";
import { WarningBanner } from "@/components/shared/warning-banner";
import { contractImports, type ContractImport } from "@/data/mock";
import { cn, idr } from "@/lib/utils";

type RateFlag = ContractImport["rates"][number]["flag"];

interface EditableRate {
  id: string;
  room: string;
  season: string;
  dates: string;
  net: string;
  flag: RateFlag;
  resolved: boolean;
}

const toEditable = (imp: ContractImport): EditableRate[] =>
  imp.rates.map((r) => ({
    id: r.id,
    room: r.room,
    season: r.season,
    dates: r.dates,
    net: r.netIdr ? String(r.netIdr) : "",
    flag: r.flag,
    resolved: false,
  }));

/* ------------------------------------------------------------------ */
/* Stepper                                                             */
/* ------------------------------------------------------------------ */

const STEPS = ["Upload", "Review extraction", "Resolve issues", "Approval preview"];

function Stepper({ current, onStepClick }: { current: number; onStepClick: (s: number) => void }) {
  return (
    <nav aria-label="Import steps" className="mb-6">
      <ol className="flex items-center">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const done = n < current;
          const isCurrent = n === current;
          return (
            <li key={label} className="flex flex-1 items-center last:flex-none">
              <button
                type="button"
                disabled={!done}
                onClick={() => onStepClick(n)}
                aria-current={isCurrent ? "step" : undefined}
                aria-label={`Step ${n}: ${label}${done ? " (completed)" : ""}`}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  done ? "cursor-pointer" : "cursor-default",
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                    done && "border-primary bg-primary text-primary-foreground",
                    isCurrent && "border-primary bg-primary/10 text-primary ring-4 ring-primary/10",
                    !done && !isCurrent && "border-border bg-muted text-muted-foreground",
                  )}
                >
                  {done ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : n}
                </span>
                <span
                  className={cn(
                    "hidden text-xs font-medium sm:block",
                    isCurrent ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {label}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className={cn("mx-2 h-px min-w-4 flex-1 sm:mx-3", done ? "bg-primary/40" : "bg-border")}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/* Step 1 — Upload (simulated)                                         */
/* ------------------------------------------------------------------ */

function StepUpload({
  file,
  onRemove,
  progress,
  processing,
  processed,
  onProcess,
  onContinue,
}: {
  file: { name: string; sizeKb: number } | null;
  onRemove: () => void;
  progress: number;
  processing: boolean;
  processed: boolean;
  onProcess: () => void;
  onContinue: () => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);

  return (
    <div className="space-y-4">
      <WarningBanner tone="info" title="Demo import">
        All extraction on this screen is simulated — no document is uploaded or processed, and no
        data is stored. In the production build, contract PDFs stay private: they are stored in a
        non-public uploads folder, excluded from caches, and visible to administrators only.
      </WarningBanner>

      <Card
        className={cn("p-0 transition-colors", dragging && "border-primary bg-primary/5")}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          toast.info("File ready (demo — no upload performed)");
        }}
      >
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-4 py-8 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
            <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold">Drop a contract file here</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Scanned documents and standard PDFs supported
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
            Browse files
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            aria-hidden="true"
            tabIndex={-1}
            onChange={() => {
              toast.info("File ready (demo — no upload performed)");
              if (inputRef.current) inputRef.current.value = "";
            }}
          />
        </div>
      </Card>

      {file && (
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
              <FileText className="h-5 w-5 text-destructive" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                PDF · {(file.sizeKb / 1024).toFixed(1)} MB
              </p>
            </div>
            <Button variant="ghost" size="icon-sm" aria-label={`Remove ${file.name}`} onClick={onRemove}>
              <X aria-hidden="true" />
            </Button>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {processing
                  ? "Extracting rates and policies…"
                  : processed
                    ? "Extraction complete"
                    : "Not yet processed"}
              </span>
              <span className="font-medium tabular-nums">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} aria-label="Extraction progress" />
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={onProcess} disabled={processing}>
              <Sparkles aria-hidden="true" />
              {processed ? "Re-process file" : "Process file"}
            </Button>
            <Button onClick={onContinue} disabled={!processed}>
              Continue <ArrowRight aria-hidden="true" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared flag/severity iconography                                    */
/* ------------------------------------------------------------------ */

function FlagIcon({ flag }: { flag: RateFlag }) {
  if (flag === "ok") return <Check className="h-4 w-4 text-emerald-600" aria-label="OK" />;
  if (flag === "uncertain") return <HelpCircle className="h-4 w-4 text-amber-600" aria-label="Uncertain" />;
  if (flag === "conflict") return <AlertTriangle className="h-4 w-4 text-red-600" aria-label="Conflict" />;
  return <MinusCircle className="h-4 w-4 text-muted-foreground" aria-label="Missing" />;
}

function SeverityIcon({ severity }: { severity: "high" | "medium" | "low" }) {
  if (severity === "high")
    return <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />;
  if (severity === "medium")
    return <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />;
  return <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" aria-hidden="true" />;
}

function ConfidenceChip({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 100);
  if (pct >= 90)
    return (
      <Badge variant="success">
        <Check aria-hidden="true" /> High · {pct}%
      </Badge>
    );
  if (pct >= 70)
    return (
      <Badge variant="warning">
        <AlertTriangle aria-hidden="true" /> Medium · {pct}%
      </Badge>
    );
  return (
    <Badge variant="destructive">
      <XCircle aria-hidden="true" /> Low · {pct}%
    </Badge>
  );
}

/* ------------------------------------------------------------------ */
/* Step 2 — Review extraction                                          */
/* ------------------------------------------------------------------ */

const SOURCE_PAGES = 6;

function StepReview({ imp }: { imp: ContractImport }) {
  const [page, setPage] = React.useState(1);
  const hotelName = imp.confidence.find((c) => c.field === "Hotel name")?.value;

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {/* Source document */}
      <Card className="flex flex-col p-0">
        <CardHeader className="border-b py-3.5">
          <CardTitle className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span className="truncate">Source document</span>
            <Badge variant="neutral" className="ml-auto shrink-0">
              {SOURCE_PAGES} pages
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-4 pt-4">
          {/* Stylized fake PDF page (skeleton artwork) */}
          <div className="flex flex-1 items-start justify-center rounded-lg bg-muted/50 p-4 sm:p-6">
            <div className="w-full max-w-sm rounded-md border bg-white p-5 shadow-sm">
              <p className="mb-4 border-b border-gray-200 pb-3 text-center text-[11px] font-bold uppercase tracking-wide text-gray-700">
                {imp.fileName.replace(/\.pdf$/i, "").replace(/-/g, " ")}
              </p>
              <div aria-hidden="true" className="space-y-2">
                {[92, 100, 78, 96, 60].map((w, i) => (
                  <div key={i} className="h-2 rounded-sm bg-gray-200" style={{ width: `${w}%` }} />
                ))}
              </div>
              <div aria-hidden="true" className="my-4 rounded-sm border border-gray-200 p-3">
                <div className="mb-2 grid grid-cols-4 gap-2">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="h-1.5 rounded-sm bg-gray-300" />
                  ))}
                </div>
                {[0, 1, 2].map((r) => (
                  <div key={r} className="mb-1.5 grid grid-cols-4 gap-2 last:mb-0">
                    {[86, 70, 92, 64].map((w, i) => (
                      <div key={i} className="h-1.5 rounded-sm bg-gray-200" style={{ width: `${w}%` }} />
                    ))}
                  </div>
                ))}
              </div>
              <div aria-hidden="true" className="space-y-2">
                {[88, 95, 45].map((w, i) => (
                  <div key={i} className="h-2 rounded-sm bg-gray-200" style={{ width: `${w}%` }} />
                ))}
              </div>
              <p className="mt-4 text-[10px] text-gray-400">
                {hotelName ?? "Supplier contract"} · page {page} of {SOURCE_PAGES}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              aria-label="Previous page"
            >
              <ArrowLeft aria-hidden="true" /> Previous
            </Button>
            <span className="text-xs tabular-nums text-muted-foreground">
              Page {page} of {SOURCE_PAGES}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= SOURCE_PAGES}
              onClick={() => setPage((p) => Math.min(SOURCE_PAGES, p + 1))}
              aria-label="Next page"
            >
              Next <ArrowRight aria-hidden="true" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Extracted information */}
      <div className="space-y-4">
        <Card className="p-0">
          <CardHeader className="border-b py-3.5">
            <CardTitle className="text-sm">Extracted information</CardTitle>
          </CardHeader>
          <CardContent className="divide-y pt-0">
            {imp.confidence.map((c) => (
              <div
                key={c.field}
                className="flex flex-col gap-2 py-3 first:pt-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{c.label}</p>
                  <p className="truncate text-sm font-medium">{c.value}</p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {c.confidence < 0.7 && <UncertainBadge />}
                  <ConfidenceChip confidence={c.confidence} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="p-0">
          <CardHeader className="border-b py-3.5">
            <CardTitle className="text-sm">Extracted rates ({imp.rates.length})</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room</TableHead>
                  <TableHead>Season</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead className="text-right">Net (IDR)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {imp.rates.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-sm">
                      <span className="flex items-center gap-1.5 font-medium">
                        <FlagIcon flag={r.flag} /> {r.room}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{r.season}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm">{r.dates}</TableCell>
                    <TableCell className="text-right text-sm tabular-nums">{idr(r.netIdr)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="p-0">
          <CardHeader className="border-b py-3.5">
            <CardTitle className="text-sm">Warnings ({imp.warnings.length})</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {imp.warnings.length === 0 ? (
              <p className="flex items-center gap-2 py-3 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                No warnings — extraction looks clean.
              </p>
            ) : (
              <ul className="divide-y">
                {imp.warnings.map((w) => (
                  <li key={w.id} className="flex gap-2.5 py-3 first:pt-0 last:pb-0">
                    <SeverityIcon severity={w.severity} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{w.title}</p>
                      <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">
                        {w.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 3 — Resolve issues                                             */
/* ------------------------------------------------------------------ */

function StepResolve({
  imp,
  rows,
  setRows,
}: {
  imp: ContractImport;
  rows: EditableRate[];
  setRows: React.Dispatch<React.SetStateAction<EditableRate[]>>;
}) {
  const [showSource, setShowSource] = React.useState(false);
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

  const sourceOf = (rid: string) => imp.rates.find((r) => r.id === rid);

  function update(rid: string, patch: Partial<EditableRate>) {
    setRows((rs) => rs.map((r) => (r.id === rid ? { ...r, ...patch } : r)));
  }

  function resolve(rid: string) {
    setRows((rs) => rs.map((r) => (r.id === rid ? { ...r, flag: "ok" as const, resolved: true } : r)));
    toast.success("Rate marked as resolved (demo — nothing was stored)");
  }

  const rowTone = (r: EditableRate) =>
    r.resolved
      ? "bg-emerald-50/50 hover:bg-emerald-50/70"
      : r.flag === "conflict"
        ? "bg-red-50/60 hover:bg-red-50/80"
        : r.flag === "uncertain"
          ? "bg-amber-50/70 hover:bg-amber-50"
          : r.flag === "missing"
            ? "bg-muted/50 hover:bg-muted/70"
            : undefined;

  const flagLabel = (r: EditableRate) => {
    if (r.resolved)
      return (
        <Badge variant="success">
          <Check aria-hidden="true" /> Resolved
        </Badge>
      );
    if (r.flag === "conflict") return <Badge variant="destructive">Conflict</Badge>;
    if (r.flag === "uncertain") return <UncertainBadge />;
    if (r.flag === "missing") return <Badge variant="neutral">Missing</Badge>;
    return (
      <Badge variant="success">
        <Check aria-hidden="true" /> OK
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <WarningBanner tone="info" title="Review the extracted rows">
        Edit any field inline, then mark each flagged row as resolved. Rows stay highlighted until
        every issue is addressed.
      </WarningBanner>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Switch
            id="compare-source"
            checked={showSource}
            onCheckedChange={setShowSource}
            aria-label="Show source comparison column"
          />
          <label htmlFor="compare-source" className="cursor-pointer text-sm font-medium">
            Compare with source
          </label>
        </div>
        <span className="text-xs text-muted-foreground">
          {rows.filter((r) => !r.resolved && r.flag !== "ok").length} unresolved
        </span>
      </div>

      <Card className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[180px]">Room</TableHead>
                <TableHead className="min-w-[130px]">Season</TableHead>
                <TableHead className="min-w-[170px]">Dates</TableHead>
                <TableHead className="min-w-[150px]">Net rate (IDR)</TableHead>
                <TableHead>Status</TableHead>
                {showSource && <TableHead className="min-w-[220px]">Source (scanned)</TableHead>}
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => {
                const src = sourceOf(r.id);
                const netEmpty = r.net.trim() === "";
                const showError = netEmpty && (touched[r.id] || r.flag === "missing");
                return (
                  <React.Fragment key={r.id}>
                    <TableRow className={rowTone(r)}>
                      <TableCell>
                        <Input
                          value={r.room}
                          onChange={(e) => update(r.id, { room: e.target.value })}
                          aria-label={`Room name for row ${r.id}`}
                          className="h-8 bg-white text-sm"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={r.season}
                          onChange={(e) => update(r.id, { season: e.target.value })}
                          aria-label={`Season for row ${r.id}`}
                          className="h-8 bg-white text-sm"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={r.dates}
                          onChange={(e) => update(r.id, { dates: e.target.value })}
                          aria-label={`Dates for row ${r.id}`}
                          className="h-8 bg-white text-sm"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={r.net}
                          inputMode="numeric"
                          onChange={(e) => update(r.id, { net: e.target.value })}
                          onBlur={() => setTouched((t) => ({ ...t, [r.id]: true }))}
                          aria-label={`Net rate in IDR for row ${r.id}`}
                          aria-invalid={showError}
                          className={cn(
                            "h-8 bg-white text-sm tabular-nums",
                            showError && "border-destructive focus-visible:ring-destructive/30",
                          )}
                        />
                        {showError && (
                          <p className="mt-1 text-xs font-medium text-destructive" role="alert">
                            Net rate is required
                          </p>
                        )}
                      </TableCell>
                      <TableCell>{flagLabel(r)}</TableCell>
                      {showSource && (
                        <TableCell className="text-xs leading-relaxed text-muted-foreground">
                          {src ? (
                            <span className="font-mono">
                              {src.room} · {src.season} · {src.dates} ·{" "}
                              {src.netIdr ? idr(src.netIdr) : "—"}
                            </span>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                      )}
                      <TableCell className="text-right">
                        {r.resolved ? (
                          <Button variant="outline" size="sm" disabled aria-label="Rate resolved">
                            <Check aria-hidden="true" /> Resolved
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => resolve(r.id)}
                            aria-label={`Resolve row ${r.id}`}
                          >
                            <Check aria-hidden="true" /> Resolve
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                    {!r.resolved && src?.note && (
                      <TableRow className={rowTone(r)}>
                        <TableCell colSpan={showSource ? 7 : 6} className="border-t-0 pt-0">
                          <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                            <Flag className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
                            {src.note}
                          </p>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 4 — Approval preview                                           */
/* ------------------------------------------------------------------ */

function StepApprove({
  imp,
  rows,
  status,
  onApprove,
  onCancel,
}: {
  imp: ContractImport;
  rows: EditableRate[];
  status: ContractImport["status"];
  onApprove: () => void;
  onCancel: () => void;
}) {
  const [agree, setAgree] = React.useState(false);
  const [cancelOpen, setCancelOpen] = React.useState(false);

  const hotelName = imp.confidence.find((c) => c.field === "Hotel name")?.value ?? "—";
  const currency = imp.confidence.find((c) => c.field === "Currency")?.value ?? "IDR";
  const newCount = rows.filter((r) => r.flag === "ok").length;
  const blockingWarnings = imp.warnings.filter((w) => w.severity !== "low");

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <Card className="p-0">
          <CardHeader className="border-b py-3.5">
            <CardTitle className="text-sm">Import summary</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <dl className="grid grid-cols-1 gap-x-8 gap-y-2 border-b py-3 sm:grid-cols-2">
              {[
                ["Hotel", hotelName],
                ["Supplier", imp.supplier],
                ["Currency", currency],
                ["New rates", `${newCount} of ${rows.length}`],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-3">
                  <dt className="text-xs text-muted-foreground">{k}</dt>
                  <dd className="truncate text-sm font-medium">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="py-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Changes detected</p>
              <ul className="space-y-1.5">
                {rows.map((r) => {
                  const amount = r.net.trim() && Number(r.net) > 0 ? idr(Number(r.net)) : "—";
                  return (
                    <li key={r.id} className="flex items-start gap-2 text-sm">
                      {r.flag === "ok" ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                      ) : (
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
                      )}
                      <span>
                        {r.flag === "ok"
                          ? "New rate"
                          : r.flag === "conflict"
                            ? "Conflicting rate"
                            : r.flag === "missing"
                              ? "Missing rate"
                              : "Uncertain rate"}{" "}
                        · {r.room} ({r.season}) —{" "}
                        <span className="tabular-nums">
                          {r.flag === "missing" ? "no value extracted" : amount}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </CardContent>
        </Card>

        {status !== "imported" && (
          <Card className="border-primary/30 bg-primary/[0.03] p-4">
            <label htmlFor="confirm-review" className="flex cursor-pointer items-start gap-3">
              <Checkbox
                id="confirm-review"
                checked={agree}
                onCheckedChange={(v) => setAgree(v === true)}
                className="mt-0.5"
              />
              <span className="text-sm font-medium leading-relaxed">
                I have reviewed the extracted data with the source document
              </span>
            </label>
          </Card>
        )}
      </div>

      <div className="space-y-4">
        {blockingWarnings.length > 0 ? (
          <WarningBanner
            tone={blockingWarnings.some((w) => w.severity === "high") ? "danger" : "warning"}
            title={`${blockingWarnings.length} warning${blockingWarnings.length > 1 ? "s" : ""} still unresolved`}
          >
            <ul className="mt-1 list-disc space-y-1 pl-4">
              {blockingWarnings.map((w) => (
                <li key={w.id}>{w.title}</li>
              ))}
            </ul>
          </WarningBanner>
        ) : (
          <WarningBanner tone="info" title="No blocking warnings">
            Remaining notes are low severity and can be imported as-is.
          </WarningBanner>
        )}

        {status === "imported" ? (
          <Card className="flex flex-col items-center gap-3 p-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" aria-hidden="true" />
            <p className="text-sm font-semibold">This import has been approved</p>
            <StatusBadge tone="teal" label="Imported" />
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            <Button disabled={!agree} onClick={onApprove}>
              <CheckCircle2 aria-hidden="true" /> Approve import
            </Button>
            <Button variant="outline" onClick={() => setCancelOpen(true)}>
              Cancel import
            </Button>
            {!agree && (
              <p className="text-xs text-muted-foreground">
                Tick the confirmation checkbox above to enable approval.
              </p>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel this import?"
        description="The extracted rates will be discarded and you will return to the contract list. This cannot be undone."
        confirmLabel="Cancel import"
        destructive
        onConfirm={onCancel}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function ContractImportWizard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const imp = contractImports.find((c) => c.id === id) ?? contractImports[0];

  const [step, setStep] = React.useState(1);
  const [status, setStatus] = React.useState<ContractImport["status"]>(imp.status);
  const [file, setFile] = React.useState<{ name: string; sizeKb: number } | null>({
    name: imp.fileName,
    sizeKb: imp.fileSizeKb,
  });
  const [progress, setProgress] = React.useState(0);
  const [processing, setProcessing] = React.useState(false);
  const [processed, setProcessed] = React.useState(false);
  const [rows, setRows] = React.useState<EditableRate[]>(() => toEditable(imp));

  const intervalRef = React.useRef<number | null>(null);
  React.useEffect(() => {
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, []);

  function processFile() {
    if (!file || processing) return;
    setProcessing(true);
    setProgress(6);
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(() => {
      setProgress((p) => Math.min(96, p + 9 + Math.random() * 12));
    }, 220);
    window.setTimeout(() => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      setProgress(100);
      setProcessing(false);
      setProcessed(true);
      toast.success("Extraction complete (demo — no document was processed)");
    }, 2600);
  }

  return (
    <>
      <PageHeader
        title="Contract import"
        description={`${imp.fileName} · ${imp.supplier}`}
        breadcrumbs={[
          { label: "Admin" },
          { label: "Contracts", to: "/admin/contracts" },
          { label: imp.id },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge
              tone={
                status === "issues"
                  ? "warning"
                  : status === "imported"
                    ? "teal"
                    : status === "ready"
                      ? "success"
                      : "info"
              }
              label={status.charAt(0).toUpperCase() + status.slice(1)}
            />
            <Button variant="outline" onClick={() => navigate("/admin/contracts")}>
              <ArrowLeft aria-hidden="true" /> Back to list
            </Button>
          </div>
        }
      />

      <Stepper current={step} onStepClick={setStep} />

      <div className="mb-6">
        {step === 1 && (
          <StepUpload
            file={file}
            onRemove={() => {
              setFile(null);
              setProcessed(false);
              setProgress(0);
            }}
            progress={progress}
            processing={processing}
            processed={processed}
            onProcess={processFile}
            onContinue={() => setStep(2)}
          />
        )}
        {step === 2 && <StepReview imp={imp} />}
        {step === 3 && <StepResolve imp={imp} rows={rows} setRows={setRows} />}
        {step === 4 && (
          <StepApprove
            imp={imp}
            rows={rows}
            status={status}
            onApprove={() => {
              setStatus("imported");
              toast.success("Import approved (demo — nothing was stored)");
            }}
            onCancel={() => navigate("/admin/contracts")}
          />
        )}
      </div>

      {step > 1 && (
        <div className="flex items-center justify-between border-t pt-4">
          <Button variant="outline" onClick={() => setStep((s) => Math.max(1, s - 1))}>
            <ArrowLeft aria-hidden="true" /> Back
          </Button>
          {step < 4 && (
            <Button onClick={() => setStep((s) => Math.min(4, s + 1))}>
              Next <ArrowRight aria-hidden="true" />
            </Button>
          )}
        </div>
      )}
    </>
  );
}
