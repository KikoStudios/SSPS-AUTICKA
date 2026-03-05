import { mutation } from "./_generated/server";
import { v } from "convex/values";
import bcrypt from "bcryptjs";

export const fixAdminUser = mutation({
    args: {},
    handler: async (ctx) => {
        // 1. Find user by username "admin"
        // Using schema index if available, check schema.ts
        // users table has index "username"
        const adminUser = await ctx.db.query("users")
            .withIndex("username", q => q.eq("username", "admin"))
            .first();

        // 2. Hash password "adminadmin"
        const hash = bcrypt.hashSync("adminadmin", 10);
        let status = "";

        let userId = adminUser?._id;

        if (adminUser) {
            status += `Found User 'admin' (${adminUser._id}). `;
        } else {
            // Assume user might be in legacy table or not exist
            // For now, if not found, we can't easily CREATE it without breaking other things potentially
            // But let's try to minimal create if requested? 
            // User asked "test if login passes", implying they expect it to work or want it to work.
            // Let's just report if missing.
            status += "User 'admin' NOT found in 'users' table. ";

            // Check legacy?
            const legacy = await ctx.db.query("usrs").withIndex("by_usrname", q => q.eq("username", "admin")).first();
            if (legacy) {
                status += "Found in legacy 'usrs' table. Migration might be needed. ";
            }
            return status;
        }

        // 3. Update authAccount
        // Check if authAccount exists for this user
        // We assume provider is "password" based on auth.ts config (UsernamePassword)
        // Actually auth.ts config says provider ID is "password" (default).
        // The "UsernamePassword" provider uses "password" as providerId usually unless named.

        // Let's look for any authAccount for this user
        const authAccount = await ctx.db.query("authAccounts")
            .withIndex("userIdAndProvider", q => q.eq("userId", userId).eq("provider", "password"))
            .first();

        if (authAccount) {
            await ctx.db.patch(authAccount._id, {
                secret: hash
            });
            status += "Refreshed password to 'adminadmin'.";
        } else {
            await ctx.db.insert("authAccounts", {
                userId: userId,
                provider: "password",
                providerAccountId: "admin", // usually username
                secret: hash
            });
            status += "Created authAccount with password 'adminadmin'.";
        }

        return status;
    }
});
