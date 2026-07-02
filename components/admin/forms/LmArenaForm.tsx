"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminLang } from "@/contexts/AdminLangContext";

interface LmArenaEntry {
  id: string;
  rank: number;
  modelKey: string | null;
  modelName: string;
  rating: number;
  votes: number;
  organization: string;
  license: string | null;
  inputPrice: number | null;
  outputPrice: number | null;
  contextLength: number | null;
}

interface LmArenaFormData {
  id?: string;
  key: string;
  title: string;
  description: string;
  category: string;
  sourceUrl: string;
  sortOrder: number;
  entries?: LmArenaEntry[];
}

interface LmArenaFormProps {
  initialData?: LmArenaFormData;
  isEdit?: boolean;
}

const categoryOptions = [
  { value: "llm", label: "大语言模型 / LLM" },
  { value: "image", label: "图像生成 / Image" },
  { value: "video", label: "视频生成 / Video" },
  { value: "general", label: "通用 / General" },
];

function emptyEntry(): Record<string, string> {
  return {
    rank: "",
    modelKey: "",
    modelName: "",
    rating: "",
    votes: "",
    organization: "",
    license: "",
    inputPrice: "",
    outputPrice: "",
    contextLength: "",
  };
}

export default function LmArenaForm({
  initialData,
  isEdit = false,
}: LmArenaFormProps) {
  const router = useRouter();
  const { t } = useAdminLang();

  const [formData, setFormData] = useState<LmArenaFormData>(
    initialData || {
      key: "",
      title: "",
      description: "",
      category: "llm",
      sourceUrl: "",
      sortOrder: 0,
    }
  );

  const [entries, setEntries] = useState<LmArenaEntry[]>(initialData?.entries || []);
  const [newEntry, setNewEntry] = useState<Record<string, string>>(emptyEntry());
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editEntry, setEditEntry] = useState<Record<string, string>>(emptyEntry());

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const url = isEdit
        ? `/api/admin/lmarena/${formData.id}`
        : "/api/admin/lmarena";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: formData.key,
          title: formData.title,
          description: formData.description || null,
          category: formData.category,
          sourceUrl: formData.sourceUrl || null,
          sortOrder: formData.sortOrder,
        }),
      });

      if (res.ok) {
        router.push("/admin/lmarena");
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

  const handleAddEntry = async () => {
    if (!newEntry.modelName || !newEntry.organization || !formData.id) {
      alert("请填写模型名称和厂商");
      return;
    }

    try {
      const res = await fetch(`/api/admin/lmarena/${formData.id}/entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEntry),
      });

      if (res.ok) {
        const entry = await res.json();
        setEntries((prev) => [...prev, entry]);
        setNewEntry(emptyEntry());
      } else {
        alert(t("common.error"));
      }
    } catch {
      alert(t("common.error"));
    }
  };

  const startEditEntry = (entry: LmArenaEntry) => {
    setEditingEntryId(entry.id);
    setEditEntry({
      rank: entry.rank.toString(),
      modelKey: entry.modelKey || "",
      modelName: entry.modelName,
      rating: entry.rating.toString(),
      votes: entry.votes.toString(),
      organization: entry.organization,
      license: entry.license || "",
      inputPrice: entry.inputPrice?.toString() || "",
      outputPrice: entry.outputPrice?.toString() || "",
      contextLength: entry.contextLength?.toString() || "",
    });
  };

  const handleUpdateEntry = async () => {
    if (!editingEntryId || !formData.id) return;

    try {
      const res = await fetch(`/api/admin/lmarena/${formData.id}/entries`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId: editingEntryId, ...editEntry }),
      });

      if (res.ok) {
        const updated = await res.json();
        setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
        setEditingEntryId(null);
        setEditEntry(emptyEntry());
      } else {
        alert(t("common.error"));
      }
    } catch {
      alert(t("common.error"));
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm(t("common.confirmDelete"))) return;
    if (!formData.id) return;

    try {
      const res = await fetch(
        `/api/admin/lmarena/${formData.id}/entries?entryId=${entryId}`,
        { method: "DELETE" }
      );

      if (res.ok) {
        setEntries((prev) => prev.filter((e) => e.id !== entryId));
      } else {
        alert(t("common.error"));
      }
    } catch {
      alert(t("common.error"));
    }
  };

  const renderEntryRow = (entry: LmArenaEntry) => {
    const isEditing = editingEntryId === entry.id;

    if (isEditing) {
      return (
        <tr key={entry.id} className="bg-acorn-50/30 dark:bg-acorn-900/10">
          {[
            { key: "rank", value: editEntry.rank },
            { key: "modelKey", value: editEntry.modelKey },
            { key: "modelName", value: editEntry.modelName },
            { key: "organization", value: editEntry.organization },
            { key: "rating", value: editEntry.rating },
            { key: "votes", value: editEntry.votes },
            { key: "license", value: editEntry.license },
            { key: "inputPrice", value: editEntry.inputPrice },
            { key: "outputPrice", value: editEntry.outputPrice },
            { key: "contextLength", value: editEntry.contextLength },
          ].map((field) => (
            <td key={field.key} className="px-2 py-2">
              <input
                type="text"
                value={field.value}
                onChange={(e) =>
                  setEditEntry((prev) => ({ ...prev, [field.key]: e.target.value }))
                }
                className="w-full rounded border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-700 focus:border-acorn-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
              />
            </td>
          ))}
          <td className="px-2 py-2">
            <div className="flex items-center gap-1">
              <button
                onClick={handleUpdateEntry}
                className="rounded bg-acorn-500 px-2 py-1 text-xs font-medium text-white hover:bg-acorn-600"
              >
                {t("common.save")}
              </button>
              <button
                onClick={() => {
                  setEditingEntryId(null);
                  setEditEntry(emptyEntry());
                }}
                className="rounded bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              >
                {t("common.cancel")}
              </button>
            </div>
          </td>
        </tr>
      );
    }

    return (
      <tr
        key={entry.id}
        className="border-b border-neutral-100 bg-white hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-900"
      >
        <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{entry.rank}</td>
        <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{entry.modelKey || "-"}</td>
        <td className="px-4 py-3 font-medium text-neutral-900 dark:text-white">{entry.modelName}</td>
        <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{entry.organization}</td>
        <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{entry.rating}</td>
        <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{entry.votes}</td>
        <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{entry.license || "-"}</td>
        <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{entry.inputPrice ?? "-"}</td>
        <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{entry.outputPrice ?? "-"}</td>
        <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{entry.contextLength ?? "-"}</td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => startEditEntry(entry)}
              className="rounded-md bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              {t("common.edit")}
            </button>
            <button
              onClick={() => handleDeleteEntry(entry.id)}
              className="rounded-md bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
            >
              {t("common.delete")}
            </button>
          </div>
        </td>
      </tr>
    );
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
              {t("lmarena.key")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.key}
              onChange={(e) => setFormData((prev) => ({ ...prev, key: e.target.value }))}
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700 focus:border-acorn-500 focus:outline-none focus:ring-1 focus:ring-acorn-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
              placeholder="agent"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {t("lmarena.titleLabel")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700 focus:border-acorn-500 focus:outline-none focus:ring-1 focus:ring-acorn-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
              placeholder="LM Arena Leaderboard"
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {t("lmarena.category")}
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700 focus:border-acorn-500 focus:outline-none focus:ring-1 focus:ring-acorn-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {t("lmarena.sortOrder")}
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
            {t("lmarena.sourceUrl")}
          </label>
          <input
            type="url"
            value={formData.sourceUrl}
            onChange={(e) => setFormData((prev) => ({ ...prev, sourceUrl: e.target.value }))}
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700 focus:border-acorn-500 focus:outline-none focus:ring-1 focus:ring-acorn-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
            placeholder="https://arena.ai/leaderboard"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {t("lmarena.description")}
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700 focus:border-acorn-500 focus:outline-none focus:ring-1 focus:ring-acorn-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-acorn-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-acorn-600 disabled:opacity-50 dark:bg-acorn-600 dark:hover:bg-acorn-500"
          >
            {saving ? t("common.loading") : t("common.save")}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/lmarena")}
            className="rounded-lg bg-neutral-100 px-6 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            {t("common.cancel")}
          </button>
        </div>
      </form>

      {isEdit && formData.id && (
        <div className="space-y-4 border-t border-neutral-200 pt-8 dark:border-neutral-800">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
            {t("lmarena.entries")}
          </h2>

          {/* Add entry form */}
          <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 dark:bg-neutral-900">
                <tr>
                  {[
                    "rank",
                    "modelKey",
                    "modelName",
                    "organization",
                    "rating",
                    "votes",
                    "license",
                    "inputPrice",
                    "outputPrice",
                    "contextLength",
                  ].map((key) => (
                    <th
                      key={key}
                      className="px-2 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400"
                    >
                      {t(`lmarena.${key}`)}
                    </th>
                  ))}
                  <th className="px-2 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400">
                    {t("common.actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white dark:bg-neutral-950">
                  {[
                    "rank",
                    "modelKey",
                    "modelName",
                    "organization",
                    "rating",
                    "votes",
                    "license",
                    "inputPrice",
                    "outputPrice",
                    "contextLength",
                  ].map((key) => (
                    <td key={key} className="px-2 py-2">
                      <input
                        type="text"
                        value={newEntry[key]}
                        onChange={(e) =>
                          setNewEntry((prev) => ({ ...prev, [key]: e.target.value }))
                        }
                        placeholder={key === "modelName" || key === "organization" ? "*" : ""}
                        className="w-full rounded border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-700 focus:border-acorn-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                      />
                    </td>
                  ))}
                  <td className="px-2 py-2">
                    <button
                      onClick={handleAddEntry}
                      className="rounded bg-acorn-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-acorn-600"
                    >
                      {t("lmarena.addEntry")}
                    </button>
                  </td>
                </tr>
                {entries.map(renderEntryRow)}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
