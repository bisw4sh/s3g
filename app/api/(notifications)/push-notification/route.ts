import { db } from "@/db";
import { users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { notificationToken } = await request.json();

    if (!notificationToken) {
      return NextResponse.json(
        { success: false, error: "Token is required" },
        { status: 400 }
      );
    }

    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log(`Attempting to update token for user ${session.user.id}`);

    const result = await db
      .update(users)
      .set({ notificationToken })
      .where(eq(users.id, session.user.id))
      .execute();

    console.log(`Update completed, rows affected: ${result.rowCount}`);

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, error: "User not found or token not updated" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Token saved successfully",
    });
  } catch (error) {
    console.error("FCM token save error:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}

