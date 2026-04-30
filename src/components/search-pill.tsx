"use client";

import { Search } from "lucide-react";

export function SearchPill() {
  function open() {
    window.dispatchEvent(new CustomEvent("hagebook:open-palette"));
  }

  return (
    <button
      type="button"
      onClick={open}
      aria-label="Open search (Cmd+K)"
      className="inline-flex h-8 items-center gap-2 rounded-md border bg-background/60 px-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-background hover:border-primary/30 transition-colors"
    >
      <Search className="size-4" />
      <span className="hidden sm:inline">Search</span>
      <kbd className="ml-2 hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded border bg-muted px-1 font-mono text-[10px] text-muted-foreground">
        ⌘K
      </kbd>
    </button>
  );
}
