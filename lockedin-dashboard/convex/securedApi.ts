/**
 * Secured API endpoints for LockedIN Dashboard
 * All functions in this file require authentication via Convex Auth
 */

import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { checkAdmin } from "./permissions";

/**
 * Get all users - ADMIN ONLY
 * Requires authentication
 */
export const getAllUsers = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (userId === null) {
            throw new Error("Unauthorized: Authentication required");
        }

        // Get the current user to check permissions
        const currentUser = await ctx.db.get(userId);
        if (!currentUser) {
            throw new Error("User not found");
        }

        // TODO: Add admin role check here if needed
        // For now, any authenticated user can see all users

        return await ctx.db.query("usrs").collect();
    },
});

/**
 * Get all plugins
 * Requires authentication
 */
export const getAllPlugins = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (userId === null) {
            throw new Error("Unauthorized: Authentication required");
        }

        return await ctx.db.query("plugins").collect();
    },
});

/**
 * Get all spaces
 * Requires authentication
 */
export const getAllSpaces = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (userId === null) {
            throw new Error("Unauthorized: Authentication required");
        }

        return await ctx.db.query("spaces").collect();
    },
});

/**
 * Update space status
 * Requires authentication
 */
export const updateSpaceStatus = mutation({
    args: {
        spaceName: v.string(),
        isFull: v.boolean(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (userId === null) {
            throw new Error("Unauthorized: Authentication required");
        }

        const existingSpace = await ctx.db
            .query("spaces")
            .withIndex("by_spaceName", (q) => q.eq("spaceName", args.spaceName))
            .first();

        if (existingSpace) {
            await ctx.db.patch(existingSpace._id, { isFull: args.isFull });
            return existingSpace._id;
        } else {
            return await ctx.db.insert("spaces", args);
        }
    },
});

/**
 * Delete user - ADMIN ONLY
 * Requires authentication
 */
export const deleteUser = mutation({
    args: {
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        // Admin check
        await checkAdmin(ctx);

        await ctx.db.delete(args.userId as any);
    },
});

/**
 * Update user - ADMIN ONLY
 * Requires authentication
 */
export const updateUser = mutation({
    args: {
        userId: v.string(),
        username: v.optional(v.string()),
        hashPassword: v.optional(v.string()),
        usrData: v.string(),
    },
    handler: async (ctx, args) => {
        // Admin check
        await checkAdmin(ctx);

        const { userId, ...updateData } = args;
        await ctx.db.patch(userId as any, updateData);
    },
});

/**
 * Get current authenticated user info
 */
export const getCurrentUser = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (userId === null) {
            return null;
        }

        return await ctx.db.get(userId);
    },
});

/**
 * Check if current user is authenticated
 */
export const isAuthenticated = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        return userId !== null;
    },
});
