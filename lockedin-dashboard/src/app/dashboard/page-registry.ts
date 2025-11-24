import React from 'react';

// Page component interface
export interface PageComponent {
  id: string;
  label: string;
  icon: string;
  component: React.ComponentType<{ username?: string, userData?: Record<string, unknown> }>;
  permissions?: string[];
}

// Page registry to store all registered pages
class PageRegistry {
  private pages: Map<string, PageComponent> = new Map();
  private defaultPages: PageComponent[] = [];

  // Register a new page
  registerPage(page: PageComponent): void {
    this.pages.set(page.id, page);
  }

  // Register multiple pages at once
  registerPages(pages: PageComponent[]): void {
    pages.forEach(page => this.registerPage(page));
  }

  // Get a page by ID
  getPage(id: string): PageComponent | undefined {
    return this.pages.get(id);
  }

  // Get all registered pages
  getAllPages(): PageComponent[] {
    return Array.from(this.pages.values());
  }

  // Get pages as navigation items
  getNavigationItems(): Array<{id: string; label: string; icon: string; component: string; permissions?: string[]}> {
    return this.getAllPages().map(page => ({
      id: page.id,
      label: page.label,
      icon: page.icon,
      component: page.id,
      permissions: page.permissions
    }));
  }

  // Remove a page
  removePage(id: string): boolean {
    return this.pages.delete(id);
  }

  // Check if a page exists
  hasPage(id: string): boolean {
    return this.pages.has(id);
  }

  // Set default pages (built-in pages)
  setDefaultPages(pages: PageComponent[]): void {
    this.defaultPages = pages;
    pages.forEach(page => this.registerPage(page));
  }

  // Get only default pages
  getDefaultPages(): PageComponent[] {
    return this.defaultPages;
  }

  // Get only custom pages (non-default)
  getCustomPages(): PageComponent[] {
    return this.getAllPages().filter(page => 
      !this.defaultPages.some(defaultPage => defaultPage.id === page.id)
    );
  }

  // Clear all custom pages (keep defaults)
  clearCustomPages(): void {
    const customPageIds = this.getCustomPages().map(page => page.id);
    customPageIds.forEach(id => this.pages.delete(id));
  }
}

// Create a singleton instance
export const pageRegistry = new PageRegistry();

// Helper function to create a page component
export function createPageComponent(
  id: string,
  label: string,
  icon: string,
  component: React.ComponentType<{ username?: string, userData?: Record<string, unknown> }>,
  permissions?: string[]
): PageComponent {
  return {
    id,
    label,
    icon,
    component,
    permissions
  };
}

// Helper function to register a page
export function registerPage(page: PageComponent): void {
  pageRegistry.registerPage(page);
}

// Helper function to register multiple pages
export function registerPages(pages: PageComponent[]): void {
  pageRegistry.registerPages(pages);
}

// Helper function to get all navigation items
export function getNavigationItems() {
  return pageRegistry.getNavigationItems();
}

// Helper function to get a page component
export function getPageComponent(id: string): React.ComponentType<{ username?: string, userData?: Record<string, unknown> }> | undefined {
  const page = pageRegistry.getPage(id);
  return page?.component;
}
