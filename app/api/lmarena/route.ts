import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    const category = searchParams.get("category");

    const leaderboards = await prisma.lmArenaLeaderboard.findMany({
      where: {
        ...(key ? { key } : {}),
        ...(category ? { category } : {}),
      },
      include: {
        entries: {
          orderBy: [{ rank: "asc" }, { rating: "desc" }],
        },
      },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    });

    return NextResponse.json(leaderboards);
  } catch (error) {
    console.error("Error fetching LM Arena leaderboards:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboards" },
      { status: 500 }
    );
  }
}
