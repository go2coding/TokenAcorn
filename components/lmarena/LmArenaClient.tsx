"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

interface LmArenaEntry {
  id: string;
  rank: number;
  modelKey: string | null;
  modelName: string;
  rating: number;
  votes: number;
  organization: string;
  license: string | null;
  inputPrice: number | null;
  outputPrice: number | null;
  contextLength: number | null;
}

interface LmArenaLeaderboard {
  id: string;
  key: string;
  title: string;
  description: string | null;
  category: string;
  sourceUrl: string | null;
  fetchedAt: string | null;
  entries: LmArenaEntry[];
}

interface LmArenaClientProps {
  leaderboards: LmArenaLeaderboard[];
}

const providerColors: Record<string, string> = {
  openai: "#10a37f",
  anthropic: "#d97757",
  google: "#4285f4",
  deepseek: "#4f46e5",
  alibaba: "#ff6a00",
  meta: "#0668e1",
  xai: "#1d9bf0",
  mistral: "#ff7000",
  minimax: "#ff6b6b",
  nvidia: "#76b900",
  xiaomi: "#ff6900",
  "z.ai": "#6366f1",
  moonshot: "#1f2937",
  bytedance: "#3c3c3c",
  microsoft: "#00a4ef",
  amazon: "#ff9900",
  baidu: "#2932e1",
  pika: "#ec4899",
  klingai: "#8b5cf6",
  runway: "#f59e0b",
  default: "#6b7280",
};

function getProviderColor(name: string): string {
  return providerColors[name.toLowerCase()] || providerColors.default;
}

const categoryConfig: Record<
  string,
  { icon: string; translationKey: string; colorClass: string }
> = {
  all: { icon: "📊", translationKey: "all", colorClass: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300" },
  llm: { icon: "🤖", translationKey: "llm", colorClass: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  image: { icon: "🎨", translationKey: "image", colorClass: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" },
  video: { icon: "🎬", translationKey: "video", colorClass: "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300" },
};

function formatNumber(n: number | null): string {
  if (n === null || n === undefined) return "-";
  return n.toLocaleString("en-US");
}

function formatPrice(n: number | null): string {
  if (n === null || n === undefined) return "-";
  return `$${n}`;
}

function formatRating(n: number): string {
  if (Math.abs(n) < 10) return n.toFixed(4);
  return n.toFixed(1);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function LeaderboardCard({
  leaderboard,
  t,
}: {
  leaderboard: LmArenaLeaderboard;
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  const [expanded, setExpanded] = useState(false);
  const displayEntries = expanded
    ? leaderboard.entries
    : leaderboard.entries.slice(0, 10);
  const hasMore = leaderboard.entries.length > 10;
  const categoryConfigItem = categoryConfig[leaderboard.category] || categoryConfig.llm;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              {leaderboard.title}
            </h3>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${categoryConfigItem.colorClass}`}
            >
              {t(`lmarena.categories.${categoryConfigItem.translationKey}`)}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
            {leaderboard.sourceUrl && (
              <a
                href={leaderboard.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-acorn-600 hover:underline dark:text-acorn-400"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                {t("lmarena.source")}
              </a>
            )}
            <span>
              {t("lmarena.fetchedAt")}: {formatDate(leaderboard.fetchedAt)}
            </span>
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 dark:bg-neutral-800">
              {leaderboard.entries.length} {t("lmarena.stats.entries")}
            </span>
          </div>
        </div>
      </div>

      {/* Entries table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-xs text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
              <th className="py-2 pr-3 font-medium">{t("lmarena.rank")}</th>
              <th className="py-2 pr-3 font-medium">{t("lmarena.model")}</th>
              <th className="py-2 pr-3 font-medium">{t("lmarena.provider")}</th>
              <th className="py-2 pr-3 font-medium">{t("lmarena.rating")}</th>
              <th className="py-2 pr-3 font-medium">{t("lmarena.votes")}</th>
              <th className="py-2 pr-3 font-medium">{t("lmarena.inputPrice")}</th>
              <th className="py-2 pr-3 font-medium">{t("lmarena.outputPrice")}</th>
              <th className="py-2 pr-3 font-medium">{t("lmarena.context")}</th>
            </tr>
          </thead>
          <tbody>
            {displayEntries.map((entry) => {
              const color = getProviderColor(entry.organization);
              return (
                <tr
                  key={entry.id}
                  className="border-b border-neutral-100 last:border-b-0 dark:border-neutral-800"
                >
                  <td className="py-2 pr-3 font-semibold text-neutral-700 dark:text-neutral-300">
                    #{entry.rank}
                  </td>
                  <td className="py-2 pr-3 font-medium text-neutral-900 dark:text-white">
                    {entry.modelName}
                  </td>
                  <td className="py-2 pr-3">
                    <span
                      className="rounded px-1.5 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor: `${color}20`,
                        color,
                      }}
                    >
                      {entry.organization}
                    </span>
                  </td>
                  <td className="py-2 pr-3 font-medium text-neutral-800 dark:text-neutral-200">
                    {formatRating(entry.rating)}
                  </td>
                  <td className="py-2 pr-3 text-neutral-600 dark:text-neutral-400">
                    {formatNumber(entry.votes)}
                  </td>
                  <td className="py-2 pr-3 text-neutral-600 dark:text-neutral-400">
                    {formatPrice(entry.inputPrice)}
                  </td>
                  <td className="py-2 pr-3 text-neutral-600 dark:text-neutral-400">
                    {formatPrice(entry.outputPrice)}
                  </td>
                  <td className="py-2 pr-3 text-neutral-600 dark:text-neutral-400">
                    {formatNumber(entry.contextLength)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 w-full rounded-lg border border-neutral-200 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
        >
          {expanded
            ? t("lmarena.showLess")
            : t("lmarena.showMore", { count: leaderboard.entries.length })}
        </button>
      )}
    </div>
  );
}

export default function LmArenaClient({ leaderboards }: LmArenaClientProps) {
  const t = useTranslations();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const availableCategories = useMemo(() => {
    const order = ["all", "llm", "image", "video"];
    return order.filter((key) => key === "all" || leaderboards.some((lb) => lb.category === key));
  }, [leaderboards]);

  const filteredLeaderboards = useMemo(() => {
    let result = leaderboards;

    if (activeCategory !== "all") {
      result = result.filter((lb) => lb.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (lb) =>
          lb.title.toLowerCase().includes(query) ||
          lb.key.toLowerCase().includes(query) ||
          lb.entries.some(
            (e) =>
              e.modelName.toLowerCase().includes(query) ||
              e.organization.toLowerCase().includes(query) ||
              (e.license && e.license.toLowerCase().includes(query))
          )
      );
    }

    return result;
  }, [leaderboards, activeCategory, searchQuery]);

  const stats = useMemo(() => {
    const totalEntries = leaderboards.reduce((sum, lb) => sum + lb.entries.length, 0);
    const providers = new Set(leaderboards.flatMap((lb) => lb.entries.map((e) => e.organization)));
    return {
      totalLeaderboards: leaderboards.length,
      totalEntries,
      providerCount: providers.size,
    };
  }, [leaderboards]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="mb-10 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-acorn-50 px-4 py-1.5 text-sm font-medium text-acorn-600 dark:bg-acorn-900/30 dark:text-acorn-400">
          <span>🏆</span>
          LMSYS Chatbot Arena
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white sm:text-4xl">
          {t("lmarena.title")}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-lg text-neutral-600 dark:text-neutral-400">
          {t("lmarena.description")}
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 text-center dark:border-neutral-800 dark:bg-neutral-900">
          <div className="text-2xl font-bold text-acorn-500">{stats.totalLeaderboards}</div>
          <div className="text-sm text-neutral-500 dark:text-neutral-400">{t("lmarena.stats.leaderboards")}</div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4 text-center dark:border-neutral-800 dark:bg-neutral-900">
          <div className="text-2xl font-bold text-acorn-500">{stats.totalEntries}</div>
          <div className="text-sm text-neutral-500 dark:text-neutral-400">{t("lmarena.stats.entries")}</div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4 text-center dark:border-neutral-800 dark:bg-neutral-900">
          <div className="text-2xl font-bold text-acorn-500">{stats.providerCount}</div>
          <div className="text-sm text-neutral-500 dark:text-neutral-400">{t("lmarena.stats.providers")}</div>
        </div>
      </div>

      {/* Category filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {availableCategories.map((category) => {
            const config = categoryConfig[category] || categoryConfig.all;
            const count =
              category === "all"
                ? leaderboards.length
                : leaderboards.filter((lb) => lb.category === category).length;
            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                  activeCategory === category
                    ? "bg-acorn-500 text-white"
                    : "bg-white text-neutral-700 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                }`}
              >
                <span>{config.icon}</span>
                <span>{t(`lmarena.categories.${config.translationKey}`)}</span>
                <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-xs">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative mx-auto max-w-xl">
          <input
            type="text"
            placeholder={t("lmarena.search.placeholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-white py-3 pl-11 pr-4 text-sm text-neutral-900 placeholder-neutral-400 focus:border-acorn-500 focus:outline-none focus:ring-2 focus:ring-acorn-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder-neutral-500"
          />
          <svg
            className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Leaderboard grid */}
      {filteredLeaderboards.length > 0 ? (
        <div className="grid gap-6">
          {filteredLeaderboards.map((leaderboard) => (
            <LeaderboardCard key={leaderboard.id} leaderboard={leaderboard} t={t} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <div className="mb-4 text-6xl">🔍</div>
          <h3 className="text-lg font-medium text-neutral-900 dark:text-white">
            {t("lmarena.noResults")}
          </h3>
          <p className="mt-2 text-neutral-500 dark:text-neutral-400">
            {t("lmarena.noResultsDescription")}
          </p>
        </div>
      )}

      {/* Footer note */}
      <div className="mt-12 rounded-xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-900/50">
        <h3 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-white">
          {t("lmarena.dataSource")}
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {t("lmarena.description")}
        </p>
      </div>
    </div>
  );
}
