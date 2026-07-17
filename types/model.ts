export type ModelCategory =
  | "general"
  | "llm"
  | "embedding"
  | "image"
  | "video"
  | "audio"
  | "moderation";

export type Capability =
  | "text"
  | "vision"
  | "image-gen"
  | "code"
  | "function-call"
  | "json-mode"
  | "streaming"
  | "batch"
  | "fine-tuning"
  | "realtime"
  | "video";

export const VISIBLE_CAPABILITIES: Capability[] = [
  "text",
  "vision",
  "image-gen",
  "code",
  "function-call",
];

export interface ModelPricing {
  input: number;
  output: number;
  cachedInput?: number;
}

export interface Model {
  id: string;
  name: string;
  provider: string;
  category: ModelCategory;
  capabilities: Capability[];
  pricing: ModelPricing;
  contextWindow: number;
  maxOutput: number;
  cacheRate?: number;
  releaseDate?: string;
  knowledgeCutoff?: string;
  deprecated?: boolean;
  notes?: string;
  updatedAt: string;
}

export interface Provider {
  id: string;
  name: string;
  website?: string;
  logo?: string;
  models: Model[];
}

export interface ModelPricingItem {
  pricingType: string;
  tier: string;
  price: number;
  unit: string;
  conditions?: string;
}

export interface ModelPriceHistoryEntry {
  id: number;
  pricingType: string;
  tier: string;
  oldPrice?: number;
  newPrice: number;
  recordedAt: string;
}

export interface ModelDetail extends Model {
  providerInfo: {
    id: string;
    name: string;
    website?: string;
  };
  pricingItems: ModelPricingItem[];
  priceHistory: ModelPriceHistoryEntry[];
}

export const CAPABILITY_ICONS: Record<Capability, string> = {
  video: "VID",
  text: "📝",
  vision: "👁️",
  "image-gen": "🎨",
  code: "💻",
  "function-call": "🔧",
  "json-mode": "📊",
  streaming: "⚡",
  batch: "📦",
  "fine-tuning": "🎯",
  realtime: "🎙️",
};
