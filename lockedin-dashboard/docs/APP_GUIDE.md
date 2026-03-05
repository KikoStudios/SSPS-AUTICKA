# 📱 App Guide - Functions & Usage

This guide explains how to use the LockedIN Dashboard, its core features, and its underlying architecture.

## 🎯 Core Objectives
The LockedIN Dashboard is designed for:
- **Vehicle Tracking**: Real-time counting and identification of cars.
- **Unified UI**: A modular dashboard that supports external plugins (Fiber Framework).
- **Security**: Robust authentication and role-based access control.

## 🚀 Dashboard Features

### 1. Real-time Monitoring
- View the number of available and occupied parking spaces.
- See license plate detections as they happen.
- Monitor historical data for traffic patterns.

### 2. Admin Tools (Emergency Tools)
Access these via the **☰ sidebar menu** under "🔧 EMERGENCY TOOLS":
- **Account Approvals**: Manage new user requests.
- **System Logs**: View real-time activity and errors.
- **Service Status**: Check connections to cameras and the Python detection module.

### 3. Plugin Management
Users can customize their dashboard by enabling/disabling plugins in their **Account Settings**.

## 🔐 Security & Access Control

### Roles
- **User**: Can view the dashboard and manage their own plugins.
- **Admin**: Full access to account approvals, system configuration, and data management.

### Account Approval Workflow
1. A new user signs up via the login page.
2. The account is created with `isApproved: false`.
3. An **Admin** must approve the account via the "Account Approvals" page or `dev-tool.js`.
4. Once approved, the user can log in and access the dashboard.

## 📋 API Architecture (for Developers)

Internal components should use the **Secured API** layer:
- `api.securedApi.*`: General user and system management.
- `api.securedSpaces.*`: Car tracking and parking space status.

*Avoid using `api.context.*` or `api.spaces.*` as these are legacy, insecure endpoints.*

## 🛠️ Usage Tips
- **Light/Dark Mode**: The UI automatically adapts to your system theme.
- **Responsive Design**: The dashboard is optimized for both desktop and mobile views.
- **Keyboard Shortcuts**: Use `Ctrl + Shift + K` to quickly open the emergency tools menu.

---

## 📁 Project Structure
- `src/app`: Frontend components and pages (Next.js).
- `convex/`: Backend logic, schema, and authentication.
- `plugins/`: Core and community-contributed plugins.
