import { notFound } from "next/navigation";
import { getModelDetail } from "@/lib/data";
import ModelDetailClient from "@/components/models/detail/ModelDetailClient";

export default async function ModelDetailPage({
  params,
}: {
  params: Promise<{ id: string[] }>;
}) {
  const { id } = await params;
  const modelId = id.join("/");
  const model = await getModelDetail(modelId);

  if (!model) {
    notFound();
  }

  return <ModelDetailClient model={model} />;
}
