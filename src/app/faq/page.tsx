import Link from "next/link";
import type { Metadata } from "next";
import { buttonVariants } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/breadcrumbs";

const SITE_URL = process.env.NEXTAUTH_URL ?? "https://next-hagebook.vercel.app";

const faqs = [
  {
    q: "Who can join hagebook?",
    a: "Anyone with a working email. After registering, an admin reviews and approves your account before you can read full lessons or submit assignments. Most approvals happen within a day.",
  },
  {
    q: "Do I need prior game development experience?",
    a: "No. Lesson 1 assumes zero engine experience. The whole point of hagebook is that AI changed the floor — you can ship a working game without years of training. We start small (Pong, Snake) and scale up.",
  },
  {
    q: "What's the cost?",
    a: "hagebook itself is free. Some lessons recommend paid AI tools (Claude API ~$5-20/month, Midjourney $10/month). We always show free alternatives so you can do the full curriculum without spending. Rough monthly cost if you use everything: $20-40.",
  },
  {
    q: "What kinds of games will I build?",
    a: "Browser games — HTML5, JavaScript, deployable to itch.io or hagegames.com. Examples: Pong, Snake, brick breaker, match-3, simple platformers, top-down shooters, text adventures with AI NPCs. No native mobile, no Unity, no Unreal — just web tech.",
  },
  {
    q: "Do I need to be in Indonesia?",
    a: "No. HAGE Games is Indonesian, but lessons are in plain English and the platform is global. Indonesian devs are our primary audience but everyone is welcome.",
  },
  {
    q: "Can I use this for non-game projects?",
    a: "Yes. The AI-assisted dev workflow works for any web app. We just frame it through games because that's the most fun way to learn. The skills carry to startups, internal tools, side projects.",
  },
  {
    q: "What AI tools do I need?",
    a: "Lesson 2 walks through the full setup: Claude Code (free w/ Claude Pro account, or use Cursor / Copilot as alternatives), a code editor (VS Code or Cursor), a Vercel account for free hosting, and a GitHub account. Optional: Midjourney for art, ElevenLabs for voice, Suno for music.",
  },
  {
    q: "How are assignments graded?",
    a: "You submit a public URL — GitHub repo, deployed game, screenshot, anything we can open. An admin reviews and marks PASS or FAIL with written feedback. FAIL is not the end — you re-submit until PASS. We optimize for shipping, not perfection.",
  },
  {
    q: "How long does each lesson take?",
    a: "Reading: 5-10 minutes. Assignment: 1-3 hours depending on the lesson. Some are quick (write a pitch); some are full game builds (ship Pong end-to-end).",
  },
  {
    q: "Can I delete my account?",
    a: "Yes. Go to /account → Delete my account. Removes all your submissions, lesson reads, and personal data. Cannot be undone. You can also export your data as JSON before deleting.",
  },
  {
    q: "Is my code reviewed for security?",
    a: "We don't run or audit submitted code — we just check the URL renders something that meets the assignment. You're responsible for not shipping anything malicious. If you're embedding API keys or hosting user-facing apps, follow basic security hygiene.",
  },
  {
    q: "What if I get stuck?",
    a: "First, ask the AI tool you're using — that's literally what it's there for. If still stuck, email contact@hagegames.com with the lesson + what you tried. We'll write a follow-up post if multiple people hit the same wall.",
  },
];

export const metadata: Metadata = {
  title: "FAQ — building games with AI",
  description:
    "Common questions about hagebook: who it's for, what it costs, what you'll build, how AI fits in. Answers from HAGE Games.",
  alternates: { canonical: `${SITE_URL}/faq` },
  openGraph: {
    title: "hagebook FAQ",
    description: "Who, what, why, how — answered.",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: f.a,
    },
  })),
};

export default function FAQPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="container mx-auto max-w-3xl px-4 py-12 space-y-8">
        <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "FAQ" }]} />

        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Frequently asked questions
          </h1>
          <p className="text-lg text-muted-foreground">
            Practical answers about hagebook, AI-assisted game development,
            costs, and the assignment flow.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((f) => (
            <details
              key={f.q}
              className="group rounded-lg border bg-background p-5 hover:border-primary/30 transition-colors [&[open]]:border-primary/40"
            >
              <summary className="cursor-pointer list-none flex items-start justify-between gap-3 font-medium">
                <span>{f.q}</span>
                <span
                  className="shrink-0 text-primary transition-transform group-open:rotate-180"
                  aria-hidden
                >
                  ▼
                </span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {f.a}
              </p>
            </details>
          ))}
        </div>

        <div className="flex gap-3 pt-2">
          <Link href="/" className={buttonVariants()}>
            Browse lessons
          </Link>
          <Link href="/about" className={buttonVariants({ variant: "outline" })}>
            About
          </Link>
        </div>
      </div>
    </>
  );
}
