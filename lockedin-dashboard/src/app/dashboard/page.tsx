'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../auth-context';
import { getNavigationItems, getPageComponent, registerPage, createPageComponent } from './nav-config';
import { initializeAllPages } from './page-initializer';
import { PluginLoader, getPluginEmoji } from './plugin-loader';
import { BackgroundPluginManager } from './background-plugin-manager';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import styles from './dashboard.module.css';
import Image from 'next/image';
import { DashboardSidebar } from '@/components/dashboard-sidebar';

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

interface PluginRedirectEventDetail {
  targetPlugin: string;
  fromPlugin?: string;
  trigger?: string;
  payload?: unknown;
  timestamp?: number;
}

export default function DashboardPage() {
  const { isAuthenticated, username, userData, logout, isLoading } = useAuth();
  const router = useRouter();
  const [navItems, setNavItems] = useState<NavigationItem[]>([]);
  const [activePage, setActivePage] = useState<string>('welcome');
  const [pluginsLoaded, setPluginsLoaded] = useState(false);
  const [authVerified, setAuthVerified] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Load theme from preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('dashboard-theme') as 'dark' | 'light';
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'light') document.body.classList.add('light-mode');
    } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      setTheme('light');
      document.body.classList.add('light-mode');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('dashboard-theme', newTheme);
    if (newTheme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  };

  // NEW: Check if user is approved to access dashboard
  useEffect(() => {
    // Only check if we have userData loaded
    if (isAuthenticated && userData !== undefined && userData !== null) {
      console.log('Dashboard access check:', { 
        username, 
        isApproved: userData.isApproved,
        hasIsApprovedField: 'isApproved' in userData 
      });
      
      // Only block if isApproved is explicitly false
      if (userData.isApproved === false) {
        console.warn('Unapproved user attempted to access dashboard:', username);
        setAuthVerified(false);
        logout();
        router.push('/login?error=pending_approval');
        return;
      }
      
      // User is approved, mark as verified
      setAuthVerified(true);
    }
  }, [isAuthenticated, userData, username, logout, router]);

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setAuthVerified(false);
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Parse user's plugin list - memoized to prevent infinite loops
  const userPluginNames = useMemo(() => {
    return userData?.plugins ? userData.plugins.split(',').map((name: string) => name.trim()).filter(Boolean) : [];
  }, [userData?.plugins]);

  useEffect(() => {
    const handlePluginRedirect = (event: Event) => {
      const customEvent = event as CustomEvent<PluginRedirectEventDetail>;
      const detail = customEvent.detail;

      if (!detail?.targetPlugin) {
        return;
      }

      const targetPage = `plugin-${detail.targetPlugin}`;
      const targetExists = navItems.some((item) => item.id === targetPage);
      if (!targetExists) {
        console.warn('[DashboardPage] Redirect target not available in navigation:', detail.targetPlugin);
        return;
      }

      console.log('[DashboardPage] Plugin redirect:', {
        from: detail.fromPlugin,
        to: detail.targetPlugin,
        trigger: detail.trigger,
      });

      setActivePage(targetPage);
    };

    window.addEventListener('plugin:redirect', handlePluginRedirect as EventListener);
    return () => {
      window.removeEventListener('plugin:redirect', handlePluginRedirect as EventListener);
    };
  }, [navItems]);

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
  }, [userPlugins, userPluginNames, pluginsLoaded]);

  // Handle case where user has no plugins (set pluginsLoaded to true immediately)
  useEffect(() => {
    if (!pluginsLoaded && userData && userPluginNames.length === 0) {
      // Register default pages immediately since we don't have plugins to wait for
      initializeAllPages();
      setPluginsLoaded(true);
    }
  }, [pluginsLoaded, userData, userPluginNames]);

  // Expose dashboard context to plugins - run only once on mount
  useEffect(() => {
    // Make dashboard context available to plugins
    if (typeof window !== 'undefined') {
      // Create Convex client for plugins (using dynamic import)
      import('convex/browser').then(({ ConvexHttpClient }) => {
        (window as unknown as Record<string, unknown>).convexClient = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || 'https://modest-pig-521.convex.cloud');
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
              if (item.id === 'admin-accounts' || item.id === 'plugin-publisher' || item.id === 'admin-approvals' || item.id === 'admin-api-keys') {
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
      // Clean up non-existent plugins from user profile
      if (userData && (userData as any)._id) {
        fetch('/api/clean-invalid-plugins', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: (userData as any)._id }),
        }).catch(err => console.error('Failed to clean invalid plugins:', err));
      }
      // Initialize all pages (emergency pages only - not for main navigation)
      initializeAllPages();

      // Get navigation items from registry and filter based on user role and plugin assignments
      const allItems = getNavigationItems();

      const filteredItems = allItems.filter(item => {
        // Skip emergency/hard-coded pages from main navigation
        if (item.id === 'admin-accounts' || item.id === 'plugin-publisher' || item.id === 'admin-approvals' || item.id === 'admin-api-keys') {
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
    // Special pages that shouldn't be auto-redirected from
    const specialPages = ['admin-accounts', 'plugin-publisher', 'admin-approvals', 'admin-api-keys'];

    if (navItems.length > 0 && activePage === 'welcome') {
      // Only auto-select if we're still on the default welcome page
      setActivePage(navItems[0].id);
    } else if (navItems.length === 0 && !specialPages.includes(activePage)) {
      // If no navigation items AND not on a special page, go to welcome
      setActivePage('welcome');
    }
  }, [navItems, activePage]); // Include activePage dependency

  // NOTE: Authentication is now handled by Convex Auth
  // The Authenticated/Unauthenticated components in layout.tsx handle redirects
  // useEffect(() => {
  //   // Redirect to login if not authenticated
  //   if (!isAuthenticated) {
  //     router.push('/login');
  //   }
  // }, [isAuthenticated, router]);

  // Function to handle logout
  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };


  // Function to render the active page
  const renderActivePage = () => {
    const pageProps = { username: username || undefined, userData: userData as Record<string, unknown> | undefined };

    // Get the component from the page registry
    const PageComponent = getPageComponent(activePage);

    if (PageComponent) {
      return <PageComponent {...pageProps} />;
    }

    // If no navigation items AND no active page found, show welcome content
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
            fontSize: '40px',
            marginBottom: '12px',
            fontFamily: 'JetBrains Mono, monospace',
            color: 'rgba(255,255,255,0.92)',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '3px'
          }}>
            LOCKEDIN
          </h1>
          <h2 style={{
            fontSize: '18px',
            marginBottom: '24px',
            color: 'rgba(140,190,255,0.75)',
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 400
          }}>
            {username ? `Welcome, ${username}!` : 'Welcome to LockedIN'}
          </h2>
          {userData && (
            <div style={{
              fontSize: '14px',
              lineHeight: '1.6',
              color: 'rgba(255,255,255,0.4)',
              fontFamily: 'JetBrains Mono, monospace'
            }}>
              <p><strong style={{ color: 'rgba(220,242,255,0.75)' }}>Role:</strong> {userData.role || 'User'}</p>
              {userData.createdAt && (
                <p><strong style={{ color: 'rgba(220,242,255,0.75)' }}>Member since:</strong> {new Date(userData.createdAt).toLocaleDateString()}</p>
              )}
            </div>
          )}
        </div>
      );
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
          fontSize: '28px',
          color: 'rgba(255,255,255,0.6)',
          fontFamily: 'JetBrains Mono, monospace',
          fontWeight: 400
        }}>Page not found: {activePage}</h2>
        <p style={{
          fontSize: '13px',
          color: 'rgba(255,255,255,0.3)',
          fontFamily: 'JetBrains Mono, monospace',
          marginTop: '12px'
        }}>Available pages: {navItems.map(item => item.id).join(', ')}</p>
      </div>
    );
  };

  // Show loading screen while checking authentication and approval status
  if (isLoading || !authVerified) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: "'SF Pro', -apple-system, system-ui, sans-serif",
        fontSize: '15px',
        color: 'rgba(255,255,255,0.45)',
        backgroundColor: '#0a0f1e'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '36px',
            height: '36px',
            border: '3px solid rgba(255,255,255,0.08)',
            borderTop: '3px solid rgba(92, 149, 255, 0.8)',
            borderRadius: '50%',
            animation: 'spin 0.9s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ margin: 0, letterSpacing: '0.5px' }}>Ověřování přístupu...</p>
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

  return (
    <div className={styles.dashboardContainer}>
      {/* Load all enabled plugins in background for inter-plugin communication */}
      {userPlugins && userPlugins.length > 0 && (
        <BackgroundPluginManager
          plugins={userPlugins}
          username={username}
          userData={userData}
        />
      )}

      {/* Sidebar using HeroUI component */}
      <DashboardSidebar
        logoSrc="/media/logo-v2.svg"
        navItems={navItems}
        activePage={activePage}
        onNavigation={setActivePage}
        username={username}
        userRole={userData?.role ? userData.role.charAt(0).toUpperCase() + userData.role.slice(1) : 'User'}
        isAdmin={userData?.role === 'admin'}
        theme={theme}
        onThemeToggle={toggleTheme}
        onLogout={handleLogout}
        renderIcon={(icon) => {
          if (icon.startsWith('icon-')) {
            const pluginName = icon.replace('icon-', '');
            return (
              <span className={styles.navIcon}>
                <PluginIcon
                  pluginName={pluginName}
                  fallback={getPluginEmoji(pluginName)}
                />
              </span>
            );
          }
          return <span className={styles.navIcon}>{icon}</span>;
        }}
      />

      {/* Main Content */}
      <div className={styles.mainContent}>
        <div className={styles.contentContainer}>
          {renderActivePage()}
        </div>
      </div>
    </div>
  );
}

