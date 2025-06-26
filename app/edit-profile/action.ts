"use server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getPresignedUrl } from "@/lib/s3";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export async function generateUploadUrl(fileName: string, fileType: string) {
  return await getPresignedUrl(fileName, fileType);
}

export async function savePhoto({
  name,
  coverUrl,
  profileUrl
}: {
  name?: string;
  coverUrl?: string;
  profileUrl?: string;
}) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return {
        success: false,
        error: "Missing session"
      }
    }

    const updateData: Partial<{
      name: string;
      coverUrl: string;
      profileUrl: string;
    }> = {};

    if (name !== undefined || name !== "") updateData.name = name;
    if (coverUrl !== undefined) updateData.coverUrl = coverUrl;
    if (profileUrl !== undefined) updateData.profileUrl = profileUrl;

    if (Object.keys(updateData).length === 0) {
      throw new Error("No data provided to update");
    }

    const updatedUser = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, session!.user!.id!))
      .returning();

    if (updatedUser.length === 0) {
      throw new Error("User not found or update failed");
    }

    revalidatePath("/me");
    return {
      success: true,
      user: updatedUser[0],
      message: "Profile updated successfully"
    };

  } catch (error) {
    console.error("savePhoto error:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}
