"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAdminLang } from "@/contexts/AdminLangContext";

interface Model {
  id: string;
  name: string;
  providerId: string;
  category: string;
  contextWindow: number | null;
  maxOutput: number | null;
  deprecated: boolean;
  provider: { name: string };
  capabilities: { capability: string }[];
  pricingItems: { pricingType: string; price: number }[];
  featured: { modelId: string } | null;
}

interface ModelTableProps {
  models: Model[];
}

export default function ModelTable({ models }: ModelTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useAdminLang();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("");

  // 从 URL 读取筛选参数
  useEffect(() => {
    const providerFromUrl = searchParams.get("provider") || "";
    setSelectedProvider(providerFromUrl);
  }, [searchParams]);

  // 获取所有唯一的厂商列表
  const providers = Array.from(
    new Map(models.map((m) => [m.providerId, { id: m.providerId, name: m.provider.name }])).values()
  ).sort((a, b) => a.name.localeCompare(b.name));

  const handleDelete = async (id: string) => {
    if (!confirm(t("common.confirmDelete"))) return;

    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/models/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert(t("common.error"));
      }
    } catch {
      alert(t("common.error"));
    } finally {
      setDeleting(null);
    }
  };

  const filteredModels = models.filter(
    (m) => {
      const matchesSearch =
        m.id.toLowerCase().includes(search.toLowerCase()) ||
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.provider.name.toLowerCase().includes(search.toLowerCase());
      const matchesProvider =
        selectedProvider === "" || m.providerId === selectedProvider;
      return matchesSearch && matchesProvider;
    }
  );

  const formatNumber = (n: number | null) => {
    if (!n) return "-";
    return n >= 1000000
      ? `${(n / 1000000).toFixed(1)}M`
      : n >= 1000
        ? `${(n / 1000).toFixed(0)}K`
        : n.toString();
  };

  const getInputPrice = (model: Model) => {
    const input = model.pricingItems.find((p) => p.pricingType === "token_input");
    if (input) return `$${input.price}`;
    const embedding = model.pricingItems.find((p) => p.pricingType === "embedding");
    if (embedding) return `$${embedding.price}`;
    return "-";
  };

  const getOutputPrice = (model: Model) => {
    const output = model.pricingItems.find((p) => p.pricingType === "token_output");
    return output ? `$${output.price}` : "-";
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={selectedProvider}
          onChange={(e) => {
            const value = e.target.value;
            setSelectedProvider(value);
            // 更新 URL 参数
            const params = new URLSearchParams(searchParams.toString());
            if (value) {
              params.set("provider", value);
            } else {
              params.delete("provider");
            }
            router.push(`/admin/models?${params.toString()}`);
          }}
          className="rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700 focus:border-acorn-500 focus:outline-none focus:ring-1 focus:ring-acorn-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
        >
          <option value="">{t("filters.allProviders")}</option>
          {providers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`${t("common.search")}...`}
          className="w-full max-w-md rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-700 focus:border-acorn-500 focus:outline-none focus:ring-1 focus:ring-acorn-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
              <th className="px-4 py-3 text-left font-medium text-neutral-500">
                {t("model.name")}
              </th>
              <th className="px-4 py-3 text-left font-medium text-neutral-500">
                {t("model.id")}
              </th>
              <th className="px-4 py-3 text-left font-medium text-neutral-500">
                {t("model.provider")}
              </th>
              <th className="px-4 py-3 text-left font-medium text-neutral-500">
                {t("model.category")}
              </th>
              <th className="px-4 py-3 text-right font-medium text-neutral-500">
                Context
              </th>
              <th className="px-4 py-3 text-right font-medium text-neutral-500">
                Input $/M
              </th>
              <th className="px-4 py-3 text-right font-medium text-neutral-500">
                Output $/M
              </th>
              <th className="px-4 py-3 text-right font-medium text-neutral-500">
                {t("common.actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredModels.map((model) => (
              <tr
                key={model.id}
                className={`border-b border-neutral-100 dark:border-neutral-800 last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 ${
                  model.deprecated ? "opacity-50" : ""
                }`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-neutral-900 dark:text-white">
                      {model.name}
                    </span>
                    {model.featured && (
                      <span className="text-yellow-500" title="Featured">
                        ⭐
                      </span>
                    )}
                    {model.deprecated && (
                      <span className="text-xs bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 px-1.5 py-0.5 rounded">
                        deprecated
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-neutral-600 dark:text-neutral-400">
                  {model.id}
                </td>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">
                  {model.provider.name}
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full">
                    {t(`category.${model.category}`)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-neutral-600 dark:text-neutral-400">
                  {formatNumber(model.contextWindow)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-neutral-600 dark:text-neutral-400">
                  {getInputPrice(model)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-neutral-600 dark:text-neutral-400">
                  {getOutputPrice(model)}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/models/${model.id}/edit?${searchParams.toString()}`}
                      className="rounded-md px-3 py-1.5 text-xs font-medium text-acorn-600 hover:bg-acorn-50 dark:hover:bg-acorn-900/20 transition-colors"
                    >
                      {t("common.edit")}
                    </Link>
                    <button
                      onClick={() => handleDelete(model.id)}
                      disabled={deleting === model.id}
                      className="rounded-md px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-colors"
                    >
                      {deleting === model.id
                        ? t("common.loading")
                        : t("common.delete")}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredModels.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-8 text-center text-neutral-500"
                >
                  No models found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-neutral-500">
        共 {filteredModels.length} 个模型 / {filteredModels.length} models total
      </p>
    </div>
  );
}
