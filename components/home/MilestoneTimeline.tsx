"use client";

import { useTranslations } from "next-intl";
import ProviderLogo from "@/components/ui/ProviderLogo";
import type { MilestoneModel } from "@/lib/data";

interface MilestoneTimelineProps {
  models: MilestoneModel[];
}

type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

function formatRelativeDate(dateStr: string, t: TranslateFn): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return t("home.milestone.today");
  if (diffDays === 1) return t("home.milestone.yesterday");
  if (diffDays < 7) return t("home.milestone.daysAgo", { days: diffDays });
  // 超过7天显示具体日期 MM-DD
  return dateStr.slice(5, 10);
}

export default function MilestoneTimeline({ models }: MilestoneTimelineProps) {
  const t = useTranslations();

  if (models.length === 0) return null;

  return (
    <section className="mb-12">


      <div className="relative">
        {/* Timeline cards */}
        <div className="flex justify-between gap-4 overflow-x-auto pb-4 pt-3">
          {models.map((model, index) => (
            <div
              key={model.id}
              className="relative flex min-w-[140px] flex-1 flex-col items-center"
            >
              {/* Card */}
              <div className="relative mb-4 w-full rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800">
                {/* NEW badge for the first one */}
                {index === 0 && (
                  <span className="absolute -top-2.5 right-2 rounded-full bg-acorn-500 px-2 py-0.5 text-xs font-medium text-white shadow-sm">
                    NEW
                  </span>
                )}

                {/* Provider logo */}
                <div className="mb-3 flex justify-center">
                  <ProviderLogo provider={model.providerId} size={36} />
                </div>

                {/* Model name */}
                <h3 className="mb-1 text-center text-sm font-semibold text-neutral-900 dark:text-white line-clamp-2">
                  {model.name}
                </h3>

                {/* Provider name */}
                <p className="text-center text-xs text-neutral-500 dark:text-neutral-400">
                  {model.providerName}
                </p>
              </div>

              {/* Timeline dot with line through center */}
              <div className="relative flex items-center justify-center">
                <div className={`relative z-10 h-3 w-3 rounded-full ${
                  index === 0
                    ? "bg-acorn-500 ring-4 ring-acorn-100 dark:ring-acorn-900"
                    : "bg-neutral-300 dark:bg-neutral-600"
                }`} />
              </div>

              {/* Release date below dot */}
              <p className="mt-2 text-center text-xs font-medium text-neutral-600 dark:text-neutral-400">
                {formatRelativeDate(model.releaseDate, t)}
              </p>
            </div>
          ))}
        </div>

        {/* Timeline line - positioned to go through dot centers */}
        <div className="absolute bottom-[45px] left-[70px] right-[70px] h-0.5 bg-neutral-200 dark:bg-neutral-700" />
      </div>
    </section>
  );
}
