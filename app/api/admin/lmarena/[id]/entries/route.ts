import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyAdminRequest } from "@/lib/admin/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const data = await request.json();

    const leaderboard = await prisma.lmArenaLeaderboard.findUnique({
      where: { id },
    });

    if (!leaderboard) {
      return NextResponse.json(
        { error: "Leaderboard not found" },
        { status: 404 }
      );
    }

    if (!data.modelName || !data.organization) {
      return NextResponse.json(
        { error: "Model name and organization are required" },
        { status: 400 }
      );
    }

    const entry = await prisma.lmArenaEntry.create({
      data: {
        leaderboardId: id,
        rank: data.rank ? parseInt(data.rank) : 0,
        modelKey: data.modelKey || null,
        modelName: data.modelName,
        rating: data.rating ? parseFloat(data.rating) : 0,
        votes: data.votes ? parseInt(data.votes) : 0,
        organization: data.organization,
        license: data.license || null,
        inputPrice: data.inputPrice !== undefined && data.inputPrice !== "" ? parseFloat(data.inputPrice) : null,
        outputPrice: data.outputPrice !== undefined && data.outputPrice !== "" ? parseFloat(data.outputPrice) : null,
        contextLength: data.contextLength !== undefined && data.contextLength !== "" ? parseInt(data.contextLength) : null,
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("Error creating LM Arena entry:", error);
    return NextResponse.json(
      { error: "Failed to create entry" },
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

    if (!data.entryId) {
      return NextResponse.json(
        { error: "Entry ID is required" },
        { status: 400 }
      );
    }

    const existing = await prisma.lmArenaEntry.findFirst({
      where: { id: data.entryId, leaderboardId: id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Entry not found" },
        { status: 404 }
      );
    }

    const entry = await prisma.lmArenaEntry.update({
      where: { id: data.entryId },
      data: {
        rank: data.rank !== undefined ? parseInt(data.rank) : existing.rank,
        modelKey: data.modelKey !== undefined ? data.modelKey : existing.modelKey,
        modelName: data.modelName ?? existing.modelName,
        rating: data.rating !== undefined ? parseFloat(data.rating) : existing.rating,
        votes: data.votes !== undefined ? parseInt(data.votes) : existing.votes,
        organization: data.organization ?? existing.organization,
        license: data.license !== undefined ? data.license : existing.license,
        inputPrice: data.inputPrice !== undefined && data.inputPrice !== "" ? parseFloat(data.inputPrice) : existing.inputPrice,
        outputPrice: data.outputPrice !== undefined && data.outputPrice !== "" ? parseFloat(data.outputPrice) : existing.outputPrice,
        contextLength: data.contextLength !== undefined && data.contextLength !== "" ? parseInt(data.contextLength) : existing.contextLength,
      },
    });

    return NextResponse.json(entry);
  } catch (error) {
    console.error("Error updating LM Arena entry:", error);
    return NextResponse.json(
      { error: "Failed to update entry" },
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
    const { searchParams } = new URL(request.url);
    const entryId = searchParams.get("entryId");

    if (!entryId) {
      return NextResponse.json(
        { error: "Entry ID is required" },
        { status: 400 }
      );
    }

    const existing = await prisma.lmArenaEntry.findFirst({
      where: { id: entryId, leaderboardId: id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Entry not found" },
        { status: 404 }
      );
    }

    await prisma.lmArenaEntry.delete({
      where: { id: entryId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting LM Arena entry:", error);
    return NextResponse.json(
      { error: "Failed to delete entry" },
      { status: 500 }
    );
  }
}
