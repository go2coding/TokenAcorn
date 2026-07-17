import prisma from "./db";
import type { Provider, Model, ModelDetail } from "@/types/model";
import { normalizeModelIdentifier } from "@/lib/model-url";

export async function getAllProviders(): Promise<Provider[]> {
  const providers = await prisma.provider.findMany({
    include: {
      models: {
        include: {
          capabilities: true,
          pricingItems: true,
        },
        orderBy: { name: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  return providers.map((p) => ({
    id: p.id,
    name: p.name,
    website: p.website ?? undefined,
    logo: p.logoFormat ?? undefined,
    models: p.models.map((m) => toFrontendModel(m, p.id)),
  }));
}

export async function getAllModels(): Promise<Model[]> {
  const models = await prisma.model.findMany({
    include: {
      capabilities: true,
      pricingItems: true,
    },
    orderBy: [{ releaseDate: "desc" }, { name: "asc" }],
  });

  return models.map((m) => toFrontendModel(m, m.providerId));
}

export async function getFeaturedModelIds(): Promise<string[]> {
  const featured = await prisma.featuredModel.findMany({
    orderBy: { sortOrder: "asc" },
    select: { modelId: true },
  });
  return featured.map((f) => f.modelId);
}

export interface MilestoneModel {
  id: string;
  name: string;
  providerId: string;
  providerName: string;
  releaseDate: string;
}

export async function getLatestModels(limit: number = 5): Promise<MilestoneModel[]> {
  const models = await prisma.model.findMany({
    where: {
      releaseDate: { not: null },
      deprecated: false,
      category: { in: ["llm"] },
    },
    include: {
      provider: { select: { name: true } },
    },
    orderBy: { releaseDate: "desc" },
    take: limit,
  });

  return models
    .filter((m) => m.releaseDate)
    .map((m) => ({
      id: m.id,
      name: m.name,
      providerId: m.providerId,
      providerName: m.provider.name,
      releaseDate: m.releaseDate!,
    }));
}

export async function getModelById(id: string): Promise<Model | undefined> {
  const model = await prisma.model.findUnique({
    where: { id },
    include: {
      capabilities: true,
      pricingItems: true,
    },
  });

  if (!model) return undefined;
  return toFrontendModel(model, model.providerId);
}

export async function getModelDetail(id: string): Promise<ModelDetail | undefined> {
  const findModel = (modelId: string) =>
    prisma.model.findUnique({
      where: { id: modelId },
      include: {
        provider: true,
        capabilities: true,
        pricingItems: {
          orderBy: [{ pricingType: "asc" }, { tier: "asc" }],
        },
        priceHistory: {
          orderBy: { recordedAt: "asc" },
        },
      },
    });

  let model = await findModel(id);

  if (!model) {
    const normalizedIdentifier = normalizeModelIdentifier(id);
    const candidates = await prisma.model.findMany({
      select: {
        id: true,
        name: true,
      },
    });
    const idMatches = candidates.filter(
      (candidate) =>
        normalizeModelIdentifier(candidate.id) === normalizedIdentifier
    );
    const nameMatches = candidates.filter(
      (candidate) =>
        normalizeModelIdentifier(candidate.name) === normalizedIdentifier
    );
    const matchedId =
      idMatches.length === 1
        ? idMatches[0].id
        : nameMatches.length === 1
          ? nameMatches[0].id
          : undefined;

    if (matchedId) {
      model = await findModel(matchedId);
    }
  }

  if (!model) return undefined;

  return {
    ...toFrontendModel(model, model.providerId),
    providerInfo: {
      id: model.provider.id,
      name: model.provider.name,
      website: model.provider.website ?? undefined,
    },
    pricingItems: model.pricingItems.map((item) => ({
      pricingType: item.pricingType,
      tier: item.tier,
      price: item.price,
      unit: item.unit,
      conditions: item.conditions ?? undefined,
    })),
    priceHistory: model.priceHistory.map((entry) => ({
      id: entry.id,
      pricingType: entry.pricingType,
      tier: entry.tier,
      oldPrice: entry.oldPrice ?? undefined,
      newPrice: entry.newPrice,
      recordedAt: entry.recordedAt.toISOString(),
    })),
  };
}

// 获取最新快讯
export async function getLatestNews(limit: number = 50) {
  const news = await prisma.news.findMany({
    orderBy: { publishedAt: "desc" },
    take: limit,
  });

  return news.map((item) => ({
    id: item.id,
    title: item.title,
    content: item.content,
    source: item.source,
    publishedAt: item.publishedAt.toISOString(),
  }));
}

// 获取所有基准测试数据
export async function getBenchmarks() {
  const benchmarks = await prisma.benchmark.findMany({
    include: {
      results: {
        orderBy: [{ rank: "asc" }, { score: "desc" }],
      },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return benchmarks;
}

// 获取所有 LM Arena 排行榜数据
export async function getLmArenaLeaderboards() {
  const leaderboards = await prisma.lmArenaLeaderboard.findMany({
    include: {
      entries: {
        orderBy: [{ rank: "asc" }, { rating: "desc" }],
      },
    },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });

  return leaderboards.map((lb) => ({
    ...lb,
    fetchedAt: lb.fetchedAt?.toISOString() ?? null,
    createdAt: lb.createdAt.toISOString(),
    updatedAt: lb.updatedAt.toISOString(),
  }));
}

// Helper to convert Prisma model to frontend format
function toFrontendModel(
  model: {
    id: string;
    name: string;
    providerId: string;
    category: string;
    contextWindow: number | null;
    maxOutput: number | null;
    cacheRate: number | null;
    deprecated: boolean;
    releaseDate: string | null;
    knowledgeCutoff: string | null;
    notes: string | null;
    updatedAt: Date;
    capabilities: { capability: string }[];
    pricingItems: { pricingType: string; tier: string; price: number; unit: string }[];
  },
  providerId: string
): Model {
  const pricing: { input: number; output: number; cachedInput?: number } = {
    input: 0,
    output: 0,
  };

  for (const p of model.pricingItems) {
    if (p.pricingType === "token_input" && p.tier === "standard") pricing.input = p.price;
    if (p.pricingType === "token_output" && p.tier === "standard") pricing.output = p.price;
    if (p.pricingType === "token_cached" && p.tier === "standard") pricing.cachedInput = p.price;
    // Embedding 模型等其他类型：使用 embedding, per_character, per_image 等作为 input 价格
    if (pricing.input === 0 && ["embedding", "per_character", "per_image", "per_second", "per_minute", "per_unit"].includes(p.pricingType)) {
      pricing.input = p.price;
    }
  }

  return {
    id: model.id,
    name: model.name,
    provider: providerId,
    category: model.category as Model["category"],
    capabilities: model.capabilities.map((c) => c.capability) as Model["capabilities"],
    pricing,
    contextWindow: model.contextWindow ?? 0,
    maxOutput: model.maxOutput ?? 0,
    cacheRate: model.cacheRate ?? undefined,
    deprecated: model.deprecated,
    releaseDate: model.releaseDate ?? undefined,
    knowledgeCutoff: model.knowledgeCutoff ?? undefined,
    notes: model.notes ?? undefined,
    updatedAt: model.updatedAt.toISOString().split("T")[0],
  };
}
