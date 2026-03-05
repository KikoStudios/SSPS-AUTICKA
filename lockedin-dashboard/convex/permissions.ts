import { QueryCtx, MutationCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Check if the authenticated user has the 'admin' role.
 * Throws an error if not authenticated or not an admin.
 */
export async function checkAdmin(ctx: QueryCtx | MutationCtx) {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
        throw new Error("Unauthorized: Authentication required");
    }

    const user = await ctx.db.get(userId);
    if (!user) {
        throw new Error("Unauthorized: User not found");
    }

    // Parse usrData to check role
    let role = "";
    if (user.usrData) {
        try {
            const data = JSON.parse(user.usrData);
            role = data.role;
        } catch (e) {
            console.error("Failed to parse usrData for admin check");
        }
    }

    if (role !== "admin") {
        throw new Error("Unauthorized: Admin privileges required");
    }

    return user;
}
