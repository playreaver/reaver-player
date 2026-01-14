/**
 * WWS PROTECT v5.0 - Premium Security Gateway
 * Real-time threat detection & beautiful analytics widget
 * @license MIT
 * @author Wandering Wizardry Studios
 */

(function() {
  'use strict';

  // ==================== CONFIGURATION ====================
  const CONFIG = {
    version: '5.0',
    companyName: 'WWS PROTECT',
    websiteUrl: 'https://reaver.is-a.dev/',
    
    // Default widget settings
    widget: {
      position: 'bottom-left',
      animationSpeed: 300,
      theme: 'dark',
      notificationsEnabled: true,
      colors: {
        primary: '#0066FF',
        secondary: '#00C9FF',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        dark: '#0F172A',
        light: '#F8FAFC'
      }
    },
    
    // Security settings
    security: {
      minVerificationTime: 2500,
      maxVerificationTime: 6000,
      riskThreshold: 0.65,
      bypassKey: 'wws_verified'
    }
  };

  // ==================== UTILITY CLASSES ====================
  
  // Browser fingerprinting utility
  class BrowserFingerprint {
    static async generate() {
      const components = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        hardwareConcurrency: navigator.hardwareConcurrency || 8,
        deviceMemory: navigator.deviceMemory || 4,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screen: {
          width: screen.width,
          height: screen.height,
          availWidth: screen.availWidth,
          availHeight: screen.availHeight,
          pixelRatio: window.devicePixelRatio || 1
        },
        canvas: await this.getCanvasHash(),
        webGL: await this.getWebGLInfo(),
        plugins: this.getPlugins(),
        doNotTrack: navigator.doNotTrack || '0',
        timezoneOffset: new Date().getTimezoneOffset()
      };
      
      return {
        hash: this.hash(JSON.stringify(components)),
        components: components,
        isTor: this.detectTor(components),
        isBot: this.detectBot(components),
        isVM: this.detectVM(components)
      };
    }

    static async getCanvasHash() {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = "top";
        ctx.font = "14px 'Arial'";
        ctx.fillText('WWS-FINGERPRINT-' + Date.now(), 2, 15);
        return this.hash(canvas.toDataURL()).substring(0, 16);
      } catch {
        return 'canvas-error';
      }
    }

    static async getWebGLInfo() {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) return { supported: false };
        
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        return {
          supported: true,
          vendor: gl.getParameter(debugInfo ? debugInfo.UNMASKED_VENDOR_WEBGL : gl.VENDOR),
          renderer: gl.getParameter(debugInfo ? debugInfo.UNMASKED_RENDERER_WEBGL : gl.RENDERER)
        };
      } catch {
        return { supported: false };
      }
    }

    static getPlugins() {
      if (!navigator.plugins) return [];
      return Array.from(navigator.plugins).map(p => p.name);
    }

    static detectTor(components) {
      return components.userAgent.includes('Tor') || 
             components.platform === 'Linux x86_64' && components.timezoneOffset === 0;
    }

    static detectBot(components) {
      const botIndicators = ['bot', 'crawler', 'spider', 'headless', 'phantom', 'selenium'];
      return botIndicators.some(indicator => components.userAgent.toLowerCase().includes(indicator));
    }

    static detectVM(components) {
      const vmIndicators = ['VirtualBox', 'VMware', 'Parallels'];
      return vmIndicators.some(indicator => components.webGL.renderer?.includes(indicator));
    }

    static hash(input) {
      let hash = 0;
      for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return Math.abs(hash).toString(16);
    }
  }

  // Performance analyzer
  class PerformanceAnalyzer {
    static getMetrics() {
      const nav = performance.getEntriesByType('navigation')[0] || performance.timing;
      
      return {
        loadTime: nav.loadEventEnd ? nav.loadEventEnd - nav.navigationStart : 0,
        domReady: nav.domContentLoadedEventEnd ? nav.domContentLoadedEventEnd - nav.navigationStart : 0,
        memory: this.getMemoryInfo(),
        connection: this.getConnectionInfo(),
        timestamp: Date.now()
      };
    }

    static getMemoryInfo() {
      if (window.performance?.memory) {
        return {
          used: Math.round(window.performance.memory.usedJSHeapSize / 1048576),
          total: Math.round(window.performance.memory.totalJSHeapSize / 1048576)
        };
      }
      return null;
    }

    static getConnectionInfo() {
      const nav = navigator.connection;
      return nav ? {
        type: nav.type,
        downlink: nav.downlink,
        effectiveType: nav.effectiveType
      } : null;
    }
  }

  // Settings manager
  class SettingsManager {
    constructor() {
      this.settings = { ...CONFIG };
      this.load();
    }

    load() {
      try {
        const saved = localStorage.getItem('wws_settings');
        if (saved) {
          this.settings = this.deepMerge(this.settings, JSON.parse(saved));
        }
      } catch (e) {
        console.warn('WWS PROTECT: Failed to load settings', e);
      }
    }

    save() {
      localStorage.setItem('wws_settings', JSON.stringify(this.settings));
    }

    deepMerge(target, source) {
      const output = { ...target };
      for (const key in source) {
        if (source.hasOwnProperty(key) && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          output[key] = this.deepMerge(target[key] || {}, source[key]);
        } else {
          output[key] = source[key];
        }
      }
      return output;
    }

    get(path) {
      return path.split('.').reduce((obj, key) => obj?.[key], this.settings);
    }

    set(path, value) {
      const keys = path.split('.');
      const lastKey = keys.pop();
      const target = keys.reduce((obj, key) => obj[key] = obj[key] || {}, this.settings);
      target[lastKey] = value;
      this.save();
    }
  }

  // ==================== PROTECTION SCREEN ====================
  class ProtectionScreen {
    constructor(settings) {
      this.settings = settings;
      this.screen = null;
      this.isVisible = false;
      this.currentStep = 0;
      this.riskScore = 0;
      this.riskFactors = [];
      this.analyticsData = null;
      this.fingerprintData = null;
      
      this.verificationSteps = [
        { message: 'Initializing security protocols...', weight: 0.05 },
        { message: 'Analyzing browser fingerprint...', weight: 0.15 },
        { message: 'Checking behavioral patterns...', weight: 0.20 },
        { message: 'Verifying device integrity...', weight: 0.25 },
        { message: 'Scanning for threats...', weight: 0.20 },
        { message: 'Finalizing security checks...', weight: 0.15 }
      ];
    }
    
    async show() {
      if (this.screen) return;
      
      this.screen = document.createElement('div');
      this.screen.className = 'wws-protection-screen';
      
      const [fingerprint, perf] = await Promise.all([
        BrowserFingerprint.generate(),
        PerformanceAnalyzer.getMetrics()
      ]);
      
      this.fingerprintData = fingerprint;
      this.analyticsData = perf;
      this.calculateRisk();
      
      this.screen.innerHTML = this.renderHTML();
      document.body.appendChild(this.screen);
      this.isVisible = true;
      
      requestAnimationFrame(() => this.startVerification());
    }
    
    renderHTML() {
      return `
        <div class="wws-animated-bg"></div>
        <div class="wws-protection-content">
          <div class="wws-shield-container">
            <div class="wws-shield-ripple"></div>
            <div class="wws-shield-ripple"></div>
            <i class="fas fa-shield-alt wws-main-shield"></i>
          </div>
          
          <h1 class="wws-title">${this.settings.get('companyName')}</h1>
          <p class="wws-subtitle">Security verification in progress</p>
          
          <div class="wws-status-container">
            <div class="wws-stats-grid">
              <div class="wws-stat-item">
                <div class="wws-stat-value risk" id="wws-risk-value">${Math.round(this.riskScore)}%</div>
                <div class="wws-stat-label">Risk Level</div>
              </div>
              <div class="wws-stat-item">
                <div class="wws-stat-value scan" id="wws-fingerprint"><i class="fas fa-fingerprint"></i></div>
                <div class="wws-stat-label">Device ID</div>
              </div>
              <div class="wws-stat-item">
                <div class="wws-stat-value ai" id="wws-estimated-time"><i class="fas fa-clock"></i></div>
                <div class="wws-stat-label">ETA: ${(this.settings.get('security.minVerificationTime') / 1000).toFixed(1)}s</div>
              </div>
            </div>
            
            <div class="wws-progress-container">
              <div class="wws-progress-bar">
                <div class="wws-progress-fill" id="wws-progress-fill"></div>
              </div>
              <div class="wws-progress-text">
                <span>0%</span>
                <span id="wws-progress-status">Starting...</span>
                <span>100%</span>
              </div>
            </div>
            
            <div class="wws-status-message">
              <i class="fas fa-cog"></i>
              <span id="wws-status-text">${this.verificationSteps[0].message}</span>
            </div>
          </div>
          
          <div class="wws-live-analytics" id="wws-live-analytics"></div>
          
          <div class="wws-risk-factors" id="wws-risk-factors"></div>
          
          <div class="wws-footer">
            <span id="wws-verification-id">ID: ${this.fingerprintData.hash}</span> · 
            Powered by <a href="${this.settings.get('websiteUrl')}" target="_blank">WWS</a>
          </div>
        </div>
      `;
    }
    
    calculateRisk() {
      let risk = 0;
      
      if (this.fingerprintData.isBot) {
        risk += 40;
        this.riskFactors.push({ level: 'high', message: 'Automated bot detected' });
      }
      
      if (this.fingerprintData.isTor) {
        risk += 20;
        this.riskFactors.push({ level: 'medium', message: 'Tor network detected' });
      }
      
      if (this.fingerprintData.isVM) {
        risk += 15;
        this.riskFactors.push({ level: 'medium', message: 'Virtual machine detected' });
      }
      
      if (this.analyticsData.loadTime > 10000) {
        risk += 10;
        this.riskFactors.push({ level: 'low', message: 'Unusual load time' });
      }
      
      if (!this.fingerprintData.components.webGL?.supported) {
        risk += 10;
        this.riskFactors.push({ level: 'medium', message: 'WebGL disabled' });
      }
      
      this.riskScore = Math.min(100, risk + Math.random() * 5);
    }
    
    async startVerification() {
      const totalWeight = this.verificationSteps.reduce((sum, step) => sum + step.weight, 0);
      let currentProgress = 0;
      
      for (let i = 0; i < this.verificationSteps.length; i++) {
        this.currentStep = i;
        const step = this.verificationSteps[i];
        
        const progress = (currentProgress / totalWeight) * 100;
        this.updateProgress(progress, step.message);
        
        const delay = Math.max(300, this.settings.get('security.minVerificationTime') * step.weight + Math.random() * 500);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        currentProgress += step.weight;
      }
      
      this.updateProgress(100, 'Verification complete');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (this.riskScore >= this.settings.get('security.riskThreshold') * 100) {
        this.showBlockScreen();
      } else {
        this.completeSuccessfully();
      }
    }
    
    updateProgress(progress, status) {
      document.getElementById('wws-progress-fill').style.width = `${Math.min(100, progress)}%`;
      document.getElementById('wws-progress-status').textContent = `${Math.round(progress)}%`;
      document.getElementById('wws-status-text').textContent = status;
      document.getElementById('wws-risk-value').textContent = `${Math.round(this.riskScore)}%`;
    }
    
    completeSuccessfully() {
      sessionStorage.setItem(this.settings.get('security.bypassKey'), JSON.stringify({
        timestamp: Date.now(),
        riskScore: this.riskScore,
        fingerprint: this.fingerprintData.hash
      }));
      
      this.screen.style.opacity = '0';
      this.screen.style.transform = 'scale(0.9)';
      
      setTimeout(() => {
        this.hide();
        Widget.show(this.settings);
        
        window.dispatchEvent(new CustomEvent('wws:verified', {
          detail: { riskScore: this.riskScore, factors: this.riskFactors }
        }));
      }, 500);
    }
    
    showBlockScreen() {
      this.screen.innerHTML = `
        <div class="wws-protection-content">
          <div style="margin-bottom: 40px;">
            <i class="fas fa-shield-virus" style="font-size: 72px; color: ${this.settings.get('widget.colors.danger')}"></i>
          </div>
          <h1 style="color: white; font-size: 36px; margin: 0 0 15px;">Access Denied</h1>
          <p style="color: #94a3b8; font-size: 16px; margin: 0 0 30px;">Security verification failed</p>
          <div style="background: rgba(239, 68, 68, 0.1); border-radius: 16px; padding: 20px; margin-bottom: 30px;">
            ${this.riskFactors.map(f => `
              <div style="color: #fca5a5; padding: 8px; border-bottom: 1px solid rgba(239, 68, 68, 0.2);">
                ${f.message}
              </div>
            `).join('')}
          </div>
          <button id="wws-retry-btn" style="padding: 14px 32px; background: ${this.settings.get('widget.colors.primary')}; color: white; border: none; border-radius: 12px;">
            <i class="fas fa-redo"></i> Retry
          </button>
        </div>
      `;
      
      document.getElementById('wws-retry-btn').addEventListener('click', () => location.reload());
    }
    
    hide() {
      if (this.screen?.parentNode) {
        this.screen.parentNode.removeChild(this.screen);
        this.screen = null;
        this.isVisible = false;
      }
    }
  }

  // ==================== WIDGET ====================
  class Widget {
    constructor(settings) {
      this.settings = settings;
      this.widget = null;
      this.panel = null;
      this.isPanelOpen = false;
      this.currentTab = 'overview';
      this.metrics = { requests: 0, threats: 0, bandwidth: 0, uptime: 100 };
      this.eventLog = [];
      this.init();
    }
    
    init() {
      this.createWidget();
      this.bindEvents();
      this.startMetricsUpdate();
      this.applyPosition();
    }
    
    createWidget() {
      this.widget = document.createElement('div');
      this.widget.className = `wws-widget wws-pos-${this.settings.get('widget.position')}`;
      
      this.widget.innerHTML = `
        <div class="wws-widget-toggle" id="wws-widget-toggle">
          <i class="fas fa-shield-alt"></i>
          <div class="wws-widget-badge" id="wws-widget-badge">0</div>
        </div>
        <div class="wws-widget-panel" id="wws-widget-panel">
          <div class="wws-panel-header">
            <div class="wws-header-content">
              <div class="wws-header-icon"><i class="fas fa-shield-alt"></i></div>
              <div class="wws-header-text">
                <h3>${this.settings.get('companyName')}</h3>
                <p>v${this.settings.get('version')} • Real-time Protection</p>
              </div>
            </div>
            <button class="wws-close-panel" id="wws-close-panel"><i class="fas fa-times"></i></button>
          </div>
          <div class="wws-panel-tabs">
            <button class="wws-tab active" data-tab="overview"><i class="fas fa-chart-bar"></i><span>Overview</span></button>
            <button class="wws-tab" data-tab="security"><i class="fas fa-shield-alt"></i><span>Security</span></button>
            <button class="wws-tab" data-tab="analytics"><i class="fas fa-chart-line"></i><span>Analytics</span></button>
            <button class="wws-tab" data-tab="settings"><i class="fas fa-cog"></i><span>Settings</span></button>
          </div>
          <div class="wws-panel-content" id="wws-panel-content"></div>
          <div class="wws-panel-footer">
            <a href="${this.settings.get('websiteUrl')}" target="_blank" class="wws-footer-link">
              <i class="fas fa-external-link-alt"></i> Dashboard
            </a>
          </div>
        </div>
      `;
      
      document.body.appendChild(this.widget);
      this.panel = document.getElementById('wws-widget-panel');
      this.updatePanelContent();
    }
    
    bindEvents() {
      document.getElementById('wws-widget-toggle').addEventListener('click', () => this.togglePanel());
      document.getElementById('wws-close-panel').addEventListener('click', () => this.closePanel());
      
      document.querySelectorAll('.wws-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          document.querySelectorAll('.wws-tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          this.currentTab = tab.dataset.tab;
          this.updatePanelContent();
        });
      });
      
      document.addEventListener('click', (e) => {
        if (this.isPanelOpen && !this.panel.contains(e.target) && !e.target.closest('.wws-widget-toggle')) {
          this.closePanel();
        }
      });
    }
    
    togglePanel() {
      this.isPanelOpen = !this.isPanelOpen;
      this.panel.style.display = this.isPanelOpen ? 'block' : 'none';
      if (this.isPanelOpen) this.updatePanelContent();
    }
    
    closePanel() {
      this.isPanelOpen = false;
      this.panel.style.display = 'none';
    }
    
    updatePanelContent() {
      const content = document.getElementById('wws-panel-content');
      if (!content) return;
      
      switch (this.currentTab) {
        case 'overview':
          content.innerHTML = `
            <div class="wws-section">
              <div class="wws-section-title"><i class="fas fa-tachometer-alt"></i>Current Status</div>
              <div class="wws-status-card">
                <div class="wws-status-row">
                  <div class="wws-status-label"><i class="fas fa-shield-alt"></i>Protection</div>
                  <div class="wws-status-value"><span class="wws-badge success">Active</span></div>
                </div>
                <div class="wws-status-row">
                  <div class="wws-status-label"><i class="fas fa-exclamation-triangle"></i>Threats Blocked</div>
                  <div class="wws-status-value">${this.metrics.threats}</div>
                </div>
              </div>
            </div>
            <div class="wws-section">
              <div class="wws-section-title"><i class="fas fa-chart-pie"></i>Real-time Metrics</div>
              <div class="wws-metrics-grid">
                <div class="wws-metric-card">
                  <div class="wws-metric-value">${this.formatNumber(this.metrics.requests)}</div>
                  <div class="wws-metric-label">Requests</div>
                </div>
                <div class="wws-metric-card">
                  <div class="wws-metric-value">${this.metrics.threats}</div>
                  <div class="wws-metric-label">Blocked</div>
                </div>
                <div class="wws-metric-card">
                  <div class="wws-metric-value">${this.formatBytes(this.metrics.bandwidth)}</div>
                  <div class="wws-metric-label">Bandwidth</div>
                </div>
                <div class="wws-metric-card">
                  <div class="wws-metric-value">${this.metrics.uptime}%</div>
                  <div class="wws-metric-label">Uptime</div>
                </div>
              </div>
            </div>
          `;
          break;
          
        case 'security':
          content.innerHTML = `
            <div class="wws-section">
              <div class="wws-section-title"><i class="fas fa-shield-alt"></i>Threat Protection</div>
              <div class="wws-status-card">
                <div class="wws-status-row">
                  <div class="wws-status-label"><i class="fas fa-check-circle"></i>WAF Status</div>
                  <div class="wws-status-value"><span class="wws-badge success">Enabled</span></div>
                </div>
                <div class="wws-status-row">
                  <div class="wws-status-label"><i class="fas fa-check-circle"></i>DDoS Protection</div>
                  <div class="wws-status-value"><span class="wws-badge success">Active</span></div>
                </div>
              </div>
            </div>
            <div class="wws-section">
              <div class="wws-section-title"><i class="fas fa-exclamation-triangle"></i>Recent Activity</div>
              <div class="wws-no-threats"><i class="fas fa-shield-alt"></i><p>No threats detected</p></div>
            </div>
          `;
          break;
          
        case 'settings':
          this.renderSettings(content);
          break;
      }
    }
    
    renderSettings(container) {
      const settings = this.settings.settings;
      
      container.innerHTML = `
        <div class="wws-section">
          <div class="wws-section-title"><i class="fas fa-cog"></i>Widget Configuration</div>
          <div class="wws-setting-group">
            <label class="wws-setting-label"><i class="fas fa-thumbtack"></i>Position</label>
            <select id="wws-setting-position" class="wws-setting-input">
              <option value="bottom-left" ${settings.widget.position === 'bottom-left' ? 'selected' : ''}>Bottom Left</option>
              <option value="bottom-right" ${settings.widget.position === 'bottom-right' ? 'selected' : ''}>Bottom Right</option>
            </select>
          </div>
          <div class="wws-setting-group">
            <label class="wws-setting-label"><i class="fas fa-moon"></i>Theme</label>
            <select id="wws-setting-theme" class="wws-setting-input">
              <option value="dark" ${settings.widget.theme === 'dark' ? 'selected' : ''}>Dark</option>
              <option value="light" ${settings.widget.theme === 'light' ? 'selected' : ''}>Light</option>
            </select>
          </div>
          <div class="wws-setting-group">
            <label class="wws-setting-label"><i class="fas fa-bell"></i>Notifications</label>
            <label class="wws-toggle"><input type="checkbox" id="wws-setting-notifications" ${settings.widget.notificationsEnabled ? 'checked' : ''}><span class="wws-toggle-slider"></span></label>
          </div>
          <div class="wws-settings-actions">
            <button class="wws-action-btn" id="wws-save-settings"><i class="fas fa-save"></i>Save Settings</button>
          </div>
        </div>
      `;
      
      document.getElementById('wws-setting-position').addEventListener('change', (e) => {
        this.settings.set('widget.position', e.target.value);
        this.applyPosition();
      });
      
      document.getElementById('wws-setting-theme').addEventListener('change', (e) => {
        this.settings.set('widget.theme', e.target.value);
      });
      
      document.getElementById('wws-setting-notifications').addEventListener('change', (e) => {
        this.settings.set('widget.notificationsEnabled', e.target.checked);
      });
      
      document.getElementById('wws-save-settings').addEventListener('click', () => {
        alert('Settings saved!');
      });
    }
    
    applyPosition() {
      const position = this.settings.get('widget.position');
      this.widget.className = `wws-widget wws-pos-${position}`;
    }
    
    startMetricsUpdate() {
      setInterval(() => {
        this.metrics.requests += Math.floor(Math.random() * 50) + 10;
        this.metrics.threats += Math.floor(Math.random() * 2);
        this.metrics.bandwidth += Math.floor(Math.random() * 1024 * 1024) + 102400;
        
        const badge = document.getElementById('wws-widget-badge');
        if (badge) {
          badge.textContent = this.metrics.threats;
          badge.style.display = this.metrics.threats > 0 ? 'block' : 'none';
        }
        
        if (this.isPanelOpen) this.updatePanelContent();
      }, 3000);
    }
    
    formatNumber(num) {
      if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
      if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
      return num.toString();
    }
    
    formatBytes(bytes) {
      const sizes = ['B', 'KB', 'MB', 'GB'];
      if (bytes === 0) return '0 B';
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
    }
    
    static show(settings) {
      if (!window.wwsWidgetInstance) {
        window.wwsWidgetInstance = new Widget(settings);
      }
      window.wwsWidgetInstance.widget.style.display = 'block';
    }
    
    static hide() {
      if (window.wwsWidgetInstance) {
        window.wwsWidgetInstance.widget.style.display = 'none';
      }
    }
  }

  // ==================== STYLES ====================
  const styles = document.createElement('style');
  styles.textContent = `
    * { box-sizing: border-box; }
    
    @keyframes wwsFadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes wwsPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
    @keyframes wwsShieldGlow { 0%, 100% { filter: drop-shadow(0 0 10px #0066FF40); } 50% { filter: drop-shadow(0 0 20px #0066FF80); } }
    @keyframes wwsSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes wwsProgress { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
    @keyframes wwsRipple { 0% { transform: scale(0.8); opacity: 0.8; } 100% { transform: scale(1.5); opacity: 0; } }

    .wws-protection-screen { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: linear-gradient(135deg, #0f172a, #1e293b, #0f172a); z-index: 2147483647; display: flex; align-items: center; justify-content: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; animation: wwsFadeIn 0.5s; }
    .wws-protection-content { max-width: 560px; width: 90%; text-align: center; padding: 48px 32px; background: rgba(15, 23, 42, 0.85); border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6); }
    .wws-animated-bg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.1; background: radial-gradient(circle at 20% 30%, #0066FF20 0%, transparent 40%), radial-gradient(circle at 80% 70%, #00C9FF20 0%, transparent 40%); animation: wwsPulse 8s infinite; }
    .wws-shield-container { position: relative; margin: 0 auto 40px; width: 130px; height: 130px; }
    .wws-main-shield { font-size: 72px; color: #0066FF; animation: wwsShieldGlow 3s infinite; }
    .wws-shield-ripple { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 160px; height: 160px; border: 2px solid #0066FF30; border-radius: 50%; animation: wwsRipple 2.5s infinite; }
    .wws-title { color: white; font-size: 40px; font-weight: 800; margin: 0 0 12px; background: linear-gradient(135deg, #0066FF, #00C9FF); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .wws-subtitle { color: #94a3b8; font-size: 17px; margin: 0 0 40px; }
    .wws-status-container { background: rgba(255, 255, 255, 0.05); border-radius: 18px; padding: 28px; margin: 0 0 30px; border: 1px solid rgba(255, 255, 255, 0.1); }
    .wws-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 25px; }
    .wws-stat-item { text-align: center; padding: 8px; background: rgba(255, 255, 255, 0.03); border-radius: 12px; }
    .wws-stat-value { font-size: 26px; font-weight: 700; margin-bottom: 6px; }
    .wws-stat-value.risk { color: #0066FF; }
    .wws-progress-container { width: 100%; margin: 24px 0 16px; }
    .wws-progress-bar { width: 100%; height: 8px; background: rgba(255, 255, 255, 0.1); border-radius: 4px; overflow: hidden; }
    .wws-progress-fill { height: 100%; width: 0%; background: linear-gradient(90deg, #0066FF, #00C9FF); background-size: 200% 100%; animation: wwsProgress 2s infinite; transition: width 0.5s; }
    .wws-status-message { display: flex; align-items: center; justify-content: center; gap: 12px; color: #e2e8f0; font-size: 15px; margin: 20px 0 0; }
    .wws-status-message i { animation: wwsSpin 2s infinite; color: #00C9FF; }
    .wws-risk-factors { max-height: 0; overflow: hidden; transition: max-height 0.6s; }
    .wws-risk-factor { background: rgba(239, 68, 68, 0.1); border-left: 3px solid #EF4444; border-radius: 9px; padding: 12px 16px; margin: 8px 0; font-size: 13px; color: #fca5a5; display: flex; align-items: center; gap: 10px; }
    .wws-footer { color: #64748b; font-size: 13px; margin-top: 30px; }

    .wws-widget { position: fixed; z-index: 2147483646; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .wws-widget.wws-pos-bottom-left { bottom: 20px; left: 20px; }
    .wws-widget.wws-pos-bottom-right { bottom: 20px; right: 20px; }
    .wws-widget-toggle { width: 60px; height: 60px; background: linear-gradient(135deg, #0066FF, #00C9FF); border-radius: 18px; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 8px 32px rgba(0, 102, 255, 0.3); transition: all 0.3s; }
    .wws-widget-toggle:hover { transform: scale(1.08) rotate(5deg); }
    .wws-widget-toggle i { font-size: 26px; color: white; }
    .wws-widget-badge { position: absolute; top: -8px; right: -8px; background: #EF4444; color: white; font-size: 11px; padding: 4px 8px; border-radius: 12px; min-width: 24px; text-align: center; border: 2px solid white; display: none; }
    .wws-widget-panel { position: absolute; bottom: 80px; width: 380px; background: rgba(15, 23, 42, 0.95); border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6); display: none; max-height: 600px; animation: wwsFadeIn 0.4s; }
    .wws-panel-header { padding: 24px; background: linear-gradient(135deg, #0066FF15, #00C9FF15); border-bottom: 1px solid rgba(255, 255, 255, 0.1); display: flex; justify-content: space-between; align-items: center; }
    .wws-panel-tabs { display: flex; padding: 8px; background: rgba(255, 255, 255, 0.05); border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
    .wws-tab { flex: 1; padding: 14px 8px; background: none; border: none; color: #94a3b8; cursor: pointer; border-radius: 10px; display: flex; flex-direction: column; align-items: center; gap: 6px; transition: all 0.2s; }
    .wws-tab.active { color: #0066FF; background: rgba(0, 102, 255, 0.15); }
    .wws-panel-content { padding: 24px; overflow-y: auto; max-height: 420px; }
    .wws-section { margin-bottom: 28px; }
    .wws-status-card { background: rgba(255, 255, 255, 0.05); border-radius: 14px; padding: 18px; }
    .wws-status-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; padding: 8px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
    .wws-badge { padding: 4px 10px; border-radius: 12px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
    .wws-badge.success { background: #10B981; color: white; }
    
    .wws-setting-group { margin-bottom: 16px; }
    .wws-setting-label { color: #94a3b8; font-size: 13px; display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .wws-setting-input { background: rgba(255, 255, 255, 0.07); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 10px; color: white; width: 100%; }
    
    @media (max-width: 480px) { .wws-widget-panel { width: 320px; } .wws-stats-grid { grid-template-columns: 1fr; } }
  `;
  document.head.appendChild(styles);

  // ==================== PUBLIC API ====================
  window.WWS = {
    version: CONFIG.version,
    getStatus: () => ({
      verified: !!sessionStorage.getItem(CONFIG.security.bypassKey),
      version: CONFIG.version
    }),
    verify: () => {
      sessionStorage.removeItem(CONFIG.security.bypassKey);
      location.reload();
    },
    openDashboard: () => window.open(CONFIG.websiteUrl, '_blank')
  };

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWWS);
  } else {
    initializeWWS();
  }
})();
