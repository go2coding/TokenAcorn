"use client";

import { useTranslations } from "next-intl";
import { ModelCategory } from "@/types/model";
import { Provider } from "@/types/model";

interface ModelFilterProps {
  providers: Provider[];
  selectedProvider: string;
  selectedCategory: string;
  sortBy: string;
  onProviderChange: (provider: string) => void;
  onCategoryChange: (category: string) => void;
  onSortChange: (sort: string) => void;
}

const categories: ModelCategory[] = [
  "general",
  "llm",
  "embedding",
  "image",
  "video",
  "audio",
  "moderation",
];

export default function ModelFilter({
  providers,
  selectedProvider,
  selectedCategory,
  sortBy,
  onProviderChange,
  onCategoryChange,
  onSortChange,
}: ModelFilterProps) {
  const t = useTranslations();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={selectedProvider}
        onChange={(e) => onProviderChange(e.target.value)}
        className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 focus:border-acorn-500 focus:outline-none focus:ring-1 focus:ring-acorn-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
      >
        <option value="">{t("home.filters.allProviders")}</option>
        {providers.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      <select
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 focus:border-acorn-500 focus:outline-none focus:ring-1 focus:ring-acorn-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
      >
        <option value="">{t("home.filters.allCategories")}</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {t(`category.${cat}`)}
          </option>
        ))}
      </select>

      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 focus:border-acorn-500 focus:outline-none focus:ring-1 focus:ring-acorn-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
      >
        <option value="featured">{t("home.filters.sortFeatured")}</option>
        <option value="price-asc">{t("home.filters.sortPriceAsc")}</option>
        <option value="price-desc">{t("home.filters.sortPriceDesc")}</option>
        <option value="context-desc">{t("home.filters.sortContextDesc")}</option>
        <option value="name">{t("home.filters.sortName")}</option>
      </select>
    </div>
  );
}
