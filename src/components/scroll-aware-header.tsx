"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ScrollAwareHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 4);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "border-b sticky top-0 z-40 bg-background/70 backdrop-blur transition-shadow",
        scrolled ? "shadow-sm bg-background/90 backdrop-blur-md" : "",
        className,
      )}
    >
      {children}
    </header>
  );
}
