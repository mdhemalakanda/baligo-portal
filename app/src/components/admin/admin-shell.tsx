import * as React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  BedDouble,
  Building2,
  CalendarRange,
  FileUp,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Bell,
  Settings,
  SlidersHorizontal,
  Users,
  BadgeCheck,
  LifeBuoy,
} from "lucide-react";
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
import { notifications } from "@/data/mock";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const NAV = [
  {
    group: "Overview",
    items: [{ to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true }],
  },
  {
    group: "Inventory",
    items: [
      { to: "/admin/hotels", label: "Hotels", icon: Building2 },
      { to: "/admin/rooms", label: "Room Types", icon: BedDouble },
    ],
  },
  {
    group: "Pricing",
    items: [
      { to: "/admin/rates", label: "Supplier Rates", icon: SlidersHorizontal },
      { to: "/admin/history", label: "Rate History", icon: History },
      { to: "/admin/contracts", label: "Contract Import", icon: FileUp, badge: 3 },
    ],
  },
  {
    group: "Partners",
    items: [
      { to: "/admin/agents", label: "Agents", icon: Users, badge: 2 },
    ],
  },
  {
    group: "Configuration",
    items: [{ to: "/admin/settings", label: "Settings", icon: Settings }],
  },
];

const KIND_ICON = { contract: FileUp, agent: Users, rate: CalendarRange, system: LifeBuoy };

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4" aria-label="Admin navigation">
      {NAV.map((section) => (
        <div key={section.group}>
          <p className="mb-1.5 px-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/40">
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
                      "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal",
                      isActive && "bg-white/15 text-white",
                    )
                  }
                >
                  <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{item.label}</span>
                  {"badge" in item && item.badge ? (
                    <span className="ml-auto rounded-full bg-teal px-1.5 py-0.5 text-[10.5px] font-bold text-white">
                      {item.badge}
                    </span>
                  ) : null}
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
  return (
    <div className="border-t border-white/10 px-3 py-3.5">
      <div className="flex items-center gap-2.5 rounded-lg px-1 py-1">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-teal/20 text-teal-200">AR</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-[13px] font-medium text-white">Amelia Rahayu</p>
          <p className="truncate text-[11px] text-white/50">Portal administrator</p>
        </div>
      </div>
    </div>
  );
}

export function AdminShell() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const navigate = useNavigate();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <TooltipProvider delayDuration={200}>
      {/*
        Flex + sticky layout (not position:fixed) so the shell flows inside
        whatever container WordPress gives us — wp-admin content area or a
        standalone page — and always fills the full remaining width.
      */}
      <div className="flex min-h-screen w-full bg-background">
        {/* Desktop sidebar */}
        <aside className="baligo-sidebar sticky top-0 hidden h-screen w-60 shrink-0 flex-col bg-primary lg:flex">
          <div className="flex h-16 shrink-0 items-center px-5">
            <BrandLogo markClassName="h-8 w-8" tone="dark" />
          </div>
          <SidebarNav />
          <SidebarFooter />
        </aside>

        {/* Mobile sidebar */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-64 border-0 bg-primary p-0 [&>button]:text-white">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <div className="flex h-16 items-center px-5">
              <BrandLogo markClassName="h-8 w-8" tone="dark" />
            </div>
            <SidebarNav onNavigate={() => setMobileOpen(false)} />
            <SidebarFooter />
          </SheetContent>
        </Sheet>

        {/* Main column */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top bar */}
          <header className="baligo-topbar sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-card/80 px-4 backdrop-blur sm:px-6 lg:px-8">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Open navigation"
              onClick={() => setMobileOpen(true)}
            >
              <Menu />
            </Button>

            <div className="lg:hidden">
              <BrandLogo markClassName="h-7 w-7" />
            </div>

            <Badge variant="teal" className="ml-auto hidden sm:inline-flex">
              <BadgeCheck aria-hidden="true" /> Demo mode — sample data
            </Badge>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={`Notifications (${unread} unread)`} className="relative">
                  <Bell />
                  {unread > 0 && (
                    <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                      {unread}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 rounded-xl p-0">
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <p className="text-sm font-semibold">Notifications</p>
                  <Badge variant="secondary">{unread} new</Badge>
                </div>
                <ul className="max-h-80 overflow-y-auto">
                  {notifications.map((n) => {
                    const Icon = KIND_ICON[n.kind];
                    return (
                      <li key={n.id} className="border-b last:border-0">
                        <button
                          type="button"
                          className="flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/60 focus-visible:outline-none focus-visible:bg-secondary/60"
                          onClick={() => navigate("/admin/contracts")}
                        >
                          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                            <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-[13px] font-medium">
                              {n.title}
                            </span>
                            <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                              {n.detail}
                            </span>
                            <span className="mt-1 block text-[11px] text-muted-foreground/70">
                              {n.at}
                            </span>
                          </span>
                          {!n.read && (
                            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-teal" aria-label="Unread" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Account menu"
                  className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                >
                  <Avatar>
                    <AvatarFallback>AR</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 rounded-xl">
                <DropdownMenuLabel>
                  <span className="block">Amelia Rahayu</span>
                  <span className="block text-xs font-normal text-muted-foreground">
                    amelia@baligo.example
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/admin/settings")}>
                  <Settings aria-hidden="true" /> Portal settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/agent/sign-in")}>
                  <LifeBuoy aria-hidden="true" /> View agent sign-in
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut aria-hidden="true" /> Sign out (demo)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          <main className="w-full flex-1 px-[30px] pb-10 pt-8">
            <Outlet />
          </main>

          <footer className="border-t px-[30px] py-4 text-xs text-muted-foreground">
            Baligo portal UI · demo build with sample data · © 2026 Baligo Travel Group
          </footer>
        </div>
        <Toaster position="bottom-right" />
      </div>
    </TooltipProvider>
  );
}
