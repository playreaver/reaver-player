/**
 * WWS Gateway v4.0 - Intelligent Security System with Pre-Loading Protection
 * Shows protection overlay BEFORE any site content is visible
 * @license MIT
 */

(function() {
  'use strict';
  
  // ==================== PHASE 1: IMMEDIATE PROTECTION LAYER ====================
  // Создаем защитный экран сразу, даже до полной загрузки скрипта
  const PROTTECTION_LAYER = (function() {
    const overlay = document.createElement('div');
    overlay.id = 'wws-protection-layer';
    overlay.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      background: #0a0a0f !important;
      z-index: 9999999 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    `;
    
    overlay.innerHTML = `
      <div style="text-align: center; color: white;">
        <div style="font-size: 48px; margin-bottom: 30px; animation: wws-pulse 2s infinite;">🛡️</div>
        <h2 style="margin-bottom: 15px; font-size: 24px;">Security Check in Progress...</h2>
        <p style="color: #94a3b8; margin-bottom: 30px;">Please wait while we verify your session</p>
        <div style="width: 300px; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; margin: 0 auto; overflow: hidden;">
          <div id="wws-progress-bar" style="height: 100%; width: 0%; background: linear-gradient(90deg, #6C63FF, #36D1DC); transition: width 0.3s;"></div>
        </div>
        <div id="wws-status-text" style="margin-top: 20px; font-size: 14px; color: #94a3b8;">Initializing...</div>
      </div>
      <style>
        @keyframes wws-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
      </style>
    `;
    
    // Сохраняем оригинальный контент
    let originalBodyContent = null;
    let originalTitle = document.title;
    
    function show() {
      if (!document.body) return;
      
      // Сохраняем контент перед его скрытием
      if (!originalBodyContent) {
        originalBodyContent = document.body.innerHTML;
      }
      
      // Добавляем overlay
      document.body.appendChild(overlay);
      
      // Скрываем весь оригинальный контент, но оставляем overlay видимым
      const children = Array.from(document.body.children);
      children.forEach(child => {
        if (child.id !== 'wws-protection-layer') {
          child.style.display = 'none';
          child.setAttribute('data-wws-hidden', 'true');
        }
      });
    }
    
    function hide() {
      // Показываем скрытый контент
      const hiddenElements = document.querySelectorAll('[data-wws-hidden="true"]');
      hiddenElements.forEach(el => {
        el.style.display = '';
        el.removeAttribute('data-wws-hidden');
      });
      
      // Удаляем overlay
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }
    
    function updateStatus(text, progress) {
      const statusEl = overlay.querySelector('#wws-status-text');
      const progressBar = overlay.querySelector('#wws-progress-bar');
      if (statusEl) statusEl.textContent = text;
      if (progressBar) progressBar.style.width = progress + '%';
    }
    
    // Показываем защитный экран немедленно
    if (document.body) {
      show();
    } else {
      document.addEventListener('DOMContentLoaded', show);
    }
    
    return { show, hide, updateStatus };
  })();
  
  // ==================== PHASE 2: MAIN SECURITY SYSTEM ====================
  
  const CONFIG = {
    debug: true,
    version: '4.0',
    
    riskThresholds: {
      LOW: 0.3,
      MEDIUM: 0.6,
      HIGH: 0.8
    },
    
    weights: {
      behavior: 0.35,
      technical: 0.35,
      reputation: 0.20,
      network: 0.10
    },
    
    memory: {
      session: 30 * 60 * 1000,
      trustedDevice: 7 * 24 * 60 * 60 * 1000,
      suspiciousActivity: 2 * 60 * 60 * 1000
    },
    
    widget: {
      position: 'bottom-left',
      autoHide: false,
      showDetails: true
    }
  };
  
  // Глобальная переменная для доступа из консоли
  window.WWS = null;
  
  class WWSRiskAnalyzer {
    constructor() {
      PROTTECTION_LAYER.updateStatus('Initializing security system...', 10);
      
      this.userId = this.generateUserId();
      this.sessionId = this.generateSessionId();
      this.riskScore = 0;
      this.riskFactors = [];
      this.behaviorData = {};
      this.technicalData = {};
      this.networkData = {};
      this.verdict = 'pending';
      this.isFirstVisit = this.checkFirstVisit();
      this.widget = null;
      this.isRunning = false;
      
      this.log('System initialized');
      
      // Запускаем анализ
      this.startAnalysis();
    }
    
    async startAnalysis() {
      if (this.isRunning) return;
      this.isRunning = true;
      
      PROTTECTION_LAYER.updateStatus('Collecting data...', 30);
      
      try {
        // Собираем данные
        this.collectAllData();
        
        PROTTECTION_LAYER.updateStatus('Analyzing risk factors...', 60);
        
        // Анализируем риски
        this.analyzeRisk();
        
        PROTTECTION_LAYER.updateStatus('Applying security policy...', 90);
        
        // Применяем решение
        this.executeVerdict();
        
        PROTTECTION_LAYER.updateStatus('Complete', 100);
        
        // Скрываем защитный экран
        setTimeout(() => {
          PROTTECTION_LAYER.hide();
        }, 500);
        
      } catch (error) {
        this.log('Analysis error:', error);
        // При ошибке все равно показываем сайт, но с повышенным риском
        this.verdict = 'allow_with_logging';
        this.riskScore = 0.5;
        PROTTECTION_LAYER.hide();
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
      // Удаляем старый виджет, если есть
      const oldWidget = document.getElementById('wws-widget');
      if (oldWidget) oldWidget.remove();
      
      const widget = document.createElement('div');
      widget.id = 'wws-widget';
      widget.innerHTML = `
        <div class="wws-widget-icon" id="wws-widget-icon">
          <div class="wws-icon-shield">🛡️</div>
          <div class="wws-risk-badge" id="wws-risk-badge">0%</div>
        </div>
        <div class="wws-widget-panel" id="wws-widget-panel">
          <div class="wws-panel-header">
            <h3>🛡️ WWS Security</h3>
            <button class="wws-close-panel" id="wws-close-panel">×</button>
          </div>
          <div class="wws-panel-content">
            <div class="wws-status-section">
              <div class="wws-status-item">
                <span class="wws-label">Status:</span>
                <span class="wws-value" id="wws-status-value">Analyzing...</span>
              </div>
              <div class="wws-status-item">
                <span class="wws-label">Risk:</span>
                <span class="wws-value">
                  <span class="wws-risk-meter">
                    <span class="wws-risk-fill" id="wws-risk-fill"></span>
                  </span>
                  <span id="wws-risk-value">0%</span>
                </span>
              </div>
              <div class="wws-status-item">
                <span class="wws-label">Session:</span>
                <span class="wws-value" id="wws-session-id">${this.sessionId.substring(0, 8)}...</span>
              </div>
            </div>
            
            <div class="wws-behavior-section">
              <h4>📊 Behavior</h4>
              <div class="wws-stats-grid">
                <div class="wws-stat">
                  <span class="wws-stat-label">Clicks</span>
                  <span class="wws-stat-value" id="wws-clicks">0</span>
                </div>
                <div class="wws-stat">
                  <span class="wws-stat-label">Movements</span>
                  <span class="wws-stat-value" id="wws-movements">0</span>
                </div>
                <div class="wws-stat">
                  <span class="wws-stat-label">Keypress</span>
                  <span class="wws-stat-value" id="wws-keypress">0</span>
                </div>
                <div class="wws-stat">
                  <span class="wws-stat-label">Scroll</span>
                  <span class="wws-stat-value" id="wws-scroll">0</span>
                </div>
              </div>
            </div>
            
            <div class="wws-factors-section">
              <h4>⚠️ Risk Factors</h4>
              <div class="wws-factors-list" id="wws-factors-list">
                <div class="wws-no-factors">Loading...</div>
              </div>
            </div>
            
            <div class="wws-actions-section">
              <button class="wws-action-btn" id="wws-refresh-btn">🔄 Refresh</button>
              <button class="wws-action-btn secondary" id="wws-details-btn">📊 Details</button>
            </div>
            
            <div class="wws-footer">
              <small>Session: ${this.sessionId.substring(0, 12)}</small>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(widget);
      this.addWidgetStyles();
      this.initWidgetHandlers();
      
      this.widget = widget;
      this.updateWidget();
    }
    
    addWidgetStyles() {
      const style = document.createElement('style');
      style.textContent = `
        #wws-widget {
          position: fixed;
          bottom: 20px;
          left: 20px;
          z-index: 999998;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .wws-widget-icon {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #6C63FF, #36D1DC);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(108, 99, 255, 0.3);
          transition: all 0.3s ease;
          position: relative;
          border: 2px solid rgba(255, 255, 255, 0.2);
          user-select: none;
        }
        
        .wws-widget-icon:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 25px rgba(108, 99, 255, 0.4);
        }
        
        .wws-icon-shield {
          font-size: 28px;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
        }
        
        .wws-risk-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #ef4444;
          color: white;
          font-size: 10px;
          font-weight: bold;
          padding: 2px 6px;
          border-radius: 10px;
          min-width: 20px;
          text-align: center;
          border: 2px solid #1a1a2e;
          pointer-events: none;
        }
        
        .wws-widget-panel {
          position: absolute;
          bottom: 70px;
          left: 0;
          width: 350px;
          background: rgba(18, 18, 26, 0.98);
          backdrop-filter: blur(10px);
          border-radius: 15px;
          border: 1px solid rgba(108, 99, 255, 0.3);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
          display: none;
          overflow: hidden;
          z-index: 999999;
          max-height: 80vh;
        }
        
        .wws-widget-panel.show {
          display: block;
          animation: wws-panel-slide 0.3s ease;
        }
        
        @keyframes wws-panel-slide {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .wws-panel-header {
          padding: 15px 20px;
          background: rgba(108, 99, 255, 0.1);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .wws-panel-header h3 {
          margin: 0;
          color: white;
          font-size: 16px;
          font-weight: 600;
        }
        
        .wws-close-panel {
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 24px;
          cursor: pointer;
          line-height: 1;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
        }
        
        .wws-close-panel:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .wws-panel-content {
          padding: 20px;
          overflow-y: auto;
          max-height: calc(80vh - 60px);
        }
        
        .wws-status-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          padding: 8px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .wws-label {
          color: #94a3b8;
          font-size: 14px;
        }
        
        .wws-value {
          color: white;
          font-weight: 500;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .wws-risk-meter {
          width: 80px;
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          overflow: hidden;
        }
        
        .wws-risk-fill {
          height: 100%;
          background: #10b981;
          width: 0%;
          transition: width 0.5s ease;
          border-radius: 3px;
        }
        
        .wws-behavior-section {
          margin-bottom: 20px;
          padding: 15px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        
        .wws-behavior-section h4 {
          margin: 0 0 15px 0;
          color: white;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .wws-stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        
        .wws-stat {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 6px;
        }
        
        .wws-factors-section h4 {
          margin: 0 0 10px 0;
          color: white;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .wws-actions-section {
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
        }
        
        .wws-action-btn {
          flex: 1;
          padding: 10px 15px;
          background: linear-gradient(135deg, #6C63FF, #36D1DC);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        
        .wws-action-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(108, 99, 255, 0.3);
        }
        
        .wws-action-btn.secondary {
          background: rgba(255, 255, 255, 0.1);
          color: #94a3b8;
        }
        
        .wws-action-btn.secondary:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        
        .wws-footer {
          text-align: center;
          color: #64748b;
          font-size: 11px;
          padding-top: 15px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        @media (max-width: 768px) {
          .wws-widget-panel {
            width: 300px;
            left: 10px;
            bottom: 80px;
          }
          
          #wws-widget {
            bottom: 10px;
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
      const refreshBtn = document.getElementById('wws-refresh-btn');
      const detailsBtn = document.getElementById('wws-details-btn');
      
      // Улучшенная обработка кликов
      const togglePanel = (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        panel.classList.toggle('show');
        return false;
      };
      
      icon.addEventListener('click', togglePanel);
      
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        panel.classList.remove('show');
      });
      
      // Закрытие при клике вне виджета
      document.addEventListener('click', (e) => {
        if (!widget.contains(e.target) && panel.classList.contains('show')) {
          panel.classList.remove('show');
        }
      });
      
      refreshBtn.addEventListener('click', () => {
        this.collectAllData();
        this.analyzeRisk();
        this.updateWidget();
      });
      
      detailsBtn.addEventListener('click', () => {
        this.showDetailedReport();
      });
    }
    
    updateWidget() {
      if (!this.widget) return;
      
      const riskValue = Math.round(this.riskScore * 100);
      const riskBadge = document.getElementById('wws-risk-badge');
      const riskFill = document.getElementById('wws-risk-fill');
      const riskValueEl = document.getElementById('wws-risk-value');
      const statusValue = document.getElementById('wws-status-value');
      
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
        'allow': '✅ Allowed',
        'allow_with_logging': '📝 Logging',
        'simple_captcha': '⚠️ Verification',
        'full_captcha': '🚨 Full Check'
      };
      
      if (statusValue) statusValue.textContent = statusMap[this.verdict] || this.verdict;
    }
    
    collectAllData() {
      // Данные будут собираться постепенно
      this.collectBehaviorData();
      this.collectTechnicalData();
      this.collectNetworkData();
      this.loadUserHistory();
    }
    
    collectBehaviorData() {
      this.behaviorData = {
        pageLoadTime: Date.now(),
        mouseMovements: 0,
        clicks: 0,
        keyPresses: 0,
        scrollEvents: 0,
        referrer: document.referrer,
        directAccess: !document.referrer,
        interactionSpeed: null,
        lastActivity: Date.now()
      };
      
      let mouseMoveCount = 0;
      let mouseMoveTimer = null;
      
      const updateStats = () => {
        this.behaviorData.lastActivity = Date.now();
        this.updateWidget();
      };
      
      document.addEventListener('mousemove', () => {
        mouseMoveCount++;
        this.behaviorData.mouseMovements++;
        if (mouseMoveTimer) clearTimeout(mouseMoveTimer);
        mouseMoveTimer = setTimeout(updateStats, 500);
      });
      
      document.addEventListener('click', () => {
        this.behaviorData.clicks++;
        updateStats();
      });
      
      document.addEventListener('keydown', (e) => {
        if (!['Shift', 'Control', 'Alt', 'Meta', 'Tab', 'Escape'].includes(e.key)) {
          this.behaviorData.keyPresses++;
          updateStats();
        }
      });
      
      let scrollTimeout;
      document.addEventListener('scroll', () => {
        this.behaviorData.scrollEvents++;
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(updateStats, 100);
      });
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
          const cutoff = Date.now() - (30 * 24 * 60 * 60 * 1000);
          if (this.userHistory.sessions) {
            this.userHistory.sessions = this.userHistory.sessions.filter(
              s => s.timestamp > cutoff
            );
          }
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
      
      const behaviorRisk = this.analyzeBehavior();
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
          message: 'First visit - basic verification required',
          details: { firstVisit: true }
        });
      }
      
      this.riskScore = Math.min(1, totalRisk);
      this.determineVerdict();
      this.saveAnalysisResults();
    }
    
    analyzeBehavior() {
      let score = 0;
      const factors = [];
      const timeSinceLoad = Date.now() - this.behaviorData.pageLoadTime;
      
      if (timeSinceLoad < 1000 && this.behaviorData.clicks > 2) {
        score += 0.4;
        factors.push({
          type: 'behavior',
          level: 'high',
          message: 'Too fast interaction after page load',
          details: { time: timeSinceLoad, clicks: this.behaviorData.clicks }
        });
      }
      
      if (this.behaviorData.directAccess) {
        score += 0.1;
        factors.push({
          type: 'behavior',
          level: 'low',
          message: 'Direct access (no referrer)',
          details: { referrer: 'none' }
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
        /puppeteer/i, /playwright/i
      ];
      
      for (const pattern of botPatterns) {
        if (pattern.test(ua)) {
          score += 0.6;
          factors.push({
            type: 'technical',
            level: 'high',
            message: 'Bot User-Agent detected',
            details: { userAgent: ua.match(pattern)[0] }
          });
          break;
        }
      }
      
      if (this.technicalData.webdriver === true) {
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
          message: `Previous incidents: ${this.userHistory.incidents}`,
          details: { incidents: this.userHistory.incidents }
        });
      }
      
      if (this.userHistory.trusted) {
        score -= 0.3;
        factors.push({
          type: 'reputation',
          level: 'trusted',
          message: 'Trusted device',
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
          message: 'High network latency',
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
      
      // Создаем виджет для всех случаев
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
      // Аналогично, улучшенная версия полной капчи
      this.showSimpleCaptcha(); // В продакшене можно заменить на полную версию
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
      
      // Генерируем событие
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
        sessionStorage.setItem('wws_session_active', 'true');
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
        factors: this.riskFactors
      };
      
      if (CONFIG.debug) {
        console.log('🛡️ WWS Analysis:', analysis);
      }
      
      try {
        const analyses = JSON.parse(localStorage.getItem('wws_analyses') || '[]');
        analyses.push(analysis);
        localStorage.setItem('wws_analyses', JSON.stringify(analyses.slice(-20)));
      } catch (e) {}
    }
    
    log(message, data) {
      if (CONFIG.debug) {
        console.log(`🛡️ WWS: ${message}`, data || '');
      }
    }
  }
  
  // ==================== PHASE 3: INITIALIZATION ====================
  
  function shouldSkipVerification() {
    // Проверяем, нужно ли пропустить верификацию
    if (localStorage.getItem('wws_disabled') === 'true') {
      console.log('🛡️ WWS disabled by user');
      return true;
    }
    
    if (sessionStorage.getItem('wws_session_passed') === 'true') {
      console.log('🛡️ Already verified this session');
      return true;
    }
    
    const userId = localStorage.getItem('wws_user_id');
    if (userId) {
      try {
        const history = JSON.parse(localStorage.getItem(`wws_history_${userId}`) || '{}');
        if (history.trusted && history.trustedSince) {
          const timeSinceTrusted = Date.now() - history.trustedSince;
          if (timeSinceTrusted < CONFIG.memory.trustedDevice) {
            console.log('🛡️ Trusted device, skip verification');
            sessionStorage.setItem('wws_session_passed', 'true');
            return true;
          }
        }
      } catch (e) {}
    }
    
    return false;
  }
  
  function initializeWWS() {
    if (shouldSkipVerification()) {
      // Все равно создаем анализатор для виджета, но без проверки
      const analyzer = new WWSRiskAnalyzer();
      analyzer.verdict = 'allow';
      analyzer.riskScore = 0;
      analyzer.isRunning = true;
      analyzer.createWidget();
      analyzer.updateWidget();
      PROTTECTION_LAYER.hide();
      return;
    }
    
    // Запускаем полную проверку
    window.wwsAnalyzer = new WWSRiskAnalyzer();
  }
  
  // Экспортируем API
  window.WWS = {
    version: CONFIG.version,
    
    forceCheck: () => new WWSRiskAnalyzer(),
    
    getRiskScore: () => window.wwsAnalyzer?.riskScore || 0,
    
    getRiskFactors: () => window.wwsAnalyzer?.riskFactors || [],
    
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
    
    onAccessGranted: (callback) => {
      window.addEventListener('wws:access-granted', callback);
    }
  };
  
  // Запускаем немедленно, не дожидаясь DOMContentLoaded
  // Если DOM еще не готов, Protection Layer подождет
  initializeWWS();
  
})();
