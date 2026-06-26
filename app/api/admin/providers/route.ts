import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyAdminRequest } from "@/lib/admin/auth";

export async function GET() {
  if (!(await verifyAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const providers = await prisma.provider.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { models: true } } },
  });

  return NextResponse.json(providers);
}

export async function POST(request: NextRequest) {
  if (!(await verifyAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();

    if (!data.id || !data.name) {
      return NextResponse.json(
        { error: "ID and name are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.provider.findUnique({
      where: { id: data.id },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Provider ID already exists" },
        { status: 400 }
      );
    }

    const provider = await prisma.provider.create({
      data: {
        id: data.id,
        name: data.name,
        website: data.website || null,
        logoFormat: data.logoFormat || null,
      },
    });

    return NextResponse.json(provider, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create provider" }, { status: 500 });
  }
}
