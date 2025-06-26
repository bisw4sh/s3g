"use server";
import { db } from "@/db";
import { photosTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function deletePhotoMyPhoto({
  url,
}: {
  url: string;
}) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return {
        success: false,
        error: "Missing session"
      }
    }

    const deletedPhoto = await db
      .delete(photosTable)
      .where(eq(photosTable.url, url))
      .returning();

    console.log(deletedPhoto)
    return {
      success: true,
      message: "Image deleted successfully"
    };

  } catch (error) {
    console.error("deletePhoto error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}
