import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyAdminRequest } from "@/lib/admin/auth";

export async function GET() {
  if (!(await verifyAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const featured = await prisma.featuredModel.findMany({
    include: { model: { include: { provider: true } } },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(featured);
}

export async function PUT(request: NextRequest) {
  if (!(await verifyAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { modelIds } = await request.json();

    await prisma.$transaction(async (tx) => {
      await tx.featuredModel.deleteMany();
      if (modelIds?.length) {
        await tx.featuredModel.createMany({
          data: modelIds.map((id: string, index: number) => ({
            modelId: id,
            sortOrder: index,
          })),
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to update featured models" },
      { status: 500 }
    );
  }
}
