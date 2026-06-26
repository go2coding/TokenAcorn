"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

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

// 能力维度配置
const categoryConfig: Record<string, { icon: string; translationKey: string }> = {
  reasoning: { icon: "🧠", translationKey: "reasoning" },
  coding: { icon: "💻", translationKey: "coding" },
  math: { icon: "🔢", translationKey: "math" },
  multilingual: { icon: "🌐", translationKey: "multilingual" },
  "long-context": { icon: "📄", translationKey: "longContext" },
  comprehensive: { icon: "📊", translationKey: "comprehensive" },
  general: { icon: "📋", translationKey: "general" },
};

// 厂商颜色映射
const providerColors: Record<string, string> = {
  "OpenAI": "#10a37f",
  "Anthropic": "#d97757",
  "Google": "#4285f4",
  "DeepSeek": "#4f46e5",
  "Alibaba": "#ff6a00",
  "Meta": "#0668e1",
  "xAI": "#1d9bf0",
  "Mistral": "#ff7000",
  "MiniMax": "#ff6b6b",
  "NVIDIA": "#76b900",
  "Xiaomi": "#ff6900",
  "KwaiKAT": "#ff0050",
  "Z AI": "#6366f1",
  "Microsoft": "#00a4ef",
  "Amazon": "#ff9900",
  "Baidu": "#2932e1",
  "default": "#6b7280"
};

// 获取厂商颜色
function getProviderColor(provider: string): string {
  return providerColors[provider] || providerColors.default;
}

// 单个基准测试卡片
function BenchmarkCard({ benchmark, t }: { benchmark: Benchmark; t: any }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // 只显示前 6 条结果，或全部
  const displayResults = isExpanded ? benchmark.results : benchmark.results.slice(0, 6);
  const hasMore = benchmark.results.length > 6;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      {/* 标题区域 */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
          {benchmark.name}
        </h3>
        {benchmark.description && (
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
            {benchmark.description}
          </p>
        )}
      </div>

      {/* 竖直柱状图区域 */}
      <div className="relative">
        {/* 图表主体区域 - 包含Y轴、柱子和网格线 */}
        <div className="relative" style={{ height: "180px" }}>
          {/* Y轴刻度 - 使用百分比刻度 0-100 */}
          <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-[10px] text-neutral-400 dark:text-neutral-500 py-4">
            <span>100</span>
            <span>75</span>
            <span>50</span>
            <span>25</span>
            <span>0</span>
          </div>

          {/* 柱状图和网格线容器 - 高度对应0-100% */}
          <div className="absolute left-9 right-0 top-4 bottom-0">
            {/* 网格线 - 对应 0, 25, 50, 75, 100 */}
            <div className="absolute inset-0 pointer-events-none">
              {[0, 25, 50, 75, 100].map((percent) => (
                <div
                  key={percent}
                  className="absolute left-0 right-0 border-t border-dashed border-neutral-200 dark:border-neutral-700"
                  style={{ bottom: `${percent}%` }}
                />
              ))}
            </div>

            {/* 柱子容器 */}
            <div className="absolute inset-0 flex items-end justify-around gap-2 px-1">
              {displayResults.map((result) => {
                const barHeightPercent = Math.min(result.score, 100);
                const barColor = getProviderColor(result.provider);

                return (
                  <div
                    key={result.id}
                    className="group flex flex-col items-center"
                    style={{ width: "32px", flexShrink: 0, height: "100%" }}
                  >
                    {/* 柱子背景容器 */}
                    <div className="relative w-full flex-1 bg-neutral-100 dark:bg-neutral-800 rounded-t">
                      {/* 实际柱子 - 从底部向上延伸 */}
                      <div
                        className="absolute bottom-0 w-full rounded-t transition-all duration-500 ease-out"
                        style={{
                          height: `${barHeightPercent}%`,
                          backgroundColor: barColor,
                          minHeight: barHeightPercent > 0 ? "2px" : "0"
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* X轴标签 - 在图表下方 */}
        <div className="ml-9 mt-2 flex justify-around gap-2 px-1">
          {displayResults.map((result) => {
            const barColor = getProviderColor(result.provider);
            return (
              <div
                key={`label-${result.id}`}
                className="flex flex-col items-center gap-0.5"
                style={{ width: "32px", flexShrink: 0 }}
              >
                {/* 分数 */}
                <div className="text-[10px] font-bold text-neutral-800 dark:text-neutral-200">
                  {result.score.toFixed(0)}
                </div>
                {/* 模型名称 */}
                <div
                  className="text-[9px] font-medium text-neutral-600 dark:text-neutral-400 text-center line-clamp-2 leading-tight"
                  title={result.modelName}
                >
                  {result.modelName}
                </div>
                {/* 厂商 */}
                <div
                  className="rounded px-1 py-0.5 text-[8px] whitespace-nowrap"
                  style={{
                    backgroundColor: `${barColor}20`,
                    color: barColor
                  }}
                >
                  {result.provider}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 展开/收起按钮 */}
      {hasMore && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4 w-full rounded-lg border border-neutral-200 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
        >
          {isExpanded
            ? t("benchmarks.showLess")
            : t("benchmarks.showMore", { count: benchmark.results.length })}
        </button>
      )}
    </div>
  );
}

export default function BenchmarksClient({ benchmarks }: BenchmarksClientProps) {
  const t = useTranslations();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // 按能力维度分组
  const groupedBenchmarks = useMemo(() => {
    const groups: Record<string, Benchmark[]> = {};
    benchmarks.forEach(b => {
      const category = b.category || "general";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(b);
    });
    return groups;
  }, [benchmarks]);

  // 获取所有可用的能力维度（按排序）
  const availableCategories = useMemo(() => {
    const categoryOrder = ["reasoning", "coding", "math", "multilingual", "long-context", "comprehensive", "general"];
    return categoryOrder.filter(cat => groupedBenchmarks[cat] && groupedBenchmarks[cat].length > 0);
  }, [groupedBenchmarks]);

  // 根据当前选中的分类和搜索词过滤
  const filteredBenchmarks = useMemo(() => {
    let result = benchmarks;

    // 按分类过滤
    if (activeCategory !== "all") {
      result = result.filter(b => (b.category || "general") === activeCategory);
    }

    // 按搜索词过滤
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(b =>
        b.name.toLowerCase().includes(query) ||
        (b.description && b.description.toLowerCase().includes(query)) ||
        b.results.some(r =>
          r.modelName.toLowerCase().includes(query) ||
          r.provider.toLowerCase().includes(query)
        )
      );
    }

    return result;
  }, [benchmarks, activeCategory, searchQuery]);

  // 统计信息
  const stats = useMemo(() => {
    const totalTests = benchmarks.length;
    const totalResults = benchmarks.reduce((sum, b) => sum + b.results.length, 0);
    const providers = new Set(benchmarks.flatMap(b => b.results.map(r => r.provider)));
    return { totalTests, totalResults, providerCount: providers.size };
  }, [benchmarks]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 页面标题 */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white sm:text-4xl">
          {t("benchmarks.title")}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-lg text-neutral-600 dark:text-neutral-400">
          {t("benchmarks.description")}
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 text-center dark:border-neutral-800 dark:bg-neutral-900">
          <div className="text-2xl font-bold text-acorn-500">{stats.totalTests}</div>
          <div className="text-sm text-neutral-500 dark:text-neutral-400">{t("benchmarks.stats.benchmarks")}</div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4 text-center dark:border-neutral-800 dark:bg-neutral-900">
          <div className="text-2xl font-bold text-acorn-500">{stats.totalResults}</div>
          <div className="text-sm text-neutral-500 dark:text-neutral-400">{t("benchmarks.stats.results")}</div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4 text-center dark:border-neutral-800 dark:bg-neutral-900">
          <div className="text-2xl font-bold text-acorn-500">{stats.providerCount}</div>
          <div className="text-sm text-neutral-500 dark:text-neutral-400">{t("benchmarks.stats.providers")}</div>
        </div>
      </div>

      {/* 能力维度标签页 - 自动换行布局 */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory("all")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              activeCategory === "all"
                ? "bg-acorn-500 text-white"
                : "bg-white text-neutral-700 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            }`}
          >
            <span>📊</span>
            <span>{t("benchmarks.categories.all")}</span>
            <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-xs">
              {benchmarks.length}
            </span>
          </button>
          {availableCategories.map((category) => {
            const config = categoryConfig[category] || categoryConfig.general;
            const count = groupedBenchmarks[category]?.length || 0;
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
                <span>{t(`benchmarks.categories.${config.translationKey}`)}</span>
                <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-xs">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 当前分类描述 */}
      {activeCategory !== "all" && (
        <div className="mb-6 rounded-lg border border-acorn-100 bg-acorn-50/50 p-4 dark:border-acorn-900/30 dark:bg-acorn-900/10">
          <div className="flex items-center gap-2 text-acorn-700 dark:text-acorn-300">
            <span className="text-lg">{(categoryConfig[activeCategory] || categoryConfig.general).icon}</span>
            <span className="font-medium">{t(`benchmarks.categoryDescriptions.${(categoryConfig[activeCategory] || categoryConfig.general).translationKey}`)}</span>
          </div>
        </div>
      )}

      {/* 搜索框 */}
      <div className="mb-8">
        <div className="relative mx-auto max-w-xl">
          <input
            type="text"
            placeholder={t("benchmarks.search.placeholder")}
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

      {/* 厂商颜色图例 */}
      <div className="mb-8 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <h3 className="mb-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
          {t("benchmarks.legend")}
        </h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(providerColors)
            .filter(([name]) => name !== "default")
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([name, color]) => (
              <div
                key={name}
                className="flex items-center gap-1.5 rounded-lg border border-neutral-100 bg-neutral-50 px-2 py-1 dark:border-neutral-700 dark:bg-neutral-800"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-neutral-600 dark:text-neutral-400">
                  {name}
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* 基准测试卡片网格 */}
      {filteredBenchmarks.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {filteredBenchmarks.map((benchmark) => (
            <BenchmarkCard key={benchmark.id} benchmark={benchmark} t={t} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <div className="mb-4 text-6xl">🔍</div>
          <h3 className="text-lg font-medium text-neutral-900 dark:text-white">
            {t("common.noResults")}
          </h3>
          <p className="mt-2 text-neutral-500 dark:text-neutral-400">
            {t("common.tryDifferentSearch")}
          </p>
        </div>
      )}

      {/* 数据来源说明 */}
      <div className="mt-12 rounded-xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-900/50">
        <h3 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-white">
          {t("benchmarks.dataSource")}
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {t("benchmarks.description")}
        </p>
      </div>
    </div>
  );
}
