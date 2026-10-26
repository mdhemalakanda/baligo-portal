import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { AdminShell } from "@/components/admin/admin-shell";
import { AgentShell, BareShell } from "@/components/agent/agent-shell";

import { AdminOverview } from "@/pages/admin/overview";
import { HotelsList } from "@/pages/admin/hotels";
import { HotelForm } from "@/pages/admin/hotel-form";
import { HotelDetail } from "@/pages/admin/hotel-detail";
import { RoomTypesList } from "@/pages/admin/rooms";
import { RatesList } from "@/pages/admin/rates";
import { RateEditor } from "@/pages/admin/rate-editor";
import { AgentsList } from "@/pages/admin/agents";
import { AgentDetail } from "@/pages/admin/agent-detail";
import { ContractsList } from "@/pages/admin/contracts";
import { ContractImportWizard } from "@/pages/admin/contract-import";
import { RateHistory } from "@/pages/admin/history";
import { SettingsPage } from "@/pages/admin/settings";

import { AgentHome } from "@/pages/agent/home";
import { HotelSearch } from "@/pages/agent/search";
import { StayConfig } from "@/pages/agent/stay-config";
import { QuotationDetail } from "@/pages/agent/quotation";
import { QuotationPreview } from "@/pages/agent/preview";
import { QuotationsList } from "@/pages/agent/quotations";
import { AgentProfile } from "@/pages/agent/profile";
import { SignIn, PendingApproval, Deactivated } from "@/pages/agent/auth";

/**
 * The Baligo SPA.
 *
 * In WordPress the plugin mounts this app with window.BALIGO_APP.scope:
 *   - "admin"  → wp-admin screen shows the admin app
 *   - "agent"  → /baligo/ frontend page shows the agent portal
 *
 * Both scopes use the SAME /admin and /agent route prefixes as the dev
 * server, so every in-app Link/NavLink resolves identically everywhere.
 * With no scope present (vite dev server) both trees are reachable.
 */
export default function App() {
  const scope = window.BALIGO_APP?.scope;

  return (
    <HashRouter>
      {scope === "agent" ? (
        <Routes>
          <Route path="/agent/*" element={<AgentRoutes />} />
          <Route path="*" element={<Navigate to="/agent" replace />} />
        </Routes>
      ) : scope === "admin" ? (
        <Routes>
          <Route path="/admin/*" element={<AdminRoutes />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      ) : (
        <Routes>
          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="/admin/*" element={<AdminRoutes />} />
          <Route path="/agent/*" element={<AgentRoutes />} />
        </Routes>
      )}
    </HashRouter>
  );
}

function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminShell />}>
        <Route index element={<AdminOverview />} />
        <Route path="hotels" element={<HotelsList />} />
        <Route path="hotels/new" element={<HotelForm mode="create" />} />
        <Route path="hotels/:id" element={<HotelDetail />} />
        <Route path="hotels/:id/edit" element={<HotelForm mode="edit" />} />
        <Route path="rooms" element={<RoomTypesList />} />
        <Route path="rates" element={<RatesList />} />
        <Route path="rates/new" element={<RateEditor />} />
        <Route path="rates/:id" element={<RateEditor />} />
        <Route path="agents" element={<AgentsList />} />
        <Route path="agents/:id" element={<AgentDetail />} />
        <Route path="contracts" element={<ContractsList />} />
        <Route path="contracts/:id" element={<ContractImportWizard />} />
        <Route path="history" element={<RateHistory />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
}

function AgentRoutes() {
  return (
    <Routes>
      {/* Standalone (bare-chrome) screens */}
      <Route
        path="sign-in"
        element={
          <BareShell>
            <SignIn />
          </BareShell>
        }
      />
      <Route
        path="pending"
        element={
          <BareShell>
            <PendingApproval />
          </BareShell>
        }
      />
      <Route
        path="deactivated"
        element={
          <BareShell>
            <Deactivated />
          </BareShell>
        }
      />

      {/* Main portal */}
      <Route element={<AgentShell />}>
        <Route index element={<AgentHome />} />
        <Route path="search" element={<HotelSearch />} />
        <Route path="stay/:hotelId/:roomId" element={<StayConfig />} />
        <Route path="quote" element={<QuotationDetail />} />
        <Route path="preview" element={<QuotationPreview />} />
        <Route path="quotations" element={<QuotationsList />} />
        <Route path="quotations/:id" element={<QuotationDetail saved />} />
        <Route path="profile" element={<AgentProfile />} />
        <Route path="*" element={<Navigate to="/agent" replace />} />
      </Route>
    </Routes>
  );
}
