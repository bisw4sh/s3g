import { db } from "@/db";
import { auth } from "@/lib/auth";
import { photosTable } from "@/db/schema";
import { EUserRole } from "@/types/common/roles";
import { eq } from "drizzle-orm";
import { AuthSession } from "@/lib/auth-types";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      query: {
        disableCookieCache: true,
      },
      headers: request.headers,
    }) as AuthSession;

    if (!session?.user?.role || session.user.role !== EUserRole.ADMIN) {
      return Response.json(
        { error: "Unauthorized: Admin privileges required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { url } = body;

    await db.delete(photosTable).where(eq(photosTable.url, url))

    return Response.json(
      { success: true, message: "Image deleted" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[ROLE_ASSIGNMENT_ERROR]:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
