import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { photosTable, photoLikes } from "@/db/schema";
import { sql, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { AuthSession } from "@/lib/auth-types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const session = await auth.api.getSession({
      query: {
        disableCookieCache: true,
      },
      headers: req.headers,
    }) as AuthSession;

    const offset = (page - 1) * limit;
    const userId = session?.user.id;

    const photosQuery = db
      .select({
        photo: photosTable,
        likeCount: sql<number>`count(${photoLikes.photoUrl})`.as("likeCount"),
        userLiked: userId
          ? sql<boolean>`
              CASE 
                WHEN EXISTS (
                  SELECT 1 
                  FROM ${photoLikes} 
                  WHERE ${photoLikes.photoUrl} = ${photosTable.url} 
                  AND ${photoLikes.userId} = ${userId}
                ) THEN TRUE 
                ELSE FALSE 
              END
            `.as("userLiked")
          : sql<boolean>`FALSE`.as("userLiked"),
      })
      .from(photosTable)
      .leftJoin(photoLikes, eq(photoLikes.photoUrl, photosTable.url))
      .groupBy(photosTable.url)
      .limit(limit)
      .offset(offset);

    const countQuery = db.select({ count: sql<number>`count(*)` }).from(photosTable);

    const [photosResult, [{ count }]] = await Promise.all([photosQuery, countQuery]);

    const photos = photosResult.map(({ photo, likeCount, userLiked }) => ({
      ...photo,
      likes: {
        count: +likeCount,
        liked: userLiked,
      },
    }));

    return NextResponse.json({
      success: true,
      data: photos,
      page,
      limit,
      count: +count,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error("Error fetching photos:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
