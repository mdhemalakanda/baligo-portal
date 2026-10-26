=== Baligo – B2B Hotel Quotation Portal ===
Contributors: baligo
Tags: travel, quotation, hotels, b2b, portal
Requires at least: 6.4
Tested up to: 6.8
Requires PHP: 8.0
Stable tag: 0.1.0
License: GPLv2 or later

Premium B2B hotel quotation management portal for travel agents.

== Description ==

Baligo ships two experiences from one React SPA (built with shadcn/ui, Tailwind CSS and TypeScript):

* **Admin dashboard** – hotels, room types, supplier rates & seasonal pricing, agents, AI contract import (UI prototype), rate history/audit, settings. Reach it from wp-admin → Baligo.
* **Agent portal** – hotel search, stay configuration, quotation review and a printable shareable preview. Reach it at `/baligo/` on the frontend.

**This release is a UI prototype.** All data is mock/demo data, all actions are simulated, and no backend, database, pricing engine, authentication or external service integration is included. Agent-facing screens never expose supplier net rates, markups, or contract details.

== Installation ==

1. Activate the plugin.
2. Visit wp-admin → Baligo for the admin dashboard.
3. Visit Settings → Permalinks → Save (once) to register the `/baligo/` agent portal URL.

== Development ==

The SPA source lives in `app/` (Vite + React + TS + Tailwind v4).

    cd app
    npm install
    npm run build      # outputs to ../assets (enqueued by the plugin)
    npm run dev        # dev server; admin at #/admin, agent portal at #/agent

The built JS/CSS in `assets/` is committed so the plugin works without Node.

== Changelog ==

= 0.1.0 =
* Initial UI prototype: complete admin dashboard and agent portal with mock data.
