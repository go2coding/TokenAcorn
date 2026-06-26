import prisma from "@/lib/db";
import FeaturedManager from "@/components/admin/forms/FeaturedManager";

export const dynamic = "force-dynamic";

export default async function FeaturedPage() {
  const [allModels, featured] = await Promise.all([
    prisma.model.findMany({
      where: {  },
      include: { provider: true },
      orderBy: [{ provider: { name: "asc" } }, { name: "asc" }],
    }),
    prisma.featuredModel.findMany({
      orderBy: { sortOrder: "asc" },
      select: { modelId: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          推荐模型 / Featured Models
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          管理首页展示的推荐模型列表 / Manage featured models shown on homepage
        </p>
      </div>

      <FeaturedManager
        allModels={allModels.map((m) => ({
          id: m.id,
          name: m.name,
          provider: { name: m.provider.name },
        }))}
        featuredModelIds={featured.map((f) => f.modelId)}
      />
    </div>
  );
}
