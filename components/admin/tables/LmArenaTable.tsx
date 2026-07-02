"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminLang } from "@/contexts/AdminLangContext";

interface LeaderboardItem {
  id: string;
  key: string;
  title: string;
  description: string | null;
  category: string;
  sourceUrl: string | null;
  sortOrder: number;
  fetchedAt: Date | null;
  _count: {
    entries: number;
  };
}

interface LmArenaTableProps {
  leaderboards: LeaderboardItem[];
}

export default function LmArenaTable({ leaderboards }: LmArenaTableProps) {
  const router = useRouter();
  const { t } = useAdminLang();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const handleDelete = async (id: string) => {
    if (!confirm(t("common.confirmDelete"))) return;

    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/lmarena/${id}`, {
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

  const filtered = leaderboards.filter(
    (lb) =>
      lb.title.toLowerCase().includes(search.toLowerCase()) ||
      lb.key.toLowerCase().includes(search.toLowerCase()) ||
      (lb.description?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder={t("common.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-[200px] flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700 placeholder:text-neutral-400 focus:border-acorn-500 focus:outline-none focus:ring-1 focus:ring-acorn-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:placeholder:text-neutral-500"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 dark:bg-neutral-900">
            <tr>
              <th className="px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">
                {t("lmarena.sortOrder")}
              </th>
              <th className="px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">
                {t("lmarena.titleLabel")}
              </th>
              <th className="px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">
                {t("lmarena.key")}
              </th>
              <th className="px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">
                {t("lmarena.category")}
              </th>
              <th className="px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">
                {t("lmarena.entryCount")}
              </th>
              <th className="px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">
                {t("common.actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {filtered.map((lb) => (
              <tr
                key={lb.id}
                className="bg-white hover:bg-neutral-50 dark:bg-neutral-950 dark:hover:bg-neutral-900"
              >
                <td className="px-4 py-3 text-neutral-500 dark:text-neutral-500">
                  {lb.sortOrder}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/lmarena/${lb.id}/edit`}
                    className="font-medium text-neutral-900 hover:text-acorn-600 dark:text-neutral-100 dark:hover:text-acorn-400"
                  >
                    {lb.title}
                  </Link>
                  {lb.sourceUrl && (
                    <a
                      href={lb.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 inline-flex items-center text-xs text-acorn-600 hover:underline dark:text-acorn-400"
                    >
                      ↗
                    </a>
                  )}
                </td>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">
                  {lb.key}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                    {lb.category}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                    {lb._count.entries}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/lmarena/${lb.id}/edit`}
                      className="rounded-md bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                    >
                      {t("common.edit")}
                    </Link>
                    <button
                      onClick={() => handleDelete(lb.id)}
                      disabled={deleting === lb.id}
                      className="rounded-md bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 disabled:opacity-50 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                    >
                      {deleting === lb.id
                        ? t("common.deleting")
                        : t("common.delete")}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-neutral-500 dark:text-neutral-400"
                >
                  {search
                    ? t("common.noResults")
                    : "暂无排行榜 / No leaderboards yet"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
