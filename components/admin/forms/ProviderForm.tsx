"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminLang } from "@/contexts/AdminLangContext";

interface ProviderFormData {
  id: string;
  name: string;
  website: string;
  logoFormat: string;
}

interface ProviderFormProps {
  initialData?: ProviderFormData;
  isEdit?: boolean;
}

export default function ProviderForm({
  initialData,
  isEdit = false,
}: ProviderFormProps) {
  const router = useRouter();
  const { t } = useAdminLang();

  const [formData, setFormData] = useState<ProviderFormData>(
    initialData || {
      id: "",
      name: "",
      website: "",
      logoFormat: "",
    }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const url = isEdit
        ? `/api/admin/providers/${initialData?.id}`
        : "/api/admin/providers";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push("/admin/providers");
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

  const inputClass =
    "w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-700 focus:border-acorn-500 focus:outline-none focus:ring-1 focus:ring-acorn-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300";

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          {t("provider.id")} *
        </label>
        <input
          type="text"
          value={formData.id}
          onChange={(e) => setFormData({ ...formData, id: e.target.value })}
          className={inputClass}
          placeholder="e.g., openai, anthropic"
          required
          disabled={isEdit}
        />
        {isEdit && (
          <p className="mt-1 text-xs text-neutral-500">ID 创建后不可修改</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          {t("provider.name")} *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={inputClass}
          placeholder="e.g., OpenAI, Anthropic"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          {t("provider.website")}
        </label>
        <input
          type="url"
          value={formData.website}
          onChange={(e) =>
            setFormData({ ...formData, website: e.target.value })
          }
          className={inputClass}
          placeholder="https://example.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          {t("provider.logoFormat")}
        </label>
        <input
          type="text"
          value={formData.logoFormat}
          onChange={(e) =>
            setFormData({ ...formData, logoFormat: e.target.value })
          }
          className={inputClass}
          placeholder="e.g., svg, png"
        />
        <p className="mt-1 text-xs text-neutral-500">
          Logo 文件放在 public/logos/[id].[format]
        </p>
      </div>

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
          onClick={() => router.back()}
          className="rounded-lg border border-neutral-200 bg-white px-6 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 transition-colors"
        >
          {t("common.cancel")}
        </button>
      </div>
    </form>
  );
}
