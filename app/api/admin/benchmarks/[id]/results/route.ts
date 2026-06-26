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

  const { id } = await params;

  const results = await prisma.benchmarkResult.findMany({
    where: { benchmarkId: id },
    orderBy: [{ rank: "asc" }, { score: "desc" }],
  });

  return NextResponse.json(results);
}

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

    if (!data.modelName || !data.provider || data.score === undefined) {
      return NextResponse.json(
        { error: "Model name, provider, and score are required" },
        { status: 400 }
      );
    }

    const benchmark = await prisma.benchmark.findUnique({
      where: { id },
    });

    if (!benchmark) {
      return NextResponse.json(
        { error: "Benchmark not found" },
        { status: 404 }
      );
    }

    const result = await prisma.benchmarkResult.create({
      data: {
        benchmarkId: id,
        modelName: data.modelName,
        provider: data.provider,
        score: parseFloat(String(data.score)),
        rank: data.rank ? parseInt(data.rank) : 0,
      },
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating benchmark result:", error);
    return NextResponse.json(
      { error: "Failed to create benchmark result" },
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

    if (!data.resultId) {
      return NextResponse.json(
        { error: "Result ID is required" },
        { status: 400 }
      );
    }

    const existing = await prisma.benchmarkResult.findFirst({
      where: { id: data.resultId, benchmarkId: id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Benchmark result not found" },
        { status: 404 }
      );
    }

    const result = await prisma.benchmarkResult.update({
      where: { id: data.resultId },
      data: {
        modelName: data.modelName ?? existing.modelName,
        provider: data.provider ?? existing.provider,
        score: data.score !== undefined ? parseFloat(String(data.score)) : existing.score,
        rank: data.rank !== undefined ? parseInt(data.rank) : existing.rank,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating benchmark result:", error);
    return NextResponse.json(
      { error: "Failed to update benchmark result" },
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
    const resultId = searchParams.get("resultId");

    if (!resultId) {
      return NextResponse.json(
        { error: "Result ID is required" },
        { status: 400 }
      );
    }

    const existing = await prisma.benchmarkResult.findFirst({
      where: { id: resultId, benchmarkId: id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Benchmark result not found" },
        { status: 404 }
      );
    }

    await prisma.benchmarkResult.delete({
      where: { id: resultId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting benchmark result:", error);
    return NextResponse.json(
      { error: "Failed to delete benchmark result" },
      { status: 500 }
    );
  }
}
