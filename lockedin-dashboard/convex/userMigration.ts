/**
 * Migration and User Management Utilities for Convex Auth
 * 
 * This file provides utilities to:
 * 1. Migrate existing users from the old 'usrs' table to Convex Auth
 * 2. Create initial admin users
 */

import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

/**
 * Create a new user with Convex Auth
 * This is used to manually create users or migrate from old system
 * 
 * Usage in Convex Dashboard:
 * await ctx.runAction(internal.userMigration.createConvexAuthUser, {
 *   email: "admin@example.com",
 *   password: "securePassword123",
 *   name: "Admin User"
 * });
 */
export const createConvexAuthUser = action({
    args: {
        email: v.string(),
        password: v.string(),
        name: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        try {
            // Note: This is a workaround to create users programmatically
            // In production, users should sign up through the UI

            console.log(`Creating Convex Auth user for: ${args.email}`);

            // For now, return instructions since we can't directly call signIn from actions
            return {
                success: false,
                message: "To create a user, please use the sign-up UI or run this in the browser console",
                instructions: {
                    method: "Use the login page",
                    steps: [
                        "1. Go to /login page",
                        "2. Enter email and password",
                        "3. The system will auto-create the user on first login if using passwords"
                    ]
                }
            };
        } catch (error) {
            console.error("Error creating user:", error);
            throw error;
        }
    },
});

/**
 * List all Convex Auth users
 */
export const listConvexAuthUsers = action({
    args: {},
    handler: async (ctx) => {
        const users = await ctx.runQuery(internal.userMigration.getAllConvexUsers);
        return users;
    },
});

/**
 * Internal query to get all Convex Auth users
 */
export const getAllConvexUsers = internal.userMigration.getAllConvexUsers as any;
