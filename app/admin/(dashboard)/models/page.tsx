import Link from "next/link";
import prisma from "@/lib/db";
import ModelTable from "@/components/admin/tables/ModelTable";

export const dynamic = "force-dynamic";

export default async function ModelsPage() {
  const models = await prisma.model.findMany({
    include: {
      provider: true,
      capabilities: true,
      pricingItems: true,
      featured: true,
    },
    orderBy: { releaseDate: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          模型管理 / Models
        </h1>
        <Link
          href="/admin/models/new"
          className="rounded-lg bg-acorn-500 px-4 py-2 text-sm font-medium text-white hover:bg-acorn-600 transition-colors"
        >
          + 新建模型 / New Model
        </Link>
      </div>

      <ModelTable models={models} />
    </div>
  );
}
