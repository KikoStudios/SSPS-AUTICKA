// Test Plugin Beta - Real-time Integration & Monitoring
class TestPlugin {
  constructor() {
    this.name = "Test Plugin Beta";
    this.version = "1.0.0";
    this.isActive = false;
    this.alphaStatus = null;
    this.sharedData = [];
    this.isMonitoring = false;
    this.messageLog = [];
    this.betaData = {
      counter: 0,
      lastUpdate: null,
      totalOperations: 0
    };
    this.container = null;
    this.monitoringInterval = null;
  }

  // Helper to safely get error message
  getErrorMessage(err) {
    return err?.message || String(err) || 'Unknown error';
  }

  initialize() {
    console.log(`Initializing ${this.name} v${this.version}`);
    this.isActive = true;
    this.loadSharedData();
    this.initializeBetaData();
    this.registerEndpoints();
    return true;
  }

  async registerEndpoints() {
    try {
      const endpoints = [
        "getBetaStatus",
        "syncWithAlpha",
        "testRealtimeUpdate",
        "testAdvancedQuery"
      ];
      await PluginSDK.registerApiEndpoints(endpoints);
      console.log('[Beta] API endpoints registered:', endpoints);
    } catch (err) {
      console.error('[Beta] Failed to register endpoints:', err);
    }
  }

  async initializeBetaData() {
    try {
      const existing = await PluginSDK.getData('beta-state');
      if (existing) {
        this.betaData = existing;
      }
    } catch (err) {
      this.logMessage('⚠️ No previous state found', 'warning');
    }
  }

  async saveBetaData(newData) {
    try {
      await PluginSDK.setData('beta-state', newData);
      this.betaData = newData;
      this.logMessage('✅ Beta state saved', 'success');
    } catch (err) {
      this.logMessage('❌ Failed to save state: ' + this.getErrorMessage(err), 'error');
    }
  }

  async loadSharedData() {
    try {
      console.log('[Beta] Loading shared data from all channels');
      const data = await PluginSDK.getSharedData();
      console.log('[Beta] Shared data channels:', Object.keys(data));
      this.sharedData = Object.entries(data).map(([key, value]) => ({
        key,
        value: JSON.stringify(value).substring(0, 50) + (JSON.stringify(value).length > 50 ? '...' : '')
      }));
      this.logMessage(`✅ Shared data loaded (${Object.keys(data).length} channels)`, 'success');
    } catch (err) {
      console.error('[Beta] Failed to load shared data:', err);
      this.logMessage('❌ Failed to load shared data: ' + this.getErrorMessage(err), 'error');
    }
  }

  async checkAlphaStatus() {
    try {
      console.log('[Beta] Checking for Alpha plugin connection...');
      const data = await PluginSDK.getSharedData();
      console.log('[Beta] Available channels:', Object.keys(data));
      
      if (data['alpha-status']) {
        this.alphaStatus = data['alpha-status'];
        console.log('[Beta] ✅ Alpha plugin CONNECTED:', this.alphaStatus);
        this.logMessage('✅ Alpha detected and monitoring', 'success');
      } else {
        console.log('[Beta] ⚠️ Alpha plugin NOT FOUND in shared data');
        console.log('[Beta] Available data:', data);
        this.alphaStatus = null;
        this.logMessage('⚠️ Alpha plugin not connected', 'warning');
      }
    } catch (err) {
      console.error('[Beta] Error checking Alpha status:', err);
      this.alphaStatus = null;
      this.logMessage('❌ Error checking Alpha connection: ' + this.getErrorMessage(err), 'error');
    }
  }

  logMessage(msg, type = 'info') {
    this.messageLog.push({
      message: msg,
      type,
      timestamp: new Date().toLocaleTimeString()
    });
    if (this.messageLog.length > 50) {
      this.messageLog = this.messageLog.slice(-50);
    }
  }

  toggleMonitoring() {
    this.isMonitoring = !this.isMonitoring;
    
    if (this.isMonitoring) {
      this.logMessage('🔍 Monitoring started', 'info');
      this.monitoringInterval = setInterval(() => {
        this.checkAlphaStatus();
        this.loadSharedData();
      }, 3000);
    } else {
      this.logMessage('⏸️ Monitoring stopped', 'info');
      if (this.monitoringInterval) {
        clearInterval(this.monitoringInterval);
      }
    }
  }

  async incrementCounter() {
    try {
      this.betaData.counter++;
      this.betaData.lastUpdate = new Date().toISOString();
      this.betaData.totalOperations++;
      await this.saveBetaData(this.betaData);
      this.logMessage(`📊 Counter incremented to ${this.betaData.counter}`, 'success');
    } catch (err) {
      this.logMessage('❌ Counter increment failed: ' + this.getErrorMessage(err), 'error');
    }
  }

  async publishStatus() {
    try {
      await PluginSDK.publishSharedData('default', 'beta-status', {
        plugin: 'test-plugin-beta',
        status: 'monitoring',
        counter: this.betaData.counter,
        timestamp: Date.now()
      }, 'public');
      this.logMessage('📡 Status published to shared data', 'success');
    } catch (err) {
      this.logMessage('❌ Publish failed: ' + this.getErrorMessage(err), 'error');
    }
  }

  async testUserProfile() {
    try {
      const profile = await PluginSDK.getCurrentUser();
      if (profile) {
        this.logMessage(`👤 User: ${profile?.username || 'unknown'}`, 'success');
      } else {
        this.logMessage('⚠️ User profile unavailable (no auth context)', 'warning');
      }
    } catch (err) {
      this.logMessage('❌ Profile test failed: ' + this.getErrorMessage(err), 'error');
    }
  }

  async testPermissions() {
    try {
      const isAdmin = await PluginSDK.hasRole('admin');
      this.logMessage(`🔐 Admin check: ${isAdmin}`, 'success');
    } catch (err) {
      this.logMessage('❌ Permission test failed: ' + this.getErrorMessage(err), 'error');
    }
  }

  async testFileOps() {
    try {
      const testContent = `Beta file - ${Date.now()}`;
      const blob = new Blob([testContent], { type: 'text/plain' });
      const file = new File([blob], 'test-beta.txt', { type: 'text/plain' });
      const fileId = await PluginSDK.uploadFile(file);
      this.logMessage(`📁 File uploaded: ${fileId}`, 'success');
    } catch (err) {
      this.logMessage('❌ File operation failed: ' + this.getErrorMessage(err), 'error');
    }
  }

  async testBulkData() {
    try {
      const keys = await PluginSDK.listKeys();
      this.logMessage(`📦 Found ${keys.length} keys in database`, 'success');
    } catch (err) {
      this.logMessage('❌ Bulk data test failed: ' + this.getErrorMessage(err), 'error');
    }
  }

  async resetBeta() {
    try {
      this.betaData = { counter: 0, lastUpdate: null, totalOperations: 0 };
      await this.saveBetaData(this.betaData);
      this.logMessage('🔄 Beta data reset', 'success');
    } catch (err) {
      this.logMessage('❌ Reset failed: ' + this.getErrorMessage(err), 'error');
    }
  }

  createUI(container) {
    this.container = container;
    this.render();
  }

  render() {
    if (!this.container) return;

    const alphaEnabled = this.alphaStatus !== null;
    
    this.container.innerHTML = `
      <div class="p-6 space-y-6 bg-slate-950">
        <div class="space-y-2">
          <h1 class="text-3xl font-bold text-white">📊 Test Plugin Beta</h1>
          <p class="text-gray-400">Real-time integration and monitoring plugin</p>
        </div>

        <div class="bg-purple-500/10 border border-purple-500/50 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-bold text-white">Integration Status</h2>
              <p class="text-sm text-gray-400 mt-1">${alphaEnabled ? '✅ Alpha Connected' : '❌ Alpha Not Detected'}</p>
            </div>
            <div>
              <label class="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  ${this.isMonitoring ? 'checked' : ''}
                  onchange="window.TestPluginInstance.toggleMonitoring(); window.TestPluginInstance.render();"
                  class="w-4 h-4"
                />
                <span class="text-white">Enable Monitoring</span>
              </label>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-4">
          <div class="bg-slate-900 rounded-lg border border-slate-700 p-4 text-center">
            <div class="text-2xl font-bold text-white">${this.betaData.counter}</div>
            <div class="text-xs text-gray-400 mt-2">Counter Value</div>
          </div>
          <div class="bg-slate-900 rounded-lg border border-slate-700 p-4 text-center">
            <div class="text-2xl font-bold text-white">${this.betaData.totalOperations}</div>
            <div class="text-xs text-gray-400 mt-2">Total Operations</div>
          </div>
          <div class="bg-slate-900 rounded-lg border border-slate-700 p-4 text-center">
            <div class="text-sm text-white">${this.betaData.lastUpdate ? new Date(this.betaData.lastUpdate).toLocaleTimeString() : 'Never'}</div>
            <div class="text-xs text-gray-400 mt-2">Last Update</div>
          </div>
        </div>

        <div class="bg-slate-900 rounded-lg border border-slate-700 p-4">
          <h2 class="text-xl font-bold text-white mb-4">Control Panel</h2>
          <div class="grid grid-cols-2 gap-2">
            <button onclick="window.TestPluginInstance.incrementCounter(); window.TestPluginInstance.render();" class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm">Increment Counter</button>
            <button onclick="window.TestPluginInstance.publishStatus(); window.TestPluginInstance.render();" class="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-sm">Publish Status</button>
            <button onclick="window.TestPluginInstance.testUserProfile(); window.TestPluginInstance.render();" class="bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded text-sm">Test User Profile</button>
            <button onclick="window.TestPluginInstance.testPermissions(); window.TestPluginInstance.render();" class="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-3 rounded text-sm">Test Permissions</button>
            <button onclick="window.TestPluginInstance.testFileOps(); window.TestPluginInstance.render();" class="bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-3 rounded text-sm">Test File Ops</button>
            <button onclick="window.TestPluginInstance.testBulkData(); window.TestPluginInstance.render();" class="bg-orange-600 hover:bg-orange-700 text-white py-2 px-3 rounded text-sm">Test Bulk Data</button>
          </div>
          <button onclick="window.TestPluginInstance.resetBeta(); window.TestPluginInstance.render();" class="w-full mt-3 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded text-sm">Reset Beta</button>
        </div>

        <div class="bg-slate-900 rounded-lg border border-slate-700 p-4">
          <h2 class="text-xl font-bold text-white mb-4">Shared Data Registry (${this.sharedData.length})</h2>
          <div class="space-y-2 max-h-48 overflow-y-auto">
            ${this.sharedData.length === 0 ? `
              <p class="text-gray-500 text-sm text-center py-6">No shared data available</p>
            ` : this.sharedData.map(item => `
              <div class="bg-slate-800 p-2 rounded text-xs flex justify-between">
                <span class="text-white">${item.key}</span>
                <span class="text-gray-400">${item.value}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="bg-slate-900 rounded-lg border border-slate-700 p-4">
          <h2 class="text-xl font-bold text-white mb-4">Activity Log (${this.messageLog.length})</h2>
          <div class="space-y-1 max-h-64 overflow-y-auto font-mono text-xs">
            ${this.messageLog.length === 0 ? `
              <p class="text-gray-500 text-center py-4">No activity yet</p>
            ` : this.messageLog.map(log => {
              const color = log.type === 'success' ? 'text-green-400' : log.type === 'error' ? 'text-red-400' : log.type === 'warning' ? 'text-yellow-400' : 'text-gray-400';
              return `
                <div class="flex gap-2 ${color}">
                  <span class="text-gray-600">[${log.timestamp}]</span>
                  <span>${log.message}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
    
    window.TestPluginInstance = this;
  }

  // Called by background plugin manager every 3 seconds
  onUpdate(data) {
    console.log('[Beta] onUpdate called with:', data);
    
    // Auto-check for Alpha plugin connection
    if (data.activePlugins && data.activePlugins.includes('test-plugin-alpha')) {
      console.log('[Beta] Alpha is in active plugins list');
      this.checkAlphaStatus();
    } else {
      console.log('[Beta] Alpha NOT in active plugins list:', data.activePlugins);
    }
    
    // Auto-refresh shared data
    this.loadSharedData();
  }

  destroy() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
  }
}
