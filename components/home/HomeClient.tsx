"use client";

import { useState, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Model, Provider } from "@/types/model";
import ModelFilter from "@/components/models/ModelFilter";
import ModelGrid from "@/components/models/ModelGrid";
import ModelTable from "@/components/models/ModelTable";
import MilestoneTimeline from "@/components/home/MilestoneTimeline";
import { useCurrency } from "@/contexts/CurrencyContext";
import type { MilestoneModel } from "@/lib/data";

const FAVORITES_KEY = "tokenacorn_favorites";
const VIEW_MODE_KEY = "tokenacorn_view_mode";

type ViewMode = "grid" | "table";

interface HomeClientProps {
  providers: Provider[];
  models: Model[];
  featuredIds: string[];
  milestones: MilestoneModel[];
}

export default function HomeClient({ providers, models: allModels, featuredIds, milestones }: HomeClientProps) {
  const t = useTranslations();
  const { currency } = useCurrency();

  const [selectedProvider, setSelectedProvider] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  useEffect(() => {
    const storedFavorites = localStorage.getItem(FAVORITES_KEY);
    if (storedFavorites) {
      try {
        setFavorites(JSON.parse(storedFavorites));
      } catch (e) {
        console.error("Failed to parse favorites:", e);
      }
    }
    const storedViewMode = localStorage.getItem(VIEW_MODE_KEY) as ViewMode;
    if (storedViewMode === "grid" || storedViewMode === "table") {
      setViewMode(storedViewMode);
    }
  }, []);

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem(VIEW_MODE_KEY, mode);
  };

  const handleFavoriteToggle = (modelId: string) => {
    setFavorites((prev) => {
      const newFavorites = prev.includes(modelId)
        ? prev.filter((id) => id !== modelId)
        : [...prev, modelId];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  const maxContextWindow = useMemo(() => {
    return Math.max(...allModels.map((m) => m.contextWindow));
  }, [allModels]);

  const filteredModels = useMemo(() => {
    // 默认隐藏已弃用模型
    let models = allModels.filter((m) => !m.deprecated);

    if (showFavoritesOnly) {
      models = models.filter((m) => favorites.includes(m.id));
    }

    if (selectedProvider) {
      models = models.filter((m) => m.provider === selectedProvider);
    }

    if (selectedCategory) {
      models = models.filter((m) => m.category === selectedCategory);
    }

    switch (sortBy) {
      case "featured":
        models.sort((a, b) => {
          const aIndex = featuredIds.indexOf(a.id);
          const bIndex = featuredIds.indexOf(b.id);
          const aFeatured = aIndex !== -1;
          const bFeatured = bIndex !== -1;

          if (aFeatured && bFeatured) return aIndex - bIndex;
          if (aFeatured) return -1;
          if (bFeatured) return 1;
          // 非推荐模型按发布日期降序排列（新发布的在前面）
          const aDate = a.releaseDate ?? "";
          const bDate = b.releaseDate ?? "";
          return bDate.localeCompare(aDate);
        });
        break;
      case "price-asc":
        models.sort(
          (a, b) =>
            a.pricing.input + a.pricing.output -
            (b.pricing.input + b.pricing.output)
        );
        break;
      case "price-desc":
        models.sort(
          (a, b) =>
            b.pricing.input + b.pricing.output -
            (a.pricing.input + a.pricing.output)
        );
        break;
      case "context-desc":
        models.sort((a, b) => b.contextWindow - a.contextWindow);
        break;
      case "name":
        models.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return models;
  }, [allModels, selectedProvider, selectedCategory, sortBy, showFavoritesOnly, favorites, featuredIds]);

  const handleCompare = (model: Model) => {
    setSelectedModels((prev) => {
      if (prev.includes(model.id)) {
        return prev.filter((id) => id !== model.id);
      }
      if (prev.length >= 4) {
        return prev;
      }
      return [...prev, model.id];
    });
  };

  const stats = useMemo(() => {
    const active = allModels.filter((m) => !m.deprecated);
    const cheapest = [...active].sort(
      (a, b) => a.pricing.input - b.pricing.input
    )[0];
    return {
      totalModels: active.length,
      totalProviders: providers.length,
      cheapestInput: cheapest?.pricing.input ?? 0,
    };
  }, [allModels, providers]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold text-neutral-900 dark:text-white sm:text-5xl">
          {t("home.heroTitle")}
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-neutral-600 dark:text-neutral-400">
          {t("home.heroDescription", {
            providerCount: stats.totalProviders,
            modelCount: stats.totalModels,
          })}
          <br />
          {t("home.lowestPrice", { price: stats.cheapestInput })}
        </p>
      </section>

      {/* Milestone Timeline */}
      <MilestoneTimeline models={milestones} />

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <ModelFilter
          providers={providers}
          selectedProvider={selectedProvider}
          selectedCategory={selectedCategory}
          sortBy={sortBy}
          onProviderChange={setSelectedProvider}
          onCategoryChange={setSelectedCategory}
          onSortChange={setSortBy}
        />

        <div className="flex items-center gap-4">
          {favorites.length > 0 && (
            <label className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
              <input
                type="checkbox"
                checked={showFavoritesOnly}
                onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                className="rounded border-neutral-300"
              />
              <span className="flex items-center gap-1">
                ★ {t("home.filters.favoritesOnly")} ({favorites.length})
              </span>
            </label>
          )}
        </div>
      </div>

      {/* Selected Models Bar */}
      {selectedModels.length > 0 && (
        <div className="mb-6 flex items-center justify-between rounded-lg bg-acorn-50 p-4 dark:bg-acorn-950/30">
          <span className="text-sm text-acorn-800 dark:text-acorn-200">
            {t("home.compare.selected", { count: selectedModels.length })}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedModels([])}
              className="rounded-lg px-3 py-1.5 text-sm text-acorn-700 hover:bg-acorn-100 dark:text-acorn-300 dark:hover:bg-acorn-900"
            >
              {t("home.compare.clear")}
            </button>
            <a
              href={`/compare?models=${selectedModels.join(",")}`}
              className="rounded-lg bg-acorn-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-acorn-600"
            >
              {t("home.compare.start")}
            </a>
          </div>
        </div>
      )}

      {/* Model Count & View Toggle */}
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-neutral-500">
          {t("home.modelCount", { count: filteredModels.length })}
        </span>
        <div className="flex items-center gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800">
          <button
            onClick={() => handleViewModeChange("grid")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === "grid"
                ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white"
                : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            }`}
            title={t("home.filters.viewGrid")}
          >
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="3" width="7" height="7" rx="1" strokeWidth="2" />
                <rect x="14" y="3" width="7" height="7" rx="1" strokeWidth="2" />
                <rect x="3" y="14" width="7" height="7" rx="1" strokeWidth="2" />
                <rect x="14" y="14" width="7" height="7" rx="1" strokeWidth="2" />
              </svg>
              <span className="hidden sm:inline">{t("home.filters.viewGrid")}</span>
            </span>
          </button>
          <button
            onClick={() => handleViewModeChange("table")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === "table"
                ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white"
                : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            }`}
            title={t("home.filters.viewTable")}
          >
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <line x1="3" y1="6" x2="21" y2="6" strokeWidth="2" strokeLinecap="round" />
                <line x1="3" y1="12" x2="21" y2="12" strokeWidth="2" strokeLinecap="round" />
                <line x1="3" y1="18" x2="21" y2="18" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="hidden sm:inline">{t("home.filters.viewTable")}</span>
            </span>
          </button>
        </div>
      </div>

      {/* Model Grid or Table */}
      {viewMode === "grid" ? (
        <ModelGrid
          models={filteredModels}
          providers={providers}
          currency={currency}
          selectedModels={selectedModels}
          onCompare={handleCompare}
          favorites={favorites}
          onFavoriteToggle={handleFavoriteToggle}
          maxContextWindow={maxContextWindow}
        />
      ) : (
        <ModelTable
          models={filteredModels}
          providers={providers}
          currency={currency}
          selectedModels={selectedModels}
          onCompare={handleCompare}
          favorites={favorites}
          onFavoriteToggle={handleFavoriteToggle}
        />
      )}

      {/* Price Note */}
      <div className="mt-8 rounded-lg bg-neutral-100 p-4 text-sm text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400">
        <div className="mb-3">
          <span className="font-medium">{t("home.priceLegend.title")}</span>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-full bg-green-600"></span>
              <span>≤$0.5 {t("home.priceLegend.veryLow")}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
              <span>≤$2 {t("home.priceLegend.low")}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-full bg-yellow-500"></span>
              <span>≤$5 {t("home.priceLegend.medium")}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-full bg-orange-500"></span>
              <span>≤$15 {t("home.priceLegend.high")}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-full bg-red-500"></span>
              <span>&gt;$15 {t("home.priceLegend.veryHigh")}</span>
            </span>
          </div>
        </div>
        <div>{t("home.priceNote")}</div>
      </div>
    </div>
  );
}
