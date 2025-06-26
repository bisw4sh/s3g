import { NextResponse } from "next/server";
import { db } from "@/db";
import { photosTable } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const offset = (page - 1) * limit;

    const [photos, [{ count }]] = await Promise.all([
      db.select().from(photosTable).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(photosTable),
    ]);

    return NextResponse.json({
      success: true,
      data: photos,
      page,
      limit,
      count,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error("Error fetching photos:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

