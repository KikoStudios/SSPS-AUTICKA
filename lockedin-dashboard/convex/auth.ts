import "./authEnv"; // MUST BE FIRST
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { DataModel } from "./_generated/dataModel";
import bcryptjs from "bcryptjs";

/**
 * Custom Password provider configured for USERNAME + PASSWORD (not email)
 * This allows users to log in with username instead of email
 */

// NOTE: Environment variables are set by authEnv.ts which runs first.

/**
 * Convex Auth Password Provider with Username Support
 * 
 * New accounts are created with isApproved: false and must be approved by admin.
 */
const UsernamePassword = Password<DataModel>({
    // profile() is called when creating a new user
    // It maps provider params to the users table fields
    profile(params) {
        // params.email comes from the form (contains username)
        return {
            email: params.email,      // Store username here
            name: params.email,       // Use as name too
            username: params.email,   // Custom field for username
            isApproved: false,        // ALL new accounts start as unapproved
            createdAt: Date.now(),    // Track when account was created
        };
    },
});

export const { auth, signIn, signOut, store } = convexAuth({
    providers: [UsernamePassword],
});
