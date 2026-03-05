'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  Button,
} from '@heroui/react';
import styles from '../app/dashboard/dashboard.module.css';

interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  permissions?: string[];
}

interface SidebarProps {
  logoSrc?: string;
  navItems: NavigationItem[];
  activePage: string;
  onNavigation: (pageId: string) => void;
  username?: string;
  userRole?: string;
  isAdmin?: boolean;
  theme: 'dark' | 'light';
  onThemeToggle?: () => void;
  onLogout?: () => void;
  renderIcon?: (icon: string, itemId?: string) => React.ReactNode;
}

/**
 * Beautiful HeroUI-based Dashboard Sidebar
 * 
 * Features:
 * - Logo branding area
 * - Navigation items with active states
 * - Admin management buttons
 * - Theme toggle
 * - User profile with logout
 * - Custom icon rendering support
 */
export const DashboardSidebar: React.FC<SidebarProps> = ({
  logoSrc = '/media/logo-v2.svg',
  navItems,
  activePage,
  onNavigation,
  username = 'User',
  userRole = 'User',
  isAdmin = false,
  theme = 'dark',
  onThemeToggle,
  onLogout,
  renderIcon = (icon) => <span className={styles.navIcon}>{icon}</span>,
}) => {
  const [displayTheme, setDisplayTheme] = useState(theme);

  useEffect(() => {
    setDisplayTheme(theme);
  }, [theme]);

  return (
    <div className={styles.sidebar}>
      {/* Logo Area */}
      <div className={styles.logoContainer}>
        <div className={styles.logo}>
          <Image
            src={logoSrc}
            alt="LockedIN"
            width={340}
            height={220}
            className={styles.logoImage}
            priority
          />
        </div>
      </div>

      {/* Navigation Area */}
      <div className={styles.navigation}>
        <div className={styles.navMenu}>
          {navItems.map((item) => (
            <div className="w-full" key={item.id}>
              <div className="w-full">
                <Button
                  isIconOnly={false}
                  className={`${styles.navItem} ${
                    activePage === item.id ? styles.active : ''
                  }`}
                  onClick={() => onNavigation(item.id)}
                  fullWidth
                  variant={activePage === item.id ? 'solid' : 'light'}
                  color={activePage === item.id ? 'primary' : 'default'}
                >
                  {renderIcon(item.icon, item.id)}
                  <span className={styles.navLabel}>{item.label}</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Admin Section */}
      <div className={styles.adminSection}>
        {/* Management Buttons */}
        {isAdmin && (
          <div className={styles.managementButtons}>
            <div className="w-full">
              <div className="w-full">
                <Button
                  className={`${styles.managementButton} ${
                    activePage === 'admin-accounts' ? styles.active : ''
                  }`}
                  onClick={() => onNavigation('admin-accounts')}
                  fullWidth
                  variant={activePage === 'admin-accounts' ? 'solid' : 'flat'}
                  color={activePage === 'admin-accounts' ? 'primary' : 'default'}
                >
                  <span className={styles.managementIcon}>
                    <img
                      src="/icons/acc-manange-outline.svg"
                      alt="Manage"
                      className={styles.iconOutline}
                      style={{ width: '28px', height: '28px' }}
                    />
                    <img
                      src="/icons/acc-manange-full.svg"
                      alt="Manage"
                      className={styles.iconFull}
                      style={{ width: '28px', height: '28px' }}
                    />
                  </span>
                  <span className={styles.managementLabel}>Manage</span>
                </Button>
              </div>
            </div>

            <div className="w-full">
              <div className="w-full">
                <Button
                  className={`${styles.managementButton} ${
                    activePage === 'plugin-publisher' ? styles.active : ''
                  }`}
                  onClick={() => onNavigation('plugin-publisher')}
                  fullWidth
                  variant={activePage === 'plugin-publisher' ? 'solid' : 'flat'}
                  color={activePage === 'plugin-publisher' ? 'primary' : 'default'}
                >
                  <span className={styles.managementIcon}>
                    <img
                      src="/icons/app-outline.svg"
                      alt="Plugins"
                      className={styles.iconOutline}
                      style={{ width: '28px', height: '28px' }}
                    />
                    <img
                      src="/icons/app-full.svg"
                      alt="Plugins"
                      className={styles.iconFull}
                      style={{ width: '28px', height: '28px' }}
                    />
                  </span>
                  <span className={styles.managementLabel}>Plugins</span>
                </Button>
              </div>
            </div>

            <div className="w-full">
              <div className="w-full">
                <Button
                  className={`${styles.managementButton} ${
                    activePage === 'admin-approvals' ? styles.active : ''
                  }`}
                  onClick={() => onNavigation('admin-approvals')}
                  fullWidth
                  variant={activePage === 'admin-approvals' ? 'solid' : 'flat'}
                  color={activePage === 'admin-approvals' ? 'primary' : 'default'}
                >
                  <span className={styles.managementIcon}>
                    <img
                      src="/icons/verification-outline.svg"
                      alt="Approvals"
                      className={styles.iconOutline}
                      style={{ width: '28px', height: '28px' }}
                    />
                    <img
                      src="/icons/verification-full.svg"
                      alt="Approvals"
                      className={styles.iconFull}
                      style={{ width: '28px', height: '28px' }}
                    />
                  </span>
                  <span className={styles.managementLabel}>Approvals</span>
                </Button>
              </div>
            </div>

            <div className="w-full">
              <div className="w-full">
                <Button
                  className={`${styles.managementButton} ${
                    activePage === 'admin-api-keys' ? styles.active : ''
                  }`}
                  onClick={() => onNavigation('admin-api-keys')}
                  fullWidth
                  variant={activePage === 'admin-api-keys' ? 'solid' : 'flat'}
                  color={activePage === 'admin-api-keys' ? 'primary' : 'default'}
                >
                  <span className={styles.managementIcon}>
                    <img
                      src="/icons/key-outline.svg"
                      alt="API Keys"
                      className={styles.iconOutline}
                      style={{ width: '28px', height: '28px' }}
                    />
                    <img
                      src="/icons/key-full.svg"
                      alt="API Keys"
                      className={styles.iconFull}
                      style={{ width: '28px', height: '28px' }}
                    />
                  </span>
                  <span className={styles.managementLabel}>API Keys</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="w-full border-t border-default-300 dark:border-default-400 my-2" />

        {/* Theme Toggle Button */}
        <div className="w-full">
          <div className="w-full">
            <Button
              className={styles.adminButton}
              onClick={onThemeToggle}
              fullWidth
              variant="light"
              color="default"
            >
              <span className={styles.logoutIcon}>
                <img
                  src={
                    displayTheme === 'dark'
                      ? '/icons/light-dark-full.svg'
                      : '/icons/light-dark-line.svg'
                  }
                  alt={displayTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  style={{ width: '20px', height: '20px' }}
                />
              </span>
              <span className={styles.adminLabel}>
                {displayTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </span>
            </Button>
          </div>
        </div>

        {/* User Profile Card */}
        <div className={styles.profileCard}>
          <div className={styles.profileHeader}>
            <span className={styles.profileIcon}>
              <img
                src="/icons/acc-full.svg"
                alt="Profile"
                style={{ width: '24px', height: '24px' }}
              />
            </span>
            <div className={styles.profileInfo}>
              <div className={styles.profileUsername}>{username || 'User'}</div>
              <div className={styles.profileRole}>{userRole}</div>
            </div>
          </div>
          <button
            className={styles.logoutAction}
            onClick={onLogout}
            title="Logout"
          >
            <img
              src="/icons/login-full.svg"
              alt="Logout"
              style={{ width: '18px', height: '18px' }}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardSidebar;

