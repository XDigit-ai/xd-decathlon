"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Dumbbell,
  Flag,
  CalendarCheck,
  Activity,
  MoreHorizontal,
  Heart,
  Moon,
  Scale,
  Target,
  ClipboardList,
  CheckSquare,
  Wind,
  Settings,
  X,
  type LucideIcon,
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
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

const bottomNavItems: NavItem[] = [
  { name: "Home", href: "/", icon: LayoutDashboard },
  { name: "Objectives", href: "/objectives", icon: Flag },
  { name: "Routines", href: "/routines", icon: CalendarCheck },
  { name: "Vitals", href: "/vitals", icon: Activity },
];

const drawerSections: NavSection[] = [
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

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function MobileNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/80 backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-around px-2 pb-safe">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1.5 py-3 text-xs font-semibold transition-all duration-200",
                  active
                    ? "text-primary scale-105"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className={cn(
                  "rounded-xl p-2 transition-colors",
                  active ? "bg-primary/10" : ""
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-[10px]">{item.name}</span>
              </Link>
            );
          })}

          <button
            onClick={() => setIsOpen(true)}
            className="flex flex-1 flex-col items-center gap-1.5 py-3 text-xs font-semibold text-muted-foreground transition-all duration-200 hover:text-foreground"
          >
            <div className="rounded-xl p-2">
              <MoreHorizontal className="h-5 w-5" />
            </div>
            <span className="text-[10px]">More</span>
          </button>
        </div>
      </nav>

      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed inset-y-0 right-0 z-50 w-3/4 max-w-sm border-l border-border/50 bg-background/95 backdrop-blur-xl p-6 shadow-2xl transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right data-[state=closed]:duration-300 data-[state=open]:duration-500">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <Dialog.Title className="text-lg font-bold">
                  Navigation
                </Dialog.Title>
                <Dialog.Close asChild>
                  <button
                    className="rounded-xl p-2 opacity-70 ring-offset-background transition-all hover:opacity-100 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </Dialog.Close>
              </div>

              <nav className="flex-1 overflow-y-auto">
                {/* Home */}
                <Link
                  href="/"
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 mb-2",
                    isActive(pathname, "/")
                      ? "bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg shadow-primary/20"
                      : "text-foreground hover:bg-accent hover:shadow-sm"
                  )}
                >
                  <LayoutDashboard className={cn(
                    "h-5 w-5 shrink-0 transition-transform group-hover:scale-110",
                    isActive(pathname, "/") ? "text-white" : ""
                  )} />
                  <span>Home</span>
                </Link>

                {/* Sections */}
                {drawerSections.map((section) => (
                  <div key={section.label} className="mb-2">
                    <p className="mb-1 px-4 pt-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                      {section.label}
                    </p>
                    <div className="space-y-1">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(pathname, item.href);

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                              "group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200",
                              active
                                ? "bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg shadow-primary/20"
                                : "text-foreground hover:bg-accent hover:shadow-sm"
                            )}
                          >
                            <Icon className={cn(
                              "h-5 w-5 shrink-0 transition-transform group-hover:scale-110",
                              active ? "text-white" : ""
                            )} />
                            <span>{item.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Settings */}
                <div className="mt-4 border-t border-border/50 pt-4">
                  <Link
                    href="/settings"
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200",
                      isActive(pathname, "/settings")
                        ? "bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg shadow-primary/20"
                        : "text-foreground hover:bg-accent hover:shadow-sm"
                    )}
                  >
                    <Settings className={cn(
                      "h-5 w-5 shrink-0 transition-transform group-hover:scale-110",
                      isActive(pathname, "/settings") ? "text-white" : ""
                    )} />
                    <span>Settings</span>
                  </Link>
                </div>
              </nav>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
