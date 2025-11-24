'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../auth-context';
import { getNavigationItems, getPageComponent, registerPage, createPageComponent } from './nav-config';
import { initializeAllPages } from './page-initializer';
import { PluginLoader, getPluginEmoji } from './plugin-loader';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import styles from './dashboard.module.css';

// Component to render plugin icons dynamically
function PluginIcon({ pluginName, fallback }: { pluginName: string, fallback: string }) {
  const iconUrl = useQuery(api.context.getPluginIconUrl, { pluginName });
  
  // Handle specific icon mappings
  const iconMap: Record<string, string> = {
    'counter': '/media/counter.svg',
    'icon-counter': '/media/counter.svg'
  };
  
  // Check if we have a direct mapping
  if (iconMap[pluginName]) {
    return <img src={iconMap[pluginName]} alt={`${pluginName} icon`} style={{ width: '28px', height: '28px' }} />;
  }
  
  if (iconUrl) {
    return <img src={iconUrl} alt={`${pluginName} icon`} style={{ width: '28px', height: '28px' }} />;
  }
  
  return <span>{fallback}</span>;
}

interface UserData {
  role?: string;
  createdAt?: string;
  permissions?: string[];
  isActive?: boolean;
  plugins?: string; // Comma-separated list of plugin names
}

interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  permissions?: string[];
}

export default function DashboardPage() {
  const { isAuthenticated, username, userData, logout, isLoading } = useAuth();
  const router = useRouter();
  const [navItems, setNavItems] = useState<NavigationItem[]>([]);
  const [activePage, setActivePage] = useState<string>('welcome');
  const [pluginsLoaded, setPluginsLoaded] = useState(false);
  // Admin can disable plugins through their own user account management
  // This will be handled through the normal user management interface

  // Parse user's plugin list - memoized to prevent infinite loops
  const userPluginNames = useMemo(() => {
    return userData?.plugins ? userData.plugins.split(',').map((name: string) => name.trim()).filter(Boolean) : [];
  }, [userData?.plugins]);
  
  // Fetch user's plugins from database
  const userPlugins = useQuery(
    api.context.getPluginsByNames, 
    userPluginNames.length > 0 ? { pluginNames: userPluginNames } : "skip"
  );

  // Load user plugins and register them as pages - with proper dependency management
  useEffect(() => {
    if (userPlugins && !pluginsLoaded && userPluginNames.length > 0) {
      console.log('Loading user plugins:', userPlugins);
      
      // Register each plugin as a page component
      userPlugins.forEach((plugin: { name: string, iconFileId?: string }) => {
        // Create a wrapper component for the plugin
        const PluginComponent = ({ username, userData }: { username?: string, userData?: UserData }) => (
          <PluginLoader 
            pluginName={plugin.name} 
            username={username} 
            userData={userData as Record<string, unknown>} 
          />
        );
        
        // Register the plugin as a page with dynamic icon
        const pluginPage = createPageComponent(
          `plugin-${plugin.name}`,
          plugin.name,
          plugin.iconFileId ? `icon-${plugin.name}` : getPluginEmoji(plugin.name), // Use icon ID for dynamic loading
          PluginComponent,
          [] // No specific permissions required for user's own plugins
        );
        
        registerPage(pluginPage);
      });
      
      setPluginsLoaded(true);
    }
  }, [userPlugins, userPluginNames, pluginsLoaded]); // Include pluginsLoaded dependency

  // Expose dashboard context to plugins - run only once on mount
  useEffect(() => {
    // Make dashboard context available to plugins
    if (typeof window !== 'undefined') {
      // Create Convex client for plugins (using dynamic import)
      import('convex/browser').then(({ ConvexHttpClient }) => {
        (window as unknown as Record<string, unknown>).convexClient = new ConvexHttpClient('https://combative-cat-787.convex.cloud');
      }).catch(error => {
        console.error('Failed to load Convex client:', error);
      });
      
      // Create a stable refresh function that doesn't cause loops
      const createRefreshFunction = () => {
        return () => {
          // Only refresh if plugins are actually loaded
          if (pluginsLoaded) {
            const allItems = getNavigationItems();
            const filteredItems = allItems.filter(item => {
              // Skip emergency/hard-coded pages from main navigation
              if (item.id === 'admin-accounts' || item.id === 'plugin-publisher') {
                return false;
              }
              
              // For plugin items (prefixed with 'plugin-'), check if user has access
              if (item.id.startsWith('plugin-')) {
                const pluginName = item.id.replace('plugin-', '');
                
                // If user is admin, show all plugins
                if (userData?.role === 'admin') {
                  return true;
                } else {
                  // Regular users only see plugins assigned to them
                  const currentUserPluginNames = userData?.plugins ? userData.plugins.split(',').map((name: string) => name.trim()).filter(Boolean) : [];
                  return currentUserPluginNames.includes(pluginName);
                }
              }
              
              // For non-plugin items, apply permission-based filtering
              if (!item.permissions || item.permissions.length === 0) {
                return true;
              }
              return userData?.role === 'admin';
            });
            setNavItems(filteredItems);
          }
        };
      };
      
      (window as unknown as Record<string, unknown>).dashboardContext = {
        userData,
        username,
        refreshDashboard: createRefreshFunction()
      };
      
      // Make refresh function globally available
      (window as unknown as Record<string, unknown>).refreshDashboard = createRefreshFunction();
    }
  }, [pluginsLoaded, userData, username]); // Include dependencies to prevent warnings

  // Initialize pages and navigation - run only when plugins are loaded
  useEffect(() => {
    if (pluginsLoaded) {
      // Initialize all pages (emergency pages only - not for main navigation)
      initializeAllPages();
      
      // Get navigation items from registry and filter based on user role and plugin assignments
      const allItems = getNavigationItems();
      
      const filteredItems = allItems.filter(item => {
        // Skip emergency/hard-coded pages from main navigation
        if (item.id === 'admin-accounts' || item.id === 'plugin-publisher') {
          return false;
        }
        
        // For plugin items (prefixed with 'plugin-'), check if user has access
        if (item.id.startsWith('plugin-')) {
          const pluginName = item.id.replace('plugin-', '');
          
          // If user is admin, show all plugins by default
          if (userData?.role === 'admin') {
            return true;
          } else {
            // Regular users only see plugins assigned to them
            return userPluginNames.includes(pluginName);
          }
        }
        
        // No default items to check for duplicates anymore
        
        // For other non-plugin items, apply permission-based filtering
        if (!item.permissions || item.permissions.length === 0) {
          return true;
        }
        
        return userData?.role === 'admin';
      });
      
      setNavItems(filteredItems);
    }
  }, [pluginsLoaded, userData?.role, userPluginNames]); // Include all dependencies

  // Auto-select first available page when navigation items change - prevent loops
  useEffect(() => {
    if (navItems.length > 0 && activePage === 'welcome') {
      // Only auto-select if we're still on the default welcome page
      setActivePage(navItems[0].id);
    } else if (navItems.length === 0) {
      // If no navigation items, stay on welcome
      setActivePage('welcome');
    }
  }, [navItems, activePage]); // Include activePage dependency


  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };


  // Function to render the active page
  const renderActivePage = () => {
    const pageProps = { username: username || undefined, userData: userData as Record<string, unknown> | undefined };
    
    // If no navigation items, show welcome content
    if (navItems.length === 0) {
      return (
        <div style={{ 
          padding: '60px', 
          textAlign: 'center',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <h1 style={{ 
            fontSize: '48px', 
            marginBottom: '20px', 
            fontFamily: 'JetBrains Mono, monospace',
            color: 'var(--dark-blue)',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '2px'
          }}>
            LOCKEDIN
          </h1>
          <h2 style={{ 
            fontSize: '24px', 
            marginBottom: '30px', 
            color: 'var(--grey)',
            fontFamily: 'JetBrains Mono, monospace'
          }}>
            {username ? `Welcome, ${username}!` : 'Welcome to LockedIN'}
          </h2>
          {userData && (
            <div style={{ 
              fontSize: '16px', 
              lineHeight: '1.6',
              color: 'var(--grey)',
              fontFamily: 'JetBrains Mono, monospace'
            }}>
              <p><strong style={{ color: 'var(--dark-blue)' }}>Role:</strong> {userData.role || 'User'}</p>
              {userData.createdAt && (
                <p><strong style={{ color: 'var(--dark-blue)' }}>Member since:</strong> {new Date(userData.createdAt).toLocaleDateString()}</p>
              )}
            </div>
          )}
        </div>
      );
    }
    
    // Get the component from the page registry
    const PageComponent = getPageComponent(activePage);
    
    if (PageComponent) {
      return <PageComponent {...pageProps} />;
    }
    
    // Fallback if component not found
    return (
      <div style={{ 
        padding: '60px', 
        textAlign: 'center',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <h2 style={{ 
          fontSize: '32px',
          color: 'var(--dark-blue)',
          fontFamily: 'JetBrains Mono, monospace'
        }}>Page not found: {activePage}</h2>
        <p style={{ 
          fontSize: '16px',
          color: 'var(--grey)',
          fontFamily: 'JetBrains Mono, monospace'
        }}>Available pages: {navItems.map(item => item.id).join(', ')}</p>
      </div>
    );
  };

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '18px',
        color: '#666'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #007bff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p>Checking authentication...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Show loading or redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'monospace'
      }}>
        <p>Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      {/* Sidebar */}
      <div className={styles.sidebar}>
        {/* Logo/Branding */}
        <div className={styles.logoContainer}>
          <div className={styles.logo}>
            <span className={styles.logoLocked}>LOCKED</span>
            <span className={styles.logoIn}>IN</span>
          </div>
        </div>
        
        {/* Navigation Area */}
        <div className={styles.navigation}>
          {/* Primary Navigation - Counter and Parking */}
          <div className={styles.navSection}>
            <div className={styles.navMenu}>
              {navItems.map((item) => (
                <button
                  key={item.id}
                  className={`${styles.navItem} ${activePage === item.id ? styles.active : ''}`}
                  onClick={() => setActivePage(item.id)}
                >
                  <span className={styles.navIcon}>
                    {item.icon.startsWith('icon-') ? (
                      <PluginIcon 
                        pluginName={item.icon.replace('icon-', '')} 
                        fallback={getPluginEmoji(item.icon.replace('icon-', ''))}
                      />
                    ) : (
                      item.icon
                    )}
                  </span>
                  <span className={styles.navLabel}>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Admin Section */}
        <div className={styles.adminSection}>
          {/* Management Buttons */}
          {userData?.role === 'admin' && (
            <div className={styles.managementButtons}>
              <button
                className={`${styles.managementButton} ${activePage === 'admin-accounts' ? styles.active : ''}`}
                onClick={() => setActivePage('admin-accounts')}
              >
                <span className={styles.managementIcon}>
                  <img src="/media/Manange.svg" alt="Manage" style={{ width: '28px', height: '28px' }} />
                </span>
                <span className={styles.managementLabel}>Manange</span>
              </button>
              <button
                className={`${styles.managementButton} ${activePage === 'plugin-publisher' ? styles.active : ''}`}
                onClick={() => setActivePage('plugin-publisher')}
              >
                <span className={styles.managementIcon}>
                  <img src="/media/plugins.svg" alt="Plugins" style={{ width: '28px', height: '28px' }} />
                </span>
                <span className={styles.managementLabel}>Plugins</span>
              </button>
            </div>
          )}
          
          {/* Admin Button with Logout */}
          <button
            className={`${styles.adminButton} ${styles.active}`}
            onClick={handleLogout}
          >
            <span className={styles.adminLabel}>{username || 'admin'}</span>
            <span className={styles.logoutIcon}>
              <img src="/media/logout_icon.svg" alt="Logout" style={{ width: '20px', height: '20px' }} />
            </span>
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className={styles.mainContent}>
        <div className={styles.contentContainer}>
          {renderActivePage()}
        </div>
      </div>
    </div>
  );
}

