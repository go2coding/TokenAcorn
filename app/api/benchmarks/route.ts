import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const benchmarks = await prisma.benchmark.findMany({
      include: {
        results: {
          orderBy: [{ rank: "asc" }, { score: "desc" }],
        },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    return NextResponse.json(benchmarks);
  } catch (error) {
    console.error("Error fetching benchmarks:", error);
    return NextResponse.json(
      { error: "Failed to fetch benchmarks" },
      { status: 500 }
    );
  }
}
