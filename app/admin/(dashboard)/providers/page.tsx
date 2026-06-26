import Link from "next/link";
import prisma from "@/lib/db";
import ProviderTable from "@/components/admin/tables/ProviderTable";

export const dynamic = "force-dynamic";

export default async function ProvidersPage() {
  const providers = await prisma.provider.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { models: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          厂商管理 / Providers
        </h1>
        <Link
          href="/admin/providers/new"
          className="rounded-lg bg-acorn-500 px-4 py-2 text-sm font-medium text-white hover:bg-acorn-600 transition-colors"
        >
          + 新建厂商 / New Provider
        </Link>
      </div>

      <ProviderTable providers={providers} />
    </div>
  );
}
