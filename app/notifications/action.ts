"use server";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { auth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function markAsRead() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id)
      return false

    const marked_as_read = await db.update(notifications)
      .set({ readStatus: true })
      .where(and(eq(notifications.notificationOf, session?.user?.id),
        eq(notifications.readStatus, false))).returning()

    return {
      success: true,
      markAsRead: marked_as_read
    }
  } catch (error) {
    console.error(error);
    throw error
  }
}
