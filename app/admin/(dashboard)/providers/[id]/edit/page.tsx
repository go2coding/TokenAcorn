import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import ProviderForm from "@/components/admin/forms/ProviderForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProviderPage({ params }: PageProps) {
  const { id } = await params;

  const provider = await prisma.provider.findUnique({
    where: { id },
  });

  if (!provider) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
        编辑厂商 / Edit Provider
      </h1>
      <ProviderForm
        initialData={{
          id: provider.id,
          name: provider.name,
          website: provider.website || "",
          logoFormat: provider.logoFormat || "",
        }}
        isEdit
      />
    </div>
  );
}
