import Link from "next/link";
import type { Metadata } from "next";
import { buttonVariants } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/breadcrumbs";

const SITE_URL = process.env.NEXTAUTH_URL ?? "https://next-hagebook.vercel.app";

export const metadata: Metadata = {
  title: "About hagebook",
  description:
    "hagebook is a HAGE Games handbook. Short lessons on building games and web apps with AI as a partner. Made for indie devs in Indonesia and beyond.",
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: "About hagebook",
    description:
      "Short lessons on building games and web apps with AI as a partner. Made for indie devs.",
  },
};

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12 space-y-8">
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "About" }]} />

      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <h1>About hagebook</h1>

        <p className="lead text-lg text-muted-foreground">
          hagebook is the open handbook of HAGE Games — a place to learn how to
          ship indie games and web apps with AI as a partner, not a crutch.
        </p>

        <h2>Why we built this</h2>
        <p>
          The bottleneck in game development used to be knowledge. You needed
          years of C++, shader math, build pipelines. Now AI can fill in most
          of that. The new bottleneck is taste, follow-through, and shipping
          something real. hagebook teaches that loop, one short lesson at a
          time.
        </p>

        <h2>Who it&apos;s for</h2>
        <ul>
          <li>
            <strong>Indie devs</strong> who want to ship browser games to{" "}
            <a
              href="https://hagegames.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              hagegames.com
            </a>{" "}
            or itch.io.
          </li>
          <li>
            <strong>Beginners</strong> with no engine experience but a willingness to build.
          </li>
          <li>
            <strong>Working devs</strong> exploring AI-assisted workflows beyond Copilot autocomplete.
          </li>
          <li>
            <strong>Game-curious folks in Indonesia</strong> — though every
            lesson is in plain English so anyone can follow.
          </li>
        </ul>

        <h2>How it works</h2>
        <ol>
          <li>Read a short lesson (5 min).</li>
          <li>Build the assignment (1 hour).</li>
          <li>Submit a public link to your work — repo, demo, screenshot.</li>
          <li>Admin reviews, marks PASS or FAIL with feedback.</li>
          <li>Re-submit if needed. Move to the next lesson.</li>
        </ol>

        <h2>What we believe</h2>
        <ul>
          <li>
            <strong>Ship rough, polish later.</strong> First builds will be
            ugly. That&apos;s fine. Speed of iteration matters more than first-pass
            quality.
          </li>
          <li>
            <strong>AI is a pair, not a replacement.</strong> Read every diff.
            Ask &ldquo;why&rdquo; not &ldquo;fix&rdquo;. Keep raw skills sharp with no-AI hours.
          </li>
          <li>
            <strong>Browser games are underrated.</strong> Cheap to make,
            instant to play, viral to share. Mobile-first, link-shareable, no
            install friction.
          </li>
          <li>
            <strong>Honest about tradeoffs.</strong> AI hallucinates. APIs
            break. Costs add up. We tell you when, where, how to spend.
          </li>
        </ul>

        <h2>HAGE Games</h2>
        <p>
          HAGE Games is an Indonesian indie game platform — discover, play,
          and share browser games. hagebook is HAGE&apos;s handbook for the devs
          who want to ship there. Learn more at{" "}
          <a
            href="https://hagegames.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            hagegames.com
          </a>{" "}
          or write us at{" "}
          <a href="mailto:contact@hagegames.com">contact@hagegames.com</a>.
        </p>

        <h2>What&apos;s next</h2>
        <p>
          Read the lessons, ship the things, send us your URLs. The handbook
          grows with the community.
        </p>
      </div>

      <div className="flex gap-3">
        <Link href="/" className={buttonVariants()}>
          Browse lessons
        </Link>
        <Link href="/faq" className={buttonVariants({ variant: "outline" })}>
          FAQ
        </Link>
      </div>
    </div>
  );
}
