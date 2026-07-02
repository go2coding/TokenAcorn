import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyAdminRequest } from "@/lib/admin/auth";
import { sendNotificationEmail, isEmailConfigured } from "@/lib/email";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  if (!(await verifyAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isEmailConfigured()) {
    return NextResponse.json(
      { error: "Email service is not configured" },
      { status: 503 }
    );
  }

  try {
    const data = await request.json();
    const { to, subject, html, locale } = data;

    if (!to || typeof to !== "string" || !isValidEmail(to)) {
      return NextResponse.json(
        { error: "Invalid recipient email" },
        { status: 400 }
      );
    }

    if (!subject || typeof subject !== "string" || subject.trim() === "") {
      return NextResponse.json(
        { error: "Subject is required" },
        { status: 400 }
      );
    }

    if (!html || typeof html !== "string" || html.trim() === "") {
      return NextResponse.json(
        { error: "HTML content is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = to.toLowerCase().trim();
    const subscriber = await prisma.emailSubscriber.findUnique({
      where: { email: normalizedEmail },
    });

    const emailLocale = locale || subscriber?.locale || "en";

    await sendNotificationEmail(
      normalizedEmail,
      subject,
      html,
      subscriber?.unsubscribeToken || "",
      emailLocale
    );

    return NextResponse.json({
      success: true,
      message: "Email sent",
      to: normalizedEmail,
    });
  } catch (error) {
    console.error("Send email error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
