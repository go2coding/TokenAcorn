import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import ModelForm from "@/components/admin/forms/ModelForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditModelPage({ params }: PageProps) {
  const { id } = await params;

  const [model, providers] = await Promise.all([
    prisma.model.findUnique({
      where: { id },
      include: {
        capabilities: true,
        pricingItems: true,
      },
    }),
    prisma.provider.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!model) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
        编辑模型 / Edit Model
      </h1>
      <ModelForm
        providers={providers}
        initialData={{
          id: model.id,
          name: model.name,
          providerId: model.providerId,
          category: model.category,
          contextWindow: model.contextWindow?.toString() || "",
          maxOutput: model.maxOutput?.toString() || "",
          cacheRate: model.cacheRate?.toString() || "",
          deprecated: model.deprecated,
          releaseDate: model.releaseDate || "",
          knowledgeCutoff: model.knowledgeCutoff || "",
          notes: model.notes || "",
          capabilities: model.capabilities.map((c) => c.capability),
          pricingItems: model.pricingItems.map((p) => ({
            pricingType: p.pricingType,
            tier: p.tier,
            price: p.price.toString(),
            unit: p.unit,
          })),
        }}
        isEdit
      />
    </div>
  );
}
