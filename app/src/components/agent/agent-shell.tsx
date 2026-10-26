import * as React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Home, Menu, Search, FileText, UserRound, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BrandLogo } from "@/components/shared/brand";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/**
 * Agent portal navigation — organised into groups.
 * Desktop (md+) shows a sticky left sidebar; mobile keeps the bottom tab bar
 * plus a hamburger sheet with the same grouped links.
 */
const NAV = [
  {
    group: "Workspace",
    items: [
      { to: "/agent", label: "Home", icon: Home, end: true },
      { to: "/agent/search", label: "Find Hotels", icon: Search },
      { to: "/agent/quotations", label: "My Quotations", icon: FileText },
    ],
  },
  {
    group: "Account",
    items: [{ to: "/agent/profile", label: "Profile", icon: UserRound }],
  },
];

const MOBILE_TABS = [
  { to: "/agent", label: "Home", icon: Home, end: true },
  { to: "/agent/search", label: "Hotels", icon: Search },
  { to: "/agent/quotations", label: "Quotes", icon: FileText },
  { to: "/agent/profile", label: "Profile", icon: UserRound },
];

const ACTIVE = "bg-primary/5 text-primary border border-primary/15";
const IDLE = "text-muted-foreground hover:bg-secondary/70 hover:text-foreground border border-transparent";

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-5" aria-label="Agent portal">
      {NAV.map((section) => (
        <div key={section.group}>
          <p className="mb-1.5 px-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
            {section.group}
          </p>
          <ul className="space-y-0.5">
            {section.items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={"end" in item && item.end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2.5 rounded-lg border px-2.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isActive ? ACTIVE : IDLE,
                    )
                  }
                >
                  <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function SidebarFooter() {
  const navigate = useNavigate();
  return (
    <div className="border-t p-3">
      <div className="flex items-center gap-2.5 rounded-lg px-1 py-1.5">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-teal/15 text-xs font-semibold text-teal-700">HK</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-[13px] font-medium">Hana Kobayashi</p>
          <p className="truncate text-[11px] text-muted-foreground">Sakura Travels</p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Sign out (demo)"
          title="Sign out (demo)"
          onClick={() => navigate("/agent/sign-in")}
        >
          <LogOut />
        </Button>
      </div>
    </div>
  );
}

/** Mobile bottom tab bar. */
function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 flex border-t bg-card/95 backdrop-blur md:hidden"
      aria-label="Agent portal navigation"
    >
      {MOBILE_TABS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={"end" in item && item.end}
          className={({ isActive }) =>
            cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium",
              isActive ? "text-primary" : "text-muted-foreground",
            )
          }
        >
          <item.icon className="h-5 w-5" aria-hidden="true" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

export function AgentShell() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const navigate = useNavigate();

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex min-h-screen w-full bg-background">
        {/* Desktop left sidebar */}
        <aside className="baligo-agent-sidebar sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r bg-card md:flex">
          <div className="flex h-16 shrink-0 items-center border-b px-5">
            <NavLink to="/agent" aria-label="Baligo home" className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <BrandLogo markClassName="h-8 w-8" />
            </NavLink>
          </div>
          <SidebarNav />
          <SidebarFooter />
        </aside>

        {/* Mobile menu sheet */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-72 p-0 [&_nav]:px-3">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <div className="flex h-16 items-center border-b px-5">
              <BrandLogo />
            </div>
            <div className="flex h-[calc(100%-4rem)] flex-col">
              <SidebarNav onNavigate={() => setMobileOpen(false)} />
              <SidebarFooter />
            </div>
          </SheetContent>
        </Sheet>

        {/* Main column */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top bar */}
          <header className="baligo-topbar sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-card/85 px-4 backdrop-blur sm:px-6">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu />
            </Button>

            <div className="md:hidden">
              <BrandLogo markClassName="h-7 w-7" />
            </div>

            <div className="ml-auto flex items-center gap-2">
              <Badge variant="teal" className="hidden sm:inline-flex">
                Demo data
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="Account menu"
                    className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                  >
                    <Avatar>
                      <AvatarFallback className="bg-teal/15 text-teal-700">HK</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl">
                  <DropdownMenuLabel>
                    <span className="block">Hana Kobayashi</span>
                    <span className="block text-xs font-normal text-muted-foreground">
                      Sakura Travels
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/agent/profile")}>
                    <UserRound aria-hidden="true" /> My profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/agent/quotations")}>
                    <FileText aria-hidden="true" /> My quotations
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/agent/sign-in")}>
                    <LogOut aria-hidden="true" /> Sign out (demo)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-24 sm:px-6 md:pb-10">
            <Outlet />
          </main>

          <footer className="border-t bg-card/50 py-4 text-center text-xs text-muted-foreground">
            Baligo agent portal · demo data only · © 2026 Baligo Travel Group
          </footer>
        </div>

        <BottomNav />
        <Toaster position="top-center" />
      </div>
    </TooltipProvider>
  );
}

/** Bare chrome for standalone agent screens (sign-in, pending, deactivated, print). */
export function BareShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <TooltipProvider delayDuration={200}>
      <div className={cn("flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10", className)}>
        {children}
        <Toaster position="top-center" />
      </div>
    </TooltipProvider>
  );
}
