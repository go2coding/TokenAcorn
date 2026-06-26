import { getBenchmarks } from "@/lib/data";
import BenchmarksClient from "@/components/benchmarks/BenchmarksClient";

export const metadata = {
  title: "模型性能基准测试 - TokenAcorn",
  description: "各大语言模型在不同基准测试集上的性能对比，包括 MMLU、HumanEval、MATH 等测试",
};

export default async function BenchmarksPage() {
  const benchmarks = await getBenchmarks();

  return <BenchmarksClient benchmarks={benchmarks} />;
}
