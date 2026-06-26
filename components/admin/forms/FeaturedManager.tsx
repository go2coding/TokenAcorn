"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminLang } from "@/contexts/AdminLangContext";

interface Model {
  id: string;
  name: string;
  provider: { name: string };
}

interface FeaturedManagerProps {
  allModels: Model[];
  featuredModelIds: string[];
}

export default function FeaturedManager({
  allModels,
  featuredModelIds: initialFeatured,
}: FeaturedManagerProps) {
  const router = useRouter();
  const { t } = useAdminLang();

  const [featuredIds, setFeaturedIds] = useState<string[]>(initialFeatured);
  const [loading, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const featuredModels = featuredIds
    .map((id) => allModels.find((m) => m.id === id))
    .filter(Boolean) as Model[];

  const availableModels = allModels.filter(
    (m) =>
      !featuredIds.includes(m.id) &&
      (m.id.toLowerCase().includes(search.toLowerCase()) ||
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.provider.name.toLowerCase().includes(search.toLowerCase()))
  );

  const addToFeatured = (modelId: string) => {
    setFeaturedIds([...featuredIds, modelId]);
  };

  const removeFromFeatured = (modelId: string) => {
    setFeaturedIds(featuredIds.filter((id) => id !== modelId));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newIds = [...featuredIds];
    [newIds[index - 1], newIds[index]] = [newIds[index], newIds[index - 1]];
    setFeaturedIds(newIds);
  };

  const moveDown = (index: number) => {
    if (index === featuredIds.length - 1) return;
    const newIds = [...featuredIds];
    [newIds[index], newIds[index + 1]] = [newIds[index + 1], newIds[index]];
    setFeaturedIds(newIds);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/featured", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelIds: featuredIds }),
      });

      if (res.ok) {
        router.refresh();
        alert(t("common.success"));
      } else {
        alert(t("common.error"));
      }
    } catch {
      alert(t("common.error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Featured Models */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
          {t("featured.featured")} ({featuredModels.length})
        </h2>
        <div className="space-y-2">
          {featuredModels.map((model, index) => (
            <div
              key={model.id}
              className="flex items-center justify-between p-3 bg-acorn-50 dark:bg-acorn-900/20 border border-acorn-200 dark:border-acorn-800 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-acorn-600 dark:text-acorn-400 w-6">
                  #{index + 1}
                </span>
                <div>
                  <p className="font-medium text-neutral-900 dark:text-white">
                    {model.name}
                  </p>
                  <p className="text-xs text-neutral-500">{model.provider.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  className="p-1.5 text-neutral-400 hover:text-neutral-600 disabled:opacity-30"
                  title="Move up"
                >
                  ▲
                </button>
                <button
                  onClick={() => moveDown(index)}
                  disabled={index === featuredIds.length - 1}
                  className="p-1.5 text-neutral-400 hover:text-neutral-600 disabled:opacity-30"
                  title="Move down"
                >
                  ▼
                </button>
                <button
                  onClick={() => removeFromFeatured(model.id)}
                  className="p-1.5 text-red-400 hover:text-red-600"
                  title={t("featured.remove")}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
          {featuredModels.length === 0 && (
            <p className="text-neutral-500 text-sm py-4 text-center">
              No featured models
            </p>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full rounded-lg bg-acorn-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-acorn-600 disabled:opacity-50 transition-colors"
        >
          {loading ? t("common.loading") : t("common.save")}
        </button>
      </div>

      {/* Available Models */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
          {t("featured.available")}
        </h2>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`${t("common.search")}...`}
          className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-700 focus:border-acorn-500 focus:outline-none focus:ring-1 focus:ring-acorn-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
        />
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {availableModels.map((model) => (
            <div
              key={model.id}
              className="flex items-center justify-between p-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:border-acorn-300 dark:hover:border-acorn-700 transition-colors"
            >
              <div>
                <p className="font-medium text-neutral-900 dark:text-white">
                  {model.name}
                </p>
                <p className="text-xs text-neutral-500">
                  {model.provider.name} · {model.id}
                </p>
              </div>
              <button
                onClick={() => addToFeatured(model.id)}
                className="text-sm text-acorn-600 hover:text-acorn-700 font-medium"
              >
                + {t("featured.add")}
              </button>
            </div>
          ))}
          {availableModels.length === 0 && (
            <p className="text-neutral-500 text-sm py-4 text-center">
              No models found
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
