import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import "../globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { locales, Locale } from "@/i18n/config";
import { CurrencyProvider } from "@/contexts/CurrencyContext";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "TokenAcorn - AI Model Pricing Comparison",
  description:
    "Compare AI model pricing from major providers. Find the best model for your budget. Stop overpaying for AI.",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col bg-white dark:bg-neutral-950">
        <NextIntlClientProvider messages={messages}>
          <CurrencyProvider>
            <Header />
            <main className="flex-1 bg-white dark:bg-neutral-950">
              {children}
            </main>
            <Footer />
          </CurrencyProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
