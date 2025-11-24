
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  usrs: defineTable({
    hashPassword: v.string(),
    username: v.string(),
    usrData: v.string(),
  }).index("by_usrname", ["username"]),
  
  plugins: defineTable({
    name: v.string(),
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
});