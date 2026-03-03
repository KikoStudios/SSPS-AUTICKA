# Complete Setup Guide - DEV Environment

## ✅ What's Been Done

1. **Database Cleared**: All old users deleted (1 user, 1 account, 1 session removed)
2. **Dev Environment**: Convex dev is now running (not prod)
3. **Approval Scripts**: Created tools to manage account approvals

---

## 🚨 Current Issue: Auth Provider Error

The error you're seeing:
```
Failed to authenticate: "Auth provider discovery of https://combative-cat-787.convex.site failed: 500 Internal Server Error"
```

This is caused by **JWT key issues in Convex Dashboard**. The key has backslashes that need to be fixed.

---

## 🔧 Fix the Auth Error - REQUIRED FIRST STEP

### Option 1: Update JWT Key in Convex Dashboard (Recommended)

1. **Get the new JWT key**:
   ```bash
   node fix-jwt-key-convex.js
   ```
   This will show you a properly formatted JWT key.

2. **Update Convex Dashboard**:
   - Go to: https://dashboard.convex.dev
   - Select deployment: `combative-cat-787`
   - Go to: Settings → Environment Variables
   - Edit `JWT_PRIVATE_KEY`
   - **PASTE the key from the script output** (between the === lines)
   - Make sure it has REAL newlines, not `\n` text
   - Save

3. **Wait 30 seconds** for Convex to reload

4. **Test**: Go to http://localhost:3000/login and try to sign up

### Option 2: Use Local Dev Only (Bypasses Dashboard Issue)

If you want to develop locally without touching the production dashboard:

1. Make sure Convex dev is running (it should be in a separate window)
2. The local `.env.local` file has the correct key
3. Local dev environment will use your local JWT key

---

## 📝 Step-by-Step: Create First Admin

Once auth is working (after fixing JWT):

### Step 1: Sign Up via Form
```bash
# Open browser
http://localhost:3000/login

# Create account:
Username: admin
Password: Admin@123
```

The account will be created with `isApproved: false` (pending).

### Step 2: Approve the First Admin
```bash
# In terminal:
node approve-first-admin.js admin
```

This will:
- Find the `admin` account in pending list
- Set `isApproved: true`
- Make it ready for login

### Step 3: Log In
```bash
# Go back to browser:
http://localhost:3000/login

# Log in:
Username: admin
Password: Admin@123
```

✅ You're now logged in as admin!

---

## 🎯 How to Approve Accounts (3 Ways)

### Method 1: Using the Script (Fastest)
```bash
# Approve specific user
node approve-first-admin.js <username>

# Example:
node approve-first-admin.js testuser
```

### Method 2: Via Dashboard UI (Best for Multiple Users)
1. Log in as admin
2. Click ☰ menu (top left)
3. Scroll down to "🔧 EMERGENCY TOOLS"
4. Click "✓ Account Approvals"
5. Click green "✓ Schválit" button next to pending users

### Method 3: Direct URL
```
http://localhost:3000/dashboard?page=admin-approvals
```

---

## 🗑️ Clear Database (Anytime)

To start fresh:

### Option 1: Quick Reset (Clears Everything)
```bash
node quick-reset.js
```
This deletes all users, accounts, and sessions.

### Option 2: Manual Clear + Approve
```bash
# 1. Clear database
node quick-reset.js

# 2. Create account via signup form

# 3. Approve it
node approve-first-admin.js admin
```

---

## 🔄 Dev vs Prod Environments

### Current Setup:
- ✅ **Dev**: Running locally with `npx convex dev`
- ❌ **Prod**: Uses https://combative-cat-787.convex.cloud (has JWT key issue)

### To Use Dev Only:
1. Make sure `npx convex dev` is running (separate PowerShell window)
2. Your `.env.local` file points to local dev
3. All development happens locally without touching prod

### To Use Prod:
1. Fix JWT key in Convex Dashboard (see "Fix the Auth Error" above)
2. Deploy: `npx convex deploy --yes`
3. Use production URL

---

## 📋 Troubleshooting

### "Auth provider discovery failed: 500"
→ **JWT key issue**. Run `node fix-jwt-key-convex.js` and update Convex Dashboard.

### "Cannot find user" after signup
→ User was created but needs approval. Run `node approve-first-admin.js <username>`

### "No pending accounts"
→ Either:
   - Account was already approved
   - Signup failed (check browser console)
   - Database was cleared after signup

### Can't access approval dashboard
→ User must have `role: 'admin'` and `isApproved: true`

---

## 🎯 Quick Testing Workflow

```bash
# 1. Clear database
node quick-reset.js

# 2. Fix auth (if needed)
node fix-jwt-key-convex.js
# → Update Convex Dashboard with the key shown

# 3. Create first admin via browser
# → Go to http://localhost:3000/login
# → Sign up: admin / Admin@123

# 4. Approve first admin
node approve-first-admin.js admin

# 5. Log in as admin
# → Dashboard should load ✅

# 6. Create test user via browser
# → Log out
# → Sign up: testuser / Test@123
# → See "pending approval" message

# 7. Approve via admin dashboard
# → Log in as admin
# → Emergency Tools → Account Approvals
# → Click ✓ Schválit

# 8. Test approved login
# → Log out
# → Log in as testuser
# → Success! ✅
```

---

## 📁 Useful Scripts

| Script | Purpose |
|--------|---------|
| `quick-reset.js` | Clear all users from database |
| `approve-first-admin.js` | Approve a pending account |
| `fix-jwt-key-convex.js` | Generate clean JWT key |
| `test-approval-system.js` | Check pending accounts |

---

## 🚀 Next Steps

1. **FIX AUTH ERROR FIRST** (update JWT key in Convex Dashboard)
2. Create first admin via signup form
3. Approve it: `node approve-first-admin.js admin`
4. Log in and test the approval dashboard
5. Create test accounts and practice approving them

**Start here**: Fix the JWT key, then go to http://localhost:3000/login 🚀
