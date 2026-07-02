import { randomBytes } from "crypto";
import { getTemplate, renderTemplate } from "./email-templates";

const brevoApiKey = process.env.BREVO_API_KEY;
const from = process.env.SMTP_FROM || "noreply@tokenacorn.xyz";
const fromName = process.env.SMTP_FROM_NAME || "TokenAcorn";
const siteUrl = (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export function isEmailConfigured() {
  return Boolean(brevoApiKey);
}

async function sendEmail(to: string, subject: string, html: string) {
  if (!brevoApiKey) {
    throw new Error("BREVO_API_KEY is not configured");
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "accept": "application/json",
      "api-key": brevoApiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: fromName, email: from },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Brevo API error: ${response.status} - ${error}`);
  }

  return response.json();
}

export function generateToken() {
  return randomBytes(32).toString("hex");
}

export function getVerificationUrl(token: string, locale: string) {
  return `${siteUrl}/${locale}/subscribe/verify?token=${encodeURIComponent(token)}`;
}

export function getUnsubscribeUrl(token: string, locale: string) {
  return `${siteUrl}/${locale}/subscribe/unsubscribe?token=${encodeURIComponent(token)}`;
}

export async function sendVerificationEmail(
  to: string,
  token: string,
  locale: string
) {
  const template = await getTemplate("verification", locale);
  if (!template) {
    throw new Error("Verification email template not found");
  }

  const { subject, html } = renderTemplate(template, {
    verifyUrl: getVerificationUrl(token, locale),
    unsubscribeUrl: getUnsubscribeUrl(token, locale),
  });

  await sendEmail(to, subject, html);
}

export async function sendNotificationEmail(
  to: string,
  subject: string,
  html: string,
  unsubscribeToken: string,
  locale: string
) {
  const template = await getTemplate("notification", locale);

  const unsubscribeUrl = unsubscribeToken
    ? getUnsubscribeUrl(unsubscribeToken, locale)
    : "";

  const { html: renderedHtml } = template
    ? renderTemplate(template, {
        content: html,
        unsubscribeUrl,
      })
    : { html };

  await sendEmail(to, subject, renderedHtml);
}
