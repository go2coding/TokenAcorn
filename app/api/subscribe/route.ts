import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import {
  generateToken,
  sendVerificationEmail,
  isEmailConfigured,
} from "@/lib/email";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const { email, locale = "en" } = await request.json();

    if (!email || typeof email !== "string" || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    if (!isEmailConfigured()) {
      return NextResponse.json(
        { error: "Email service is not configured" },
        { status: 503 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await prisma.emailSubscriber.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing?.verified) {
      return NextResponse.json(
        { message: "Already subscribed" },
        { status: 200 }
      );
    }

    const verificationToken = generateToken();
    const unsubscribeToken = generateToken();

    await prisma.emailSubscriber.upsert({
      where: { email: normalizedEmail },
      create: {
        email: normalizedEmail,
        verificationToken,
        unsubscribeToken,
        locale: locale || "en",
      },
      update: {
        verificationToken,
        unsubscribeToken,
        locale: locale || "en",
      },
    });

    await sendVerificationEmail(normalizedEmail, verificationToken, locale);

    return NextResponse.json(
      { message: "Verification email sent" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Subscribe error:", error);
    return NextResponse.json(
      { error: "Failed to subscribe" },
      { status: 500 }
    );
  }
}
