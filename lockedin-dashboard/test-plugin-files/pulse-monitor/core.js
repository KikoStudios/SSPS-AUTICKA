// ============================================================================
// PULSE MONITOR - Real-time Reactor Control & Monitoring
// ============================================================================
// A monitoring dashboard that listens to Reactor Core broadcasts and provides
// remote control capabilities. Demonstrates:
// - Listening to other plugin broadcasts
// - Sending control commands
// - Real-time data visualization
// - Interactive control interface

class PulseMonitor {
  constructor() {
    this.name = 'Pulse Monitor';
    this.version = '2.0.0';
    this.isActive = false;
    
    // Monitoring state
    this.reactorStatus = null;
    this.activityLog = [];
    this.isConnected = false;
    this.lastUpdate = null;
    this.monitoringActive = false;
    this.lastRedirectResult = null;
    
    this.container = null;
  }

  getErrorMessage(err) {
    return err?.message || String(err) || 'Unknown error';
  }

  getSDK() {
    return this.PluginSDK || window.PluginSDK;
  }

  initialize() {
    console.log(`📡 [Pulse Monitor] Initializing ${this.name} v${this.version}`);
    this.isActive = true;
    this.registerEndpoints();
    this.logActivity('Pulse Monitor online', 'status');
    return true;
  }

  async registerEndpoints() {
    try {
      const endpoints = ['monitor_status', 'send_command', 'get_activity_log'];
      await this.getSDK().registerApiEndpoints(endpoints);
      console.log('[Pulse Monitor] API endpoints registered:', endpoints);
    } catch (err) {
      console.error('[Pulse Monitor] Failed to register endpoints:', this.getErrorMessage(err));
    }
  }

  logActivity(message, type = 'info') {
    this.activityLog.push({
      message,
      type,
      timestamp: Date.now(),
    });
    
    // Keep only last 50 entries
    if (this.activityLog.length > 50) {
      this.activityLog = this.activityLog.slice(-50);
    }
  }

  async monitorReactor() {
    try {
      const data = await this.getSDK().getSharedData();
      
      if (data['reactor_status']) {
        this.reactorStatus = data['reactor_status'];
        this.lastUpdate = Date.now();
        this.isConnected = true;
        
        console.log('[Pulse Monitor] ✅ Connected to Reactor Core:', this.reactorStatus);
        this.logActivity(`Reactor level: ${this.reactorStatus.level}%`, 'reactor');
        
        // Auto-cooldown if overheating
        if (this.reactorStatus.isOverheating) {
          this.logActivity('⚠️ Reactor overheating detected! Initiating cooldown...', 'warning');
          setTimeout(() => this.sendCommand('cooldown', {}), 500);
        }
      } else {
        this.isConnected = false;
        this.logActivity('❌ Reactor Core connection lost', 'warning');
      }
    } catch (err) {
      this.isConnected = false;
      console.error('[Pulse Monitor] Monitor error:', this.getErrorMessage(err));
      this.logActivity('⚠️ Monitor error: ' + this.getErrorMessage(err), 'error');
    }
  }

  async sendCommand(action, options = {}) {
    try {
      const command = {
        action,
        timestamp: Date.now(),
        fromMonitor: true,
        ...options,
      };

      console.log('[Pulse Monitor] 📤 Sending command:', action);
      await this.getSDK().publishSharedData('default', 'reactor_command', command, 'public');
      
      this.logActivity(`📤 Command sent: ${action}`, 'command');
    } catch (err) {
      console.error('[Pulse Monitor] Command send failed:', this.getErrorMessage(err));
      this.logActivity('⚠️ Failed to send command: ' + action, 'error');
    }
  }

  redirectToReactor(action) {
    try {
      const ok = this.getSDK().redirectToPlugin('reactor-core', {
        action,
        source: 'pulse-monitor',
      }, {
        trigger: 'monitor_redirect',
      });

      if (ok) {
        this.lastRedirectResult = { action, timestamp: Date.now(), success: true };
        this.logActivity(`🔀 Redirected to reactor-core with action: ${action}`, 'status');
      }
    } catch (err) {
      this.lastRedirectResult = { action, timestamp: Date.now(), success: false };
      this.logActivity(`⚠️ Redirect failed: ${action}`, 'error');
      console.error('[Pulse Monitor] Redirect failed:', this.getErrorMessage(err));
    }
  }

  createUI(container) {
    this.container = container;
    this.render();
  }

  render() {
    if (!this.container) return;

    const hasReactor = this.reactorStatus !== null;
    const reactorHealth = hasReactor ? Math.max(0, Math.min(100, this.reactorStatus.level + (this.reactorStatus.isOverheating ? -20 : 0))) : 0;
    const statusColor = !this.isConnected ? 'text-red-400' : this.reactorStatus?.isOverheating ? 'text-orange-400' : 'text-green-400';
    const statusBg = !this.isConnected ? 'from-red-900/20' : this.reactorStatus?.isOverheating ? 'from-orange-900/20' : 'from-green-900/20';

    // Calculate pulse animation speed based on reactor level
    const pulseSpeed = hasReactor ? 200 + (100 - this.reactorStatus.level) : 400;

    this.container.innerHTML = `
      <div class="p-6 space-y-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen">
        <!-- Header -->
        <div class="space-y-2">
          <h1 class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
            📡 PULSE MONITOR
          </h1>
          <p class="text-sm text-gray-400">Real-time Reactor Control Center</p>
        </div>

        <!-- Connection Status -->
        <div class="bg-gradient-to-r ${statusBg} to-slate-900/20 rounded-lg border ${this.isConnected ? 'border-green-500/50' : 'border-red-500/50'} p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div style="width: 14px; height: 14px; border-radius: 50%; background: ${this.isConnected ? '#22c55e' : '#ef4444'}; box-shadow: 0 0 10px ${this.isConnected ? '#22c55e' : '#ef4444'}; animation: pulse ${pulseSpeed}ms infinite;"></div>
              <div>
                <div class="font-bold ${statusColor}">${this.isConnected ? '✅ CONNECTED' : '❌ NOT CONNECTED'}</div>
                <div class="text-xs text-gray-400">${this.isConnected ? 'Monitoring Reactor Core' : 'Waiting for Reactor Core...'}</div>
              </div>
            </div>
            ${hasReactor ? `
              <div class="text-right">
                <div class="text-sm text-gray-400">Last update</div>
                <div class="text-xs text-gray-500">${Math.round((Date.now() - this.lastUpdate) / 1000)}s ago</div>
              </div>
            ` : ''}
          </div>
        </div>

        ${hasReactor ? `
          <!-- Reactor Status Display -->
          <div class="bg-slate-800 rounded-lg border border-purple-500/50 p-6 space-y-4">
            <h2 class="text-xl font-bold text-purple-300">⚛️ REACTOR STATS</h2>
            
            <!-- Level with animated bar -->
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-gray-300">Energy Level</span>
                <span class="text-2xl font-bold text-purple-400">${this.reactorStatus.level}%</span>
              </div>
              <div class="h-4 bg-slate-700 rounded-full overflow-hidden border border-purple-400/30">
                <div 
                  class="h-full transition-all duration-500 rounded-full"
                  style="width: ${this.reactorStatus.level}%; background: linear-gradient(to right, #a78bfa, #ec4899); box-shadow: 0 0 15px rgba(236, 72, 153, 0.5);"
                ></div>
              </div>
            </div>

            <!-- Stats Grid -->
            <div class="grid grid-cols-3 gap-3">
              <div class="bg-slate-900/50 rounded p-3 border border-blue-500/30 text-center">
                <div class="text-xs text-gray-400">Temp</div>
                <div class="text-lg font-bold text-blue-300">${Number(this.reactorStatus.temperature).toFixed(1)}°C</div>
              </div>
              <div class="bg-slate-900/50 rounded p-3 border border-cyan-500/30 text-center">
                <div class="text-xs text-gray-400">Power</div>
                <div class="text-lg font-bold text-cyan-300">${this.reactorStatus.power} W</div>
              </div>
              <div class="bg-slate-900/50 rounded p-3 border border-green-500/30 text-center">
                <div class="text-xs text-gray-400">Eff.</div>
                <div class="text-lg font-bold text-green-300">${this.reactorStatus.efficiency}%</div>
              </div>
            </div>

            <!-- Health Warning -->
            ${this.reactorStatus.isOverheating ? `
              <div class="bg-red-900/30 border border-red-500/50 rounded p-3 flex items-center gap-2">
                <span class="text-2xl">🔥</span>
                <div>
                  <div class="font-bold text-red-300">OVERHEATING!</div>
                  <div class="text-xs text-red-200">Automatic cooldown in progress</div>
                </div>
              </div>
            ` : ''}

            <!-- Pulses -->
            <div class="bg-slate-900/50 rounded p-3 border border-pink-500/30 text-center">
              <div class="text-xs text-gray-400">Reactor Pulses</div>
              <div class="text-2xl font-bold text-pink-300">💓 ${this.reactorStatus.pulseCount}</div>
            </div>
          </div>

          <!-- Control Panel -->
          <div class="bg-slate-800 rounded-lg border border-slate-700 p-4">
            <h2 class="text-lg font-bold text-white mb-4">🎮 REMOTE CONTROL</h2>
            <div class="grid grid-cols-3 gap-3">
              <button onclick="window.PulseInstance.sendCommand('boost');" class="bg-gradient-to-b from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold py-3 px-2 rounded text-sm transition transform hover:scale-105">
                <div class="text-xl mb-1">⚡</div>
                <div>BOOST</div>
              </button>
              <button onclick="window.PulseInstance.sendCommand('stabilize');" class="bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-3 px-2 rounded text-sm transition transform hover:scale-105">
                <div class="text-xl mb-1">⚙️</div>
                <div>STABILIZE</div>
              </button>
              <button onclick="window.PulseInstance.sendCommand('cooldown');" class="bg-gradient-to-b from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white font-bold py-3 px-2 rounded text-sm transition transform hover:scale-105">
                <div class="text-xl mb-1">❄️</div>
                <div>COOL</div>
              </button>
            </div>
            <p class="text-xs text-gray-400 mt-3">💡 Commands are sent instantly to the Reactor Core!</p>
          </div>

          <!-- Redirect Trigger -->
          <div class="bg-slate-800 rounded-lg border border-slate-700 p-4">
            <h2 class="text-lg font-bold text-white mb-4">🔀 REDIRECT TRIGGER</h2>
            <button onclick="window.PulseInstance.redirectToReactor('cooldown');" class="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 px-3 rounded text-sm transition">
              Open Reactor Core and trigger cooldown
            </button>
            <p class="text-xs text-gray-400 mt-3">Passes payload to Reactor Core via plugin redirect event.</p>
            ${this.lastRedirectResult ? `<p class="text-xs mt-2 ${this.lastRedirectResult.success ? 'text-green-400' : 'text-red-400'}">Last redirect: ${this.lastRedirectResult.action} (${new Date(this.lastRedirectResult.timestamp).toLocaleTimeString()})</p>` : ''}
          </div>
        ` : `
          <!-- Waiting for Reactor -->
          <div class="bg-slate-800 rounded-lg border border-slate-700 p-8 text-center">
            <div class="text-6xl mb-4">📡</div>
            <div class="text-xl font-bold text-gray-300 mb-2">Scanning for Reactor Core...</div>
            <div class="text-sm text-gray-400">Please ensure Reactor Core plugin is loaded and active</div>
          </div>
        `}

        <!-- Activity Log -->
        <div class="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <h2 class="text-lg font-bold text-white mb-3">📊 ACTIVITY LOG</h2>
          <div class="space-y-1 max-h-48 overflow-y-auto font-mono text-xs">
            ${this.activityLog.length === 0 ? '<p class="text-gray-500 text-center py-4">No activity yet</p>' : this.activityLog.slice().reverse().map((log) => {
              let color = 'text-gray-400';
              if (log.type === 'command') color = 'text-purple-400';
              if (log.type === 'reactor') color = 'text-cyan-400';
              if (log.type === 'warning') color = 'text-orange-400';
              if (log.type === 'error') color = 'text-red-400';
              if (log.type === 'status') color = 'text-green-400';
              const time = new Date(log.timestamp).toLocaleTimeString();
              const msg = log.message;
              return `<div class="flex gap-2 ${color} border-l-2 border-slate-600 pl-2"><span class="text-gray-600">[${time}]</span><span>${msg}</span></div>`;
            }).join('')}
          </div>
        </div>

        <style>
          @keyframes pulse {
            0%, 100% { opacity: 1; box-shadow: 0 0 10px currentColor; }
            50% { opacity: 0.5; box-shadow: 0 0 20px currentColor; }
          }
        </style>
      </div>
    `;

    window.PulseInstance = this;
  }

  onUpdate(data) {
    // Monitor reactor every update cycle
    this.monitorReactor();
    this.render();
  }

  destroy() {
    console.log('[Pulse Monitor] Plugin destroyed');
  }
}

// Export plugin class for BackgroundPluginManager
window.TempBackgroundPlugin = PulseMonitor;
