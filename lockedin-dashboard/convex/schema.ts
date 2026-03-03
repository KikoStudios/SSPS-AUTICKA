import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  // Convex Auth tables with custom users table
  ...authTables,

  // Override the users table to add our custom fields
  users: defineTable({
    // Standard Convex Auth fields
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()), // We use this to store username
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),

    // Our custom fields for migration from usrs table
    username: v.optional(v.string()), // Actual username
    usrData: v.optional(v.string()),  // JSON string with user metadata (role, permissions, etc.)
    
    // Account approval system
    isApproved: v.optional(v.boolean()), // false = pending approval, true = approved
    createdAt: v.optional(v.number()),   // Account creation timestamp
  })
    .index("email", ["email"])
    .index("username", ["username"])
    .index("isApproved", ["isApproved"]), // Index for finding pending approvals

  // Existing tables
  usrs: defineTable({
    hashPassword: v.string(),
    username: v.string(),
    usrData: v.string(),
  }).index("by_usrname", ["username"]),

  plugins: defineTable({
    name: v.string(),
    displayName: v.optional(v.string()),
    author: v.string(),
    version: v.string(),
    description: v.optional(v.string()),
    manifestFileId: v.id("_storage"),
    coreFileId: v.id("_storage"),
    iconFileId: v.optional(v.id("_storage")),
    uploadDate: v.number(),
    isActive: v.boolean(),
  }).index("by_name", ["name"]),

  spaces: defineTable({
    spaceName: v.string(),
    isFull: v.boolean(),
  }).index("by_spaceName", ["spaceName"]),

  // Current cars in area (only stores license plate)
  current_cars: defineTable({
    licensePlate: v.string(),
  }).index("by_licensePlate", ["licensePlate"]),

  // History of all entries and exits
  car_history: defineTable({
    timestamp: v.number(),
    licensePlate: v.string(),
    direction: v.string(), // "in" or "out"
  })
    .index("by_licensePlate", ["licensePlate"])
    .index("by_timestamp", ["timestamp"]),

  // API Keys for external integrations (IoT)
  apiKeys: defineTable({
    key: v.string(),
    name: v.string(),
    createdBy: v.id("users"),
    lastUsed: v.optional(v.number()),
    isActive: v.boolean(),
  }).index("by_key", ["key"]),
});