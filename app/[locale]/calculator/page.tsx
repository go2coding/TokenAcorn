import { getAllProviders, getAllModels } from "@/lib/data";
import CalculatorClient from "@/components/calculator/CalculatorClient";

export default async function CalculatorPage() {
  const [providers, models] = await Promise.all([
    getAllProviders(),
    getAllModels(),
  ]);

  const activeModels = models.filter((m) => !m.deprecated);

  return (
    <CalculatorClient
      providers={providers}
      models={activeModels}
    />
  );
}
