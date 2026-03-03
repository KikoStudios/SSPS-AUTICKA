# Quick Start Guide - Account Approval System

## ✅ Database Status
- **Cleared**: All old users deleted
- **Ready**: Fresh database, no authentication errors

## 🚀 Step-by-Step Testing

### 1. Create First Admin Account (Auto-Approved)

Since the database is now empty, the FIRST account created will be **automatically approved** as admin.

**Steps:**
1. Go to: **http://localhost:3000/login**
2. You'll see the signup form (auto-shown when no users exist)
3. Enter credentials:
   - Username: `admin`
   - Password: `Admin@123`
4. Click "Sign Up"
5. ✅ Account created and **automatically approved** (first user = admin)
6. You'll be logged in to the dashboard

### 2. Create Second Account (Needs Approval)

**Steps:**
1. Log out from admin account
2. Go to signup form
3. Create a test account:
   - Username: `testuser`
   - Password: `Test@123`
4. You'll see: **"✅ Účet vytvořen! Čeká na schválení správcem."**
5. Try to log in → Will fail with "pending approval" error ❌

### 3. Approve the Pending Account

**Steps:**
1. Log back in as admin (`admin` / `Admin@123`)
2. In the dashboard, click the **☰ menu** icon (top left)
3. Scroll to bottom and click **"🔧 EMERGENCY TOOLS"**
4. Click **"✓ Account Approvals"**
5. You'll see `testuser` in the pending list
6. Click the green **"✓ Schválit"** button
7. Success message appears! ✅

### 4. Test Approved Login

**Steps:**
1. Log out from admin
2. Log in as `testuser` / `Test@123`
3. ✅ Success! Dashboard access granted

---

## 🔧 How to Access Approval Page

Three ways to get there:

### Method 1: Dashboard Menu (Recommended)
1. Log in as admin
2. Click ☰ hamburger menu (top left)
3. Scroll to bottom
4. Click "🔧 EMERGENCY TOOLS"
5. Select "✓ Account Approvals"

### Method 2: Direct URL
Navigate to: `http://localhost:3000/dashboard?page=admin-approvals`

### Method 3: Emergency Tools
Press `Ctrl + Shift + K` (shortcut to open tools menu if configured)

---

## 📋 Expected Behavior

| Scenario | Expected Result |
|----------|----------------|
| First signup (empty DB) | ✅ Auto-approved, becomes admin |
| Second+ signup | ❌ Requires approval, shows pending message |
| Unapproved login attempt | ❌ Error: "Account pending approval" |
| After admin approval | ✅ User can log in successfully |
| Admin rejects account | ❌ Account deleted, cannot log in |

---

## 🐛 Troubleshooting

### "Auth provider discovery failed" Error
This might be a temporary Convex initialization issue. Try:
1. Wait 30 seconds for Convex to restart
2. Hard refresh browser (Ctrl+Shift+R)
3. Clear cookies for localhost
4. Try signup again

### Can't Access Approval Page
- Make sure you're logged in as admin (role: 'admin')
- Check that isApproved: true on your admin account
- Look for the emergency tools menu at the bottom of sidebar

### Signup Not Showing
- The signup form auto-shows when database is empty
- After first user, toggle with "Switch to Sign Up" button
- Make sure you're on http://localhost:3000/login

---

## 🎯 Current Setup

- **Database**: Cleared ✅
- **Environment**: Dev (local)  
- **URL**: http://localhost:3000
- **First Account**: Will be auto-approved as admin
- **Subsequent Accounts**: Require manual approval

**Start here**: http://localhost:3000/login

Create your first admin account now! 🚀
