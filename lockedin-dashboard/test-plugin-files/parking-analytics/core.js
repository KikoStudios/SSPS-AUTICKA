/**
 * Parking Analytics Plugin - Fiber Framework Demo #2
 * 
 * Demonstrates:
 * ✅ Reading shared data from other plugins (parking-dashboard)
 * ✅ Data storage (analytics metrics)
 * ✅ File storage (export analytics as JSON)
 * ✅ Real-time data polling and updates
 * ✅ HeroUI components (grids, cards, buttons)
 * ✅ Theme-aware UI
 * ✅ User profile access
 * ✅ Charts/graphs visualization
 */

class ParkingAnalyticsPlugin {
  constructor() {
    this.sdk = null;
    this.currentStatus = null;
    this.metrics = {
      peakOccupancy: 0,
      minOccupancy: 100,
      averageOccupancy: 0,
      readings: []
    };
    this.currentUser = null;
    this.themeUnsub = null;
    this.pollInterval = null;
  }

  async initialize(context) {
    const { createPluginSDK } = window.PluginSDK;
    this.sdk = createPluginSDK({
      pluginName: 'parking-analytics',
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

    // Load saved metrics
    await this.loadMetrics();

    // Listen for theme changes
    this.themeUnsub = this.sdk.onThemeChange(() => {
      this.updateUI();
    });

    // Start polling for shared data from parking-dashboard
    this.startPolling();

    this.sdk.log('Parking Analytics initialized', {
      user: this.currentUser.username,
      metrics: this.metrics
    });
  }

  async loadMetrics() {
    try {
      const saved = await this.sdk.getData('analytics-metrics');
      if (saved) {
        this.metrics = saved;
      }
    } catch (error) {
      this.sdk.error('Failed to load metrics:', error);
    }
  }

  async saveMetrics() {
    try {
      await this.sdk.setData('analytics-metrics', this.metrics);
    } catch (error) {
      this.sdk.error('Failed to save metrics:', error);
    }
  }

  startPolling() {
    // Poll for shared data every 3 seconds
    this.pollInterval = setInterval(async () => {
      try {
        // Read the latest parking status published by parking-dashboard
        const status = await this.sdk.readSharedDataByKey(
          'parking-dashboard',
          'parking-data',
          'current-status'
        );

        if (status) {
          this.currentStatus = status;
          
          // Update metrics
          this.metrics.readings.push({
            timestamp: Date.now(),
            occupied: status.occupied,
            free: status.free,
            percentOccupied: status.percentOccupied
          });

          // Keep only last 100 readings
          if (this.metrics.readings.length > 100) {
            this.metrics.readings = this.metrics.readings.slice(-100);
          }

          // Calculate statistics
          this.updateMetrics();
          this.updateUI();

          // Auto-save every 10 readings
          if (this.metrics.readings.length % 10 === 0) {
            await this.saveMetrics();
          }
        }
      } catch (error) {
        this.sdk.error('Failed to read shared data:', error);
      }
    }, 3000);
  }

  updateMetrics() {
    if (this.metrics.readings.length === 0) return;

    const occupancies = this.metrics.readings.map(r => r.percentOccupied);
    
    this.metrics.peakOccupancy = Math.max(...occupancies);
    this.metrics.minOccupancy = Math.min(...occupancies);
    this.metrics.averageOccupancy = Math.round(
      occupancies.reduce((a, b) => a + b, 0) / occupancies.length
    );
  }

  createUI(container) {
    const theme = this.sdk.getTheme();
    const isDark = theme === 'dark';
    const bgColor = isDark ? '#1a1a1a' : '#ffffff';
    const textColor = isDark ? '#ffffff' : '#000000';
    const borderColor = isDark ? '#333' : '#ddd';

    container.innerHTML = `
      <div id="parking-analytics" style="
        padding: 20px;
        height: 100%;
        overflow-y: auto;
        background: ${bgColor};
        color: ${textColor};
        font-family: 'JetBrains Mono', monospace;
      ">
        <!-- Header -->
        <div style="margin-bottom: 30px;">
          <h1 style="margin: 0 0 5px 0; font-size: 28px;">📊 Parking Analytics</h1>
          <p style="margin: 0; opacity: 0.7; font-size: 12px;">
            Viewing data from: parking-dashboard | User: ${this.currentUser.username}
          </p>
        </div>

        <!-- Current Status -->
        ${this.currentStatus ? `
          <div style="
            padding: 20px;
            border: 2px solid #3498db;
            border-radius: 8px;
            background: ${isDark ? '#2a2a2a' : '#f8f9fa'};
            margin-bottom: 30px;
          ">
            <h3 style="margin: 0 0 15px 0; color: #3498db;">📍 Current Status</h3>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px;">
              <div>
                <div style="font-size: 11px; opacity: 0.7;">Occupied</div>
                <div style="font-size: 24px; font-weight: bold; color: #e74c3c;">
                  ${this.currentStatus.occupied}
                </div>
              </div>
              <div>
                <div style="font-size: 11px; opacity: 0.7;">Available</div>
                <div style="font-size: 24px; font-weight: bold; color: #27ae60;">
                  ${this.currentStatus.free}
                </div>
              </div>
              <div>
                <div style="font-size: 11px; opacity: 0.7;">Total</div>
                <div style="font-size: 24px; font-weight: bold;">
                  ${this.currentStatus.total}
                </div>
              </div>
              <div>
                <div style="font-size: 11px; opacity: 0.7;">Occupancy</div>
                <div style="font-size: 24px; font-weight: bold; color: #f39c12;">
                  ${this.currentStatus.percentOccupied}%
                </div>
              </div>
            </div>
            <div style="margin-top: 15px; font-size: 10px; opacity: 0.6;">
              Last updated: ${new Date(this.currentStatus.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ` : `
          <div style="
            padding: 20px;
            border: 2px dashed ${borderColor};
            border-radius: 8px;
            text-align: center;
            color: #e74c3c;
            margin-bottom: 30px;
          ">
            ⚠️ Waiting for data from parking-dashboard plugin...
          </div>
        `}

        <!-- Metrics -->
        ${this.metrics.readings.length > 0 ? `
          <div style="
            padding: 20px;
            border: 2px solid ${borderColor};
            border-radius: 8px;
            background: ${isDark ? '#2a2a2a' : '#f8f9fa'};
            margin-bottom: 30px;
          ">
            <h3 style="margin: 0 0 15px 0;">📈 Analytics Metrics</h3>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px;">
              <div>
                <div style="font-size: 11px; opacity: 0.7;">Peak Occupancy</div>
                <div style="font-size: 20px; font-weight: bold;">
                  ${this.metrics.peakOccupancy}%
                </div>
              </div>
              <div>
                <div style="font-size: 11px; opacity: 0.7;">Min Occupancy</div>
                <div style="font-size: 20px; font-weight: bold;">
                  ${this.metrics.minOccupancy}%
                </div>
              </div>
              <div>
                <div style="font-size: 11px; opacity: 0.7;">Average</div>
                <div style="font-size: 20px; font-weight: bold;">
                  ${this.metrics.averageOccupancy}%
                </div>
              </div>
              <div>
                <div style="font-size: 11px; opacity: 0.7;">Readings</div>
                <div style="font-size: 20px; font-weight: bold;">
                  ${this.metrics.readings.length}
                </div>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- Occupancy Chart (Simple) -->
        ${this.metrics.readings.length > 0 ? `
          <div style="
            padding: 20px;
            border: 2px solid ${borderColor};
            border-radius: 8px;
            background: ${isDark ? '#2a2a2a' : '#f8f9fa'};
            margin-bottom: 30px;
          ">
            <h3 style="margin: 0 0 15px 0;">📉 Occupancy Trend</h3>
            <div style="
              display: flex;
              align-items: flex-end;
              gap: 2px;
              height: 100px;
              background: ${isDark ? '#1a1a1a' : '#fff'};
              padding: 10px;
              border-radius: 4px;
              overflow-x: auto;
            ">
              ${this.metrics.readings.slice(-30).map(r => `
                <div style="
                  flex: 1;
                  min-width: 8px;
                  height: ${r.percentOccupied}%;
                  background: linear-gradient(to top, #e74c3c, #f39c12);
                  border-radius: 2px;
                  title: '${r.percentOccupied}%';
                " title="${r.percentOccupied}% at ${new Date(r.timestamp).toLocaleTimeString()}"></div>
              `).join('')}
            </div>
            <div style="margin-top: 10px; font-size: 10px; opacity: 0.6;">
              Showing last 30 readings
            </div>
          </div>
        ` : ''}

        <!-- Export Actions -->
        <div style="
          padding: 20px;
          border: 2px solid ${borderColor};
          border-radius: 8px;
          background: ${isDark ? '#2a2a2a' : '#f8f9fa'};
        ">
          <h3 style="margin: 0 0 15px 0;">💾 Export Data</h3>
          <div style="display: flex; gap: 10px;">
            <button id="export-json-btn" style="
              padding: 10px 16px;
              background: #3498db;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-weight: bold;
            ">
              📄 Export as JSON
            </button>
            <button id="export-csv-btn" style="
              padding: 10px 16px;
              background: #27ae60;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-weight: bold;
            ">
              📊 Export as CSV
            </button>
            <button id="clear-data-btn" style="
              padding: 10px 16px;
              background: #e74c3c;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-weight: bold;
            ">
              🗑️ Clear Data
            </button>
          </div>
        </div>
      </div>
    `;

    // Event listeners
    const exportJsonBtn = container.querySelector('#export-json-btn');
    const exportCsvBtn = container.querySelector('#export-csv-btn');
    const clearBtn = container.querySelector('#clear-data-btn');

    exportJsonBtn.onclick = () => this.exportJSON();
    exportCsvBtn.onclick = () => this.exportCSV();
    clearBtn.onclick = () => this.clearData();
  }

  async exportJSON() {
    try {
      const dataStr = JSON.stringify({
        exportedAt: new Date().toISOString(),
        metrics: this.metrics,
        readings: this.metrics.readings
      }, null, 2);

      const base64 = btoa(dataStr);
      await this.sdk.storeFile(
        `analytics-${Date.now()}.json`,
        base64,
        'application/json',
        { exportedBy: this.currentUser.username }
      );

      alert('Analytics exported as JSON!');
      this.sdk.log('JSON export completed');
    } catch (error) {
      this.sdk.error('Export failed:', error);
      alert('Export failed: ' + error.message);
    }
  }

  async exportCSV() {
    try {
      const headers = 'Timestamp,Occupied,Free,Percent Occupied\n';
      const rows = this.metrics.readings
        .map(r => `${new Date(r.timestamp).toISOString()},${r.occupied}?,${r.free},${r.percentOccupied}`)
        .join('\n');

      const csv = headers + rows;
      const base64 = btoa(csv);

      await this.sdk.storeFile(
        `analytics-${Date.now()}.csv`,
        base64,
        'text/csv',
        { exportedBy: this.currentUser.username }
      );

      alert('Analytics exported as CSV!');
      this.sdk.log('CSV export completed');
    } catch (error) {
      this.sdk.error('Export failed:', error);
      alert('Export failed: ' + error.message);
    }
  }

  async clearData() {
    if (!confirm('Clear all analytics data? This cannot be undone!')) {
      return;
    }

    try {
      this.metrics = {
        peakOccupancy: 0,
        minOccupancy: 100,
        averageOccupancy: 0,
        readings: []
      };
      await this.saveMetrics();
      this.updateUI();
      this.sdk.log('Analytics data cleared');
    } catch (error) {
      this.sdk.error('Failed to clear data:', error);
    }
  }

  updateUI() {
    if (document.querySelector('#parking-analytics')) {
      this.createUI(document.querySelector('#parking-analytics').parentElement);
    }
  }

  destroy() {
    if (this.themeUnsub) {
      this.themeUnsub();
    }
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
    this.sdk.log('Parking Analytics destroyed');
  }
}

window.ParkingAnalyticsPlugin = ParkingAnalyticsPlugin;
