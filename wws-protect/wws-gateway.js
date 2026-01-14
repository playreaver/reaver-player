/**
 * WWS Gateway v4.1 - Premium Security System
 * Beautiful UI with Font Awesome & Advanced Behavioral Analysis
 * @license MIT
 */

(function() {
  'use strict';
  
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
  const PROTTECTION_LAYER = (function() {
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
    
    // ... (остальная логика show/hide/updateStatus)
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
      // Трекинг пути мыши с координатами и временем
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
        
        // Анализ паттернов
        if (this.currentPath.length > 10) {
          this.analyzeMovementPattern();
        }
      });
      
      // Анализ времени между кликами
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
      
      // Трекинг фокуса
      let focusTime = Date.now();
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          const timeOnPage = Date.now() - focusTime;
          if (timeOnPage < 1000 && this.clickIntervals.length > 5) {
            this.isBotLike = true; // Слишком быстрое переключение
          }
        } else {
          focusTime = Date.now();
        }
      });
      
      // Проверка на отладку
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
      // Проверка на линейные движения (боты часто двигаются прямо)
      const recent = this.currentPath.slice(-10);
      const angles = [];
      
      for (let i = 2; i < recent.length; i++) {
        const v1 = { x: recent[i-1].x - recent[i-2].x, y: recent[i-1].y - recent[i-2].y };
        const v2 = { x: recent[i].x - recent[i-1].x, y: recent[i].y - recent[i-1].y };
        const angle = Math.atan2(v2.y, v2.x) - Math.atan2(v1.y, v1.x);
        angles.push(Math.abs(angle));
      }
      
      // Если углы слишком похожи (линейное движение) - это бот
      const variance = this.calculateVariance(angles);
      if (variance < 0.01) {
        this.isBotLike = true;
      }
      
      // Проверка на ровные интервалы (боты двигаются с постоянной скоростью)
      const speeds = recent.map(p => p.speed).filter(s => s > 0);
      const speedVariance = this.calculateVariance(speeds);
      if (speedVariance < 0.05 && speeds.length > 5) {
        this.isBotLike = true;
      }
    }
    
    analyzeClickPatterns() {
      if (this.clickIntervals.length < 5) return;
      
      // Боты часто кликают с ровными интервалами
      const variance = this.calculateVariance(this.clickIntervals);
      if (variance < 50 && this.clickIntervals.length > 5) {
        this.isBotLike = true;
      }
      
      // Слишком быстрые клики (< 100ms)
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
      // Проверка на открытые DevTools
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
      if (this.currentPath.length < 5) score += 0.3; // Мало движений мыши
      if (this.clickIntervals.length < 3) score += 0.2; // Мало кликов
      
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
        
        // Проверка на изменение направления
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
      
      this.log('System initialized v' + CONFIG.version);
      this.startAnalysis();
    }
    
    async startAnalysis() {
      if (this.isRunning) return;
      this.isRunning = true;
      
      PROTTECTION_LAYER.updateStatus('Collecting behavioral data...', 20, 0);
      
      try {
        // Запускаем продвинутый анализ поведения
        this.behaviorAnalyzer = new AdvancedBehaviorAnalyzer();
        
        // Даем время собрать данные
        await new Promise(resolve => setTimeout(resolve, 800));
        
        PROTTECTION_LAYER.updateStatus('Analyzing device fingerprint...', 40, 15);
        this.collectTechnicalData();
        
        PROTTECTION_LAYER.updateStatus('Scanning network patterns...', 60, 25);
        this.collectNetworkData();
        
        PROTTECTION_LAYER.updateStatus('Running behavioral AI...', 80, 35);
        this.collectBehaviorData();
        
        PROTTECTION_LAYER.updateStatus('Calculating risk score...', 90, 45);
        this.analyzeRisk();
        
        PROTTECTION_LAYER.updateStatus('Applying security policy...', 95, this.riskScore * 100);
        
        setTimeout(() => {
          PROTTECTION_LAYER.hide();
          this.executeVerdict();
        }, 600);
        
      } catch (error) {
        this.log('Analysis error:', error);
        this.verdict = 'allow_with_logging';
        this.riskScore = 0.5;
        PROTTECTION_LAYER.hide();
      }
    }
    
    // ... (методы generateUserId, generateSessionId, generateDeviceFingerprint остаются)
    
    createWidget() {
      const oldWidget = document.getElementById('wws-widget');
      if (oldWidget) oldWidget.remove();
      
      const widget = document.createElement('div');
      widget.id = 'wws-widget';
      widget.innerHTML = `
        <div class="wws-widget-icon" id="wws-widget-icon">
          <i class="fas fa-shield-alt"></i>
          <div class="wws-risk-badge" id="wws-risk-badge">0%</div>
        </div>
        <div class="wws-widget-panel" id="wws-widget-panel">
          <div class="wws-panel-header">
            <h3><i class="fas fa-fingerprint"></i> WWS Security</h3>
            <button class="wws-close-panel" id="wws-close-panel"><i class="fas fa-times"></i></button>
          </div>
          <div class="wws-panel-content">
            <div class="wws-status-section">
              <div class="wws-status-item">
                <span class="wws-label"><i class="fas fa-info-circle"></i> Status:</span>
                <span class="wws-value" id="wws-status-value">Analyzing...</span>
              </div>
              <div class="wws-status-item">
                <span class="wws-label"><i class="fas fa-chart-line"></i> Risk:</span>
                <span class="wws-value">
                  <span class="wws-risk-meter">
                    <span class="wws-risk-fill" id="wws-risk-fill"></span>
                  </span>
                  <span id="wws-risk-value">0%</span>
                </span>
              </div>
              <div class="wws-status-item">
                <span class="wws-label"><i class="fas fa-id-badge"></i> Session:</span>
                <span class="wws-value" id="wws-session-id">${this.sessionId.substring(0, 8)}...</span>
              </div>
            </div>
            
            <div class="wws-behavior-section">
              <h4><i class="fas fa-mouse"></i> Behavioral Data</h4>
              <div class="wws-stats-grid">
                <div class="wws-stat">
                  <span class="wws-stat-label"><i class="fas fa-mouse-pointer"></i> Clicks</span>
                  <span class="wws-stat-value" id="wws-clicks">0</span>
                </div>
                <div class="wws-stat">
                  <span class="wws-stat-label"><i class="fas fa-route"></i> Path</span>
                  <span class="wws-stat-value" id="wws-path">0</span>
                </div>
                <div class="wws-stat">
                  <span class="wws-stat-label"><i class="fas fa-tachometer-alt"></i> Speed</span>
                  <span class="wws-stat-value" id="wws-speed">0</span>
                </div>
                <div class="wws-stat">
                  <span class="wws-stat-label"><i class="fas fa-scroll"></i> Scroll</span>
                  <span class="wws-stat-value" id="wws-scroll">0</span>
                </div>
              </div>
            </div>
            
            <div class="wws-factors-section">
              <h4><i class="fas fa-exclamation-triangle"></i> Risk Factors</h4>
              <div class="wws-factors-list" id="wws-factors-list">
                <div class="wws-no-factors"><i class="fas fa-check-circle" style="color: #10b981;"></i> No threats detected</div>
              </div>
            </div>
            
            <div class="wws-actions-section">
              <button class="wws-action-btn" id="wws-refresh-btn"><i class="fas fa-sync-alt"></i> Refresh</button>
              <button class="wws-action-btn secondary" id="wws-details-btn"><i class="fas fa-file-alt"></i> Details</button>
            </div>
            
            <div class="wws-footer">
              <small><i class="fas fa-shield-alt"></i> WWS v${CONFIG.version} • Session: ${this.sessionId.substring(0, 12)}</small>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(widget);
      this.addWidgetStyles();
      this.initWidgetHandlers();
      this.widget = widget;
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
        
        .wws-widget-panel {
          position: absolute;
          bottom: 80px;
          left: 0;
          width: 380px;
          background: rgba(18, 18, 26, 0.98);
          backdrop-filter: blur(15px);
          border-radius: 20px;
          border: 1px solid rgba(108, 99, 255, 0.4);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);
          display: none;
          overflow: hidden;
          z-index: 999999;
          max-height: 85vh;
        }
        
        .wws-panel-header h3 {
          margin: 0;
          color: white;
          font-size: 18px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .wws-panel-header h3 i {
          color: #6C63FF;
        }
        
        .wws-close-panel {
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 18px;
          cursor: pointer;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          transition: all 0.3s;
        }
        
        .wws-close-panel:hover {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
          transform: rotate(90deg);
        }
        
        .wws-stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        
        .wws-stat {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 15px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          border-left: 3px solid #6C63FF;
        }
        
        .wws-stat-label {
          color: #94a3b8;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .wws-stat-label i {
          font-size: 14px;
          opacity: 0.7;
        }
        
        .wws-stat-value {
          color: white;
          font-weight: 700;
          font-size: 16px;
        }
        
        .wws-factor-item {
          padding: 10px 12px;
          margin-bottom: 6px;
          background: rgba(239, 68, 68, 0.1);
          border-left: 4px solid #ef4444;
          border-radius: 6px;
          font-size: 13px;
          color: #fca5a5;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .wws-factor-item.low {
          background: rgba(245, 158, 11, 0.1);
          border-left-color: #f59e0b;
          color: #fbbf24;
        }
        
        .wws-factor-item i {
          font-size: 14px;
        }
        
        .wws-action-btn {
          flex: 1;
          padding: 12px 16px;
          background: linear-gradient(135deg, #6C63FF, #36D1DC);
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 15px rgba(108, 99, 255, 0.3);
        }
        
        .wws-action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(108, 99, 255, 0.5);
        }
        
        .wws-action-btn.secondary {
          background: rgba(255, 255, 255, 0.1);
          color: #94a3b8;
          box-shadow: none;
        }
        
        .wws-action-btn.secondary:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(0);
        }
        
        .wws-action-btn i {
          font-size: 14px;
        }
        
        @media (max-width: 768px) {
          .wws-widget-panel {
            width: 340px;
            left: 10px;
          }
        }
      `;
      
      document.head.appendChild(style);
    }
    
    initWidgetHandlers() {
      const icon = document.getElementById('wws-widget-icon');
      const panel = document.getElementById('wws-widget-panel');
      const closeBtn = document.getElementById('wws-close-panel');
      
      icon.addEventListener('click', (e) => {
        e.stopImmediatePropagation();
        panel.classList.toggle('show');
      });
      
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        panel.classList.remove('show');
      });
      
      this.setupDynamicUpdates();
    }
    
    setupDynamicUpdates() {
      // Обновляем виджет каждые 3 секунды
      setInterval(() => {
        if (this.behaviorAnalyzer) {
          this.updateWidget();
        }
      }, 3000);
    }
    
    updateWidget() {
      if (!this.widget || !this.behaviorAnalyzer) return;
      
      const riskValue = Math.round(this.riskScore * 100);
      const riskBadge = document.getElementById('wws-risk-badge');
      const riskFill = document.getElementById('wws-risk-fill');
      const riskValueEl = document.getElementById('wws-risk-value');
      const statusValue = document.getElementById('wws-status-value');
      const pathEl = document.getElementById('wws-path');
      const speedEl = document.getElementById('wws-speed');
      
      let riskColor = '#10b981';
      if (this.riskScore > 0.6) riskColor = '#ef4444';
      else if (this.riskScore > 0.3) riskColor = '#f59e0b';
      
      if (riskBadge) {
        riskBadge.textContent = `${riskValue}%`;
        riskBadge.style.background = riskColor;
      }
      
      if (riskFill) {
        riskFill.style.background = riskColor;
        riskFill.style.width = `${riskValue}%`;
      }
      
      if (riskValueEl) riskValueEl.textContent = `${riskValue}%`;
      
      const statusMap = {
        'pending': '⏳ Analyzing...',
        'allow': '✅ Access Granted',
        'allow_with_logging': '📝 Monitored Session',
        'simple_captcha': '⚠️ Verified',
        'full_captcha': '🚨 High Security Check'
      };
      
      if (statusValue) statusValue.textContent = statusMap[this.verdict] || this.verdict;
      
      // Обновляем behavioral данные
      const report = this.behaviorAnalyzer.getBehaviorReport();
      if (pathEl) pathEl.textContent = report.mouseMovements;
      if (speedEl) speedEl.textContent = report.avgClickInterval.toFixed(0) + 'ms';
      
      // Обновляем факторы
      this.updateRiskFactors();
    }
    
    updateRiskFactors() {
      const factorsList = document.getElementById('wws-factors-list');
      if (!factorsList) return;
      
      if (this.riskFactors.length > 0) {
        const factorsHTML = this.riskFactors.slice(0, 4).map(factor => `
          <div class="wws-factor-item ${factor.level}">
            <i class="fas fa-${this.getIconForFactor(factor.level)}"></i>
            ${factor.message}
          </div>
        `).join('');
        
        factorsList.innerHTML = factorsHTML;
      } else {
        factorsList.innerHTML = '<div class="wws-no-factors"><i class="fas fa-check-circle" style="color: #10b981;"></i> No threat indicators</div>';
      }
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
    
    analyzeRisk() {
      let totalRisk = 0;
      this.riskFactors = [];
      
      // Продвинутый анализ поведения
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
      
      // Ботоподобное поведение
      if (report.isBotLike) {
        score += 0.6;
        factors.push({
          type: 'behavior',
          level: 'critical',
          message: 'BOT-LIKE behavior detected: robotic movement patterns',
          details: report
        });
      }
      
      // Мало движений мыши
      if (report.mouseMovements < 10) {
        score += 0.3;
        factors.push({
          type: 'behavior',
          level: 'high',
          message: 'Suspiciously low mouse activity',
          details: { mouseMovements: report.mouseMovements }
        });
      }
      
      // Слишком быстрые клики
      if (report.avgClickInterval < 150 && report.avgClickInterval > 0) {
        score += 0.25;
        factors.push({
          type: 'behavior',
          level: 'high',
          message: 'Unnaturally fast clicking detected',
          details: { avgClickInterval: report.avgClickInterval }
        });
      }
      
      // Низкая сложность пути
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
    
    // ... (остальные методы collectAllData, analyzeTechnical, analyzeReputation, analyzeNetwork, determineVerdict, executeVerdict и т.д.)
    
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
  }
  
  // ==================== INITIALIZATION ====================
  function initializeWWS() {
    if (localStorage.getItem('wws_disabled') === 'true') {
      console.log('🛡️ WWS Premium disabled by user');
      PROTTECTION_LAYER.hide();
      return;
    }
    
    if (sessionStorage.getItem('wws_session_passed') === 'true') {
      console.log('🛡️ Premium session already verified');
      const analyzer = new WWSRiskAnalyzer();
      analyzer.verdict = 'allow';
      analyzer.riskScore = 0;
      analyzer.createWidget();
      analyzer.updateWidget();
      PROTTECTION_LAYER.hide();
      return;
    }
    
    window.wwsAnalyzer = new WWSRiskAnalyzer();
  }
  
  // API
  window.WWS = {
    version: CONFIG.version,
    forceCheck: () => new WWSRiskAnalyzer(),
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
    onAccessGranted: (callback) => window.addEventListener('wws:access-granted', callback)
  };
  
  initializeWWS();
  
})();
