import Link from "next/link";
import prisma from "@/lib/db";
import BenchmarkTable from "@/components/admin/tables/BenchmarkTable";

export const dynamic = "force-dynamic";

export default async function BenchmarksPage() {
  const benchmarks = await prisma.benchmark.findMany({
    include: {
      results: true,
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          基准测试管理 / Benchmarks
        </h1>
        <Link
          href="/admin/benchmarks/new"
          className="rounded-lg bg-acorn-500 px-4 py-2 text-sm font-medium text-white hover:bg-acorn-600 transition-colors"
        >
          + 新建基准测试 / New Benchmark
        </Link>
      </div>

      <BenchmarkTable benchmarks={benchmarks} />
    </div>
  );
}
