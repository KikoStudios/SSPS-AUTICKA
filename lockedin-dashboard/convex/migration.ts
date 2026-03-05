/**
 * User Migration Script - Transfer from usrs to Convex Auth users table
 * 
 * This script migrates all users from the legacy usrs table to the new
 * Convex Auth users table while preserving all metadata.
 */

import { internalMutation, internalQuery, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import bcrypt from "bcryptjs";

/**
 * Step 1: Get all users from the legacy usrs table
 */
export const getAllLegacyUsers = internalQuery({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("usrs").collect();
    },
});

/**
 * Step 2: Create a user in the Convex Auth users table
 * This is an internal mutation that bypasses normal auth checks
 */
export const createAuthUser = internalMutation({
    args: {
        username: v.string(),
        hashedPassword: v.string(),
        usrData: v.string(),
    },
    handler: async (ctx, args) => {
        // Check if user already exists in auth users table
        const existingUser = await ctx.db
            .query("users")
            .withIndex("username", (q) => q.eq("username", args.username))
            .first();

        if (existingUser) {
            console.log(`User ${args.username} already exists in auth users table, skipping...`);
            return { success: false, message: "User already exists", userId: existingUser._id };
        }

        // Create user in Convex Auth users table
        const userId = await ctx.db.insert("users", {
            email: args.username, // Store username in email field (Convex Auth requires this)
            name: args.username,
            username: args.username, // Also store in username field
            usrData: args.usrData,
            emailVerificationTime: undefined,
            phone: undefined,
            phoneVerificationTime: undefined,
            isAnonymous: false,
            image: undefined,
        });

        // Create an account in authAccounts table with the hashed password
        await ctx.db.insert("authAccounts", {
            userId,
            provider: "password",
            providerAccountId: args.username,
            secret: args.hashedPassword, // Store the already-hashed password
        });

        return { success: true, userId, message: "User created successfully" };
    },
});

/**
 * Step 3: Migration action - runs the entire migration
 * Run this from the Convex dashboard to migrate all users
 */
export const migrateAllUsers = internalAction({
    args: {},
    handler: async (ctx) => {
        console.log("=== Starting User Migration ===");

        // Get all users from legacy table
        const legacyUsers = await ctx.runQuery(internal.migration.getAllLegacyUsers);

        console.log(`Found ${legacyUsers.length} users to migrate`);

        const results = {
            total: legacyUsers.length,
            successful: 0,
            failed: 0,
            skipped: 0,
            errors: [] as string[],
        };

        for (const user of legacyUsers) {
            try {
                console.log(`Migrating user: ${user.username}`);

                const result = await ctx.runMutation(internal.migration.createAuthUser, {
                    username: user.username,
                    hashedPassword: user.hashPassword,
                    usrData: user.usrData,
                });

                if (result.success) {
                    results.successful++;
                    console.log(`✓ Successfully migrated: ${user.username}`);
                } else {
                    results.skipped++;
                    console.log(`⊘ Skipped (already exists): ${user.username}`);
                }
            } catch (error) {
                results.failed++;
                const errorMsg = `✗ Failed to migrate ${user.username}: ${error}`;
                console.error(errorMsg);
                results.errors.push(errorMsg);
            }
        }

        console.log("\n=== Migration Complete ===");
        console.log(`Total users: ${results.total}`);
        console.log(`Successfully migrated: ${results.successful}`);
        console.log(`Skipped (already exist): ${results.skipped}`);
        console.log(`Failed: ${results.failed}`);

        if (results.errors.length > 0) {
            console.log("\nErrors:");
            results.errors.forEach(err => console.log(err));
        }

        return results;
    },
});

/**
 * Helper: Check migration status
 * See how many users are in each table
 */
export const checkMigrationStatus = internalQuery({
    args: {},
    handler: async (ctx) => {
        const legacyUsers = await ctx.db.query("usrs").collect();
        const authUsers = await ctx.db.query("users").collect();

        return {
            legacyUsersCount: legacyUsers.length,
            authUsersCount: authUsers.length,
            legacyUsers: legacyUsers.map(u => ({
                username: u.username,
                hasMetadata: !!u.usrData,
            })),
            authUsers: authUsers.map(u => ({
                username: u.username || u.email,
                hasMetadata: !!u.usrData,
            })),
        };
    },
});
