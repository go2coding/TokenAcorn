"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Model, CAPABILITY_ICONS, VISIBLE_CAPABILITIES } from "@/types/model";
import { formatPricePerMillion, Currency } from "@/lib/currency";
import { formatNumber } from "@/lib/utils";
import { getModelDetailPath } from "@/lib/model-url";
import ProviderLogo from "@/components/ui/ProviderLogo";

interface ModelCardProps {
  model: Model;
  providerName: string;
  providerWebsite?: string;
  currency: Currency;
  onCompare?: (model: Model) => void;
  isSelected?: boolean;
  isFavorite?: boolean;
  onFavoriteToggle?: (modelId: string) => void;
  maxContextWindow?: number;
}

function getPriceColor(price: number): string {
  if (price <= 0.5) return "text-green-600";
  if (price <= 2) return "text-green-500";
  if (price <= 5) return "text-yellow-600";
  if (price <= 15) return "text-orange-500";
  return "text-red-500";
}

function getContextPercentage(context: number, max: number): number {
  return Math.min((context / max) * 100, 100);
}

export default function ModelCard({
  model,
  providerName,
  providerWebsite,
  currency,
  onCompare,
  isSelected,
  isFavorite = false,
  onFavoriteToggle,
  maxContextWindow = 2000000,
}: ModelCardProps) {
  const t = useTranslations();
  const locale = useLocale();
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyId = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(model.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavoriteToggle?.(model.id);
  };

  const contextPercentage = getContextPercentage(model.contextWindow, maxContextWindow);

  return (
    <div
      className={`group relative rounded-xl border bg-white p-5 shadow-sm transition-all hover:shadow-md dark:bg-neutral-900 ${
        isSelected
          ? "border-acorn-500 ring-2 ring-acorn-500/20"
          : "border-neutral-200 dark:border-neutral-800"
      } ${model.deprecated ? "opacity-60" : ""}`}
    >
      {model.deprecated && (
        <span className="absolute -top-2 right-3 rounded-full bg-neutral-500 px-2 py-0.5 text-xs text-white">
          {t("model.deprecated")}
        </span>
      )}

      {/* Favorite Button */}
      {onFavoriteToggle && (
        <button
          onClick={handleFavorite}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          title={isFavorite ? t("model.unfavorite") : t("model.favorite")}
        >
          <span className={`text-lg ${isFavorite ? "text-yellow-500" : "text-neutral-300 hover:text-yellow-400"}`}>
            {isFavorite ? "★" : "☆"}
          </span>
        </button>
      )}

      {/* Header: Logo + Name + Provider */}
      <div className="mb-3 flex items-start gap-3 pr-8">
        {providerWebsite ? (
          <a href={providerWebsite} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 hover:opacity-80 transition-opacity">
            <ProviderLogo provider={model.provider} size={36} />
          </a>
        ) : (
          <ProviderLogo provider={model.provider} size={36} />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="truncate font-semibold text-neutral-900 dark:text-white">
            <Link
              href={getModelDetailPath(model.id, locale)}
              className="hover:text-acorn-600 dark:hover:text-acorn-400"
            >
              {model.name}
            </Link>
          </h3>
          {providerWebsite ? (
            <a href={providerWebsite} target="_blank" rel="noopener noreferrer" className="text-sm text-neutral-500 hover:text-acorn-600 hover:underline transition-colors">
              {providerName}
            </a>
          ) : (
            <p className="text-sm text-neutral-500">{providerName}</p>
          )}
        </div>
      </div>

      {/* Category + Capabilities */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
          {t(`category.${model.category}`)}
        </span>
        <span className="text-neutral-300 dark:text-neutral-600">|</span>
        {model.capabilities
          .filter((cap) => VISIBLE_CAPABILITIES.includes(cap))
          .map((cap) => (
            <span
              key={cap}
              className="relative cursor-default text-sm group/cap"
            >
              <span className="hover:scale-110 inline-block transition-transform">
                {CAPABILITY_ICONS[cap]}
              </span>
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs font-medium text-white bg-neutral-800 rounded whitespace-nowrap opacity-0 invisible group-hover/cap:opacity-100 group-hover/cap:visible transition-all z-10">
                {t(`capability.${cap}`)}
                <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-800" />
              </span>
            </span>
          ))}
      </div>

      {/* Pricing with Color Coding */}
      <div className="mb-4 space-y-1 border-t border-neutral-100 pt-3 dark:border-neutral-800">
        {model.category === "embedding" ? (
          // Embedding 模型：只显示单一价格
          <div className="flex justify-between text-sm">
            <span className="text-neutral-500">{t("model.input")}</span>
            <span className={`font-medium ${getPriceColor(model.pricing.input)}`}>
              {formatPricePerMillion(model.pricing.input, currency)}
            </span>
          </div>
        ) : (
          // 通用模型：显示 input/output/cachedInput
          <>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">{t("model.input")}</span>
              <span className={`font-medium ${getPriceColor(model.pricing.input)}`}>
                {formatPricePerMillion(model.pricing.input, currency)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">{t("model.output")}</span>
              <span className={`font-medium ${getPriceColor(model.pricing.output)}`}>
                {formatPricePerMillion(model.pricing.output, currency)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">{t("model.cachedInput")}</span>
              {model.pricing.cachedInput !== undefined ? (
                <span className="font-medium text-green-600">
                  {formatPricePerMillion(model.pricing.cachedInput, currency)}
                  {model.pricing.input > 0 && (
                    <span className="ml-1 text-xs text-green-500">
                      (-{Math.round((1 - model.pricing.cachedInput / model.pricing.input) * 100)}%)
                    </span>
                  )}
                </span>
              ) : (
                <span className="font-medium text-neutral-400">-</span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Context Window Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
          <span>{t("model.context")}</span>
          <span>{formatNumber(model.contextWindow)}</span>
        </div>
        <div className="h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-acorn-400 to-acorn-600 rounded-full transition-all"
            style={{ width: `${contextPercentage}%` }}
          />
        </div>
      </div>

      {/* Max Output */}
      <div className="flex items-center justify-between text-xs text-neutral-400 mb-3">
        <span>{t("model.maxOutput")}</span>
        <span>{formatNumber(model.maxOutput)}</span>
      </div>

      {/* Expandable Details */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 flex items-center justify-center gap-1 py-1"
      >
        <span>{isExpanded ? t("model.hideDetails") : t("model.showDetails")}</span>
        <span className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}>▼</span>
      </button>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-2 text-sm">
          {/* Model ID with Copy */}
          <div className="flex items-center justify-between">
            <span className="text-neutral-500">{t("model.modelId")}</span>
            <div className="flex items-center gap-2">
              <code className="text-xs bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
                {model.id}
              </code>
              <button
                onClick={handleCopyId}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                title={t("model.copyId")}
              >
                {copied ? "✓" : "📋"}
              </button>
            </div>
          </div>

          {/* Release Date */}
          {model.releaseDate && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-500">{t("model.releaseDate")}</span>
              <span className="text-neutral-600 dark:text-neutral-400">{model.releaseDate}</span>
            </div>
          )}

          {/* Knowledge Cutoff */}
          {model.knowledgeCutoff && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-500">{t("model.knowledgeCutoff")}</span>
              <span className="text-neutral-600 dark:text-neutral-400">{model.knowledgeCutoff}</span>
            </div>
          )}

          {/* Cache Rate */}
          {model.cacheRate !== undefined && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-500">{t("model.cacheRate")}</span>
              <span className="text-green-600 dark:text-green-400">{model.cacheRate}%</span>
            </div>
          )}

          {/* Updated At */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-500">{t("model.updatedAt")}</span>
            <span className="text-neutral-600 dark:text-neutral-400">{model.updatedAt}</span>
          </div>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link
          href={getModelDetailPath(model.id, locale)}
          className="flex min-h-10 items-center justify-center rounded-lg border border-neutral-200 px-3 py-2 text-center text-sm font-medium leading-none text-neutral-700 transition-colors hover:border-acorn-400 hover:text-acorn-600 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-acorn-500"
        >
          {t("model.viewDetails")}
        </Link>
        {onCompare && (
          <button
            onClick={() => onCompare(model)}
            className={`flex min-h-10 items-center justify-center rounded-lg px-3 py-2 text-sm font-medium leading-none transition-colors ${
              isSelected
                ? "bg-acorn-500 text-white hover:bg-acorn-600"
                : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            }`}
          >
            {isSelected ? t("model.selected") : t("model.addCompare")}
          </button>
        )}
      </div>
    </div>
  );
}
