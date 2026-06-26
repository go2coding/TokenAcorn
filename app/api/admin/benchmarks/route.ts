import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyAdminRequest } from "@/lib/admin/auth";

export async function GET(request: NextRequest) {
  if (!(await verifyAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const benchmarks = await prisma.benchmark.findMany({
    include: {
      results: {
        orderBy: [{ rank: "asc" }, { score: "desc" }],
      },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return NextResponse.json(benchmarks);
}

export async function POST(request: NextRequest) {
  if (!(await verifyAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();

    if (!data.name) {
      return NextResponse.json(
        { error: "Benchmark name is required" },
        { status: 400 }
      );
    }

    const existing = await prisma.benchmark.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Benchmark name already exists" },
        { status: 400 }
      );
    }

    const benchmark = await prisma.benchmark.create({
      data: {
        name: data.name,
        description: data.description || null,
        category: data.category || "general",
        sortOrder: data.sortOrder ? parseInt(data.sortOrder) : 0,
      },
    });

    return NextResponse.json(benchmark, { status: 201 });
  } catch (error) {
    console.error("Error creating benchmark:", error);
    return NextResponse.json(
      { error: "Failed to create benchmark" },
      { status: 500 }
    );
  }
}
