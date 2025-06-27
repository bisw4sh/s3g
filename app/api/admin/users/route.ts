import { db } from "@/db";
import { auth } from "@/lib/auth";
import { EUserRole } from "@/types/common/roles";
import { AuthSession } from "@/lib/auth-types";
import { NextRequest } from "next/server";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm/sql";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      query: { disableCookieCache: true },
      headers: request.headers,
    }) as AuthSession;

    if (!session?.user?.role || session.user.role !== EUserRole.ADMIN) {
      return Response.json(
        { error: "Unauthorized: Admin privileges required" },
        { status: 403 }
      )
    }

    const url = request.nextUrl;
    const roleParam = url.searchParams.get("role");
    const page = +(url.searchParams.get("page") ?? "1");
    const limit = +(url.searchParams.get("limit") ?? "10");
    const offset = (page - 1) * limit;

    const whereClause = roleParam
      ? eq(users.role, roleParam as EUserRole)
      : undefined;

    const [usersList, totalCountResult] = await Promise.all([
      db.select().from(users).where(whereClause).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` })
        .from(users)
        .where(whereClause),
    ]);

    const totalCount = totalCountResult[0]?.count ?? 0;

    return Response.json(
      {
        success: true,
        message: `Users${roleParam ? ` with role ${roleParam}` : ""}`,
        users: usersList,
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("error getting users", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

