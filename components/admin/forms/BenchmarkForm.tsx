"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminLang } from "@/contexts/AdminLangContext";

// 能力维度选项
const categoryOptions = [
  { value: "general", label: "通用 / General", labelEn: "General" },
  { value: "reasoning", label: "推理能力 / Reasoning", labelEn: "Reasoning" },
  { value: "coding", label: "代码能力 / Coding", labelEn: "Coding" },
  { value: "math", label: "数学能力 / Math", labelEn: "Math" },
  { value: "multilingual", label: "多语言能力 / Multilingual", labelEn: "Multilingual" },
  { value: "long-context", label: "长文本能力 / Long Context", labelEn: "Long Context" },
  { value: "comprehensive", label: "综合能力 / Comprehensive", labelEn: "Comprehensive" },
];

interface BenchmarkResult {
  id: string;
  modelName: string;
  provider: string;
  score: number;
  rank: number;
}

interface BenchmarkFormData {
  id?: string;
  name: string;
  description: string;
  category: string;
  sortOrder: number;
  results: BenchmarkResult[];
}

interface BenchmarkFormProps {
  initialData?: BenchmarkFormData;
  isEdit?: boolean;
}

export default function BenchmarkForm({
  initialData,
  isEdit = false,
}: BenchmarkFormProps) {
  const router = useRouter();
  const { t } = useAdminLang();

  const [formData, setFormData] = useState<BenchmarkFormData>(
    initialData || {
      name: "",
      description: "",
      category: "general",
      sortOrder: 0,
      results: [],
    }
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Result form state
  const [newResult, setNewResult] = useState({
    modelName: "",
    provider: "",
    score: "",
    rank: "",
  });
  const [editingResult, setEditingResult] = useState<BenchmarkResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const url = isEdit
        ? `/api/admin/benchmarks/${formData.id}`
        : "/api/admin/benchmarks";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          category: formData.category,
          sortOrder: formData.sortOrder,
        }),
      });

      if (res.ok) {
        router.push("/admin/benchmarks");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || t("common.error"));
      }
    } catch {
      setError(t("common.error"));
    } finally {
      setSaving(false);
    }
  };

  const handleAddResult = async () => {
    if (!newResult.modelName || !newResult.provider || !newResult.score) {
      alert("请填写完整的测试结果信息");
      return;
    }

    try {
      const res = await fetch(`/api/admin/benchmarks/${formData.id}/results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelName: newResult.modelName,
          provider: newResult.provider,
          score: parseFloat(newResult.score),
          rank: newResult.rank ? parseInt(newResult.rank) : 0,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        setFormData((prev) => ({
          ...prev,
          results: [...prev.results, result],
        }));
        setNewResult({ modelName: "", provider: "", score: "", rank: "" });
      } else {
        alert(t("common.error"));
      }
    } catch {
      alert(t("common.error"));
    }
  };

  const handleUpdateResult = async () => {
    if (!editingResult) return;

    try {
      const res = await fetch(`/api/admin/benchmarks/${formData.id}/results`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resultId: editingResult.id,
          modelName: editingResult.modelName,
          provider: editingResult.provider,
          score: editingResult.score,
          rank: editingResult.rank,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setFormData((prev) => ({
          ...prev,
          results: prev.results.map((r) =>
            r.id === updated.id ? updated : r
          ),
        }));
        setEditingResult(null);
      } else {
        alert(t("common.error"));
      }
    } catch {
      alert(t("common.error"));
    }
  };

  const handleDeleteResult = async (resultId: string) => {
    if (!confirm("确定要删除这个结果吗？")) return;

    try {
      const res = await fetch(
        `/api/admin/benchmarks/${formData.id}/results?resultId=${resultId}`,
        {
          method: "DELETE",
        }
      );

      if (res.ok) {
        setFormData((prev) => ({
          ...prev,
          results: prev.results.filter((r) => r.id !== resultId),
        }));
      } else {
        alert(t("common.error"));
      }
    } catch {
      alert(t("common.error"));
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              名称 / Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700 focus:border-acorn-500 focus:outline-none focus:ring-1 focus:ring-acorn-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
              placeholder="例如: GPQA"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              能力维度 / Category <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, category: e.target.value }))
              }
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700 focus:border-acorn-500 focus:outline-none focus:ring-1 focus:ring-acorn-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              排序 / Sort Order
            </label>
            <input
              type="number"
              value={formData.sortOrder}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  sortOrder: parseInt(e.target.value) || 0,
                }))
              }
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700 focus:border-acorn-500 focus:outline-none focus:ring-1 focus:ring-acorn-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
              placeholder="0"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            描述 / Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            rows={3}
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700 focus:border-acorn-500 focus:outline-none focus:ring-1 focus:ring-acorn-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
            placeholder="输入基准测试描述..."
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-acorn-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-acorn-600 disabled:opacity-50 dark:bg-acorn-600 dark:hover:bg-acorn-500"
          >
            {saving ? t("common.saving") : t("common.save")}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/benchmarks")}
            className="rounded-lg bg-neutral-100 px-6 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            {t("common.cancel")}
          </button>
        </div>
      </form>

      {isEdit && (
        <div className="space-y-4 border-t border-neutral-200 pt-8 dark:border-neutral-800">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
            测试结果 / Results
          </h2>

          {/* Add new result */}
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">
              添加结果 / Add Result
            </h3>
            <div className="grid gap-3 md:grid-cols-5">
              <input
                type="text"
                placeholder="模型名称"
                value={newResult.modelName}
                onChange={(e) =>
                  setNewResult((prev) => ({ ...prev, modelName: e.target.value }))
                }
                className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
              />
              <input
                type="text"
                placeholder="厂商"
                value={newResult.provider}
                onChange={(e) =>
                  setNewResult((prev) => ({ ...prev, provider: e.target.value }))
                }
                className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
              />
              <input
                type="number"
                step="0.01"
                placeholder="分数"
                value={newResult.score}
                onChange={(e) =>
                  setNewResult((prev) => ({ ...prev, score: e.target.value }))
                }
                className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
              />
              <input
                type="number"
                placeholder="排名"
                value={newResult.rank}
                onChange={(e) =>
                  setNewResult((prev) => ({ ...prev, rank: e.target.value }))
                }
                className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
              />
              <button
                type="button"
                onClick={handleAddResult}
                className="rounded-lg bg-acorn-500 px-4 py-2 text-sm font-medium text-white hover:bg-acorn-600 dark:bg-acorn-600 dark:hover:bg-acorn-500"
              >
                添加
              </button>
            </div>
          </div>

          {/* Results list */}
          <div className="space-y-2">
            {formData.results.length === 0 ? (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                暂无测试结果
              </p>
            ) : (
              formData.results
                .sort((a, b) => a.rank - b.rank || b.score - a.score)
                .map((result) => (
                  <div
                    key={result.id}
                    className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900"
                  >
                    {editingResult?.id === result.id ? (
                      <>
                        <input
                          type="text"
                          value={editingResult.modelName}
                          onChange={(e) =>
                            setEditingResult((prev) =>
                              prev ? { ...prev, modelName: e.target.value } : null
                            )
                          }
                          className="flex-1 rounded border border-neutral-200 px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                        />
                        <input
                          type="text"
                          value={editingResult.provider}
                          onChange={(e) =>
                            setEditingResult((prev) =>
                              prev ? { ...prev, provider: e.target.value } : null
                            )
                          }
                          className="w-24 rounded border border-neutral-200 px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                        />
                        <input
                          type="number"
                          step="0.01"
                          value={editingResult.score}
                          onChange={(e) =>
                            setEditingResult((prev) =>
                              prev
                                ? { ...prev, score: parseFloat(e.target.value) }
                                : null
                            )
                          }
                          className="w-20 rounded border border-neutral-200 px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                        />
                        <input
                          type="number"
                          value={editingResult.rank}
                          onChange={(e) =>
                            setEditingResult((prev) =>
                              prev
                                ? { ...prev, rank: parseInt(e.target.value) }
                                : null
                            )
                          }
                          className="w-16 rounded border border-neutral-200 px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                        />
                        <button
                          onClick={handleUpdateResult}
                          className="rounded bg-acorn-500 px-3 py-1 text-xs text-white hover:bg-acorn-600"
                        >
                          保存
                        </button>
                        <button
                          onClick={() => setEditingResult(null)}
                          className="rounded bg-neutral-200 px-3 py-1 text-xs text-neutral-700 hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-300"
                        >
                          取消
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="w-8 text-sm text-neutral-400">
                          #{result.rank}
                        </span>
                        <span className="flex-1 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                          {result.modelName}
                        </span>
                        <span className="w-24 text-sm text-neutral-500 dark:text-neutral-400">
                          {result.provider}
                        </span>
                        <span className="w-20 text-sm font-semibold text-acorn-500">
                          {result.score.toFixed(2)}
                        </span>
                        <button
                          onClick={() => setEditingResult(result)}
                          className="rounded bg-neutral-100 px-3 py-1 text-xs text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => handleDeleteResult(result.id)}
                          className="rounded bg-red-50 px-3 py-1 text-xs text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400"
                        >
                          删除
                        </button>
                      </>
                    )}
                  </div>
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
