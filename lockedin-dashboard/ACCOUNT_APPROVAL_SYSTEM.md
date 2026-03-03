# Account Approval System Documentation

## Overview
The LockedIN dashboard now requires admin approval for all new account registrations. This prevents unauthorized access and gives administrators control over who can use the system.

## How It Works

### 1. **New Account Signup**
- Users can access the signup form at `/login` by toggling between "Sign In" and "Sign Up"
- When a user creates an account:
  - Their credentials are stored in the database
  - `isApproved` field is set to `false`
  - `createdAt` timestamp is recorded
  - A success message is shown: "✅ Účet vytvořen! Čeká na schválení správcem."

### 2. **Approval Flow**
- New accounts **cannot log in** until approved by an admin
- If an unapproved user tries to log in, they see: "❌ Váš účet čeká na schválení správcem."
- Admins can view pending accounts in the dashboard under "Account Approvals" (emergency tools menu)

### 3. **Admin Approval UI**
Access the approval page by:
1. Open dashboard menu (☰)
2. Click "🔧 EMERGENCY TOOLS"
3. Select "✓ Account Approvals"

The approval page shows:
- List of all pending accounts
- Username and creation date
- Two action buttons:
  - **✓ Schválit** (Approve) - Sets `isApproved: true`, user can now log in
  - **✗ Odmítnout** (Reject) - Deletes the account permanently

## Technical Implementation

### Database Schema
```typescript
users: defineTable({
  // ... other fields
  isApproved: v.optional(v.boolean()),  // false for new accounts
  createdAt: v.optional(v.number()),    // timestamp
})
  .index("isApproved", ["isApproved", "_creationTime"])
```

### Key Functions

#### `getPendingAccounts` (Query)
```typescript
// Returns all users with isApproved: false
const pendingAccounts = await ctx.db
  .query("users")
  .withIndex("isApproved", (q) => q.eq("isApproved", false))
  .collect();
```

#### `approveAccount` (Mutation)
```typescript
// Sets isApproved: true for a user
await ctx.db.patch(userId, { isApproved: true });
```

#### `rejectAccount` (Mutation)
```typescript
// Deletes user and their auth account
await ctx.db.delete(userId);
await ctx.db.delete(authAccountId);
```

#### `isUserApproved` (Query)
```typescript
// Checks if a specific username is approved
const user = await ctx.db.query("users")
  .withIndex("username", (q) => q.eq("username", username))
  .first();
return { exists: !!user, approved: user?.isApproved !== false };
```

### Password Provider Configuration
The Password provider in `convex/auth.ts` automatically marks new accounts as unapproved:

```typescript
const UsernamePassword = Password<DataModel>({
  profile(params) {
    return {
      email: params.email,
      name: params.email,
      username: params.email,
      isApproved: false,        // NEW: All new accounts start as unapproved
      createdAt: Date.now(),    // Track when account was created
    };
  },
});
```

### Dashboard Protection
The dashboard checks approval status and redirects unapproved users:

```typescript
// In dashboard/page.tsx
useEffect(() => {
  if (isAuthenticated && userData && userData.isApproved === false) {
    console.warn('Unapproved user attempted to access dashboard:', username);
    logout();
    router.push('/login?error=pending_approval');
  }
}, [isAuthenticated, userData, username, logout, router]);
```

## User Flow Examples

### Scenario 1: New User Registration
1. User goes to http://localhost:3000/login
2. Clicks "Switch to Sign Up"
3. Enters username and password
4. Clicks "Sign Up"
5. Sees: "✅ Účet vytvořen! Čeká na schválení správcem."
6. Form auto-switches back to sign-in mode after 3 seconds
7. User **cannot log in yet**

### Scenario 2: Admin Approval
1. Admin logs into dashboard
2. Opens "🔧 EMERGENCY TOOLS" → "✓ Account Approvals"
3. Sees pending account with username and creation date
4. Clicks "✓ Schválit"
5. Account is approved, user can now log in

### Scenario 3: Unapproved Login Attempt
1. User with pending approval tries to log in
2. Sees error: "❌ Váš účet čeká na schválení správcem."
3. Must wait for admin approval

### Scenario 4: Account Rejection
1. Admin opens approval page
2. Clicks "✗ Odmítnout" on suspicious account
3. Confirms deletion
4. Account is permanently deleted from database
5. User cannot log in or re-register with same credentials until database is cleared

## Security Considerations

1. **First Admin Account**: The very first account created in an empty database is automatically approved (for bootstrapping)
2. **No Auto-Approval**: All subsequent accounts require manual approval
3. **Session Invalidation**: Unapproved users are logged out if they somehow gain access to dashboard
4. **Permanent Deletion**: Rejected accounts are completely removed from the database

## Testing the System

### Test Account Creation
1. Go to http://localhost:3000/login
2. Create a test account
3. Run the test script:
   ```bash
   node test-approval-system.js
   ```
4. Check the output for pending accounts

### Test Approval Workflow
1. Create a test account via signup form
2. Log in as admin
3. Navigate to Account Approvals page
4. Approve the test account
5. Log out as admin
6. Log in as the test account - should succeed

### Test Rejection
1. Create another test account
2. Reject it from the approval page
3. Try to log in - should fail with "Invalid credentials"

## Files Modified

- `convex/schema.ts` - Added isApproved and createdAt fields
- `convex/auth.ts` - Updated Password provider to set isApproved: false
- `convex/context.ts` - Added approval management functions
- `src/app/login/page.tsx` - Added signup success message and approval error handling
- `src/app/dashboard/page.tsx` - Added approval check to protect dashboard
- `src/app/dashboard/pages/admin-account-approval.tsx` - NEW approval UI
- `src/app/dashboard/page-initializer.tsx` - Registered approval page

## Deployment
The system is deployed to Convex at: https://combative-cat-787.convex.cloud

All schema changes and functions have been deployed and are active.

## Future Enhancements

1. **Email Notifications**: Send email to admins when new accounts are pending
2. **Approval Comments**: Allow admins to add notes when approving/rejecting
3. **Approval History**: Track who approved which accounts and when
4. **Bulk Approval**: Select multiple accounts to approve at once
5. **Auto-Expiration**: Delete pending accounts older than X days
