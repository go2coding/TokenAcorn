import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyAdminRequest } from "@/lib/admin/auth";

export async function GET() {
  if (!(await verifyAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const leaderboards = await prisma.lmArenaLeaderboard.findMany({
      include: {
        _count: {
          select: { entries: true },
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

export async function POST(request: NextRequest) {
  if (!(await verifyAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();

    if (!data.key || !data.title) {
      return NextResponse.json(
        { error: "Key and title are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.lmArenaLeaderboard.findUnique({
      where: { key: data.key },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Leaderboard key already exists" },
        { status: 400 }
      );
    }

    const leaderboard = await prisma.lmArenaLeaderboard.create({
      data: {
        key: data.key,
        title: data.title,
        description: data.description || null,
        category: data.category || "llm",
        sourceUrl: data.sourceUrl || null,
        sortOrder: data.sortOrder ? parseInt(data.sortOrder) : 0,
      },
    });

    return NextResponse.json(leaderboard, { status: 201 });
  } catch (error) {
    console.error("Error creating LM Arena leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to create leaderboard" },
      { status: 500 }
    );
  }
}
