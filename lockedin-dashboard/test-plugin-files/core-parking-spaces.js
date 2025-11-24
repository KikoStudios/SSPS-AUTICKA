// Parking Spaces Plugin - Visual display of parking space fullness
class TestPlugin {
  constructor() {
    this.name = "Parking Spaces Monitor";
    this.version = "1.0.0";
    this.isActive = false;
    this.spaces = [];
    this.refreshInterval = null;
    this.convexClient = null;
  }

  // Initialize the plugin
  initialize() {
    console.log(`Initializing ${this.name} v${this.version}`);
    this.isActive = true;
    this.initializeConvexClient();
    return true;
  }

  // Initialize Convex client
  initializeConvexClient() {
    try {
      if (window.convexClient) {
        this.convexClient = window.convexClient;
        console.log('Convex client initialized for parking spaces plugin');
        this.loadSpaces();
      } else {
        console.warn('Convex client not available, will retry...');
        setTimeout(() => {
          this.initializeConvexClient();
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to initialize Convex client:', error);
      setTimeout(() => {
        this.initializeConvexClient();
      }, 1000);
    }
  }

  // Load spaces from database
  async loadSpaces() {
    if (!this.convexClient) {
      console.warn('Convex client not available for loading spaces');
      // Use mock data as fallback
      this.spaces = this.getMockSpaces();
      this.startLiveUpdates();
      return;
    }

    try {
      const spaces = await this.convexClient.query('context:getAllSpaces');
      console.log('Loaded spaces from database:', spaces);
      
      // Map database spaces to UI layout positions
      if (spaces && spaces.length > 0) {
        this.spaces = this.mapSpacesToLayout(spaces);
        console.log('Using Convex database spaces');
      } else {
        console.log('No spaces found in database, using mock data');
        this.spaces = this.getMockSpaces();
      }
      this.startLiveUpdates(); // Start live updates after loading data
    } catch (error) {
      console.error('Failed to load spaces:', error);
      // Use mock data as fallback
      this.spaces = this.getMockSpaces();
      this.startLiveUpdates();
    }
  }

  // Map database spaces to the exact layout from the sketch
  mapSpacesToLayout(dbSpaces) {
    // Create a map of spaceName to isFull status
    const spaceMap = {};
    dbSpaces.forEach(space => {
      spaceMap[space.spaceName] = space.isFull;
    });

    // Layout definition matching the actual photo layout
    const layout = [
      // Top-right group (8 vertical bars) - spaces 1-8
      { spaceName: 'space1', x: 550, y: 150, type: 'vertical', width: 40, height: 80 },
      { spaceName: 'space2', x: 500, y: 150, type: 'vertical', width: 40, height: 80 },
      { spaceName: 'space3', x: 450, y: 150, type: 'vertical', width: 40, height: 80 },
      { spaceName: 'space4', x: 400, y: 150, type: 'vertical', width: 40, height: 80 },
      { spaceName: 'space5', x: 350, y: 150, type: 'vertical', width: 40, height: 80 },
      { spaceName: 'space6', x: 300, y: 150, type: 'vertical', width: 40, height: 80 },
      { spaceName: 'space7', x: 250, y: 150, type: 'vertical', width: 40, height: 80 },
      { spaceName: 'space8', x: 200, y: 150, type: 'vertical', width: 40, height: 80 },
      
      // Top-left group (2 horizontal bars) - spaces 9-10
      { spaceName: 'space9', x: 100, y: 180, type: 'horizontal', width: 80, height: 35 },
      { spaceName: 'space10', x: 100, y: 230, type: 'horizontal', width: 80, height: 35 },
      
      // Bottom-left group (5 diagonal bars) - spaces 11-15
      { spaceName: 'space11', x: 110, y: 310, type: 'diagonal', width: 100, height: 35, rotation: -15 },
      { spaceName: 'space12', x: 110, y: 370, type: 'diagonal', width: 100, height: 35, rotation: -15 },
      { spaceName: 'space13', x: 110, y: 430, type: 'diagonal', width: 100, height: 35, rotation: -15 },
      { spaceName: 'space14', x: 110, y: 490, type: 'diagonal', width: 100, height: 35, rotation: -15 },
      { spaceName: 'space15', x: 110, y: 550, type: 'diagonal', width: 100, height: 35, rotation: -15 }
    ];

    // Map layout positions to actual space data
    return layout.map(item => ({
      ...item,
      isFull: spaceMap[item.spaceName] || false,
      displayName: item.spaceName.replace('space', '')
    }));
  }

  // Fallback mock data
  getMockSpaces() {
    // Parking spaces positioned to match the map layout
    return [
      // Top horizontal row (right to left)
      { spaceName: 'space1', x: 680, y: 80, type: 'horizontal', width: 60, height: 40, isFull: false, displayName: '1' },
      { spaceName: 'space2', x: 580, y: 80, type: 'horizontal', width: 60, height: 40, isFull: false, displayName: '2' },
      { spaceName: 'space3', x: 480, y: 80, type: 'horizontal', width: 60, height: 40, isFull: true, displayName: '3' },
      { spaceName: 'space4', x: 380, y: 80, type: 'horizontal', width: 60, height: 40, isFull: true, displayName: '4' },
      { spaceName: 'space5', x: 280, y: 80, type: 'horizontal', width: 60, height: 40, isFull: true, displayName: '5' },
      { spaceName: 'space6', x: 180, y: 80, type: 'horizontal', width: 60, height: 40, isFull: true, displayName: '6' },
      { spaceName: 'space7', x: 80, y: 80, type: 'horizontal', width: 60, height: 40, isFull: true, displayName: '7' },
      { spaceName: 'space8', x: 20, y: 80, type: 'horizontal', width: 60, height: 40, isFull: true, displayName: '8' },
      
      // Left vertical column
      { spaceName: 'space9', x: 20, y: 140, type: 'vertical', width: 40, height: 60, isFull: true, displayName: '9' },
      { spaceName: 'space10', x: 20, y: 220, type: 'vertical', width: 40, height: 60, isFull: true, displayName: '10' },
      { spaceName: 'space11', x: 20, y: 300, type: 'vertical', width: 40, height: 60, isFull: true, displayName: '11' },
      { spaceName: 'space12', x: 20, y: 380, type: 'vertical', width: 40, height: 60, isFull: true, displayName: '12' },
      { spaceName: 'space13', x: 20, y: 460, type: 'vertical', width: 40, height: 60, isFull: true, displayName: '13' },
      { spaceName: 'space14', x: 20, y: 540, type: 'vertical', width: 40, height: 60, isFull: true, displayName: '14' },
      { spaceName: 'space15', x: 20, y: 620, type: 'vertical', width: 40, height: 60, isFull: false, displayName: '15' }
    ];
  }

  // Get color based on space status
  getSpaceColor(isFull) {
    return isFull ? '#DC362E' : '#4caf50'; // Red if full, Brighter green if available
  }

  // Get status text
  getSpaceStatus(isFull) {
    return isFull ? 'Full' : 'Available';
  }

  // Update space status in database
  async updateSpaceStatus(spaceName, newStatus) {
    if (!this.convexClient) {
      console.warn('Convex client not available for updating space status');
      return;
    }

    try {
      await this.convexClient.mutation('context:updateSpaceStatus', {
        spaceName: spaceName,
        isFull: newStatus
      });
      
      // Update local data
      const space = this.spaces.find(s => s.spaceName === spaceName);
      if (space) {
        space.isFull = newStatus;
      }
      
      console.log(`Updated ${spaceName} status to ${newStatus ? 'full' : 'available'}`);
    } catch (error) {
      console.error('Failed to update space status:', error);
    }
  }

  // Get plugin information
  getInfo() {
    return {
      name: this.name,
      version: this.version,
      isActive: this.isActive,
      spacesCount: this.spaces.length,
      type: 'Parking Management Plugin'
    };
  }

  // Create the plugin UI
  createUI(container) {
    // Clear container
    container.innerHTML = '';
    
    // Ensure we have spaces data
    if (!this.spaces || this.spaces.length === 0) {
      console.log('No spaces data available, loading mock data');
      this.spaces = this.getMockSpaces();
    }
    
    // Load data from database first, then create UI
    this.loadSpacesFromDatabase().then(() => {
      // Clear container again before rendering with new data
      container.innerHTML = '';
      this.renderUI(container);
    }).catch(() => {
      // Fallback to mock data if database fails
      console.log('Database failed, using mock data');
      // Clear container again before rendering with mock data
      container.innerHTML = '';
      this.spaces = this.getMockSpaces();
      this.renderUI(container);
    });
  }

  // Load spaces from database
  async loadSpacesFromDatabase() {
    if (!this.convexClient) {
      throw new Error('Convex client not available');
    }

    try {
      const spaces = await this.convexClient.query('context:getAllSpaces');
      console.log('Loaded spaces from database:', spaces);
      
      if (spaces && spaces.length > 0) {
        this.spaces = this.mapSpacesToLayout(spaces);
      } else {
        throw new Error('No spaces found in database');
      }
    } catch (error) {
      console.error('Failed to load spaces from database:', error);
      throw error;
    }
  }

  // Render the UI with current spaces data
  renderUI(container) {
    // Ensure we have spaces data
    if (!this.spaces || this.spaces.length === 0) {
      console.log('No spaces data available, loading mock data');
      this.spaces = this.getMockSpaces();
    }
    
    // Clear previous content
    container.innerHTML = '';
    this.containerElement = container; // Store for future updates
    
    // Main container following current UI standards
    const mainDiv = document.createElement('div');
    mainDiv.style.cssText = `
      padding: 0;
      font-family: 'JetBrains Mono', monospace;
      width: 100%;
      height: 100%;
      background-color: var(--white, #FEFFFC);
      color: var(--dark-blue, #0F2044);
      display: flex;
      flex-direction: row;
      overflow: hidden;
    `;
    
    // Map container with the actual map image as background - takes most of the space
    const mapContainer = document.createElement('div');
    mapContainer.style.cssText = `
      flex: 3;
      position: relative;
      background-image: url('/media/map.jpg');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    
    // Overlay container for parking spaces - scaled to match map
    const overlayContainer = document.createElement('div');
    overlayContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    `;
    
    console.log('Creating UI for spaces:', this.spaces);
    
    // Create parking spaces as button elements
    this.spaces.forEach((space, index) => {
      console.log(`Creating space ${index}:`, space);
      
      const spaceElement = document.createElement('button');
      // Color based on isFull status from database - using UI color standards
      const color = this.getSpaceColor(space.isFull);
      
      // Position and style based on space type - percentage-based positioning for responsive scaling
      const scaleX = (space.x / 800) * 100; // Convert to percentage based on map reference size
      const scaleY = (space.y / 700) * 100; // Convert to percentage based on map reference height
      const scaleWidth = (space.width / 800) * 100;
      const scaleHeight = (space.height / 700) * 100;
      
      let styles = `
        position: absolute;
        background-color: ${color};
        border: 2px solid ${space.isFull ? '#8B0000' : '#28a745'};
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 600;
        font-size: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        width: ${scaleWidth}%;
        height: ${scaleHeight}%;
        left: ${scaleX}%;
        top: ${scaleY}%;
        cursor: pointer;
        transition: all 0.3s ease;
        pointer-events: auto;
        z-index: 10;
        font-family: 'JetBrains Mono', monospace;
        outline: none;
      `;
      
      // Add rotation for diagonal spaces
      if (space.rotation) {
        styles += `transform: rotate(${space.rotation}deg);`;
      }
      
      spaceElement.style.cssText = styles;
      spaceElement.textContent = space.displayName; // Show the number
      spaceElement.title = `Space ${space.displayName}: ${space.isFull ? 'Occupied' : 'Available'}`;
      spaceElement.disabled = true; // Disable to prevent errors
      
      // Add hover effects
      spaceElement.addEventListener('mouseenter', () => {
        const currentTransform = space.rotation ? `rotate(${space.rotation}deg)` : 'none';
        spaceElement.style.transform = `${currentTransform} scale(1.05)`;
        spaceElement.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4)';
      });
      
      spaceElement.addEventListener('mouseleave', () => {
        const currentTransform = space.rotation ? `rotate(${space.rotation}deg)` : 'none';
        spaceElement.style.transform = currentTransform;
        spaceElement.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
      });
      
      // Remove click handler to prevent errors
      spaceElement.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Do nothing - just prevent errors
      });
      
      overlayContainer.appendChild(spaceElement);
    });
    
    mapContainer.appendChild(overlayContainer);
    
    // Status panel on the right side
    const statusPanel = document.createElement('div');
    statusPanel.style.cssText = `
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 30px;
      background-color: var(--dark-blue, #0F2044);
      color: var(--white, #FEFFFC);
      font-family: 'JetBrains Mono', monospace;
      gap: 20px;
    `;
    
    const fullSpaces = this.spaces.filter(s => s.isFull).length;
    const totalSpaces = this.spaces.length;
    const availableSpaces = totalSpaces - fullSpaces;
    
    // Title
    const statusTitle = document.createElement('h2');
    statusTitle.style.cssText = `
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 2px;
      text-align: center;
    `;
    statusTitle.textContent = 'STAV';
    statusPanel.appendChild(statusTitle);
    
    // Occupied count
    const occupiedDiv = document.createElement('div');
    occupiedDiv.style.cssText = `
      font-size: 32px;
      font-weight: 700;
      color: var(--red-pink, #DC362E);
      text-align: center;
    `;
    occupiedDiv.innerHTML = `
      <div>${fullSpaces}</div>
      <div style="font-size: 16px; color: var(--white, #FEFFFC);">PLNÉ</div>
    `;
    statusPanel.appendChild(occupiedDiv);
    
    // Available count
    const availableDiv = document.createElement('div');
    availableDiv.style.cssText = `
      font-size: 32px;
      font-weight: 700;
      color: #4caf50;
      text-align: center;
    `;
    availableDiv.innerHTML = `
      <div>${availableSpaces}</div>
      <div style="font-size: 16px; color: var(--white, #FEFFFC);">PRÁZDNÉ</div>
    `;
    statusPanel.appendChild(availableDiv);
    
    // Total count
    const totalDiv = document.createElement('div');
    totalDiv.style.cssText = `
      font-size: 32px;
      font-weight: 700;
      color: var(--white, #FEFFFC);
      text-align: center;
    `;
    totalDiv.innerHTML = `
      <div>${totalSpaces}</div>
      <div style="font-size: 16px; color: var(--grey, #707B90);">CELKEM</div>
    `;
    statusPanel.appendChild(totalDiv);
    
    mainDiv.appendChild(mapContainer);
    mainDiv.appendChild(statusPanel);
    
    container.appendChild(mainDiv);
  }

  // Start live updates for parking spaces
  startLiveUpdates() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    
    // Update every 5 seconds by fetching fresh data from Convex
    this.refreshInterval = setInterval(() => {
      if (this.isActive) {
        this.fetchLatestData();
      }
    }, 5000); // Update every 5 seconds
  }

  // Fetch latest data from Convex database
  async fetchLatestData() {
    if (!this.convexClient) {
      console.warn('Convex client not available for live updates');
      return;
    }

    try {
      const spaces = await this.convexClient.query('context:getAllSpaces');
      console.log('Fetched latest spaces from database:', spaces);
      
      if (spaces && spaces.length > 0) {
        const newSpaces = this.mapSpacesToLayout(spaces);
        
        // Check if data has changed
        const hasChanged = this.spaces.length !== newSpaces.length || 
          this.spaces.some((space, index) => {
            const newSpace = newSpaces[index];
            return !newSpace || space.isFull !== newSpace.isFull;
          });
        
        if (hasChanged) {
          console.log('Parking data changed, updating UI');
          this.spaces = newSpaces;
          this.refreshUI();
        }
      }
    } catch (error) {
      console.error('Failed to fetch latest data:', error);
    }
  }

  // Refresh UI method for live updates
  refreshUI() {
    if (this.containerElement) {
      this.renderUI(this.containerElement);
    }
  }

  // Cleanup function
  destroy() {
    console.log(`Destroying ${this.name}`);
    this.isActive = false;
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }
}
