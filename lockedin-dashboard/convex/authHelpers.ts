import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

/**
 * Get the current authenticated user's data
 */
export const currentUser = mutation({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (userId === null) {
            throw new Error("Not authenticated");
        }

        // Get user from Convex Auth users table
        const user = await ctx.db.get(userId);
        if (!user) {
            throw new Error("User not found");
        }

        return user;
    },
});

/**
 * Check if user is authenticated (for protected routes)
 */
export const isAuthenticated = mutation({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        return userId !== null;
    },
});

/**
 * Get user by username from legacy usrs table (for migration purposes)
 */
export const getLegacyUser = mutation({
    args: { username: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("usrs")
            .withIndex("by_usrname", (q) => q.eq("username", args.username))
            .first();
    },
});
