"use client";

import { useTranslations } from "next-intl";
import { Model, Provider } from "@/types/model";
import { Currency } from "@/lib/currency";
import ModelCard from "./ModelCard";

interface ModelGridProps {
  models: Model[];
  providers: Provider[];
  currency: Currency;
  selectedModels: string[];
  onCompare: (model: Model) => void;
  favorites: string[];
  onFavoriteToggle: (modelId: string) => void;
  maxContextWindow: number;
}

export default function ModelGrid({
  models,
  providers,
  currency,
  selectedModels,
  onCompare,
  favorites,
  onFavoriteToggle,
  maxContextWindow,
}: ModelGridProps) {
  const t = useTranslations();

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
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {models.map((model) => {
        const provider = getProvider(model.provider);
        return (
          <ModelCard
            key={model.id}
            model={model}
            providerName={provider?.name ?? model.provider}
            providerWebsite={provider?.website}
            currency={currency}
            onCompare={onCompare}
            isSelected={selectedModels.includes(model.id)}
            isFavorite={favorites.includes(model.id)}
            onFavoriteToggle={onFavoriteToggle}
            maxContextWindow={maxContextWindow}
          />
        );
      })}
    </div>
  );
}
