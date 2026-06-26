"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Model, Provider, CAPABILITY_ICONS, VISIBLE_CAPABILITIES } from "@/types/model";
import { Currency, formatPricePerMillion } from "@/lib/currency";
import { formatNumber } from "@/lib/utils";
import ProviderLogo from "@/components/ui/ProviderLogo";

interface CompareMultiModelsProps {
  models: Model[];
  providers: Provider[];
  currency: Currency;
  onRemove: (modelId: string) => void;
}

export default function CompareMultiModels({
  models,
  providers,
  currency,
  onRemove,
}: CompareMultiModelsProps) {
  const t = useTranslations();
  const [dailyInput, setDailyInput] = useState(1);
  const [dailyOutput, setDailyOutput] = useState(0.5);

  const getProvider = (providerId: string) => providers.find((p) => p.id === providerId);

  // 找出最优值
  const minInput = Math.min(...models.map((m) => m.pricing.input));
  const minOutput = Math.min(...models.map((m) => m.pricing.output));
  const minCached = Math.min(...models.filter((m) => m.pricing.cachedInput).map((m) => m.pricing.cachedInput!));
  const maxContext = Math.max(...models.map((m) => m.contextWindow));
  const maxOutputLimit = Math.max(...models.map((m) => m.maxOutput));

  // 计算月费
  const monthlyFees = models.map((m) => (dailyInput * m.pricing.input + dailyOutput * m.pricing.output) * 30);
  const minMonthly = Math.min(...monthlyFees);

  return (
    <div className="space-y-8">
      {/* Model Headers */}
      <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${models.length}, 1fr)` }}>
        {models.map((model) => (
          <div
            key={model.id}
            className="relative rounded-xl border border-neutral-200 bg-white p-4 text-center dark:border-neutral-700 dark:bg-neutral-900"
          >
            <button
              onClick={() => onRemove(model.id)}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600"
            >
              ✕
            </button>
            <div className="flex justify-center mb-2">
              <ProviderLogo provider={model.provider} size={40} />
            </div>
            <h3 className="font-semibold text-neutral-900 dark:text-white text-sm">
              {model.name}
            </h3>
            <p className="text-xs text-neutral-500">
              {getProvider(model.provider)?.name}
            </p>
          </div>
        ))}
      </div>

      {/* Price Comparison */}
      <section className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
          💰 {t("compare.priceComparison")}
        </h2>

        <table className="w-full">
          <tbody>
            {/* Input Price */}
            <tr className="border-b border-neutral-100 dark:border-neutral-800">
              <td className="py-3 text-sm text-neutral-500 w-32">{t("model.input")}</td>
              {models.map((model) => (
                <td key={model.id} className="py-3 text-center">
                  <span className={`font-semibold ${model.pricing.input === minInput ? "text-green-600" : "text-neutral-900 dark:text-white"}`}>
                    {formatPricePerMillion(model.pricing.input, currency)}
                  </span>
                  {model.pricing.input === minInput && <span className="ml-1">🏆</span>}
                </td>
              ))}
            </tr>

            {/* Output Price */}
            <tr className="border-b border-neutral-100 dark:border-neutral-800">
              <td className="py-3 text-sm text-neutral-500">{t("model.output")}</td>
              {models.map((model) => (
                <td key={model.id} className="py-3 text-center">
                  <span className={`font-semibold ${model.pricing.output === minOutput ? "text-green-600" : "text-neutral-900 dark:text-white"}`}>
                    {formatPricePerMillion(model.pricing.output, currency)}
                  </span>
                  {model.pricing.output === minOutput && <span className="ml-1">🏆</span>}
                </td>
              ))}
            </tr>

            {/* Cached Input Price */}
            <tr>
              <td className="py-3 text-sm text-neutral-500">{t("model.cachedInput")}</td>
              {models.map((model) => (
                <td key={model.id} className="py-3 text-center">
                  {model.pricing.cachedInput ? (
                    <>
                      <span className={`font-semibold ${model.pricing.cachedInput === minCached ? "text-green-600" : "text-neutral-900 dark:text-white"}`}>
                        {formatPricePerMillion(model.pricing.cachedInput, currency)}
                      </span>
                      {model.pricing.cachedInput === minCached && <span className="ml-1">🏆</span>}
                    </>
                  ) : (
                    <span className="text-neutral-300">-</span>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </section>

      {/* Cost Calculator */}
      <section className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
          🧮 {t("compare.costCalculator")}
        </h2>

        <div className="flex items-center gap-6 mb-6">
          <div className="flex items-center gap-2">
            <label className="text-sm text-neutral-500">{t("compare.dailyInput")}:</label>
            <input
              type="number"
              value={dailyInput}
              onChange={(e) => setDailyInput(Math.max(0, Number(e.target.value)))}
              className="w-20 rounded-lg border border-neutral-200 bg-white px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-800"
              min="0"
              step="0.1"
            />
            <span className="text-sm text-neutral-500">M</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-neutral-500">{t("compare.dailyOutput")}:</label>
            <input
              type="number"
              value={dailyOutput}
              onChange={(e) => setDailyOutput(Math.max(0, Number(e.target.value)))}
              className="w-20 rounded-lg border border-neutral-200 bg-white px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-800"
              min="0"
              step="0.1"
            />
            <span className="text-sm text-neutral-500">M</span>
          </div>
        </div>

        <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${models.length}, 1fr)` }}>
          {models.map((model, i) => {
            const monthly = monthlyFees[i];
            const isMin = monthly === minMonthly;
            const savingsPercent = minMonthly > 0 ? ((monthly - minMonthly) / monthly) * 100 : 0;

            return (
              <div
                key={model.id}
                className={`text-center p-4 rounded-lg ${isMin ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800" : "bg-neutral-50 dark:bg-neutral-800"}`}
              >
                <div className={`text-2xl font-bold ${isMin ? "text-green-600" : "text-neutral-900 dark:text-white"}`}>
                  ${monthly.toFixed(2)}
                </div>
                <div className="text-xs text-neutral-500 mt-1">{t("compare.monthlyEstimate")}</div>
                {isMin && (
                  <div className="text-xs text-green-600 font-medium mt-2">
                    🏆 {t("compare.cheapest")}
                  </div>
                )}
                {!isMin && savingsPercent > 0 && (
                  <div className="text-xs text-neutral-400 mt-2">
                    +{Math.round(savingsPercent)}%
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Parameters Comparison */}
      <section className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
          📊 {t("compare.parameters")}
        </h2>

        <table className="w-full">
          <tbody>
            <tr className="border-b border-neutral-100 dark:border-neutral-800">
              <td className="py-3 text-sm text-neutral-500 w-32">{t("model.context")}</td>
              {models.map((model) => (
                <td key={model.id} className="py-3 text-center">
                  <span className={`font-semibold ${model.contextWindow === maxContext ? "text-green-600" : "text-neutral-900 dark:text-white"}`}>
                    {formatNumber(model.contextWindow)}
                  </span>
                  {model.contextWindow === maxContext && <span className="ml-1">🏆</span>}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-3 text-sm text-neutral-500">{t("model.maxOutput")}</td>
              {models.map((model) => (
                <td key={model.id} className="py-3 text-center">
                  <span className={`font-semibold ${model.maxOutput === maxOutputLimit ? "text-green-600" : "text-neutral-900 dark:text-white"}`}>
                    {formatNumber(model.maxOutput)}
                  </span>
                  {model.maxOutput === maxOutputLimit && <span className="ml-1">🏆</span>}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </section>

      {/* Capabilities Comparison */}
      <section className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
          ⚡ {t("compare.capabilities")}
        </h2>

        <table className="w-full">
          <tbody>
            {VISIBLE_CAPABILITIES.map((cap) => (
              <tr key={cap} className="border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                <td className="py-3 text-sm text-neutral-500 w-32">
                  {CAPABILITY_ICONS[cap]} {t(`capability.${cap}`)}
                </td>
                {models.map((model) => {
                  const has = model.capabilities.includes(cap);
                  return (
                    <td key={model.id} className="py-3 text-center">
                      <span className={has ? "text-green-600" : "text-neutral-300"}>
                        {has ? "✓" : "✗"}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Quick Conclusion */}
      <section className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
          🎯 {t("compare.quickConclusion")}
        </h2>

        <div className="space-y-3">
          {/* Cheapest */}
          {(() => {
            const cheapest = models.reduce((a, b) =>
              a.pricing.input + a.pricing.output < b.pricing.input + b.pricing.output ? a : b
            );
            return (
              <div className="flex items-center gap-3">
                <span className="text-green-600 font-medium">💵 {t("compare.lowestPrice")}:</span>
                <ProviderLogo provider={cheapest.provider} size={20} />
                <span className="font-medium">{cheapest.name}</span>
              </div>
            );
          })()}

          {/* Largest Context */}
          {(() => {
            const largest = models.reduce((a, b) => a.contextWindow > b.contextWindow ? a : b);
            return (
              <div className="flex items-center gap-3">
                <span className="text-blue-600 font-medium">📚 {t("compare.largestContext")}:</span>
                <ProviderLogo provider={largest.provider} size={20} />
                <span className="font-medium">{largest.name}</span>
                <span className="text-neutral-500">({formatNumber(largest.contextWindow)})</span>
              </div>
            );
          })()}

          {/* Most Capabilities */}
          {(() => {
            const mostCaps = models.reduce((a, b) =>
              a.capabilities.filter((c) => VISIBLE_CAPABILITIES.includes(c)).length >
              b.capabilities.filter((c) => VISIBLE_CAPABILITIES.includes(c)).length ? a : b
            );
            return (
              <div className="flex items-center gap-3">
                <span className="text-purple-600 font-medium">🛠️ {t("compare.mostCapabilities")}:</span>
                <ProviderLogo provider={mostCaps.provider} size={20} />
                <span className="font-medium">{mostCaps.name}</span>
              </div>
            );
          })()}
        </div>
      </section>
    </div>
  );
}
