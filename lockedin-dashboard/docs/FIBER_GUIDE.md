# 🔌 Fiber Framework - Plugin Development Guide

Fiber is the official plugin framework for the LockedIN Dashboard, allowing you to build rich, integrated features with ease.

## 🌟 Key Features
- **SDK Access**: Simple API for database and file storage.
- **Theme Awareness**: Built-in support for Light and Dark modes.
- **HeroUI Integration**: Use the dashboard's premium component library.
- **External API**: Expose your plugin's data to external applications via REST.

## 🏗️ Plugin Anatomy
A Fiber plugin consists of three primary files:
1. `manifest.json`: Metadata and permissions.
2. `core.js`: The JavaScript class implementing your plugin's logic.
3. `icon.svg`: (Optional) The icon displayed in the sidebar.

### 1. The Manifest
```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "author": "Your Name",
  "main": "core.js",
  "iconLight": "icon-light.svg",
  "iconDark": "icon-dark.svg",
  "apiEndpoints": ["status", "toggle"],
  "permissions": ["read", "write"]
}
```

### 2. The Core Logic
```javascript
class MyPlugin {
  async initialize(context) {
    // initialize the SDK
    const { createPluginSDK } = window.PluginSDK;
    this.sdk = createPluginSDK(context);
    this.sdk.log("Plugin Ready!");
  }

  createUI(container) {
    const { Button } = window.HeroUI;
    container.innerHTML = `<div class="p-4">Hello Fiber!</div>`;
  }

  destroy() {
    this.sdk.log("Plugin Unloaded");
  }
}
window.MyPlugin = MyPlugin;
```

## 🛠️ Plugin SDK Reference

### Data Storage
- `sdk.setData(key, value)`: Save JSON-serializable data.
- `sdk.getData(key)`: Retrieve saved data.
- `sdk.deleteData(key)`: Remove data.

### File Management
- `sdk.storeFile(name, base64Data, mimeType)`: Upload a file.
- `sdk.getFileUrl(name)`: Get a temporary download URL.

### User & Roles
- `sdk.getCurrentUser()`: Get user profile and role.
- `sdk.hasRole('admin')`: check for administrative privileges.

### Theme Support
- `sdk.getTheme()`: returns `'light'` or `'dark'`.
- `sdk.onThemeChange(callback)`: listen for theme updates.

## 🔧 Fiber Tools
Use `plugin-tool.js` to manage your development:
- `node plugin-tool.js sync`: Register newly created plugin endpoints.
- `node plugin-tool.js list`: View all published plugins.

---

## 🚀 Workflow: Building Your First Plugin
1. **Create Directory**: `mkdir plugins/my-plugin`
2. **Define Manifest**: Create `manifest.json`.
3. **Write Code**: Implement the plugin class in `core.js`.
4. **Publish**: Upload the files through the **Plugin Publisher** in the Admin Dashboard.
5. **Enable**: Go to **Account Settings** and toggle your new plugin on!

Happy building! 🚀
