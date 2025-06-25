import { db } from "@/db";
import { photosTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const photos = await db
      .select()
      .from(photosTable)
      .where(eq(photosTable.createdBy, session.user.id));

    return NextResponse.json({
      success: true,
      data: photos,
      count: photos.length
    });
  } catch (error) {
    console.error("Error fetching photos:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
