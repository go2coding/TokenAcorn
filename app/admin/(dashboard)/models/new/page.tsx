import prisma from "@/lib/db";
import ModelForm from "@/components/admin/forms/ModelForm";

export const dynamic = "force-dynamic";

export default async function NewModelPage() {
  const providers = await prisma.provider.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
        新建模型 / New Model
      </h1>
      <ModelForm providers={providers} />
    </div>
  );
}
