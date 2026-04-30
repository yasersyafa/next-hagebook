import "server-only";
import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const fromAddress = process.env.EMAIL_FROM ?? "hagebook <onboarding@resend.dev>";
const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
const brand = "#ff005a";

const resend = apiKey ? new Resend(apiKey) : null;

type SendArgs = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

async function send({ to, subject, html, text }: SendArgs) {
  if (!resend) {
    console.warn(
      `[email] RESEND_API_KEY missing. Would send to ${to}: ${subject}\n--- text ---\n${text}`,
    );
    return { ok: true as const, skipped: true };
  }
  try {
    const result = await resend.emails.send({
      from: fromAddress,
      to,
      subject,
      html,
      text,
    });
    if (result.error) {
      console.error("[email] send failed:", result.error);
      return { ok: false as const, error: result.error.message };
    }
    return { ok: true as const, id: result.data?.id };
  } catch (err) {
    console.error("[email] threw:", err);
    return { ok: false as const, error: "Email send failed" };
  }
}

function shell(title: string, intro: string, ctaLabel: string, ctaHref: string, body: string) {
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

export async function sendApprovalEmail(args: { to: string; name?: string | null }) {
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

export async function sendRejectionEmail(args: { to: string; name?: string | null }) {
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
