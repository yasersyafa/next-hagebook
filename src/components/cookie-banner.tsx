"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "hagebook-cookie-consent";

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(STORAGE_KEY)) {
      const t = setTimeout(() => setShow(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4">
      <div className="container mx-auto max-w-3xl rounded-lg border bg-popover/95 backdrop-blur shadow-lg p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
        <p className="text-sm text-muted-foreground flex-1">
          hagebook uses essential cookies for sign-in and theme preference. No
          tracking. See our{" "}
          <Link href="/legal/privacy" className="text-primary underline-offset-4 hover:underline">
            privacy policy
          </Link>
          .
        </p>
        <Button size="sm" onClick={accept}>
          Got it
        </Button>
      </div>
    </div>
  );
}
