"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminLang } from "@/contexts/AdminLangContext";

interface Provider {
  id: string;
  name: string;
  website: string | null;
  logoFormat: string | null;
  _count: { models: number };
}

interface ProviderTableProps {
  providers: Provider[];
}

export default function ProviderTable({ providers }: ProviderTableProps) {
  const router = useRouter();
  const { t } = useAdminLang();
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm(t("provider.deleteConfirm"))) return;

    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/providers/${id}`, {
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

  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
            <th className="px-4 py-3 text-left font-medium text-neutral-500">
              {t("provider.id")}
            </th>
            <th className="px-4 py-3 text-left font-medium text-neutral-500">
              {t("provider.name")}
            </th>
            <th className="px-4 py-3 text-left font-medium text-neutral-500">
              {t("provider.website")}
            </th>
            <th className="px-4 py-3 text-left font-medium text-neutral-500">
              {t("provider.logoFormat")}
            </th>
            <th className="px-4 py-3 text-center font-medium text-neutral-500">
              {t("provider.modelCount")}
            </th>
            <th className="px-4 py-3 text-right font-medium text-neutral-500">
              {t("common.actions")}
            </th>
          </tr>
        </thead>
        <tbody>
          {providers.map((provider) => (
            <tr
              key={provider.id}
              className="border-b border-neutral-100 dark:border-neutral-800 last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-800/30"
            >
              <td className="px-4 py-3 font-mono text-xs text-neutral-600 dark:text-neutral-400">
                {provider.id}
              </td>
              <td className="px-4 py-3 font-medium text-neutral-900 dark:text-white">
                {provider.name}
              </td>
              <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">
                {provider.website ? (
                  <a
                    href={provider.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-acorn-600 hover:underline"
                  >
                    {provider.website}
                  </a>
                ) : (
                  "-"
                )}
              </td>
              <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">
                {provider.logoFormat || "-"}
              </td>
              <td className="px-4 py-3 text-center text-neutral-600 dark:text-neutral-400">
                {provider._count.models}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <Link
                    href={`/admin/providers/${provider.id}/edit`}
                    className="rounded-md px-3 py-1.5 text-xs font-medium text-acorn-600 hover:bg-acorn-50 dark:hover:bg-acorn-900/20 transition-colors"
                  >
                    {t("common.edit")}
                  </Link>
                  <button
                    onClick={() => handleDelete(provider.id)}
                    disabled={deleting === provider.id}
                    className="rounded-md px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-colors"
                  >
                    {deleting === provider.id
                      ? t("common.loading")
                      : t("common.delete")}
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {providers.length === 0 && (
            <tr>
              <td
                colSpan={6}
                className="px-4 py-8 text-center text-neutral-500"
              >
                No providers found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
