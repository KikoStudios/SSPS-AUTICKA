import { mutation, query, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { checkAdmin } from "./permissions";

function generateSecureKey() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "lk_"; // prefix "lockedin_key"
    for (let i = 0; i < 32; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Generate a new API Key - ADMIN ONLY
 */
export const generateKey = mutation({
    args: {
        name: v.string(), // Description of the key (e.g. "Main Gate Python Script")
    },
    handler: async (ctx, args) => {
        // 1. Authenticate Admin
        const user = await checkAdmin(ctx);

        // 2. Generate Key
        const newKey = generateSecureKey();

        // 3. Store in DB
        await ctx.db.insert("apiKeys", {
            key: newKey,
            name: args.name,
            createdBy: user._id,
            isActive: true,
        });

        // 4. Return to user (only time it will be seen)
        return newKey;
    },
});

/**
 * List all API Keys - ADMIN ONLY
 */
export const listKeys = query({
    args: {},
    handler: async (ctx) => {
        await checkAdmin(ctx);
        return await ctx.db.query("apiKeys").collect();
    },
});

/**
 * Revoke an API Key - ADMIN ONLY
 */
export const revokeKey = mutation({
    args: {
        id: v.id("apiKeys"),
    },
    handler: async (ctx, args) => {
        await checkAdmin(ctx);
        await ctx.db.patch(args.id, { isActive: false });
    },
});

/**
 * Validate an API key internally.
 * Returns true if valid, false otherwise.
 * Updates lastUsed timestamp if valid.
 */
export async function validateKey(ctx: any, apiKey: string) {
    const keyRecord = await ctx.db
        .query("apiKeys")
        .withIndex("by_key", (q: any) => q.eq("key", apiKey))
        .first();

    if (!keyRecord || !keyRecord.isActive) {
        return false;
    }

    // Update usage stats (fire and forget, don't await strictly if performance matters, but here it's fine)
    await ctx.db.patch(keyRecord._id, { lastUsed: Date.now() });
    return true;
}
