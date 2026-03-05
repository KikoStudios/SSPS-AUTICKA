import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const currentUser = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            return null;
        }

        const user = await ctx.db.get(userId);
        if (!user) {
            return null;
        }

        // Parse usrData if it exists and is a string
        let parsedUsrData = {};
        if (user.usrData) {
            try {
                parsedUsrData = JSON.parse(user.usrData);
            } catch (e) {
                console.error("Failed to parse usrData", e);
            }
        }

        return {
            ...user,
            ...parsedUsrData, // Spread parsed usrData so role/plugins are top-level if needed, or structured
            // But wait, the dashboad expects userData object inside auth context.
            // Let's return the user structure that matches what dashboard expects if possible.
            // The dashboard expects:
            // interface UserData {
            //   role?: string;
            //   createdAt?: string;
            //   permissions?: string[];
            //   isActive?: boolean;
            //   plugins?: string;
            // }
            // So I should return that.
        };
    },
});
