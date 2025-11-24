import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

interface PluginLoaderProps {
  pluginName: string;
  username?: string;
  userData?: Record<string, unknown>;
}

// interface PluginManifest {
//   name: string;
//   version: string;
//   author: string;
//   description?: string;
//   main?: string;
//   icon?: string;
// }

// Emoji assignment for plugins without icons
const getPluginEmoji = (pluginName: string): string => {
  const emojiMap: { [key: string]: string } = {
    'test': '🧪',
    'plugin': '🔌',
    'loader': '📦',
    'manager': '⚙️',
    'editor': '✏️',
    'viewer': '👁️',
    'calculator': '🧮',
    'calendar': '📅',
    'chat': '💬',
    'file': '📁',
    'image': '🖼️',
    'video': '🎥',
    'audio': '🎵',
    'game': '🎮',
    'tool': '🔧',
    'utility': '🛠️',
    'social': '👥',
    'news': '📰',
    'weather': '🌤️',
    'map': '🗺️',
    'search': '🔍',
    'analytics': '📊',
    'security': '🔒',
    'backup': '💾',
    'sync': '🔄',
    'notification': '🔔',
    'theme': '🎨',
    'language': '🌐',
    'api': '🔗',
    'database': '🗄️',
    'server': '🖥️',
    'client': '💻',
    'mobile': '📱',
    'web': '🌍',
    'desktop': '🖥️'
  };

  // Try to find a matching emoji based on plugin name keywords
  const lowerName = pluginName.toLowerCase();
  for (const [keyword, emoji] of Object.entries(emojiMap)) {
    if (lowerName.includes(keyword)) {
      return emoji;
    }
  }

  // Default emoji if no match found
  return '🔌';
};

export const PluginLoader: React.FC<PluginLoaderProps> = ({ pluginName }) => {
  const [pluginComponent, setPluginComponent] = useState<React.ComponentType<{ username?: string, userData?: Record<string, unknown> }> | null>(null);
  // const [manifest, setManifest] = useState<PluginManifest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch plugin files from Convex
  const pluginData = useQuery(api.context.getPluginFiles, { pluginName });

  const loadPlugin = useCallback(async () => {
    if (!pluginData?.files) return;

    try {
      setLoading(true);
      setError(null);

      // Load and parse manifest
      // const manifestResponse = await fetch(pluginData.files.manifestUrl);
      // const manifestContent = await manifestResponse.text();
      // const parsedManifest: PluginManifest = JSON.parse(manifestContent);
      // setManifest(parsedManifest);

      // Load and execute core JavaScript
      if (!pluginData.files.coreUrl) {
        throw new Error('Core URL not available');
      }
      const coreResponse = await fetch(pluginData.files.coreUrl);
      const coreContent = await coreResponse.text();

       // Create the plugin component that renders the plugin's UI
       const PluginComponent = () => {
         const [, setPluginInstance] = useState<Record<string, unknown> | null>(null);
         const containerRef = useRef<HTMLDivElement>(null);

         useEffect(() => {
           const loadPluginCode = async () => {
             try {
               // Remove ES6 export statements and convert to browser-compatible code
               let processedCode = coreContent;
               
               // Replace export statements with global assignments
               processedCode = processedCode
                 .replace(/export\s+default\s+(\w+);?/g, 'window.TempTestPlugin = $1;')
                 .replace(/export\s+const\s+(\w+)\s*=/g, 'window.$1 =')
                 .replace(/export\s+function\s+(\w+)/g, 'window.$1 = function $1')
                 .replace(/export\s+class\s+(\w+)/g, 'window.$1 = class $1')
                 .replace(/export\s*\{[^}]*\}/g, '')
                 .replace(/import\s+.*?from\s+['"][^'"]*['"];?/g, '');
               
               // Wrap the plugin code in an IIFE
               const wrappedCode = `
                 (function() {
                   try {
                     ${processedCode}
                     if (typeof TestPlugin !== 'undefined') {
                       window.TempTestPlugin = TestPlugin;
                     }
                   } catch (e) {
                     console.error('Plugin execution error:', e);
                     window.TempTestPluginError = e;
                   }
                 })();
               `;
               
               // Make Convex client available to plugins
               // The Convex client will be set by the dashboard context
                if (typeof window !== 'undefined' && !(window as unknown as Record<string, unknown>).convexClient) {
                 console.warn('Convex client not available in plugin loader');
               }
               
               // Execute the processed code
               eval(wrappedCode);
               
               // Check if plugin loaded successfully
                if ((window as unknown as Record<string, unknown>).TempTestPlugin) {
                  const instance = new (((window as unknown as Record<string, unknown>).TempTestPlugin) as new () => Record<string, unknown>)();
                 setPluginInstance(instance);
                 
                 // Initialize the plugin
                 if (typeof instance.initialize === 'function') {
                   instance.initialize();
                 }
                 
                 // Create the plugin UI if the method exists
                 if (typeof instance.createUI === 'function' && containerRef.current) {
                   instance.createUI(containerRef.current);
                 }
                 
                 // Cleanup global reference
                 delete (window as unknown as Record<string, unknown>).TempTestPlugin;
               } else if ((window as unknown as Record<string, unknown>).TempTestPluginError) {
                 console.error('Plugin loading failed:', (window as unknown as Record<string, unknown>).TempTestPluginError);
                 delete (window as unknown as Record<string, unknown>).TempTestPluginError;
               }
               
             } catch (error) {
               console.error('Plugin loading error:', error);
             }
           };
           
           loadPluginCode();
           
           // Cleanup function
           return () => {
             setPluginInstance(prevInstance => {
               if (prevInstance && typeof prevInstance.destroy === 'function') {
                 prevInstance.destroy();
               }
               return null;
             });
           };
         }, []); // Empty dependency array - only run once on mount

         return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
       };

      setPluginComponent(() => PluginComponent);
      setLoading(false);
    } catch (err) {
      console.error('Error loading plugin:', err);
      setError(`Failed to load plugin: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setLoading(false);
    }
  }, [pluginData?.files]);

  useEffect(() => {
    if (!pluginData) {
      setLoading(true);
      return;
    }

    if (!pluginData.plugin) {
      setError(`Plugin "${pluginName}" not found`);
      setLoading(false);
      return;
    }

    loadPlugin();
  }, [pluginData, pluginName, loadPlugin]);

  if (loading) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        fontFamily: 'JetBrains Mono, monospace'
      }}>
        <div style={{ marginBottom: '10px' }}>🔄</div>
        <div>Loading plugin &quot;{pluginName}&quot;...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        fontFamily: 'JetBrains Mono, monospace',
        color: '#dc3545'
      }}>
        <div style={{ marginBottom: '10px' }}>❌</div>
        <div>{error}</div>
      </div>
    );
  }

  if (!pluginComponent) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        fontFamily: 'JetBrains Mono, monospace'
      }}>
        <div style={{ marginBottom: '10px' }}>⚠️</div>
        <div>Plugin component not available</div>
      </div>
    );
  }

  const PluginComponent = pluginComponent;
  return <PluginComponent />;
};

// Export helper function to get plugin emoji
export { getPluginEmoji };
