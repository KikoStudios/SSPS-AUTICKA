# Convex Auth Integration - Migration Guide

## Overview
The LockedIN Dashboard has been secured using **Convex Auth**, an authentication library specifically designed for Convex backends. This provides enterprise-grade security for all API endpoints and user authentication.

## What Changed

### 1. **Installed Packages**
- `@convex-dev/auth` - Convex Auth library
- `@auth/core@0.37.0` - Core authentication library

### 2. **New Files Created**

#### `convex/auth.ts`
- Configures Convex Auth with Password provider
- Exports `auth`, `signIn`, `signOut`, and `store` functions

#### `convex/authHelpers.ts`
- Helper functions for authenticated operations
- `currentUser` - Get current authenticated user
- `isAuthenticated` - Check if user is authenticated
- `getLegacyUser` - For migration from old user system

#### `convex/securedApi.ts`
- **Secured API endpoints** that require authentication
- All functions check authentication before executing
- Includes:
  - `getAllUsers()` - Get all users (requires auth)
  - `getAllPlugins()` - Get all plugins (requires auth)
  - `getAllSpaces()` - Get all spaces (requires auth)
  - `updateSpaceStatus()` - Update space (requires auth)
  - `deleteUser()` - Delete user (requires auth)
  - `updateUser()` - Update user (requires auth)
  - `getCurrentUser()` - Get current authenticated user
  - `isAuthenticated()` - Check authentication status

### 3. **Modified Files**

#### `convex/schema.ts`
- Added `...authTables` to include Convex Auth tables:
  - `users` - Convex Auth user table
  - `authSessions` - Active authentication sessions
  - `authAccounts` - OAuth/provider accounts
  - `authRefreshTokens` - Refresh tokens
  - `authVerificationCodes` - Email verification codes
  - `authVerifiers` - Additional verifiers

#### `src/app/convex-provider.tsx`
- Replaced `ConvexProvider` with `ConvexAuthProvider`
- This enables authentication throughout the app

#### `src/app/login/page.tsx`
- Updated to use `useAuthActions()` from Convex Auth
- Changed from username to **email** authentication
- Uses `signIn('password', formData)` for secure authentication
- Removed custom auth context dependency

## How Authentication Works Now

### User Sign-In Flow
1. User enters **email** and **password** on login page
2. Frontend calls `signIn('password', formData)` from Convex Auth
3. Convex Auth validates credentials and creates a session
4. JWT token is automatically stored and sent with all requests
5. Backend functions verify the JWT using `getAuthUserId(ctx)`

### Backend Security
All protected functions now:
```typescript
const userId = await getAuthUserId(ctx);
if (userId === null) {
  throw new Error("Unauthorized: Authentication required");
}
```

This ensures **no unauthorized access** to any protected endpoints.

## Migration Path

### For Existing Users
The old `usrs` table still exists for backward compatibility. You have two options:

#### Option 1: Keep Both Systems (Recommended for transition)
- Keep existing `usrs` table for legacy data
- New users sign up through Convex Auth
- Gradually migrate users

#### Option 2: Full Migration
Create a migration script to:
1. Read all users from `usrs` table
2. For each user, create a Convex Auth account:
   ```typescript
   await signIn('password', {
     email: user.username + '@your-domain.com',
     password: 'temporary-password',
     flow: 'signUp'
   });
   ```
3. Send password reset emails to all users

## How to Use

### In Frontend Components
```typescript
import { useAuthActions } from '@convex-dev/auth/react';
import { Authenticated, Unauthenticated } from 'convex/react';

function MyComponent() {
  const { signOut } = useAuthActions();
  
  return (
    <>
      <Authenticated>
        <button onClick={() => signOut()}>Sign Out</button>
        {/* Protected content */}
      </Authenticated>
      
      <Unauthenticated>
        {/* Show login page */}
      </Unauthenticated>
    </>
  );
}
```

### In Backend Functions
```typescript
import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "./_generated/server";

export const mySecureQuery = query({
  args: {},
  handler: async (ctx) => {
    // This protects the function
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Unauthorized");
    }
    
    // Now you can safely access protected data
    const user = await ctx.db.get(userId);
    return user;
  },
});
```

### Updating Dashboard Components
Replace calls to old unsecured functions with secured ones:

**Before:**
```typescript
const users = useQuery(api.context.getAllUsers);
```

**After:**
```typescript
const users = useQuery(api.securedApi.getAllUsers);
```

## Security Benefits

1. **JWT-based Authentication** - Industry standard, secure tokens
2. **Session Management** - Automatic session expiration and renewal
3. **No More Public Endpoints** - All data access requires valid auth
4. **Built-in CSRF Protection** - Convex Auth handles this automatically
5. **Self-hostable** - No dependency on external auth services
6. **Type-safe** - Full TypeScript support

## Testing the Integration

### 1. Create a Test User
Run in Convex dashboard:
```typescript
// This will be done via the sign-up flow in your app
// For testing, you can use the Password provider
```

### 2. Test Login
1. Go to `/login`
2. Enter email and password
3. Should redirect to `/dashboard`

### 3. Test Protected Endpoints
Try accessing dashboard without logging in - should be blocked.

## Next Steps

1. **Update all dashboard components** to use `api.securedApi.*` instead of `api.context.*`
2. **Add role-based access control** (RBAC) for admin functions
3. **Implement password reset flow** (email required)
4. **Add email verification** for new signups (email required)
5. **Migrate existing users** to Convex Auth

## Important Notes

- **Email is now required** instead of username
- All backend functions in `securedApi.ts` are protected
- Old `context.ts` functions are still available but **insecure** - avoid using them
- The old custom `AuthProvider` in `auth-context.tsx` is no longer needed for new flows

## Troubleshooting

### "Unauthorized" errors
- Make sure user is logged in
- Check that JWT token is being sent (inspect network tab)
- Verify `ConvexAuthProvider` is wrapping your app

### Can't log in
- Ensure user exists in Convex Auth `users` table
- Check email/password are correct
- Look at browser console for errors

### Old functions still work without auth
- They are **intentionally kept** for now to avoid breaking existing dashboard
- Gradually replace them with `securedApi.*` functions
- Once migration is complete, remove or secure the old functions

## Documentation Links
- [Convex Auth Docs](https://labs.convex.dev/auth)
- [Password Provider Config](https://labs.convex.dev/auth/config/passwords)
- [Authorization Guide](https://labs.convex.dev/auth/authz)
