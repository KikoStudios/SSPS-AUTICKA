// Navigation configuration for the dashboard
export interface NavItem {
  id: string;
  label: string;
  icon: string;
  component: string; // Component name to render
  permissions?: string[]; // Optional permissions required
}

// Re-export page registry functions for convenience
export { 
  pageRegistry, 
  createPageComponent, 
  registerPage, 
  registerPages, 
  getNavigationItems, 
  getPageComponent 
} from './page-registry';
