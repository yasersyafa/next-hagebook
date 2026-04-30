"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  // Cycle: system → light → dark → system
  function cycle() {
    if (theme === "system") setTheme("light");
    else if (theme === "light") setTheme("dark");
    else setTheme("system");
  }

  const Icon =
    theme === "system" ? Monitor : theme === "dark" ? Moon : Sun;
  const nextLabel =
    theme === "system" ? "light" : theme === "light" ? "dark" : "system";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycle}
      aria-label={`Theme: ${theme}. Click for ${nextLabel}.`}
      title={`Theme: ${theme}`}
    >
      <Icon className="h-5 w-5" />
    </Button>
  );
}
