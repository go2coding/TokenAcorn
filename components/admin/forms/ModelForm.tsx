"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAdminLang } from "@/contexts/AdminLangContext";

const CATEGORIES = [
  "general",
  "llm",
  "embedding",
  "image",
  "video",
  "audio",
  "moderation",
] as const;

const CAPABILITIES = [
  "text",
  "vision",
  "image-gen",
  "code",
  "function-call",
  "json-mode",
  "streaming",
  "batch",
  "fine-tuning",
  "realtime",
] as const;

const PRICING_TYPES = [
  "token_input",
  "token_output",
  "token_cached",
  "embedding",
  "per_image",
  "per_second",
  "per_minute",
  "per_character",
  "per_unit",
] as const;

interface PricingItem {
  pricingType: string;
  tier: string;
  price: string;
  unit: string;
}

interface ModelFormData {
  id: string;
  name: string;
  providerId: string;
  category: string;
  contextWindow: string;
  maxOutput: string;
  cacheRate: string;
  deprecated: boolean;
  releaseDate: string;
  knowledgeCutoff: string;
  notes: string;
  capabilities: string[];
  pricingItems: PricingItem[];
}

interface Provider {
  id: string;
  name: string;
}

interface ModelFormProps {
  providers: Provider[];
  initialData?: ModelFormData;
  isEdit?: boolean;
}

export default function ModelForm({
  providers,
  initialData,
  isEdit = false,
}: ModelFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useAdminLang();

  // 获取返回列表页时的筛选参数
  const returnParams = searchParams.toString();
  const returnUrl = returnParams ? `/admin/models?${returnParams}` : "/admin/models";

  const [formData, setFormData] = useState<ModelFormData>(
    initialData || {
      id: "",
      name: "",
      providerId: providers[0]?.id || "",
      category: "general",
      contextWindow: "",
      maxOutput: "",
      cacheRate: "",
      deprecated: false,
      releaseDate: "",
      knowledgeCutoff: "",
      notes: "",
      capabilities: ["text"],
      pricingItems: [
        { pricingType: "token_input", tier: "standard", price: "", unit: "per_million" },
        { pricingType: "token_output", tier: "standard", price: "", unit: "per_million" },
      ],
    }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        pricingItems: formData.pricingItems.filter((p) => p.price !== ""),
      };

      const url = isEdit
        ? `/api/admin/models/${initialData?.id}`
        : "/api/admin/models";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (res.ok) {
        router.push(returnUrl);
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || t("common.error"));
      }
    } catch {
      setError(t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  const handleCapabilityToggle = (cap: string) => {
    setFormData((prev) => ({
      ...prev,
      capabilities: prev.capabilities.includes(cap)
        ? prev.capabilities.filter((c) => c !== cap)
        : [...prev.capabilities, cap],
    }));
  };

  const handlePricingChange = (
    index: number,
    field: keyof PricingItem,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      pricingItems: prev.pricingItems.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addPricingItem = () => {
    setFormData((prev) => ({
      ...prev,
      pricingItems: [
        ...prev.pricingItems,
        { pricingType: "token_input", tier: "standard", price: "", unit: "per_million" },
      ],
    }));
  };

  const removePricingItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      pricingItems: prev.pricingItems.filter((_, i) => i !== index),
    }));
  };

  const inputClass =
    "w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-700 focus:border-acorn-500 focus:outline-none focus:ring-1 focus:ring-acorn-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300";

  const selectClass =
    "rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700 focus:border-acorn-500 focus:outline-none focus:ring-1 focus:ring-acorn-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300";

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
      {/* Basic Info */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white border-b border-neutral-200 dark:border-neutral-800 pb-2">
          基本信息 / Basic Info
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              {t("model.id")} *
            </label>
            <input
              type="text"
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              className={inputClass}
              placeholder="e.g., gpt-4o, claude-3-5-sonnet"
              required
              disabled={isEdit}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              {t("model.name")} *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className={inputClass}
              placeholder="e.g., GPT-4o, Claude 3.5 Sonnet"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              {t("model.provider")} *
            </label>
            <select
              value={formData.providerId}
              onChange={(e) =>
                setFormData({ ...formData, providerId: e.target.value })
              }
              className={`${selectClass} w-full`}
              required
            >
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              {t("model.category")}
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className={`${selectClass} w-full`}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {t(`category.${cat}`)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              {t("model.contextWindow")}
            </label>
            <input
              type="number"
              value={formData.contextWindow}
              onChange={(e) =>
                setFormData({ ...formData, contextWindow: e.target.value })
              }
              className={inputClass}
              placeholder="e.g., 128000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              {t("model.maxOutput")}
            </label>
            <input
              type="number"
              value={formData.maxOutput}
              onChange={(e) =>
                setFormData({ ...formData, maxOutput: e.target.value })
              }
              className={inputClass}
              placeholder="e.g., 16384"
            />
          </div>



          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              {t("model.releaseDate")}
            </label>
            <input
              type="date"
              value={formData.releaseDate}
              onChange={(e) =>
                setFormData({ ...formData, releaseDate: e.target.value })
              }
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              {t("model.knowledgeCutoff")}
            </label>
            <input
              type="date"
              value={formData.knowledgeCutoff}
              onChange={(e) =>
                setFormData({ ...formData, knowledgeCutoff: e.target.value })
              }
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              {t("model.cacheRate")}
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.cacheRate}
              onChange={(e) =>
                setFormData({ ...formData, cacheRate: e.target.value })
              }
              className={inputClass}
              placeholder="e.g., 90"
            />
          </div>
          
          <div className="flex items-center gap-3 pt-7">
            <input
              type="checkbox"
              id="deprecated"
              checked={formData.deprecated}
              onChange={(e) =>
                setFormData({ ...formData, deprecated: e.target.checked })
              }
              className="h-4 w-4 rounded border-neutral-300 text-acorn-500 focus:ring-acorn-500"
            />
            <label
              htmlFor="deprecated"
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              {t("model.deprecated")}
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            {t("model.notes")}
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className={`${inputClass} min-h-[80px]`}
            placeholder="备注信息..."
          />
        </div>
      </section>

      {/* Capabilities */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white border-b border-neutral-200 dark:border-neutral-800 pb-2">
          {t("model.capabilities")}
        </h2>

        <div className="flex flex-wrap gap-3">
          {CAPABILITIES.map((cap) => (
            <label
              key={cap}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${
                formData.capabilities.includes(cap)
                  ? "bg-acorn-50 border-acorn-500 text-acorn-700 dark:bg-acorn-900/20 dark:text-acorn-400"
                  : "bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400"
              }`}
            >
              <input
                type="checkbox"
                checked={formData.capabilities.includes(cap)}
                onChange={() => handleCapabilityToggle(cap)}
                className="sr-only"
              />
              <span className="text-sm font-medium">{t(`capability.${cap}`)}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
            {t("model.pricing")}
          </h2>
          <button
            type="button"
            onClick={addPricingItem}
            className="text-sm text-acorn-600 hover:text-acorn-700 font-medium"
          >
            + {t("model.addPricing")}
          </button>
        </div>

        <div className="space-y-3">
          {formData.pricingItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg"
            >
              <select
                value={item.pricingType}
                onChange={(e) =>
                  handlePricingChange(index, "pricingType", e.target.value)
                }
                className={selectClass}
              >
                {PRICING_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {t(`pricingType.${type}`)}
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={item.tier}
                onChange={(e) =>
                  handlePricingChange(index, "tier", e.target.value)
                }
                className={`${selectClass} w-28`}
                placeholder="standard"
              />

              <div className="flex items-center gap-1">
                <span className="text-neutral-500">$</span>
                <input
                  type="number"
                  step="0.0001"
                  value={item.price}
                  onChange={(e) =>
                    handlePricingChange(index, "price", e.target.value)
                  }
                  className={`${selectClass} w-32`}
                  placeholder="0.00"
                />
              </div>

              <select
                value={item.unit}
                onChange={(e) =>
                  handlePricingChange(index, "unit", e.target.value)
                }
                className={selectClass}
              >
                <option value="per_million">per 1M tokens</option>
                <option value="per_unit">per unit</option>
                <option value="per_second">per second</option>
                <option value="per_minute">per minute</option>
              </select>

              <button
                type="button"
                onClick={() => removePricingItem(index)}
                className="text-red-500 hover:text-red-600 p-2"
                title={t("model.removePricing")}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </section>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-acorn-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-acorn-600 disabled:opacity-50 transition-colors"
        >
          {loading ? t("common.loading") : t("common.save")}
        </button>
        <button
          type="button"
          onClick={() => router.push(returnUrl)}
          className="rounded-lg border border-neutral-200 bg-white px-6 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 transition-colors"
        >
          {t("common.cancel")}
        </button>
      </div>
    </form>
  );
}
