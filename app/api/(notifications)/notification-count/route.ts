import { db } from "@/db";
import { notifications } from "@/db/schema";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { and, count, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          message: "User is not authenticated to fetch the notifications",
        },
        { status: 401 }
      );
    }

    const [{ count: totalCount }] = await db
      .select({ count: count() })
      .from(notifications)
      .where(and(eq(notifications.notificationOf, session.user.id), eq(notifications.readStatus, false)));

    return NextResponse.json({
      msg: "Notifications count of the authenticated user",
      count: +totalCount,
    });
  } catch (error) {
    console.error("Error fetching notification count:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

