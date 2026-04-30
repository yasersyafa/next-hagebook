import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t mt-auto">
      <div className="container mx-auto max-w-5xl px-4 py-6 flex flex-col sm:flex-row gap-3 sm:gap-6 items-start sm:items-center justify-between text-xs text-muted-foreground">
        <p>
          <span className="text-primary font-medium">hage</span>book · a HAGE
          Games handbook
        </p>
        <nav className="flex gap-4 flex-wrap">
          <Link href="/about" className="hover:text-foreground">
            About
          </Link>
          <Link href="/faq" className="hover:text-foreground">
            FAQ
          </Link>
          <Link href="/legal/terms" className="hover:text-foreground">
            Terms
          </Link>
          <Link href="/legal/privacy" className="hover:text-foreground">
            Privacy
          </Link>
          <a
            href="https://hagegames.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground"
          >
            HAGE Games ↗
          </a>
        </nav>
      </div>
    </footer>
  );
}
