"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";

interface BenchmarkResult {
  id: string;
  modelName: string;
  provider: string;
  score: number;
  rank: number;
}

interface Benchmark {
  id: string;
  name: string;
  description: string | null;
  category: string;
  sortOrder: number;
  results: BenchmarkResult[];
}

interface BenchmarksClientProps {
  benchmarks: Benchmark[];
}

type Translator = (
  key: string,
  params?: Record<string, string | number>
) => string;

const categoryConfig: Record<
  string,
  {
    short: string;
    translationKey: string;
    accent: string;
    accentText: string;
    soft: string;
    darkSoft: string;
  }
> = {
  reasoning: {
    short: "REA",
    translationKey: "reasoning",
    accent: "bg-forest-600",
    accentText: "text-forest-700 dark:text-forest-300",
    soft: "bg-forest-50",
    darkSoft: "dark:bg-forest-950/40",
  },
  coding: {
    short: "DEV",
    translationKey: "coding",
    accent: "bg-slate-700",
    accentText: "text-slate-700 dark:text-slate-300",
    soft: "bg-slate-100",
    darkSoft: "dark:bg-slate-900/60",
  },
  math: {
    short: "MATH",
    translationKey: "math",
    accent: "bg-acorn-600",
    accentText: "text-acorn-700 dark:text-acorn-300",
    soft: "bg-acorn-50",
    darkSoft: "dark:bg-acorn-950/40",
  },
  multilingual: {
    short: "LANG",
    translationKey: "multilingual",
    accent: "bg-sky-600",
    accentText: "text-sky-700 dark:text-sky-300",
    soft: "bg-sky-50",
    darkSoft: "dark:bg-sky-950/40",
  },
  "long-context": {
    short: "LONG",
    translationKey: "longContext",
    accent: "bg-amber-600",
    accentText: "text-amber-700 dark:text-amber-300",
    soft: "bg-amber-50",
    darkSoft: "dark:bg-amber-950/40",
  },
  comprehensive: {
    short: "ALL",
    translationKey: "comprehensive",
    accent: "bg-rose-600",
    accentText: "text-rose-700 dark:text-rose-300",
    soft: "bg-rose-50",
    darkSoft: "dark:bg-rose-950/40",
  },
  general: {
    short: "GEN",
    translationKey: "general",
    accent: "bg-neutral-700",
    accentText: "text-neutral-700 dark:text-neutral-300",
    soft: "bg-neutral-100",
    darkSoft: "dark:bg-neutral-800",
  },
};

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
  kwaikat: "#e11d48",
  "z ai": "#4f46e5",
  microsoft: "#0078d4",
  amazon: "#c66d00",
  baidu: "#2932e1",
  default: "#78716c",
};

function getProviderColor(provider: string): string {
  return providerColors[provider.toLowerCase()] || providerColors.default;
}

function resultMatches(result: BenchmarkResult, query: string): boolean {
  return (
    result.modelName.toLowerCase().includes(query) ||
    result.provider.toLowerCase().includes(query)
  );
}

function formatNumber(value: number, locale: string): string {
  return new Intl.NumberFormat(locale).format(value);
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
    1: "border-amber-300 bg-gradient-to-br from-amber-200 to-amber-400 text-amber-950 dark:border-amber-500 dark:from-amber-400 dark:to-amber-600",
    2: "border-slate-300 bg-gradient-to-br from-slate-100 to-slate-300 text-slate-800 dark:border-slate-500 dark:from-slate-300 dark:to-slate-500",
    3: "border-orange-300 bg-gradient-to-br from-orange-200 to-orange-400 text-orange-950 dark:border-orange-500 dark:from-orange-400 dark:to-orange-600",
  };

  return (
    <span
      className={`inline-flex h-7 min-w-7 items-center justify-center rounded-full border px-1 text-[11px] font-black tabular-nums shadow-sm ${
        podiumStyles[rank] ||
        "border-neutral-200 bg-neutral-50 text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
      }`}
    >
      {rank}
    </span>
  );
}

function ProviderBadge({
  provider,
  query = "",
}: {
  provider: string;
  query?: string;
}) {
  const color = getProviderColor(provider);
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      <Highlight text={provider} query={query} />
    </span>
  );
}

function BenchmarkCard({
  benchmark,
  query,
  locale,
  t,
}: {
  benchmark: Benchmark;
  query: string;
  locale: string;
  t: Translator;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = categoryConfig[benchmark.category] || categoryConfig.general;
  const normalizedQuery = query.trim().toLowerCase();
  const matchingResults = normalizedQuery
    ? benchmark.results.filter((result) =>
        resultMatches(result, normalizedQuery)
      )
    : benchmark.results;
  const titleMatches =
    benchmark.name.toLowerCase().includes(normalizedQuery) ||
    Boolean(benchmark.description?.toLowerCase().includes(normalizedQuery));
  const relevantResults =
    normalizedQuery && matchingResults.length === 0 && titleMatches
      ? benchmark.results
      : matchingResults;
  const chartResults = relevantResults.slice(0, 6);
  const topResult = benchmark.results[0];
  const maxScore = Math.max(
    100,
    ...chartResults.map((result) => Math.ceil(result.score / 10) * 10)
  );
  const chartTicks = [1, 0.75, 0.5, 0.25, 0].map((ratio) =>
    Math.round(maxScore * ratio)
  );
  const hasMore = relevantResults.length > 6;

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-[0_18px_55px_-35px_rgba(23,23,23,0.45)] transition-shadow duration-300 hover:shadow-[0_24px_70px_-38px_rgba(23,23,23,0.6)] dark:border-neutral-800 dark:bg-neutral-950">
      <div className={`absolute inset-x-0 top-0 h-1 ${config.accent}`} />

      <header className="relative border-b border-neutral-200 px-5 pb-4 pt-5 dark:border-neutral-800 sm:px-6">
        <div
          className={`absolute right-0 top-0 h-36 w-36 -translate-y-1/3 translate-x-1/3 rounded-full blur-3xl ${config.soft} ${config.darkSoft}`}
        />
        <div className="relative flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[10px] font-black tracking-wider ${config.soft} ${config.darkSoft} ${config.accentText}`}
          >
            {config.short}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-white sm:text-xl">
                <Highlight text={benchmark.name} query={query} />
              </h2>
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${config.soft} ${config.darkSoft} ${config.accentText}`}
              >
                {t(`benchmarks.categories.${config.translationKey}`)}
              </span>
            </div>
            {benchmark.description && (
              <p className="mt-2 line-clamp-2 text-xs leading-5 text-neutral-500 dark:text-neutral-400">
                <Highlight text={benchmark.description} query={query} />
              </p>
            )}
          </div>
        </div>

 
      </header>

      <div className="px-5 py-5 sm:px-6">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-400 dark:text-neutral-500">
            {t("benchmarks.topResults")}
          </div>
          <div className="text-xs text-neutral-400 dark:text-neutral-500">
            {formatNumber(benchmark.results.length, locale)}{" "}
            {t("benchmarks.stats.results")}
          </div>
        </div>

        <div className="relative h-56">
          <div className="absolute bottom-10 left-0 top-0 flex w-8 flex-col justify-between py-1 text-[9px] font-medium tabular-nums text-neutral-400">
            {chartTicks.map((tick) => (
              <span key={tick}>{tick}</span>
            ))}
          </div>

          <div className="absolute bottom-10 left-9 right-0 top-0">
            <div className="pointer-events-none absolute inset-0 flex flex-col justify-between py-1">
              {chartTicks.map((tick) => (
                <div
                  key={tick}
                  className="border-t border-dashed border-neutral-200 dark:border-neutral-800"
                />
              ))}
            </div>

            <div className="absolute inset-0 grid grid-cols-6 items-end gap-2 px-1">
              {chartResults.map((result) => {
                const color = getProviderColor(result.provider);
                const height = Math.max(
                  3,
                  Math.min(100, (result.score / maxScore) * 100)
                );
                return (
                  <div
                    key={result.id}
                    className="group/bar relative flex h-full items-end justify-center"
                  >
                    <div className="relative h-full w-full max-w-10 overflow-hidden rounded-t-lg bg-neutral-100 dark:bg-neutral-800">
                      <div
                        className="absolute inset-x-0 bottom-0 rounded-t-lg transition-[height,filter] duration-500 group-hover/bar:brightness-110"
                        style={{
                          height: `${height}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                    <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-neutral-900 px-2 py-1 text-[10px] font-medium text-white shadow-lg group-hover/bar:block">
                      {result.modelName}: {result.score.toFixed(1)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="absolute bottom-0 left-9 right-0 grid h-9 grid-cols-6 gap-2 px-1">
            {chartResults.map((result) => (
              <div key={`label-${result.id}`} className="min-w-0 text-center">
                <div className="truncate text-[9px] font-semibold text-neutral-700 dark:text-neutral-300">
                  <Highlight text={result.modelName} query={query} />
                </div>
                <div className="mt-0.5 font-mono text-[9px] font-bold tabular-nums text-neutral-400">
                  {result.score.toFixed(0)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="max-h-80 overflow-auto border-t border-neutral-200 dark:border-neutral-800">
          <div className="sticky top-0 grid grid-cols-[2.5rem_1fr_4rem] gap-2 border-b border-neutral-200 bg-neutral-50/95 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-400 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/95 sm:grid-cols-[3rem_1fr_auto_5rem] sm:px-6">
            <span>{t("benchmarks.rankLabel")}</span>
            <span>{t("benchmarks.modelLabel")}</span>
            <span className="hidden sm:block">
              {t("benchmarks.providerLabel")}
            </span>
            <span className="text-right">{t("benchmarks.score")}</span>
          </div>
          <div className="divide-y divide-neutral-100 dark:divide-neutral-900">
            {relevantResults.map((result) => (
              <div
                key={result.id}
                className="grid grid-cols-[2.5rem_1fr_4rem] items-center gap-2 px-4 py-3 transition-colors hover:bg-acorn-50/45 dark:hover:bg-acorn-950/20 sm:grid-cols-[3rem_1fr_auto_5rem] sm:px-6"
              >
                <RankBadge rank={result.rank} />
                <div className="min-w-0 truncate text-sm font-semibold text-neutral-900 dark:text-white">
                  <Highlight text={result.modelName} query={query} />
                </div>
                <span className="hidden sm:inline-flex">
                  <ProviderBadge provider={result.provider} query={query} />
                </span>
                <div className="text-right font-mono text-xs font-bold tabular-nums text-neutral-700 dark:text-neutral-200">
                  {result.score.toFixed(1)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasMore && (
        <div className="border-t border-neutral-200 bg-neutral-50/60 p-3 dark:border-neutral-800 dark:bg-neutral-900/40">
          <button
            type="button"
            onClick={() => setIsExpanded((value) => !value)}
            aria-expanded={isExpanded}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-neutral-600 transition-colors hover:bg-white hover:text-acorn-700 focus:outline-none focus:ring-2 focus:ring-acorn-500/40 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-acorn-300"
          >
            {isExpanded
              ? t("benchmarks.showLess")
              : t("benchmarks.showMore", { count: relevantResults.length })}
            <svg
              className={`h-4 w-4 transition-transform duration-200 ${
                isExpanded ? "rotate-180" : ""
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

export default function BenchmarksClient({
  benchmarks,
}: BenchmarksClientProps) {
  const t = useTranslations();
  const locale = useLocale();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const groupedBenchmarks = useMemo(() => {
    const groups: Record<string, Benchmark[]> = {};
    benchmarks.forEach((benchmark) => {
      const category = benchmark.category || "general";
      groups[category] ||= [];
      groups[category].push(benchmark);
    });
    return groups;
  }, [benchmarks]);

  const availableCategories = useMemo(() => {
    const order = [
      "reasoning",
      "coding",
      "math",
      "multilingual",
      "long-context",
      "comprehensive",
      "general",
    ];
    return order.filter((category) => groupedBenchmarks[category]?.length);
  }, [groupedBenchmarks]);

  const filteredBenchmarks = useMemo(() => {
    let result = benchmarks;

    if (activeCategory !== "all") {
      result = result.filter(
        (benchmark) => (benchmark.category || "general") === activeCategory
      );
    }

    if (normalizedQuery) {
      result = result.filter(
        (benchmark) =>
          benchmark.name.toLowerCase().includes(normalizedQuery) ||
          Boolean(
            benchmark.description?.toLowerCase().includes(normalizedQuery)
          ) ||
          benchmark.results.some((item) =>
            resultMatches(item, normalizedQuery)
          )
      );
    }

    return result;
  }, [benchmarks, activeCategory, normalizedQuery]);

  const stats = useMemo(() => {
    const totalResults = benchmarks.reduce(
      (sum, benchmark) => sum + benchmark.results.length,
      0
    );
    const providers = new Set(
      benchmarks.flatMap((benchmark) =>
        benchmark.results.map((result) => result.provider)
      )
    );
    return {
      totalTests: benchmarks.length,
      totalResults,
      providerCount: providers.size,
    };
  }, [benchmarks]);

  const activeConfig =
    activeCategory === "all"
      ? null
      : categoryConfig[activeCategory] || categoryConfig.general;

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
              {t("benchmarks.eyebrow")}
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-5xl">
              {t("benchmarks.title")}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-neutral-600 dark:text-neutral-400">
              {t("benchmarks.description")}
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="relative z-10 mx-auto -mt-7 max-w-3xl">
          <label htmlFor="benchmark-search" className="sr-only">
            {t("benchmarks.search.label")}
          </label>
          <div className="relative rounded-2xl border border-neutral-200 bg-white p-2 shadow-lg shadow-neutral-200/60 dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-black/20">
            <svg
              className="pointer-events-none absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400"
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
              id="benchmark-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={t("benchmarks.search.placeholder")}
              className="h-12 w-full rounded-xl bg-neutral-50 pl-12 pr-12 text-sm font-medium text-neutral-900 outline-none transition-shadow placeholder:font-normal placeholder:text-neutral-400 focus:ring-2 focus:ring-acorn-500/30 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label={t("benchmarks.search.clear")}
                className="absolute right-5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-200 hover:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-acorn-500/40 dark:hover:bg-neutral-800 dark:hover:text-white"
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


        <section className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50/70 p-3 dark:border-neutral-800 dark:bg-neutral-900/60">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-colors ${
                activeCategory === "all"
                  ? "bg-acorn-600 text-white shadow-sm"
                  : "bg-white text-neutral-600 hover:text-acorn-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:text-acorn-300"
              }`}
            >
              {t("benchmarks.categories.all")}
              <span className="ml-2 opacity-70">{benchmarks.length}</span>
            </button>
            {availableCategories.map((category) => {
              const config =
                categoryConfig[category] || categoryConfig.general;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-colors ${
                    activeCategory === category
                      ? "bg-acorn-600 text-white shadow-sm"
                      : "bg-white text-neutral-600 hover:text-acorn-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:text-acorn-300"
                  }`}
                >
                  <span className="text-[9px] font-black tracking-wider opacity-70">
                    {config.short}
                  </span>
                  {t(`benchmarks.categories.${config.translationKey}`)}
                  <span className="opacity-70">
                    {groupedBenchmarks[category]?.length || 0}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {activeConfig && (
          <div
            className={`mt-4 flex items-center gap-3 rounded-2xl border border-neutral-200 px-4 py-3 dark:border-neutral-800 ${activeConfig.soft} ${activeConfig.darkSoft}`}
          >
            <span
              className={`text-[10px] font-black tracking-wider ${activeConfig.accentText}`}
            >
              {activeConfig.short}
            </span>
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {t(
                `benchmarks.categoryDescriptions.${activeConfig.translationKey}`
              )}
            </span>
          </div>
        )}

        {filteredBenchmarks.length > 0 ? (
          <div className="mt-8 grid items-start gap-6 xl:grid-cols-2">
            {filteredBenchmarks.map((benchmark) => (
              <BenchmarkCard
                key={benchmark.id}
                benchmark={benchmark}
                query={searchQuery}
                locale={locale}
                t={t}
              />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-3xl border border-dashed border-neutral-300 bg-neutral-50/70 px-6 py-20 text-center dark:border-neutral-700 dark:bg-neutral-900/50">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500">
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
            <h2 className="mt-5 text-lg font-bold text-neutral-900 dark:text-white">
              {t("benchmarks.noResults")}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500 dark:text-neutral-400">
              {t("benchmarks.noResultsDescription")}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("all");
              }}
              className="mt-5 rounded-xl bg-acorn-600 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-acorn-700 focus:outline-none focus:ring-2 focus:ring-acorn-500/40 focus:ring-offset-2 dark:focus:ring-offset-neutral-950"
            >
              {t("benchmarks.resetFilters")}
            </button>
          </div>
        )}

        <section className="relative mt-12 overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-900 sm:p-8">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full border-[28px] border-white dark:border-neutral-800/60" />
          <div className="relative">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-acorn-700 dark:text-acorn-300">
              {t("benchmarks.methodologyLabel")}
            </div>
            <h2 className="mt-2 text-xl font-black tracking-tight text-neutral-900 dark:text-white">
              {t("benchmarks.dataSource")}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-neutral-600 dark:text-neutral-300">
              {t("benchmarks.methodologyDescription")}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
