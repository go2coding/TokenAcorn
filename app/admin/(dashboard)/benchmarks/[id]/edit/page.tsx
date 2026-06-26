import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import BenchmarkForm from "@/components/admin/forms/BenchmarkForm";

export const dynamic = "force-dynamic";

interface EditBenchmarkPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBenchmarkPage({ params }: EditBenchmarkPageProps) {
  const { id } = await params;

  const benchmark = await prisma.benchmark.findUnique({
    where: { id },
    include: {
      results: {
        orderBy: [{ rank: "asc" }, { score: "desc" }],
      },
    },
  });

  if (!benchmark) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
        编辑基准测试 / Edit Benchmark
      </h1>
      <BenchmarkForm
        initialData={{
          id: benchmark.id,
          name: benchmark.name,
          description: benchmark.description || "",
          category: benchmark.category,
          sortOrder: benchmark.sortOrder,
          results: benchmark.results,
        }}
        isEdit
      />
    </div>
  );
}
