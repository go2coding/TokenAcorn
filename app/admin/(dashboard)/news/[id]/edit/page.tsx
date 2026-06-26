import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import NewsForm from "@/components/admin/forms/NewsForm";

interface EditNewsPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditNewsPage({ params }: EditNewsPageProps) {
  const { id } = await params;

  const news = await prisma.news.findUnique({
    where: { id },
  });

  if (!news) {
    notFound();
  }

  const initialData = {
    id: news.id,
    title: news.title,
    content: news.content,
    source: news.source || "",
    publishedAt: news.publishedAt.toISOString().slice(0, 16),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/news"
          className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          编辑快讯 / Edit News
        </h1>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-800">
        <NewsForm initialData={initialData} isEdit />
      </div>
    </div>
  );
}
