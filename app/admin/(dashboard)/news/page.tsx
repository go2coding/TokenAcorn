import Link from "next/link";
import prisma from "@/lib/db";
import NewsTable from "@/components/admin/tables/NewsTable";

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const news = await prisma.news.findMany({
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          模型快讯管理 / News
        </h1>
        <Link
          href="/admin/news/new"
          className="rounded-lg bg-acorn-500 px-4 py-2 text-sm font-medium text-white hover:bg-acorn-600 transition-colors"
        >
          + 新建快讯 / New News
        </Link>
      </div>

      <NewsTable news={news} />
    </div>
  );
}
