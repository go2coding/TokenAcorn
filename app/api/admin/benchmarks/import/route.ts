import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyAdminRequest } from "@/lib/admin/auth";

const VALID_CATEGORIES = new Set([
  "reasoning",
  "coding",
  "math",
  "multilingual",
  "long-context",
  "comprehensive",
  "general",
]);

type ResultPayload = {
  model_name: string;
  provider: string;
  score: number;
  rank: number;
};

type BenchmarkPayload = {
  name: string;
  description: string | null;
  category: string;
  sort_order: number;
  results: ResultPayload[];
};

type ImportPayload = {
  fetch_time?: string;
  source_url?: string;
  benchmarks?: unknown;
  fetch_errors?: unknown;
};

function tokensMatch(actual: string, expected: string): boolean {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

async function verifyImportRequest(request: NextRequest): Promise<boolean> {
  if (await verifyAdminRequest()) {
    return true;
  }

  const expectedToken = process.env.BENCHMARK_IMPORT_TOKEN;
  const authorization = request.headers.get("authorization");
  if (!expectedToken || !authorization?.startsWith("Bearer ")) {
    return false;
  }

  return tokensMatch(authorization.slice("Bearer ".length).trim(), expectedToken);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isNonNegativeInteger(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 0;
}

function validateBenchmarks(value: unknown): BenchmarkPayload[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error("benchmarks must be a non-empty array");
  }

  const names = new Set<string>();

  return value.map((rawBenchmark, benchmarkIndex) => {
    const path = `benchmarks[${benchmarkIndex}]`;
    if (
      typeof rawBenchmark !== "object" ||
      rawBenchmark === null ||
      Array.isArray(rawBenchmark)
    ) {
      throw new Error(`${path} must be an object`);
    }

    const benchmark = rawBenchmark as Record<string, unknown>;
    if (!isNonEmptyString(benchmark.name)) {
      throw new Error(`${path}.name must be a non-empty string`);
    }
    const name = benchmark.name.trim();
    const normalizedName = name.toLocaleLowerCase("en-US");
    if (names.has(normalizedName)) {
      throw new Error(`Duplicate benchmark name: ${name}`);
    }
    names.add(normalizedName);

    if (
      benchmark.description !== null &&
      benchmark.description !== undefined &&
      typeof benchmark.description !== "string"
    ) {
      throw new Error(`${path}.description must be a string or null`);
    }
    if (
      !isNonEmptyString(benchmark.category) ||
      !VALID_CATEGORIES.has(benchmark.category)
    ) {
      throw new Error(`${path}.category is invalid`);
    }
    if (!isNonNegativeInteger(benchmark.sort_order)) {
      throw new Error(`${path}.sort_order must be a non-negative integer`);
    }
    if (!Array.isArray(benchmark.results) || benchmark.results.length === 0) {
      throw new Error(`${path}.results must be a non-empty array`);
    }

    const resultKeys = new Set<string>();
    const results = benchmark.results.map((rawResult, resultIndex) => {
      const resultPath = `${path}.results[${resultIndex}]`;
      if (
        typeof rawResult !== "object" ||
        rawResult === null ||
        Array.isArray(rawResult)
      ) {
        throw new Error(`${resultPath} must be an object`);
      }

      const result = rawResult as Record<string, unknown>;
      if (!isNonEmptyString(result.model_name)) {
        throw new Error(`${resultPath}.model_name must be a non-empty string`);
      }
      if (!isNonEmptyString(result.provider)) {
        throw new Error(`${resultPath}.provider must be a non-empty string`);
      }
      if (!isFiniteNumber(result.score)) {
        throw new Error(`${resultPath}.score must be a finite number`);
      }
      if (!isNonNegativeInteger(result.rank) || result.rank < 1) {
        throw new Error(`${resultPath}.rank must be a positive integer`);
      }

      const modelName = result.model_name.trim();
      const provider = result.provider.trim();
      const resultKey =
        `${modelName.toLocaleLowerCase("en-US")}\u0000` +
        provider.toLocaleLowerCase("en-US");
      if (resultKeys.has(resultKey)) {
        throw new Error(
          `${path} contains duplicate model/provider: ${modelName} / ${provider}`
        );
      }
      resultKeys.add(resultKey);

      return {
        model_name: modelName,
        provider,
        score: result.score,
        rank: result.rank,
      };
    });

    return {
      name,
      description:
        typeof benchmark.description === "string"
          ? benchmark.description.trim() || null
          : null,
      category: benchmark.category,
      sort_order: benchmark.sort_order,
      results,
    };
  });
}

export async function POST(request: NextRequest) {
  if (!(await verifyImportRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rawData = (await request.json()) as unknown;
    if (
      typeof rawData !== "object" ||
      rawData === null ||
      Array.isArray(rawData)
    ) {
      return NextResponse.json(
        { error: "Request body must be a JSON object" },
        { status: 400 }
      );
    }
    const data = rawData as ImportPayload;
    if (data.fetch_errors) {
      return NextResponse.json(
        { error: "Snapshots containing fetch_errors cannot be imported" },
        { status: 400 }
      );
    }

    let benchmarks: BenchmarkPayload[];
    try {
      benchmarks = validateBenchmarks(data.benchmarks);
    } catch (error) {
      return NextResponse.json(
        {
          error:
            error instanceof Error ? error.message : "Invalid benchmark payload",
        },
        { status: 400 }
      );
    }

    const imported = await prisma.$transaction(async (tx) => {
      const results: { name: string; count: number }[] = [];

      for (const benchmark of benchmarks) {
        const savedBenchmark = await tx.benchmark.upsert({
          where: { name: benchmark.name },
          create: {
            name: benchmark.name,
            description: benchmark.description,
            category: benchmark.category,
            sortOrder: benchmark.sort_order,
          },
          update: {
            description: benchmark.description,
            category: benchmark.category,
            sortOrder: benchmark.sort_order,
          },
        });

        await tx.benchmarkResult.deleteMany({
          where: { benchmarkId: savedBenchmark.id },
        });

        const createData = benchmark.results.map((result) => ({
          benchmarkId: savedBenchmark.id,
          modelName: result.model_name,
          provider: result.provider,
          score: result.score,
          rank: result.rank,
        }));

        const chunkSize = 500;
        for (let index = 0; index < createData.length; index += chunkSize) {
          await tx.benchmarkResult.createMany({
            data: createData.slice(index, index + chunkSize),
          });
        }

        results.push({
          name: benchmark.name,
          count: benchmark.results.length,
        });
      }

      return results;
    });

    return NextResponse.json({
      success: true,
      fetchTime: data.fetch_time ?? null,
      sourceUrl: data.source_url ?? null,
      benchmarkCount: imported.length,
      resultCount: imported.reduce((sum, item) => sum + item.count, 0),
      benchmarks: imported,
    });
  } catch (error) {
    console.error("Error importing benchmarks:", error);
    return NextResponse.json(
      { error: "Failed to import benchmarks" },
      { status: 500 }
    );
  }
}
