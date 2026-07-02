import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyAdminRequest } from "@/lib/admin/auth";
import { notifySubscribers, buildLmArenaHtml } from "@/lib/notifications";

type EntryJson = {
  rank: number;
  model_key: string | null;
  model_name: string;
  rating: number;
  votes: number;
  organization: string;
  license: string | null;
  input_price_per_million: number | null;
  output_price_per_million: number | null;
  context_length: number | null;
};

type Payload = {
  fetch_time?: string;
  source_url?: string;
  title?: string;
  leaderboards?: Record<string, EntryJson[]>;
};

function inferCategory(key: string): string {
  if (["agent", "text", "code", "vision", "document", "search"].includes(key)) {
    return "llm";
  }
  if (["text-to-image", "image-edit", "image-to-code"].includes(key)) {
    return "image";
  }
  if (["text-to-video", "image-to-video", "video-to-video"].includes(key)) {
    return "video";
  }
  return "llm";
}

export async function POST(request: NextRequest) {
  if (!(await verifyAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = (await request.json()) as Payload;

    if (!data.leaderboards || typeof data.leaderboards !== "object") {
      return NextResponse.json(
        { error: "Missing or invalid leaderboards" },
        { status: 400 }
      );
    }

    const sourceUrl = data.source_url ?? null;
    const fetchedAt = data.fetch_time ? new Date(data.fetch_time) : new Date();

    const results: { key: string; title: string; count: number }[] = [];

    for (const [key, entries] of Object.entries(data.leaderboards)) {
      if (!Array.isArray(entries)) continue;

      const title = data.title ? `${data.title} - ${key}` : `LM Arena - ${key}`;

      const leaderboard = await prisma.lmArenaLeaderboard.upsert({
        where: { key },
        create: {
          key,
          title,
          description: sourceUrl ? `Source: ${sourceUrl}` : null,
          category: inferCategory(key),
          sourceUrl,
          fetchedAt,
        },
        update: {
          title,
          description: sourceUrl ? `Source: ${sourceUrl}` : null,
          category: inferCategory(key),
          sourceUrl,
          fetchedAt,
        },
      });

      await prisma.lmArenaEntry.deleteMany({
        where: { leaderboardId: leaderboard.id },
      });

      const createData = entries.map((entry) => ({
        leaderboardId: leaderboard.id,
        rank: entry.rank,
        modelKey: entry.model_key,
        modelName: entry.model_name,
        rating: entry.rating,
        votes: entry.votes,
        organization: entry.organization,
        license: entry.license,
        inputPrice: entry.input_price_per_million,
        outputPrice: entry.output_price_per_million,
        contextLength: entry.context_length,
      }));

      const chunkSize = 500;
      for (let i = 0; i < createData.length; i += chunkSize) {
        await prisma.lmArenaEntry.createMany({
          data: createData.slice(i, i + chunkSize),
        });
      }

      results.push({ key, title, count: entries.length });
    }

    if (results.length > 0) {
      void notifySubscribers((locale) => {
        const isZh = locale === "zh";
        const title = results.map((r) => r.title).join(", ");
        return {
          subject: isZh ? "LM Arena 排行榜已更新" : "LM Arena Leaderboard Updated",
          html: buildLmArenaHtml(title, locale),
        };
      });
    }

    return NextResponse.json({
      success: true,
      fetchedAt: fetchedAt.toISOString(),
      leaderboards: results,
    });
  } catch (error) {
    console.error("Error importing LM Arena leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to import leaderboard" },
      { status: 500 }
    );
  }
}
