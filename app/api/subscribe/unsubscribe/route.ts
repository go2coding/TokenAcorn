import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Missing unsubscribe token" },
        { status: 400 }
      );
    }

    const subscriber = await prisma.emailSubscriber.findUnique({
      where: { unsubscribeToken: token },
    });

    if (!subscriber) {
      return NextResponse.json(
        { error: "Invalid unsubscribe token" },
        { status: 404 }
      );
    }

    await prisma.emailSubscriber.delete({
      where: { id: subscriber.id },
    });

    return NextResponse.json(
      { message: "Unsubscribed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return NextResponse.json(
      { error: "Failed to unsubscribe" },
      { status: 500 }
    );
  }
}
