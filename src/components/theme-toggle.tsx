"use client";

import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const next = resolvedTheme === "dark" ? "light" : "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(next)}
      className={`text-xl`}
      aria-label={`Switch to ${next} mode`}
    >
      {resolvedTheme === "dark" ? "☀︎" : "☾"}
    </Button>
  );
}
