import { db } from "@/db";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { users } from "@/db/schema";
import { EUserRole } from "@/types/common/roles";

export async function POST(request: Request) {

  try {
    // 1. Verify admin privileges
    const session = await auth.api.getSession({
      query: {
        disableCookieCache: true,
      },
      headers: request.headers,
    });

    if (!session || session.users.role !== EUserRole.ADMIN) {
      return Response.json(
        { error: "Unauthorized: Admin privileges required" },
        { status: 403 }
      );
    }

    // 2. Validate input
    const { userId, newRole } = await request.json();

    if (!userId || typeof userId !== "number") {
      return Response.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    if (!Object.values(EUserRole).includes(newRole)) {
      return Response.json(
        { error: `Invalid role. Allowed values: ${Object.values(EUserRole).join(", ")}` },
        { status: 400 }
      );
    }

    // 3. Update role
    const result = await db.update(user)
      .set({ role: newRole })
      .where(eq(user.id, userId));

    if (result.rowCount === 0) {
      return Response.json(
        { error: "User not found" },
        { status: 404 }
      );
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
