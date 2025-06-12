"use server";
import { db } from "@/db";
import { photosTable } from "@/db/schema";
import { getPresignedUrl } from "@/lib/s3";

export async function generateUploadUrl(fileName: string, fileType: string) {
  return await getPresignedUrl(fileName, fileType);
}

export async function savePhoto({
  title,
  description,
  fileName,
  author,
}: {
  title: string;
  description: string;
  fileName: string;
  author: string;
}) {
  const imageUrl =
    `${process.env.BUCKET_URL}/${fileName}`;
  await db.insert(photosTable).values({ title, description, url: imageUrl, author });
}
