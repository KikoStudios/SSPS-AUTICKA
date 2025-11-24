import React, { useState, useEffect } from 'react';
import { useQuery, useAction } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useAuth } from '../auth-context';
import Image from 'next/image';
import { getPluginEmoji } from './plugin-loader';

interface PluginIconProps {
  plugin: { name: string, iconFileId?: string };
}

const PluginIcon: React.FC<PluginIconProps> = ({ plugin }) => {
  const iconUrl = useQuery(api.context.getPluginIconUrl, { pluginName: plugin.name });
  
  return (
    <div style={{
      width: '36px',
      height: '36px',
      backgroundColor: iconUrl ? 'transparent' : '#95a5a6',
      borderRadius: '8px',
      marginBottom: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px',
      color: '#ffffff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      overflow: 'hidden'
    }}>
      {iconUrl ? (
        <img 
          src={iconUrl}
          alt={`${plugin.name} icon`}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      ) : (
        getPluginEmoji(plugin.name)
      )}
    </div>
  );
};

interface PageProps {
  username?: string;
  userData?: Record<string, unknown>;
}

interface User {
  _id: string;
  username: string;
  usrData: string;
  hashPassword: string;
}

export const AdminAccountManagementPage: React.FC<PageProps> = ({ username }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'user',
    plugins: ''
  });

  // Get refreshUserData from auth context
  const { refreshUserData, username: currentUsername } = useAuth();
  
  // Get all users and plugins
  const allUsers = useQuery(api.context.getAllUsers);
  const allPlugins = useQuery(api.context.getAllPlugins);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createUserAction = useAction((api.context as any).createUserAction);
  const updateUserAction = useAction(api.context.updateUserAction);
  const deleteUserAction = useAction(api.context.deleteUserAction);
  // const getUserByUsername = useQuery(api.context.getUserByUsername, currentUsername ? { username: currentUsername } : "skip");
  
  // Function to refresh current user's data from database
  const refreshCurrentUserData = async () => {
    if (currentUsername) {
      try {
        // Find the updated user data from the allUsers list (which should be fresh)
        const updatedUser = allUsers?.find(user => user.username === currentUsername);
        
        if (updatedUser) {
          // Update the stored auth data with fresh user data
          const storedAuth = localStorage.getItem('authData');
          if (storedAuth) {
            const authData = JSON.parse(storedAuth);
            const updatedAuthData = {
              ...authData,
              userData: updatedUser.usrData, // Update with fresh user data
              timestamp: Date.now()
            };
            localStorage.setItem('authData', JSON.stringify(updatedAuthData));
          }
        }
        
        // Trigger a dashboard refresh
        if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).refreshDashboard) {
          (((window as unknown as Record<string, unknown>).refreshDashboard) as () => void)();
        }
        
        // Also call the regular refresh
        refreshUserData();
      } catch (error) {
        console.error('Error refreshing current user data:', error);
      }
    }
  };

  useEffect(() => {
    if (allUsers) {
      setUsers(allUsers);
      setIsLoading(false);
    }
  }, [allUsers]);

  const handleSubmitUser = async () => {
    if (!editingUser && (!formData.username || !formData.password)) {
      alert('Please enter username and password');
      return;
    }

    try {
      const userData = JSON.stringify({
        role: formData.role,
        createdAt: editingUser ? JSON.parse(editingUser.usrData || '{}').createdAt : new Date().toISOString(),
        isActive: true,
        plugins: formData.plugins
      });

      if (editingUser) {
        // Update existing user
        await updateUserAction({
          userId: editingUser._id,
          username: formData.username !== editingUser.username ? formData.username : undefined,
          password: formData.password ? formData.password : undefined,
          usrData: userData
        });
        alert('User updated successfully!');
      } else {
        // Create new user
        await createUserAction({
          username: formData.username,
          password: formData.password,
          usrData: userData
        });
        alert('User created successfully!');
      }

      // Reset form
      setFormData({
        username: '',
        password: '',
        role: 'user',
        plugins: ''
      });
      setShowAddForm(false);
      setEditingUser(null);
      
      // Refresh users list and user data without reloading
      refreshUserData();
      
      // If we're updating the current user, refresh their dashboard data
      if (editingUser && editingUser.username === currentUsername) {
        refreshCurrentUserData();
      }
      
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Error saving user. Please try again.');
    }
  };

  const handleEditUser = (user: User) => {
    try {
      const userData = JSON.parse(user.usrData || '{}');
      setFormData({
        username: user.username,
        password: '',
        role: userData.role || 'user',
        plugins: userData.plugins || ''
      });
      setEditingUser(user);
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUserAction({ userId });
        
        // Refresh users list and user data without reloading
        refreshUserData();
        
        // Show success message
        alert('User deleted successfully!');
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user. Please try again.');
      }
    }
  };


  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '20px', fontFamily: 'JetBrains Mono, monospace' }}>
          ACCOUNT MANAGEMENT
        </h1>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      gap: '20px', 
      height: 'calc(100vh - 40px)', 
      padding: '20px',
      fontFamily: 'JetBrains Mono, monospace',
      overflow: 'hidden',
      backgroundColor: '#ffffff'
    }}>
      {/* Left Panel - User Form */}
      <div style={{ 
        width: 'calc(50% - 10px)', 
        backgroundColor: '#0F2044', 
        borderRadius: '20px', 
        padding: '25px',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        border: editingUser ? '3px solid #e74c3c' : 'none',
        position: 'relative'
      }}>
        {/* Plus Button on Corner */}
        <button
          onClick={() => {
            if (!editingUser && (!formData.username || !formData.password)) {
              alert('Please enter username and password');
              return;
            }
            // Clear editing state for new user
            setEditingUser(null);
          }}
          style={{
            position: 'absolute',
            top: '-18px',
            right: '-18px',
            width: '56px',
            height: '56px',
            backgroundColor: '#e74c3c',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 8px rgba(231, 76, 60, 0.3)',
            transition: 'all 0.2s ease',
            transform: 'translateY(0)',
            zIndex: 10
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 12px rgba(231, 76, 60, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(231, 76, 60, 0.3)';
          }}
        >
          <Image src="/media/plus.svg" alt="Add" width={28} height={28} style={{ filter: 'brightness(0) invert(1)' }} />
        </button>

        {/* Cancel Button when editing */}
        {editingUser && (
          <button
            onClick={() => {
              setFormData({
                username: '',
                password: '',
                role: 'user',
                plugins: ''
              });
              setEditingUser(null);
            }}
            style={{
              position: 'absolute',
              top: '-18px',
              right: '38px',
              width: '80px',
              height: '56px',
              backgroundColor: '#95a5a6',
              border: 'none',
              borderRadius: '28px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 8px rgba(149, 165, 166, 0.3)',
              transition: 'all 0.2s ease',
              transform: 'translateY(0)',
              zIndex: 10
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 12px rgba(149, 165, 166, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(149, 165, 166, 0.3)';
            }}
          >
            <span style={{ color: '#ffffff', fontSize: '12px', fontWeight: 'bold', fontFamily: 'JetBrains Mono, monospace' }}>CANCEL</span>
          </button>
        )}

        {/* User Input Section */}
        <div style={{ marginTop: '10px' }}>
          <input
            type="text"
            placeholder={editingUser ? `Current: ${editingUser.username}` : "username"}
            value={formData.username}
            onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
            style={{
              width: '100%',
              padding: '14px 18px',
              backgroundColor: '#2c3e50',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '14px',
              marginBottom: '12px',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease'
            }}
          />
          <input
            type="password"
            placeholder={editingUser ? "Leave blank to keep current password" : "password"}
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            style={{
              width: '100%',
              padding: '14px 18px',
              backgroundColor: '#2c3e50',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '14px',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease'
            }}
          />
            </div>
            
        {/* Role Selection */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setFormData(prev => ({ ...prev, role: 'admin' }))}
            style={{
              padding: '14px 28px',
              backgroundColor: formData.role === 'admin' ? '#e74c3c' : '#2c3e50',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '14px',
              fontWeight: 'bold',
              boxShadow: formData.role === 'admin' ? '0 4px 8px rgba(231, 76, 60, 0.3)' : '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease'
            }}
          >
            admin
          </button>
          <button
            onClick={() => setFormData(prev => ({ ...prev, role: 'user' }))}
                style={{
              padding: '14px 28px',
              backgroundColor: formData.role === 'user' ? '#e74c3c' : '#2c3e50',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '14px',
              fontWeight: 'bold',
              boxShadow: formData.role === 'user' ? '0 4px 8px rgba(231, 76, 60, 0.3)' : '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease'
            }}
          >
            user
          </button>
            </div>
            
        {/* Plugin Selection Grid */}
      <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', 
          gap: '10px',
          flex: '1',
          overflowY: 'auto',
          paddingRight: '5px',
          alignContent: 'start'
        }}>
          {allPlugins && allPlugins.length > 0 ? (
            allPlugins.map((plugin: { name: string, author: string, version: string, description?: string, iconFileId?: string }, index: number) => {
              const isSelected = formData.plugins.split(',').map(p => p.trim()).includes(plugin.name);
              const isActive = isSelected;
              return (
                <div
                  key={plugin.name}
                  onClick={() => {
                    const currentPlugins = formData.plugins.split(',').map(p => p.trim()).filter(Boolean);
                    let newPlugins;
                    if (isSelected) {
                      newPlugins = currentPlugins.filter(p => p !== plugin.name);
                    } else {
                      newPlugins = [...currentPlugins, plugin.name];
                    }
                    setFormData(prev => ({ ...prev, plugins: newPlugins.join(',') }));
                  }}
                  style={{
                    backgroundColor: '#2c3e50',
                    borderRadius: '10px',
                    padding: '10px',
                    cursor: 'pointer',
                    border: isActive ? '2px solid #27ae60' : '2px solid #e74c3c',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '140px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s ease',
                    transform: 'translateY(0)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '6px' }}>
                    <div style={{ transform: 'scale(0.8)', transformOrigin: 'top left' }}>
                      <PluginIcon plugin={plugin} />
                    </div>
                    <div style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: isActive ? '#27ae60' : '#e74c3c',
                      boxShadow: `0 0 5px ${isActive ? '#27ae60' : '#e74c3c'}`
                    }} title={isActive ? 'Active' : 'Inactive'} />
                  </div>
                  
                  <div style={{
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    marginBottom: '2px',
                    lineHeight: '1.2',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {plugin.name}
                  </div>
                  
                  <div style={{
                    color: '#bdc3c7',
                    fontSize: '9px',
                    marginBottom: '4px',
                    lineHeight: '1.2',
                    flex: '1',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {plugin.description || `${plugin.name} plugin`}
                  </div>
                </div>
              );
            })
          ) : (
            Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: '#2c3e50',
                  borderRadius: '10px',
                  padding: '10px',
                  border: '2px solid #e74c3c',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '140px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ width: '28px', height: '28px', backgroundColor: '#95a5a6', borderRadius: '6px', marginBottom: '8px' }}></div>
                <div style={{ height: '10px', width: '80%', backgroundColor: '#34495e', borderRadius: '2px', marginBottom: '4px' }}></div>
                <div style={{ height: '8px', width: '100%', backgroundColor: '#34495e', borderRadius: '2px', marginBottom: '2px' }}></div>
                <div style={{ height: '8px', width: '60%', backgroundColor: '#34495e', borderRadius: '2px' }}></div>
              </div>
            ))
          )}
        </div>
      
        {/* Update/Create Button */}
          <button
          onClick={handleSubmitUser}
            style={{
            width: '100%',
            padding: '16px',
            backgroundColor: editingUser ? '#e74c3c' : '#27ae60',
            color: '#ffffff',
              border: 'none',
            borderRadius: '14px',
              cursor: 'pointer',
              fontFamily: 'JetBrains Mono, monospace',
            fontSize: '15px',
            fontWeight: 'bold',
            boxShadow: editingUser ? '0 4px 12px rgba(231, 76, 60, 0.3)' : '0 4px 12px rgba(39, 174, 96, 0.3)',
            transition: 'all 0.2s ease',
            transform: 'translateY(0)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            if (editingUser) {
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(231, 76, 60, 0.4)';
            } else {
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(39, 174, 96, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            if (editingUser) {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(231, 76, 60, 0.3)';
            } else {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(39, 174, 96, 0.3)';
            }
          }}
        >
          {editingUser ? 'UPDATE USER' : 'CREATE USER'}
          </button>
        </div>

      {/* Right Panel - User List */}
      <div style={{ 
        width: 'calc(50% - 10px)', 
        backgroundColor: '#0F2044', 
        borderRadius: '20px', 
        padding: '25px',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
            {users.map((user) => {
              const userData = JSON.parse(user.usrData || '{}');
              return (
            <div
              key={user._id}
              style={{
                backgroundColor: '#2c3e50',
                borderRadius: '14px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                minHeight: '56px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease',
                transform: 'translateY(0)'
              }}
            >
                    <span style={{
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 'bold',
                fontFamily: 'JetBrains Mono, monospace'
              }}>
                {user.username}
                    </span>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{
                  backgroundColor: userData.role === 'admin' ? '#e74c3c' : '#27ae60',
                  color: '#ffffff',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  fontFamily: 'JetBrains Mono, monospace',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  {userData.role === 'admin' ? 'ADMIN' : 'USER'}
                          </span>
                
                <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                    onClick={() => handleDeleteUser(user._id)}
                    disabled={user.username === username}
                        style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: user.username === username ? '#95a5a6' : '#ffffff',
                          border: 'none',
                      borderRadius: '10px',
                      cursor: user.username === username ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Image 
                      src="/media/delete.svg" 
                      alt="Delete" 
                      width={16} 
                      height={16} 
                      style={{ 
                        filter: user.username === username ? 'grayscale(100%)' : 'none' 
                      }}
                    />
                      </button>
                  
                      <button
                    onClick={() => handleEditUser(user)}
                        style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: '#ffffff',
                          border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Image src="/media/edit.svg" alt="Edit" width={16} height={16} />
                      </button>
                    </div>
              </div>
            </div>
              );
            })}
      
      {users.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            color: '#95a5a6', 
            padding: '40px',
            fontFamily: 'JetBrains Mono, monospace'
          }}>
            No users found.
        </div>
          )}
        </div>
    </div>
  );
};
