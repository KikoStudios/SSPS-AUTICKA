import { pageRegistry, createPageComponent } from './page-registry';
import { AdminAccountManagementPage } from './admin-pages';
import { PluginPublisherPage } from './plugin-publisher';

// Initialize default pages - these are now only used for emergency tools menu
// The actual plugins are loaded from Convex database
export function initializeDefaultPages() {
  // Create main navigation pages - none for now, only plugins
  const mainPages: never[] = [];

  // Create emergency-only pages (not added to main navigation)
  const emergencyPages = [
    createPageComponent('admin-accounts', 'Account Management', '👥', AdminAccountManagementPage, ['admin']),
    createPageComponent('plugin-publisher', 'Plugin Publisher', '🔌', PluginPublisherPage),
  ];

  // Register all pages
  [...mainPages, ...emergencyPages].forEach(page => {
    pageRegistry.registerPage(page);
  });
}

// Initialize all pages (call this in your app)
export function initializeAllPages() {
  initializeDefaultPages();
}
