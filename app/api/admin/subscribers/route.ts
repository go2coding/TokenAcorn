import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyAdminRequest } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await verifyAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const subscribers = await prisma.emailSubscriber.findMany({
      orderBy: [{ verified: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(
      subscribers.map((s) => ({
        id: s.id,
        email: s.email,
        verified: s.verified,
        locale: s.locale,
        createdAt: s.createdAt.toISOString(),
        verifiedAt: s.verifiedAt?.toISOString() ?? null,
      }))
    );
  } catch (error) {
    console.error("Failed to fetch subscribers:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscribers" },
      { status: 500 }
    );
  }
}
