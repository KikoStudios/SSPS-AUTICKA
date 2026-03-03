# ✅ Convex Auth Integration Checklist

## Immediate Setup (Do This First!)

- [ ] **Run npm install** to ensure all dependencies are installed
- [ ] **Create first admin user** - Run `npm run setup-auth` and follow instructions
- [ ] **Test login** - Go to `/login` and verify you can log in
- [ ] **Verify authentication** - Try accessing `/dashboard` when logged out (should redirect to login)

## Testing Checklist

### Authentication Tests
- [ ] Can log in with valid credentials
- [ ] Cannot log in with invalid credentials
- [ ] Error messages display correctly on login page
- [ ] Redirect to dashboard after successful login
- [ ] Redirect to login when accessing dashboard without auth

### API Security Tests
- [ ] Secured endpoints require authentication
- [ ] Unauthenticated calls to `api.securedApi.*` throw "Unauthorized" error
- [ ] Authenticated calls to `api.securedApi.*` work correctly
- [ ] Check browser network tab for JWT token in requests
- [ ] Verify JWT token is sent with all Convex requests

### Dashboard Component Tests
- [ ] User list loads correctly (if admin)
- [ ] Plugin list loads correctly
- [ ] Space management works
- [ ] Car tracking functions work
- [ ] All mutations require authentication

## Migration Tasks

### Phase 1: Update Imports (High Priority)
- [ ] Replace `api.context.getAllUsers` with `api.securedApi.getAllUsers`
- [ ] Replace `api.context.getAllPlugins` with `api.securedApi.getAllPlugins`
- [ ] Replace `api.context.getAllSpaces` with `api.securedApi.getAllSpaces`
- [ ] Replace `api.spaces.update_fullness` with `api.securedSpaces.update_fullness`
- [ ] Replace `api.spaces.car_entered` with `api.securedSpaces.car_entered`
- [ ] Replace `api.spaces.car_exited` with `api.securedSpaces.car_exited`
- [ ] Replace all other `api.spaces.*` calls with `api.securedSpaces.*`

### Phase 2: Update Components
- [ ] Review all components using Convex queries/mutations
- [ ] Add authentication checks where needed
- [ ] Use `<Authenticated>` wrapper for protected content
- [ ] Use `<Unauthenticated>` wrapper for login-only content
- [ ] Handle loading states with `<AuthLoading>`
- [ ] Add error handling for "Unauthorized" errors

### Phase 3: Remove Legacy Code (Low Priority)
- [ ] Remove old custom `AuthProvider` from `auth-context.tsx` (if no longer needed)
- [ ] Mark old `api.context.*` functions as deprecated
- [ ] Add warnings to old unsecured functions
- [ ] Plan migration for any remaining legacy code
- [ ] Eventually remove `convex/context.ts` unsecured functions
- [ ] Eventually remove `convex/spaces.ts` unsecured functions

## Security Hardening

### Role-Based Access Control (RBAC)
- [ ] Add `role` field to user data
- [ ] Implement admin role checks in secured functions
- [ ] Create `isAdmin()` helper function
- [ ] Protect admin-only functions (deleteUser, updateUser, etc.)
- [ ] Add admin-only UI components

### Additional Security Features
- [ ] Implement password reset flow (requires email setup)
- [ ] Add email verification for new users (requires email setup)
- [ ] Set up session timeout configuration
- [ ] Implement logout on all devices functionality
- [ ] Add activity logging for security events
- [ ] Set up email notifications for security events

## Documentation Updates

- [ ] Read `SECURITY.md` thoroughly
- [ ] Review `CONVEX_AUTH_MIGRATION.md`
- [ ] Check `INTEGRATION_SUMMARY.md`
- [ ] Update any custom documentation with new API endpoints
- [ ] Document any project-specific security policies

## Deployment Checklist

### Pre-Deployment
- [ ] All components using secured APIs
- [ ] No references to old unsecured APIs
- [ ] All tests passing
- [ ] Login/logout tested
- [ ] Error handling implemented
- [ ] Loading states handled

### Deployment
- [ ] Deploy Convex backend - `npx convex deploy`
- [ ] Set environment variables in production
- [ ] Deploy frontend (Vercel/other)
- [ ] Test login in production
- [ ] Verify all API calls work in production
- [ ] Monitor for authentication errors

### Post-Deployment
- [ ] Create production admin users
- [ ] Migrate existing users (if needed)
- [ ] Monitor error logs
- [ ] Check session management
- [ ] Verify JWT tokens are working
- [ ] Test on multiple devices/browsers

## User Migration Strategy

### Option 1: Manual Recreation (Simple)
- [ ] Export user list from old `usrs` table
- [ ] For each user, have them:
  - [ ] Go to login page
  - [ ] Create account with email/password
- [ ] Verify new accounts work
- [ ] Migrate user data to new accounts

### Option 2: Automated Migration (Complex)
- [ ] Create migration script
- [ ] For each user in `usrs`:
  - [ ] Create Convex Auth account
  - [ ] Send password reset email
- [ ] Test migration script on staging
- [ ] Run migration in production
- [ ] Notify users of changes

## Monitoring & Maintenance

### Daily Monitoring
- [ ] Check error logs for "Unauthorized" errors
- [ ] Monitor login failures
- [ ] Check session statistics
- [ ] Review API usage

### Weekly Review
- [ ] Review security logs
- [ ] Check for failed login attempts
- [ ] Monitor session durations
- [ ] Review user access patterns

### Monthly Tasks
- [ ] Review and update dependencies
- [ ] Check for Convex Auth updates
- [ ] Review security policies
- [ ] Audit user permissions
- [ ] Update documentation

## Success Criteria

You've successfully integrated Convex Auth when:

✅ All API endpoints require authentication  
✅ Users can log in with email/password  
✅ JWT tokens are issued and validated  
✅ Dashboard is protected from unauthorized access  
✅ All secured APIs work correctly  
✅ Legacy APIs are deprecated or removed  
✅ Documentation is updated  
✅ Tests are passing  
✅ Production deployment is secure  

## Need Help?

- 📖 Read the documentation files:
  - `SECURITY.md`
  - `CONVEX_AUTH_MIGRATION.md`
  - `INTEGRATION_SUMMARY.md`

- 🌐 Check official docs:
  - [Convex Auth](https://labs.convex.dev/auth)
  - [Convex](https://docs.convex.dev)

- 🔍 Common issues:
  - Check browser console for errors
  - Verify JWT token in Network tab
  - Ensure ConvexAuthProvider wraps app
  - Check environment variables

---

**Good luck with your migration! 🚀**
