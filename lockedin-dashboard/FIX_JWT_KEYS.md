# 🔑 CONVEX AUTH SETUP - MISSING JWT KEYS!

## ❌ The Problem

You're getting: **"Missing environment variable `JWT_PRIVATE_KEY`"**

This is the ROOT CAUSE of ALL the authentication errors!

---

## ✅ The Solution

You need to add **JWT_PRIVATE_KEY** to your Convex environment variables.

### **Quick Setup (2 Steps):**

#### **Step 1: Generate Keys**

Run this command:
```bash
npx @convex-dev/auth
```

Follow the prompts - it will:
1. Generate JWT keys
2. Add them to your Convex deployment automatically

#### **Step 2: Deploy**

```bash
npx convex dev
```

That's it! The authentication will work.

---

## 🔍 Alternative: Manual Setup

If the wizard doesn't work, follow these steps:

### 1. Go to [Convex Dashboard](https://dashboard.convex.dev)
### 2. Select your project  
### 3. Go to "Settings" → "Environment Variables"
### 4. Click "Add Variable"
### 5. Add these two variables:

**Variable 1:**
- Name: `JWT_PRIVATE_KEY`
- Value: (You need to generate an RSA private key)

**Variable 2:**
- Name: `JWKS`
- Value: (Corresponding public key in JWKS format)

---

## 📝 How to Generate Keys on Windows

Since Windows doesn't have `openssl` by default, use one of these methods:

### Method 1: Use the Convex CLI
```bash
npx @convex-dev/auth
```

### Method 2: Online Generator
1. Go to: https://www.devglan.com/online-tools/rsa-encryption-decryption
2. Generate 2048-bit RSA keys
3. Copy the private key
4. Add to Convex dashboard

---

## ⚡ RECOMMENDED: Just Run the CLI

The easiest way is to let Convex do it:

```bash
npx @convex-dev/auth
```

Answer the prompts:
1. Continue anyway? **Y**
2. Enter the URL of your local web server: **http://localhost:3000**
3. It will generate and set the keys automatically

---

## 🎯 After Setup

Once the JWT keys are set:
1. Restart `npm run dev`
2. Go to `http://localhost:3000/login`
3. Create your admin account
4. Login will work! ✅

---

**This is the ONLY thing blocking authentication from working!**
