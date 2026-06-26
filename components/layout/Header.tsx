"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { locales, localeNames, Locale } from "@/i18n/config";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Currency } from "@/lib/currency";

const currencies: { value: Currency; label: string }[] = [
  { value: "USD", label: "$ USD" },
  { value: "CNY", label: "¥ CNY" },
];

export default function Header() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { currency, setCurrency } = useCurrency();

  const switchLocale = (newLocale: Locale) => {
    const segments = pathname.split("/");
    if (locales.includes(segments[1] as Locale)) {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }
    router.push(segments.join("/") || "/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/80 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logos/tokenacorn.svg" alt="TokenAcorn" className="h-8 w-8" />
          <span className="text-xl font-bold text-neutral-900 dark:text-white">
            {t("common.siteName")}
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/"
            className="text-base font-semibold text-neutral-700 hover:text-acorn-600 dark:text-neutral-200 dark:hover:text-acorn-400 transition-colors"
          >
            {t("nav.pricing")}
          </Link>
          <Link
            href="/compare"
            className="text-base font-semibold text-neutral-700 hover:text-acorn-600 dark:text-neutral-200 dark:hover:text-acorn-400 transition-colors"
          >
            {t("nav.compare")}
          </Link>
          <Link
            href="/calculator"
            className="text-base font-semibold text-neutral-700 hover:text-acorn-600 dark:text-neutral-200 dark:hover:text-acorn-400 transition-colors"
          >
            {t("nav.calculator")}
          </Link>
          <Link
            href="/benchmarks"
            className="text-base font-semibold text-neutral-700 hover:text-acorn-600 dark:text-neutral-200 dark:hover:text-acorn-400 transition-colors"
          >
            {t("nav.benchmarks")}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className="rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-sm text-neutral-700 focus:border-acorn-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
          >
            {currencies.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <select
            value={locale}
            onChange={(e) => switchLocale(e.target.value as Locale)}
            className="rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-sm text-neutral-700 focus:border-acorn-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
          >
            {locales.map((loc) => (
              <option key={loc} value={loc}>
                {localeNames[loc]}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
