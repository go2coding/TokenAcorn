import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyAdminRequest } from "@/lib/admin/auth";
import { ensureDefaultTemplates } from "@/lib/email-templates";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!(await verifyAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureDefaultTemplates();

    const { searchParams } = new URL(request.url);
    const locale = searchParams.get("locale");

    const templates = await prisma.emailTemplate.findMany({
      where: locale ? { locale } : undefined,
      orderBy: [{ key: "asc" }, { locale: "asc" }],
    });

    return NextResponse.json(
      templates.map((t) => ({
        id: t.id,
        key: t.key,
        name: t.name,
        locale: t.locale,
        subject: t.subject,
        htmlBody: t.htmlBody,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error("Failed to fetch email templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch email templates" },
      { status: 500 }
    );
  }
}
