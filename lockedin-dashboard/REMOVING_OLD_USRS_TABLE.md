# 🗑️ Removing the Old `usrs` Table - Guide

## ⚠️ IMPORTANT: When to Remove

**DO NOT REMOVE until you have:**

1. ✅ Run the migration: `internal.migration.migrateAllUsers`
2. ✅ Verified all users migrated successfully
3. ✅ Tested login with multiple user accounts
4. ✅ Confirmed all user metadata is preserved
5. ✅ Kept it as backup for at least a few days/weeks

---

## 📋 Safe Removal Steps

### Step 1: Verify Migration Complete

In Convex Dashboard, run:
```
internal.migration.checkMigrationStatus
```

Make sure:
- `legacyUsersCount` matches `authUsersCount`
- All users have their metadata
- Test logging in with several accounts

### Step 2: Backup (Optional but Recommended)

Export your `usrs` table data before deleting:
1. Go to Convex Dashboard → Data tab
2. Select `usrs` table
3. Export to JSON or CSV
4. Save the file somewhere safe

### Step 3: Remove from Schema

Edit `convex/schema.ts` and remove the `usrs` table definition:

```typescript
// REMOVE THIS:
usrs: defineTable({
  hashPassword: v.string(),
  username: v.string(),
  usrData: v.string(),
}).index("by_usrname", ["username"]),
```

### Step 4: Remove Old Functions

You can also remove or deprecate these files/functions that reference `usrs`:

**Files to remove/deprecate:**
- `convex/context.ts` - Old insecure functions
- `convex/authHelpers.ts` - Legacy migration helpers (lines 38-47)
- `convex/userMigration.ts` - Old migration file  (now obsolete)

**Functions in `convex/securedApi.ts`:**
- Remove the `getAllUsers` query that queries `usrs` table (line 31)

### Step 5: Clean Up Migration Files

After successful migration, you can delete:
- ❌ `convex/migration.ts` - Migration script (no longer needed)
- ❌ `run-migration.js` - Migration helper
- ❌ `convex/userMigration.ts` - Old migration utilities
- ❌ `create-admin.js` - Old admin creation script

### Step 6: Deploy Changes

```bash
npx convex dev --once
```

Or if deploying to production:
```bash
npx convex deploy
```

---

## 🔍 What Will Happen

When you remove the `usrs` table from schema:

- ✅ Table will be **deleted** from Convex database
- ✅ All data in `usrs` will be **permanently removed**
- ✅ Old insecure functions will stop working (good!)
- ✅ Only secured Convex Auth functions will work

**Users will NOT be affected** - they use the new `users` table now.

---

## 🧹 Complete Cleanup Checklist

After migration is verified and stable:

### Files to Remove
- [ ] `convex/migration.ts`
- [ ] `convex/userMigration.ts`
- [ ] `convex/authHelpers.ts` (optional - only if not needed)
- [ ] `run-migration.js`
- [ ] `create-admin.js` (old admin script)

### Code to Remove from `convex/schema.ts`
- [ ] Remove entire `usrs` table definition

### Code to Remove from `convex/context.ts`
- [ ] Remove `insertUser` mutation (line 58)
- [ ] Remove `getUserByUsername` query (line 70)
- [ ] Remove `getAllUsers` query (line 132)
- [ ] Remove `createUserAction` (line 28)
- [ ] Remove `loginUserAction` (line 83)
- [ ] Remove all old user management functions

Or simply **delete the entire `convex/context.ts` file** since you now use `convex/securedApi.ts`.

### Code to Update in `convex/securedApi.ts`

Replace the old `getAllUsers` that queries `usrs`:

```typescript
// OLD - Remove this:
export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    // ...
    return await ctx.db.query("usrs").collect(); // ← This line
  },
});
```

Keep only the new Convex Auth version (there may be overlap - check!).

### Update package.json
- [ ] Remove `"migrate-users": "node run-migration.js"`
- [ ] Remove `"create-admin": "node create-admin.js"` (if not needed)

---

## 📝 Simplified Schema After Cleanup

Your `convex/schema.ts` should look like this:

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  // Convex Auth tables with custom users table
  ...authTables,
  
  // Custom users table
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    username: v.optional(v.string()),
    usrData: v.optional(v.string()),
  })
    .index("email", ["email"])
    .index("username", ["username"]),
  
  // Your other tables (keep these!)
  plugins: defineTable({
    // ...
  }).index("by_name", ["name"]),

  spaces: defineTable({
    // ...
  }).index("by_spaceName", ["spaceName"]),

  current_cars: defineTable({
    // ...
  }).index("by_licensePlate", ["licensePlate"]),

  car_history: defineTable({
    // ...
  })
    .index("by_licensePlate", ["licensePlate"])
    .index("by_timestamp", ["timestamp"]),
});
```

---

## ⚠️ Before You Remove - Final Checklist

Ask yourself these questions:

- [ ] Have I successfully migrated ALL users?
- [ ] Have I tested login with at least 3-5 different accounts?
- [ ] Is all user metadata (roles, plugins, etc.) working correctly?
- [ ] Have I backed up the `usrs` table data (just in case)?
- [ ] Has the system been running stable for a few days?
- [ ] Am I 100% confident I won't need to roll back?

If you answered YES to all of these, you're safe to remove the table!

---

## 🚨 If Something Goes Wrong

If you removed it too early and need to restore:

1. **Restore from backup** (if you exported the data)
2. **Add `usrs` table back** to schema.ts
3. **Re-import data** via Convex dashboard
4. **Re-run migration** if needed

---

## 💡 Recommended Timeline

**Safe Approach:**

1. **Day 0**: Run migration
2. **Day 1-3**: Test thoroughly with all users
3. **Day 4-7**: Monitor for any issues
4. **Week 2**: If stable, remove old table
5. **Week 3**: Clean up old files and code

**Aggressive Approach** (not recommended for production):

1. Run migration
2. Test immediately
3. Remove table same day

Choose based on your environment and risk tolerance!

---

## ✅ Benefits of Removing Old Table

- 🧹 **Cleaner schema** - Only one users table
- 🔒 **More secure** - No old insecure functions
- 📉 **Less confusion** - No duplicate user data
- 💾 **Saves space** - Remove redundant data
- 🚀 **Simpler codebase** - Less legacy code

---

## 📞 Need Help?

If you're unsure, keep the table longer! There's no harm in keeping it as a backup for a month or two.

The migration is **non-destructive**, so you can always run it again if needed.

---

**Remember: Better safe than sorry! Keep the backup until you're 100% confident.** 🛡️
