"use server";
import { db } from "@/db";
import { notifications, photoLikes, photosTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function likeAPhoto({ url }: { url: string }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Missing session or user ID",
      };
    }

    const likedPhoto = await db
      .insert(photoLikes)
      .values({ photoUrl: url, userId: session.user.id })
      .onConflictDoNothing()
      .returning();

    const isNewLike = likedPhoto.length > 0;

    if (isNewLike) {
      const photo = await db
        .select({ ownerId: photosTable.createdBy })
        .from(photosTable)
        .where(eq(photosTable.url, url))
        .limit(1)
        .then(rows => rows[0]);

      if (!photo) {
        return {
          success: false,
          error: "Photo not found",
        };
      }

      if (photo.ownerId !== session.user.id) {
        await db.insert(notifications).values({
          type: "like",
          title: `${session.user.name} liked your picture`,
          description: `User ${session.user.name} liked your image on ${new Date().toLocaleString()}`,
          notificationOf: photo.ownerId,
        });
      }

    }

    return {
      success: true,
      message: isNewLike ? "Image liked" : "Already liked",
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
      message: "Image like removed",
    };

  } catch (error) {
    console.error("like error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
