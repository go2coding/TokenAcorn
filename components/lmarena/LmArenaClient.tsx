"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";

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

type Translator = (
  key: string,
  params?: Record<string, string | number>
) => string;

const providerColors: Record<string, string> = {
  openai: "#10a37f",
  anthropic: "#c56b45",
  google: "#4285f4",
  deepseek: "#4f46e5",
  alibaba: "#e85d04",
  meta: "#0668e1",
  xai: "#18181b",
  mistral: "#e85d04",
  minimax: "#e05263",
  nvidia: "#5f9400",
  xiaomi: "#f56600",
  "z.ai": "#4f46e5",
  moonshot: "#1f2937",
  bytedance: "#334155",
  microsoft: "#0078d4",
  amazon: "#c66d00",
  baidu: "#2932e1",
  pika: "#db2777",
  klingai: "#7c3aed",
  runway: "#d97706",
  default: "#78716c",
};

const arenaConfig: Record<
  string,
  {
    short: string;
    translationKey: string;
    categoryKey: "llm" | "image" | "video";
    accent: string;
    accentText: string;
    soft: string;
    darkSoft: string;
  }
> = {
  agent: {
    short: "AGT",
    translationKey: "agent",
    categoryKey: "llm",
    accent: "bg-forest-600",
    accentText: "text-forest-700 dark:text-forest-300",
    soft: "bg-forest-50",
    darkSoft: "dark:bg-forest-950/40",
  },
  text: {
    short: "TXT",
    translationKey: "text",
    categoryKey: "llm",
    accent: "bg-acorn-600",
    accentText: "text-acorn-700 dark:text-acorn-300",
    soft: "bg-acorn-50",
    darkSoft: "dark:bg-acorn-950/40",
  },
  code: {
    short: "DEV",
    translationKey: "code",
    categoryKey: "llm",
    accent: "bg-slate-700",
    accentText: "text-slate-700 dark:text-slate-300",
    soft: "bg-slate-100",
    darkSoft: "dark:bg-slate-900/60",
  },
  vision: {
    short: "VIS",
    translationKey: "vision",
    categoryKey: "llm",
    accent: "bg-sky-600",
    accentText: "text-sky-700 dark:text-sky-300",
    soft: "bg-sky-50",
    darkSoft: "dark:bg-sky-950/40",
  },
  document: {
    short: "DOC",
    translationKey: "document",
    categoryKey: "llm",
    accent: "bg-amber-600",
    accentText: "text-amber-700 dark:text-amber-300",
    soft: "bg-amber-50",
    darkSoft: "dark:bg-amber-950/40",
  },
  search: {
    short: "WEB",
    translationKey: "search",
    categoryKey: "llm",
    accent: "bg-cyan-700",
    accentText: "text-cyan-700 dark:text-cyan-300",
    soft: "bg-cyan-50",
    darkSoft: "dark:bg-cyan-950/40",
  },
  "text-to-image": {
    short: "T2I",
    translationKey: "textToImage",
    categoryKey: "image",
    accent: "bg-rose-600",
    accentText: "text-rose-700 dark:text-rose-300",
    soft: "bg-rose-50",
    darkSoft: "dark:bg-rose-950/40",
  },
  "image-edit": {
    short: "EDIT",
    translationKey: "imageEdit",
    categoryKey: "image",
    accent: "bg-orange-600",
    accentText: "text-orange-700 dark:text-orange-300",
    soft: "bg-orange-50",
    darkSoft: "dark:bg-orange-950/40",
  },
  "image-to-code": {
    short: "I2C",
    translationKey: "imageToCode",
    categoryKey: "image",
    accent: "bg-indigo-600",
    accentText: "text-indigo-700 dark:text-indigo-300",
    soft: "bg-indigo-50",
    darkSoft: "dark:bg-indigo-950/40",
  },
  "text-to-video": {
    short: "T2V",
    translationKey: "textToVideo",
    categoryKey: "video",
    accent: "bg-fuchsia-700",
    accentText: "text-fuchsia-700 dark:text-fuchsia-300",
    soft: "bg-fuchsia-50",
    darkSoft: "dark:bg-fuchsia-950/40",
  },
  "image-to-video": {
    short: "I2V",
    translationKey: "imageToVideo",
    categoryKey: "video",
    accent: "bg-violet-700",
    accentText: "text-violet-700 dark:text-violet-300",
    soft: "bg-violet-50",
    darkSoft: "dark:bg-violet-950/40",
  },
  "video-to-video": {
    short: "V2V",
    translationKey: "videoToVideo",
    categoryKey: "video",
    accent: "bg-teal-700",
    accentText: "text-teal-700 dark:text-teal-300",
    soft: "bg-teal-50",
    darkSoft: "dark:bg-teal-950/40",
  },
};

const fallbackArenaConfig = {
  short: "ARENA",
  translationKey: "",
  categoryKey: "llm" as const,
  accent: "bg-neutral-700",
  accentText: "text-neutral-700 dark:text-neutral-300",
  soft: "bg-neutral-100",
  darkSoft: "dark:bg-neutral-800",
};

function getProviderColor(name: string): string {
  return providerColors[name.toLowerCase()] || providerColors.default;
}

function entryMatches(entry: LmArenaEntry, query: string): boolean {
  return (
    entry.modelName.toLowerCase().includes(query) ||
    entry.organization.toLowerCase().includes(query) ||
    Boolean(entry.license?.toLowerCase().includes(query))
  );
}

function formatNumber(value: number | null, locale: string): string {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat(locale).format(value);
}

function formatRating(value: number): string {
  if (Math.abs(value) < 10) return value.toFixed(4);
  return value.toFixed(1);
}

function formatDate(dateStr: string | null, locale: string): string {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function Highlight({
  text,
  query,
}: {
  text: string;
  query: string;
}): ReactNode {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return text;

  const start = text.toLowerCase().indexOf(normalizedQuery);
  if (start < 0) return text;
  const end = start + normalizedQuery.length;

  return (
    <>
      {text.slice(0, start)}
      <mark className="rounded-sm bg-amber-200/80 px-0.5 text-inherit dark:bg-amber-500/30">
        {text.slice(start, end)}
      </mark>
      {text.slice(end)}
    </>
  );
}

function RankBadge({ rank }: { rank: number }) {
  const podiumStyles: Record<number, string> = {
    1: "border-amber-300 bg-gradient-to-br from-amber-200 to-amber-400 text-amber-950 shadow-amber-200/60 dark:border-amber-500 dark:from-amber-400 dark:to-amber-600",
    2: "border-slate-300 bg-gradient-to-br from-slate-100 to-slate-300 text-slate-800 shadow-slate-200/60 dark:border-slate-500 dark:from-slate-300 dark:to-slate-500",
    3: "border-orange-300 bg-gradient-to-br from-orange-200 to-orange-400 text-orange-950 shadow-orange-200/60 dark:border-orange-500 dark:from-orange-400 dark:to-orange-600",
  };

  if (podiumStyles[rank]) {
    return (
      <span
        className={`inline-flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-black shadow-sm ${podiumStyles[rank]}`}
      >
        {rank}
      </span>
    );
  }

  return (
    <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 px-1 text-[11px] font-bold tabular-nums text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
      {rank}
    </span>
  );
}

function ProviderBadge({
  organization,
  query,
}: {
  organization: string;
  query: string;
}) {
  const color = getProviderColor(organization);
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200/80 bg-white px-2.5 py-1 text-xs font-semibold text-neutral-700 shadow-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200">
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      <Highlight text={organization} query={query} />
    </span>
  );
}

function ScoreBar({
  value,
  min,
  max,
  accentClass,
}: {
  value: number;
  min: number;
  max: number;
  accentClass: string;
}) {
  const range = max - min;
  const percentage = range === 0 ? 100 : ((value - min) / range) * 100;
  return (
    <div className="mt-1.5 h-1.5 w-24 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
      <div
        className={`h-full rounded-full ${accentClass}`}
        style={{ width: `${Math.max(8, Math.min(100, percentage))}%` }}
      />
    </div>
  );
}

function LeaderboardCard({
  leaderboard,
  query,
  locale,
  t,
}: {
  leaderboard: LmArenaLeaderboard;
  query: string;
  locale: string;
  t: Translator;
}) {
  const [expanded, setExpanded] = useState(false);
  const config = arenaConfig[leaderboard.key] || fallbackArenaConfig;
  const normalizedQuery = query.trim().toLowerCase();
  const displayTitle = config.translationKey
    ? t(`lmarena.leaderboards.${config.translationKey}`)
    : leaderboard.title;
  const matchingEntries = normalizedQuery
    ? leaderboard.entries.filter((entry) =>
        entryMatches(entry, normalizedQuery)
      )
    : leaderboard.entries;
  const titleMatches =
    leaderboard.title.toLowerCase().includes(normalizedQuery) ||
    leaderboard.key.toLowerCase().includes(normalizedQuery) ||
    displayTitle.toLowerCase().includes(normalizedQuery);
  const relevantEntries =
    normalizedQuery && matchingEntries.length === 0 && titleMatches
      ? leaderboard.entries
      : matchingEntries;
  const displayEntries = expanded
    ? relevantEntries
    : relevantEntries.slice(0, 10);
  const hasMore = relevantEntries.length > 10;
  const topEntry = leaderboard.entries[0];
  const ratings = relevantEntries.map((entry) => entry.rating);
  const minRating = ratings.length ? Math.min(...ratings) : 0;
  const maxRating = ratings.length ? Math.max(...ratings) : 0;

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-[0_18px_55px_-35px_rgba(66,45,29,0.55)] transition-shadow duration-300 hover:shadow-[0_24px_70px_-38px_rgba(66,45,29,0.7)] dark:border-neutral-800 dark:bg-neutral-950">
      <div className={`absolute inset-x-0 top-0 h-1 ${config.accent}`} />

      <header className="relative border-b border-stone-200/70 px-5 pb-4 pt-5 dark:border-neutral-800 sm:px-6">
        <div
          className={`absolute right-0 top-0 h-40 w-40 -translate-y-1/3 translate-x-1/3 rounded-full blur-3xl ${config.soft} ${config.darkSoft}`}
        />
        <div className="relative flex flex-col gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[10px] font-black tracking-wider ${config.soft} ${config.darkSoft} ${config.accentText}`}
            >
              {config.short}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold tracking-tight text-stone-950 dark:text-white sm:text-xl">
                  <Highlight text={displayTitle} query={query} />
                </h2>
              </div>
            
            </div>
          </div>

        </div>
      </header>

      <div
        className={expanded ? "max-h-[38rem] overflow-auto" : undefined}
      >
        <div className="hidden md:block">
          <table className="w-full table-fixed text-left text-sm">
            <caption className="sr-only">
              {displayTitle} - {t("lmarena.tableCaption")}
            </caption>
            <thead
              className={`z-10 border-b border-stone-200/70 bg-stone-50/95 text-[10px] font-bold uppercase tracking-[0.14em] text-stone-500 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/95 dark:text-neutral-400 ${
                expanded ? "sticky top-0" : ""
              }`}
            >
              <tr>
                <th className="w-16 py-3 pl-5 pr-2 font-bold">
                  {t("lmarena.rank")}
                </th>
                <th className="w-[34%] px-2.5 py-3 font-bold">
                  {t("lmarena.model")}
                </th>
                <th className="w-[22%] px-2.5 py-3 font-bold">
                  {t("lmarena.provider")}
                </th>
                <th className="w-[22%] px-2.5 py-3 font-bold">
                  {t("lmarena.rating")}
                </th>
                <th className="py-3 pl-2.5 pr-5 text-right font-bold">
                  {t("lmarena.votes")}
                </th>
              </tr>
            </thead>
            <tbody>
              {displayEntries.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-b border-stone-100 transition-colors last:border-0 hover:bg-acorn-50/45 dark:border-neutral-900 dark:hover:bg-acorn-950/20"
                >
                  <td className="py-3.5 pl-5 pr-2">
                    <RankBadge rank={entry.rank} />
                  </td>
                  <td className="px-2.5 py-3.5">
                    <div className="truncate font-semibold text-stone-900 dark:text-white">
                      <Highlight text={entry.modelName} query={query} />
                    </div>
                    {entry.license && (
                      <div className="mt-1 truncate text-[11px] text-stone-400 dark:text-neutral-500">
                        {entry.license}
                      </div>
                    )}
                  </td>
                  <td className="px-2.5 py-3.5">
                    <ProviderBadge
                      organization={entry.organization}
                      query={query}
                    />
                  </td>
                  <td className="px-2.5 py-3.5">
                    <div className="font-mono text-sm font-bold tabular-nums text-stone-800 dark:text-neutral-100">
                      {formatRating(entry.rating)}
                    </div>
                    <ScoreBar
                      value={entry.rating}
                      min={minRating}
                      max={maxRating}
                      accentClass={config.accent}
                    />
                  </td>
                  <td className="py-3.5 pl-2.5 pr-5 text-right font-mono text-xs font-semibold tabular-nums text-stone-600 dark:text-neutral-300">
                    {formatNumber(entry.votes, locale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-stone-100 md:hidden dark:divide-neutral-800">
          {displayEntries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center gap-3 px-4 py-4 transition-colors hover:bg-acorn-50/45 dark:hover:bg-acorn-950/20"
            >
              <RankBadge rank={entry.rank} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-stone-900 dark:text-white">
                  <Highlight text={entry.modelName} query={query} />
                </div>
                <div className="mt-1.5">
                  <ProviderBadge
                    organization={entry.organization}
                    query={query}
                  />
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="font-mono text-sm font-bold tabular-nums text-stone-900 dark:text-white">
                  {formatRating(entry.rating)}
                </div>
                <div className="mt-1 text-[10px] text-stone-400 dark:text-neutral-500">
                  {formatNumber(entry.votes, locale)} {t("lmarena.votes")}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {hasMore && (
        <div className="border-t border-stone-200/70 bg-stone-50/60 p-3 dark:border-neutral-800 dark:bg-neutral-900/40">
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-stone-600 transition-colors hover:bg-white hover:text-acorn-700 focus:outline-none focus:ring-2 focus:ring-acorn-500/40 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-acorn-300"
          >
            {expanded
              ? t("lmarena.showLess")
              : t("lmarena.showMore", { count: relevantEntries.length })}
            <svg
              className={`h-4 w-4 transition-transform duration-200 ${
                expanded ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      )}
    </article>
  );
}

export default function LmArenaClient({
  leaderboards,
}: LmArenaClientProps) {
  const t = useTranslations();
  const locale = useLocale();
  const [searchQuery, setSearchQuery] = useState("");
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredLeaderboards = useMemo(() => {
    if (!normalizedQuery) return leaderboards;

    return leaderboards.filter(
      (leaderboard) => {
        const config = arenaConfig[leaderboard.key] || fallbackArenaConfig;
        const displayTitle = config.translationKey
          ? t(`lmarena.leaderboards.${config.translationKey}`)
          : leaderboard.title;
        return (
          leaderboard.title.toLowerCase().includes(normalizedQuery) ||
          leaderboard.key.toLowerCase().includes(normalizedQuery) ||
          displayTitle.toLowerCase().includes(normalizedQuery) ||
          leaderboard.entries.some((entry) =>
            entryMatches(entry, normalizedQuery)
          )
        );
      }
    );
  }, [leaderboards, normalizedQuery, t]);

  const latestFetchedAt = useMemo(() => {
    const timestamps = leaderboards
      .map((leaderboard) => leaderboard.fetchedAt)
      .filter((value): value is string => Boolean(value))
      .map((value) => new Date(value).getTime())
      .filter((value) => !Number.isNaN(value));
    if (!timestamps.length) return null;
    return new Date(Math.max(...timestamps)).toISOString();
  }, [leaderboards]);

  const sourceUrl = leaderboards.find(
    (leaderboard) => leaderboard.sourceUrl
  )?.sourceUrl;

  return (
    <main className="relative overflow-hidden bg-white dark:bg-neutral-950">
      <section className="relative isolate border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
        <div
          className="absolute inset-0 -z-20 opacity-30 dark:opacity-15"
          style={{
            backgroundImage:
              "linear-gradient(rgba(115,115,115,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(115,115,115,0.08) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
            maskImage:
              "linear-gradient(to bottom, black 0%, transparent 92%)",
          }}
        />
        <div className="absolute -right-24 top-16 -z-10 h-72 w-72 rounded-full bg-forest-100/55 blur-3xl dark:bg-forest-900/15" />

        <div className="mx-auto max-w-7xl px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-20 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-acorn-200/80 bg-white/75 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-acorn-700 shadow-sm backdrop-blur dark:border-acorn-800 dark:bg-neutral-900/70 dark:text-acorn-300">
              <span className="h-2 w-2 rounded-full bg-forest-500 shadow-[0_0_0_4px_rgba(69,163,73,0.12)]" />
              {t("lmarena.eyebrow")}
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-5xl">
              {t("lmarena.title")}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-neutral-600 dark:text-neutral-400">
              {t("lmarena.description")}
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-stone-500 dark:text-neutral-400">
              {latestFetchedAt && (
                <span className="inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-acorn-500" />
                  {t("lmarena.lastUpdated", {
                    date: formatDate(latestFetchedAt, locale),
                  })}
                </span>
              )}
              {sourceUrl && (
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-bold text-forest-700 transition-colors hover:text-forest-900 dark:text-forest-300 dark:hover:text-forest-200"
                >
                  {t("lmarena.officialSource")}
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M14 5h5m0 0v5m0-5L10 14M5 7v12h12v-5"
                    />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="relative z-10 mx-auto -mt-7 mb-10 max-w-3xl">
          <label htmlFor="lmarena-search" className="sr-only">
            {t("lmarena.search.label")}
          </label>
          <div className="relative rounded-2xl border border-neutral-200 bg-white p-2 shadow-lg shadow-neutral-200/60 dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-black/20">
            <svg
              className="pointer-events-none absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M21 21l-4.8-4.8m2.1-5.2a7.3 7.3 0 11-14.6 0 7.3 7.3 0 0114.6 0z"
              />
            </svg>
            <input
              id="lmarena-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={t("lmarena.search.placeholder")}
              className="h-12 w-full rounded-xl bg-neutral-50 pl-12 pr-12 text-sm font-medium text-neutral-900 outline-none transition-shadow placeholder:font-normal placeholder:text-neutral-400 focus:ring-2 focus:ring-acorn-500/30 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label={t("lmarena.search.clear")}
                className="absolute right-5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-stone-200 hover:text-stone-700 focus:outline-none focus:ring-2 focus:ring-acorn-500/40 dark:hover:bg-neutral-800 dark:hover:text-white"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {filteredLeaderboards.length > 0 ? (
          <div className="grid items-start gap-6 xl:grid-cols-2">
            {filteredLeaderboards.map((leaderboard) => (
              <LeaderboardCard
                key={leaderboard.id}
                leaderboard={leaderboard}
                query={searchQuery}
                locale={locale}
                t={t}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-neutral-300 bg-neutral-50/70 px-6 py-20 text-center dark:border-neutral-700 dark:bg-neutral-900/50">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 text-stone-400 dark:bg-neutral-800 dark:text-neutral-500">
              <svg
                className="h-7 w-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.6}
                  d="M21 21l-4.8-4.8m2.1-5.2a7.3 7.3 0 11-14.6 0 7.3 7.3 0 0114.6 0z"
                />
              </svg>
            </div>
            <h2 className="mt-5 text-lg font-bold text-stone-900 dark:text-white">
              {t("lmarena.noResults")}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-500 dark:text-neutral-400">
              {t("lmarena.noResultsDescription")}
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="mt-5 rounded-xl bg-acorn-600 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-acorn-700 focus:outline-none focus:ring-2 focus:ring-acorn-500/40 focus:ring-offset-2 dark:focus:ring-offset-neutral-950"
            >
              {t("lmarena.search.clear")}
            </button>
          </div>
        )}

        <section className="relative mt-12 overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-900 sm:p-8">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full border-[28px] border-white dark:border-neutral-800/60" />
          <div className="relative grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-acorn-700 dark:text-acorn-300">
                {t("lmarena.methodologyLabel")}
              </div>
              <h2 className="mt-2 text-xl font-black tracking-tight text-stone-950 dark:text-white">
                {t("lmarena.dataSource")}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600 dark:text-neutral-300">
                {t("lmarena.methodologyDescription")}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-950/60">
                <div className="text-xs font-black text-stone-900 dark:text-white">
                  {t("lmarena.rating")}
                </div>
                <p className="mt-1.5 text-xs leading-5 text-stone-500 dark:text-neutral-400">
                  {t("lmarena.ratingDescription")}
                </p>
              </div>
              <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-950/60">
                <div className="text-xs font-black text-stone-900 dark:text-white">
                  {t("lmarena.votes")}
                </div>
                <p className="mt-1.5 text-xs leading-5 text-stone-500 dark:text-neutral-400">
                  {t("lmarena.votesDescription")}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
