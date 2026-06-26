export const dynamic = "force-dynamic";

import BenchmarkForm from "@/components/admin/forms/BenchmarkForm";

export default function NewBenchmarkPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
        新建基准测试 / New Benchmark
      </h1>
      <BenchmarkForm />
    </div>
  );
}
