import { db } from "@/db";
import { notifications } from "@/db/schema";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { count, desc, eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user?.id) {
      return NextResponse.json({
        status: 401,
        message: "user isn't authenticated to fetch the notifications"
      })
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = (page - 1) * limit;

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const [userNotifications, [{ count: totalCount }]] = await Promise.all([db
      .select()
      .from(notifications)
      .where(eq(notifications.notificationOf, session.user.id))
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset)
      ,
    db
      .select({ count: count() })
      .from(notifications)
      .where(eq(notifications.notificationOf, session.user.id))]);

    return NextResponse.json({
      msg: "notifications of the authenticated user",
      data: userNotifications,
      count: +totalCount,
      limit,
      page,
      totalPages: Math.ceil(totalCount / limit)
    });

  } catch (error) {
    console.error("Error fetching notifications:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
