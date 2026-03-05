// Plugin Publisher Plugin - A plugin that provides plugin publishing functionality
// This is a meta-plugin that replicates the plugin publisher/editor tab functionality

class TestPlugin {
  constructor() {
    this.name = "Plugin Publisher";
    this.version = "1.0.0";
    this.isActive = false;
    this.currentTab = 'upload';
    this.pluginData = null;
    this.uploadedFiles = {
      manifest: null,
      core: null,
      icon: null
    };
    this.allPlugins = [];
    this.currentUser = null;
    this.convexClient = null;
    this.editingPlugin = null;
  }

  // Initialize the plugin
  initialize() {
    console.log(`Initializing ${this.name} v${this.version}`);
    this.isActive = true;
    
    // Initialize Convex client
    this.initializeConvexClient();
    
    return true;
  }

  // Initialize Convex client
  initializeConvexClient() {
    try {
      // Get Convex client from global window object (set by the dashboard)
      if (window.convexClient) {
        this.convexClient = window.convexClient;
        console.log('Convex client initialized for plugin publisher');
        this.loadAllPlugins();
      } else {
        console.warn('Convex client not available, will retry...');
        // Retry after a short delay
        setTimeout(() => {
          this.initializeConvexClient();
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to initialize Convex client:', error);
      // Retry after a short delay
      setTimeout(() => {
        this.initializeConvexClient();
      }, 1000);
    }
  }

  // Load all plugins from database
  async loadAllPlugins() {
    if (!this.convexClient) return;
    
    try {
      const plugins = await this.convexClient.query('context:getAllPlugins');
      this.allPlugins = plugins || [];
      console.log('Loaded plugins:', this.allPlugins);
      
      // Update the manage tab if it's currently visible
      if (this.currentTab === 'manage') {
        await this.updateManageTab();
      }
    } catch (error) {
      console.error('Failed to load plugins:', error);
      this.showStatus('error', 'Failed to load plugins from database');
    }
  }


  // Get plugin information
  getInfo() {
    return {
      name: this.name,
      version: this.version,
      isActive: this.isActive,
      capabilities: ['plugin-publishing', 'file-upload', 'plugin-management'],
      type: 'Plugin Publisher'
    };
  }

  // Create the plugin UI
  createUI(container) {
    // Clear container
    container.innerHTML = '';
    
    // Create the plugin publisher interface
    const pluginPublisherHTML = `
    <div id="plugin-publisher-container" style="
      padding: 20px;
      max-width: 1000px;
      margin: 0 auto;
      font-family: 'JetBrains Mono', monospace;
    ">
      <h1 style="font-size: 32px; margin-bottom: 20px; font-family: 'JetBrains Mono', monospace;">
        🔌 PLUGIN PUBLISHER (AS PLUGIN)
      </h1>
      
      <!-- Tab Navigation -->
      <div id="plugin-publisher-tabs" style="
        display: flex;
        margin-bottom: 30px;
        border-bottom: 2px solid #e9ecef;
      ">
        <button id="upload-tab" style="
          padding: 12px 24px;
          background-color: #007bff;
          color: white;
          border: none;
          border-bottom: 2px solid #007bff;
          cursor: pointer;
          font-family: 'JetBrains Mono', monospace;
          font-size: 16px;
          font-weight: bold;
          margin-right: 10px;
          border-radius: 4px 4px 0 0;
        ">
          📤 Upload Plugin
        </button>
        
        <button id="manage-tab" style="
          padding: 12px 24px;
          background-color: transparent;
          color: #28a745;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          font-family: 'JetBrains Mono', monospace;
          font-size: 16px;
          font-weight: bold;
          border-radius: 4px 4px 0 0;
        ">
          🔧 Manage Plugins
        </button>
      </div>

      <!-- Status Messages -->
      <div id="plugin-status" style="display: none; padding: 15px; border-radius: 4px; margin-bottom: 20px;"></div>

      <!-- Upload Tab Content -->
      <div id="upload-content">
        <div id="upload-area" style="
          padding: 40px;
          background-color: #fff3e0;
          border-radius: 8px;
          margin-bottom: 20px;
          border: 2px dashed #FF9800;
          text-align: center;
        ">
          <h3 style="margin-bottom: 30px; font-family: 'JetBrains Mono', monospace; color: #E65100;">
            📋 Upload Your Plugin Files
          </h3>
          
          <div style="display: flex; flex-direction: column; gap: 20px; align-items: center; max-width: 400px; margin: 0 auto;">
            <!-- Manifest File -->
            <div style="width: 100%;">
              <button id="upload-manifest" style="
                padding: 15px 30px;
                background-color: #007bff;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-family: 'JetBrains Mono', monospace;
                font-size: 16px;
                font-weight: bold;
                width: 100%;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              ">
                📄 Upload Manifest (.json)
              </button>
              <input id="manifest-input" type="file" accept=".json" style="display: none;">
              <div id="manifest-status" style="margin-top: 8px; font-size: 12px; color: #6c757d;">
                No file uploaded
              </div>
            </div>

            <p style="color: #E65100; font-family: 'JetBrains Mono', monospace; font-size: 14px;">
              Upload your manifest.json file first to load plugin information automatically
            </p>
          </div>
        </div>

        <!-- Plugin Info Display -->
        <div id="plugin-info" style="display: none;">
          <div style="display: flex; gap: 20px; margin-bottom: 20px;">
            <!-- Left Side - Plugin Info -->
            <div id="plugin-details" style="
              flex: 1;
              padding: 20px;
              background-color: ${this.editingPlugin ? '#fff3e0' : '#e8f5e8'};
              border-radius: 8px;
              border: 2px solid ${this.editingPlugin ? '#FF9800' : '#4CAF50'};
            ">
            <h3 style="margin-bottom: 15px; font-family: 'JetBrains Mono', monospace; color: ${this.editingPlugin ? '#E65100' : '#2E7D32'};">
              ${this.editingPlugin ? '✏️ Editing Plugin' : '📦 Plugin Information'}
            </h3>
            
            ${this.editingPlugin ? `
              <div style="margin-bottom: 15px; padding: 10px; background-color: #fff3cd; border-radius: 4px; border: 1px solid #ffeaa7;">
                <strong>Note:</strong> You are editing an existing plugin. Upload new files to update specific parts.
              </div>
            ` : ''}
              <div id="plugin-details-content"></div>
              
              ${this.editingPlugin ? `
                <button
                  onclick="window.pluginPublisherInstance.resetForm()"
                  style="
                    margin-top: 15px;
                    padding: 8px 16px;
                    background-color: #6c757d;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 12px;
                  "
                >
                  Cancel Edit
                </button>
              ` : ''}
            </div>

            <!-- Right Side - File Uploads -->
            <div style="
              flex: 1;
              padding: 20px;
              background-color: #fff3e0;
              border-radius: 8px;
              border: 2px solid #FF9800;
            ">
              <h3 style="margin-bottom: 15px; font-family: 'JetBrains Mono', monospace; color: #E65100;">
                📁 File Uploads
              </h3>
              
              <div style="display: flex; flex-direction: column; gap: 15px; align-items: center;">
                <!-- Core File -->
                <div style="width: 100%; text-align: center;">
                  <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <button id="upload-core" style="
                      padding: 12px 24px;
                      background-color: #007bff;
                      color: white;
                      border: none;
                      border-radius: 6px;
                      cursor: pointer;
                      font-family: 'JetBrains Mono', monospace;
                      font-size: 14px;
                      font-weight: bold;
                      flex: 1;
                      max-width: 300px;
                    ">
                      ⚙️ Upload Core (.js)
                    </button>
                    <button id="remove-core" style="display: none; padding: 8px; background-color: #dc3545; color: white; border: none; border-radius: 50%; cursor: pointer; font-size: 16px; font-weight: bold; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
                      ×
                    </button>
                  </div>
                  <input id="core-input" type="file" accept=".js" style="display: none;">
                  <div id="core-status" style="margin-top: 8px; font-size: 12px; color: #6c757d;">
                    No file uploaded
                  </div>
                </div>

                <!-- Icon File -->
                <div style="width: 100%; text-align: center;">
                  <div style="margin-bottom: 10px;">
                    <label style="display: flex; align-items: center; justify-content: center; font-weight: bold; color: #E65100; font-family: 'JetBrains Mono', monospace;">
                      <input id="include-icon" type="checkbox" style="margin-right: 8px;">
                      Include Icon File
                    </label>
                  </div>
                  
                  <div id="icon-upload-section" style="display: none;">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                      <button id="upload-icon" style="
                        padding: 12px 24px;
                        background-color: #007bff;
                        color: white;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 14px;
                        font-weight: bold;
                        flex: 1;
                        max-width: 300px;
                      ">
                        🎨 Upload Icon (.svg)
                      </button>
                      <button id="remove-icon" style="display: none; padding: 8px; background-color: #dc3545; color: white; border: none; border-radius: 50%; cursor: pointer; font-size: 16px; font-weight: bold; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
                        ×
                      </button>
                    </div>
                    <input id="icon-input" type="file" accept=".svg" style="display: none;">
                    <div id="icon-status" style="margin-top: 8px; font-size: 12px; color: #6c757d;">
                      No file uploaded
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Upload Button -->
        <button id="upload-plugin-btn" disabled style="
          padding: 15px 30px;
          background-color: #6c757d;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: not-allowed;
          font-family: 'JetBrains Mono', monospace;
          font-size: 16px;
          width: 100%;
        ">
          Upload Manifest First
        </button>
      </div>

      <!-- Manage Tab Content -->
      <div id="manage-content" style="display: none;">
        <h3 style="margin-bottom: 20px; font-family: 'JetBrains Mono', monospace; color: #2E7D32;">
          🔧 Plugin Management
        </h3>
        
        <div id="plugins-list">
          <div style="
            padding: 40px;
            text-align: center;
            background-color: #f8f9fa;
            border-radius: 8px;
            border: 2px dashed #dee2e6;
            color: #6c757d;
          ">
            <h4 style="margin-bottom: 10px; font-family: 'JetBrains Mono', monospace;">
              📦 Loading Plugins...
            </h4>
            <p>Please wait while we load the plugins from the database.</p>
          </div>
        </div>
      </div>
    </div>
  `;

    // Add the HTML to the container
    container.innerHTML = pluginPublisherHTML;

    // Store instance globally for onclick handlers
    window.pluginPublisherInstance = this;

    // Initialize event listeners
    this.initializeEventListeners();
  }

  // Tab switching functionality
  async switchTab(tab) {
    this.currentTab = tab;
    
    // Update tab buttons
    const uploadTab = document.getElementById('upload-tab');
    const manageTab = document.getElementById('manage-tab');
    const uploadContent = document.getElementById('upload-content');
    const manageContent = document.getElementById('manage-content');
    
    if (tab === 'upload') {
      uploadTab.style.backgroundColor = '#007bff';
      uploadTab.style.color = 'white';
      uploadTab.style.borderBottom = '2px solid #007bff';
      manageTab.style.backgroundColor = 'transparent';
      manageTab.style.color = '#28a745';
      manageTab.style.borderBottom = '2px solid transparent';
      uploadContent.style.display = 'block';
      manageContent.style.display = 'none';
    } else {
      manageTab.style.backgroundColor = '#28a745';
      manageTab.style.color = 'white';
      manageTab.style.borderBottom = '2px solid #28a745';
      uploadTab.style.backgroundColor = 'transparent';
      uploadTab.style.color = '#007bff';
      uploadTab.style.borderBottom = '2px solid transparent';
      uploadContent.style.display = 'none';
      manageContent.style.display = 'block';
      
      // Update manage tab content when switching to it
      await this.updateManageTab();
    }
  }

  // Show status message
  showStatus(type, message) {
    const statusDiv = document.getElementById('plugin-status');
    statusDiv.style.display = 'block';
    statusDiv.style.backgroundColor = type === 'success' ? '#d4edda' : 
                                     type === 'error' ? '#f8d7da' : '#d1ecf1';
    statusDiv.style.color = type === 'success' ? '#155724' : 
                           type === 'error' ? '#721c24' : '#0c5460';
    statusDiv.style.border = `1px solid ${type === 'success' ? '#c3e6cb' : 
                                        type === 'error' ? '#f5c6cb' : '#bee5eb'}`;
    statusDiv.textContent = message;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 5000);
  }

  // File validation
  validateFileContent(file, type) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const content = reader.result;
          
          switch (type) {
            case 'manifest':
              const manifest = JSON.parse(content);
              if (!manifest.name || !manifest.version || !manifest.author) {
                resolve({ isValid: false, error: 'Manifest must contain name, version, and author fields' });
                return;
              }
              resolve({ isValid: true, data: manifest });
              break;
              
            case 'core':
              if (!content.includes('function') && !content.includes('const') && !content.includes('let') && !content.includes('var') && !content.includes('class') && !content.includes('export')) {
                resolve({ isValid: false, error: 'Core file must contain valid JavaScript code' });
                return;
              }
              resolve({ isValid: true });
              break;
              
            case 'icon':
              if (!content.includes('<svg') || !content.includes('</svg>')) {
                resolve({ isValid: false, error: 'Icon file must be valid SVG format' });
                return;
              }
              resolve({ isValid: true });
              break;
              
            default:
              resolve({ isValid: false, error: 'Unknown file type' });
          }
        } catch (error) {
          resolve({ isValid: false, error: `Invalid file format: ${error.message}` });
        }
      };
      reader.readAsText(file);
    });
  }

  // Handle file upload
  async handleFileUpload(file, type) {
    const validation = await this.validateFileContent(file, type);
    if (!validation.isValid) {
      this.showStatus('error', validation.error);
      return;
    }

    // Convert to base64
    const base64 = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        const base64Content = result.split(',')[1];
        resolve(base64Content);
      };
      reader.readAsDataURL(file);
    });

    this.uploadedFiles[type] = { file, base64, isValid: true };

    // Update UI
    this.updateFileStatus(type, 'valid', 'File is valid');

    // If manifest, extract plugin data
    if (type === 'manifest' && validation.data) {
      this.pluginData = {
        name: validation.data.name,
        author: validation.data.author,
        version: validation.data.version,
        description: validation.data.description || ''
      };
      
      this.showPluginInfo();
      this.showStatus('success', `Manifest loaded successfully! Plugin: ${this.pluginData.name} v${this.pluginData.version}`);
    } else {
      this.showStatus('success', `${type.charAt(0).toUpperCase() + type.slice(1)} file uploaded successfully`);
    }

    this.updateUploadButton();
  }

  // Update file status display
  updateFileStatus(type, status, message) {
    const statusElement = document.getElementById(`${type}-status`);
    statusElement.textContent = message;
    statusElement.style.color = status === 'valid' ? '#28a745' : 
                               status === 'invalid' ? '#dc3545' : '#6c757d';
  }

  // Show plugin information
  showPluginInfo() {
    if (!this.pluginData) return;

    const pluginDetails = document.getElementById('plugin-details-content');
    pluginDetails.innerHTML = `
      <div style="display: grid; gap: 15px;">
        <div>
          <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #2E7D32;">Plugin Name:</label>
          <div style="padding: 8px; background-color: #f1f8e9; border: 1px solid #4CAF50; border-radius: 4px; font-family: 'JetBrains Mono', monospace; color: #1B5E20;">
            ${this.pluginData.name}
          </div>
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #2E7D32;">Author:</label>
          <div style="padding: 8px; background-color: #f1f8e9; border: 1px solid #4CAF50; border-radius: 4px; font-family: 'JetBrains Mono', monospace; color: #1B5E20;">
            ${this.pluginData.author}
          </div>
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #2E7D32;">Version:</label>
          <div style="padding: 8px; background-color: #f1f8e9; border: 1px solid #4CAF50; border-radius: 4px; font-family: 'JetBrains Mono', monospace; color: #1B5E20;">
            ${this.pluginData.version}
          </div>
        </div>
        
        ${this.pluginData.description ? `
          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #2E7D32;">Description:</label>
            <div style="padding: 8px; background-color: #f1f8e9; border: 1px solid #4CAF50; border-radius: 4px; font-family: 'JetBrains Mono', monospace; color: #1B5E20; min-height: 60px;">
              ${this.pluginData.description}
            </div>
          </div>
        ` : ''}
      </div>
    `;

    document.getElementById('plugin-info').style.display = 'block';
  }

  // Update upload button state
  updateUploadButton() {
    const uploadBtn = document.getElementById('upload-plugin-btn');
    
    // For editing, only need at least one file uploaded
    if (this.editingPlugin) {
      const hasAnyFile = this.uploadedFiles.manifest || this.uploadedFiles.core || this.uploadedFiles.icon;
      if (hasAnyFile) {
        uploadBtn.disabled = false;
        uploadBtn.style.backgroundColor = '#28a745';
        uploadBtn.style.cursor = 'pointer';
        uploadBtn.textContent = 'Update Plugin';
      } else {
        uploadBtn.disabled = true;
        uploadBtn.style.backgroundColor = '#6c757d';
        uploadBtn.style.cursor = 'not-allowed';
        uploadBtn.textContent = 'Upload Files to Update';
      }
    } else {
      // For new plugins, need manifest and core files
      const canUpload = this.pluginData && this.uploadedFiles.manifest && this.uploadedFiles.core && 
                       (!document.getElementById('include-icon').checked || this.uploadedFiles.icon);

      if (canUpload) {
        uploadBtn.disabled = false;
        uploadBtn.style.backgroundColor = '#28a745';
        uploadBtn.style.cursor = 'pointer';
        uploadBtn.textContent = 'Upload Plugin';
      } else {
        uploadBtn.disabled = true;
        uploadBtn.style.backgroundColor = '#6c757d';
        uploadBtn.style.cursor = 'not-allowed';
        uploadBtn.textContent = !this.pluginData ? 'Upload Manifest First' : 'Upload Required Files';
      }
    }
  }

  // Handle file removal
  handleFileRemove(type) {
    this.uploadedFiles[type] = null;
    
    // Clear input
    const input = document.getElementById(`${type}-input`);
    input.value = '';
    
    this.updateFileStatus(type, 'empty', 'No file uploaded');
    
    if (type === 'manifest') {
      this.pluginData = null;
      document.getElementById('plugin-info').style.display = 'none';
    }
    
    this.updateUploadButton();
    this.showStatus('info', `${type.charAt(0).toUpperCase() + type.slice(1)} file removed`);
  }

  // Handle plugin upload
  async handleUpload() {
    if (!this.convexClient) {
      this.showStatus('error', 'Database connection not available');
      return;
    }

    this.showStatus('info', 'Uploading plugin...');
    
    try {
      // Prepare upload data - only include files that were actually uploaded
      const uploadData = {
        pluginName: this.pluginData.name,
        author: this.pluginData.author,
        version: this.pluginData.version,
        description: this.pluginData.description
      };

      // Only include files that were uploaded
      if (this.uploadedFiles.manifest) {
        uploadData.manifestFile = this.uploadedFiles.manifest.base64;
      }
      if (this.uploadedFiles.core) {
        uploadData.coreFile = this.uploadedFiles.core.base64;
      }
      if (this.uploadedFiles.icon) {
        uploadData.iconFile = this.uploadedFiles.icon.base64;
      }

      // Upload the plugin to the database
      const result = await this.convexClient.action('context:uploadPluginAction', uploadData);

      if (result.success) {
        const action = this.editingPlugin ? 'updated' : 'uploaded';
        this.showStatus('success', `Plugin "${this.pluginData.name}" ${action} successfully!`);
        
        // Reload plugins list
        await this.loadAllPlugins();
        
        // Reset form
        this.resetForm();
      } else {
        this.showStatus('error', 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      this.showStatus('error', `Upload failed: ${error.message}`);
    }
  }

  // Handle plugin editing
  handleEditPlugin(plugin) {
    this.editingPlugin = plugin;
    this.pluginData = {
      name: plugin.name,
      author: plugin.author,
      version: plugin.version,
      description: plugin.description || ''
    };
    
    // Switch to upload tab
    this.switchTab('upload');
    
    // Show editing message
    this.showStatus('info', `Editing plugin "${plugin.name}". Upload new files to update specific parts.`);
    
    // Show plugin info
    this.showPluginInfo();
  }

  // Reset the upload form
  resetForm() {
    this.pluginData = null;
    this.editingPlugin = null;
    this.uploadedFiles = { manifest: null, core: null, icon: null };
    document.getElementById('plugin-info').style.display = 'none';
    document.getElementById('include-icon').checked = false;
    document.getElementById('icon-upload-section').style.display = 'none';
    
    // Clear inputs
    ['manifest', 'core', 'icon'].forEach(type => {
      document.getElementById(`${type}-input`).value = '';
      this.updateFileStatus(type, 'empty', 'No file uploaded');
    });
    
    this.updateUploadButton();
  }

  // Handle plugin deletion
  async handleDeletePlugin(pluginName) {
    if (!this.convexClient) {
      this.showStatus('error', 'Database connection not available');
      return;
    }

    if (!confirm(`Are you sure you want to delete the plugin "${pluginName}"? This will remove it from all users and cannot be undone.`)) {
      return;
    }

    try {
      this.showStatus('info', `Deleting plugin "${pluginName}" and cleaning up user data...`);
      
      const result = await this.convexClient.action('context:deletePluginAction', { pluginName });
      
      if (result && typeof result.usersUpdated === 'number') {
        if (result.usersUpdated > 0) {
          this.showStatus('success', `Plugin "${pluginName}" deleted successfully! Removed from ${result.usersUpdated} user(s).`);
        } else {
          this.showStatus('success', `Plugin "${pluginName}" deleted successfully! (No users had this plugin installed)`);
        }
      } else {
        this.showStatus('success', `Plugin "${pluginName}" deleted successfully!`);
      }
      
      // Reload plugins list
      await this.loadAllPlugins();
    } catch (error) {
      console.error('Delete error:', error);
      this.showStatus('error', `Failed to delete plugin: ${error.message}`);
    }
  }


  // Update manage tab with plugins from database
  async updateManageTab() {
    console.log('updateManageTab called, allPlugins:', this.allPlugins);
    const pluginsList = document.getElementById('plugins-list');
    if (!pluginsList) {
      console.error('plugins-list element not found');
      return;
    }

    if (!this.allPlugins || this.allPlugins.length === 0) {
      console.log('No plugins to display');
      pluginsList.innerHTML = `
        <div style="
          padding: 40px;
          text-align: center;
          background-color: #f8f9fa;
          border-radius: 8px;
          border: 2px dashed #dee2e6;
          color: #6c757d;
        ">
          <h4 style="margin-bottom: 10px; font-family: 'JetBrains Mono', monospace;">
            📦 No Plugins Found
          </h4>
          <p>Upload your first plugin using the Upload tab to get started!</p>
        </div>
      `;
      return;
    }

    console.log('All plugins count:', this.allPlugins.length);

    // Load icons for all plugins
    const pluginItems = await Promise.all(this.allPlugins.map(async (plugin) => {
      const pluginIcon = await this.getPluginIcon(plugin);
      
      return `
        <div style="
          padding: 20px;
          background-color: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #e9ecef;
          display: flex;
          justify-content: space-between;
          align-items: center;
        ">
          <div style="flex: 1; display: flex; align-items: center; gap: 15px;">
            <div style="font-size: 24px; display: flex; align-items: center; justify-content: center; width: 24px; height: 24px;">${pluginIcon}</div>
            <div style="flex: 1;">
              <h4 style="
                margin: 0 0 8px 0;
                font-family: 'JetBrains Mono', monospace;
                color: #2E7D32;
                font-size: 18px;
              ">
                🔌 ${plugin.name}
              </h4>
              <div style="font-size: 14px; color: #666; margin-bottom: 8px;">
                <strong>Version:</strong> ${plugin.version} | <strong>Author:</strong> ${plugin.author}
              </div>
              ${plugin.description ? `
                <div style="font-size: 13px; color: #888; margin-bottom: 8px;">
                  ${plugin.description}
                </div>
              ` : ''}
                  <div style="font-size: 12px; color: #999;">
                    <strong>Uploaded:</strong> ${new Date(plugin.uploadDate).toLocaleDateString()} | 
                    <strong>Status:</strong> ${plugin.isActive ? '✅ Active' : '❌ Inactive'}
                  </div>
            </div>
          </div>
          
          <div style="display: flex; gap: 10px; margin-left: 20px;">
                <button
                  onclick="window.pluginPublisherInstance.handleEditPlugin(window.pluginPublisherInstance.allPlugins.find(p => p.name === '${plugin.name}'))"
                  style="
                    padding: 8px 16px;
                    background-color: #007bff;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 12px;
                    font-weight: bold;
                  "
                >
                  ✏️ Edit
                </button>
                
                <button
                  onclick="window.pluginPublisherInstance.handleDeletePlugin('${plugin.name}')"
                  style="
                    padding: 8px 16px;
                    background-color: #dc3545;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 12px;
                    font-weight: bold;
                  "
                >
                  🗑️ Delete
                </button>
          </div>
        </div>
      `;
    }));

    console.log('Rendering plugin items:', pluginItems.length);
    pluginsList.innerHTML = `
      <div style="display: grid; gap: 15px;">
        ${pluginItems.join('')}
      </div>
    `;
    console.log('Manage tab updated successfully');
  }

  // Get plugin icon (SVG if available, otherwise emoji)
  async getPluginIcon(plugin) {
    if (plugin.iconFileId && this.convexClient) {
      try {
        const iconUrl = await this.convexClient.query('context:getPluginIconUrl', { 
          pluginName: plugin.name 
        });
        
        if (iconUrl) {
          // Return an img element for the SVG icon
          return `<img src="${iconUrl}" alt="${plugin.name} icon" style="width: 24px; height: 24px; object-fit: contain;" />`;
        }
      } catch (error) {
        console.error('Failed to load plugin icon:', error);
      }
    }
    
    // Fallback to emoji based on plugin name
    const emojiMap = {
      'test': '🧪',
      'plugin': '🔌',
      'publisher': '📤',
      'counter': '🔢',
      'editor': '✏️',
      'manager': '⚙️'
    };
    
    const lowerName = plugin.name.toLowerCase();
    for (const [keyword, emoji] of Object.entries(emojiMap)) {
      if (lowerName.includes(keyword)) {
        return emoji;
      }
    }
    
    return '🔌'; // Default plugin icon
  }

  // Initialize event listeners
  initializeEventListeners() {
    // Event listeners
    document.getElementById('upload-tab').addEventListener('click', async () => await this.switchTab('upload'));
    document.getElementById('manage-tab').addEventListener('click', async () => await this.switchTab('manage'));

    // File upload handlers
    document.getElementById('upload-manifest').addEventListener('click', () => {
      document.getElementById('manifest-input').click();
    });

    document.getElementById('manifest-input').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) this.handleFileUpload(file, 'manifest');
    });

    document.getElementById('upload-core').addEventListener('click', () => {
      document.getElementById('core-input').click();
    });

    document.getElementById('core-input').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        this.handleFileUpload(file, 'core');
        document.getElementById('remove-core').style.display = 'flex';
        document.getElementById('upload-core').textContent = '⚙️ Core Uploaded ✓';
        document.getElementById('upload-core').style.backgroundColor = '#28a745';
      }
    });

    document.getElementById('remove-core').addEventListener('click', () => {
      this.handleFileRemove('core');
      document.getElementById('remove-core').style.display = 'none';
      document.getElementById('upload-core').textContent = '⚙️ Upload Core (.js)';
      document.getElementById('upload-core').style.backgroundColor = '#007bff';
    });

    // Icon checkbox handler
    document.getElementById('include-icon').addEventListener('change', (e) => {
      const iconSection = document.getElementById('icon-upload-section');
      if (e.target.checked) {
        iconSection.style.display = 'block';
      } else {
        iconSection.style.display = 'none';
        if (this.uploadedFiles.icon) {
          this.handleFileRemove('icon');
          document.getElementById('remove-icon').style.display = 'none';
          document.getElementById('upload-icon').textContent = '🎨 Upload Icon (.svg)';
          document.getElementById('upload-icon').style.backgroundColor = '#007bff';
        }
      }
      this.updateUploadButton();
    });

    document.getElementById('upload-icon').addEventListener('click', () => {
      document.getElementById('icon-input').click();
    });

    document.getElementById('icon-input').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        this.handleFileUpload(file, 'icon');
        document.getElementById('remove-icon').style.display = 'flex';
        document.getElementById('upload-icon').textContent = '🎨 Icon Uploaded ✓';
        document.getElementById('upload-icon').style.backgroundColor = '#28a745';
      }
    });

    document.getElementById('remove-icon').addEventListener('click', () => {
      this.handleFileRemove('icon');
      document.getElementById('remove-icon').style.display = 'none';
      document.getElementById('upload-icon').textContent = '🎨 Upload Icon (.svg)';
      document.getElementById('upload-icon').style.backgroundColor = '#007bff';
    });

    // Upload button handler
    document.getElementById('upload-plugin-btn').addEventListener('click', () => this.handleUpload());

    console.log('🔌 Plugin Publisher Plugin ready!');
  }

  // Cleanup function
  destroy() {
    console.log(`Destroying ${this.name}`);
    this.isActive = false;
    this.pluginData = null;
    this.uploadedFiles = { manifest: null, core: null, icon: null };
  }
}
