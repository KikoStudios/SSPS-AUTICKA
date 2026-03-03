import { query } from "./_generated/server";

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
