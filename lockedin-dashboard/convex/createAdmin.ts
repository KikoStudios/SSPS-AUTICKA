/**
 * Create Admin Account
 * Run this to create a new admin user with Convex Auth
 */

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Create admin account: username "admin", password "adminadmin"
 * Run this in Convex Dashboard
 */
export const createAdminAccount = internalAction({
    args: {},
    handler: async (ctx) => {
        try {
            // Use the auth.signIn to create aaccount with sign-up flow
            // Note: This needs to be done differently since we can't call signIn directly from actions

            // Instead, we'll create the user and account manually
            const username = "admin";
            const password = "adminadmin";

            // Check if admin already exists
            const existingUser = await ctx.runQuery(internal.devHelpers.getUserDetails, { username: "admin" });

            if (existingUser.existsInAuthTable) {
                return {
                    success: false,
                    message: "Admin user already exists in auth table",
                    suggestion: "Use the login page to sign in, or delete the existing admin first",
                };
            }

            return {
                success: false,
                message: "Please create the admin account through the login page",
                instructions: [
                    "1. Go to http://localhost:3000/login",
                    "2. Enter username: admin",
                    "3. Enter password: adminadmin",
                    "4. Click LOGIN",
                    "5. The account will be created automatically on first login",
                ],
                note: "Convex Auth will create the account when you first try to log in with sign-up flow",
            };

        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    },
});
