/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
// import { useAuth } from '../auth-context';

interface PageProps {
  username?: string;
  userData?: Record<string, unknown>;
}

export const WelcomePage: React.FC<PageProps> = ({ username, userData }) => {
  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '20px', fontFamily: 'Courier New, monospace' }}>
        WELCOME
      </h1>
      <h2 style={{ fontSize: '24px', marginBottom: '30px', color: '#333' }}>
        {username ? `Hello, ${username}!` : 'Welcome to LockedIN'}
      </h2>
      {userData && (
        <div style={{ fontSize: '16px', lineHeight: '1.6' }}>
          <p><strong>Role:</strong> {(userData as any)?.role || 'User'}</p>
          {(userData as any)?.createdAt && (
            <p><strong>Member since:</strong> {new Date((userData as any).createdAt).toLocaleDateString()}</p>
          )}
          {(userData as any)?.permissions && (
            <p><strong>Permissions:</strong> {(userData as any).permissions.join(', ')}</p>
          )}
        </div>
      )}
    </div>
  );
};

export const ProfilePage: React.FC<PageProps> = ({ username, userData }) => {
  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '20px', fontFamily: 'Courier New, monospace' }}>
        PROFILE
      </h1>
      <div style={{ fontSize: '16px', lineHeight: '1.6' }}>
        <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <h3>Account Information</h3>
          <p><strong>Username:</strong> {username || 'Unknown'}</p>
          <p><strong>User ID:</strong> {(userData as any)?.userId || 'N/A'}</p>
          <p><strong>Status:</strong> {(userData as any)?.isActive ? 'Active' : 'Inactive'}</p>
        </div>
        
        <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <h3>Permissions</h3>
          {(userData as any)?.permissions ? (
            <ul>
              {(userData as any).permissions.map((permission: string, index: number) => (
                <li key={index}>{permission}</li>
              ))}
            </ul>
          ) : (
            <p>No permissions assigned</p>
          )}
        </div>
      </div>
    </div>
  );
};

export const SettingsPage: React.FC<PageProps> = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '20px', fontFamily: 'Courier New, monospace' }}>
        SETTINGS
      </h1>
      <div style={{ fontSize: '16px', lineHeight: '1.6' }}>
        <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <h3>Account Settings</h3>
          <p>Change your account preferences and security settings.</p>
          <button style={{ 
            padding: '10px 20px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer',
            fontFamily: 'Courier New, monospace'
          }}>
            Edit Profile
          </button>
        </div>
        
        <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <h3>Security</h3>
          <p>Manage your password and security preferences.</p>
          <button style={{ 
            padding: '10px 20px', 
            backgroundColor: '#dc3545', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer',
            fontFamily: 'Courier New, monospace'
          }}>
            Change Password
          </button>
        </div>
        
        <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <h3>Notifications</h3>
          <p>Configure how you receive notifications.</p>
          <label style={{ display: 'block', marginBottom: '10px' }}>
            <input type="checkbox" defaultChecked style={{ marginRight: '8px' }} />
            Email notifications
          </label>
          <label style={{ display: 'block', marginBottom: '10px' }}>
            <input type="checkbox" defaultChecked style={{ marginRight: '8px' }} />
            System alerts
          </label>
        </div>
      </div>
    </div>
  );
};

export const AnalyticsPage: React.FC<PageProps> = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '20px', fontFamily: 'Courier New, monospace' }}>
        ANALYTICS
      </h1>
      <div style={{ fontSize: '16px', lineHeight: '1.6' }}>
        <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <h3>Usage Statistics</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div style={{ textAlign: 'center', padding: '15px', backgroundColor: 'white', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#007bff' }}>Login Count</h4>
              <p style={{ fontSize: '24px', margin: '0', fontWeight: 'bold' }}>42</p>
            </div>
            <div style={{ textAlign: 'center', padding: '15px', backgroundColor: 'white', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#28a745' }}>Last Login</h4>
              <p style={{ fontSize: '16px', margin: '0' }}>Today</p>
            </div>
            <div style={{ textAlign: 'center', padding: '15px', backgroundColor: 'white', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#ffc107' }}>Session Time</h4>
              <p style={{ fontSize: '16px', margin: '0' }}>2h 15m</p>
            </div>
          </div>
        </div>
        
        <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <h3>Activity Log</h3>
          <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '4px', fontFamily: 'Courier New, monospace', fontSize: '14px' }}>
            <p style={{ margin: '5px 0' }}>[{new Date().toLocaleString()}] User logged in</p>
            <p style={{ margin: '5px 0' }}>[{new Date(Date.now() - 300000).toLocaleString()}] Profile viewed</p>
            <p style={{ margin: '5px 0' }}>[{new Date(Date.now() - 600000).toLocaleString()}] Settings accessed</p>
          </div>
        </div>
      </div>
    </div>
  );
};