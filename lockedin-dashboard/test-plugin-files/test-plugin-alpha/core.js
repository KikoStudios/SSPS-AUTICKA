// Test Plugin Alpha - Automated Testing Suite
class TestPlugin {
  constructor() {
    this.name = "Test Plugin Alpha";
    this.version = "1.0.0";
    this.isActive = false;
    this.testResults = [];
    this.isRunning = false;
    this.progress = 0;
    this.userInfo = null;
    this.testData = '';
    this.fileId = '';
  }

  // Helper to safely get error message
  getErrorMessage(err) {
    return err?.message || String(err) || 'Unknown error';
  }

  initialize() {
    console.log(`Initializing ${this.name} v${this.version}`);
    this.isActive = true;
    this.loadUserProfile();
    this.registerEndpoints();
    return true;
  }

  async registerEndpoints() {
    try {
      const endpoints = [
        "testWrite",
        "testRead",
        "testDelete",
        "testFileUpload",
        "testRoleCheck",
        "testBulkOperation"
      ];
      await PluginSDK.registerApiEndpoints(endpoints);
      console.log('[Alpha] API endpoints registered:', endpoints);
    } catch (err) {
      console.error('[Alpha] Failed to register endpoints:', err);
    }
  }

  async loadUserProfile() {
    try {
      const profile = await PluginSDK.getCurrentUser();
      this.userInfo = profile;
      if (profile) {
        this.addResult('✅ User Profile Loaded', `Username: ${profile?.username || 'unknown'}`, 'success');
      } else {
        this.addResult('⚠️ User Profile', 'No auth context in background', 'warning');
      }
    } catch (err) {
      this.addResult('❌ User Profile Failed', this.getErrorMessage(err), 'error');
    }
  }

  addResult(title, message, status) {
    this.testResults.push({ title, message, status, timestamp: new Date().toLocaleTimeString() });
  }

  async runAllTests() {
    this.isRunning = true;
    this.testResults = [];
    this.progress = 0;

    const tests = [
      { name: 'Database Write', fn: () => this.testDatabaseWrite() },
      { name: 'Database Read', fn: () => this.testDatabaseRead() },
      { name: 'Database Update', fn: () => this.testDatabaseUpdate() },
      { name: 'Database Delete', fn: () => this.testDatabaseDelete() },
      { name: 'File Upload', fn: () => this.testFileUpload() },
      { name: 'File Download', fn: () => this.testFileDownload() },
      { name: 'API Endpoint', fn: () => this.testAPIEndpoint() },
      { name: 'Role Check', fn: () => this.testRoleCheck() },
      { name: 'Bulk Operations', fn: () => this.testBulkOperations() },
      { name: 'Shared Data Publish', fn: () => this.testSharedDataPublish() }
    ];

    for (let i = 0; i < tests.length; i++) {
      try {
        await tests[i].fn();
      } catch (err) {
        console.error(`Test ${tests[i].name} error:`, err);
      }
      this.progress = ((i + 1) / tests.length) * 100;
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    this.isRunning = false;
    this.addResult('🎉 All Tests Complete', `${tests.length} tests executed`, 'success');
  }

  async testDatabaseWrite() {
    try {
      const testKey = `test_${Date.now()}`;
      const testValue = { data: 'Hello from Alpha', timestamp: Date.now() };
      await PluginSDK.setData(testKey, testValue);
      this.testData = testKey;
      this.addResult('✅ Database Write', `Stored: ${testKey}`, 'success');
    } catch (err) {
      this.addResult('❌ Database Write Failed', this.getErrorMessage(err), 'error');
    }
  }

  async testDatabaseRead() {
    try {
      if (!this.testData) {
        this.addResult('⚠️ Database Read Skipped', 'No test data', 'warning');
        return;
      }
      const value = await PluginSDK.getData(this.testData);
      this.addResult('✅ Database Read', 'Retrieved successfully', 'success');
    } catch (err) {
      this.addResult('❌ Database Read Failed', this.getErrorMessage(err), 'error');
    }
  }

  async testDatabaseUpdate() {
    try {
      if (!this.testData) {
        this.addResult('⚠️ Database Update Skipped', 'No test data', 'warning');
        return;
      }
      const updated = { data: 'Updated from Alpha', timestamp: Date.now() };
      await PluginSDK.setData(this.testData, updated);
      this.addResult('✅ Database Update', 'Updated successfully', 'success');
    } catch (err) {
      this.addResult('❌ Database Update Failed', this.getErrorMessage(err), 'error');
    }
  }

  async testDatabaseDelete() {
    try {
      if (!this.testData) {
        this.addResult('⚠️ Database Delete Skipped', 'No test data', 'warning');
        return;
      }
      await PluginSDK.deleteData(this.testData);
      this.addResult('✅ Database Delete', 'Deleted successfully', 'success');
    } catch (err) {
      this.addResult('❌ Database Delete Failed', this.getErrorMessage(err), 'error');
    }
  }

  async testFileUpload() {
    try {
      const testContent = `Test from Alpha - ${new Date().toISOString()}`;
      const blob = new Blob([testContent], { type: 'text/plain' });
      const file = new File([blob], 'test-alpha.txt', { type: 'text/plain' });
      const fileId = await PluginSDK.uploadFile(file);
      this.fileId = fileId;
      this.addResult('✅ File Upload', 'File uploaded successfully', 'success');
    } catch (err) {
      this.addResult('❌ File Upload Failed', this.getErrorMessage(err), 'error');
    }
  }

  async testFileDownload() {
    try {
      if (!this.fileId) {
        this.addResult('⚠️ File Download Skipped', 'No file to download', 'warning');
        return;
      }
      const url = await PluginSDK.getFileUrl(this.fileId);
      this.addResult('✅ File Download', 'URL generated', 'success');
    } catch (err) {
      this.addResult('❌ File Download Failed', this.getErrorMessage(err), 'error');
    }
  }

  async testAPIEndpoint() {
    try {
      const response = await PluginSDK.callAPI('testRead', { test: true });
      this.addResult('✅ API Endpoint', 'API call successful', 'success');
    } catch (err) {
      this.addResult('❌ API Endpoint Failed', this.getErrorMessage(err), 'error');
    }
  }

  async testRoleCheck() {
    try {
      const isAdmin = await PluginSDK.hasRole('admin');
      this.addResult('✅ Role Check', `Admin: ${isAdmin}`, 'success');
    } catch (err) {
      this.addResult('❌ Role Check Failed', this.getErrorMessage(err), 'error');
    }
  }

  async testBulkOperations() {
    try {
      const keys = await PluginSDK.listKeys();
      this.addResult('✅ Bulk Operations', `Found ${keys.length} keys`, 'success');
    } catch (err) {
      this.addResult('❌ Bulk Operations Failed', this.getErrorMessage(err), 'error');
    }
  }

  async testSharedDataPublish() {
    try {
      console.log('[Alpha] Publishing shared data to "default" channel, key "alpha-status"');
      await PluginSDK.publishSharedData('default', 'alpha-status', {
        plugin: 'test-plugin-alpha',
        status: 'active',
        testsRun: this.testResults.length,
        timestamp: Date.now()
      }, 'public');
      console.log('[Alpha] Shared data published successfully');
      this.addResult('✅ Shared Data Publish', 'Status published', 'success');
    } catch (err) {
      console.error('[Alpha] Shared data publish failed:', err);
      this.addResult('❌ Shared Data Publish Failed', this.getErrorMessage(err), 'error');
    }
  }

  createUI(container) {
    container.innerHTML = `
      <div class="p-6 space-y-6 bg-slate-950">
        <div class="space-y-2">
          <h1 class="text-3xl font-bold text-white">🧪 Test Plugin Alpha</h1>
          <p class="text-gray-400">Comprehensive testing suite for Fiber Framework</p>
        </div>

        ${this.userInfo ? `
          <div class="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4">
            <div class="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div class="text-gray-400">Username</div>
                <div class="text-white font-bold">${this.userInfo.username}</div>
              </div>
              <div>
                <div class="text-gray-400">Roles</div>
                <div class="text-white font-bold">${this.userInfo.roles?.join(', ') || 'None'}</div>
              </div>
              <div>
                <div class="text-gray-400">Status</div>
                <span class="inline-block bg-green-600 text-white px-2 py-1 rounded text-xs">Connected</span>
              </div>
            </div>
          </div>
        ` : ''}

        <div class="bg-slate-900 rounded-lg border border-slate-700 p-4">
          <h2 class="text-xl font-bold text-white mb-4">Test Control Panel</h2>
          <button 
            onclick="window.TestPluginInstance.runAllTests()"
            style="opacity: ${this.isRunning ? 0.5 : 1}; cursor: ${this.isRunning ? 'not-allowed' : 'pointer'}"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            ${this.isRunning ? 'disabled' : ''}
          >
            ${this.isRunning ? 'Running Tests...' : 'Run All Tests'}
          </button>
          ${this.isRunning ? `
            <div class="mt-4">
              <div class="bg-slate-800 rounded-full h-2 overflow-hidden">
                <div class="bg-blue-600 h-full transition-all" style="width: ${this.progress}%"></div>
              </div>
              <p class="text-sm text-gray-400 mt-2">${Math.round(this.progress)}% Complete</p>
            </div>
          ` : ''}
        </div>

        <div class="bg-slate-900 rounded-lg border border-slate-700 p-4">
          <h2 class="text-xl font-bold text-white mb-4">Test Results (${this.testResults.length})</h2>
          ${this.testResults.length === 0 ? `
            <p class="text-center py-8 text-gray-500">No tests run yet. Click "Run All Tests" to begin.</p>
          ` : `
            <div class="space-y-3 max-h-96 overflow-y-auto">
              ${this.testResults.map((result, idx) => {
                let bgColor = 'bg-slate-800';
                if (result.status === 'success') bgColor = 'bg-green-500/10 border border-green-500/50';
                else if (result.status === 'error') bgColor = 'bg-red-500/10 border border-red-500/50';
                else if (result.status === 'warning') bgColor = 'bg-yellow-500/10 border border-yellow-500/50';
                
                return `
                  <div class="${bgColor} rounded p-3">
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <div class="font-bold text-white">${result.title}</div>
                        <div class="text-sm text-gray-300 mt-1">${result.message}</div>
                      </div>
                      <div class="text-xs text-gray-500">${result.timestamp}</div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>

        <div class="bg-slate-900 rounded-lg border border-slate-700 p-4">
          <h2 class="text-xl font-bold text-white mb-4">API Endpoints</h2>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div class="bg-slate-800 p-2 rounded">testWrite</div>
            <div class="bg-slate-800 p-2 rounded">testRead</div>
            <div class="bg-slate-800 p-2 rounded">testDelete</div>
            <div class="bg-slate-800 p-2 rounded">testFileUpload</div>
            <div class="bg-slate-800 p-2 rounded">testRoleCheck</div>
            <div class="bg-slate-800 p-2 rounded">testBulkOperation</div>
          </div>
        </div>
      </div>
    `;
    
    window.TestPluginInstance = this;
  }

  // Called by background plugin manager every 3 seconds
  onUpdate(data) {
    console.log('[Alpha] onUpdate called with:', data);
    
    // Auto-publish status for other plugins to detect
    this.testSharedDataPublish().catch(err => {
      console.error('[Alpha] Auto-publish failed:', err);
    });
  }

  destroy() {
    console.log('[Alpha] Plugin destroyed');
  }
}
