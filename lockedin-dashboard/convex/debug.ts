import { query } from "./_generated/server";

export const getEnv = query({
    args: {},
    handler: async () => {
        return {
            JWT_PRIVATE_KEY: {
                exists: !!process.env.JWT_PRIVATE_KEY,
                firstChar: process.env.JWT_PRIVATE_KEY ? process.env.JWT_PRIVATE_KEY.charAt(0) : null,
                firstCharCode: process.env.JWT_PRIVATE_KEY ? process.env.JWT_PRIVATE_KEY.charCodeAt(0) : null,
                startsWithBackslash: process.env.JWT_PRIVATE_KEY ? process.env.JWT_PRIVATE_KEY.startsWith("\\") : false,
                length: process.env.JWT_PRIVATE_KEY ? process.env.JWT_PRIVATE_KEY.length : 0,
                snippet: process.env.JWT_PRIVATE_KEY ? process.env.JWT_PRIVATE_KEY.substring(0, 50) : null
            },
            JWKS: {
                exists: !!process.env.JWKS,
                firstChar: process.env.JWKS ? process.env.JWKS.charAt(0) : null,
                firstCharCode: process.env.JWKS ? process.env.JWKS.charCodeAt(0) : null,
                startsWithBackslash: process.env.JWKS ? process.env.JWKS.startsWith("\\") : false,
                length: process.env.JWKS ? process.env.JWKS.length : 0,
                snippet: process.env.JWKS ? process.env.JWKS.substring(0, 50) : null
            },
            CONVEX_AUTH_PRIVATE_KEY: {
                exists: !!process.env.CONVEX_AUTH_PRIVATE_KEY,
                snippet: process.env.CONVEX_AUTH_PRIVATE_KEY ? process.env.CONVEX_AUTH_PRIVATE_KEY.substring(0, 50) : null
            }
        };
    },
});
