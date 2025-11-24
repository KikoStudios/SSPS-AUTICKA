import React from 'react';

interface PageProps {
  username?: string;
  userData?: Record<string, unknown>;
}

export const UserManagementPage: React.FC<PageProps> = ({ username, userData }) => {
  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '20px', fontFamily: 'Courier New, monospace' }}>
        USER MANAGEMENT
      </h1>
      <div style={{ fontSize: '16px', lineHeight: '1.6' }}>
        <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <h3>User Administration</h3>
          <p>Manage users, roles, and permissions.</p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button style={{ 
              padding: '10px 20px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: 'Courier New, monospace'
            }}>
              Add User
            </button>
            <button style={{ 
              padding: '10px 20px', 
              backgroundColor: '#28a745', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: 'Courier New, monospace'
            }}>
              Manage Roles
            </button>
            <button style={{ 
              padding: '10px 20px', 
              backgroundColor: '#ffc107', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: 'Courier New, monospace'
            }}>
              View Permissions
            </button>
          </div>
        </div>
        
        <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <h3>Current User: {username}</h3>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <p>Role: {(userData as any)?.role || 'User'}</p>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <p>Permissions: {(userData as any)?.permissions?.join(', ') || 'None'}</p>
        </div>
      </div>
    </div>
  );
};

export const ProductPage: React.FC<PageProps> = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '20px', fontFamily: 'Courier New, monospace' }}>
        PRODUCTS
      </h1>
      <div style={{ fontSize: '16px', lineHeight: '1.6' }}>
        <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <h3>Product Catalog</h3>
          <p>Manage your product inventory and catalog.</p>
          <button style={{ 
            padding: '10px 20px', 
            backgroundColor: '#17a2b8', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer',
            fontFamily: 'Courier New, monospace'
          }}>
            Add Product
          </button>
        </div>
      </div>
    </div>
  );
};

export const OrdersPage: React.FC<PageProps> = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '20px', fontFamily: 'Courier New, monospace' }}>
        ORDERS
      </h1>
      <div style={{ fontSize: '16px', lineHeight: '1.6' }}>
        <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <h3>Order Management</h3>
          <p>View and manage customer orders.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div style={{ textAlign: 'center', padding: '15px', backgroundColor: 'white', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#007bff' }}>Pending</h4>
              <p style={{ fontSize: '24px', margin: '0', fontWeight: 'bold' }}>12</p>
            </div>
            <div style={{ textAlign: 'center', padding: '15px', backgroundColor: 'white', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#28a745' }}>Completed</h4>
              <p style={{ fontSize: '24px', margin: '0', fontWeight: 'bold' }}>156</p>
            </div>
            <div style={{ textAlign: 'center', padding: '15px', backgroundColor: 'white', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#ffc107' }}>Cancelled</h4>
              <p style={{ fontSize: '24px', margin: '0', fontWeight: 'bold' }}>3</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const InventoryPage: React.FC<PageProps> = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '20px', fontFamily: 'Courier New, monospace' }}>
        INVENTORY
      </h1>
      <div style={{ fontSize: '16px', lineHeight: '1.6' }}>
        <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <h3>Stock Management</h3>
          <p>Monitor inventory levels and stock movements.</p>
          <button style={{ 
            padding: '10px 20px', 
            backgroundColor: '#dc3545', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer',
            fontFamily: 'Courier New, monospace'
          }}>
            Low Stock Alert
          </button>
        </div>
      </div>
    </div>
  );
};

export const SystemLogsPage: React.FC<PageProps> = ({ username, userData }) => {
  // Check if user has admin permissions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hasAdminAccess = (userData as any)?.permissions?.includes('admin') || (userData as any)?.role === 'admin';
  
  if (!hasAdminAccess) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '20px', fontFamily: 'Courier New, monospace' }}>
          ACCESS DENIED
        </h1>
        <p>You don&apos;t have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '20px', fontFamily: 'Courier New, monospace' }}>
        SYSTEM LOGS
      </h1>
      <div style={{ fontSize: '16px', lineHeight: '1.6' }}>
        <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <h3>System Activity Logs</h3>
          <p>View system logs and activity for debugging and monitoring.</p>
          <div style={{ backgroundColor: '#000', color: '#00ff00', padding: '15px', borderRadius: '4px', fontFamily: 'Courier New, monospace', fontSize: '14px' }}>
            <p>[2024-01-15 10:30:15] INFO: User {username} logged in</p>
            <p>[2024-01-15 10:30:20] INFO: Dashboard accessed</p>
            <p>[2024-01-15 10:30:25] INFO: System logs page accessed</p>
            <p>[2024-01-15 10:30:30] INFO: User permissions verified</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const DataDashboardPage: React.FC<PageProps> = ({ username }) => {
  const [data, setData] = React.useState<Array<{ id: number, name: string, value: number }>>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setData([
        { id: 1, name: 'Item 1', value: 100 },
        { id: 2, name: 'Item 2', value: 200 },
        { id: 3, name: 'Item 3', value: 150 },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '20px', fontFamily: 'Courier New, monospace' }}>
          DATA DASHBOARD
        </h1>
        <p>Loading data...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '20px', fontFamily: 'Courier New, monospace' }}>
        DATA DASHBOARD
      </h1>
      <div style={{ fontSize: '16px', lineHeight: '1.6' }}>
        <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <h3>Dynamic Data Table</h3>
          <p>Data loaded for user: {username}</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
            <thead>
              <tr style={{ backgroundColor: '#e9ecef' }}>
                <th style={{ padding: '10px', border: '1px solid #dee2e6' }}>ID</th>
                <th style={{ padding: '10px', border: '1px solid #dee2e6' }}>Name</th>
                <th style={{ padding: '10px', border: '1px solid #dee2e6' }}>Value</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id}>
                  <td style={{ padding: '10px', border: '1px solid #dee2e6' }}>{item.id}</td>
                  <td style={{ padding: '10px', border: '1px solid #dee2e6' }}>{item.name}</td>
                  <td style={{ padding: '10px', border: '1px solid #dee2e6' }}>{item.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
