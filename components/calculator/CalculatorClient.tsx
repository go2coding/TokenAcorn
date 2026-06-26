"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Model, Provider } from "@/types/model";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatPricePerMillion } from "@/lib/currency";
import ProviderLogo from "@/components/ui/ProviderLogo";

interface CalculatorClientProps {
  providers: Provider[];
  models: Model[];
}

function estimateTokens(text: string): number {
  if (!text) return 0;
  const chineseChars = (text.match(/[一-鿿]/g) || []).length;
  const otherChars = text.length - chineseChars;
  return Math.ceil(chineseChars * 0.6 + otherChars / 4);
}

export default function CalculatorClient({ providers, models }: CalculatorClientProps) {
  const t = useTranslations();
  const { currency } = useCurrency();

  // Token Counter
  const [text, setText] = useState("");
  const tokenCount = useMemo(() => estimateTokens(text), [text]);

  // Cost Calculator
  const [inputTokens, setInputTokens] = useState(1);
  const [outputTokens, setOutputTokens] = useState(0.5);
  const [selectedProviderFilter, setSelectedProviderFilter] = useState("");
  const [sortBy, setSortBy] = useState<"price-desc" | "release-date">("release-date");

  // Budget Calculator
  const [budget, setBudget] = useState(100);
  const [budgetPeriod, setBudgetPeriod] = useState<"daily" | "monthly">("daily");

  const getProvider = (providerId: string) => providers.find((p) => p.id === providerId);

  const compareReleaseDate = (a: Model, b: Model): number => {
    const aDate = a.releaseDate ?? "";
    const bDate = b.releaseDate ?? "";
    return bDate.localeCompare(aDate);
  };

  const filteredModels = useMemo(() => {
    let result = models.filter((m) => m.category === "llm");
    if (selectedProviderFilter) {
      result = result.filter((m) => m.provider === selectedProviderFilter);
    }
    return result;
  }, [models, selectedProviderFilter]);

  // Calculate costs for each model (按天计算)
  const modelCosts = useMemo(() => {
    return filteredModels
      .map((model) => {
        const dailyCost = inputTokens * model.pricing.input + outputTokens * model.pricing.output;
        const tokensPerBudget = model.pricing.input > 0
          ? budget / model.pricing.input
          : Infinity;
        return {
          model,
          dailyCost,
          tokensPerBudget,
        };
      })
      .sort((a, b) => {
        if (sortBy === "release-date") {
          return compareReleaseDate(a.model, b.model);
        }
        return b.dailyCost - a.dailyCost;
      });
  }, [filteredModels, inputTokens, outputTokens, budget, sortBy]);

  const minCost = useMemo(() => {
    return modelCosts.length > 0
      ? Math.min(...modelCosts.map((c) => c.dailyCost))
      : 0;
  }, [modelCosts]);

  // Budget reverse calculation (按 1M 输入 + 0.5M 输出的固定比例计算)
  const budgetResults = useMemo(() => {
    const effectiveBudget = budgetPeriod === "daily" ? budget : budget / 30;
    return filteredModels
      .map((model) => {
        const effectiveInputPrice = model.pricing.input + model.pricing.output * 0.5;
        const inputTokensAffordable = effectiveInputPrice > 0
          ? effectiveBudget / effectiveInputPrice
          : Infinity;
        return {
          model,
          effectiveInputPrice,
          inputTokensAffordable,
        };
      })
      .sort((a, b) => {
        if (sortBy === "release-date") {
          return compareReleaseDate(a.model, b.model);
        }
        return b.effectiveInputPrice - a.effectiveInputPrice;
      });
  }, [filteredModels, budget, budgetPeriod, sortBy]);

  const maxAffordableTokens = useMemo(() => {
    return budgetResults.length > 0
      ? Math.max(...budgetResults.map((r) => r.inputTokensAffordable))
      : 0;
  }, [budgetResults]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
          {t("calculator.title")}
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          {t("calculator.description")}
        </p>
      </div>

      <div className="space-y-8">
        {/* Token Counter */}
        <section className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
            📝 {t("calculator.tokenCounter")}
          </h2>
          <div className="space-y-4">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("calculator.pasteText")}
              className="w-full h-32 rounded-lg border border-neutral-200 bg-white p-4 text-sm dark:border-neutral-700 dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-acorn-500 resize-none"
            />
            <div className="flex items-center justify-between">
              <div className="text-sm text-neutral-500">
                {t("calculator.characters")}: {text.length.toLocaleString()}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-500">{t("calculator.estimatedTokens")}:</span>
                <span className="text-2xl font-bold text-acorn-600">
                  {tokenCount.toLocaleString()}
                </span>
              </div>
            </div>
            <p className="text-xs text-neutral-400">
              {t("calculator.tokenNote")}
            </p>
          </div>
        </section>

        {/* Cost Calculator */}
        <section className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
            🧮 {t("calculator.costCalculator")}
          </h2>

          {/* Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm text-neutral-500 mb-1">{t("calculator.dailyInput")}</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={inputTokens}
                  onChange={(e) => setInputTokens(Math.max(0, Number(e.target.value)))}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                  min="0"
                  step="0.1"
                />
                <span className="text-sm text-neutral-500 whitespace-nowrap">M</span>
              </div>
            </div>
            <div>
              <label className="block text-sm text-neutral-500 mb-1">{t("calculator.dailyOutput")}</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={outputTokens}
                  onChange={(e) => setOutputTokens(Math.max(0, Number(e.target.value)))}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                  min="0"
                  step="0.1"
                />
                <span className="text-sm text-neutral-500 whitespace-nowrap">M</span>
              </div>
            </div>
            <div>
              <label className="block text-sm text-neutral-500 mb-1">{t("calculator.filterProvider")}</label>
              <select
                value={selectedProviderFilter}
                onChange={(e) => setSelectedProviderFilter(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
              >
                <option value="">{t("home.filters.allProviders")}</option>
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-neutral-500 mb-1">{t("calculator.sortBy")}</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "price-desc" | "release-date")}
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
              >
                <option value="price-desc">{t("calculator.sortPriceDesc")}</option>
                <option value="release-date">{t("calculator.sortReleaseDate")}</option>
              </select>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-2">
            {modelCosts.slice(0, 10).map(({ model, dailyCost }, index) => {
              const isMin = dailyCost === minCost;
              const diffPercent = minCost > 0 ? ((dailyCost - minCost) / minCost) * 100 : 0;

              return (
                <div
                  key={model.id}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    isMin
                      ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                      : "bg-neutral-50 dark:bg-neutral-800"
                  }`}
                >
                  <span className="w-6 text-center text-sm text-neutral-400">
                    {index + 1}
                  </span>
                  <ProviderLogo provider={model.provider} size={24} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-neutral-900 dark:text-white truncate">
                      {model.name}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {getProvider(model.provider)?.name}
                    </div>
                    <div className="text-xs text-neutral-500 mt-0.5">
                      {t("model.input")}: {formatPricePerMillion(model.pricing.input, currency)} · {t("model.output")}: {formatPricePerMillion(model.pricing.output, currency)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold ${isMin ? "text-green-600" : "text-neutral-900 dark:text-white"}`}>
                      ${dailyCost.toFixed(2)}
                      <span className="text-xs text-neutral-500 font-normal ml-1">/{t("calculator.day")}</span>
                    </div>
                    {isMin ? (
                      <div className="text-xs text-green-600">🏆 {t("calculator.cheapest")}</div>
                    ) : (
                      <div className="text-xs text-neutral-400">+{Math.round(diffPercent)}%</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {modelCosts.length > 10 && (
            <div className="mt-4 text-center text-sm text-neutral-500">
              {t("calculator.andMore", { count: modelCosts.length - 10 })}
            </div>
          )}
        </section>

        {/* Budget Calculator */}
        <section className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
            💰 {t("calculator.budgetCalculator")}
          </h2>

          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <label className="text-sm text-neutral-500">{t("calculator.myBudget")}:</label>
              <span className="text-lg font-semibold">$</span>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(Math.max(0, Number(e.target.value)))}
                className="w-24 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                min="0"
                step="10"
              />
            </div>
            <div className="flex items-center gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800">
              <button
                onClick={() => setBudgetPeriod("daily")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  budgetPeriod === "daily"
                    ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white"
                    : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400"
                }`}
              >
                {t("calculator.perDay")}
              </button>
              <button
                onClick={() => setBudgetPeriod("monthly")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  budgetPeriod === "monthly"
                    ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white"
                    : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400"
                }`}
              >
                {t("calculator.perMonth")}
              </button>
            </div>
          </div>

          <p className="text-sm text-neutral-500 mb-4">
            {t("calculator.budgetNote")}
          </p>

          <div className="space-y-2">
            {budgetResults.slice(0, 8).map(({ model, inputTokensAffordable }, index) => {
              const isMax = inputTokensAffordable === maxAffordableTokens;
              return (
                <div
                  key={model.id}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    isMax
                      ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                      : "bg-neutral-50 dark:bg-neutral-800"
                  }`}
                >
                  <span className="w-6 text-center text-sm text-neutral-400">
                    {index + 1}
                  </span>
                  <ProviderLogo provider={model.provider} size={24} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-neutral-900 dark:text-white truncate">
                      {model.name}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {formatPricePerMillion(model.pricing.input, currency)} {t("model.input")}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold ${isMax ? "text-green-600" : "text-neutral-900 dark:text-white"}`}>
                      {inputTokensAffordable >= 1000
                        ? `${(inputTokensAffordable / 1000).toFixed(1)}B`
                        : `${inputTokensAffordable.toFixed(1)}M`}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {t("calculator.inputTokens")}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Tips */}
        <div className="rounded-lg bg-neutral-100 p-4 text-sm text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400">
          <div className="font-medium mb-2">{t("calculator.tips.title")}</div>
          <ul className="space-y-1 list-disc list-inside">
            <li>{t("calculator.tips.tip1")}</li>
            <li>{t("calculator.tips.tip2")}</li>
            <li>{t("calculator.tips.tip3")}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
