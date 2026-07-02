import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyAdminRequest } from "@/lib/admin/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const leaderboard = await prisma.lmArenaLeaderboard.findUnique({
      where: { id },
      include: {
        entries: {
          orderBy: [{ rank: "asc" }, { rating: "desc" }],
        },
      },
    });

    if (!leaderboard) {
      return NextResponse.json(
        { error: "Leaderboard not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error("Error fetching LM Arena leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const data = await request.json();

    const existing = await prisma.lmArenaLeaderboard.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Leaderboard not found" },
        { status: 404 }
      );
    }

    if (data.key && data.key !== existing.key) {
      const keyExists = await prisma.lmArenaLeaderboard.findUnique({
        where: { key: data.key },
      });
      if (keyExists) {
        return NextResponse.json(
          { error: "Leaderboard key already exists" },
          { status: 400 }
        );
      }
    }

    const leaderboard = await prisma.lmArenaLeaderboard.update({
      where: { id },
      data: {
        key: data.key ?? existing.key,
        title: data.title ?? existing.title,
        description: data.description !== undefined ? data.description : existing.description,
        category: data.category ?? existing.category,
        sourceUrl: data.sourceUrl !== undefined ? data.sourceUrl : existing.sourceUrl,
        sortOrder: data.sortOrder !== undefined ? parseInt(data.sortOrder) : existing.sortOrder,
      },
    });

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error("Error updating LM Arena leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to update leaderboard" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const existing = await prisma.lmArenaLeaderboard.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Leaderboard not found" },
        { status: 404 }
      );
    }

    await prisma.lmArenaLeaderboard.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting LM Arena leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to delete leaderboard" },
      { status: 500 }
    );
  }
}
