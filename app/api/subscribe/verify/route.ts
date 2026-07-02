import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Missing verification token" },
        { status: 400 }
      );
    }

    const subscriber = await prisma.emailSubscriber.findUnique({
      where: { verificationToken: token },
    });

    if (!subscriber) {
      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 404 }
      );
    }

    if (subscriber.verified) {
      return NextResponse.json({ message: "Already verified" }, { status: 200 });
    }

    await prisma.emailSubscriber.update({
      where: { id: subscriber.id },
      data: { verified: true, verifiedAt: new Date() },
    });

    return NextResponse.json(
      { message: "Email verified successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json(
      { error: "Failed to verify email" },
      { status: 500 }
    );
  }
}
