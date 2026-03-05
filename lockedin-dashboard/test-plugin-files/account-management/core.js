class TestPlugin {
    constructor() {
      this.name = "Account Management";
      this.version = "1.0.0";
      this.isActive = false;
      this.users = [];
      this.allPlugins = [];
      this.convexClient = null;
      this.currentUser = null;
      this.showAddForm = false;
      this.editingUser = null;
      this.formData = {
        username: '',
        password: '',
        role: 'user',
        plugins: ''
      };
    }
  
    initialize() {
      console.log(`Initializing ${this.name} v${this.version}`);
      this.isActive = true;
      this.initializeConvexClient();
      return true;
    }
  
    async initializeConvexClient() {
      try {
        // Wait for Convex client to be available
        let retries = 0;
        while (!window.convexClient && retries < 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          retries++;
        }
        
        if (window.convexClient) {
          this.convexClient = window.convexClient;
          console.log('Convex client initialized for account management');
          await this.loadData();
        } else {
          console.error('Convex client not available');
        }
      } catch (error) {
        console.error('Failed to initialize Convex client:', error);
      }
    }
  
    async loadData() {
      try {
        // Load users and plugins
        const [usersResult, pluginsResult] = await Promise.all([
          this.convexClient.query('context:getAllUsers'),
          this.convexClient.query('context:getAllPlugins')
        ]);
        
        this.users = usersResult || [];
        this.allPlugins = pluginsResult || [];
        
        console.log('Loaded users:', this.users.length);
        console.log('Loaded plugins:', this.allPlugins.length);
        
        // Get current user info with real-time updates
        if (window.dashboardContext && window.dashboardContext.userData) {
          this.currentUser = window.dashboardContext.userData;
        }
        
        // Also try to get from real-time data if available
        if (window.realtimeUserData) {
          this.currentUser = window.realtimeUserData;
        }
        
        // Refresh the UI after data is loaded
        this.refreshContent();
        
      } catch (error) {
        console.error('Failed to load data:', error);
        this.showStatus('error', 'Failed to load data from database');
      }
    }
  
    createUI(container) {
      container.innerHTML = `
        <div style="padding: 20px; font-family: 'JetBrains Mono', monospace;">
          <h1 style="font-size: 32px; margin-bottom: 20px; color: #333;">
            ACCOUNT MANAGEMENT
          </h1>
          
          <div id="account-management-content">
            ${this.renderContent()}
          </div>
          
          <div id="status-message" style="margin-top: 20px;"></div>
        </div>
      `;
      
      this.attachEventListeners();
    }
  
    renderContent() {
      if (this.users.length === 0 || this.allPlugins.length === 0) {
        return `
          <div style="text-align: center; padding: 40px; color: #666;">
            <p>Loading account management data...</p>
          </div>
        `;
      }
  
      return `
        ${this.renderAddForm()}
        ${this.renderAddButton()}
        ${this.renderUsersTable()}
      `;
    }
  
    renderAddForm() {
      if (!this.showAddForm) return '';
  
      return `
        <div style="margin-bottom: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 8px; border: 1px solid #dee2e6;">
          <h3 style="margin-bottom: 20px; color: #333;">
            ${this.editingUser ? 'Edit User' : 'Add New User'}
          </h3>
          
          <form id="user-form">
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">
                Username:
              </label>
              <input
                type="text"
                id="username-input"
                value="${this.formData.username}"
                required
                style="
                  width: 100%;
                  padding: 8px;
                  border: 1px solid #ccc;
                  border-radius: 4px;
                  font-family: 'JetBrains Mono', monospace;
                  box-sizing: border-box;
                "
              />
            </div>
            
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">
                Password:
              </label>
              <input
                type="password"
                id="password-input"
                value="${this.formData.password}"
                ${this.editingUser ? '' : 'required'}
                style="
                  width: 100%;
                  padding: 8px;
                  border: 1px solid #ccc;
                  border-radius: 4px;
                  font-family: 'JetBrains Mono', monospace;
                  box-sizing: border-box;
                "
              />
            </div>
            
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">
                Role:
              </label>
              <select
                id="role-select"
                style="
                  width: 100%;
                  padding: 8px;
                  border: 1px solid #ccc;
                  border-radius: 4px;
                  font-family: 'JetBrains Mono', monospace;
                  box-sizing: border-box;
                "
              >
                <option value="user" ${this.formData.role === 'user' ? 'selected' : ''}>User</option>
                <option value="dev" ${this.formData.role === 'dev' ? 'selected' : ''}>Dev</option>
                <option value="admin" ${this.formData.role === 'admin' ? 'selected' : ''}>Admin</option>
              </select>
            </div>
            
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">
                Assigned Plugins:
              </label>
              <div style="
                border: 1px solid #ccc;
                border-radius: 4px;
                padding: 8px;
                min-height: 100px;
                background-color: #f9f9f9;
                max-height: 200px;
                overflow-y: auto;
              ">
                ${this.renderPluginCheckboxes()}
              </div>
              <div style="margin-top: 5px; font-size: 12px; color: #666;">
                Selected: ${this.formData.plugins || 'None'}
              </div>
            </div>
            
            <div style="display: flex; gap: 10px;">
              <button
                type="submit"
                style="
                  padding: 10px 20px;
                  background-color: #007bff;
                  color: white;
                  border: none;
                  border-radius: 4px;
                  cursor: pointer;
                  font-family: 'JetBrains Mono', monospace;
                  font-weight: bold;
                "
              >
                ${this.editingUser ? 'Update User' : 'Add User'}
              </button>
              <button
                type="button"
                onclick="window.accountManagementInstance.resetForm()"
                style="
                  padding: 10px 20px;
                  background-color: #6c757d;
                  color: white;
                  border: none;
                  border-radius: 4px;
                  cursor: pointer;
                  font-family: 'JetBrains Mono', monospace;
                  font-weight: bold;
                "
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      `;
    }
  
    renderPluginCheckboxes() {
      if (!this.allPlugins || this.allPlugins.length === 0) {
        return `
          <div style="text-align: center; color: #999; padding: 20px;">
            No plugins available. Upload plugins first in the Plugin Publisher.
          </div>
        `;
      }
  
      const selectedPlugins = this.formData.plugins.split(',').map(p => p.trim()).filter(Boolean);
      
      return this.allPlugins.map(plugin => {
        const isSelected = selectedPlugins.includes(plugin.name);
        return `
          <div style="margin-bottom: 8px;">
            <label style="
              display: flex;
              align-items: center;
              cursor: pointer;
              padding: 4px;
              border-radius: 4px;
              background-color: ${isSelected ? '#e3f2fd' : 'transparent'};
              transition: background-color 0.2s;
            ">
              <input
                type="checkbox"
                data-plugin="${plugin.name}"
                ${isSelected ? 'checked' : ''}
                style="margin-right: 8px;"
              />
              <div>
                <div style="font-weight: bold; font-size: 14px;">
                    ${plugin.name}
                  ${plugin.mode === 'development' ? ' <span style="color: #ff9800; font-size: 10px;">[DEV]</span>' : ''}
                </div>
                <div style="font-size: 12px; color: #666;">
                  v${plugin.version} by ${plugin.author}
                  ${plugin.mode === 'development' ? ' (Development)' : ' (Production)'}
                </div>
                ${plugin.description ? `
                  <div style="font-size: 11px; color: #888; margin-top: 2px;">
                    ${plugin.description}
                  </div>
                ` : ''}
              </div>
            </label>
          </div>
        `;
      }).join('');
    }
  
    renderAddButton() {
      if (this.showAddForm) return '';
  
      return `
        <div style="margin-bottom: 20px;">
          <button
            onclick="window.accountManagementInstance.showAddForm = true; window.accountManagementInstance.refreshContent();"
            style="
              padding: 12px 24px;
              background-color: #28a745;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-family: 'JetBrains Mono', monospace;
              font-size: 16px;
              font-weight: bold;
            "
          >
            + Add New User
          </button>
        </div>
      `;
    }
  
    renderUsersTable() {
      if (this.users.length === 0) {
        return `
          <div style="text-align: center; padding: 40px; color: #6c757d;">
            <p>No users found.</p>
          </div>
        `;
      }
  
      return `
        <div style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="padding: 15px; text-align: left; border-bottom: 1px solid #dee2e6; font-weight: bold;">Username</th>
                <th style="padding: 15px; text-align: left; border-bottom: 1px solid #dee2e6; font-weight: bold;">Role</th>
                <th style="padding: 15px; text-align: left; border-bottom: 1px solid #dee2e6; font-weight: bold;">Plugins</th>
                <th style="padding: 15px; text-align: left; border-bottom: 1px solid #dee2e6; font-weight: bold;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${this.users.map(user => {
                let userData = {};
                try {
                  userData = JSON.parse(user.usrData || '{}');
                } catch (e) {
                  console.error('Error parsing user data:', e);
                }
                
                const isCurrentUser = this.currentUser && user.username === this.currentUser.username;
                
                return `
                  <tr style="border-bottom: 1px solid #dee2e6;">
                    <td style="padding: 15px;">
                      <strong>${user.username}</strong>
                      ${isCurrentUser ? ' <span style="color: #28a745;">(You)</span>' : ''}
                    </td>
                    <td style="padding: 15px;">
                      <span style="
                        padding: 4px 8px;
                        border-radius: 4px;
                        background-color: ${userData.role === 'admin' ? '#dc3545' : '#007bff'};
                        color: white;
                        font-size: 12px;
                        font-weight: bold;
                      ">
                        ${userData.role || 'user'}
                      </span>
                    </td>
                    <td style="padding: 15px;">
                      <div style="font-size: 12px; color: #666;">
                        ${userData.plugins ? 
                          userData.plugins.split(',').map((plugin, index) => {
                            const pluginObj = this.allPlugins.find(p => p.name === plugin.trim());
                            const isDev = pluginObj && pluginObj.mode === 'development';
                            return `
                              <span key="${index}" style="
                                display: inline-block;
                                padding: 2px 6px;
                                margin: 2px;
                                background-color: ${isDev ? '#fff3cd' : '#e9ecef'};
                                border: 1px solid ${isDev ? '#ffc107' : 'transparent'};
                                border-radius: 3px;
                                font-size: 11px;
                                color: ${isDev ? '#856404' : '#666'};
                              ">
                                ${plugin.trim()}${isDev ? ' [DEV]' : ''}
                              </span>
                            `;
                          }).join('') :
                          '<span style="color: #999; font-style: italic;">No plugins assigned</span>'
                        }
                      </div>
                    </td>
                    <td style="padding: 15px;">
                      <div style="display: flex; gap: 8px;">
                        <button
                          onclick="window.accountManagementInstance.editUser('${user._id}')"
                          style="
                            padding: 6px 12px;
                            background-color: #ffc107;
                            color: #000;
                            border: none;
                            border-radius: 4px;
                            cursor: pointer;
                            font-family: 'JetBrains Mono', monospace;
                            font-size: 12px;
                            font-weight: bold;
                          "
                        >
                          Edit
                        </button>
                        <button
                          onclick="window.accountManagementInstance.deleteUser('${user._id}', '${user.username}')"
                          ${isCurrentUser ? 'disabled' : ''}
                          style="
                            padding: 6px 12px;
                            background-color: ${isCurrentUser ? '#6c757d' : '#dc3545'};
                            color: white;
                            border: none;
                            border-radius: 4px;
                            cursor: ${isCurrentUser ? 'not-allowed' : 'pointer'};
                            font-family: 'JetBrains Mono', monospace;
                            font-size: 12px;
                            font-weight: bold;
                          "
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
    }
  
    attachEventListeners() {
      // Make this instance globally available
      window.accountManagementInstance = this;
      
      // Form submission
      const form = document.getElementById('user-form');
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          this.handleSubmitUser();
        });
      }
  
      // Plugin checkboxes
      const checkboxes = document.querySelectorAll('input[data-plugin]');
      checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
          const pluginName = e.target.dataset.plugin;
          const currentPlugins = this.formData.plugins.split(',').map(p => p.trim()).filter(Boolean);
          
          let newPlugins;
          if (e.target.checked) {
            newPlugins = [...currentPlugins, pluginName];
          } else {
            newPlugins = currentPlugins.filter(p => p !== pluginName);
          }
          
          this.formData.plugins = newPlugins.join(',');
          this.refreshContent();
        });
      });
  
      // Input fields
      const usernameInput = document.getElementById('username-input');
      const passwordInput = document.getElementById('password-input');
      const roleSelect = document.getElementById('role-select');
  
      if (usernameInput) {
        usernameInput.addEventListener('input', (e) => {
          this.formData.username = e.target.value;
        });
      }
  
      if (passwordInput) {
        passwordInput.addEventListener('input', (e) => {
          this.formData.password = e.target.value;
        });
      }
  
      if (roleSelect) {
        roleSelect.addEventListener('change', (e) => {
          this.formData.role = e.target.value;
        });
      }
    }
  
    async handleSubmitUser() {
      if (!this.convexClient) {
        this.showStatus('error', 'Database connection not available');
        return;
      }
  
      try {
        const userData = JSON.stringify({
          role: this.formData.role,
          createdAt: this.editingUser ? JSON.parse(this.editingUser.usrData || '{}').createdAt : new Date().toISOString(),
          isActive: true,
          plugins: this.formData.plugins
        });
  
        if (this.editingUser) {
          // Update existing user
          await this.convexClient.action('context:updateUserAction', {
            userId: this.editingUser._id,
            username: this.formData.username !== this.editingUser.username ? this.formData.username : undefined,
            password: this.formData.password ? this.formData.password : undefined,
            usrData: userData
          });
          this.showStatus('success', 'User updated successfully!');
        } else {
          // Create new user
          await this.convexClient.action('context:createUserAction', {
            username: this.formData.username,
            password: this.formData.password,
            usrData: userData
          });
          this.showStatus('success', 'User created successfully!');
        }
  
        this.resetForm();
        await this.loadData();
        this.refreshContent();
        
        // Refresh dashboard if available
        if (window.refreshDashboard) {
          window.refreshDashboard();
        }
        
      } catch (error) {
        console.error('Error saving user:', error);
        this.showStatus('error', `Error saving user: ${error.message}`);
      }
    }
  
    editUser(userId) {
      const user = this.users.find(u => u._id === userId);
      if (!user) return;
  
      try {
        const userData = JSON.parse(user.usrData || '{}');
        this.formData = {
          username: user.username,
          password: '',
          role: userData.role || 'user',
          plugins: userData.plugins || ''
        };
        this.editingUser = user;
        this.showAddForm = true;
        this.refreshContent();
      } catch (error) {
        console.error('Error parsing user data:', error);
        this.showStatus('error', 'Error loading user data');
      }
    }
  
    async deleteUser(userId, username) {
      const isCurrentUser = this.currentUser && username === this.currentUser.username;
      
      if (isCurrentUser) {
        this.showStatus('error', 'You cannot delete your own account');
        return;
      }
  
      if (!confirm(`Are you sure you want to delete user "${username}"?`)) {
        return;
      }
  
      if (!this.convexClient) {
        this.showStatus('error', 'Database connection not available');
        return;
      }
  
      try {
        await this.convexClient.action('context:deleteUserAction', { userId });
        this.showStatus('success', 'User deleted successfully!');
        await this.loadData();
        this.refreshContent();
        
        // Refresh dashboard if available
        if (window.refreshDashboard) {
          window.refreshDashboard();
        }
        
      } catch (error) {
        console.error('Error deleting user:', error);
        this.showStatus('error', `Error deleting user: ${error.message}`);
      }
    }
  
    resetForm() {
      this.formData = {
        username: '',
        password: '',
        role: 'user',
        plugins: ''
      };
      this.showAddForm = false;
      this.editingUser = null;
      this.refreshContent();
    }
  
    refreshContent() {
      const contentDiv = document.getElementById('account-management-content');
      if (contentDiv) {
        contentDiv.innerHTML = this.renderContent();
        this.attachEventListeners();
      }
    }
  
    showStatus(type, message) {
      const statusDiv = document.getElementById('status-message');
      if (statusDiv) {
        statusDiv.innerHTML = `
          <div style="
            padding: 10px 15px;
            border-radius: 4px;
            font-family: 'JetBrains Mono', monospace;
            font-weight: bold;
            background-color: ${type === 'success' ? '#d4edda' : '#f8d7da'};
            color: ${type === 'success' ? '#155724' : '#721c24'};
            border: 1px solid ${type === 'success' ? '#c3e6cb' : '#f5c6cb'};
          ">
            ${message}
          </div>
        `;
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
          statusDiv.innerHTML = '';
        }, 5000);
      }
    }
  
    getInfo() {
      return {
        name: this.name,
        version: this.version,
        author: "Plugin System",
        description: "A plugin that provides user account management functionality"
      };
    }
  
    destroy() {
      this.isActive = false;
      console.log(`${this.name} destroyed`);
    }
  }
  
  // Plugin class is ready for instantiation by the plugin loader
  console.log('Account Management Plugin class ready!');