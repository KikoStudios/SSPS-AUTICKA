import React from 'react';

interface PageProps {
  username?: string;
  userData?: Record<string, unknown>;
}

export const ReportsPage: React.FC<PageProps> = ({ username }) => {
  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '20px', fontFamily: 'Courier New, monospace' }}>
        REPORTS
      </h1>
      <div style={{ fontSize: '16px', lineHeight: '1.6' }}>
        <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <h3>System Reports</h3>
          <p>Generate and view system reports for {username}.</p>
          <button style={{ 
            padding: '10px 20px', 
            backgroundColor: '#17a2b8', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer',
            fontFamily: 'Courier New, monospace'
          }}>
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
};

export const ToolsPage: React.FC<PageProps> = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '20px', fontFamily: 'Courier New, monospace' }}>
        TOOLS
      </h1>
      <div style={{ fontSize: '16px', lineHeight: '1.6' }}>
        <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <h3>System Tools</h3>
          <p>Access various system tools and utilities.</p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button style={{ 
              padding: '10px 20px', 
              backgroundColor: '#6f42c1', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: 'Courier New, monospace'
            }}>
              Database Tool
            </button>
            <button style={{ 
              padding: '10px 20px', 
              backgroundColor: '#fd7e14', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: 'Courier New, monospace'
            }}>
              Log Viewer
            </button>
            <button style={{ 
              padding: '10px 20px', 
              backgroundColor: '#20c997', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: 'Courier New, monospace'
            }}>
              System Monitor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const HelpPage: React.FC<PageProps> = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '20px', fontFamily: 'Courier New, monospace' }}>
        HELP & SUPPORT
      </h1>
      <div style={{ fontSize: '16px', lineHeight: '1.6' }}>
        <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <h3>Documentation</h3>
          <p>Access help documentation and guides.</p>
          <ul>
            <li><a href="#" style={{ color: '#007bff' }}>User Manual</a></li>
            <li><a href="#" style={{ color: '#007bff' }}>API Documentation</a></li>
            <li><a href="#" style={{ color: '#007bff' }}>FAQ</a></li>
            <li><a href="#" style={{ color: '#007bff' }}>Video Tutorials</a></li>
          </ul>
        </div>
        
        <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <h3>Contact Support</h3>
          <p>Get help from our support team.</p>
          <button style={{ 
            padding: '10px 20px', 
            backgroundColor: '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer',
            fontFamily: 'Courier New, monospace'
          }}>
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};
