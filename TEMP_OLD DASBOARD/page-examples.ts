/**
 * Example: How to Add Pages Dynamically in Code
 * 
 * This file demonstrates how to programmatically add new pages to the dashboard
 * without modifying the UI. You can add these pages anywhere in your application.
 */

import { pageRegistry, createPageComponent, registerPage, registerPages } from './page-registry';
import { ReportsPage, ToolsPage, HelpPage } from './additional-pages';
import { 
  UserManagementPage, 
  ProductPage, 
  OrdersPage, 
  InventoryPage, 
  SystemLogsPage, 
  DataDashboardPage 
} from './example-components';

// Example 1: Adding a single page
export function addUserManagementPage() {
  registerPage(
    createPageComponent('user-management', 'User Management', '👥', UserManagementPage, ['admin'])
  );
}

// Example 2: Adding multiple pages at once
export function addECommercePages() {
  const ecommercePages = [
    createPageComponent('products', 'Products', '📦', ProductPage, ['read', 'write']),
    createPageComponent('orders', 'Orders', '📋', OrdersPage, ['read', 'write']),
    createPageComponent('inventory', 'Inventory', '📊', InventoryPage, ['admin'])
  ];

  registerPages(ecommercePages);
}

// Example 3: Adding a page with conditional rendering based on user permissions
export function addAdminOnlyPages() {
  registerPage(
    createPageComponent('system-logs', 'System Logs', '📜', SystemLogsPage, ['admin'])
  );
}

// Example 4: Adding a page that fetches data dynamically
export function addDataDrivenPage() {
  registerPage(
    createPageComponent('data-dashboard', 'Data Dashboard', '📈', DataDashboardPage)
  );
}

// Example 5: Adding the additional pages from additional-pages.tsx
export function addAdditionalPages() {
  registerPage(
    createPageComponent('reports', 'Reports', '📈', ReportsPage, ['read', 'admin'])
  );
  
  registerPage(
    createPageComponent('tools', 'Tools', '🔧', ToolsPage, ['admin'])
  );
  
  registerPage(
    createPageComponent('help', 'Help', '❓', HelpPage)
  );
}

// Example 6: How to use these functions in your application
export function initializeCustomPages() {
  // Add pages based on user role or application requirements
  addUserManagementPage();
  addECommercePages();
  addAdminOnlyPages();
  addDataDrivenPage();
  addAdditionalPages();
  
  console.log('Custom pages registered successfully!');
  console.log('Available pages:', pageRegistry.getAllPages().map(p => p.id));
}

// Example 6: Conditional page registration based on user role
export function addRoleBasedPages(userRole: string) {
  if (userRole === 'admin') {
    addUserManagementPage();
    addAdminOnlyPages();
  } else if (userRole === 'manager') {
    addECommercePages();
  }
  
  // Always add data dashboard for all users
  addDataDrivenPage();
}
