import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy · Hagebook",
  description: "Privacy policy for hagebook.",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12 prose prose-neutral dark:prose-invert">
      <h1>Privacy Policy</h1>
      <p className="text-muted-foreground">Last updated: 2026-04-30</p>
      <p>
        Hagebook is operated by HAGE Games (Indonesia). This policy explains
        what data we collect and how we use it. Placeholder content — to be
        finalized before public launch.
      </p>
      <h2>What we collect</h2>
      <ul>
        <li>Account info: email, name, hashed password</li>
        <li>Activity: lesson reads, assignment submissions, grades, feedback</li>
        <li>Technical: IP address (transient, for rate limits), browser user-agent</li>
      </ul>
      <h2>How we use it</h2>
      <ul>
        <li>To provide the learning service</li>
        <li>To send transactional emails (approval, password reset, grading)</li>
        <li>To prevent abuse</li>
      </ul>
      <h2>Storage + security</h2>
      <p>
        Data is stored on Neon (PostgreSQL) and Vercel infrastructure.
        Passwords are bcrypt-hashed. Email is sent via Lark Mail.
      </p>
      <h2>Your rights</h2>
      <p>
        You can request data export or account deletion by emailing{" "}
        <a href="mailto:contact@hagegames.com">contact@hagegames.com</a>.
        Self-serve flows coming soon.
      </p>
      <h2>Cookies</h2>
      <p>
        We use essential cookies for authentication only. No third-party
        tracking cookies at this time.
      </p>
    </div>
  );
}
