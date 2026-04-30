import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

const fromAddress = process.env.EMAIL_FROM ?? "hagebook <hello@hagegames.com>";
const replyTo = process.env.EMAIL_REPLY_TO ?? "contact@hagegames.com";
const appUrl = process.env.NEXTAUTH_URL ?? "https://next-hagebook.vercel.app";
const brand = "#ff005a";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 465;
const SMTP_SECURE =
  (process.env.SMTP_SECURE ?? "true").toLowerCase() !== "false";
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

let transporter: Transporter | null = null;
function getTransport(): Transporter | null {
  if (transporter) return transporter;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
}

export type EmailTemplateName =
  | "approval"
  | "rejection"
  | "reset"
  | "grade-pass"
  | "grade-fail";

type SendArgs = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

async function attemptSend(tx: Transporter, args: SendArgs) {
  return tx.sendMail({
    from: fromAddress,
    replyTo,
    to: args.to,
    subject: args.subject,
    html: args.html,
    text: args.text,
  });
}

async function send({ to, subject, html, text }: SendArgs) {
  const tx = getTransport();
  if (!tx) {
    console.warn(
      `[email] SMTP not configured. Would send to ${to}: ${subject}\n--- text ---\n${text}`,
    );
    return { ok: true as const, skipped: true };
  }
  try {
    const info = await attemptSend(tx, { to, subject, html, text });
    return { ok: true as const, id: info.messageId };
  } catch (err) {
    console.warn("[email] first attempt failed, retrying in 500ms:", err);
    await new Promise((r) => setTimeout(r, 500));
    try {
      const info = await attemptSend(tx, { to, subject, html, text });
      return { ok: true as const, id: info.messageId, retried: true };
    } catch (err2) {
      console.error("[email] send failed after retry:", err2);
      return {
        ok: false as const,
        error: err2 instanceof Error ? err2.message : "Email send failed",
      };
    }
  }
}

function shell(
  title: string,
  intro: string,
  ctaLabel: string,
  ctaHref: string,
  body: string,
) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0a0a0a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 16px;background:#f4f4f5;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 2px rgba(0,0,0,0.04);">
          <tr>
            <td style="padding:24px 32px;border-bottom:1px solid #e4e4e7;">
              <span style="font-size:18px;font-weight:600;letter-spacing:-0.01em;">
                <span style="color:${brand};">hage</span><span style="color:#0a0a0a;">book</span>
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 16px;font-size:22px;font-weight:600;letter-spacing:-0.01em;color:#0a0a0a;">${title}</h1>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#3f3f46;">${intro}</p>
              ${body}
              ${
                ctaHref
                  ? `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:24px 0 8px;">
                <tr>
                  <td style="background:${brand};border-radius:8px;">
                    <a href="${ctaHref}" style="display:inline-block;padding:12px 20px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;">${ctaLabel}</a>
                  </td>
                </tr>
              </table>`
                  : ""
              }
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #e4e4e7;font-size:12px;color:#71717a;">
              You received this because someone registered with this email at hagebook.<br/>
              hagebook · a HAGE Games handbook
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendApprovalEmail(args: {
  to: string;
  name?: string | null;
}) {
  const greeting = args.name ? `Hi ${args.name},` : "Hi,";
  const subject = "Your hagebook account is approved";
  const intro = `${greeting} good news — an admin has approved your hagebook account.`;
  const ctaHref = `${appUrl}/login`;
  const body = `<p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#3f3f46;">You can now sign in, read lessons, and submit assignments.</p>`;
  const html = shell(subject, intro, "Sign in", ctaHref, body);
  const text = [
    intro,
    "",
    "You can now sign in, read lessons, and submit assignments.",
    "",
    `Sign in: ${ctaHref}`,
  ].join("\n");
  return send({ to: args.to, subject, html, text });
}

export async function sendResetEmail(args: {
  to: string;
  name?: string | null;
  token: string;
}) {
  const greeting = args.name ? `Hi ${args.name},` : "Hi,";
  const subject = "Reset your hagebook password";
  const intro = `${greeting} we received a request to reset your hagebook password.`;
  const ctaHref = `${appUrl}/reset?token=${encodeURIComponent(args.token)}`;
  const body = `<p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#3f3f46;">Click the button below to choose a new password. The link expires in 1 hour and can only be used once.</p>
<p style="margin:0 0 12px;font-size:13px;line-height:1.6;color:#71717a;">If you didn't request this, ignore this email — your password stays the same.</p>`;
  const html = shell(subject, intro, "Reset password", ctaHref, body);
  const text = [
    intro,
    "",
    `Reset: ${ctaHref}`,
    "",
    "Link expires in 1 hour, single-use.",
    "If you didn't request this, ignore this email.",
  ].join("\n");
  return send({ to: args.to, subject, html, text });
}

export async function sendGradeEmail(args: {
  to: string;
  name?: string | null;
  pageTitle: string;
  pageSlug: string;
  status: "PASS" | "FAIL";
  feedback?: string | null;
}) {
  const greeting = args.name ? `Hi ${args.name},` : "Hi,";
  const passed = args.status === "PASS";
  const subject = passed
    ? `Your submission passed: ${args.pageTitle}`
    : `Your submission needs another look: ${args.pageTitle}`;
  const intro = passed
    ? `${greeting} an admin reviewed your submission for "${args.pageTitle}" and marked it PASS.`
    : `${greeting} an admin reviewed your submission for "${args.pageTitle}" and marked it FAIL. Read the feedback, then re-submit when ready.`;
  const ctaHref = `${appUrl}/pages/${encodeURIComponent(args.pageSlug)}`;
  const badgeBg = passed ? "#16a34a" : "#dc2626";
  const badgeLabel = passed ? "PASS" : "FAIL";
  const feedbackBlock = args.feedback?.trim()
    ? `<div style="margin:16px 0;padding:14px 16px;border-left:3px solid ${brand};background:#fafafa;border-radius:4px;">
      <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:0.04em;">Feedback</p>
      <p style="margin:0;font-size:14px;line-height:1.6;color:#3f3f46;white-space:pre-wrap;">${escapeHtml(args.feedback)}</p>
    </div>`
    : "";
  const body = `<div style="margin:0 0 12px;">
  <span style="display:inline-block;padding:4px 10px;border-radius:999px;background:${badgeBg};color:#ffffff;font-size:12px;font-weight:600;letter-spacing:0.04em;">${badgeLabel}</span>
</div>
${feedbackBlock}`;
  const html = shell(subject, intro, "View lesson", ctaHref, body);
  const text = [
    intro,
    "",
    `Status: ${badgeLabel}`,
    args.feedback?.trim() ? `\nFeedback:\n${args.feedback}` : "",
    "",
    `Lesson: ${ctaHref}`,
  ]
    .filter(Boolean)
    .join("\n");
  return send({ to: args.to, subject, html, text });
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendRejectionEmail(args: {
  to: string;
  name?: string | null;
}) {
  const greeting = args.name ? `Hi ${args.name},` : "Hi,";
  const subject = "Update on your hagebook application";
  const intro = `${greeting} thanks for your interest in hagebook. After review, your application was not approved at this time.`;
  const ctaHref = "";
  const body = `<p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#3f3f46;">If you think this was a mistake or want to appeal, reply to this email or contact <a href="mailto:contact@hagegames.com" style="color:#ff005a;">contact@hagegames.com</a>.</p>`;
  const html = shell(subject, intro, "", ctaHref, body);
  const text = [
    intro,
    "",
    "If you think this was a mistake or want to appeal, contact contact@hagegames.com.",
  ].join("\n");
  return send({ to: args.to, subject, html, text });
}

export function renderEmailPreview(template: EmailTemplateName): {
  subject: string;
  html: string;
} {
  const sampleName = "Sample User";
  const sampleSlug = "lesson-01";
  const sampleTitle = "Lesson 1: Hello, Next.js";
  switch (template) {
    case "approval": {
      const subject = "Your hagebook account is approved";
      const intro = `Hi ${sampleName}, good news — an admin has approved your hagebook account.`;
      const html = shell(
        subject,
        intro,
        "Sign in",
        `${appUrl}/login`,
        `<p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#3f3f46;">You can now sign in, read lessons, and submit assignments.</p>`,
      );
      return { subject, html };
    }
    case "rejection": {
      const subject = "Update on your hagebook application";
      const intro = `Hi ${sampleName}, thanks for your interest in hagebook. After review, your application was not approved at this time.`;
      const html = shell(
        subject,
        intro,
        "",
        "",
        `<p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#3f3f46;">If you think this was a mistake or want to appeal, reply to this email or contact <a href="mailto:contact@hagegames.com" style="color:#ff005a;">contact@hagegames.com</a>.</p>`,
      );
      return { subject, html };
    }
    case "reset": {
      const subject = "Reset your hagebook password";
      const intro = `Hi ${sampleName}, we received a request to reset your hagebook password.`;
      const html = shell(
        subject,
        intro,
        "Reset password",
        `${appUrl}/reset?token=PREVIEW`,
        `<p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#3f3f46;">Click the button below to choose a new password. The link expires in 1 hour and can only be used once.</p>`,
      );
      return { subject, html };
    }
    case "grade-pass":
    case "grade-fail": {
      const passed = template === "grade-pass";
      const subject = passed
        ? `Your submission passed: ${sampleTitle}`
        : `Your submission needs another look: ${sampleTitle}`;
      const intro = passed
        ? `Hi ${sampleName}, an admin reviewed your submission for "${sampleTitle}" and marked it PASS.`
        : `Hi ${sampleName}, an admin reviewed your submission for "${sampleTitle}" and marked it FAIL. Read the feedback, then re-submit when ready.`;
      const badgeBg = passed ? "#16a34a" : "#dc2626";
      const badgeLabel = passed ? "PASS" : "FAIL";
      const feedback = passed ? "Nice clean code, ship it." : "Add error handling around the fetch call.";
      const html = shell(
        subject,
        intro,
        "View lesson",
        `${appUrl}/pages/${sampleSlug}`,
        `<div style="margin:0 0 12px;"><span style="display:inline-block;padding:4px 10px;border-radius:999px;background:${badgeBg};color:#ffffff;font-size:12px;font-weight:600;">${badgeLabel}</span></div>
<div style="margin:16px 0;padding:14px 16px;border-left:3px solid ${brand};background:#fafafa;border-radius:4px;">
  <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#71717a;text-transform:uppercase;">Feedback</p>
  <p style="margin:0;font-size:14px;line-height:1.6;color:#3f3f46;">${escapeHtml(feedback)}</p>
</div>`,
      );
      return { subject, html };
    }
  }
}
