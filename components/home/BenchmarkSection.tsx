"use client";

import { useState } from "react";

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
  sortOrder: number;
  results: BenchmarkResult[];
}

interface BenchmarkSectionProps {
  benchmarks: Benchmark[];
}

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
function BenchmarkCard({ benchmark }: { benchmark: Benchmark }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // 只显示前 4 条结果，或全部
  const displayResults = isExpanded ? benchmark.results : benchmark.results.slice(0, 4);
  const hasMore = benchmark.results.length > 4;

  // 计算最大分数用于柱状图比例
  const maxScore = Math.max(...benchmark.results.map(r => r.score), 100);

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
      {/* 标题区域 */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
          {benchmark.name}
        </h3>
        {benchmark.description && (
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">
            {benchmark.description}
          </p>
        )}
      </div>

      {/* 柱状图区域 */}
      <div className="space-y-3">
        {displayResults.map((result, index) => {
          const barWidth = `${(result.score / maxScore) * 100}%`;
          const barColor = getProviderColor(result.provider);

          return (
            <div key={result.id} className="group">
              {/* 标签行 */}
              <div className="mb-1 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: barColor }}
                  />
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">
                    {result.modelName}
                  </span>
                  <span
                    className="rounded px-1.5 py-0.5 text-xs"
                    style={{
                      backgroundColor: `${barColor}20`,
                      color: barColor
                    }}
                  >
                    {result.provider}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-400 dark:text-neutral-500">
                    #{result.rank}
                  </span>
                  <span className="font-semibold text-neutral-900 dark:text-white">
                    {result.score.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* 柱状图 */}
              <div className="h-2.5 w-full rounded-full bg-neutral-100 dark:bg-neutral-800">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: barWidth,
                    backgroundColor: barColor
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* 展开/收起按钮 */}
      {hasMore && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4 w-full rounded-lg border border-neutral-200 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
        >
          {isExpanded
            ? "收起 ↑"
            : `查看全部 ${benchmark.results.length} 个结果 ↓`
          }
        </button>
      )}
    </div>
  );
}

// 基准测试区块
export default function BenchmarkSection({ benchmarks }: BenchmarkSectionProps) {
  if (!benchmarks || benchmarks.length === 0) {
    return null;
  }

  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* 标题 */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white sm:text-3xl">
            模型性能基准测试
          </h2>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            各大模型在不同测试集上的表现对比
          </p>
        </div>

        {/* 卡片网格 */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benchmarks.map((benchmark) => (
            <BenchmarkCard key={benchmark.id} benchmark={benchmark} />
          ))}
        </div>
      </div>
    </section>
  );
}
