import { Suspense } from "react";
import { getAllProviders, getAllModels } from "@/lib/data";
import CompareClient from "@/components/compare/CompareClient";

export default async function ComparePage() {
  const [providers, models] = await Promise.all([
    getAllProviders(),
    getAllModels(),
  ]);

  // 过滤掉已弃用的模型
  const activeModels = models.filter((m) => !m.deprecated);

  return (
    <Suspense fallback={<div className="p-8 text-center text-neutral-500">Loading...</div>}>
      <CompareClient
        providers={providers}
        allModels={activeModels}
      />
    </Suspense>
  );
}
