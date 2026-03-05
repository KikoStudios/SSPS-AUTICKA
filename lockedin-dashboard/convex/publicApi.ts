import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Check if the instance has any users registered.
 * Used by the login page to determine if the first-time setup (admin creation) is allowed.
 * Returns boolean, checks both legacy and new auth tables.
 */
export const hasAnyUsers = query({
    args: {},
    handler: async (ctx) => {
        // Check for any user in the new auth table
        const authUser = await ctx.db.query("users").first();
        if (authUser) return true;

        // Check for any user in the legacy table (just in case migration isn't done)
        const legacyUser = await ctx.db.query("usrs").first();
        if (legacyUser) return true;

        return false;
    },
});

    /**
     * Validate an API key
     * Used by external API endpoints to authenticate requests
     */
    export const validateApiKey = query({
        args: {
            key: v.string(),
        },
        handler: async (ctx, args) => {
            const apiKey = await ctx.db
                .query("apiKeys")
                .withIndex("by_key", (q) => q.eq("key", args.key))
                .first();

            if (!apiKey) {
                return false;
            }

            // Check if key is active
            if (!apiKey.isActive) {
                return false;
            }

            // Update last used timestamp (we'll do this in a mutation, not here)
            // For now, just return validity
            return true;
        },
    });
