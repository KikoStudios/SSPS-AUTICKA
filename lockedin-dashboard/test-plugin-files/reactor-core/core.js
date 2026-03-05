// ============================================================================
// REACTOR CORE - Interactive Energy Management System
// ============================================================================
// A dynamic energy reactor that broadcasts real-time stats and responds to control commands
// from other plugins. Demonstrates:
// - Broadcasting system metrics
// - Listening for control commands
// - Animated visualizations
// - Real-time inter-plugin communication

class ReactorCore {
  constructor() {
    this.name = 'Reactor Core';
    this.version = '2.0.0';
    this.isActive = false;
    
    // Reactor state
    this.reactorLevel = 50; // 0-100
    this.temperature = 25; // Celsius
    this.power = 1500; // Watts
    this.efficiency = 92; // Percent
    this.isOverheating = false;
    
    // Activity tracking
    this.pulseCount = 0;
    this.lastPulse = Date.now();
    this.commandHistory = [];
    this.connectedMonitors = [];
    this.lastRedirect = null;
    this.redirectTriggeredAt = 0;
    this.currentStatus = null;
    
    this.container = null;
    this.updateTimer = null;
  }

  getErrorMessage(err) {
    return err?.message || String(err) || 'Unknown error';
  }

  getSDK() {
    return this.PluginSDK || window.PluginSDK;
  }

  buildStatusSnapshot() {
    return {
      level: Math.round(this.reactorLevel),
      temperature: Math.round(this.temperature * 10) / 10,
      power: this.power,
      efficiency: Math.round(this.efficiency),
      isOverheating: this.isOverheating,
      pulseCount: this.pulseCount,
      timestamp: Date.now(),
    };
  }

  recalculateState() {
    this.temperature = 15 + (this.reactorLevel / 100) * 85;
    this.power = Math.floor(1000 + (this.reactorLevel / 100) * 4000);
    this.efficiency = Math.max(50, Math.min(99, 60 + this.reactorLevel * 0.39));
    this.isOverheating = this.temperature > 85;
    this.currentStatus = this.buildStatusSnapshot();
  }

  initialize() {
    console.log(`🚀 [Reactor Core] Initializing ${this.name} v${this.version}`);
    this.isActive = true;
    this.startReactorSimulation();
    this.registerEndpoints();
    return true;
  }

  async registerEndpoints() {
    try {
      const endpoints = ['getReactorStatus', 'setReactorLevel', 'emergency_cooldown', 'boost_power'];
      await this.getSDK().registerApiEndpoints(endpoints);
      console.log('[Reactor Core] API endpoints registered:', endpoints);
    } catch (err) {
      console.error('[Reactor Core] Failed to register endpoints:', this.getErrorMessage(err));
    }
  }

  startReactorSimulation() {
    // Simulate reactor fluctuations
    this.updateTimer = setInterval(() => {
      // Random fluctuation
      const change = (Math.random() - 0.5) * 3;
      this.reactorLevel = Math.max(0, Math.min(100, this.reactorLevel + change));

      this.pulseCount++;
      this.lastPulse = Date.now();
      this.recalculateState();
    }, 1500);
  }

  async broadcastReactorStatus() {
    try {
      this.currentStatus = this.buildStatusSnapshot();

      await this.getSDK().publishSharedData('default', 'reactor_status', this.currentStatus, 'public');
      console.log('[Reactor Core] Status broadcast:', this.currentStatus);
    } catch (err) {
      console.error('[Reactor Core] Broadcast failed:', this.getErrorMessage(err));
    }
  }

  async checkForCommands() {
    try {
      const data = await this.getSDK().getSharedData();
      
      if (data['reactor_command']) {
        const command = data['reactor_command'];
        console.log('[Reactor Core] ⚡ Received command:', command);
        
        // Process command
        if (command.action === 'boost') {
          this.reactorLevel = Math.min(100, this.reactorLevel + 15);
          this.commandHistory.push({ action: 'boost', timestamp: Date.now(), result: 'success' });
        } else if (command.action === 'cooldown') {
          this.reactorLevel = Math.max(0, this.reactorLevel - 20);
          this.isOverheating = false;
          this.commandHistory.push({ action: 'cooldown', timestamp: Date.now(), result: 'success' });
        } else if (command.action === 'stabilize') {
          this.reactorLevel = 50;
          this.commandHistory.push({ action: 'stabilize', timestamp: Date.now(), result: 'success' });
        }

        this.recalculateState();
      }
    } catch (err) {
      console.error('[Reactor Core] Command check failed:', this.getErrorMessage(err));
    }
  }

  handleRedirectPayload() {
    try {
      const sdk = this.getSDK();
      if (!sdk || typeof sdk.consumeRedirectPayload !== 'function') {
        return;
      }

      const redirect = sdk.consumeRedirectPayload('reactor-core');
      if (!redirect || !redirect.payload) {
        return;
      }

      this.lastRedirect = redirect;

      if (redirect.payload.action === 'cooldown') {
        this.reactorLevel = Math.max(0, this.reactorLevel - 20);
        this.recalculateState();
        this.commandHistory.push({
          action: 'cooldown (redirect)',
          timestamp: Date.now(),
          result: `from ${redirect.fromPlugin || 'unknown'}`,
        });
      }
    } catch (err) {
      console.error('[Reactor Core] Redirect payload handling failed:', this.getErrorMessage(err));
    }
  }

  createUI(container) {
    this.container = container;
    this.render();
  }

  render() {
    if (!this.container) return;

    const levelPercent = Math.round(this.reactorLevel);
    const barColor = this.isOverheating ? '#ef4444' : this.reactorLevel > 75 ? '#f59e0b' : '#10b981';
    const pulseOpacity = 0.3 + (Math.sin(Date.now() / 300) * 0.3 + 0.4);

    this.container.innerHTML = `
      <div class="p-6 space-y-6 bg-gradient-to-br from-slate-950 to-slate-900 min-h-screen">
        <!-- Header -->
        <div class="space-y-2">
          <h1 class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            ⚛️ REACTOR CORE
          </h1>
          <p class="text-sm text-gray-400">Energy Management & Control System</p>
        </div>

        <!-- Main Reactor Visualization -->
        <div class="relative">
          <div class="bg-slate-800 rounded-2xl border-2 border-cyan-500/50 p-8 overflow-hidden">
            <!-- Animated background pulse -->
            <div style="position: absolute; inset: 0; background: radial-gradient(circle, rgba(34, 211, 238, ${pulseOpacity * 0.2}), transparent); pointer-events: none;"></div>
            
            <!-- Content -->
            <div class="relative z-10 space-y-8">
              <!-- Reactor Level Visualization -->
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-xl font-bold text-cyan-300">REACTOR LEVEL</span>
                  <span class="text-3xl font-black text-cyan-400">${levelPercent}%</span>
                </div>
                <div class="h-6 bg-slate-700 rounded-full overflow-hidden border border-cyan-400/30">
                  <div 
                    class="h-full transition-all duration-300 rounded-full"
                    style="width: ${levelPercent}%; background: linear-gradient(to right, ${barColor}, #22d3ee); box-shadow: 0 0 20px ${barColor};"
                  ></div>
                </div>
              </div>

              <!-- Core Metrics Grid -->
              <div class="grid grid-cols-2 gap-4">
                <div class="bg-slate-900/50 rounded-lg p-4 border border-blue-500/30">
                  <div class="text-xs text-gray-400 mb-1">TEMPERATURE</div>
                  <div class="text-2xl font-bold text-blue-300">${(this.currentStatus?.temperature ?? this.temperature).toFixed(1)}°C</div>
                  <div class="text-xs text-gray-500 mt-2">${this.isOverheating ? '🔴 OVERHEATING' : '✅ Normal'}</div>
                </div>
                
                <div class="bg-slate-900/50 rounded-lg p-4 border border-green-500/30">
                  <div class="text-xs text-gray-400 mb-1">POWER OUTPUT</div>
                  <div class="text-2xl font-bold text-green-300">${this.currentStatus?.power ?? this.power} W</div>
                  <div class="text-xs text-gray-500 mt-2">⚡ Active</div>
                </div>
                
                <div class="bg-slate-900/50 rounded-lg p-4 border border-yellow-500/30">
                  <div class="text-xs text-gray-400 mb-1">EFFICIENCY</div>
                  <div class="text-2xl font-bold text-yellow-300">${(this.currentStatus?.efficiency ?? this.efficiency).toFixed(0)}%</div>
                  <div class="text-xs text-gray-500 mt-2">📊 Optimal</div>
                </div>
                
                <div class="bg-slate-900/50 rounded-lg p-4 border border-purple-500/30">
                  <div class="text-xs text-gray-400 mb-1">PULSES</div>
                  <div class="text-2xl font-bold text-purple-300">${this.pulseCount}</div>
                  <div class="text-xs text-gray-500 mt-2">💓 Running</div>
                </div>
              </div>

              ${this.lastRedirect ? `<div class="bg-purple-900/30 rounded-lg border border-purple-500/50 p-3 text-xs text-purple-200">🔀 Redirect trigger from <strong>${this.lastRedirect.fromPlugin || 'unknown'}</strong>${this.lastRedirect.trigger ? ` (${this.lastRedirect.trigger})` : ''}</div>` : ''}

              <!-- Status Indicator -->
              <div class="flex items-center justify-center gap-2 py-3 bg-slate-900/50 rounded-lg border border-cyan-500/50">
                <div 
                  style="width: 12px; height: 12px; border-radius: 50%; background: ${barColor}; box-shadow: 0 0 10px ${barColor}; animation: pulse 2s infinite;"
                ></div>
                <span class="text-cyan-300 font-semibold">REACTOR OPERATIONAL</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Control Panel -->
        <div class="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <h2 class="text-lg font-bold text-white mb-4">⚙️ CONTROL PANEL</h2>
          <div class="grid grid-cols-3 gap-3">
            <button onclick="window.ReactorInstance.manualBoost();" class="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold py-2 px-3 rounded text-sm transition">
              🟢 BOOST
            </button>
            <button onclick="window.ReactorInstance.manualStabilize();" class="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-2 px-3 rounded text-sm transition">
              🔵 STABILIZE
            </button>
            <button onclick="window.ReactorInstance.manualCooldown();" class="bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-bold py-2 px-3 rounded text-sm transition">
              ❄️ COOL
            </button>
          </div>
          <p class="text-xs text-gray-400 mt-3">💡 Your Pulse Monitor can control this reactor remotely!</p>
        </div>

        <!-- Command History -->
        <div class="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <h2 class="text-lg font-bold text-white mb-3">📡 COMMAND HISTORY</h2>
          <div class="space-y-2 max-h-32 overflow-y-auto font-mono text-xs">
            ${this.commandHistory.length === 0 ? '<p class="text-gray-500 text-center py-4">No commands received yet</p>' : this.commandHistory.slice(-10).reverse().map((cmd, idx) => {
              const time = new Date(cmd.timestamp).toLocaleTimeString();
              const action = cmd.action.toUpperCase();
              const result = cmd.result;
              return `<div class="text-gray-300 border-l-2 border-cyan-500/50 pl-2"><span class="text-cyan-400">[${time}]</span><span class="text-white">${action}</span><span class="text-green-400">${result}</span></div>`;
            }).join('')}
          </div>
        </div>

        <style>
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.2); }
          }
        </style>
      </div>
    `;

    window.ReactorInstance = this;
  }

  manualBoost() {
    this.reactorLevel = Math.min(100, this.reactorLevel + 15);
    this.recalculateState();
    this.commandHistory.push({ action: 'boost (manual)', timestamp: Date.now(), result: 'success' });
    this.render();
  }

  manualCooldown() {
    this.reactorLevel = Math.max(0, this.reactorLevel - 20);
    this.isOverheating = false;
    this.recalculateState();
    this.commandHistory.push({ action: 'cooldown (manual)', timestamp: Date.now(), result: 'success' });
    this.render();
  }

  manualStabilize() {
    this.reactorLevel = 50;
    this.recalculateState();
    this.commandHistory.push({ action: 'stabilize (manual)', timestamp: Date.now(), result: 'success' });
    this.render();
  }

  onUpdate(data) {
    this.recalculateState();
    this.handleRedirectPayload();
    console.log('[Reactor Core] onUpdate - Broadcasting status...');
    this.broadcastReactorStatus();
    this.checkForCommands();
    this.render();
  }

  destroy() {
    if (this.updateTimer) clearInterval(this.updateTimer);
    console.log('[Reactor Core] Plugin destroyed');
  }
}

// Export plugin class for BackgroundPluginManager
window.TempBackgroundPlugin = ReactorCore;
