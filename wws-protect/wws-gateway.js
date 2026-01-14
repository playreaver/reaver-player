/**
 * WWS Gateway v4.1 - Premium Security System
 * Beautiful UI with Font Awesome & Advanced Behavioral Analysis
 * @license MIT
 */

(function() {
  'use strict';
  
  // ==================== ANTI-DOUBLE-LOAD GUARD ====================
  if (window.wwsGatewayInitialized) {
    console.log('🛡️ WWS Gateway already initialized, skipping duplicate load');
    return;
  }
  window.wwsGatewayInitialized = true;
  
  // ==================== FONT AWESOME INJECTION ====================
  (function loadFontAwesome() {
    if (!document.getElementById('wws-fontawesome')) {
      const link = document.createElement('link');
      link.id = 'wws-fontawesome';
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
      document.head.appendChild(link);
    }
  })();
  
  // ==================== MAIN SECURITY SYSTEM ====================
  
  const CONFIG = {
    debug: true,
    version: '4.1',
    
    riskThresholds: {
      LOW: 0.3, MEDIUM: 0.6, HIGH: 0.8
    },
    
    weights: {
      behavior: 0.40,
      technical: 0.30,
      reputation: 0.20,
      network: 0.10
    },
    
    memory: {
      session: 30 * 60 * 1000,
      trustedDevice: 7 * 24 * 60 * 60 * 1000,
      suspiciousActivity: 2 * 60 * 60 * 1000
    }
  };
  
  window.WWS = null;
  
  // ==================== ADVANCED BEHAVIORAL ANALYZER ====================
  
  class AdvancedBehaviorAnalyzer {
    constructor() {
      this.mousePattern = [];
      this.clickIntervals = [];
      this.movementSpeeds = [];
      this.lastClickTime = Date.now();
      this.lastMoveTime = Date.now();
      this.currentPath = [];
      this.isBotLike = false;
      
      this.startTracking();
    }
    
    startTracking() {
      document.addEventListener('mousemove', (e) => {
        const now = Date.now();
        const point = {
          x: e.clientX,
          y: e.clientY,
          t: now,
          speed: this.calculateSpeed(now)
        };
        
        this.currentPath.push(point);
        if (this.currentPath.length > 50) this.currentPath.shift();
        
        if (this.currentPath.length > 10) {
          this.analyzeMovementPattern();
        }
      });
      
      document.addEventListener('click', (e) => {
        const now = Date.now();
        const interval = now - this.lastClickTime;
        this.clickIntervals.push(interval);
        this.lastClickTime = now;
        
        if (this.clickIntervals.length > 10) {
          this.clickIntervals.shift();
          this.analyzeClickPatterns();
        }
      });
      
      let focusTime = Date.now();
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          const timeOnPage = Date.now() - focusTime;
          if (timeOnPage < 1000 && this.clickIntervals.length > 5) {
            this.isBotLike = true;
          }
        } else {
          focusTime = Date.now();
        }
      });
      
      this.detectDevTools();
    }
    
    calculateSpeed(now) {
      if (this.currentPath.length < 2) return 0;
      const last = this.currentPath[this.currentPath.length - 2];
      const distance = Math.hypot(
        this.currentPath[this.currentPath.length - 1].x - last.x,
        this.currentPath[this.currentPath.length - 1].y - last.y
      );
      return distance / (now - last.t);
    }
    
    analyzeMovementPattern() {
      const recent = this.currentPath.slice(-10);
      const angles = [];
      
      for (let i = 2; i < recent.length; i++) {
        const v1 = { x: recent[i-1].x - recent[i-2].x, y: recent[i-1].y - recent[i-2].y };
        const v2 = { x: recent[i].x - recent[i-1].x, y: recent[i].y - recent[i-1].y };
        const angle = Math.atan2(v2.y, v2.x) - Math.atan2(v1.y, v1.x);
        angles.push(Math.abs(angle));
      }
      
      const variance = this.calculateVariance(angles);
      if (variance < 0.01) {
        this.isBotLike = true;
      }
      
      const speeds = recent.map(p => p.speed).filter(s => s > 0);
      const speedVariance = this.calculateVariance(speeds);
      if (speedVariance < 0.05 && speeds.length > 5) {
        this.isBotLike = true;
      }
    }
    
    analyzeClickPatterns() {
      if (this.clickIntervals.length < 5) return;
      
      const variance = this.calculateVariance(this.clickIntervals);
      if (variance < 50 && this.clickIntervals.length > 5) {
        this.isBotLike = true;
      }
      
      const avgInterval = this.clickIntervals.reduce((a, b) => a + b) / this.clickIntervals.length;
      if (avgInterval < 100) {
        this.isBotLike = true;
      }
    }
    
    calculateVariance(arr) {
      if (arr.length === 0) return 0;
      const mean = arr.reduce((a, b) => a + b) / arr.length;
      return arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length;
    }
    
    detectDevTools() {
      let devToolsOpen = false;
      const threshold = 160;
      
      const check = () => {
        const widthThreshold = window.outerWidth - window.innerWidth > threshold;
        const heightThreshold = window.outerHeight - window.innerHeight > threshold;
        
        if (widthThreshold || heightThreshold) {
          devToolsOpen = true;
          this.isBotLike = true;
        }
      };
      
      setInterval(check, 1000);
      check();
    }
    
    getRiskScore() {
      let score = 0;
      
      if (this.isBotLike) score += 0.5;
      if (this.currentPath.length < 5) score += 0.3;
      if (this.clickIntervals.length < 3) score += 0.2;
      
      return Math.min(score, 0.8);
    }
    
    getBehaviorReport() {
      return {
        mouseMovements: this.currentPath.length,
        avgClickInterval: this.clickIntervals.length > 0 ? 
          this.clickIntervals.reduce((a, b) => a + b) / this.clickIntervals.length : 0,
        isBotLike: this.isBotLike,
        pathComplexity: this.calculatePathComplexity()
      };
    }
    
    calculatePathComplexity() {
      if (this.currentPath.length < 3) return 0;
      
      let complexity = 0;
      for (let i = 2; i < this.currentPath.length; i++) {
        const a = this.currentPath[i-2];
        const b = this.currentPath[i-1];
        const c = this.currentPath[i];
        
        const angle = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(b.y - a.y, b.x - a.x);
        if (Math.abs(angle) > 0.5) complexity++;
      }
      
      return complexity / this.currentPath.length;
    }
  }
  
  class WWSRiskAnalyzer {
    constructor() {
      this.userId = this.generateUserId();
      this.sessionId = this.generateSessionId();
      this.riskScore = 0;
      this.riskFactors = [];
      this.behaviorData = {};
      this.technicalData = {};
      this.networkData = {};
      this.behaviorAnalyzer = null;
      this.verdict = 'pending';
      this.isFirstVisit = this.checkFirstVisit();
      this.widget = null;
      this.isRunning = false;
      this.userHistory = null;
      this.currentPanel = 'overview'; // 'overview', 'behavior', 'technical', 'risks'
      
      this.loadUserHistory();
      this.log('System initialized v' + CONFIG.version);
      
      // Проверяем, не верифицирована ли уже сессия
      if (sessionStorage.getItem('wws_session_passed') === 'true') {
        this.log('Premium session already verified');
        this.verdict = 'allow';
        this.riskScore = 0;
        this.behaviorAnalyzer = new AdvancedBehaviorAnalyzer();
        this.createWidget();
        this.analyzeRisk(); // Запускаем анализ в фоне
        return;
      }
      
      // Если сессия новая - запускаем анализ в фоне
      this.startAnalysis();
      this.createWidget();
    }
    
    async startAnalysis() {
      if (this.isRunning) return;
      this.isRunning = true;
      
      try {
        this.behaviorAnalyzer = new AdvancedBehaviorAnalyzer();
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        this.collectTechnicalData();
        this.collectNetworkData();
        this.collectBehaviorData();
        this.analyzeRisk();
        
        this.executeVerdict();
        
      } catch (error) {
        this.log('Analysis error:', error);
        this.verdict = 'allow_with_logging';
        this.riskScore = 0.5;
        this.updateWidget();
      }
    }
    
    checkFirstVisit() {
      const firstVisit = localStorage.getItem('wws_first_visit');
      if (!firstVisit) {
        localStorage.setItem('wws_first_visit', Date.now().toString());
        return true;
      }
      return false;
    }
    
    generateUserId() {
      let userId = localStorage.getItem('wws_user_id');
      if (!userId) {
        userId = 'usr_' + Date.now().toString(36) + '_' + 
                Math.random().toString(36).substr(2, 8);
        localStorage.setItem('wws_user_id', userId);
      }
      return userId;
    }
    
    generateSessionId() {
      return 'sess_' + Date.now().toString(36) + '_' + 
             Math.random().toString(36).substr(2, 6);
    }
    
    generateDeviceFingerprint() {
      try {
        const data = [
          navigator.userAgent,
          navigator.language,
          screen.width + 'x' + screen.height,
          screen.colorDepth,
          navigator.platform,
          new Date().getTimezoneOffset(),
          navigator.hardwareConcurrency || 'unknown',
          navigator.deviceMemory || 'unknown'
        ].join('|');
        
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
          const char = data.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash;
        }
        return 'dev_' + Math.abs(hash).toString(36);
      } catch (e) {
        return 'dev_unknown';
      }
    }
    
    createWidget() {
      const oldWidget = document.getElementById('wws-widget');
      if (oldWidget) oldWidget.remove();
      
      this.widget = document.createElement('div');
      this.widget.id = 'wws-widget';
      this.widget.innerHTML = `
        <div class="wws-widget-icon" id="wws-widget-icon" title="WWS Protection">
          <i class="fas fa-shield-alt"></i>
          <div class="wws-risk-badge" id="wws-risk-badge">0%</div>
        </div>
        <div class="wws-widget-panel" id="wws-widget-panel">
          <div class="wws-panel-header">
            <div class="wws-header-content">
              <div class="wws-shield-icon">
                <i class="fas fa-shield-alt"></i>
              </div>
              <div class="wws-header-text">
                <div class="wws-title">WWS PROTECT</div>
                <div class="wws-subtitle">v${CONFIG.version} • ${this.sessionId.substring(0, 8)}...</div>
              </div>
            </div>
            <button class="wws-close-panel" id="wws-close-panel">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="wws-panel-tabs" id="wws-panel-tabs">
            <button class="wws-tab active" data-tab="overview">
              <i class="fas fa-home"></i>
              <span>Overview</span>
            </button>
            <button class="wws-tab" data-tab="behavior">
              <i class="fas fa-brain"></i>
              <span>Behavior</span>
            </button>
            <button class="wws-tab" data-tab="technical">
              <i class="fas fa-microchip"></i>
              <span>Technical</span>
            </button>
            <button class="wws-tab" data-tab="risks">
              <i class="fas fa-exclamation-triangle"></i>
              <span>Risks</span>
            </button>
          </div>
          
          <div class="wws-panel-content" id="wws-panel-content">
            <!-- Content will be filled dynamically -->
          </div>
          
          <div class="wws-panel-footer">
            <a href="https://reaver.is-a.dev/" target="_blank" class="wws-powered-by">
              <i class="fas fa-wand-sparkles"></i> Wandering Wizardry Studios
            </a>
          </div>
        </div>
      `;
      
      document.body.appendChild(this.widget);
      this.addWidgetStyles();
      this.initWidgetHandlers();
      this.updatePanelContent();
    }
    
    addWidgetStyles() {
      const style = document.createElement('style');
      style.textContent = `
        #wws-widget {
          position: fixed;
          bottom: 20px;
          left: 20px;
          z-index: 999998;
          font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }
        
        .wws-widget-icon {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #6C63FF, #36D1DC);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(108, 99, 255, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          border: 2px solid rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(10px);
        }
        
        .wws-widget-icon:hover {
          transform: scale(1.05) rotate(5deg);
          box-shadow: 0 6px 25px rgba(108, 99, 255, 0.5);
        }
        
        .wws-widget-icon i {
          font-size: 22px;
          color: white;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
        }
        
        .wws-risk-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          font-size: 10px;
          font-weight: 700;
          padding: 3px 6px;
          border-radius: 10px;
          min-width: 20px;
          text-align: center;
          border: 2px solid rgba(255, 255, 255, 0.9);
          box-shadow: 0 2px 6px rgba(239, 68, 68, 0.4);
          pointer-events: none;
          animation: wws-badge-pulse 2s ease-in-out infinite;
        }
        
        @keyframes wws-badge-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        .wws-widget-panel {
          position: absolute;
          bottom: 60px;
          left: 0;
          width: 320px;
          background: rgba(18, 18, 26, 0.98);
          backdrop-filter: blur(15px);
          border-radius: 16px;
          border: 1px solid rgba(108, 99, 255, 0.3);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6);
          display: none;
          overflow: hidden;
          z-index: 999999;
          max-height: 500px;
          transition: all 0.3s ease;
        }
        
        .wws-panel-header {
          padding: 16px;
          background: linear-gradient(135deg, rgba(108, 99, 255, 0.15), rgba(54, 209, 220, 0.15));
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .wws-header-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .wws-shield-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #6C63FF, #36D1DC);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .wws-shield-icon i {
          font-size: 20px;
          color: white;
        }
        
        .wws-header-text {
          flex: 1;
        }
        
        .wws-title {
          color: white;
          font-size: 16px;
          font-weight: 700;
          line-height: 1.2;
        }
        
        .wws-subtitle {
          color: #94a3b8;
          font-size: 11px;
          margin-top: 2px;
        }
        
        .wws-close-panel {
          width: 28px;
          height: 28px;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 8px;
          color: #94a3b8;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        
        .wws-close-panel:hover {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
          transform: rotate(90deg);
        }
        
        .wws-panel-tabs {
          display: flex;
          padding: 8px;
          background: rgba(255, 255, 255, 0.05);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .wws-tab {
          flex: 1;
          padding: 10px 8px;
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          transition: all 0.2s;
        }
        
        .wws-tab i {
          font-size: 14px;
        }
        
        .wws-tab span {
          font-size: 10px;
        }
        
        .wws-tab:hover {
          color: white;
          background: rgba(255, 255, 255, 0.1);
        }
        
        .wws-tab.active {
          color: #6C63FF;
          background: rgba(108, 99, 255, 0.15);
        }
        
        .wws-panel-content {
          padding: 16px;
          overflow-y: auto;
          max-height: 380px;
        }
        
        /* Scrollbar styling */
        .wws-panel-content::-webkit-scrollbar {
          width: 4px;
        }
        
        .wws-panel-content::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 2px;
        }
        
        .wws-panel-content::-webkit-scrollbar-thumb {
          background: #6C63FF;
          border-radius: 2px;
        }
        
        .wws-panel-footer {
          padding: 12px 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          text-align: center;
        }
        
        .wws-powered-by {
          color: #94a3b8;
          font-size: 11px;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: color 0.2s;
        }
        
        .wws-powered-by:hover {
          color: #6C63FF;
        }
        
        .wws-powered-by i {
          font-size: 12px;
        }
        
        /* Content styles */
        .wws-section {
          margin-bottom: 20px;
        }
        
        .wws-section:last-child {
          margin-bottom: 0;
        }
        
        .wws-section-title {
          color: white;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .wws-section-title i {
          color: #6C63FF;
          font-size: 12px;
        }
        
        .wws-status-card {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 12px;
        }
        
        .wws-status-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        
        .wws-status-row:last-child {
          margin-bottom: 0;
        }
        
        .wws-status-label {
          color: #94a3b8;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .wws-status-label i {
          font-size: 11px;
          width: 14px;
        }
        
        .wws-status-value {
          color: white;
          font-size: 12px;
          font-weight: 600;
        }
        
        .wws-risk-meter {
          width: 100%;
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          margin-top: 8px;
          overflow: hidden;
        }
        
        .wws-risk-fill {
          height: 100%;
          background: #10b981;
          width: 0%;
          transition: width 0.5s ease;
          border-radius: 3px;
        }
        
        .wws-stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-bottom: 12px;
        }
        
        .wws-stat-card {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          padding: 12px;
          text-align: center;
          border-left: 3px solid #6C63FF;
        }
        
        .wws-stat-card:nth-child(2) {
          border-left-color: #36D1DC;
        }
        
        .wws-stat-card:nth-child(3) {
          border-left-color: #10b981;
        }
        
        .wws-stat-card:nth-child(4) {
          border-left-color: #f59e0b;
        }
        
        .wws-stat-value {
          color: white;
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 4px;
        }
        
        .wws-stat-label {
          color: #94a3b8;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .wws-factor-item {
          padding: 10px 12px;
          margin-bottom: 8px;
          background: rgba(239, 68, 68, 0.1);
          border-left: 3px solid #ef4444;
          border-radius: 8px;
          font-size: 11px;
          color: #fca5a5;
        }
        
        .wws-factor-item.low {
          background: rgba(245, 158, 11, 0.1);
          border-left-color: #f59e0b;
          color: #fbbf24;
        }
        
        .wws-factor-item.medium {
          background: rgba(245, 158, 11, 0.1);
          border-left-color: #f59e0b;
          color: #fbbf24;
        }
        
        .wws-factor-item.high {
          background: rgba(239, 68, 68, 0.15);
          border-left-color: #ef4444;
          color: #fca5a5;
        }
        
        .wws-no-risks {
          text-align: center;
          color: #94a3b8;
          font-size: 11px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
        }
        
        .wws-no-risks i {
          font-size: 14px;
          margin-bottom: 6px;
          display: block;
          color: #10b981;
        }
        
        .wws-tech-item {
          padding: 10px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .wws-tech-item:last-child {
          border-bottom: none;
        }
        
        .wws-tech-label {
          color: #94a3b8;
          font-size: 11px;
          margin-bottom: 4px;
        }
        
        .wws-tech-value {
          color: white;
          font-size: 11px;
          font-weight: 500;
          word-break: break-all;
        }
        
        .wws-action-btn {
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #6C63FF, #36D1DC);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s;
          margin-top: 12px;
        }
        
        .wws-action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(108, 99, 255, 0.4);
        }
        
        .wws-verdict-badge {
          display: inline-block;
          padding: 4px 10px;
          background: #10b981;
          color: white;
          font-size: 10px;
          font-weight: 700;
          border-radius: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .wws-verdict-badge.warning {
          background: #f59e0b;
        }
        
        .wws-verdict-badge.danger {
          background: #ef4444;
        }
        
        .wws-loader {
          text-align: center;
          padding: 30px 0;
        }
        
        .wws-loader i {
          font-size: 24px;
          color: #6C63FF;
          animation: wws-spin 1s linear infinite;
        }
        
        .wws-loader-text {
          color: #94a3b8;
          font-size: 12px;
          margin-top: 10px;
        }
        
        @keyframes wws-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .wws-widget-panel {
            width: 300px;
          }
        }
      `;
      
      document.head.appendChild(style);
    }
    
    initWidgetHandlers() {
      const icon = document.getElementById('wws-widget-icon');
      const panel = document.getElementById('wws-widget-panel');
      const closeBtn = document.getElementById('wws-close-panel');
      const tabs = document.querySelectorAll('.wws-tab');
      
      // Открытие/закрытие панели
      icon.addEventListener('click', (e) => {
        e.stopPropagation();
        panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
      });
      
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        panel.style.display = 'none';
      });
      
      // Закрытие при клике вне панели
      document.addEventListener('click', (e) => {
        if (panel.style.display === 'block' && !panel.contains(e.target) && !icon.contains(e.target)) {
          panel.style.display = 'none';
        }
      });
      
      // Переключение вкладок
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          tabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          this.currentPanel = tab.dataset.tab;
          this.updatePanelContent();
        });
      });
      
      // Обновление данных каждые 5 секунд
      setInterval(() => {
        if (panel.style.display === 'block') {
          this.updatePanelContent();
        }
        this.updateWidget();
      }, 5000);
    }
    
    updateWidget() {
      if (!this.widget) return;
      
      const riskValue = Math.round(this.riskScore * 100);
      const riskBadge = document.getElementById('wws-risk-badge');
      
      let riskColor = '#10b981';
      if (this.riskScore > 0.6) riskColor = '#ef4444';
      else if (this.riskScore > 0.3) riskColor = '#f59e0b';
      
      if (riskBadge) {
        riskBadge.textContent = `${riskValue}%`;
        riskBadge.style.background = riskColor;
      }
    }
    
    updatePanelContent() {
      const content = document.getElementById('wws-panel-content');
      if (!content) return;
      
      switch (this.currentPanel) {
        case 'overview':
          this.renderOverviewPanel(content);
          break;
        case 'behavior':
          this.renderBehaviorPanel(content);
          break;
        case 'technical':
          this.renderTechnicalPanel(content);
          break;
        case 'risks':
          this.renderRisksPanel(content);
          break;
      }
    }
    
    renderOverviewPanel(container) {
      const report = this.behaviorAnalyzer ? this.behaviorAnalyzer.getBehaviorReport() : {};
      const verdictClass = this.verdict === 'allow' ? '' : this.verdict.includes('captcha') ? 'warning' : 'danger';
      
      container.innerHTML = `
        <div class="wws-section">
          <div class="wws-status-card">
            <div class="wws-status-row">
              <div class="wws-status-label">
                <i class="fas fa-shield-alt"></i>
                Status
              </div>
              <div class="wws-status-value">
                <span class="wws-verdict-badge ${verdictClass}">${this.verdict.toUpperCase().replace(/_/g, ' ')}</span>
              </div>
            </div>
            
            <div class="wws-status-row">
              <div class="wws-status-label">
                <i class="fas fa-chart-line"></i>
                Risk Level
              </div>
              <div class="wws-status-value">${Math.round(this.riskScore * 100)}%</div>
            </div>
            
            <div class="wws-risk-meter">
              <div class="wws-risk-fill" style="width: ${Math.round(this.riskScore * 100)}%; background: ${this.riskScore > 0.6 ? '#ef4444' : this.riskScore > 0.3 ? '#f59e0b' : '#10b981'}"></div>
            </div>
          </div>
        </div>
        
        <div class="wws-section">
          <div class="wws-section-title">
            <i class="fas fa-brain"></i>
            Behavioral Stats
          </div>
          
          <div class="wws-stats-grid">
            <div class="wws-stat-card">
              <div class="wws-stat-value">${report.mouseMovements || 0}</div>
              <div class="wws-stat-label">Movements</div>
            </div>
            
            <div class="wws-stat-card">
              <div class="wws-stat-value">${this.behaviorAnalyzer?.clickIntervals.length || 0}</div>
              <div class="wws-stat-label">Clicks</div>
            </div>
            
            <div class="wws-stat-card">
              <div class="wws-stat-value">${report.isBotLike ? 'YES' : 'NO'}</div>
              <div class="wws-stat-label">Bot Detected</div>
            </div>
            
            <div class="wws-stat-card">
              <div class="wws-stat-value">${report.avgClickInterval ? Math.round(report.avgClickInterval) : 0}ms</div>
              <div class="wws-stat-label">Avg Speed</div>
            </div>
          </div>
        </div>
        
        <div class="wws-section">
          <div class="wws-section-title">
            <i class="fas fa-info-circle"></i>
            Session Info
          </div>
          
          <div class="wws-status-card">
            <div class="wws-status-row">
              <div class="wws-status-label">
                <i class="fas fa-user"></i>
                User ID
              </div>
              <div class="wws-status-value">${this.userId.substring(0, 10)}...</div>
            </div>
            
            <div class="wws-status-row">
              <div class="wws-status-label">
                <i class="fas fa-id-card"></i>
                Session
              </div>
              <div class="wws-status-value">${this.sessionId.substring(0, 10)}...</div>
            </div>
            
            <div class="wws-status-row">
              <div class="wws-status-label">
                <i class="fas fa-fingerprint"></i>
                Device
              </div>
              <div class="wws-status-value">${this.generateDeviceFingerprint().substring(0, 10)}...</div>
            </div>
          </div>
        </div>
        
        <button class="wws-action-btn" id="wws-refresh-btn">
          <i class="fas fa-sync-alt"></i>
          Refresh Analysis
        </button>
      `;
      
      // Добавляем обработчик кнопки обновления
      const refreshBtn = container.querySelector('#wws-refresh-btn');
      if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
          this.collectAllData();
          this.analyzeRisk();
          this.updateWidget();
          this.updatePanelContent();
        });
      }
    }
    
    renderBehaviorPanel(container) {
      const report = this.behaviorAnalyzer ? this.behaviorAnalyzer.getBehaviorReport() : {};
      
      container.innerHTML = `
        <div class="wws-section">
          <div class="wws-section-title">
            <i class="fas fa-mouse"></i>
            Mouse Activity
          </div>
          
          <div class="wws-stats-grid">
            <div class="wws-stat-card">
              <div class="wws-stat-value">${report.mouseMovements || 0}</div>
              <div class="wws-stat-label">Total Moves</div>
            </div>
            
            <div class="wws-stat-card">
              <div class="wws-stat-value">${report.pathComplexity ? (report.pathComplexity * 100).toFixed(0) : 0}%</div>
              <div class="wws-stat-label">Complexity</div>
            </div>
          </div>
        </div>
        
        <div class="wws-section">
          <div class="wws-section-title">
            <i class="fas fa-hand-pointer"></i>
            Click Analysis
          </div>
          
          <div class="wws-stats-grid">
            <div class="wws-stat-card">
              <div class="wws-stat-value">${this.behaviorAnalyzer?.clickIntervals.length || 0}</div>
              <div class="wws-stat-label">Total Clicks</div>
            </div>
            
            <div class="wws-stat-card">
              <div class="wws-stat-value">${report.avgClickInterval ? Math.round(report.avgClickInterval) : 0}ms</div>
              <div class="wws-stat-label">Avg Interval</div>
            </div>
          </div>
        </div>
        
        <div class="wws-section">
          <div class="wws-section-title">
            <i class="fas fa-robot"></i>
            Bot Detection
          </div>
          
          <div class="wws-status-card">
            <div class="wws-status-row">
              <div class="wws-status-label">
                <i class="fas ${report.isBotLike ? 'fa-times-circle' : 'fa-check-circle'}"></i>
                Bot Pattern
              </div>
              <div class="wws-status-value" style="color: ${report.isBotLike ? '#ef4444' : '#10b981'}">
                ${report.isBotLike ? 'DETECTED' : 'CLEAN'}
              </div>
            </div>
            
            <div class="wws-status-row">
              <div class="wws-status-label">
                <i class="fas fa-tachometer-alt"></i>
                Pattern Variance
              </div>
              <div class="wws-status-value">${report.avgClickInterval ? Math.round(report.avgClickInterval) : 0}ms</div>
            </div>
          </div>
        </div>
      `;
    }
    
    renderTechnicalPanel(container) {
      container.innerHTML = `
        <div class="wws-section">
          <div class="wws-section-title">
            <i class="fas fa-desktop"></i>
            Device Info
          </div>
          
          <div class="wws-tech-item">
            <div class="wws-tech-label">Browser</div>
            <div class="wws-tech-value">${navigator.userAgent.substring(0, 40)}...</div>
          </div>
          
          <div class="wws-tech-item">
            <div class="wws-tech-label">Platform</div>
            <div class="wws-tech-value">${navigator.platform}</div>
          </div>
          
          <div class="wws-tech-item">
            <div class="wws-tech-label">Resolution</div>
            <div class="wws-tech-value">${screen.width}x${screen.height}</div>
          </div>
          
          <div class="wws-tech-item">
            <div class="wws-tech-label">Color Depth</div>
            <div class="wws-tech-value">${screen.colorDepth} bit</div>
          </div>
        </div>
        
        <div class="wws-section">
          <div class="wws-section-title">
            <i class="fas fa-network-wired"></i>
            Network
          </div>
          
          <div class="wws-tech-item">
            <div class="wws-tech-label">Connection</div>
            <div class="wws-tech-value">${navigator.connection ? navigator.connection.effectiveType : 'Unknown'}</div>
          </div>
          
          <div class="wws-tech-item">
            <div class="wws-tech-label">Language</div>
            <div class="wws-tech-value">${navigator.language}</div>
          </div>
          
          <div class="wws-tech-item">
            <div class="wws-tech-label">WebDriver</div>
            <div class="wws-tech-value">${navigator.webdriver ? 'Detected' : 'Not detected'}</div>
          </div>
          
          <div class="wws-tech-item">
            <div class="wws-tech-label">WebGL</div>
            <div class="wws-tech-value">${this.detectWebGL() ? 'Supported' : 'Not supported'}</div>
          </div>
        </div>
      `;
    }
    
    renderRisksPanel(container) {
      if (this.riskFactors.length === 0) {
        container.innerHTML = `
          <div class="wws-no-risks">
            <i class="fas fa-check-circle"></i>
            No risk factors detected
            <div style="margin-top: 8px; font-size: 10px; color: #6c6c8c;">
              Your session appears to be clean
            </div>
          </div>
        `;
        return;
      }
      
      let factorsHTML = '';
      this.riskFactors.slice(0, 6).forEach(factor => {
        factorsHTML += `
          <div class="wws-factor-item ${factor.level}">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <strong>${factor.type.toUpperCase()}</strong>
              <span style="font-size: 9px; background: ${factor.level === 'high' ? '#ef4444' : factor.level === 'medium' ? '#f59e0b' : '#10b981'}; color: white; padding: 2px 6px; border-radius: 8px;">${factor.level}</span>
            </div>
            <div style="font-size: 10px;">${factor.message}</div>
          </div>
        `;
      });
      
      container.innerHTML = `
        <div class="wws-section">
          <div class="wws-section-title">
            <i class="fas fa-exclamation-triangle"></i>
            Risk Factors (${this.riskFactors.length})
          </div>
          ${factorsHTML}
        </div>
        
        ${this.riskFactors.length > 6 ? `
          <div style="text-align: center; color: #94a3b8; font-size: 10px; margin-top: 10px;">
            + ${this.riskFactors.length - 6} more risk factors detected
          </div>
        ` : ''}
      `;
    }
    
    collectAllData() {
      this.collectBehaviorData();
      this.collectTechnicalData();
      this.collectNetworkData();
      this.loadUserHistory();
    }
    
    collectBehaviorData() {
      this.behaviorData = {
        pageLoadTime: Date.now(),
        mouseMovements: this.behaviorAnalyzer ? this.behaviorAnalyzer.currentPath.length : 0,
        clicks: this.behaviorAnalyzer ? this.behaviorAnalyzer.clickIntervals.length : 0,
        keyPresses: 0,
        scrollEvents: 0,
        referrer: document.referrer,
        directAccess: !document.referrer,
        interactionSpeed: null,
        lastActivity: Date.now()
      };
    }
    
    collectTechnicalData() {
      this.technicalData = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        vendor: navigator.vendor,
        language: navigator.language,
        languages: navigator.languages,
        screenWidth: screen.width,
        screenHeight: screen.height,
        colorDepth: screen.colorDepth,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio,
        timezone: new Date().getTimezoneOffset(),
        cookiesEnabled: navigator.cookieEnabled,
        plugins: navigator.plugins ? navigator.plugins.length : 0,
        webgl: this.detectWebGL(),
        canvasFingerprint: this.getCanvasFingerprint(),
        webdriver: navigator.webdriver,
        hasChrome: typeof window.chrome !== 'undefined'
      };
    }
    
    collectNetworkData() {
      this.networkData = {
        connection: navigator.connection ? {
          effectiveType: navigator.connection.effectiveType,
          rtt: navigator.connection.rtt,
          downlink: navigator.connection.downlink,
          saveData: navigator.connection.saveData
        } : null,
        pageLoadPerformance: performance.timing ? {
          navigationStart: performance.timing.navigationStart,
          loadEventEnd: performance.timing.loadEventEnd,
          domComplete: performance.timing.domComplete
        } : null
      };
    }
    
    loadUserHistory() {
      try {
        const history = localStorage.getItem(`wws_history_${this.userId}`);
        if (history) {
          this.userHistory = JSON.parse(history);
          if (!this.userHistory.sessions) {
            this.userHistory.sessions = [];
          }
          const cutoff = Date.now() - (30 * 24 * 60 * 60 * 1000);
          this.userHistory.sessions = this.userHistory.sessions.filter(
            s => s.timestamp > cutoff
          );
        } else {
          this.userHistory = {
            userId: this.userId,
            firstSeen: Date.now(),
            sessions: [],
            riskHistory: [],
            incidents: 0,
            trusted: false
          };
        }
      } catch (e) {
        this.userHistory = {
          userId: this.userId,
          firstSeen: Date.now(),
          sessions: [],
          riskHistory: [],
          incidents: 0,
          trusted: false
        };
      }
    }
    
    analyzeRisk() {
      let totalRisk = 0;
      this.riskFactors = [];
      
      const behaviorRisk = this.analyzeAdvancedBehavior();
      totalRisk += behaviorRisk.score * CONFIG.weights.behavior;
      this.riskFactors.push(...behaviorRisk.factors);
      
      const technicalRisk = this.analyzeTechnical();
      totalRisk += technicalRisk.score * CONFIG.weights.technical;
      this.riskFactors.push(...technicalRisk.factors);
      
      const reputationRisk = this.analyzeReputation();
      totalRisk += reputationRisk.score * CONFIG.weights.reputation;
      this.riskFactors.push(...reputationRisk.factors);
      
      const networkRisk = this.analyzeNetwork();
      totalRisk += networkRisk.score * CONFIG.weights.network;
      this.riskFactors.push(...networkRisk.factors);
      
      if (this.isFirstVisit) {
        totalRisk = Math.max(totalRisk, 0.4);
        this.riskFactors.push({
          type: 'system',
          level: 'medium',
          message: 'First visit to domain - establishing trust profile',
          details: { firstVisit: true }
        });
      }
      
      this.riskScore = Math.min(1, totalRisk);
      this.determineVerdict();
      this.saveAnalysisResults();
    }
    
    analyzeAdvancedBehavior() {
      let score = 0;
      const factors = [];
      
      if (!this.behaviorAnalyzer) return { score, factors };
      
      const report = this.behaviorAnalyzer.getBehaviorReport();
      
      if (report.isBotLike) {
        score += 0.6;
        factors.push({
          type: 'behavior',
          level: 'critical',
          message: 'BOT-LIKE behavior detected: robotic movement patterns',
          details: report
        });
      }
      
      if (report.mouseMovements < 10) {
        score += 0.3;
        factors.push({
          type: 'behavior',
          level: 'high',
          message: 'Suspiciously low mouse activity',
          details: { mouseMovements: report.mouseMovements }
        });
      }
      
      if (report.avgClickInterval < 150 && report.avgClickInterval > 0) {
        score += 0.25;
        factors.push({
          type: 'behavior',
          level: 'high',
          message: 'Unnaturally fast clicking detected',
          details: { avgClickInterval: report.avgClickInterval }
        });
      }
      
      if (report.pathComplexity < 0.1) {
        score += 0.2;
        factors.push({
          type: 'behavior',
          level: 'medium',
          message: 'Linear mouse movement patterns (bot indicator)',
          details: { complexity: report.pathComplexity }
        });
      }
      
      return { score: Math.min(1, score), factors };
    }
    
    analyzeTechnical() {
      let score = 0;
      const factors = [];
      const ua = this.technicalData.userAgent.toLowerCase();
      
      const botPatterns = [
        /bot/i, /crawl/i, /spider/i, /scrape/i,
        /headless/i, /phantom/i, /selenium/i,
        /puppeteer/i, /playwright/i, /cheerio/i
      ];
      
      for (const pattern of botPatterns) {
        if (pattern.test(ua)) {
          score += 0.6;
          factors.push({
            type: 'technical',
            level: 'high',
            message: 'Bot User-Agent detected: ' + ua.match(pattern)[0],
            details: { userAgent: ua }
          });
          break;
        }
      }
      
      if (navigator.webdriver === true) {
        score += 0.8;
        factors.push({
          type: 'technical',
          level: 'critical',
          message: 'WebDriver detected (headless browser)',
          details: { webdriver: true }
        });
      }
      
      if (this.technicalData.plugins === 0 && !ua.includes('mobile')) {
        score += 0.3;
        factors.push({
          type: 'technical',
          level: 'medium',
          message: 'No browser plugins detected',
          details: { plugins: 0 }
        });
      }
      
      return { score: Math.min(1, score), factors };
    }
    
    analyzeReputation() {
      let score = 0;
      const factors = [];
      
      if (!this.userHistory) {
        this.loadUserHistory();
      }
      
      if (!this.userHistory.sessions || this.userHistory.sessions.length < 2) {
        score += 0.2;
        factors.push({
          type: 'reputation',
          level: 'low',
          message: 'New or infrequent user',
          details: { sessions: this.userHistory.sessions?.length || 0 }
        });
      }
      
      if (this.userHistory.incidents > 0) {
        score += Math.min(0.5, this.userHistory.incidents * 0.1);
        factors.push({
          type: 'reputation',
          level: 'medium',
          message: `Previous security incidents: ${this.userHistory.incidents}`,
          details: { incidents: this.userHistory.incidents }
        });
      }
      
      if (this.userHistory.trusted) {
        score -= 0.3;
        factors.push({
          type: 'reputation',
          level: 'trusted',
          message: 'Trusted device verified',
          details: { trusted: true }
        });
      }
      
      return { score: Math.max(0, Math.min(1, score)), factors };
    }
    
    analyzeNetwork() {
      let score = 0;
      const factors = [];
      
      if (this.networkData.connection && this.networkData.connection.rtt > 500) {
        score += 0.2;
        factors.push({
          type: 'network',
          level: 'medium',
          message: 'High network latency (possible proxy/VPN)',
          details: { rtt: this.networkData.connection.rtt + 'ms' }
        });
      }
      
      return { score: Math.min(1, score), factors };
    }
    
    detectWebGL() {
      try {
        const canvas = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && 
                 (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
      } catch (e) {
        return false;
      }
    }
    
    getCanvasFingerprint() {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = 200;
        canvas.height = 30;
        
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = '#f60';
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = '#069';
        ctx.fillText('WWS Security', 2, 15);
        ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
        ctx.fillText('WWS Security', 4, 17);
        
        return canvas.toDataURL().substring(22, 50);
      } catch (e) {
        return 'error';
      }
    }
    
    determineVerdict() {
      let verdict = 'allow';
      
      if (this.isFirstVisit) {
        if (this.riskScore >= CONFIG.riskThresholds.HIGH) {
          verdict = 'full_captcha';
        } else if (this.riskScore >= CONFIG.riskThresholds.LOW) {
          verdict = 'simple_captcha';
        } else {
          verdict = 'allow_with_logging';
        }
      } 
      else if (this.riskScore >= CONFIG.riskThresholds.HIGH) {
        verdict = 'full_captcha';
      } 
      else if (this.riskScore >= CONFIG.riskThresholds.MEDIUM) {
        verdict = 'simple_captcha';
      }
      else if (this.riskScore >= CONFIG.riskThresholds.LOW) {
        verdict = 'allow_with_logging';
      }
      else {
        verdict = 'allow';
      }
      
      this.verdict = verdict;
      this.log(`Verdict: ${verdict} (risk: ${(this.riskScore * 100).toFixed(1)}%)`);
    }
    
    executeVerdict() {
      this.updateWidget();
      
      switch (this.verdict) {
        case 'full_captcha':
          this.showFullCaptcha();
          break;
        case 'simple_captcha':
          this.showSimpleCaptcha();
          break;
        default:
          this.allowAccess();
          break;
      }
    }
    
    showSimpleCaptcha() {
      // В фоновом режиме просто логируем
      this.log('Captcha required but running in background mode');
      this.allowAccess();
    }
    
    showFullCaptcha() {
      this.showSimpleCaptcha();
    }
    
    allowAccess() {
      this.log('Access granted to site');
      this.saveSession();
      this.updateWidget();
      
      if (this.riskScore < 0.2) {
        this.markAsTrusted();
      }
      
      const event = new CustomEvent('wws:access-granted', {
        detail: {
          userId: this.userId,
          sessionId: this.sessionId,
          riskScore: this.riskScore,
          verdict: this.verdict
        }
      });
      window.dispatchEvent(event);
    }
    
    saveSession() {
      const session = {
        sessionId: this.sessionId,
        timestamp: Date.now(),
        riskScore: this.riskScore,
        verdict: this.verdict,
        factors: this.riskFactors
      };
      
      if (!this.userHistory.sessions) this.userHistory.sessions = [];
      this.userHistory.sessions.push(session);
      
      if (this.userHistory.sessions.length > 50) {
        this.userHistory.sessions = this.userHistory.sessions.slice(-50);
      }
      
      try {
        localStorage.setItem(`wws_history_${this.userId}`, JSON.stringify(this.userHistory));
        sessionStorage.setItem('wws_session_passed', 'true');
      } catch (e) {
        this.log('Session save error:', e);
      }
    }
    
    markAsTrusted() {
      this.userHistory.trusted = true;
      this.userHistory.trustedSince = Date.now();
      this.userHistory.trustedDevice = this.generateDeviceFingerprint();
      
      try {
        localStorage.setItem(`wws_history_${this.userId}`, JSON.stringify(this.userHistory));
      } catch (e) {
        this.log('Trust save error:', e);
      }
    }
    
    saveAnalysisResults() {
      const analysis = {
        userId: this.userId,
        sessionId: this.sessionId,
        timestamp: Date.now(),
        riskScore: this.riskScore,
        verdict: this.verdict,
        factors: this.riskFactors,
        behavior: this.behaviorAnalyzer ? this.behaviorAnalyzer.getBehaviorReport() : null,
        technical: {
          ua: this.technicalData.userAgent,
          fp: this.generateDeviceFingerprint()
        }
      };
      
      if (CONFIG.debug) {
        console.log('🛡️ WWS Premium Analysis:', analysis);
      }
      
      try {
        const analyses = JSON.parse(localStorage.getItem('wws_analyses') || '[]');
        analyses.push(analysis);
        localStorage.setItem('wws_analyses', JSON.stringify(analyses.slice(-30)));
      } catch (e) {}
    }
    
    log(message, data) {
      if (CONFIG.debug) {
        console.log(`🛡️ WWS v${CONFIG.version}: ${message}`, data || '');
      }
    }
  }
  
  // ==================== INITIALIZATION ====================
  function initializeWWS() {
    if (localStorage.getItem('wws_disabled') === 'true') {
      console.log('🛡️ WWS Premium disabled by user');
      return;
    }
    
    if (sessionStorage.getItem('wws_session_passed') === 'true') {
      console.log('🛡️ Premium session already verified');
      if (!window.wwsAnalyzer) {
        window.wwsAnalyzer = new WWSRiskAnalyzer();
      }
      return;
    }
    
    window.wwsAnalyzer = new WWSRiskAnalyzer();
  }
  
  // API
  window.WWS = {
    version: CONFIG.version,
    forceCheck: () => {
      window.wwsAnalyzer = new WWSRiskAnalyzer();
      return window.wwsAnalyzer;
    },
    markAsTrusted: () => {
      const userId = localStorage.getItem('wws_user_id');
      if (userId) {
        try {
          const history = JSON.parse(localStorage.getItem(`wws_history_${userId}`) || '{}');
          history.trusted = true;
          history.trustedSince = Date.now();
          localStorage.setItem(`wws_history_${userId}`, JSON.stringify(history));
        } catch (e) {}
      }
    },
    getRiskScore: () => window.wwsAnalyzer?.riskScore || 0,
    getBehaviorReport: () => window.wwsAnalyzer?.behaviorAnalyzer?.getBehaviorReport() || null,
    showPanel: () => {
      const panel = document.getElementById('wws-widget-panel');
      if (panel) panel.style.display = 'block';
    },
    onAccessGranted: (callback) => window.addEventListener('wws:access-granted', callback)
  };
  
  // Initialize only once
  if (!window.wwsInitialized) {
    initializeWWS();
    window.wwsInitialized = true;
  }
  
})();
