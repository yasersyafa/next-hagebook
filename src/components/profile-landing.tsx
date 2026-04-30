import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogoMark } from "@/components/logo";

const profile = {
  name: "HAGE",
  handle: "@hagegames",
  role: "Indie game platform — Indonesia",
  bio: "HAGE Games is an Indonesian indie game platform where developers publish browser-playable games and players discover, rate, and share them. hagebook is HAGE's open handbook — short lessons that teach you to ship the kind of work HAGE wants to see.",
  location: "Indonesia",
  links: [
    { label: "hagegames.com", href: "https://hagegames.com" },
    { label: "Email", href: "mailto:contact@hagegames.com" },
  ],
  highlights: [
    "Hosts indie browser games — upload, rate, share",
    "Community ratings, play counts, and game jams",
    "Built for indie developers and players in Indonesia and beyond",
  ],
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "HAGE Games",
  alternateName: "HAGEgames",
  url: "https://hagegames.com",
  logo: "https://hagegames.com/logo.png",
  description:
    "Indonesian indie game platform. Discover, play, and share browser games.",
  sameAs: ["https://hagegames.com"],
  email: "contact@hagegames.com",
};

export function ProfileLanding({ signedIn }: { signedIn: boolean }) {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16 space-y-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="space-y-6">
        <div className="flex items-start gap-6 flex-wrap">
          <LogoMark size={96} className="rounded-none bg-transparent" />
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-semibold tracking-tight">
                {profile.name}
              </h1>
              <Badge variant="secondary">{profile.handle}</Badge>
            </div>
            <p className="text-muted-foreground">
              {profile.role} • {profile.location}
            </p>
          </div>
        </div>
        <p className="text-lg leading-relaxed">{profile.bio}</p>
        <div className="flex gap-3 flex-wrap">
          {!signedIn ? (
            <>
              <Link href="/register" className={buttonVariants()}>
                Request access
              </Link>
              <Link
                href="/login"
                className={buttonVariants({ variant: "outline" })}
              >
                Sign in
              </Link>
            </>
          ) : (
            <Link
              href="/pending"
              className={buttonVariants({ variant: "outline" })}
            >
              Check status
            </Link>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm uppercase tracking-wider text-muted-foreground">
          About
        </h2>
        <Card>
          <CardContent className="pt-6">
            <ul className="space-y-2 text-sm">
              {profile.highlights.map((h) => (
                <li key={h} className="flex gap-2">
                  <span className="text-primary">▸</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm uppercase tracking-wider text-muted-foreground">
          Links
        </h2>
        <div className="flex gap-2 flex-wrap">
          {profile.links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              {l.label}
            </a>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm uppercase tracking-wider text-muted-foreground">
          How hagebook works
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            {
              n: "01",
              t: "Register",
              d: "Request access. The HAGE team approves your account.",
            },
            {
              n: "02",
              t: "Learn",
              d: "Work through short lessons on shipping games and web apps.",
            },
            {
              n: "03",
              t: "Submit",
              d: "Paste a link to your game or repo. Get graded feedback.",
            },
          ].map((s) => (
            <Card key={s.n}>
              <CardContent className="pt-6 space-y-2">
                <div className="text-2xl font-semibold text-primary">{s.n}</div>
                <div className="font-medium">{s.t}</div>
                <p className="text-sm text-muted-foreground">{s.d}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
