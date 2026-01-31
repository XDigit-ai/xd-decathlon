"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

const routeTitles: Record<string, string> = {
  "/": "Dashboard",
  "/objectives": "Targets Overview",
  "/objectives/strength": "Strength Goals",
  "/objectives/functional": "Functional Benchmarks",
  "/objectives/body": "Body Composition Goals",
  "/routines": "This Week",
  "/routines/workouts": "Workouts",
  "/routines/check-in": "Daily Check-In",
  "/routines/reviews": "Reviews",
  "/vitals": "Health Overview",
  "/vitals/recovery": "Recovery & Sleep",
  "/vitals/cardio": "Cardio & VO2",
  "/vitals/body": "Body Trends",
  "/vitals/body/photos": "Progress Photos",
  "/settings": "Settings",
};

function getTitleFromPath(pathname: string): string {
  // Exact match first
  if (routeTitles[pathname]) return routeTitles[pathname];

  // Check for dynamic routes
  if (pathname.startsWith("/routines/workouts/")) return "Exercise Detail";
  if (pathname.startsWith("/routines/reviews/weekly/")) return "Weekly Review";
  if (pathname.startsWith("/routines/reviews/monthly/")) return "Monthly Review";
  if (pathname.startsWith("/routines/reviews/quarterly/")) return "Quarterly Review";

  // Fallback: capitalize last segment
  const segments = pathname.split("/").filter(Boolean);
  const last = segments[segments.length - 1] || "Dashboard";
  return last.charAt(0).toUpperCase() + last.slice(1).replace(/-/g, " ");
}

interface HeaderProps {
  title?: string;
  onMenuClick?: () => void;
}

export function Header({ title, onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const [theme, setThemeState] = useState<"light" | "dark">("light");

  const displayTitle = title || getTitleFromPath(pathname);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setThemeState(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = useCallback(() => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("theme", next);
    setThemeState(next);
  }, [theme]);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 px-6">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex-1">
        <h1 className="text-lg font-bold tracking-tight text-foreground md:text-xl">
          {displayTitle}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="rounded-xl transition-all hover:bg-accent hover:shadow-sm"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        <div className="ml-1 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-600 text-sm font-bold text-white shadow-lg shadow-primary/20">
          AK
        </div>
      </div>
    </header>
  );
}
