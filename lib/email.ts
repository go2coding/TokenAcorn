import nodemailer from "nodemailer";
import { randomBytes } from "crypto";
import { getTemplate, renderTemplate } from "./email-templates";

const host = process.env.SMTP_HOST;
const port = parseInt(process.env.SMTP_PORT || "587", 10);
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.SMTP_FROM || user || "noreply@tokenacorn.xyz";
const siteUrl = (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export function isEmailConfigured() {
  return Boolean(host && user && pass);
}

function createTransporter() {
  if (!host || !user || !pass) {
    throw new Error("Email SMTP credentials are not configured");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
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

  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"TokenAcorn" <${from}>`,
    to,
    subject,
    html,
  });
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

  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"TokenAcorn" <${from}>`,
    to,
    subject,
    html: renderedHtml,
  });
}
