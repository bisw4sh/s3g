import { db } from "@/db";
import { photosTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "6", 10);
    const offset = (page - 1) * limit;

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const photos = await db
      .select()
      .from(photosTable)
      .where(eq(photosTable.createdBy, session.user.id))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(photosTable)
      .where(eq(photosTable.createdBy, session.user.id));

    return NextResponse.json({
      data: photos,
      count: Number(count),
      page,
      limit,
      totalPages: Math.ceil(Number(count) / limit),
    });
  } catch (error) {
    console.error("Error fetching photos:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
