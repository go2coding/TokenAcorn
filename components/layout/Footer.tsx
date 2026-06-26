"use client";

import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations();

  return (
    <footer className="border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <img src="/logos/tokenacorn.svg" alt="TokenAcorn" className="h-6 w-6" />
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              {t("common.siteName")} - {t("common.tagline")}
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm text-neutral-500 dark:text-neutral-500">
            <span>{t("footer.dataSource", { date: "2026-06-01" })}</span>
            <span>•</span>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neutral-700 dark:hover:text-neutral-300"
            >
              GitHub
            </a>
          </div>
        </div>

        <div className="mt-4 text-center text-sm italic text-neutral-500 dark:text-neutral-400">
          {t("footer.slogan")}
        </div>

        <div className="mt-2 text-center text-xs text-neutral-400 dark:text-neutral-600">
          {t("footer.disclaimer")}
        </div>
      </div>
    </footer>
  );
}
