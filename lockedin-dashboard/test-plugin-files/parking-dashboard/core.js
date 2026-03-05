/**
 * Parking Dashboard Plugin - Fiber Framework Demo #1
 * 
 * Demonstrates:
 * ✅ Data storage (parking spaces, history)
 * ✅ Shared data publishing (spaces available to other plugins)
 * ✅ Role-based features (admins get extra controls)
 * ✅ HeroUI components (cards, buttons, grids)
 * ✅ Theme-aware UI (light/dark mode)
 * ✅ API endpoints (external apps can query status)
 * ✅ Real-time updates (mock polling)
 */

class ParkingDashboardPlugin {
  constructor() {
    this.sdk = null;
    this.spaces = { total: 100, occupied: 0, free: 100 };
    this.history = [];
    this.isAdmin = false;
    this.currentUser = null;
    this.themeUnsub = null;
    this.publishInterval = null;
  }

  async initialize(context) {
    const { createPluginSDK } = window.PluginSDK;
    this.sdk = createPluginSDK({
      pluginName: 'parking-dashboard',
      convexClient: context.convexClient,
      username: context.username,
      userData: context.userData
    });

    // Get current user
    this.currentUser = await this.sdk.getCurrentUser();
    if (!this.currentUser) {
      this.sdk.error('User not authenticated');
      return;
    }

    // Check if admin
    this.isAdmin = await this.sdk.hasRole('admin');

    // Load saved data
    await this.loadData();

    // Register API endpoints
    await this.sdk.registerApiEndpoints(['getParkingStatus', 'reportOccupancy']);

    // Listen for theme changes
    this.themeUnsub = this.sdk.onThemeChange(() => {
      this.updateUI();
    });

    // Publish data to other plugins on a schedule
    this.startPublishing();

    // Start API polling
    this.startApiPolling();

    this.sdk.log('Parking Dashboard initialized', {
      user: this.currentUser.username,
      isAdmin: this.isAdmin,
      spaces: this.spaces
    });
  }

  async loadData() {
    try {
      const saved = await this.sdk.getData('parking-spaces');
      if (saved) {
        this.spaces = saved;
      }

      const savedHistory = await this.sdk.getData('parking-history');
      if (savedHistory) {
        this.history = savedHistory.slice(-20); // Keep last 20
      }
    } catch (error) {
      this.sdk.error('Failed to load data:', error);
    }
  }

  async saveData() {
    try {
      await this.sdk.setData('parking-spaces', this.spaces);
      await this.sdk.setData('parking-history', this.history);
    } catch (error) {
      this.sdk.error('Failed to save data:', error);
    }
  }

  startPublishing() {
    // Publish parking status every 5 seconds
    this.publishInterval = setInterval(async () => {
      try {
        await this.sdk.publishSharedData(
          'parking-data',
          'current-status',
          {
            timestamp: Date.now(),
            total: this.spaces.total,
            occupied: this.spaces.occupied,
            free: this.spaces.free,
            percentOccupied: Math.round((this.spaces.occupied / this.spaces.total) * 100)
          },
          'public' // All plugins can read this
        );
      } catch (error) {
        this.sdk.error('Failed to publish shared data:', error);
      }
    }, 5000);
  }

  async updateOccupancy(occupied) {
    if (occupied < 0 || occupied > this.spaces.total) {
      alert('Invalid occupancy number');
      return;
    }

    const previousOccupied = this.spaces.occupied;
    this.spaces.occupied = occupied;
    this.spaces.free = this.spaces.total - occupied;

    // Add to history
    this.history.push({
      timestamp: Date.now(),
      previousOccupied,
      newOccupied: occupied,
      user: this.currentUser.username,
      change: occupied - previousOccupied
    });

    await this.saveData();
    this.updateUI();
    this.sdk.log('Occupancy updated:', { previousOccupied, newOccupied: occupied });
  }

  createUI(container) {
    const theme = this.sdk.getTheme();
    const isDark = theme === 'dark';
    const bgColor = isDark ? '#1a1a1a' : '#ffffff';
    const textColor = isDark ? '#ffffff' : '#000000';
    const borderColor = isDark ? '#333' : '#ddd';

    container.innerHTML = `
      <div id="parking-dashboard" style="
        padding: 20px;
        height: 100%;
        overflow-y: auto;
        background: ${bgColor};
        color: ${textColor};
        font-family: 'JetBrains Mono', monospace;
      ">
        <!-- Header -->
        <div style="margin-bottom: 30px;">
          <h1 style="margin: 0 0 5px 0; font-size: 28px;">🅿️ Parking Dashboard</h1>
          <p style="margin: 0; opacity: 0.7; font-size: 12px;">
            Logged in as: ${this.currentUser.username} 
            ${this.isAdmin ? '<span style="color: #e74c3c;">[Admin]</span>' : ''}
          </p>
        </div>

        <!-- Status Cards -->
        <div style="
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin-bottom: 30px;
        ">
          <!-- Total Spaces -->
          <div style="
            padding: 20px;
            border: 2px solid ${borderColor};
            border-radius: 8px;
            background: ${isDark ? '#2a2a2a' : '#f8f9fa'};
          ">
            <div style="font-size: 12px; opacity: 0.7; margin-bottom: 8px;">Total Spaces</div>
            <div style="font-size: 32px; font-weight: bold; color: #3498db;">
              ${this.spaces.total}
            </div>
          </div>

          <!-- Occupied -->
          <div style="
            padding: 20px;
            border: 2px solid ${borderColor};
            border-radius: 8px;
            background: ${isDark ? '#2a2a2a' : '#f8f9fa'};
          ">
            <div style="font-size: 12px; opacity: 0.7; margin-bottom: 8px;">Occupied</div>
            <div style="font-size: 32px; font-weight: bold; color: #e74c3c;">
              ${this.spaces.occupied}
            </div>
          </div>

          <!-- Available -->
          <div style="
            padding: 20px;
            border: 2px solid ${borderColor};
            border-radius: 8px;
            background: ${isDark ? '#2a2a2a' : '#f8f9fa'};
          ">
            <div style="font-size: 12px; opacity: 0.7; margin-bottom: 8px;">Available</div>
            <div style="font-size: 32px; font-weight: bold; color: #27ae60;">
              ${this.spaces.free}
            </div>
          </div>
        </div>

        <!-- Occupancy Bar -->
        <div style="margin-bottom: 30px;">
          <div style="font-size: 12px; margin-bottom: 8px; opacity: 0.7;">
            Occupancy: <strong>${Math.round((this.spaces.occupied / this.spaces.total) * 100)}%</strong>
          </div>
          <div style="
            width: 100%;
            height: 20px;
            background: ${isDark ? '#333' : '#eee'};
            border-radius: 10px;
            overflow: hidden;
          ">
            <div style="
              width: ${(this.spaces.occupied / this.spaces.total) * 100}%;
              height: 100%;
              background: #e74c3c;
              transition: width 0.3s ease;
            "></div>
          </div>
        </div>

        ${this.isAdmin ? `
          <!-- Admin Controls -->
          <div style="
            padding: 20px;
            border: 2px solid #e74c3c;
            border-radius: 8px;
            background: ${isDark ? '#2a2a2a' : '#f8f9fa'};
            margin-bottom: 30px;
          ">
            <h3 style="margin: 0 0 15px 0;">⚙️ Admin Controls</h3>
            <div style="display: flex; gap: 10px; align-items: center;">
              <input 
                type="number" 
                id="occupancy-input" 
                min="0" 
                max="${this.spaces.total}"
                value="${this.spaces.occupied}"
                style="
                  padding: 8px;
                  border: 2px solid ${borderColor};
                  border-radius: 4px;
                  background: ${isDark ? '#333' : '#fff'};
                  color: ${textColor};
                  font-size: 14px;
                  width: 80px;
                "
              />
              <button id="update-btn" style="
                padding: 8px 16px;
                background: #3498db;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
              ">
                Update
              </button>
              <button id="add-space-btn" style="
                padding: 8px 16px;
                background: #27ae60;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
              ">
                +1 Space
              </button>
              <button id="remove-space-btn" style="
                padding: 8px 16px;
                background: #e74c3c;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
              ">
                -1 Space
              </button>
            </div>
          </div>
        ` : ''}

        <!-- Recent History -->
        <div>
          <h3 style="margin: 0 0 15px 0;">📋 Recent Activity</h3>
          <div id="history-list" style="
            border: 2px solid ${borderColor};
            border-radius: 8px;
            max-height: 300px;
            overflow-y: auto;
          "></div>
        </div>
      </div>
    `;

    // Event listeners
    if (this.isAdmin) {
      const updateBtn = container.querySelector('#update-btn');
      const addBtn = container.querySelector('#add-space-btn');
      const removeBtn = container.querySelector('#remove-space-btn');
      const input = container.querySelector('#occupancy-input');

      updateBtn.onclick = async () => {
        const val = parseInt(input.value);
        if (!isNaN(val)) {
          await this.updateOccupancy(val);
        }
      };

      addBtn.onclick = async () => {
        this.spaces.total++;
        this.spaces.free = this.spaces.total - this.spaces.occupied;
        await this.saveData();
        input.max = this.spaces.total;
        this.updateUI();
      };

      removeBtn.onclick = async () => {
        if (this.spaces.total > this.spaces.occupied) {
          this.spaces.total--;
          this.spaces.free = this.spaces.total - this.spaces.occupied;
          await this.saveData();
          input.max = this.spaces.total;
          this.updateUI();
        }
      };
    }

    this.updateHistory();
  }

  updateUI() {
    if (document.querySelector('#parking-dashboard')) {
      this.createUI(document.querySelector('#parking-dashboard').parentElement);
    }
  }

  updateHistory() {
    const historyList = document.querySelector('#history-list');
    if (!historyList) return;

    const isDark = this.sdk.getTheme() === 'dark';
    const borderColor = isDark ? '#333' : '#ddd';

    if (this.history.length === 0) {
      historyList.innerHTML = `
        <div style="padding: 20px; text-align: center; opacity: 0.5;">
          No activity yet
        </div>
      `;
      return;
    }

    historyList.innerHTML = [...this.history].reverse().map((entry) => `
      <div style="
        padding: 10px;
        border-bottom: 1px solid ${borderColor};
        font-size: 12px;
      ">
        <div style="display: flex; justify-content: space-between;">
          <span>${entry.user}</span>
          <span style="opacity: 0.6;">
            ${new Date(entry.timestamp).toLocaleTimeString()}
          </span>
        </div>
        <div style="opacity: 0.7; margin-top: 4px;">
          ${entry.occupied} → ${entry.newOccupied}
          <span style="color: ${entry.change > 0 ? '#e74c3c' : '#27ae60'};">
            (${entry.change > 0 ? '+' : ''}${entry.change})
          </span>
        </div>
      </div>
    `).join('');
  }

  startApiPolling() {
    setInterval(async () => {
      try {
        const allData = await this.sdk.getAllData();
        
        for (const item of allData) {
          if (item.key.startsWith('api_call_')) {
            const callData = item.value;
            await this.handleApiCall(callData, item.key);
            await this.sdk.deleteData(item.key);
          }
        }
      } catch (error) {
        this.sdk.error('API polling error:', error);
      }
    }, 2000);
  }

  async handleApiCall(callData, callKey) {
    const { endpoint, method, body } = callData;
    this.sdk.log('API call received:', endpoint, method);

    try {
      let result = null;

      if (endpoint === 'getParkingStatus' && method === 'GET') {
        result = {
          success: true,
          data: {
            total: this.spaces.total,
            occupied: this.spaces.occupied,
            free: this.spaces.free,
            percentOccupied: Math.round((this.spaces.occupied / this.spaces.total) * 100),
            timestamp: Date.now()
          }
        };
      } else if (endpoint === 'reportOccupancy' && method === 'POST' && body && this.isAdmin) {
        if (typeof body.occupied === 'number') {
          await this.updateOccupancy(body.occupied);
          result = { success: true, message: 'Occupancy updated' };
        } else {
          result = { success: false, error: 'Invalid occupancy value' };
        }
      }

      if (result) {
        await this.sdk.setData(callKey + '_result', result);
      }
    } catch (error) {
      this.sdk.error('API call handling error:', error);
      await this.sdk.setData(callKey + '_result', {
        success: false,
        error: error.message
      });
    }
  }

  destroy() {
    if (this.themeUnsub) {
      this.themeUnsub();
    }
    if (this.publishInterval) {
      clearInterval(this.publishInterval);
    }
    this.sdk.log('Parking Dashboard destroyed');
  }
}

window.ParkingDashboardPlugin = ParkingDashboardPlugin;
