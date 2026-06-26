import { getAllProviders, getAllModels, getFeaturedModelIds, getLatestModels } from "@/lib/data";
import HomeClient from "@/components/home/HomeClient";

export default async function Home() {
  const [providers, models, featuredIds, milestones] = await Promise.all([
    getAllProviders(),
    getAllModels(),
    getFeaturedModelIds(),
    getLatestModels(5),
  ]);

  return (
    <HomeClient
      providers={providers}
      models={models}
      featuredIds={featuredIds}
      milestones={milestones}
    />
  );
}
