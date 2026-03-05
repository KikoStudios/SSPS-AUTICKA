# 🛠️ Developer Setup Guide - LockedIN Dashboard

This guide covers the initial environment setup, authentication configuration, and development workflow for the LockedIN Dashboard.

## 📋 Prerequisites
- **Node.js**: v18 or newer.
- **Convex CLI**: Installed via `npm install -g convex`.
- **Git**: For version control.

## 🚀 Initial Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Initialize Convex**:
   ```bash
   npx convex dev
   ```
   This will guide you through setting up your local development environment and creating a Convex deployment.

3. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory (the CLI tools below can help with this). You need:
   - `NEXT_PUBLIC_CONVEX_URL`: Your Convex deployment URL.
   - `JWT_PRIVATE_KEY`: RSA-2048 private key for authentication.

## 🔑 Authentication Setup (JWT Fix)

If you encounter "Auth provider discovery failed" errors, it's likely due to a malformed `JWT_PRIVATE_KEY`.

1. **Generate and Fix Keys**:
   ```bash
   node dev-tool.js env:fix-jwt
   ```
2. **Update Convex Dashboard**:
   - Go to [Convex Dashboard](https://dashboard.convex.dev).
   - Navigate to **Settings** → **Environment Variables**.
   - Copy the key from the tool output and paste it into `JWT_PRIVATE_KEY`.
   - Ensure there are real newlines (actual line breaks), not `\n` text.
3. **Redeploy**:
   ```bash
   npx convex deploy --yes
   ```

## 👤 Creating Your First Admin

1. **Start Dev Server**: `npm run dev`
2. **Visit Login Page**: `http://localhost:3000/login`
3. **Sign Up**: Create an account with your desired admin username.
4. **Approve Admin**:
   ```bash
   node dev-tool.js auth:approve <username>
   node dev-tool.js auth:create-admin <username> <password>
   ```
   *Note: The first user created in an empty database is often auto-approved, but these commands ensure status.*

## 🛠️ Development Tools

We provide a specialized tool for environment management:

### `dev-tool.js`
- `auth:list`: View all users and their status.
- `auth:approve <username>`: Approve a pending user.
- `env:check`: Validate your environment variables.
- `env:repair`: Automatically fix common setup issues.
- `db:reset`: Start with a fresh database.

Run `node dev-tool.js --help` for full command list.

---

## 🔒 Security Notes
- All backend functions are secured via `@convex-dev/auth`.
- `JWT_PRIVATE_KEY` should never be committed to version control.
- Role-based access control (RBAC) is enforced at the API level.
