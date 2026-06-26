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

  const benchmark = await prisma.benchmark.findUnique({
    where: { id },
    include: {
      results: {
        orderBy: [{ rank: "asc" }, { score: "desc" }],
      },
    },
  });

  if (!benchmark) {
    return NextResponse.json(
      { error: "Benchmark not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(benchmark);
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

    const existing = await prisma.benchmark.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Benchmark not found" },
        { status: 404 }
      );
    }

    if (data.name && data.name !== existing.name) {
      const nameExists = await prisma.benchmark.findUnique({
        where: { name: data.name },
      });
      if (nameExists) {
        return NextResponse.json(
          { error: "Benchmark name already exists" },
          { status: 400 }
        );
      }
    }

    const benchmark = await prisma.benchmark.update({
      where: { id },
      data: {
        name: data.name ?? existing.name,
        description: data.description !== undefined ? data.description : existing.description,
        category: data.category !== undefined ? data.category : existing.category,
        sortOrder: data.sortOrder !== undefined ? parseInt(data.sortOrder) : existing.sortOrder,
      },
    });

    return NextResponse.json(benchmark);
  } catch (error) {
    console.error("Error updating benchmark:", error);
    return NextResponse.json(
      { error: "Failed to update benchmark" },
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

    const existing = await prisma.benchmark.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Benchmark not found" },
        { status: 404 }
      );
    }

    await prisma.benchmark.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting benchmark:", error);
    return NextResponse.json(
      { error: "Failed to delete benchmark" },
      { status: 500 }
    );
  }
}
