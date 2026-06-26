"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminLang } from "@/contexts/AdminLangContext";

interface NewsFormData {
  id?: string;
  title: string;
  content: string;
  source: string;
  publishedAt: string;
}

interface NewsFormProps {
  initialData?: NewsFormData;
  isEdit?: boolean;
}

export default function NewsForm({ initialData, isEdit = false }: NewsFormProps) {
  const router = useRouter();
  const { t } = useAdminLang();

  const [formData, setFormData] = useState<NewsFormData>(
    initialData || {
      title: "",
      content: "",
      source: "",
      publishedAt: new Date().toISOString().slice(0, 16),
    }
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const url = isEdit
        ? `/api/admin/news/${formData.id}`
        : "/api/admin/news";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          source: formData.source || null,
          publishedAt: formData.publishedAt,
        }),
      });

      if (res.ok) {
        router.push("/admin/news");
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          标题 / Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
          className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700 focus:border-acorn-500 focus:outline-none focus:ring-1 focus:ring-acorn-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
          placeholder="例如: Claude 4.0 发布"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          内容 / Content <span className="text-red-500">*</span>
        </label>
        <textarea
          required
          value={formData.content}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, content: e.target.value }))
          }
          rows={4}
          className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700 focus:border-acorn-500 focus:outline-none focus:ring-1 focus:ring-acorn-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
          placeholder="输入快讯内容..."
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            来源链接 / Source URL
          </label>
          <input
            type="url"
            value={formData.source}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, source: e.target.value }))
            }
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700 focus:border-acorn-500 focus:outline-none focus:ring-1 focus:ring-acorn-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
            placeholder="https://..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            发布时间 / Published At
          </label>
          <input
            type="datetime-local"
            value={formData.publishedAt}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, publishedAt: e.target.value }))
            }
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700 focus:border-acorn-500 focus:outline-none focus:ring-1 focus:ring-acorn-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
          />
        </div>
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
          onClick={() => router.push("/admin/news")}
          className="rounded-lg bg-neutral-100 px-6 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
        >
          {t("common.cancel")}
        </button>
      </div>
    </form>
  );
}
