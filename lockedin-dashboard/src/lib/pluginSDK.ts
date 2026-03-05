/**
 * Plugin SDK - Client-side helper library for plugins
 * 
 * This library provides a simple and consistent interface for plugins to interact
 * with the plugin framework, including data storage, file management, user profiles,
 * and role-based permissions.
 */

interface PluginContext {
  pluginName: string;
  convexClient: any;
  username?: string;
  userData?: any;
}

interface PluginRedirectPayload {
  fromPlugin: string;
  targetPlugin: string;
  trigger?: string;
  payload?: any;
  timestamp: number;
}

const PLUGIN_REDIRECT_EVENT = 'plugin:redirect';
const PLUGIN_REDIRECT_STORE_KEY = '__pluginRedirectPayloads';

export class PluginSDK {
  private context: PluginContext;

  constructor(context: PluginContext) {
    this.context = context;
  }

  // ============================================================================
  // DATA STORAGE API
  // ============================================================================

  /**
   * Set a value in plugin data storage
   */
  async setData(key: string, value: any): Promise<string> {
    const { pluginName, convexClient } = this.context;
    
    return await convexClient.mutation('pluginFramework:setPluginData', {
      pluginName,
      key,
      value: JSON.stringify(value),
    });
  }

  /**
   * Get a value from plugin data storage
   */
  async getData(key: string): Promise<any | null> {
    const { pluginName, convexClient } = this.context;
    
    const value = await convexClient.query('pluginFramework:getPluginData', {
      pluginName,
      key,
    });

    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  /**
   * Get all data for this plugin
   */
  async getAllData(): Promise<Array<{ key: string; value: any }>> {
    const { pluginName, convexClient } = this.context;
    
    const data = await convexClient.query('pluginFramework:getAllPluginData', {
      pluginName,
    });

    return data.map((item: any) => ({
      key: item.key,
      value: JSON.parse(item.value),
    }));
  }

  /**
   * Delete a value from plugin data storage
   */
  async deleteData(key: string): Promise<boolean> {
    const { pluginName, convexClient } = this.context;
    
    return await convexClient.mutation('pluginFramework:deletePluginData', {
      pluginName,
      key,
    });
  }

  /**
   * Clear all data for this plugin
   */
  async clearAllData(): Promise<{ deleted: number }> {
    const { pluginName, convexClient } = this.context;
    
    return await convexClient.mutation('pluginFramework:clearAllPluginData', {
      pluginName,
    });
  }

  /**
   * Get all data keys for this plugin (convenience method)
   */
  async listKeys(): Promise<string[]> {
    const data = await this.getAllData();
    return data.map((item: any) => item.key);
  }

  /**
   * Store a file (alias for storeFile)
   */
  async uploadFile(file: File): Promise<string> {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = async () => {
        try {
          const fileData = reader.result as string;
          const result = await this.storeFile(
            file.name,
            fileData,
            file.type,
            { originalName: file.name }
          );
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  // ============================================================================
  // FILE STORAGE API
  // ============================================================================

  /**
   * Store a file
   */
  async storeFile(
    fileName: string,
    fileData: string,
    mimeType: string,
    metadata?: any
  ): Promise<string> {
    const { pluginName, convexClient } = this.context;
    
    return await convexClient.action('pluginFramework:storePluginFile', {
      pluginName,
      fileName,
      fileData,
      mimeType,
      metadata: metadata ? JSON.stringify(metadata) : undefined,
    });
  }

  /**
   * Get file URL
   */
  async getFileUrl(fileName: string): Promise<any | null> {
    const { pluginName, convexClient } = this.context;
    
    return await convexClient.query('pluginFramework:getPluginFileUrl', {
      pluginName,
      fileName,
    });
  }

  /**
   * Get all files for this plugin
   */
  async getAllFiles(): Promise<any[]> {
    const { pluginName, convexClient } = this.context;
    
    return await convexClient.query('pluginFramework:getAllPluginFiles', {
      pluginName,
    });
  }

  /**
   * Delete a file
   */
  async deleteFile(fileName: string): Promise<boolean> {
    const { pluginName, convexClient } = this.context;
    
    return await convexClient.action('pluginFramework:deletePluginFile', {
      pluginName,
      fileName,
    });
  }

  /**
   * Clear all files for this plugin
   */
  async clearAllFiles(): Promise<{ deleted: number }> {
    const { pluginName, convexClient } = this.context;
    
    return await convexClient.action('pluginFramework:clearAllPluginFiles', {
      pluginName,
    });
  }

  // ============================================================================
  // USER PROFILE & PERMISSIONS API
  // ============================================================================

  /**
   * Get current user's profile
   */
  async getCurrentUser(): Promise<any | null> {
    const { convexClient } = this.context;
    
    try {
      return await (convexClient as any).query('pluginFramework:getCurrentUserProfile', {});
    } catch (error) {
      console.error('[PluginSDK] Error getting current user:', error);
      return null;
    }
  }

  /**
   * Get user profile by username
   */
  async getUserProfile(username: string): Promise<any | null> {
    const { convexClient, pluginName } = this.context;
    
    // Guard: validate username parameter
    if (!username || typeof username !== 'string') {
      console.warn(`[PluginSDK:${pluginName}] getUserProfile called with invalid username:`, username);
      return null;
    }
    
    try {
      return await (convexClient as any).query('pluginFramework:getUserProfileByUsername', {
        username,
      });
    } catch (error) {
      console.error(`[PluginSDK:${pluginName}] Error getting user profile for "${username}":`, error);
      return null;
    }
  }

  /**
   * Check if current user has a specific role
   */
  async hasRole(requiredRole: string): Promise<boolean> {
    const { convexClient } = this.context;
    
    try {
      return await (convexClient as any).query('pluginFramework:userHasRole', {
        requiredRole,
      });
    } catch (error) {
      console.error('[PluginSDK] Error checking role:', error);
      return false;
    }
  }

  /**
   * Check if current user has a specific permission
   */
  async hasPermission(permission: string): Promise<boolean> {
    const { convexClient } = this.context;
    
    try {
      return await (convexClient as any).query('pluginFramework:userHasPermission', {
        permission,
      });
    } catch (error) {
      console.error('[PluginSDK] Error checking permission:', error);
      return false;
    }
  }

  /**
   * Check if user can access this feature based on role
   */
  async canAccess(requiredRole: 'admin' | 'moderator' | 'user' = 'user'): Promise<boolean> {
    return await this.hasRole(requiredRole);
  }

  // ============================================================================
  // THEME & UI HELPERS
  // ============================================================================

  /**
   * Get current theme (light/dark)
   */
  getTheme(): 'light' | 'dark' {
    if (typeof window === 'undefined') {
      return 'light';
    }

    // Check if dark mode class is on html element
    if (document.documentElement.classList.contains('dark')) {
      return 'dark';
    }

    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  }

  /**
   * Listen for theme changes
   */
  onThemeChange(callback: (theme: 'light' | 'dark') => void): () => void {
    if (typeof window === 'undefined') {
      return () => {};
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const observer = new MutationObserver(() => {
      callback(this.getTheme());
    });

    // Watch for class changes on html element
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // Watch for system preference changes
    const handleChange = () => callback(this.getTheme());
    mediaQuery.addEventListener('change', handleChange);

    // Return cleanup function
    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', handleChange);
    };
  }

  /**
   * Call API endpoint (placeholder for compatibility)
   * In reality, plugins define endpoints via registerApiEndpoints
   */
  async callAPI(endpoint: string, params?: any): Promise<any> {
    const { pluginName } = this.context;
    this.log(`API call to ${endpoint} with params:`, params);
    return { success: true, endpoint, plugin: pluginName };
  }

  // ============================================================================
  // API ENDPOINT REGISTRATION
  // ============================================================================

  /**
   * Register API endpoints for this plugin
   * 
   * This allows external applications to call /api/[pluginAlias]/[endpoint]
   */
  async registerApiEndpoints(endpoints: string[]): Promise<{ success: boolean }> {
    const { pluginName, convexClient } = this.context;
    
    try {
      return await (convexClient as any).mutation('pluginFramework:registerPluginApiEndpoints', {
        pluginName,
        endpoints,
      });
    } catch (error) {
      console.error(`[PluginSDK] Error registering API endpoints for ${pluginName}:`, error);
      return { success: false };
    }
  }

  // ============================================================================
  // INTER-PLUGIN SHARED DATA API
  // ============================================================================

  /**
   * Share a value so other plugins can read it
   * Supports flexible signatures for backward compatibility
   */
  async publishSharedData(
    channelOrKey: string,
    keyOrValue?: any,
    valueOrVis?: any,
    visibility: 'public' | 'allowlist' | 'private' = 'public',
    options?: { targetPlugin?: string; allowedPlugins?: string[] }
  ): Promise<string> {
    const { pluginName, convexClient } = this.context;

    // Support both old signature: publishSharedData(key, value) 
    // and new signature: publishSharedData(channel, key, value, visibility)
    let channel = channelOrKey;
    let key = keyOrValue;
    let value = valueOrVis;

    // If called with just 2 params, use channel as both channel and key
    if (valueOrVis === undefined && typeof keyOrValue === 'object') {
      channel = channelOrKey;
      key = channelOrKey;
      value = keyOrValue;
    }

    console.log(`[PluginSDK:${pluginName}] Publishing to channel "${channel}", key "${key}", visibility: ${visibility}`);
    console.log(`[PluginSDK:${pluginName}] Full params:`, {
      ownerPlugin: pluginName,
      channel,
      key,
      valuePreview: typeof value === 'object' ? JSON.stringify(value).substring(0, 100) : value
    });
    
    try {
      const result = await (convexClient as any).mutation('pluginFramework:publishSharedData', {
        ownerPlugin: pluginName,
        channel,
        key,
        value: JSON.stringify(value),
        visibility,
        targetPlugin: options?.targetPlugin,
        allowedPlugins: options?.allowedPlugins,
      });
      
      console.log(`[PluginSDK:${pluginName}] Successfully published. Record ID: ${result}`);
      return result;
    } catch (error) {
      console.error(`[PluginSDK:${pluginName}] Failed to publish shared data:`, error);
      throw error;
    }
  }

  /**
   * Get all shared data visible to this plugin in a channel
   * Convenience method alias for readSharedChannel
   */
  async getSharedData(channel?: string): Promise<any> {
    const { pluginName } = this.context;
    
    if (!channel) {
      channel = 'default';
    }
    
    console.log(`[PluginSDK:${pluginName}] Getting shared data from channel: ${channel}`);
    
    try {
      const records = await this.readSharedChannel(channel);
      console.log(`[PluginSDK:${pluginName}] Found ${records.length} records in channel ${channel}`);
      
      const result: any = {};
      for (const record of records) {
        result[record.key] = record.value;
      }
      
      console.log(`[PluginSDK:${pluginName}] Shared data keys:`, Object.keys(result));
      return result;
    } catch (error) {
      console.error(`[PluginSDK:${pluginName}] Error getting shared data:`, error);
      throw error;
    }
  }

  /**
   * Read all shared data visible to this plugin in a channel
   */
  async readSharedChannel(channel: string): Promise<Array<{ ownerPlugin: string; key: string; value: any }>> {
    const { pluginName, convexClient } = this.context;

    console.log(`[PluginSDK:${pluginName}] readSharedChannel called for channel: "${channel}"`);

    try {
      const records = await (convexClient as any).query('pluginFramework:readSharedChannelData', {
        requesterPlugin: pluginName,
        channel,
      });

      console.log(`[PluginSDK:${pluginName}] Raw records from Convex:`, records.length, 'records');
      records.forEach((r: any, idx: number) => {
        console.log(`  [${idx}] owner: ${r.ownerPlugin}, channel: ${r.channel}, key: ${r.key}, visibility: ${r.visibility}`);
      });

      const mapped = records.map((record: any) => ({
        ownerPlugin: record.ownerPlugin,
        key: record.key,
        value: JSON.parse(record.value),
      }));

      console.log(`[PluginSDK:${pluginName}] Mapped ${mapped.length} records`);
      return mapped;
    } catch (error) {
      console.error(`[PluginSDK:${pluginName}] Error reading shared channel:`, error);
      return [];
    }
  }

  /**
   * Read one shared value from another plugin
   */
  async readSharedDataByKey(ownerPlugin: string, channel: string, key: string): Promise<any | null> {
    const { pluginName, convexClient } = this.context;

    const record = await convexClient.query('pluginFramework:readSharedDataByKey', {
      requesterPlugin: pluginName,
      ownerPlugin,
      channel,
      key,
    });

    if (!record) {
      return null;
    }

    try {
      return JSON.parse(record.value);
    } catch {
      return record.value;
    }
  }

  /**
   * Delete a shared key published by this plugin
   */
  async deleteSharedData(channel: string, key: string): Promise<boolean> {
    const { pluginName, convexClient } = this.context;

    return await convexClient.mutation('pluginFramework:deleteSharedData', {
      ownerPlugin: pluginName,
      channel,
      key,
    });
  }

  // ============================================================================
  // PLUGIN REDIRECT API
  // ============================================================================

  /**
   * Request dashboard navigation to another plugin and pass payload data.
   */
  redirectToPlugin(
    targetPlugin: string,
    payload?: any,
    options?: { trigger?: string }
  ): boolean {
    if (typeof window === 'undefined' || !targetPlugin) {
      return false;
    }

    const redirectPayload: PluginRedirectPayload = {
      fromPlugin: this.context.pluginName,
      targetPlugin,
      trigger: options?.trigger,
      payload,
      timestamp: Date.now(),
    };

    const win = window as unknown as Record<string, any>;
    const store = (win[PLUGIN_REDIRECT_STORE_KEY] ||= {});
    store[targetPlugin] = redirectPayload;

    window.dispatchEvent(new CustomEvent(PLUGIN_REDIRECT_EVENT, { detail: redirectPayload }));
    return true;
  }

  /**
   * Read redirect payload without removing it.
   */
  peekRedirectPayload(pluginName?: string): PluginRedirectPayload | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const target = pluginName || this.context.pluginName;
    const win = window as unknown as Record<string, any>;
    const store = win[PLUGIN_REDIRECT_STORE_KEY] || {};
    return store[target] || null;
  }

  /**
   * Read and clear redirect payload for the current plugin.
   */
  consumeRedirectPayload(pluginName?: string): PluginRedirectPayload | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const target = pluginName || this.context.pluginName;
    const win = window as unknown as Record<string, any>;
    const store = win[PLUGIN_REDIRECT_STORE_KEY] || {};
    const payload = store[target] || null;

    if (payload) {
      delete store[target];
    }

    return payload;
  }

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  /**
   * Get plugin context
   */
  getContext(): PluginContext {
    return this.context;
  }

  /**
   * Log message (useful for debugging)
   */
  log(...args: any[]): void {
    console.log(`[Plugin: ${this.context.pluginName}]`, ...args);
  }

  /**
   * Log error
   */
  error(...args: any[]): void {
    console.error(`[Plugin: ${this.context.pluginName}]`, ...args);
  }
}

/**
 * Create a plugin SDK instance
 */
export function createPluginSDK(context: PluginContext): PluginSDK {
  return new PluginSDK(context);
}

// Export types for TypeScript users
export type { PluginContext };
