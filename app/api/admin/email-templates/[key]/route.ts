import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyAdminRequest } from "@/lib/admin/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  if (!(await verifyAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { key } = await params;
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get("locale") || "en";
    const data = await request.json();

    if (!data.subject || !data.htmlBody) {
      return NextResponse.json(
        { error: "Subject and HTML body are required" },
        { status: 400 }
      );
    }

    const updated = await prisma.emailTemplate.update({
      where: {
        key_locale: {
          key,
          locale,
        },
      },
      data: {
        subject: data.subject,
        htmlBody: data.htmlBody,
      },
    });

    return NextResponse.json({
      id: updated.id,
      key: updated.key,
      name: updated.name,
      locale: updated.locale,
      subject: updated.subject,
      htmlBody: updated.htmlBody,
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("Failed to update email template:", error);
    return NextResponse.json(
      { error: "Failed to update email template" },
      { status: 500 }
    );
  }
}
