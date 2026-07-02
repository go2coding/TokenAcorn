import prisma from "./db";
import { sendNotificationEmail, isEmailConfigured } from "./email";

export async function notifySubscribers(
  getContent: (locale: string) => { subject: string; html: string }
) {
  if (!isEmailConfigured()) {
    console.warn("Email service not configured, skipping notification");
    return { sent: 0, skipped: true };
  }

  const subscribers = await prisma.emailSubscriber.findMany({
    where: { verified: true },
  });

  const byLocale = new Map<string, typeof subscribers>();
  for (const subscriber of subscribers) {
    const locale = subscriber.locale || "en";
    if (!byLocale.has(locale)) {
      byLocale.set(locale, []);
    }
    byLocale.get(locale)!.push(subscriber);
  }

  let sent = 0;
  for (const [locale, group] of byLocale.entries()) {
    const { subject, html } = getContent(locale);
    for (const subscriber of group) {
      try {
        await sendNotificationEmail(
          subscriber.email,
          subject,
          html,
          subscriber.unsubscribeToken,
          locale
        );
        sent++;
      } catch (error) {
        console.error(
          `Failed to send notification to ${subscriber.email}:`,
          error
        );
      }
    }
  }

  return { sent, skipped: false };
}

export function buildPriceChangeHtml(
  modelName: string,
  changes: { pricingType: string; tier: string; oldPrice?: number | null; newPrice: number }[],
  locale: string
): string {
  const isZh = locale === "zh";
  const title = isZh
    ? `模型 "${modelName}" 的价格已更新`
    : `Price updated for model "${modelName}"`;

  const rows = changes
    .map((c) => {
      const oldPrice =
        c.oldPrice != null ? c.oldPrice.toFixed(4) : isZh ? "无" : "N/A";
      const newPrice = c.newPrice.toFixed(4);
      return `<tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${c.pricingType}${c.tier !== "standard" ? ` (${c.tier})` : ""}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${oldPrice}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${newPrice}</td>
      </tr>`;
    })
    .join("");

  const siteUrl = (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");

  return `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
    <h2 style="color: #007bff;">${title}</h2>
    <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
      <thead>
        <tr style="background: #f5f5f5;">
          <th style="padding: 8px; text-align: left;">${isZh ? "计费项" : "Pricing Type"}</th>
          <th style="padding: 8px; text-align: left;">${isZh ? "原价格" : "Old Price"}</th>
          <th style="padding: 8px; text-align: left;">${isZh ? "新价格" : "New Price"}</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="margin-top: 16px;">${isZh ? "前往 TokenAcorn 查看最新价格：" : "Visit TokenAcorn for the latest pricing:"} <a href="${siteUrl}" style="color: #007bff;">TokenAcorn</a></p>
  </div>`;
}

export function buildNewsHtml(
  title: string,
  content: string,
  locale: string
): string {
  const isZh = locale === "zh";
  const siteUrl = (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  return `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
    <h2 style="color: #007bff;">${title}</h2>
    <p>${content.replace(/\n/g, "<br/>")}</p>
    <p style="margin-top: 16px;"><a href="${siteUrl}/news" style="color: #007bff;">${isZh ? "查看全部快讯" : "View all news"}</a></p>
  </div>`;
}

export function buildLmArenaHtml(
  leaderboardTitle: string,
  locale: string
): string {
  const isZh = locale === "zh";
  const siteUrl = (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  return `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
    <h2 style="color: #007bff;">${isZh ? "LM Arena 排行榜已更新" : "LM Arena leaderboard updated"}</h2>
    <p>${isZh ? `排行榜 "${leaderboardTitle}" 已更新，查看最新排名：` : `The leaderboard "${leaderboardTitle}" has been updated. View the latest rankings:`}</p>
    <p><a href="${siteUrl}/lmarena" style="color: #007bff;">${isZh ? "查看排行榜" : "View Leaderboard"}</a></p>
  </div>`;
}

export function buildModelReleaseHtml(
  modelName: string,
  providerName: string,
  locale: string
): string {
  const isZh = locale === "zh";
  const siteUrl = (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  return `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
    <h2 style="color: #007bff;">${isZh ? "新模型发布" : "New model released"}</h2>
    <p>${isZh ? `厂商 ${providerName} 发布了新模型 <strong>${modelName}</strong>，前往查看详情：` : `Provider ${providerName} released a new model <strong>${modelName}</strong>. View details:`}</p>
    <p><a href="${siteUrl}" style="color: #007bff;">TokenAcorn</a></p>
  </div>`;
}
