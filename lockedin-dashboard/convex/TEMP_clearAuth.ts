/**
 * TEMPORARY - Clear all auth data and start fresh
 * Run this in Convex Dashboard to delete all users and start over
 */

import { internalMutation } from "./_generated/server";

/**
 * Delete ALL users and auth accounts (fresh start)
 * ⚠️ WARNING: This deletes EVERYTHING!
 */
export const clearAllUsers = internalMutation({
    args: {},
    handler: async (ctx) => {
        // Delete all from users table
        const allUsers = await ctx.db.query("users").collect();
        for (const user of allUsers) {
            await ctx.db.delete(user._id);
        }

        // Delete all from authAccounts table
        const allAccounts = await ctx.db.query("authAccounts").collect();
        for (const account of allAccounts) {
            await ctx.db.delete(account._id);
        }

        // Delete all from authSessions table
        const allSessions = await ctx.db.query("authSessions").collect();
        for (const session of allSessions) {
            await ctx.db.delete(session._id);
        }

        return {
            success: true,
            message: "All users, accounts, and sessions deleted",
            usersDeleted: allUsers.length,
            accountsDeleted: allAccounts.length,
            sessionsDeleted: allSessions.length,
        };
    },
});
