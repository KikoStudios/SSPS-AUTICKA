# 🔐 LockedIN Dashboard - Project Overview

Welcome to the **LockedIN Dashboard**! This is a state-of-the-art security and parking management system for SSPS, built with Next.js, Convex, and the modular **Fiber Framework**.

## 📂 Project Structure

We've organized the project to keep the root directory clean and manageable:

-   **[docs/](./docs/)**: All project documentation, guides, and security references.
-   **[tools/](./tools/)**: Unified CLI tools for development and plugin management.
-   **[certs/](./certs/)**: Authentication keys and certificates (e.g., JWT PEM files).
-   **[test-plugin-files/](./test-plugin-files/)**: A collection of example plugins for the Fiber Framework.
-   **[src/](./src/)**: Frontend source code (Next.js components and pages).
-   **[convex/](./convex/)**: Backend logic, schema, and real-time functions.

## 📚 Essential Documentation

Start with these guides to get up and running:

1.  **[Developer Setup](./docs/DEV_SETUP.md)**: How to set up your environment, install dependencies, and fix common auth issues.
2.  **[Application Guide](./docs/APP_GUIDE.md)**: Features overview, user roles, and how to use the dashboard.
3.  **[Fiber Framework Guide](./docs/FIBER_GUIDE.md)**: Everything you need to know about building and publishing plugins.
4.  **[Security Reference](./docs/SECURITY.md)**: Detailed technical documentation of the authentication and API security layers.

## 🛠️ Command Line Tools

Forget about dozens of individual scripts! Use our consolidated tools located in the `tools/` folder:

-   **`node tools/dev-tool.js`**: Manage users, approvals, environment repairs, and database resets.
-   **`node tools/plugin-tool.js`**: Sync, update, and list Fiber plugins.

Run either tool with `--help` for a full list of commands and explanations.

## ⚙️ Root Configuration Files

You may notice several configuration files in the root directory. These are necessary for the modern web development stack to function:

-   **`tailwind.config.ts` & `postcss.config.mjs`**: Power our high-end styling and design system.
-   **`tsconfig.json` & `next-env.d.ts`**: Essential for TypeScript support and auto-generating environmental types.
-   **`next.config.ts`**: The core configuration for the Next.js framework.
-   **`eslint.config.mjs`**: Ensures code quality and consistent styling.
-   **`package.json`**: Manages project dependencies and scripts.

---

**Built with ❤️ for SSPS** | Powered by Convex & Next.js
