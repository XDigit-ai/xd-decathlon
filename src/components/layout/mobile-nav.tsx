"use client";

import { cn } from "@/lib/utils";
import {
  Activity,
  Dumbbell,
  Heart,
  Home,
  Menu,
  Scale,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const quickNav = [
  { name: "Home", href: "/", icon: Home },
  { name: "Body", href: "/body", icon: Scale },
  { name: "Strength", href: "/strength", icon: Dumbbell },
  { name: "Cardio", href: "/cardio", icon: Activity },
  { name: "Recovery", href: "/recovery", icon: Heart },
];

export function MobileNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Bottom navigation bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 md:hidden">
        <div className="flex items-center justify-around py-2">
          {quickNav.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs transition-colors",
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-zinc-500 dark:text-zinc-400"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setIsOpen(true)}
            className="flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400"
          >
            <Menu className="h-5 w-5" />
            <span>More</span>
          </button>
        </div>
      </nav>

      {/* Full menu overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-zinc-900 md:hidden">
          <div className="flex h-16 items-center justify-between border-b border-zinc-200 px-4 dark:border-zinc-800">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Menu
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4 p-4">
            {[
              { name: "Dashboard", href: "/", icon: Home },
              { name: "Body", href: "/body", icon: Scale },
              { name: "Strength", href: "/strength", icon: Dumbbell },
              { name: "Cardio", href: "/cardio", icon: Activity },
              { name: "Recovery", href: "/recovery", icon: Heart },
              { name: "Functional", href: "/functional", icon: Activity },
              { name: "Targets", href: "/targets", icon: Activity },
              { name: "Reviews", href: "/reviews", icon: Activity },
              { name: "Settings", href: "/settings", icon: Activity },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex flex-col items-center gap-2 rounded-xl bg-zinc-100 p-4 text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
