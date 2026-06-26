"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

interface NewsItem {
  id: string;
  title: string;
  content: string;
  source: string | null;
  publishedAt: string;
}

interface NewsClientProps {
  news: NewsItem[];
}

const providerColors: Record<string, string> = {
  "Claude": "#d97757",
  "Anthropic": "#d97757",
  "GPT": "#10a37f",
  "OpenAI": "#10a37f",
  "Gemini": "#4285f4",
  "Google": "#4285f4",
  "DeepSeek": "#4f46e5",
  "Mistral": "#ff7000",
  "Meta": "#0668e1",
  "Llama": "#0668e1",
  "default": "#6b7280",
};

function getNewsColor(title: string): string {
  for (const [keyword, color] of Object.entries(providerColors)) {
    if (keyword !== "default" && title.toLowerCase().includes(keyword.toLowerCase())) {
      return color;
    }
  }
  return providerColors.default;
}

function formatRelativeTime(dateStr: string, t: (key: string, params?: Record<string, string | number>) => string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffTime / (1000 * 60));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return t("news.time.justNow");
  if (diffMinutes < 60) return t("news.time.minutesAgo", { minutes: diffMinutes });
  if (diffHours < 24) return t("news.time.hoursAgo", { hours: diffHours });
  if (diffDays === 1) return t("news.time.yesterday");
  if (diffDays < 7) return t("news.time.daysAgo", { days: diffDays });
  if (diffDays < 30) return t("news.time.weeksAgo", { weeks: Math.floor(diffDays / 7) });
  return date.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
}

function formatFullDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function NewsCard({ item, t, isFirst }: { item: NewsItem; t: any; isFirst: boolean }) {
  const accentColor = getNewsColor(item.title);

  return (
    <div className="group relative">
      {/* Timeline connector */}
      <div className="absolute left-6 top-0 bottom-0 w-px bg-neutral-200 dark:bg-neutral-700 group-last:hidden" />

      {/* Timeline dot */}
      <div
        className="absolute left-4 top-6 h-4 w-4 rounded-full border-2 border-white dark:border-neutral-900 z-10"
        style={{ backgroundColor: accentColor }}
      />
      {isFirst && (
        <div
          className="absolute left-3 top-5 h-6 w-6 rounded-full animate-ping opacity-20"
          style={{ backgroundColor: accentColor }}
        />
      )}

      {/* Card content */}
      <div className="ml-12 pb-8">
        <div
          className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
        >
          {/* Header with time badge */}
          <div className="mb-3 flex items-start justify-between gap-4">
            <div className="flex items-center gap-2">
              {isFirst && (
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
                  style={{ backgroundColor: accentColor }}
                >
                  {t("news.latest")}
                </span>
              )}
              <span
                className="text-xs font-medium"
                style={{ color: accentColor }}
                title={formatFullDate(item.publishedAt)}
              >
                {formatRelativeTime(item.publishedAt, t)}
              </span>
            </div>
            {item.source && (
              <a
                href={item.source}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 rounded-lg border border-neutral-200 px-2.5 py-1 text-xs text-neutral-500 transition-colors hover:border-neutral-300 hover:text-neutral-700 dark:border-neutral-700 dark:hover:border-neutral-600 dark:hover:text-neutral-300"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                {t("news.viewSource")}
              </a>
            )}
          </div>

          {/* Title */}
          <h3 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-white">
            {item.title}
          </h3>

          {/* Content */}
          <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            {item.content}
          </p>

          {/* Footer */}
          <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3 dark:border-neutral-800">
            <span className="text-xs text-neutral-400 dark:text-neutral-500">
              {formatFullDate(item.publishedAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewsClient({ news }: NewsClientProps) {
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNews = useMemo(() => {
    if (!searchQuery.trim()) return news;
    const query = searchQuery.toLowerCase();
    return news.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.content.toLowerCase().includes(query)
    );
  }, [news, searchQuery]);

  const stats = useMemo(() => {
    const providers = new Set<string>();
    const keywords = ["Claude", "GPT", "Gemini", "DeepSeek", "Mistral", "Llama", "OpenAI", "Anthropic", "Google", "Meta"];
    news.forEach((item) => {
      keywords.forEach((kw) => {
        if (item.title.includes(kw) || item.content.includes(kw)) {
          providers.add(kw);
        }
      });
    });
    return {
      totalNews: news.length,
      providersCount: providers.size,
      thisWeek: news.filter((n) => {
        const diff = Date.now() - new Date(n.publishedAt).getTime();
        return diff < 7 * 24 * 60 * 60 * 1000;
      }).length,
    };
  }, [news]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="mb-10 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-acorn-50 px-4 py-1.5 text-sm font-medium text-acorn-600 dark:bg-acorn-900/30 dark:text-acorn-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-acorn-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-acorn-500"></span>
          </span>
          {t("news.liveUpdates")}
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white sm:text-4xl">
          {t("news.title")}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-lg text-neutral-600 dark:text-neutral-400">
          {t("news.description")}
        </p>
      </div>


      {/* News Timeline */}
      {filteredNews.length > 0 ? (
        <div className="relative">
          {filteredNews.map((item, index) => (
            <NewsCard key={item.id} item={item} t={t} isFirst={index === 0} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <div className="mb-4 text-6xl">📭</div>
          <h3 className="text-lg font-medium text-neutral-900 dark:text-white">
            {t("news.empty")}
          </h3>
          <p className="mt-2 text-neutral-500 dark:text-neutral-400">
            {t("news.emptyDescription")}
          </p>
        </div>
      )}

      {/* Footer note */}
      <div className="mt-12 rounded-xl border border-neutral-200 bg-neutral-50 p-6 text-center dark:border-neutral-800 dark:bg-neutral-900/50">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {t("news.footerNote")}
        </p>
      </div>
    </div>
  );
}
