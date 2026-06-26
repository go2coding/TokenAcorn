"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Model, Provider, CAPABILITY_ICONS, VISIBLE_CAPABILITIES } from "@/types/model";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatPricePerMillion } from "@/lib/currency";
import { formatNumber } from "@/lib/utils";
import ProviderLogo from "@/components/ui/ProviderLogo";
import CompareTwoModels from "./CompareTwoModels";
import CompareMultiModels from "./CompareMultiModels";
import ModelSelector from "./ModelSelector";

interface CompareClientProps {
  providers: Provider[];
  allModels: Model[];
}

export default function CompareClient({ providers, allModels }: CompareClientProps) {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const { currency } = useCurrency();

  // 从 URL 参数获取初始选中的模型
  const initialModels = searchParams.get("models")?.split(",").filter(Boolean) || [];
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>(initialModels);
  const [showSelector, setShowSelector] = useState(false);

  const selectedModels = useMemo(() => {
    return selectedModelIds
      .map((id) => allModels.find((m) => m.id === id))
      .filter((m): m is Model => m !== undefined);
  }, [selectedModelIds, allModels]);

  const getProvider = (providerId: string) => {
    return providers.find((p) => p.id === providerId);
  };

  const handleAddModel = (modelId: string) => {
    if (selectedModelIds.length < 4 && !selectedModelIds.includes(modelId)) {
      setSelectedModelIds([...selectedModelIds, modelId]);
    }
    setShowSelector(false);
  };

  const handleRemoveModel = (modelId: string) => {
    setSelectedModelIds(selectedModelIds.filter((id) => id !== modelId));
  };

  const handleClearAll = () => {
    setSelectedModelIds([]);
  };

  // 推荐模型：排除已选的，按价格排序取前3个
  const recommendedModels = useMemo(() => {
    return allModels
      .filter((m) => !selectedModelIds.includes(m.id))
      .sort((a, b) => a.pricing.input - b.pricing.input)
      .slice(0, 3);
  }, [allModels, selectedModelIds]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
          {t("compare.title")}
        </h1>
        <div className="flex items-center gap-3">
          {selectedModels.length > 0 && (
            <button
              onClick={handleClearAll}
              className="rounded-lg px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
            >
              {t("compare.clearAll")}
            </button>
          )}
          {selectedModels.length < 4 && (
            <button
              onClick={() => setShowSelector(true)}
              className="rounded-lg bg-acorn-500 px-4 py-2 text-sm font-medium text-white hover:bg-acorn-600"
            >
              + {t("compare.addModel")}
            </button>
          )}
        </div>
      </div>

      {/* Model Selector Modal */}
      {showSelector && (
        <ModelSelector
          models={allModels}
          providers={providers}
          selectedIds={selectedModelIds}
          onSelect={handleAddModel}
          onClose={() => setShowSelector(false)}
        />
      )}

      {/* Empty State */}
      {selectedModels.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-neutral-300 p-12 text-center dark:border-neutral-700">
          <div className="text-4xl mb-4">📊</div>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
            {t("compare.emptyTitle")}
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 mb-6">
            {t("compare.emptyDescription")}
          </p>
          <button
            onClick={() => setShowSelector(true)}
            className="rounded-lg bg-acorn-500 px-6 py-3 text-sm font-medium text-white hover:bg-acorn-600"
          >
            + {t("compare.addModel")}
          </button>

          {/* Quick Recommendations */}
          <div className="mt-8">
            <p className="text-sm text-neutral-500 mb-4">{t("compare.quickStart")}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {recommendedModels.slice(0, 6).map((model) => (
                <button
                  key={model.id}
                  onClick={() => handleAddModel(model.id)}
                  className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm hover:border-acorn-500 hover:bg-acorn-50 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-acorn-500"
                >
                  <ProviderLogo provider={model.provider} size={16} />
                  <span>{model.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 1 Model - Show add more prompt */}
      {selectedModels.length === 1 && (
        <div className="space-y-6">
          {/* Selected Model Card */}
          <div className="flex justify-center">
            <div className="relative rounded-xl border border-neutral-200 bg-white p-6 text-center dark:border-neutral-700 dark:bg-neutral-900 w-64">
              <button
                onClick={() => handleRemoveModel(selectedModels[0].id)}
                className="absolute top-2 right-2 p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                ✕
              </button>
              <ProviderLogo provider={selectedModels[0].provider} size={48} />
              <h3 className="mt-3 font-semibold text-neutral-900 dark:text-white">
                {selectedModels[0].name}
              </h3>
              <p className="text-sm text-neutral-500">
                {getProvider(selectedModels[0].provider)?.name}
              </p>
            </div>
          </div>

          {/* Add More Prompt */}
          <div className="text-center">
            <p className="text-neutral-500 mb-4">{t("compare.addMorePrompt")}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {recommendedModels.map((model) => (
                <button
                  key={model.id}
                  onClick={() => handleAddModel(model.id)}
                  className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm hover:border-acorn-500 hover:bg-acorn-50 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-acorn-500"
                >
                  <ProviderLogo provider={model.provider} size={16} />
                  <span>{model.name}</span>
                  <span className="text-neutral-400">
                    {formatPricePerMillion(model.pricing.input, currency)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2 Models - Detailed Comparison */}
      {selectedModels.length === 2 && (
        <CompareTwoModels
          models={selectedModels}
          providers={providers}
          currency={currency}
          onRemove={handleRemoveModel}
          recommendedModels={recommendedModels}
          onAddModel={handleAddModel}
        />
      )}

      {/* 3-4 Models - Table Comparison */}
      {selectedModels.length >= 3 && (
        <CompareMultiModels
          models={selectedModels}
          providers={providers}
          currency={currency}
          onRemove={handleRemoveModel}
        />
      )}
    </div>
  );
}
