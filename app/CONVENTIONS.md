# Baligo app conventions (read fully before writing pages)

Stack: React 18 + TypeScript + Tailwind v4 + vendored shadcn/ui + react-router-dom (HashRouter). Paths use `@/` alias → `src/`.

## Absolute rules
1. **UI only.** No fetch/axios/API calls, no persistence, no auth, no pricing engine, no external URLs. All data comes from `@/data/mock` (types in same file) and, for agent pricing, `@/data/pricing`.
2. **Admin-only commercial data** (`SeasonalRate.netRateIdr`, supplier names, markup, contracts) must NEVER be rendered in any file under `src/pages/agent/`.
3. Honest demo behavior: simulated actions use `toast` from `sonner` (already wired; just `import { toast } from "sonner"`), e.g. `toast.success("Hotel saved (demo — nothing was stored)")`.
4. Never let tables/dialogs overflow the viewport horizontally: use responsive classes (`grid`, `flex-col sm:flex-row`, Table already scrolls).
5. Every interactive control has an accessible name (aria-label for icon buttons).
6. Don't edit any file outside your assigned files. Don't edit `App.tsx`, router, shells, or `components/ui/*`. If a shared component is missing, build it locally in your page file.

## Imports available
```tsx
// UI primitives (@/components/ui): button, input, textarea, label, select, checkbox,
// switch, dialog, sheet, dropdown-menu, tabs, tooltip, popover, badge, card, separator,
// skeleton, avatar, table, progress, scroll-area, radio-group, calendar, sonner (Toaster)
// Shared (@/components/shared): PageHeader, StatusBadge (+HotelStatus, RateStatus,
// AgentStatus, CategoryBadge, UncertainBadge), StatCard, EmptyState, FormSection, Field,
// ConfirmDialog, DateRangePicker, DatePicker, DataTable (+Column, SearchInput, Pagination,
// PageSizeSelect), WarningBanner, DemoNote, BrandLogo, BrandMark
// Data: @/data/mock (hotels, roomTypes, seasonalRates, agents, contractImports,
// rateHistory, notifications, recentActivity, quotations, defaultSettings + lookup fns)
// Data: @/data/pricing (demoStaySummary, demoNightlyUsd, StayInput, StayState, DemoStaySummary)
// Utils: @/lib/utils (cn, usd, idr, fmtDate, nights)
// Toasts: import { toast } from "sonner"
```

## Style rules
- Page layout: `<PageHeader title description breadcrumbs actions />` then content. Max width comes from the shell; don't add extra max-w containers (agent portal shell already centers at max-w-6xl).
- Use `Card` for genuine grouping only; prefer sections with dividers (`FormSection`) for forms.
- Buttons: primary navy `Button`, teal accent `variant="teal"` (use sparingly), `variant="outline"` secondary, destructive for destructive.
- Money: `usd()` / `idr()` helpers; wrap in `className="amount tabular-nums"` where prominent.
- Dates: `fmtDate()`; date entry via `DateRangePicker` / `DatePicker` or `<Input type="date">` for compact inline fields.
- Status: use the `*Status` badge helpers; never color-only.
- Icons: `lucide-react`, size comes from `[&_svg]:size-4` defaults; pass `className="h-4 w-4"` when outside buttons.
- Empty/loading: `EmptyState`, `Skeleton`.
- Route links: react-router `Link` / `useNavigate` / `useParams` / `useSearchParams`.

## Mock interaction pattern
Local `useState` for filters/dialog state. Filtering/sorting over mock arrays is encouraged. For "save" flows: validate visually, then toast "(demo — nothing was stored)" and close. For delete/deactivate: `ConfirmDialog`.

## CSS placeholder artwork for hotel images
No local photos are available. Use tinted gradient placeholders:
```tsx
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
```
Round it with `rounded-lg` / `aspect-[4/3]` as fits.
