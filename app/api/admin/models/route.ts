import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyAdminRequest } from "@/lib/admin/auth";

export async function GET(request: NextRequest) {
  if (!(await verifyAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const providerId = searchParams.get("providerId");

  const models = await prisma.model.findMany({
    where: providerId ? { providerId } : undefined,
    include: {
      provider: true,
      capabilities: true,
      pricingItems: true,
      featured: true,
    },
    orderBy: [{ providerId: "asc" }, { name: "asc" }],
  });

  return NextResponse.json(models);
}

export async function POST(request: NextRequest) {
  if (!(await verifyAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();

    if (!data.id || !data.name || !data.providerId) {
      return NextResponse.json(
        { error: "ID, name, and provider are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.model.findUnique({
      where: { id: data.id },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Model ID already exists" },
        { status: 400 }
      );
    }

    const model = await prisma.$transaction(async (tx) => {
      const newModel = await tx.model.create({
        data: {
          id: data.id,
          name: data.name,
          providerId: data.providerId,
          category: data.category || "general",
          contextWindow: data.contextWindow ? parseInt(data.contextWindow) : null,
          maxOutput: data.maxOutput ? parseInt(data.maxOutput) : null,
          cacheRate: data.cacheRate ? parseInt(data.cacheRate) : null,
          deprecated: data.deprecated || false,
          releaseDate: data.releaseDate || null,
          knowledgeCutoff: data.knowledgeCutoff || null,
          notes: data.notes || null,
        },
      });

      if (data.capabilities?.length) {
        await tx.modelCapability.createMany({
          data: data.capabilities.map((cap: string) => ({
            modelId: newModel.id,
            capability: cap,
          })),
        });
      }

      if (data.pricingItems?.length) {
        await tx.pricingItem.createMany({
          data: data.pricingItems.map(
            (p: {
              pricingType: string;
              tier?: string;
              price: number;
              unit?: string;
              conditions?: string;
            }) => ({
              modelId: newModel.id,
              pricingType: p.pricingType,
              tier: p.tier || "standard",
              price: parseFloat(String(p.price)),
              unit: p.unit || "per_million",
              conditions: p.conditions || null,
            })
          ),
        });
      }

      return newModel;
    });

    return NextResponse.json(model, { status: 201 });
  } catch (e) {
    console.error("Failed to create model:", e);
    return NextResponse.json(
      { error: "Failed to create model" },
      { status: 500 }
    );
  }
}
