"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Model, Provider, CAPABILITY_ICONS, VISIBLE_CAPABILITIES } from "@/types/model";
import { formatPricePerMillion, Currency } from "@/lib/currency";
import { formatNumber } from "@/lib/utils";
import { getModelDetailPath } from "@/lib/model-url";
import ProviderLogo from "@/components/ui/ProviderLogo";

interface ModelTableProps {
  models: Model[];
  providers: Provider[];
  currency: Currency;
  selectedModels: string[];
  onCompare: (model: Model) => void;
  favorites: string[];
  onFavoriteToggle: (modelId: string) => void;
}

function getPriceColor(price: number): string {
  if (price <= 0.5) return "text-green-600";
  if (price <= 2) return "text-green-500";
  if (price <= 5) return "text-yellow-600";
  if (price <= 15) return "text-orange-500";
  return "text-red-500";
}

export default function ModelTable({
  models,
  providers,
  currency,
  selectedModels,
  onCompare,
  favorites,
  onFavoriteToggle,
}: ModelTableProps) {
  const t = useTranslations();
  const locale = useLocale();

  const getProvider = (providerId: string) => {
    return providers.find((p) => p.id === providerId);
  };

  if (models.length === 0) {
    return (
      <div className="py-12 text-center text-neutral-500">
        {t("model.noResults")}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200 dark:border-neutral-800">
            <th className="px-3 py-3 text-left font-medium text-neutral-500 dark:text-neutral-400">
              {t("model.modelName")}
            </th>
            <th className="px-3 py-3 text-right font-medium text-neutral-500 dark:text-neutral-400">
              {t("model.input")}
            </th>
            <th className="px-3 py-3 text-right font-medium text-neutral-500 dark:text-neutral-400">
              {t("model.output")}
            </th>
            <th className="px-3 py-3 text-right font-medium text-neutral-500 dark:text-neutral-400">
              {t("model.cachedInput")}
            </th>
            <th className="px-3 py-3 text-right font-medium text-neutral-500 dark:text-neutral-400">
              {t("model.context")}
            </th>
            <th className="px-3 py-3 text-center font-medium text-neutral-500 dark:text-neutral-400">
              Capabilities
            </th>
            <th className="px-3 py-3 text-center font-medium text-neutral-500 dark:text-neutral-400">

            </th>
          </tr>
        </thead>
        <tbody>
          {models.map((model) => {
            const provider = getProvider(model.provider);
            const isFavorite = favorites.includes(model.id);
            const isSelected = selectedModels.includes(model.id);

            return (
              <tr
                key={model.id}
                className={`border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors ${
                  model.deprecated ? "opacity-50" : ""
                } ${isSelected ? "bg-acorn-50 dark:bg-acorn-950/20" : ""}`}
              >
                {/* Model Name & Provider */}
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    {provider?.website ? (
                      <a href={provider.website} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 hover:opacity-80">
                        <ProviderLogo provider={model.provider} size={24} />
                      </a>
                    ) : (
                      <ProviderLogo provider={model.provider} size={24} />
                    )}
                    <div>
                      <div className="flex items-center gap-2 font-medium text-neutral-900 dark:text-white">
                        <Link
                          href={getModelDetailPath(model.id, locale)}
                          className="hover:text-acorn-600 dark:hover:text-acorn-400"
                        >
                          {model.name}
                        </Link>
                        {model.deprecated && (
                          <span className="text-xs bg-neutral-200 dark:bg-neutral-700 px-1.5 py-0.5 rounded">
                            {t("model.deprecated")}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-neutral-500">{provider?.name}</div>
                    </div>
                  </div>
                </td>

                {/* Input Price */}
                <td className={`px-3 py-3 text-right font-medium ${getPriceColor(model.pricing.input)}`}>
                  {formatPricePerMillion(model.pricing.input, currency)}
                </td>

                {/* Output Price - Embedding 模型显示 "-" */}
                <td className={`px-3 py-3 text-right font-medium ${model.category === "embedding" ? "" : getPriceColor(model.pricing.output)}`}>
                  {model.category === "embedding" ? "-" : formatPricePerMillion(model.pricing.output, currency)}
                </td>

                {/* Cached Input Price - Embedding 模型显示 "-" */}
                <td className="px-3 py-3 text-right font-medium text-green-600">
                  {model.category === "embedding" || model.pricing.cachedInput === undefined
                    ? "-"
                    : formatPricePerMillion(model.pricing.cachedInput, currency)}
                </td>

                {/* Context Window */}
                <td className="px-3 py-3 text-right text-neutral-600 dark:text-neutral-400">
                  {formatNumber(model.contextWindow)}
                </td>

                {/* Capabilities */}
                <td className="px-3 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    {model.capabilities
                      .filter((cap) => VISIBLE_CAPABILITIES.includes(cap))
                      .map((cap) => (
                        <span
                          key={cap}
                          className="relative cursor-default group/cap"
                          title={t(`capability.${cap}`)}
                        >
                          {CAPABILITY_ICONS[cap]}
                        </span>
                      ))}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-3 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onFavoriteToggle(model.id)}
                      className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      title={isFavorite ? t("model.unfavorite") : t("model.favorite")}
                    >
                      <span className={`text-lg ${isFavorite ? "text-yellow-500" : "text-neutral-300 hover:text-yellow-400"}`}>
                        {isFavorite ? "★" : "☆"}
                      </span>
                    </button>
                    <button
                      onClick={() => onCompare(model)}
                      className={`p-1.5 rounded transition-colors ${
                        isSelected
                          ? "bg-acorn-500 text-white"
                          : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                      }`}
                      title={isSelected ? t("model.selected") : t("model.addCompare")}
                    >
                      {isSelected ? "✓" : "+"}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
