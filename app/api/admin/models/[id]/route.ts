import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyAdminRequest } from "@/lib/admin/auth";
import { notifySubscribers, buildPriceChangeHtml } from "@/lib/notifications";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const model = await prisma.model.findUnique({
    where: { id },
    include: {
      provider: true,
      capabilities: true,
      pricingItems: true,
      featured: true,
    },
  });

  if (!model) {
    return NextResponse.json({ error: "Model not found" }, { status: 404 });
  }

  return NextResponse.json(model);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const data = await request.json();
    const priceChanges: {
      pricingType: string;
      tier: string;
      oldPrice?: number | null;
      newPrice: number;
    }[] = [];

    const model = await prisma.$transaction(async (tx) => {
      const updated = await tx.model.update({
        where: { id },
        data: {
          name: data.name,
          providerId: data.providerId,
          category: data.category,
          contextWindow: data.contextWindow
            ? parseInt(data.contextWindow)
            : null,
          maxOutput: data.maxOutput ? parseInt(data.maxOutput) : null,
          cacheRate: data.cacheRate ? parseInt(data.cacheRate) : null,
          deprecated: data.deprecated || false,
          releaseDate: data.releaseDate || null,
          knowledgeCutoff: data.knowledgeCutoff || null,
          notes: data.notes || null,
        },
      });

      // Replace capabilities
      await tx.modelCapability.deleteMany({ where: { modelId: id } });
      if (data.capabilities?.length) {
        await tx.modelCapability.createMany({
          data: data.capabilities.map((cap: string) => ({
            modelId: id,
            capability: cap,
          })),
        });
      }

      // Record price history before replacing
      const oldPricing = await tx.pricingItem.findMany({
        where: { modelId: id },
      });

      for (const newItem of data.pricingItems || []) {
        const oldItem = oldPricing.find(
          (p) =>
            p.pricingType === newItem.pricingType && p.tier === newItem.tier
        );
        const newPrice = parseFloat(String(newItem.price));
        if (oldItem && oldItem.price !== newPrice) {
          priceChanges.push({
            pricingType: newItem.pricingType,
            tier: newItem.tier || "standard",
            oldPrice: oldItem.price,
            newPrice,
          });
          await tx.priceHistory.create({
            data: {
              modelId: id,
              pricingType: newItem.pricingType,
              tier: newItem.tier || "standard",
              oldPrice: oldItem.price,
              newPrice: newPrice,
            },
          });
        }
      }

      await tx.pricingItem.deleteMany({ where: { modelId: id } });
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
              modelId: id,
              pricingType: p.pricingType,
              tier: p.tier || "standard",
              price: parseFloat(String(p.price)),
              unit: p.unit || "per_million",
              conditions: p.conditions || null,
            })
          ),
        });
      }

      return updated;
    });

    if (priceChanges.length > 0) {
      void notifySubscribers((locale) => {
        const isZh = locale === "zh";
        return {
          subject: isZh
            ? `价格更新：${model.name}`
            : `Price update: ${model.name}`,
          html: buildPriceChangeHtml(model.name, priceChanges, locale),
        };
      });
    }

    return NextResponse.json(model);
  } catch (e) {
    console.error("Failed to update model:", e);
    return NextResponse.json(
      { error: "Failed to update model" },
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

  const { id } = await params;

  try {
    await prisma.model.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete model" },
      { status: 500 }
    );
  }
}
