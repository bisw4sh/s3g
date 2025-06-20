import { db } from "@/db";
import { auth } from "@/lib/auth";
import { schema } from "@/db/schema";
import { EUserRole } from "@/types/common/roles";
import { eq } from "drizzle-orm";
import { AuthSession } from "@/lib/auth-types";

export async function POST(request: Request) {
  try {
    // 1. Verify admin privileges
    const session = await auth.api.getSession({
      query: {
        disableCookieCache: true,
      },
      headers: request.headers,
    }) as AuthSession;

    // Check if session exists and user has admin role
    if (!session?.user?.role || session.user.role !== EUserRole.ADMIN) {
      return Response.json(
        { error: "Unauthorized: Admin privileges required" },
        { status: 403 }
      );
    }

    // 2. Validate input
    const body = await request.json();
    const { userId, newRole } = body;

    if (!userId) {
      return Response.json({ error: "Invalid user ID" }, { status: 400 });
    }

    if (!Object.values(EUserRole).includes(newRole)) {
      return Response.json(
        {
          error: `Invalid role. Allowed values: ${Object.values(
            EUserRole
          ).join(", ")}`,
        },
        { status: 400 }
      );
    }

    // 3. Update role
    const result = await db
      .update(schema.users)
      .set({ role: newRole })
      .where(eq(schema.users.id, userId));

    // Check if update was successful (result structure may vary by database)
    if (!result || result.rowCount === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json(
      { success: true, message: `Role updated to ${newRole}` },
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
