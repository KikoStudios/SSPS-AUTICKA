import React, { useEffect, useRef } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { createPluginSDK } from '@/lib/pluginSDK';

interface BackgroundPluginManagerProps {
  plugins: Array<{ name: string; coreFileId: string; manifestFileId: string }>;
  username?: string;
  userData?: Record<string, unknown>;
}

// Global store for background-loaded plugins
const backgroundPlugins = new Map<string, any>();
const pluginSDKs = new Map<string, any>(); // Store SDK instances per plugin

export function getBackgroundPlugin(pluginName: string) {
  return backgroundPlugins.get(pluginName);
}

export function getAllBackgroundPlugins() {
  return Array.from(backgroundPlugins.values());
}

/**
 * BackgroundPluginManager
 * 
 * Loads all enabled plugins in the background without displaying UI.
 * This allows plugins to communicate with each other via shared data.
 */
export const BackgroundPluginManager: React.FC<BackgroundPluginManagerProps> = ({
  plugins,
  username,
  userData,
}) => {
  const loadedPluginsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!plugins || plugins.length === 0) {
      return;
    }

    // Load all plugins in background
    console.log('[BackgroundPluginManager] Loading plugins:', plugins.map(p => p.name).join(', '));
    plugins.forEach((plugin) => {
      // Skip if already loaded
      if (loadedPluginsRef.current.has(plugin.name)) {
        console.log(`[BackgroundPluginManager] Skipping already loaded: ${plugin.name}`);
        return;
      }

      console.log(`[BackgroundPluginManager] Queuing load: ${plugin.name}`);
      loadBackgroundPlugin(plugin.name, plugin.coreFileId, username, userData);
      loadedPluginsRef.current.add(plugin.name);
    });

    return () => {
      // Cleanup: Note - keeping plugins alive for communication
      // Don't unload on unmount
    };
  }, [plugins, username, userData]);

  return null; // No UI
};

/**
 * Load a plugin in the background
 */
async function loadBackgroundPlugin(
  pluginName: string,
  coreFileId: string,
  username?: string,
  userData?: Record<string, unknown>
) {
  try {
    console.log(`[BackgroundPluginManager] Loading plugin: ${pluginName}`);

    // Get the core file URL from Convex storage
    const coreUrl = await (window as any).convexClient.query(api.context.getFileUrl, {
      fileId: coreFileId,
    });

    if (!coreUrl) {
      console.error(`[BackgroundPluginManager] Failed to get core file URL for plugin: ${pluginName}`);
      return;
    }

    // Fetch the core content from Convex storage URL
    const response = await fetch(coreUrl);
    if (!response.ok) {
      console.error(`[BackgroundPluginManager] Failed to fetch plugin code:`, pluginName, response.statusText);
      return;
    }

    const coreContent = await response.text();

    if (!coreContent) {
      console.error(`[BackgroundPluginManager] No core content loaded for plugin: ${pluginName}`);
      return;
    }

    // Process code and wrap for execution
    let processedCode = coreContent
      .replace(/export\s+default\s+(\w+);?/g, 'window.TempBackgroundPlugin = $1;')
      .replace(/export\s+const\s+(\w+)\s*=/g, 'window.$1 =')
      .replace(/export\s+function\s+(\w+)/g, 'window.$1 = function $1')
      .replace(/export\s+class\s+(\w+)/g, 'window.$1 = class $1')
      .replace(/export\s*\{[^}]*\}/g, '')
      .replace(/import\s+.*?from\s+['"][^'"]*['"];?/g, '');

    // Wrap and execute plugin code
    const wrappedCode = `
      (function() {
        try {
          ${processedCode}
          if (typeof TestPlugin !== 'undefined') {
            window.TempBackgroundPlugin = TestPlugin;
          }
        } catch (e) {
          console.error('Background plugin execution error:', e);
          window.TempBackgroundPluginError = e;
        }
      })();
    `;

    // Expose SDK and React globally for plugins
    if (typeof window !== 'undefined') {
      // SDK will be set on the window object by the main dashboard
      if (!(window as any).PluginSDK) {
        console.warn(`[BackgroundPluginManager] PluginSDK not available for ${pluginName}`);
      }
    }

    // Execute the wrapped code
    console.log(`[BackgroundPluginManager] Executing plugin code: ${pluginName}`);
    eval(wrappedCode);

    // Check for execution errors
    if ((window as any).TempBackgroundPluginError) {
      console.error(`[BackgroundPluginManager] Plugin execution error:`, (window as any).TempBackgroundPluginError);
      delete (window as any).TempBackgroundPluginError;
      return;
    }

    // Get the loaded plugin class
    const PluginClass = (window as any).TempBackgroundPlugin;
    if (!PluginClass) {
      console.error(`[BackgroundPluginManager] Failed to load plugin class: ${pluginName}`);
      console.error(`[BackgroundPluginManager] Available on window:`, Object.keys(window).filter(k => k.includes('Test') || k.includes('Plugin')));
      return;
    }
    console.log(`[BackgroundPluginManager] Plugin class loaded: ${pluginName}`);

    // Create SDK instance for this plugin
    const pluginContext = {
      pluginName,
      username,
      userData,
      convexClient: (window as any).convexClient,
    };
    const sdkInstance = createPluginSDK(pluginContext);

    // Create plugin instance
    const instance = new PluginClass();

    // **Attach SDK to plugin instance so it persists**
    (instance as any).PluginSDK = sdkInstance;

    // Create container for plugin UI (hidden)
    const hiddenContainer = document.createElement('div');
    hiddenContainer.id = `plugin-bg-${pluginName}`;
    hiddenContainer.style.display = 'none';
    document.body.appendChild(hiddenContainer);

    // Initialize the plugin with SDK (set global temporarily)
    (window as any).PluginSDK = sdkInstance;
    
    console.log(`[BackgroundPluginManager] SDK created for ${pluginName}, now initializing...`);

    if (typeof instance.initialize === 'function') {
      instance.initialize({
        pluginName,
        username,
        userData,
        convexClient: (window as any).convexClient,
        runtime: (window as any).PluginRuntime,
        sdkFactory: (ctx: any) => createPluginSDK(ctx),
      });
    }

    // Create UI container (hidden)
    if (typeof instance.createUI === 'function') {
      instance.createUI(hiddenContainer);
    }

    // Store the plugin instance globally for inter-plugin communication
    backgroundPlugins.set(pluginName, instance);
    
    // **Store SDK instance for later use**
    pluginSDKs.set(pluginName, sdkInstance);

    console.log(`[BackgroundPluginManager] Stored SDK for ${pluginName}, setting up polling...`);

    // Set up periodic polling for inter-plugin communication
    if (typeof instance.onUpdate === 'function') {
      const pollInterval = setInterval(() => {
        try {
          // **Set the correct SDK for this plugin before calling onUpdate**
          (window as any).PluginSDK = pluginSDKs.get(pluginName);
          
          instance.onUpdate?.({
            timestamp: Date.now(),
            activePlugins: Array.from(backgroundPlugins.keys()),
          });
        } catch (error) {
          console.error(`[BackgroundPluginManager] Error in plugin update for ${pluginName}:`, error);
        }
      }, 3000); // Poll every 3 seconds

      // Store interval for cleanup if needed
      (instance as any)._pollInterval = pollInterval;
    }

    // Cleanup global reference
    delete (window as any).TempBackgroundPlugin;

    console.log(`[BackgroundPluginManager] Successfully loaded: ${pluginName}`);
  } catch (error) {
    console.error(`[BackgroundPluginManager] Error loading plugin ${pluginName}:`, error);
  }
}

export default BackgroundPluginManager;
