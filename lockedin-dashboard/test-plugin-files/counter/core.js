// Counter Plugin - A simple interactive counter with Hello World
class TestPlugin {
  constructor() {
    this.name = "Counter Plugin";
    this.version = "1.0.0";
    this.isActive = false;
    this.counter = 0;
  }

  // Initialize the plugin
  initialize() {
    console.log(`Initializing ${this.name} v${this.version}`);
    this.isActive = true;
    return true;
  }

  // Increment counter
  incrementCounter() {
    this.counter++;
    return this.counter;
  }

  // Reset counter
  resetCounter() {
    this.counter = 0;
    return this.counter;
  }

  // Get plugin information
  getInfo() {
    return {
      name: this.name,
      version: this.version,
      isActive: this.isActive,
      counter: this.counter,
      type: 'Interactive UI Plugin'
    };
  }

  // Create the plugin UI
  createUI(container) {
    // Clear container
    container.innerHTML = '';
    
    // Main container
    const mainDiv = document.createElement('div');
    mainDiv.style.cssText = `
      padding: 40px;
      font-family: 'JetBrains Mono', monospace;
      max-width: 600px;
      margin: 0 auto;
      text-align: center;
    `;
    
    // Title
    const title = document.createElement('h1');
    title.textContent = '🌍 Hello World!';
    title.style.cssText = `
      font-size: 48px;
      margin-bottom: 20px;
      color: #2E7D32;
      font-weight: bold;
    `;
    
    // Subtitle
    const subtitle = document.createElement('p');
    subtitle.textContent = 'This is a test plugin created with the LockedIN Plugin System';
    subtitle.style.cssText = `
      font-size: 20px;
      color: #666;
      margin-bottom: 40px;
      line-height: 1.5;
    `;
    
    // Counter section
    const counterSection = document.createElement('div');
    counterSection.style.cssText = `
      padding: 30px;
      background-color: #e8f5e8;
      border-radius: 12px;
      border: 2px solid #4CAF50;
      margin-bottom: 30px;
    `;
    
    // Counter display
    const counterDisplay = document.createElement('h2');
    counterDisplay.textContent = `Counter: ${this.counter}`;
    counterDisplay.style.cssText = `
      font-size: 32px;
      margin-bottom: 25px;
      color: #2E7D32;
      font-weight: bold;
    `;
    
    // Button container
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
      display: flex;
      gap: 20px;
      justify-content: center;
      flex-wrap: wrap;
    `;
    
    // Increment button
    const incrementBtn = document.createElement('button');
    incrementBtn.textContent = '➕ Increment';
    incrementBtn.style.cssText = `
      padding: 15px 30px;
      font-size: 18px;
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      font-weight: bold;
      transition: all 0.2s;
      box-shadow: 0 4px 8px rgba(76, 175, 80, 0.3);
    `;
    
    incrementBtn.addEventListener('mouseenter', () => {
      incrementBtn.style.backgroundColor = '#45a049';
      incrementBtn.style.transform = 'translateY(-2px)';
    });
    
    incrementBtn.addEventListener('mouseleave', () => {
      incrementBtn.style.backgroundColor = '#4CAF50';
      incrementBtn.style.transform = 'translateY(0)';
    });
    
    incrementBtn.addEventListener('click', () => {
      this.incrementCounter();
      counterDisplay.textContent = `Counter: ${this.counter}`;
      
      // Add click animation
      incrementBtn.style.transform = 'scale(0.95)';
      setTimeout(() => {
        incrementBtn.style.transform = 'scale(1)';
      }, 100);
    });
    
    // Reset button
    const resetBtn = document.createElement('button');
    resetBtn.textContent = '🔄 Reset';
    resetBtn.style.cssText = `
      padding: 15px 30px;
      font-size: 18px;
      background-color: #ff6b6b;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      font-weight: bold;
      transition: all 0.2s;
      box-shadow: 0 4px 8px rgba(255, 107, 107, 0.3);
    `;
    
    resetBtn.addEventListener('mouseenter', () => {
      resetBtn.style.backgroundColor = '#ff5252';
      resetBtn.style.transform = 'translateY(-2px)';
    });
    
    resetBtn.addEventListener('mouseleave', () => {
      resetBtn.style.backgroundColor = '#ff6b6b';
      resetBtn.style.transform = 'translateY(0)';
    });
    
    resetBtn.addEventListener('click', () => {
      this.resetCounter();
      counterDisplay.textContent = `Counter: ${this.counter}`;
      
      // Add click animation
      resetBtn.style.transform = 'scale(0.95)';
      setTimeout(() => {
        resetBtn.style.transform = 'scale(1)';
      }, 100);
    });
    
    // Footer
    const footer = document.createElement('div');
    footer.style.cssText = `
      padding: 20px;
      background-color: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #e9ecef;
      font-size: 16px;
      color: #666;
      margin-top: 30px;
    `;
    footer.innerHTML = `<strong>${this.name}</strong> v${this.version} by Test Developer`;
    
    // Assemble the UI
    buttonContainer.appendChild(incrementBtn);
    buttonContainer.appendChild(resetBtn);
    
    counterSection.appendChild(counterDisplay);
    counterSection.appendChild(buttonContainer);
    
    mainDiv.appendChild(title);
    mainDiv.appendChild(subtitle);
    mainDiv.appendChild(counterSection);
    mainDiv.appendChild(footer);
    
    container.appendChild(mainDiv);
  }

  // Cleanup function
  destroy() {
    console.log(`Destroying ${this.name}`);
    this.isActive = false;
    this.counter = 0;
  }
}
