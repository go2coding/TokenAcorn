"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import {
  CAPABILITY_ICONS,
  Capability,
  ModelDetail,
  ModelPriceHistoryEntry,
} from "@/types/model";
import {
  convertPrice,
  formatPrice,
  formatPricePerMillion,
} from "@/lib/currency";
import { formatNumber } from "@/lib/utils";
import { withLocalePrefix } from "@/lib/model-url";
import { useCurrency } from "@/contexts/CurrencyContext";
import ProviderLogo from "@/components/ui/ProviderLogo";

const PRICING_LABEL_KEYS: Record<string, string> = {
  token_input: "input",
  token_output: "output",
  token_cached: "cachedInput",
  embedding: "embedding",
  per_character: "perCharacter",
  per_image: "perImage",
  per_second: "perSecond",
  per_minute: "perMinute",
  per_unit: "perUnit",
};

const HISTORY_COLORS: Record<string, string> = {
  token_input: "#16a34a",
  token_output: "#ea580c",
  token_cached: "#0d9488",
};

const PRICING_ORDER: Record<string, number> = {
  token_input: 0,
  token_output: 1,
  token_cached: 2,
  embedding: 3,
  per_character: 4,
  per_image: 5,
  per_second: 6,
  per_minute: 7,
  per_unit: 8,
};

function formatDate(value: string, locale: string): string {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const date = dateOnly
    ? new Date(
        Number(dateOnly[1]),
        Number(dateOnly[2]) - 1,
        Number(dateOnly[3])
      )
    : new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatUnit(unit: string, t: ReturnType<typeof useTranslations>): string {
  const keyByUnit: Record<string, string> = {
    per_million: "perMillion",
    per_unit: "per_unit",
    per_image: "per_image",
    per_second: "per_second",
    per_minute: "per_minute",
    per_character: "per_character",
  };
  const key = keyByUnit[unit];
  return key ? t(`modelDetail.units.${key}`) : unit;
}

function formatCapability(
  capability: string,
  t: ReturnType<typeof useTranslations>,
  locale: string
): string {
  const translationKey = `capability.${capability}`;
  if (t.has(translationKey)) {
    return t(translationKey);
  }
  if (locale === "zh" && capability === "video") {
    return "视频";
  }
  return capability
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getCapabilityIcon(capability: string): string {
  return CAPABILITY_ICONS[capability as Capability] ?? "◆";
}

function PriceHistoryChart({
  entries,
  currency,
  locale,
}: {
  entries: ModelPriceHistoryEntry[];
  currency: "USD" | "CNY";
  locale: string;
}) {
  const width = 640;
  const height = 220;
  const padding = { top: 20, right: 24, bottom: 38, left: 62 };
  const values = [
    entries[0]?.oldPrice ?? entries[0]?.newPrice ?? 0,
    ...entries.map((entry) => entry.newPrice),
  ].map((value) => convertPrice(value, currency));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || Math.max(max * 0.2, 1);
  const lowerBound = Math.max(0, min - range * 0.15);
  const upperBound = max + range * 0.15;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const points = values.map((value, index) => {
    const x =
      padding.left +
      (values.length === 1 ? chartWidth / 2 : (index / (values.length - 1)) * chartWidth);
    const y =
      padding.top +
      ((upperBound - value) / (upperBound - lowerBound || 1)) * chartHeight;
    return { x, y, value };
  });
  const color = HISTORY_COLORS[entries[0]?.pricingType] ?? "#b45309";
  const firstDate = entries[0]?.recordedAt;
  const lastDate = entries[entries.length - 1]?.recordedAt;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full"
      role="img"
      aria-label="Price history chart"
    >
      {[0, 0.5, 1].map((ratio) => {
        const y = padding.top + chartHeight * ratio;
        const value = upperBound - (upperBound - lowerBound) * ratio;
        return (
          <g key={ratio}>
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={y}
              y2={y}
              stroke="currentColor"
              className="text-neutral-200 dark:text-neutral-800"
              strokeDasharray="4 5"
            />
            <text
              x={padding.left - 10}
              y={y + 4}
              textAnchor="end"
              className="fill-neutral-400 text-[11px]"
            >
              {currency === "USD" ? "$" : "¥"}
              {value.toFixed(value < 1 ? 3 : 2)}
            </text>
          </g>
        );
      })}
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points.map((point) => `${point.x},${point.y}`).join(" ")}
      />
      {points.map((point, index) => (
        <circle
          key={`${point.x}-${point.y}-${index}`}
          cx={point.x}
          cy={point.y}
          r="4"
          fill={color}
          stroke="white"
          strokeWidth="2"
        />
      ))}
      {firstDate && (
        <text
          x={padding.left}
          y={height - 10}
          className="fill-neutral-400 text-[11px]"
        >
          {formatDate(firstDate, locale)}
        </text>
      )}
      {lastDate && (
        <text
          x={width - padding.right}
          y={height - 10}
          textAnchor="end"
          className="fill-neutral-400 text-[11px]"
        >
          {formatDate(lastDate, locale)}
        </text>
      )}
    </svg>
  );
}

export default function ModelDetailClient({ model }: { model: ModelDetail }) {
  const t = useTranslations();
  const locale = useLocale();
  const { currency } = useCurrency();
  const [copied, setCopied] = useState(false);
  const standardPricingItems = useMemo(
    () =>
      model.pricingItems
        .filter((item) => item.tier === "standard")
        .sort(
          (left, right) =>
            (PRICING_ORDER[left.pricingType] ?? 99) -
            (PRICING_ORDER[right.pricingType] ?? 99)
        ),
    [model.pricingItems]
  );
  const [dailyUsage, setDailyUsage] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      standardPricingItems.map((item) => [
        `${item.pricingType}:${item.tier}`,
        item.pricingType === "token_input"
          ? 1
          : item.pricingType === "token_output"
            ? 0.5
            : 0,
      ])
    )
  );

  const availableHistoryTypes = useMemo(
    () =>
      Array.from(
        new Set(
          model.priceHistory
            .filter((entry) => entry.tier === "standard")
            .map((entry) => entry.pricingType)
        )
      ),
    [model.priceHistory]
  );
  const [historyType, setHistoryType] = useState(
    availableHistoryTypes[0] ?? "token_input"
  );
  const selectedHistory = model.priceHistory.filter(
    (entry) => entry.pricingType === historyType && entry.tier === "standard"
  );

  const dailyCost = standardPricingItems.reduce((total, item) => {
    const key = `${item.pricingType}:${item.tier}`;
    return total + (dailyUsage[key] ?? 0) * item.price;
  }, 0);
  const monthlyCost = dailyCost * 30;
  const pricingMetrics = [
    ...standardPricingItems.slice(0, 3).map((item) => ({
      label: t(
        `modelDetail.pricingTypes.${
          PRICING_LABEL_KEYS[item.pricingType] ?? "other"
        }`
      ),
      value:
        item.unit === "per_million"
          ? formatPricePerMillion(item.price, currency)
          : `${formatPrice(item.price, currency)} ${formatUnit(item.unit, t)}`,
      accent:
        item.pricingType === "token_input"
          ? "text-green-600"
          : item.pricingType === "token_output"
            ? "text-orange-600"
            : "text-teal-600",
    })),
    {
      label: t("model.context"),
      value: formatNumber(model.contextWindow),
      accent: "text-neutral-950 dark:text-white",
    },
  ].slice(0, 4);

  const copyModelId = async () => {
    try {
      await navigator.clipboard.writeText(model.id);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      console.error("Failed to copy model ID:", error);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 text-sm text-neutral-500">
        <Link
          href={withLocalePrefix("/", locale)}
          className="hover:text-acorn-600"
        >
          {t("nav.pricing")}
        </Link>
        <span className="mx-2">/</span>
        <span>{model.name}</span>
      </div>

      <section className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-8">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-acorn-400 via-amber-400 to-orange-500" />
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
          <div className="flex min-w-0 items-start gap-4">
            <ProviderLogo provider={model.provider} size={60} />
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-acorn-50 px-2.5 py-1 text-xs font-semibold text-acorn-700 dark:bg-acorn-950/40 dark:text-acorn-300">
                  {t(`category.${model.category}`)}
                </span>
                {model.deprecated && (
                  <span className="rounded-full bg-neutral-200 px-2.5 py-1 text-xs font-semibold text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300">
                    {t("model.deprecated")}
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-neutral-950 dark:text-white sm:text-4xl">
                {model.name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-500">
                {model.providerInfo.website ? (
                  <a
                    href={model.providerInfo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-neutral-700 hover:text-acorn-600 dark:text-neutral-300"
                  >
                    {model.providerInfo.name}
                  </a>
                ) : (
                  <span>{model.providerInfo.name}</span>
                )}
                {model.releaseDate && (
                  <>
                    <span className="text-neutral-300 dark:text-neutral-700">•</span>
                    <span>
                      {t("modelDetail.released", {
                        date: formatDate(model.releaseDate, locale),
                      })}
                    </span>
                  </>
                )}
              </div>
              <div className="mt-4 flex max-w-full items-center gap-2">
                <code className="truncate rounded-md bg-neutral-100 px-2.5 py-1.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                  {model.id}
                </code>
                <button
                  type="button"
                  onClick={copyModelId}
                  className="shrink-0 rounded-md border border-neutral-200 px-2.5 py-1.5 text-xs font-medium text-neutral-600 hover:border-acorn-400 hover:text-acorn-600 dark:border-neutral-700 dark:text-neutral-300"
                >
                  {copied ? t("modelDetail.copied") : t("model.copyId")}
                </button>
              </div>
            </div>
          </div>

          <Link
            href={`${withLocalePrefix("/compare", locale)}?models=${encodeURIComponent(
              model.id
            )}`}
            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-acorn-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-acorn-600"
          >
            {t("modelDetail.compareModel")}
          </Link>
        </div>
      </section>

      <section className="mt-6 overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4">
        {pricingMetrics.map((metric) => (
          <div
            key={metric.label}
            className="border-b border-neutral-200 p-5 last:border-b-0 dark:border-neutral-800 sm:[&:nth-last-child(-n+2)]:border-b-0 sm:[&:nth-child(odd)]:border-r lg:border-b-0 lg:border-r lg:last:border-r-0"
          >
            <div className="text-sm text-neutral-500">{metric.label}</div>
            <div className={`mt-2 text-2xl font-bold ${metric.accent}`}>
              {metric.value}
            </div>
          </div>
        ))}
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">


        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white divide-y divide-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:divide-neutral-800">
          <section className="p-6">
            <h2 className="text-lg font-semibold text-neutral-950 dark:text-white">
              {t("modelDetail.specificationsTitle")}
            </h2>
            <dl className="mt-4 divide-y divide-neutral-100 text-sm dark:divide-neutral-800">
              {[
                [t("model.modelId"), model.id],
                [t("modelDetail.provider"), model.providerInfo.name],
                [t("model.context"), formatNumber(model.contextWindow)],
                [t("model.maxOutput"), formatNumber(model.maxOutput)],
                [
                  t("model.releaseDate"),
                  model.releaseDate
                    ? formatDate(model.releaseDate, locale)
                    : t("modelDetail.unknown"),
                ],
                [
                  t("model.knowledgeCutoff"),
                  model.knowledgeCutoff || t("modelDetail.unknown"),
                ],
                [
                  t("model.updatedAt"),
                  formatDate(model.updatedAt, locale),
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-start justify-between gap-4 py-3"
                >
                  <dt className="text-neutral-500">{label}</dt>
                  <dd className="max-w-[65%] break-words text-right font-medium text-neutral-800 dark:text-neutral-200">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="p-6">
            <h2 className="text-lg font-semibold text-neutral-950 dark:text-white">
              {t("modelDetail.capabilitiesTitle")}
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {model.capabilities.map((capability) => (
                <div
                  key={capability}
                  className="flex items-center gap-2 rounded-lg bg-neutral-50 px-3 py-2.5 text-sm font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                >
                  <span>{getCapabilityIcon(capability)}</span>
                  <span>{formatCapability(capability, t, locale)}</span>
                </div>
              ))}
            </div>
          </section>

          {model.notes && (
            <section className="p-6">
              <h2 className="text-lg font-semibold text-neutral-950 dark:text-white">
                {t("model.notes")}
              </h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-neutral-600 dark:text-neutral-400">
                {model.notes}
              </p>
            </section>
          )}
        </div>

                <section className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="text-lg font-semibold text-neutral-950 dark:text-white">
              {t("modelDetail.costTitle")}
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              {t("modelDetail.costDescription")}
            </p>
            <div className="mt-5 space-y-4">
              {standardPricingItems.map((item) => {
                const key = `${item.pricingType}:${item.tier}`;
                return (
                <label
                  key={key}
                  className="flex items-center justify-between gap-4"
                >
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    {t(
                      `modelDetail.pricingTypes.${
                        PRICING_LABEL_KEYS[item.pricingType] ?? "other"
                      }`
                    )}
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={dailyUsage[key] ?? 0}
                      onChange={(event) =>
                        setDailyUsage((current) => ({
                          ...current,
                          [key]: Math.max(0, Number(event.target.value)),
                        }))
                      }
                      className="w-24 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-right text-sm outline-none focus:border-acorn-500 dark:border-neutral-700 dark:bg-neutral-800"
                    />
                    <span className="w-20 text-xs text-neutral-400">
                      {formatUnit(item.unit, t)}
                    </span>
                  </div>
                </label>
                );
              })}
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-neutral-50 p-4 dark:bg-neutral-950/50">
                <div className="text-xs text-neutral-500">
                  {t("modelDetail.perDay")}
                </div>
                <div className="mt-1 text-xl font-bold text-neutral-950 dark:text-white">
                  {formatPrice(dailyCost, currency)}
                </div>
              </div>
              <div className="rounded-lg bg-acorn-50 p-4 dark:bg-acorn-950/30">
                <div className="text-xs text-acorn-700 dark:text-acorn-300">
                  {t("modelDetail.perMonth")}
                </div>
                <div className="mt-1 text-xl font-bold text-acorn-700 dark:text-acorn-300">
                  {formatPrice(monthlyCost, currency)}
                </div>
              </div>
            </div>
            <p className="mt-4 text-xs leading-5 text-neutral-400">
              {t("modelDetail.costNote")}
            </p>
        </section>
        
      </div>

      {availableHistoryTypes.length > 0 && (
        <section className="mt-10 border-t border-neutral-200 pt-8 dark:border-neutral-800">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-lg font-semibold text-neutral-950 dark:text-white">
                {t("modelDetail.historyTitle")}
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                {t("modelDetail.historyDescription")}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {availableHistoryTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setHistoryType(type)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                    historyType === type
                      ? "bg-acorn-500 text-white"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300"
                  }`}
                >
                  {t(
                    `modelDetail.pricingTypes.${
                      PRICING_LABEL_KEYS[type] ?? "other"
                    }`
                  )}
                </button>
              ))}
            </div>
          </div>

          <div
            className={`mt-5 grid gap-6 ${
              selectedHistory.length > 1
                ? "lg:grid-cols-[1fr_320px]"
                : "max-w-xl"
            }`}
          >
            {selectedHistory.length > 1 && (
              <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-900">
                <PriceHistoryChart
                  entries={selectedHistory}
                  currency={currency}
                  locale={locale}
                />
              </div>
            )}
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {[...selectedHistory]
                .reverse()
                .slice(0, 5)
                .map((entry) => (
                  <div
                    key={entry.id}
                    className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
                  >
                    <span className="text-neutral-500">
                      {formatDate(entry.recordedAt, locale)}
                    </span>
                    <span className="font-medium text-neutral-800 dark:text-neutral-200">
                      {entry.oldPrice === undefined
                        ? "-"
                        : formatPrice(entry.oldPrice, currency)}
                      <span className="mx-2 text-neutral-400">→</span>
                      {formatPrice(entry.newPrice, currency)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
