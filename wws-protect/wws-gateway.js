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
  
  // ==================== PHASE 1: IMMEDIATE PROTECTION LAYER ====================
  const PROTECTION_LAYER = (function() {
    const overlay = document.createElement('div');
    overlay.id = 'wws-protection-layer';
    overlay.style.cssText = `
      position: fixed !important;
      top: 0 !important; left: 0 !important;
      width: 100vw !important; height: 100vh !important;
      background: linear-gradient(135deg, #0a0a1a, #121226, #0f0f1f) !important;
      z-index: 9999999 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-family: 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif !important;
      overflow: hidden;
    `;
    
    // Анимированный фон
    const animatedBg = document.createElement('div');
    animatedBg.style.cssText = `
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      opacity: 0.1;
      background: 
        radial-gradient(circle at 20% 30%, rgba(108, 99, 255, 0.15) 0%, transparent 40%),
        radial-gradient(circle at 80% 70%, rgba(54, 209, 220, 0.15) 0%, transparent 40%);
      animation: wws-bg-pulse 8s ease-in-out infinite;
    `;
    
    overlay.innerHTML = `
      <div style="text-align: center; z-index: 10; position: relative;">
        <!-- Главная иконка с анимацией -->
        <div style="margin-bottom: 40px; position: relative;">
          <i class="fas fa-shield-alt" style="font-size: 72px; background: linear-gradient(135deg, #6C63FF, #36D1DC); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; display: inline-block; animation: wws-shield-glow 3s ease-in-out infinite;"></i>
          <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 100px; height: 100px; border: 2px solid rgba(108, 99, 255, 0.3); border-radius: 50%; animation: wws-ripple 2s ease-out infinite;"></div>
          <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 120px; height: 120px; border: 2px solid rgba(108, 99, 255, 0.1); border-radius: 50%; animation: wws-ripple 2s ease-out infinite; animation-delay: 0.5s;"></div>
        </div>
        
        <!-- Текст -->
        <h1 style="color: white; margin: 0 0 20px; font-size: 32px; font-weight: 700; letter-spacing: 1px;">SECURITY VERIFICATION</h1>
        <p id="wws-status-text" style="color: #a0a0c0; font-size: 18px; margin: 0 0 40px; font-weight: 300;">Initializing protection system...</p>
        
        <!-- Прогресс бар -->
        <div style="width: 320px; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; margin: 0 auto 30px; overflow: hidden; box-shadow: 0 0 20px rgba(108, 99, 255, 0.2);">
          <div id="wws-progress-bar" style="height: 100%; width: 0%; background: linear-gradient(90deg, #6C63FF, #36D1DC, #6C63FF); background-size: 200% 100%; transition: width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); animation: wws-gradient-flow 2s ease-in-out infinite;"></div>
        </div>
        
        <!-- Информация -->
        <div style="display: flex; justify-content: center; gap: 40px; margin-bottom: 40px;">
          <div style="text-align: center;">
            <div style="color: #6C63FF; font-size: 24px; font-weight: bold;" id="wws-risk-display">0%</div>
            <div style="color: #6c6c8c; font-size: 12px;">RISK LEVEL</div>
          </div>
          <div style="text-align: center;">
            <div style="color: #36D1DC; font-size: 24px; font-weight: bold;"><i class="fas fa-fingerprint" style="animation: wws-spin 4s linear infinite;"></i></div>
            <div style="color: #6c6c8c; font-size: 12px;">DEVICE SCAN</div>
          </div>
          <div style="text-align: center;">
            <div style="color: #a78bfa; font-size: 24px; font-weight: bold;"><i class="fas fa-brain" style="animation: wws-pulse 2s ease-in-out infinite;"></i></div>
            <div style="color: #6c6c8c; font-size: 12px;">BEHAVIORAL AI</div>
          </div>
        </div>
        
        <!-- Статус иконки -->
        <div id="wws-status-icon" style="color: #fbbf24; font-size: 14px; margin-top: 20px;">
          <i class="fas fa-cog fa-spin"></i> Analyzing...
        </div>
      </div>
      
      <!-- Стили анимации -->
      <style>
        @keyframes wws-shield-glow {
          0%, 100% { filter: drop-shadow(0 0 15px rgba(108, 99, 255, 0.5)); transform: scale(1); }
          50% { filter: drop-shadow(0 0 25px rgba(108, 99, 255, 0.8)); transform: scale(1.05); }
        }
        
        @keyframes wws-ripple {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.8; }
          100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
        }
        
        @keyframes wws-bg-pulse {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.1) rotate(180deg); }
        }
        
        @keyframes wws-gradient-flow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes wws-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes wws-pulse {
          0%, 100% { opacity: 0.7; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.1); }
        }
      </style>
    `;
    
    overlay.appendChild(animatedBg);
    
    let originalBodyContent = null;
    
    function show() {
      if (!document.body) return;
      
      if (!originalBodyContent) {
        originalBodyContent = document.body.innerHTML;
      }
      
      document.body.appendChild(overlay);
      
      const children = Array.from(document.body.children);
      children.forEach(child => {
        if (child.id !== 'wws-protection-layer') {
          child.style.display = 'none';
          child.setAttribute('data-wws-hidden', 'true');
        }
      });
    }
    
    function hide() {
      const hiddenElements = document.querySelectorAll('[data-wws-hidden="true"]');
      hiddenElements.forEach(el => {
        el.style.display = '';
        el.removeAttribute('data-wws-hidden');
      });
      
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }
    
    function updateStatus(text, progress, risk) {
      const statusEl = overlay.querySelector('#wws-status-text');
      const progressBar = overlay.querySelector('#wws-progress-bar');
      const riskDisplay = overlay.querySelector('#wws-risk-display');
      const statusIcon = overlay.querySelector('#wws-status-icon');
      
      if (statusEl) statusEl.textContent = text;
      if (progressBar) progressBar.style.width = progress + '%';
      if (riskDisplay) riskDisplay.textContent = (risk || 0) + '%';
      
      if (progress === 100) {
        statusIcon.innerHTML = '<i class="fas fa-check-circle" style="color: #10b981;"></i> Complete';
      }
    }
    
    if (document.body) show();
    else document.addEventListener('DOMContentLoaded', show);
    
    return { show, hide, updateStatus };
  })();
  
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
  
  class WWSRiskAnalyzer {
    constructor() {
      // Bind all methods to instance
      this.generateUserId = this.generateUserId.bind(this);
      this.generateSessionId = this.generateSessionId.bind(this);
      this.generateDeviceFingerprint = this.generateDeviceFingerprint.bind(this);
      this.createWidget = this.createWidget.bind(this);
      this.updateWidget = this.updateWidget.bind(this);
      this.showDetailedReport = this.showDetailedReport.bind(this);
      this.showProtectionScreen = this.showProtectionScreen.bind(this);
      this.log = this.log.bind(this);
      
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
      
      this.loadUserHistory(); // Инициализируем историю сразу
      
      this.log('System initialized v' + CONFIG.version);
      this.startAnalysis();
    }
    
    async startAnalysis() {
      if (this.isRunning) return;
      this.isRunning = true;
      
      PROTECTION_LAYER.updateStatus('Collecting behavioral data...', 20, 0);
      
      try {
        this.behaviorAnalyzer = new AdvancedBehaviorAnalyzer();
        
        await new Promise(resolve => setTimeout(resolve, 800));
        
        PROTECTION_LAYER.updateStatus('Analyzing device fingerprint...', 40, 15);
        this.collectTechnicalData();
        
        PROTECTION_LAYER.updateStatus('Scanning network patterns...', 60, 25);
        this.collectNetworkData();
        
        PROTECTION_LAYER.updateStatus('Running behavioral AI...', 80, 35);
        this.collectBehaviorData();
        
        PROTECTION_LAYER.updateStatus('Calculating risk score...', 90, 45);
        this.analyzeRisk();
        
        PROTECTION_LAYER.updateStatus('Applying security policy...', 95, this.riskScore * 100);
        
        setTimeout(() => {
          PROTECTION_LAYER.hide();
          this.executeVerdict();
        }, 600);
        
      } catch (error) {
        this.log('Analysis error:', error);
        this.verdict = 'allow_with_logging';
        this.riskScore = 0.5;
        PROTECTION_LAYER.hide();
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
        <div class="wws-widget-icon" id="wws-widget-icon" title="Click to show protection screen">
          <i class="fas fa-shield-alt"></i>
          <div class="wws-risk-badge" id="wws-risk-badge">0%</div>
        </div>
      `;
      
      document.body.appendChild(this.widget);
      this.addWidgetStyles();
      this.initWidgetHandlers();
    }
    
    addWidgetStyles() {
      const style = document.createElement('style');
      style.textContent = `
        #wws-widget {
          position: fixed;
          bottom: 20px;
          left: 20px;
          z-index: 999998;
          font-family: 'Segoe UI', Roboto, sans-serif;
          cursor: pointer;
        }
        
        .wws-widget-icon {
          width: 65px;
          height: 65px;
          background: linear-gradient(135deg, #6C63FF, #36D1DC);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 25px rgba(108, 99, 255, 0.4);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          position: relative;
          border: 2px solid rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(10px);
        }
        
        .wws-widget-icon:hover {
          transform: scale(1.1) rotate(5deg);
          box-shadow: 0 8px 35px rgba(108, 99, 255, 0.6);
        }
        
        .wws-widget-icon i {
          font-size: 28px;
          color: white;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        }
        
        .wws-risk-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          font-size: 11px;
          font-weight: 800;
          padding: 4px 8px;
          border-radius: 12px;
          min-width: 24px;
          text-align: center;
          border: 2px solid #1a1a2e;
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
          pointer-events: none;
          animation: wws-badge-pulse 2s ease-in-out infinite;
        }
        
        @keyframes wws-badge-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `;
      
      document.head.appendChild(style);
    }
    
    initWidgetHandlers() {
      const icon = document.getElementById('wws-widget-icon');
      
      icon.addEventListener('click', (e) => {
        e.stopImmediatePropagation();
        this.showProtectionScreen();
      });
      
      // Обновление виджета каждые 3 секунды
      setInterval(() => {
        if (this.behaviorAnalyzer) {
          this.behaviorData.clicks = this.behaviorAnalyzer.clickIntervals.length;
          this.behaviorData.mouseMovements = this.behaviorAnalyzer.currentPath.length;
          this.updateWidget();
        }
      }, 3000);
    }
    
    updateWidget() {
      if (!this.widget || !this.behaviorAnalyzer) return;
      
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
    
    showProtectionScreen() {
      const overlay = document.createElement('div');
      overlay.id = 'wws-protection-screen';
      overlay.style.cssText = `
        position: fixed !important;
        top: 0 !important; left: 0 !important;
        width: 100vw !important; height: 100vh !important;
        background: linear-gradient(135deg, #0a0a1a, #121226, #0f0f1f) !important;
        z-index: 9999999 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-family: 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif !important;
        overflow: hidden;
      `;
      
      const animatedBg = document.createElement('div');
      animatedBg.style.cssText = `
        position: absolute;
        top: 0; left: 0; width: 100%; height: 100%;
        opacity: 0.1;
        background: 
          radial-gradient(circle at 20% 30%, rgba(108, 99, 255, 0.15) 0%, transparent 40%),
          radial-gradient(circle at 80% 70%, rgba(54, 209, 220, 0.15) 0%, transparent 40%);
        animation: wws-bg-pulse 8s ease-in-out infinite;
      `;
      
      const report = this.behaviorAnalyzer ? this.behaviorAnalyzer.getBehaviorReport() : {};
      
      overlay.innerHTML = `
        <div style="text-align: center; z-index: 10; position: relative; max-width: 600px; padding: 40px;">
          <!-- Заголовок -->
          <div style="display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 30px;">
            <div style="position: relative;">
              <i class="fas fa-shield-alt" style="font-size: 72px; background: linear-gradient(135deg, #6C63FF, #36D1DC); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;"></i>
              <div class="wws-risk-badge" style="position: absolute; top: -15px; right: -15px; background: ${this.riskScore > 0.6 ? '#ef4444' : this.riskScore > 0.3 ? '#f59e0b' : '#10b981'};">${Math.round(this.riskScore * 100)}%</div>
            </div>
            <div style="text-align: left;">
              <h1 style="color: white; margin: 0 0 10px; font-size: 32px; font-weight: 700;">ACTIVE PROTECTION</h1>
              <p style="color: #a0a0c0; margin: 0; font-size: 16px;">WWS Gateway v${CONFIG.version} • Session: ${this.sessionId.substring(0, 12)}...</p>
            </div>
          </div>
          
          <!-- Статус -->
          <div style="background: rgba(255, 255, 255, 0.05); border-radius: 15px; padding: 25px; margin-bottom: 30px; border: 1px solid rgba(255, 255, 255, 0.1);">
            <h3 style="color: white; margin-top: 0; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
              <i class="fas fa-chart-line"></i> Security Status
            </h3>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px;">
              <div style="text-align: center; padding: 15px; background: rgba(0, 0, 0, 0.3); border-radius: 10px;">
                <div style="color: #94a3b8; font-size: 12px; margin-bottom: 5px;">VERDICT</div>
                <div style="color: ${this.verdict === 'allow' ? '#10b981' : this.verdict === 'simple_captcha' ? '#f59e0b' : '#ef4444'}; font-weight: bold; font-size: 18px;">
                  ${this.verdict.toUpperCase().replace(/_/g, ' ')}
                </div>
              </div>
              
              <div style="text-align: center; padding: 15px; background: rgba(0, 0, 0, 0.3); border-radius: 10px;">
                <div style="color: #94a3b8; font-size: 12px; margin-bottom: 5px;">USER ID</div>
                <div style="color: white; font-weight: bold; font-size: 14px; font-family: monospace;">${this.userId.substring(0, 12)}...</div>
              </div>
            </div>
            
            <!-- Прогресс бар риска -->
            <div style="margin-bottom: 15px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #94a3b8; font-size: 14px;">Risk Level</span>
                <span style="color: white; font-weight: bold;">${Math.round(this.riskScore * 100)}%</span>
              </div>
              <div style="height: 8px; background: rgba(255, 255, 255, 0.1); border-radius: 4px; overflow: hidden;">
                <div style="height: 100%; width: ${Math.round(this.riskScore * 100)}%; background: linear-gradient(90deg, ${this.riskScore > 0.6 ? '#ef4444' : this.riskScore > 0.3 ? '#f59e0b' : '#10b981'}, ${this.riskScore > 0.6 ? '#dc2626' : this.riskScore > 0.3 ? '#fbbf24' : '#34d399'});"></div>
              </div>
            </div>
          </div>
          
          <!-- Behavioral Data -->
          <div style="background: rgba(255, 255, 255, 0.05); border-radius: 15px; padding: 25px; margin-bottom: 30px; border: 1px solid rgba(255, 255, 255, 0.1);">
            <h3 style="color: white; margin-top: 0; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
              <i class="fas fa-brain"></i> Behavioral Analysis
            </h3>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
              <div style="text-align: center; padding: 15px; background: rgba(108, 99, 255, 0.1); border-radius: 10px; border-left: 4px solid #6C63FF;">
                <div style="color: #6C63FF; font-size: 24px; font-weight: bold;">${report.mouseMovements || 0}</div>
                <div style="color: #94a3b8; font-size: 12px;">Mouse Movements</div>
              </div>
              
              <div style="text-align: center; padding: 15px; background: rgba(54, 209, 220, 0.1); border-radius: 10px; border-left: 4px solid #36D1DC;">
                <div style="color: #36D1DC; font-size: 24px; font-weight: bold;">${this.behaviorData.clicks || 0}</div>
                <div style="color: #94a3b8; font-size: 12px;">Clicks</div>
              </div>
              
              <div style="text-align: center; padding: 15px; background: rgba(16, 185, 129, 0.1); border-radius: 10px; border-left: 4px solid #10b981;">
                <div style="color: #10b981; font-size: 24px; font-weight: bold;">${report.isBotLike ? 'YES' : 'NO'}</div>
                <div style="color: #94a3b8; font-size: 12px;">Bot Detection</div>
              </div>
              
              <div style="text-align: center; padding: 15px; background: rgba(245, 158, 11, 0.1); border-radius: 10px; border-left: 4px solid #f59e0b;">
                <div style="color: #f59e0b; font-size: 24px; font-weight: bold;">${report.avgClickInterval ? Math.round(report.avgClickInterval) : 0}ms</div>
                <div style="color: #94a3b8; font-size: 12px;">Avg Click Speed</div>
              </div>
            </div>
          </div>
          
          <!-- Risk Factors -->
          ${this.riskFactors.length > 0 ? `
            <div style="background: rgba(255, 255, 255, 0.05); border-radius: 15px; padding: 25px; margin-bottom: 30px; border: 1px solid rgba(255, 255, 255, 0.1);">
              <h3 style="color: white; margin-top: 0; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-exclamation-triangle"></i> Risk Factors (${this.riskFactors.length})
              </h3>
              
              <div style="max-height: 200px; overflow-y: auto;">
                ${this.riskFactors.slice(0, 5).map(factor => `
                  <div style="padding: 12px; margin-bottom: 8px; background: ${factor.level === 'critical' || factor.level === 'high' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)'}; border-left: 4px solid ${factor.level === 'critical' || factor.level === 'high' ? '#ef4444' : '#f59e0b'}; border-radius: 8px;">
                    <div style="color: white; font-weight: 500; margin-bottom: 5px;">
                      <i class="fas fa-${this.getIconForFactor(factor.level)}" style="margin-right: 8px;"></i>
                      ${factor.message}
                    </div>
                    <div style="color: #94a3b8; font-size: 12px; display: flex; justify-content: space-between;">
                      <span>${factor.type}</span>
                      <span style="background: ${factor.level === 'critical' || factor.level === 'high' ? '#ef4444' : factor.level === 'medium' ? '#f59e0b' : '#10b981'}; color: white; padding: 2px 8px; border-radius: 10px; font-size: 10px;">${factor.level}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
          
          <!-- Кнопки -->
          <div style="display: flex; gap: 15px;">
            <button id="wws-close-screen" style="flex: 1; padding: 15px; background: rgba(255, 255, 255, 0.1); color: white; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 10px; font-weight: 600; cursor: pointer; font-size: 16px; transition: all 0.3s;">
              <i class="fas fa-times"></i> Close
            </button>
            <button id="wws-refresh-scan" style="flex: 1; padding: 15px; background: linear-gradient(135deg, #6C63FF, #36D1DC); color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; font-size: 16px; transition: all 0.3s;">
              <i class="fas fa-sync-alt"></i> Rescan
            </button>
          </div>
          
          <!-- Footer -->
          <div style="margin-top: 30px; color: #64748b; font-size: 12px;">
            <i class="fas fa-shield-alt"></i> WWS Gateway Premium Protection • ${new Date().toLocaleTimeString()}
          </div>
        </div>
      `;
      
      overlay.appendChild(animatedBg);
      document.body.appendChild(overlay);
      
      // Обработчики кнопок
      overlay.querySelector('#wws-close-screen').addEventListener('click', () => {
        overlay.remove();
      });
      
      overlay.querySelector('#wws-refresh-scan').addEventListener('click', () => {
        this.collectAllData();
        this.analyzeRisk();
        this.updateWidget();
        overlay.remove();
        setTimeout(() => this.showProtectionScreen(), 300);
      });
      
      // Закрытие по клику вне окна
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.remove();
        }
      });
    }
    
    getIconForFactor(level) {
      const icons = {
        'critical': 'exclamation-circle',
        'high': 'exclamation-triangle',
        'medium': 'shield-alt',
        'low': 'info-circle',
        'trusted': 'check-circle'
      };
      return icons[level] || 'info-circle';
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
          // Инициализируем sessions если их нет
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
      
      // Убедимся, что история загружена
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
      this.createWidget();
      
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
      const overlay = this.createOverlay();
      
      const a = Math.floor(Math.random() * 9) + 1;
      const b = Math.floor(Math.random() * 9) + 1;
      const answer = a + b;
      
      overlay.innerHTML = `
        <div style="max-width: 400px; width: 90%; padding: 30px; background: rgba(18, 18, 26, 0.95); border-radius: 20px; border: 1px solid rgba(108, 99, 255, 0.3); box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5); text-align: center; backdrop-filter: blur(10px);">
          <div style="margin-bottom: 20px;">
            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #6C63FF, #36D1DC); border-radius: 15px; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px;">🤖</div>
            <h3 style="color: white; margin: 0 0 10px;">Security Check</h3>
            <p style="color: #94a3b8; font-size: 14px; margin: 0;">Complete verification to continue</p>
          </div>
          <div style="background: rgba(255, 255, 255, 0.05); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
            <div style="color: #94a3b8; margin-bottom: 10px; font-size: 14px;">Solve:</div>
            <div style="font-size: 36px; font-weight: bold; color: white; font-family: 'Courier New', monospace; margin: 15px 0;">${a} + ${b} = ?</div>
            <input type="text" id="captcha-answer" placeholder="Your answer" style="width: 100%; padding: 15px; font-size: 18px; background: rgba(255, 255, 255, 0.1); border: 2px solid rgba(255, 255, 255, 0.2); border-radius: 10px; color: white; text-align: center; outline: none;" autocomplete="off">
          </div>
          <button id="captcha-submit" style="width: 100%; padding: 16px; background: linear-gradient(135deg, #6C63FF, #36D1DC); color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; font-size: 16px;">Verify</button>
        </div>
      `;
      
      const answerInput = overlay.querySelector('#captcha-answer');
      const submitBtn = overlay.querySelector('#captcha-submit');
      answerInput.focus();
      
      const checkAnswer = () => {
        const userAnswer = parseInt(answerInput.value.trim());
        if (userAnswer === answer) {
          this.log('Captcha passed');
          this.removeOverlay();
          this.allowAccess();
        } else {
          answerInput.value = '';
          answerInput.placeholder = 'Incorrect, try again';
          answerInput.style.borderColor = '#ef4444';
          setTimeout(() => {
            answerInput.placeholder = 'Your answer';
            answerInput.style.borderColor = 'rgba(255, 255, 255, 0.2)';
          }, 2000);
        }
      };
      
      submitBtn.addEventListener('click', checkAnswer);
      answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkAnswer();
      });
    }
    
    showFullCaptcha() {
      this.showSimpleCaptcha();
    }
    
    createOverlay() {
      const oldOverlay = document.getElementById('wws-security-overlay');
      if (oldOverlay) oldOverlay.remove();
      
      const overlay = document.createElement('div');
      overlay.id = 'wws-security-overlay';
      overlay.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        background: rgba(5, 5, 15, 0.98) !important;
        backdrop-filter: blur(5px) !important;
        z-index: 999999 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        padding: 20px !important;
      `;
      
      document.body.appendChild(overlay);
      document.body.style.overflow = 'hidden';
      
      return overlay;
    }
    
    removeOverlay() {
      const overlay = document.getElementById('wws-security-overlay');
      if (overlay) overlay.remove();
      document.body.style.overflow = '';
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
      PROTECTION_LAYER.hide();
      return;
    }
    
    if (sessionStorage.getItem('wws_session_passed') === 'true') {
      console.log('🛡️ Premium session already verified');
      // Reuse existing analyzer if available
      if (!window.wwsAnalyzer) {
        window.wwsAnalyzer = new WWSRiskAnalyzer();
        // Skip analysis for pre-verified session
        window.wwsAnalyzer.verdict = 'allow';
        window.wwsAnalyzer.riskScore = 0;
        window.wwsAnalyzer.createWidget();
        window.wwsAnalyzer.updateWidget();
      } else {
        // Just ensure widget exists
        if (!document.getElementById('wws-widget')) {
          window.wwsAnalyzer.createWidget();
          window.wwsAnalyzer.updateWidget();
        }
      }
      PROTECTION_LAYER.hide();
      return;
    }
    
    window.wwsAnalyzer = new WWSRiskAnalyzer();
  }
  
  // API
  window.WWS = {
    version: CONFIG.version,
    forceCheck: () => {
      // Ensure fresh analyzer instance
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
    showProtectionScreen: () => window.wwsAnalyzer?.showProtectionScreen(),
    onAccessGranted: (callback) => window.addEventListener('wws:access-granted', callback)
  };
  
  // Initialize only once
  if (!window.wwsInitialized) {
    initializeWWS();
    window.wwsInitialized = true;
  }
  
})();
