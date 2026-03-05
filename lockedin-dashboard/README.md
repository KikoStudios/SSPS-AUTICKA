# 🔐 LockedIN Dashboard - SSPS Security System

A secure Next.js dashboard for monitoring and managing the SSPS parking and security system, powered by Convex with enterprise-grade authentication.

## 🚨 Security Notice

**This dashboard is now fully secured with Convex Auth!**

All API endpoints require authentication. No anonymous access is allowed.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Create a `.env.local` file:
```env
NEXT_PUBLIC_CONVEX_URL=your_convex_url_here
```

### 3. Set Up Authentication
```bash
npm run setup-auth
```
Follow the on-screen instructions to create your first admin user.

### 4. Start Development Server
```bash
npm run dev
```

### 5. Login
Open [http://localhost:3000/login](http://localhost:3000/login) and login with your credentials.

## 📚 Documentation

- **[SECURITY.md](./SECURITY.md)** - Complete security documentation and API reference
- **[INTEGRATION_SUMMARY.md](./INTEGRATION_SUMMARY.md)** - Quick overview of security integration
- **[CONVEX_AUTH_MIGRATION.md](./CONVEX_AUTH_MIGRATION.md)** - Detailed migration guide

## 🔑 Authentication

This dashboard uses **Convex Auth** for authentication with **username + password** login:

- ✅ Username + password authentication (NO email required)
- ✅ JWT-based sessions
- ✅ Automatic session management
- ✅ CSRF protection
- ✅ Type-safe authentication

### First Time Setup

**Migrate existing users:**
```bash
npm run migrate-users
```

Then follow the instructions to run the migration in Convex Dashboard.

### Login Flow
1. Navigate to `/login`
2. Enter your **username** and password
3. System validates credentials via Convex Auth
4. JWT token is issued and stored
5. Redirected to `/dashboard`

## 🛡️ Security Features

### Protected Endpoints
All API operations are secured:

```typescript
// ✅ Secured APIs (Use these!)
api.securedApi.*         // User & plugin management
api.securedSpaces.*      // Car tracking operations

// ❌ Legacy APIs (Don't use - insecure!)
api.context.*            // Old unsecured functions
api.spaces.*             // Old unsecured tracking
```

### Authentication Checks
Every secured function validates authentication:

```typescript
const userId = await getAuthUserId(ctx);
if (userId === null) {
  throw new Error("Unauthorized");
}
```

## 📋 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run setup-auth   # Set up first admin user
npm run lint         # Run linter
```

## 🏗️ Architecture

### Frontend
- **Next.js 16** - React framework
- **Convex Auth Provider** - Authentication wrapper
- **TypeScript** - Type safety

### Backend
- **Convex** - Backend-as-a-Service
- **Convex Auth** - Authentication system
- **JWT Tokens** - Secure session management

### Database Tables
- `users` - Convex Auth users
- `authSessions` - Active sessions
- `usrs` - Legacy user data
- `plugins` - Plugin management
- `spaces` - Parking spaces
- `current_cars` - Cars in area
- `car_history` - Entry/exit history

## 🔧 Tech Stack

- [Next.js](https://nextjs.org) - React framework
- [Convex](https://convex.dev) - Backend & Database
- [Convex Auth](https://labs.convex.dev/auth) - Authentication
- [TypeScript](https://www.typescriptlang.org) - Type safety
- [React 19](https://react.dev) - UI library

## 📖 Learn More

### Project Documentation
- [Security Documentation](./SECURITY.md)
- [Migration Guide](./CONVEX_AUTH_MIGRATION.md)
- [Integration Summary](./INTEGRATION_SUMMARY.md)

### External Resources
- [Convex Documentation](https://docs.convex.dev)
- [Convex Auth Docs](https://labs.convex.dev/auth)
- [Next.js Documentation](https://nextjs.org/docs)

## 🚀 Deployment

### Convex Deployment
```bash
npx convex deploy
```

### Vercel Deployment
The easiest way to deploy is using [Vercel](https://vercel.com):

```bash
vercel deploy
```

Make sure to add your environment variables in Vercel settings:
- `NEXT_PUBLIC_CONVEX_URL`

## 🐛 Troubleshooting

### "Unauthorized" Errors
- Ensure you're logged in
- Check JWT token in browser Network tab
- Verify `ConvexAuthProvider` wraps your app

### Login Issues
- Verify email/password are correct
- Check browser console for errors
- Ensure user exists in database

### Can't Access Dashboard
- Make sure you're logged in at `/login`
- Check that session hasn't expired
- Try clearing cookies and logging in again

## 📞 Support

For issues or questions:
1. Check the documentation files
2. Review Convex Auth documentation
3. Check browser console for errors
4. Inspect Network tab for failed requests

## 🎉 Features

- 🔐 **Secure Authentication** - JWT-based login
- 👥 **User Management** - Admin panel for users
- 🔌 **Plugin System** - Extensible architecture
- 🚗 **Car Tracking** - Entry/exit monitoring
- 🅿️ **Space Management** - Parking space status
- 📊 **History Tracking** - Complete audit trail
- 🎨 **Modern UI** - Clean, responsive design

---

**Built with ❤️ for SSPS** | Secured with Convex Auth
