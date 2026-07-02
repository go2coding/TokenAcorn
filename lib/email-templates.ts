import prisma from "./db";

export type EmailTemplateKey = "verification" | "notification";

export interface EmailTemplateData {
  key: EmailTemplateKey;
  name: string;
  locale: string;
  subject: string;
  htmlBody: string;
}

export const defaultTemplates: EmailTemplateData[] = [
  {
    key: "verification",
    name: "订阅验证邮件",
    locale: "zh",
    subject: "请验证您在 TokenAcorn 的邮箱订阅",
    htmlBody: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
  <h2 style="color: #007bff;">感谢订阅 TokenAcorn 模型动态</h2>
  <p>请点击下方按钮验证您的邮箱地址，验证成功后，我们将在模型价格、排行榜或新模型发布有重要变化时向您发送通知。</p>
  <a href="{{verifyUrl}}" style="display: inline-block; margin: 16px 0; padding: 12px 24px; background: #007bff; color: #fff; text-decoration: none; border-radius: 6px;">验证邮箱</a>
  <p>如果按钮无法点击，也可以复制以下链接到浏览器打开：</p>
  <p style="word-break: break-all; color: #555;">{{verifyUrl}}</p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
  <p style="font-size: 12px; color: #888;">如果您没有主动订阅，请忽略此邮件，或点击 <a href="{{unsubscribeUrl}}" style="color: #888;">取消订阅</a>。</p>
</div>`,
  },
  {
    key: "verification",
    name: "Subscription Verification",
    locale: "en",
    subject: "Please verify your TokenAcorn email subscription",
    htmlBody: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
  <h2 style="color: #007bff;">Thanks for subscribing to TokenAcorn updates</h2>
  <p>Please click the button below to verify your email address. Once verified, we'll send you notifications when there are important changes to model prices, rankings, or new releases.</p>
  <a href="{{verifyUrl}}" style="display: inline-block; margin: 16px 0; padding: 12px 24px; background: #007bff; color: #fff; text-decoration: none; border-radius: 6px;">Verify Email</a>
  <p>If the button doesn't work, copy and paste this link into your browser:</p>
  <p style="word-break: break-all; color: #555;">{{verifyUrl}}</p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
  <p style="font-size: 12px; color: #888;">If you didn't subscribe, please ignore this email or <a href="{{unsubscribeUrl}}" style="color: #888;">unsubscribe</a>.</p>
</div>`,
  },
  {
    key: "notification",
    name: "通知邮件",
    locale: "zh",
    subject: "TokenAcorn 模型动态",
    htmlBody: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
  {{content}}
  <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
  <p style="font-size: 12px; color: #888;">您收到此邮件是因为已订阅 TokenAcorn 模型动态。<br/>如需取消订阅，请 <a href="{{unsubscribeUrl}}" style="color: #888;">点击此处</a>。</p>
</div>`,
  },
  {
    key: "notification",
    name: "Notification Email",
    locale: "en",
    subject: "TokenAcorn Model Updates",
    htmlBody: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
  {{content}}
  <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
  <p style="font-size: 12px; color: #888;">You're receiving this because you subscribed to TokenAcorn updates.<br/><a href="{{unsubscribeUrl}}" style="color: #888;">Unsubscribe</a> at any time.</p>
</div>`,
  },
];

export async function ensureDefaultTemplates() {
  for (const template of defaultTemplates) {
    await prisma.emailTemplate.upsert({
      where: {
        key_locale: {
          key: template.key,
          locale: template.locale,
        },
      },
      create: template,
      update: {},
    });
  }
}

export async function getTemplate(
  key: EmailTemplateKey,
  locale: string
): Promise<EmailTemplateData | null> {
  await ensureDefaultTemplates();

  const template = await prisma.emailTemplate.findUnique({
    where: { key_locale: { key, locale } },
  });

  if (template) return template as EmailTemplateData;

  // Fallback to default locale
  const fallback = await prisma.emailTemplate.findUnique({
    where: { key_locale: { key, locale: "en" } },
  });
  return fallback ? (fallback as EmailTemplateData) : null;
}

export function renderTemplate(
  template: { subject: string; htmlBody: string },
  variables: Record<string, string>
): { subject: string; html: string } {
  let subject = template.subject;
  let html = template.htmlBody;

  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    subject = subject.replace(regex, value);
    html = html.replace(regex, value);
  }

  return { subject, html };
}
