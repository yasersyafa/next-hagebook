import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service · Hagebook",
  description: "Terms of service for hagebook.",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12 prose prose-neutral dark:prose-invert">
      <h1>Terms of Service</h1>
      <p className="text-muted-foreground">Last updated: 2026-04-30</p>
      <p>
        Hagebook is a learning platform operated by HAGE Games. By using this
        site, you agree to the terms below. This is placeholder content — final
        terms will be published before public launch.
      </p>
      <h2>Use of the service</h2>
      <p>
        You may use hagebook to read lessons and submit assignments. Don't
        misuse the service: no scraping, no abusing other users, no uploading
        content that violates law or third-party rights.
      </p>
      <h2>Accounts</h2>
      <p>
        You're responsible for keeping your password safe. We reserve the right
        to deactivate or delete accounts that violate these terms.
      </p>
      <h2>Content ownership</h2>
      <p>
        Lessons published on hagebook remain the property of HAGE Games.
        Submissions you make remain yours; by submitting you grant us the right
        to review and grade them.
      </p>
      <h2>Liability</h2>
      <p>
        The service is provided as-is, without warranty. We're not liable for
        damages arising from your use of hagebook.
      </p>
      <h2>Contact</h2>
      <p>
        Questions: <a href="mailto:contact@hagegames.com">contact@hagegames.com</a>
      </p>
    </div>
  );
}
