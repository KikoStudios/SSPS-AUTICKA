# Testing the Account Approval System

## Quick Start Test

### Step 1: Access the Application
Open your browser and go to: **http://localhost:3000/login**

### Step 2: Create a Test Account
1. You should see the login form
2. Click the button "Nemáte účet? Vytvořte si ho zde" (or "Switch to Sign Up")
3. Enter a test username (e.g., `testuser`)
4. Enter a password (e.g., `Test123`)
5. Click "Sign Up"
6. You should see: ✅ **"Účet vytvořen! Čeká na schválení správcem."**
7. After 3 seconds, the form switches back to sign-in mode

### Step 3: Try to Log In (Will Fail)
1. Enter the same username and password
2. Click "Sign In"
3. You should see an error indicating the account is pending approval

### Step 4: View Pending Accounts (As Admin)
First, you need an admin account. If you don't have one:

#### Option A: Create First Admin (Empty Database)
If this is the first account in the system, it will be auto-approved:
1. Clear all accounts by running:
   ```bash
   node clear-all-auth.js
   ```
2. Create a new account via the signup form
3. This first account will be auto-approved and can access the dashboard

#### Option B: Use Existing Admin
If you already have an admin account, log in with it.

### Step 5: Access Approval Page
1. Log in as admin
2. Open the dashboard menu (click ☰ hamburger icon in top left)
3. Click "🔧 EMERGENCY TOOLS" at the bottom of the menu
4. Select "✓ Account Approvals"

### Step 6: Approve the Pending Account
1. You should see your test account listed
2. Click the green "✓ Schválit" button
3. You should see a success message: "✅ Uživatel testuser byl schválen!"
4. The account disappears from the pending list

### Step 7: Test Approved Login
1. Log out from admin account
2. Go back to login page
3. Enter the test account credentials
4. Click "Sign In"
5. You should successfully log in and see the dashboard! 🎉

## Testing Account Rejection

### Step 1: Create Another Test Account
1. Go to `/login`
2. Create another account (e.g., `baduser`)
3. Wait for the success message

### Step 2: Reject the Account
1. Log in as admin
2. Go to Account Approvals page
3. Find the `baduser` account
4. Click the red "✗ Odmítnout" button
5. Confirm the deletion in the popup
6. Account is permanently deleted

### Step 3: Verify Deletion
1. Try to log in with `baduser` credentials
2. Should fail with "Invalid username or password"

## Automated Testing

Run the test script to check pending accounts:
```bash
node test-approval-system.js
```

This will show:
- Number of pending accounts
- Usernames and creation dates
- Approval status

## Expected Behavior Summary

| Action | Expected Result |
|--------|----------------|
| Sign up new account | ✅ Success message, auto-switch to sign-in |
| Log in with unapproved account | ❌ Error: "Account pending approval" |
| Access dashboard while unapproved | ❌ Logged out, redirected to login |
| Admin approves account | ✅ Account can now log in |
| Admin rejects account | ❌ Account deleted, cannot log in |
| Log in with approved account | ✅ Success, dashboard access granted |

## Troubleshooting

### "No pending accounts" but I just signed up
- Check that the signup actually succeeded (look for success message)
- Verify you're checking the right deployment (localhost vs production)
- Run `node test-approval-system.js` to verify database state

### Can't access approval page
- Make sure you're logged in as an admin (role: 'admin')
- Check that the page is registered in page-initializer.tsx
- Open browser console for errors

### Account approved but still can't log in
- Log out completely and try again
- Clear browser cache/cookies
- Check that isApproved is actually true in the database

### Changes not appearing
- Make sure dev server is running: `npm run dev` (already running on port 3000)
- Hard refresh browser (Ctrl+Shift+R)
- Check for compilation errors in terminal

## Database Inspection

To manually check account approval status, you can:

1. Open Convex Dashboard: https://dashboard.convex.dev/
2. Go to your deployment (combative-cat-787)
3. Navigate to Data → users table
4. Look for the `isApproved` field on each user

Approved users will have `isApproved: true` or the field will be missing (defaults to approved).
Pending users will have `isApproved: false`.

## Next Steps

After testing is complete:
1. Delete test accounts from the approval dashboard or database
2. Create real admin accounts
3. Configure proper security policies
4. Consider adding email notifications for new signup requests

## Success Checklist

- [ ] Can create new account via signup form
- [ ] Signup shows success message + "pending approval" notice
- [ ] Unapproved account cannot log in
- [ ] Admin can see pending accounts in approval page
- [ ] Admin can approve accounts (green button works)
- [ ] Approved accounts can log in successfully
- [ ] Admin can reject accounts (red button works)
- [ ] Rejected accounts cannot log in
- [ ] Dashboard protects from unapproved users

If all items are checked, the approval system is working correctly! ✅
