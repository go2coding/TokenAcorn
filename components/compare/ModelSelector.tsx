"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Model, Provider } from "@/types/model";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatPricePerMillion } from "@/lib/currency";
import ProviderLogo from "@/components/ui/ProviderLogo";

interface ModelSelectorProps {
  models: Model[];
  providers: Provider[];
  selectedIds: string[];
  onSelect: (modelId: string) => void;
  onClose: () => void;
}

export default function ModelSelector({
  models,
  providers,
  selectedIds,
  onSelect,
  onClose,
}: ModelSelectorProps) {
  const t = useTranslations();
  const { currency } = useCurrency();
  const [search, setSearch] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("");

  const filteredModels = useMemo(() => {
    return models.filter((m) => {
      if (selectedIds.includes(m.id)) return false;
      if (selectedProvider && m.provider !== selectedProvider) return false;
      if (search) {
        const searchLower = search.toLowerCase();
        return (
          m.name.toLowerCase().includes(searchLower) ||
          m.id.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  }, [models, selectedIds, selectedProvider, search]);

  const getProvider = (providerId: string) => {
    return providers.find((p) => p.id === providerId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-xl shadow-xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
            {t("compare.selectModel")}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
          >
            ✕
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 space-y-3">
          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("compare.searchPlaceholder")}
            className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-acorn-500"
            autoFocus
          />

          {/* Provider Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedProvider("")}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                selectedProvider === ""
                  ? "bg-acorn-500 text-white border-acorn-500"
                  : "border-neutral-200 dark:border-neutral-700 hover:border-acorn-500"
              }`}
            >
              {t("home.filters.allProviders")}
            </button>
            {providers.map((provider) => (
              <button
                key={provider.id}
                onClick={() => setSelectedProvider(provider.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  selectedProvider === provider.id
                    ? "bg-acorn-500 text-white border-acorn-500"
                    : "border-neutral-200 dark:border-neutral-700 hover:border-acorn-500"
                }`}
              >
                <ProviderLogo provider={provider.id} size={16} />
                <span>{provider.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Model List */}
        <div className="flex-1 overflow-y-auto p-2">
          {filteredModels.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              {t("model.noResults")}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredModels.map((model) => (
                <button
                  key={model.id}
                  onClick={() => onSelect(model.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-left"
                >
                  <ProviderLogo provider={model.provider} size={32} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-neutral-900 dark:text-white truncate">
                      {model.name}
                    </div>
                    <div className="text-sm text-neutral-500 truncate">
                      {getProvider(model.provider)?.name}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-neutral-900 dark:text-white">
                      {formatPricePerMillion(model.pricing.input, currency)}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {t("model.input")}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
