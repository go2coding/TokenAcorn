import { PrismaClient } from "../lib/generated/prisma";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import * as fs from "fs";
import * as path from "path";

const dbPath = path.join(__dirname, "..", "data", "models.db");
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

const PROVIDERS_DIR = path.join(__dirname, "..", "data", "providers");
const FEATURED_PATH = path.join(__dirname, "..", "data", "featured.json");

async function main() {
  console.log("Seeding database...");

  // 读取所有 provider JSON 文件
  const providerFiles = fs.readdirSync(PROVIDERS_DIR).filter((f) => f.endsWith(".json"));

  for (const file of providerFiles) {
    const filePath = path.join(PROVIDERS_DIR, file);
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    console.log(`  Processing ${file}...`);

    // 创建 provider
    await prisma.provider.upsert({
      where: { id: data.id },
      update: {
        name: data.name,
        website: data.website,
      },
      create: {
        id: data.id,
        name: data.name,
        website: data.website,
      },
    });

    // 创建 models
    for (const model of data.models || []) {
      await prisma.model.upsert({
        where: { id: model.id },
        update: {
          name: model.name,
          providerId: data.id,
          category: model.category || "general",
          contextWindow: model.contextWindow,
          maxOutput: model.maxOutput,
          deprecated: model.deprecated || false,
          releaseDate: model.releaseDate,
          knowledgeCutoff: model.knowledgeCutoff,
          notes: model.notes,
        },
        create: {
          id: model.id,
          name: model.name,
          providerId: data.id,
          category: model.category || "general",
          contextWindow: model.contextWindow,
          maxOutput: model.maxOutput,
          deprecated: model.deprecated || false,
          releaseDate: model.releaseDate,
          knowledgeCutoff: model.knowledgeCutoff,
          notes: model.notes,
        },
      });

      // 删除旧的 capabilities 和 pricing
      await prisma.modelCapability.deleteMany({ where: { modelId: model.id } });
      await prisma.pricingItem.deleteMany({ where: { modelId: model.id } });

      // 创建 capabilities
      for (const cap of model.capabilities || []) {
        await prisma.modelCapability.create({
          data: {
            modelId: model.id,
            capability: cap,
          },
        });
      }

      // 创建 pricing
      const pricing = model.pricing || {};
      if (pricing.input !== undefined) {
        await prisma.pricingItem.create({
          data: {
            modelId: model.id,
            pricingType: "token_input",
            tier: "standard",
            price: pricing.input,
            unit: "per_million",
          },
        });
      }
      if (pricing.output !== undefined) {
        await prisma.pricingItem.create({
          data: {
            modelId: model.id,
            pricingType: "token_output",
            tier: "standard",
            price: pricing.output,
            unit: "per_million",
          },
        });
      }
      if (pricing.cachedInput !== undefined) {
        await prisma.pricingItem.create({
          data: {
            modelId: model.id,
            pricingType: "token_cached",
            tier: "standard",
            price: pricing.cachedInput,
            unit: "per_million",
          },
        });
      }
    }
  }

  // 导入 featured models
  if (fs.existsSync(FEATURED_PATH)) {
    console.log("  Processing featured.json...");
    const featuredData = JSON.parse(fs.readFileSync(FEATURED_PATH, "utf-8"));

    await prisma.featuredModel.deleteMany();

    for (let i = 0; i < (featuredData.models || []).length; i++) {
      const modelId = featuredData.models[i];
      // 检查模型是否存在
      const model = await prisma.model.findUnique({ where: { id: modelId } });
      if (model) {
        await prisma.featuredModel.create({
          data: {
            modelId,
            sortOrder: i,
          },
        });
      }
    }
  }

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
