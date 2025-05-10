"use server";
import { db } from "@/db";
import { photosTable } from "@/db/schema";
import { getPresignedUrl } from "@/lib/s3";

export async function generateUploadUrl(fileName: string, fileType: string) {
  console.log("generateUploadUrl ", { fileName, fileType })
  return await getPresignedUrl(fileName, fileType);
}

export async function savePhoto({
  title,
  description,
  url,
  author,
}: {
  title: string;
  description: string;
  url: string;
  author: string;
}) {
  console.log("savePhoto function ", { title, description, url, author })
  await db.insert(photosTable).values({ title, description, url, author });
}
