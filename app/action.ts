"use server";
import { db } from "@/db";
import { photoLikes } from "@/db/schema";
import { auth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function likeAPhoto({ url }: { url: string }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user?.id) {
      return {
        success: false,
        error: "Missing session or user ID",
      };
    }

    await db
      .insert(photoLikes)
      .values({ photoUrl: url, userId: session.user.id })
      .onConflictDoNothing();

    return {
      success: true,
      message: "Image liked",
    };
  } catch (error) {
    console.error("like error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}


export async function unLikeAPhoto({ url }: { url: string }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user?.id) {
      return {
        success: false,
        error: "Missing session or user ID",
      };
    }

    await db
      .delete(photoLikes)
      .where(
        and(
          eq(photoLikes.photoUrl, url),
          eq(photoLikes.userId, session?.user?.id)
        )
      )

    return {
      success: true,
      message: "Image liked",
    };

  } catch (error) {
    console.error("like error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
