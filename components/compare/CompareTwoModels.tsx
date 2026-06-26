"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Model, Provider, CAPABILITY_ICONS, VISIBLE_CAPABILITIES } from "@/types/model";
import { Currency, formatPricePerMillion } from "@/lib/currency";
import { formatNumber } from "@/lib/utils";
import ProviderLogo from "@/components/ui/ProviderLogo";

interface CompareTwoModelsProps {
  models: Model[];
  providers: Provider[];
  currency: Currency;
  onRemove: (modelId: string) => void;
  recommendedModels: Model[];
  onAddModel: (modelId: string) => void;
}

function CompareBar({
  leftValue,
  rightValue,
  leftBetter,
  format = "number",
}: {
  leftValue: number;
  rightValue: number;
  leftBetter: boolean;
  format?: "number" | "price";
}) {
  const max = Math.max(leftValue, rightValue);
  const leftWidth = max > 0 ? (leftValue / max) * 100 : 0;
  const rightWidth = max > 0 ? (rightValue / max) * 100 : 0;

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 flex justify-end">
        <div
          className={`h-2 rounded-l-full ${leftBetter ? "bg-green-500" : "bg-neutral-300 dark:bg-neutral-600"}`}
          style={{ width: `${leftWidth}%` }}
        />
      </div>
      <div className="w-4" />
      <div className="flex-1">
        <div
          className={`h-2 rounded-r-full ${!leftBetter ? "bg-green-500" : "bg-neutral-300 dark:bg-neutral-600"}`}
          style={{ width: `${rightWidth}%` }}
        />
      </div>
    </div>
  );
}

function DiffBadge({ value, better }: { value: number; better: boolean }) {
  if (value === 0) return null;
  const t = useTranslations();
  const percent = Math.abs(Math.round(value * 100));

  return (
    <span className={`text-xs font-medium ${better ? "text-green-600" : "text-neutral-400"}`}>
      {better && "✓ "}{percent}% {value > 0 ? t("compare.cheaper") : t("compare.more")}
    </span>
  );
}

export default function CompareTwoModels({
  models,
  providers,
  currency,
  onRemove,
  recommendedModels,
  onAddModel,
}: CompareTwoModelsProps) {
  const t = useTranslations();
  const [left, right] = models;

  const [dailyInput, setDailyInput] = useState(1);
  const [dailyOutput, setDailyOutput] = useState(0.5);

  const getProvider = (providerId: string) => providers.find((p) => p.id === providerId);

  // 计算价格差异百分比
  const inputDiff = left.pricing.input > 0 ? (right.pricing.input - left.pricing.input) / left.pricing.input : 0;
  const outputDiff = left.pricing.output > 0 ? (right.pricing.output - left.pricing.output) / left.pricing.output : 0;
  const cachedDiff = left.pricing.cachedInput && right.pricing.cachedInput
    ? (right.pricing.cachedInput - left.pricing.cachedInput) / left.pricing.cachedInput
    : null;

  // 计算参数差异
  const contextDiff = left.contextWindow > 0 ? (right.contextWindow - left.contextWindow) / left.contextWindow : 0;
  const outputLimitDiff = left.maxOutput > 0 ? (right.maxOutput - left.maxOutput) / left.maxOutput : 0;

  // 计算月费
  const leftMonthly = (dailyInput * left.pricing.input + dailyOutput * left.pricing.output) * 30;
  const rightMonthly = (dailyInput * right.pricing.input + dailyOutput * right.pricing.output) * 30;
  const monthlySavings = Math.abs(leftMonthly - rightMonthly);
  const savingsPercent = Math.max(leftMonthly, rightMonthly) > 0
    ? (monthlySavings / Math.max(leftMonthly, rightMonthly)) * 100
    : 0;

  return (
    <div className="space-y-8">
      {/* Model Headers */}
      <div className="grid grid-cols-2 gap-8">
        {[left, right].map((model) => (
          <div
            key={model.id}
            className="relative rounded-xl border border-neutral-200 bg-white p-6 text-center dark:border-neutral-700 dark:bg-neutral-900"
          >
            <button
              onClick={() => onRemove(model.id)}
              className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600"
            >
              ✕
            </button>
            <div className="flex justify-center mb-3">
              <ProviderLogo provider={model.provider} size={56} />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">
              {model.name}
            </h3>
            <p className="text-sm text-neutral-500">
              {getProvider(model.provider)?.name}
            </p>
          </div>
        ))}
      </div>

      {/* Price Comparison */}
      <section className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
          💰 {t("compare.priceComparison")}
        </h2>

        <div className="space-y-6">
          {/* Input Price */}
          <div>
            <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center mb-2">
              <div className="text-right">
                <span className={`text-lg font-semibold ${inputDiff > 0 ? "text-green-600" : "text-neutral-900 dark:text-white"}`}>
                  {formatPricePerMillion(left.pricing.input, currency)}
                </span>
                {inputDiff > 0 && <DiffBadge value={inputDiff} better={true} />}
              </div>
              <span className="text-sm text-neutral-500 w-24 text-center">{t("model.input")}</span>
              <div className="text-left">
                <span className={`text-lg font-semibold ${inputDiff < 0 ? "text-green-600" : "text-neutral-900 dark:text-white"}`}>
                  {formatPricePerMillion(right.pricing.input, currency)}
                </span>
                {inputDiff < 0 && <DiffBadge value={-inputDiff} better={true} />}
              </div>
            </div>
            <CompareBar leftValue={left.pricing.input} rightValue={right.pricing.input} leftBetter={inputDiff > 0} />
          </div>

          {/* Output Price */}
          <div>
            <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center mb-2">
              <div className="text-right">
                <span className={`text-lg font-semibold ${outputDiff > 0 ? "text-green-600" : "text-neutral-900 dark:text-white"}`}>
                  {formatPricePerMillion(left.pricing.output, currency)}
                </span>
                {outputDiff > 0 && <DiffBadge value={outputDiff} better={true} />}
              </div>
              <span className="text-sm text-neutral-500 w-24 text-center">{t("model.output")}</span>
              <div className="text-left">
                <span className={`text-lg font-semibold ${outputDiff < 0 ? "text-green-600" : "text-neutral-900 dark:text-white"}`}>
                  {formatPricePerMillion(right.pricing.output, currency)}
                </span>
                {outputDiff < 0 && <DiffBadge value={-outputDiff} better={true} />}
              </div>
            </div>
            <CompareBar leftValue={left.pricing.output} rightValue={right.pricing.output} leftBetter={outputDiff > 0} />
          </div>

          {/* Cached Input Price */}
          {(left.pricing.cachedInput || right.pricing.cachedInput) && (
            <div>
              <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center mb-2">
                <div className="text-right">
                  <span className={`text-lg font-semibold ${cachedDiff && cachedDiff > 0 ? "text-green-600" : "text-neutral-900 dark:text-white"}`}>
                    {left.pricing.cachedInput ? formatPricePerMillion(left.pricing.cachedInput, currency) : "-"}
                  </span>
                </div>
                <span className="text-sm text-neutral-500 w-24 text-center">{t("model.cachedInput")}</span>
                <div className="text-left">
                  <span className={`text-lg font-semibold ${cachedDiff && cachedDiff < 0 ? "text-green-600" : "text-neutral-900 dark:text-white"}`}>
                    {right.pricing.cachedInput ? formatPricePerMillion(right.pricing.cachedInput, currency) : "-"}
                  </span>
                </div>
              </div>
              {left.pricing.cachedInput && right.pricing.cachedInput && (
                <CompareBar
                  leftValue={left.pricing.cachedInput}
                  rightValue={right.pricing.cachedInput}
                  leftBetter={cachedDiff !== null && cachedDiff > 0}
                />
              )}
            </div>
          )}
        </div>
      </section>

      {/* Cost Calculator */}
      <section className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
          🧮 {t("compare.costCalculator")}
        </h2>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm text-neutral-500 mb-1">{t("compare.dailyInput")}</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={dailyInput}
                onChange={(e) => setDailyInput(Math.max(0, Number(e.target.value)))}
                className="w-24 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                min="0"
                step="0.1"
              />
              <span className="text-sm text-neutral-500">M tokens</span>
            </div>
          </div>
          <div>
            <label className="block text-sm text-neutral-500 mb-1">{t("compare.dailyOutput")}</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={dailyOutput}
                onChange={(e) => setDailyOutput(Math.max(0, Number(e.target.value)))}
                className="w-24 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                min="0"
                step="0.1"
              />
              <span className="text-sm text-neutral-500">M tokens</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
          <div className="text-right">
            <div className={`text-2xl font-bold ${leftMonthly <= rightMonthly ? "text-green-600" : "text-neutral-900 dark:text-white"}`}>
              ${leftMonthly.toFixed(2)}
            </div>
            <div className="text-sm text-neutral-500">{t("compare.monthlyEstimate")}</div>
            {leftMonthly < rightMonthly && (
              <div className="text-sm text-green-600 font-medium mt-1">
                🏆 {t("compare.savesPercent", { percent: Math.round(savingsPercent) })}
              </div>
            )}
          </div>
          <div className="text-center text-neutral-400">VS</div>
          <div className="text-left">
            <div className={`text-2xl font-bold ${rightMonthly <= leftMonthly ? "text-green-600" : "text-neutral-900 dark:text-white"}`}>
              ${rightMonthly.toFixed(2)}
            </div>
            <div className="text-sm text-neutral-500">{t("compare.monthlyEstimate")}</div>
            {rightMonthly < leftMonthly && (
              <div className="text-sm text-green-600 font-medium mt-1">
                🏆 {t("compare.savesPercent", { percent: Math.round(savingsPercent) })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Parameters Comparison */}
      <section className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
          📊 {t("compare.parameters")}
        </h2>

        <div className="space-y-6">
          {/* Context Window */}
          <div>
            <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center mb-2">
              <div className="text-right">
                <span className={`text-lg font-semibold ${contextDiff < 0 ? "text-green-600" : "text-neutral-900 dark:text-white"}`}>
                  {formatNumber(left.contextWindow)}
                </span>
              </div>
              <span className="text-sm text-neutral-500 w-24 text-center">{t("model.context")}</span>
              <div className="text-left">
                <span className={`text-lg font-semibold ${contextDiff > 0 ? "text-green-600" : "text-neutral-900 dark:text-white"}`}>
                  {formatNumber(right.contextWindow)}
                </span>
                {contextDiff > 0 && (
                  <span className="ml-2 text-xs text-green-600">+{Math.round(contextDiff * 100)}%</span>
                )}
              </div>
            </div>
            <CompareBar leftValue={left.contextWindow} rightValue={right.contextWindow} leftBetter={contextDiff < 0} />
          </div>

          {/* Max Output */}
          <div>
            <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center mb-2">
              <div className="text-right">
                <span className={`text-lg font-semibold ${outputLimitDiff < 0 ? "text-green-600" : "text-neutral-900 dark:text-white"}`}>
                  {formatNumber(left.maxOutput)}
                </span>
              </div>
              <span className="text-sm text-neutral-500 w-24 text-center">{t("model.maxOutput")}</span>
              <div className="text-left">
                <span className={`text-lg font-semibold ${outputLimitDiff > 0 ? "text-green-600" : "text-neutral-900 dark:text-white"}`}>
                  {formatNumber(right.maxOutput)}
                </span>
              </div>
            </div>
            <CompareBar leftValue={left.maxOutput} rightValue={right.maxOutput} leftBetter={outputLimitDiff < 0} />
          </div>
        </div>
      </section>

      {/* Capabilities Comparison */}
      <section className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
          ⚡ {t("compare.capabilities")}
        </h2>

        <div className="space-y-3">
          {VISIBLE_CAPABILITIES.map((cap) => {
            const leftHas = left.capabilities.includes(cap);
            const rightHas = right.capabilities.includes(cap);
            const same = leftHas === rightHas;

            return (
              <div key={cap} className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                <div className="text-right">
                  <span className={leftHas ? "text-green-600" : "text-neutral-300"}>
                    {leftHas ? "✓" : "✗"}
                  </span>
                </div>
                <span className={`text-sm w-32 text-center ${same ? "text-neutral-400" : "text-neutral-900 dark:text-white font-medium"}`}>
                  {CAPABILITY_ICONS[cap]} {t(`capability.${cap}`)}
                </span>
                <div className="text-left">
                  <span className={rightHas ? "text-green-600" : "text-neutral-300"}>
                    {rightHas ? "✓" : "✗"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recommendations */}
      {recommendedModels.length > 0 && (
        <section className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
            💡 {t("compare.alsoCompare")}
          </h2>
          <div className="flex flex-wrap gap-2">
            {recommendedModels.map((model) => (
              <button
                key={model.id}
                onClick={() => onAddModel(model.id)}
                className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm hover:border-acorn-500 hover:bg-acorn-50 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-acorn-500"
              >
                <ProviderLogo provider={model.provider} size={20} />
                <span className="font-medium">{model.name}</span>
                <span className="text-neutral-400">
                  {formatPricePerMillion(model.pricing.input, currency)}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
