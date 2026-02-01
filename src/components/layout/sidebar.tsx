"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Dumbbell,
  Heart,
  Moon,
  Scale,
  Target,
  Flag,
  ClipboardList,
  CalendarCheck,
  CheckSquare,
  Activity,
  Wind,
  Settings,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const homeItem: NavItem = {
  name: "Home",
  href: "/",
  icon: LayoutDashboard,
};

const navSections: NavSection[] = [
  {
    label: "OBJECTIVES",
    items: [
      { name: "Targets Overview", href: "/objectives", icon: Flag },
      { name: "Strength Goals", href: "/objectives/strength", icon: Dumbbell },
      { name: "Functional", href: "/objectives/functional", icon: Target },
      { name: "Body Composition", href: "/objectives/body", icon: Scale },
    ],
  },
  {
    label: "ROUTINES",
    items: [
      { name: "This Week", href: "/routines", icon: CalendarCheck },
      { name: "Workouts", href: "/routines/workouts", icon: Dumbbell },
      { name: "Check-In", href: "/routines/check-in", icon: CheckSquare },
      { name: "Reviews", href: "/routines/reviews", icon: ClipboardList },
    ],
  },
  {
    label: "VITALS",
    items: [
      { name: "Health Overview", href: "/vitals", icon: Activity },
      { name: "Recovery & Sleep", href: "/vitals/recovery", icon: Moon },
      { name: "Cardio & VO2", href: "/vitals/cardio", icon: Heart },
      { name: "Body Trends", href: "/vitals/body", icon: Wind },
    ],
  },
];

const settingsItem: NavItem = {
  name: "Settings",
  href: "/settings",
  icon: Settings,
};

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border/50 bg-sidebar backdrop-blur-xl">
      <div className="flex h-full flex-col">
        <div className="flex h-20 items-center border-b border-border/50 px-6">
          <Link href="/" className="group flex items-center gap-3 transition-transform hover:scale-105">
            <div className="rounded-xl bg-gradient-to-br from-primary to-blue-600 p-2 shadow-lg shadow-primary/20 transition-shadow group-hover:shadow-xl group-hover:shadow-primary/30">
              <Dumbbell className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              Decathlon
            </span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {/* Home */}
          <div className="mb-2">
            <NavLink item={homeItem} active={isActive(pathname, homeItem.href)} />
          </div>

          {/* Sections */}
          {navSections.map((section) => (
            <div key={section.label} className="mb-2">
              <p className="mb-1 px-3 pt-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.href}
                    item={item}
                    active={isActive(pathname, item.href)}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Settings + Sign out + Version at bottom */}
        <div className="border-t border-border/50 px-3 py-3">
          <NavLink item={settingsItem} active={isActive(pathname, settingsItem.href)} />
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-all duration-200 hover:bg-accent hover:text-sidebar-foreground hover:shadow-sm"
            >
              <LogOut className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
              <span>Sign out</span>
            </button>
          </form>
          <p className="mt-2 px-3 text-xs font-medium text-muted-foreground">
            v1.0.0
          </p>
        </div>
      </div>
    </aside>
  );
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200",
        active
          ? "bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg shadow-primary/20"
          : "text-sidebar-foreground/70 hover:bg-accent hover:text-sidebar-foreground hover:shadow-sm"
      )}
    >
      <Icon className={cn(
        "h-4 w-4 shrink-0 transition-transform group-hover:scale-110",
        active ? "text-white" : ""
      )} />
      <span>{item.name}</span>
    </Link>
  );
}
