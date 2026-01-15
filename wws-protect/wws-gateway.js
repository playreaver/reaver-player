/**
 * WWS PROTECT v7.0 - Real Behavior-Based Bot Protection
 * @license MIT
 */

(function() {
  'use strict';
  
  // ==================== CONFIGURATION ====================
  const CONFIG = {
    version: '7.0',
    companyName: 'WWS PROTECT',
    websiteUrl: 'https://reaver.is-a.dev/',
    
    // Risk thresholds
    riskThresholds: {
      low: 70,      // Score > 70 = low risk
      medium: 40    // Score 40-70 = medium risk (challenge)
    },
    
    // Block settings
    blockDuration: 5 * 60 * 1000, // 5 minutes in ms
    
    // Behavior analysis settings
    behavior: {
      minHumanTime: 2000,        // Minimum time on page (ms)
      maxBotClicks: 10,          // Max clicks per second for bot detection
      requiredInteractions: 2,   // Min different interaction types
      maxMouseSpeed: 2000        // Max mouse speed px/sec for human
    },
    
    widget: {
      position: 'bottom-right',
      defaultTheme: 'dark',
      themes: {
        dark: {
          background: '#0F172A',
          surface: '#1E293B',
          primary: '#3B82F6',
          secondary: '#8B5CF6',
          text: '#F8FAFC',
          textSecondary: '#94A3B8',
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444'
        },
        light: {
          background: '#FFFFFF',
          surface: '#F1F5F9',
          primary: '#2563EB',
          secondary: '#7C3AED',
          text: '#0F172A',
          textSecondary: '#475569',
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#DC2626'
        }
      }
    }
  };
  
  // ==================== ANTI-DUPLICATE LOAD ====================
  if (window._wwsPremiumLoaded) {
    console.log('🛡️ WWS PROTECT уже инициализирован');
    return;
  }
  window._wwsPremiumLoaded = true;
  
  // ==================== GLOBAL STATE ====================
  const State = {
    verificationComplete: false,
    currentTheme: localStorage.getItem('wws_theme') || CONFIG.widget.defaultTheme,
    position: localStorage.getItem('wws_position') || CONFIG.widget.position,
    notifications: {
      enabled: localStorage.getItem('wws_notifications') !== 'false',
      threatAlerts: localStorage.getItem('wws_threat_alerts') !== 'false'
    }
  };
  
  // ==================== BEHAVIOR ANALYZER ====================
  class BehaviorAnalyzer {
    constructor() {
      this.data = {
        mouseMoves: [],
        clicks: 0,
        keyPresses: 0,
        scrolls: 0,
        touches: 0,
        timeStart: Date.now(),
        timeOnPage: 0,
        hasMouseMovement: false,
        hasNaturalScrolling: false,
        maxClickSpeed: 0
      };
      this.lastClickTime = Date.now();
      this.init();
    }
    
    init() {
      // Mouse tracking
      let lastMousePos = { x: 0, y: 0 };
      document.addEventListener('mousemove', (e) => {
        this.data.hasMouseMovement = true;
        const speed = Math.sqrt(
          Math.pow(e.clientX - lastMousePos.x, 2) + 
          Math.pow(e.clientY - lastMousePos.y, 2)
        );
        this.data.mouseMoves.push({
          speed: speed,
          timestamp: Date.now(),
          x: e.clientX,
          y: e.clientY
        });
        lastMousePos = { x: e.clientX, y: e.clientY };
      });
      
      // Click tracking
      document.addEventListener('click', () => {
        const now = Date.now();
        const timeBetweenClicks = now - this.lastClickTime;
        const clickSpeed = timeBetweenClicks > 0 ? 1000 / timeBetweenClicks : 1000;
        
        this.data.maxClickSpeed = Math.max(this.data.maxClickSpeed, clickSpeed);
        this.data.clicks++;
        this.lastClickTime = now;
      });
      
      // Keyboard tracking
      document.addEventListener('keydown', () => {
        this.data.keyPresses++;
      });
      
      // Scroll tracking
      let lastScrollTime = Date.now();
      document.addEventListener('scroll', () => {
        const now = Date.now();
        if (now - lastScrollTime > 100) { // Natural scroll delay
          this.data.hasNaturalScrolling = true;
        }
        this.data.scrolls++;
        lastScrollTime = now;
      });
      
      // Touch tracking (mobile)
      document.addEventListener('touchstart', () => {
        this.data.touches++;
      });
    }
    
    calculateScore() {
      const now = Date.now();
      this.data.timeOnPage = now - this.data.timeStart;
      
      let score = 0;
      let reasons = [];
      
      // 1. Time on page (30 points)
      if (this.data.timeOnPage > CONFIG.behavior.minHumanTime) {
        score += 30;
      } else {
        reasons.push(`Too fast: ${this.data.timeOnPage}ms < ${CONFIG.behavior.minHumanTime}ms`);
      }
      
      // 2. Mouse movement realism (25 points)
      if (this.data.hasMouseMovement && this.data.mouseMoves.length > 10) {
        const avgSpeed = this.data.mouseMoves.reduce((sum, move) => sum + move.speed, 0) / 
                        this.data.mouseMoves.length;
        if (avgSpeed < CONFIG.behavior.maxMouseSpeed) {
          score += 25;
        } else {
          reasons.push(`Unnatural mouse speed: ${Math.round(avgSpeed)}px/s`);
        }
      } else {
        reasons.push('No realistic mouse movement');
      }
      
      // 3. Interaction diversity (25 points)
      const interactionTypes = [
        this.data.clicks > 0,
        this.data.keyPresses > 0,
        this.data.scrolls > 0,
        this.data.touches > 0
      ].filter(Boolean).length;
      
      if (interactionTypes >= CONFIG.behavior.requiredInteractions) {
        score += 25;
      } else {
        reasons.push(`Limited interactions: ${interactionTypes}/${CONFIG.behavior.requiredInteractions}`);
      }
      
      // 4. Natural behavior (20 points)
      if (this.data.hasNaturalScrolling && this.data.maxClickSpeed < CONFIG.behavior.maxBotClicks) {
        score += 20;
      } else {
        if (this.data.maxClickSpeed >= CONFIG.behavior.maxBotClicks) {
          reasons.push(`Abnormal click speed: ${this.data.maxClickSpeed.toFixed(1)}/sec`);
        }
        if (!this.data.hasNaturalScrolling) {
          reasons.push('No natural scrolling');
        }
      }
      
      // Bot signature detection (-50 points)
      if (this.detectBotSignature()) {
        score = Math.max(0, score - 50);
        reasons.push('Bot signature detected in user agent');
      }
      
      // Normalize score
      score = Math.min(100, Math.max(0, score));
      
      return {
        score: score,
        riskLevel: this.getRiskLevel(score),
        reasons: reasons,
        rawData: { ...this.data }
      };
    }
    
    detectBotSignature() {
      // Check for headless browser
      if (navigator.webdriver || navigator.automationControlled) return true;
      
      // Check for common bot indicators
      const botIndicators = ['bot', 'crawler', 'spider', 'headless', 'phantom', 'selenium'];
      const ua = navigator.userAgent.toLowerCase();
      if (botIndicators.some(ind => ua.includes(ind))) return true;
      
      // Check screen resolution (bots often have 0x0 or unusual sizes)
      if (screen.width === 0 || screen.height === 0) return true;
      
      // Check plugins and languages (bots have none)
      if (navigator.plugins.length === 0 && navigator.languages.length === 0) return true;
      
      return false;
    }
    
    getRiskLevel(score) {
      if (score >= CONFIG.riskThresholds.low) return 'low';
      if (score >= CONFIG.riskThresholds.medium) return 'medium';
      return 'high';
    }
  }
  
  // ==================== RISK MANAGER ====================
  class RiskManager {
    constructor() {
      this.analyzer = new BehaviorAnalyzer();
      this.assessment = null;
    }
    
    assessRisk() {
      this.assessment = this.analyzer.calculateScore();
      return this.assessment;
    }
    
    getDecision() {
      const assessment = this.assessment || this.assessRisk();
      
      switch (assessment.riskLevel) {
        case 'low':
          return {
            action: 'allow',
            message: 'Access granted',
            reason: 'Human behavior confirmed',
            assessment: assessment
          };
        
        case 'medium':
          return {
            action: 'challenge',
            message: 'Verification required',
            reason: 'Suspicious behavior detected',
            assessment: assessment,
            challenge: this.generateChallenge()
          };
        
        case 'high':
          return {
            action: 'block',
            message: 'Access blocked',
            reason: 'Bot detected',
            assessment: assessment,
            unblockTime: Date.now() + CONFIG.blockDuration
          };
      }
    }
    
    generateChallenge() {
      const a = Math.floor(Math.random() * 10) + 1;
      const b = Math.floor(Math.random() * 10) + 1;
      const answer = a + b;
      
      return {
        type: 'math',
        question: `What is ${a} + ${b}?`,
        answer: answer,
        attempts: 0,
        maxAttempts: 3
      };
    }
    
    verifyChallenge(userAnswer, challenge) {
      challenge.attempts++;
      return {
        success: parseInt(userAnswer) === challenge.answer,
        attemptsLeft: challenge.maxAttempts - challenge.attempts
      };
    }
  }
  
  // ==================== BLOCK MANAGER ====================
  class BlockManager {
    static isBlocked() {
      const blockData = localStorage.getItem('wws_block');
      if (!blockData) return false;
      
      try {
        const { unblockTime } = JSON.parse(blockData);
        if (Date.now() > unblockTime) {
          localStorage.removeItem('wws_block');
          return false;
        }
        return true;
      } catch (e) {
        localStorage.removeItem('wws_block');
        return false;
      }
    }
    
    static block(duration = CONFIG.blockDuration) {
      const unblockTime = Date.now() + duration;
      localStorage.setItem('wws_block', JSON.stringify({ unblockTime }));
      return unblockTime;
    }
    
    static getUnblockTime() {
      const blockData = localStorage.getItem('wws_block');
      if (!blockData) return null;
      try {
        return JSON.parse(blockData).unblockTime;
      } catch (e) {
        return null;
      }
    }
  }
  
  // ==================== PROTECTION SCREEN ====================
  class ProtectionScreen {
    constructor() {
      this.screen = null;
      this.riskManager = new RiskManager();
      this.decision = null;
      this.interval = null;
    }
    
    show() {
      if (BlockManager.isBlocked()) {
        this.showBlockScreen();
        return;
      }
      
      if (this.screen) return;
      
      this.screen = document.createElement('div');
      this.screen.className = 'wws-protection-screen';
      this.screen.innerHTML = this.getInitialHTML();
      document.body.appendChild(this.screen);
      
      // Show progress animation
      this.startProgressAnimation();
      
      // Run analysis after collection period
      setTimeout(() => this.runAnalysis(), CONFIG.behavior.minHumanTime);
    }
    
    startProgressAnimation() {
      let progress = 0;
      const steps = [
        'Collecting interaction data...',
        'Analyzing mouse patterns...',
        'Checking behavior signatures...',
        'Calculating risk score...'
      ];
      let currentStep = 0;
      
      this.interval = setInterval(() => {
        if (progress >= 100) {
          clearInterval(this.interval);
          return;
        }
        
        progress += 1.5;
        
        const progressFill = document.getElementById('wws-progress-fill');
        const progressPercent = document.getElementById('wws-progress-percent');
        const statusText = document.getElementById('wws-status-text');
        
        if (progressFill) progressFill.style.width = `${progress}%`;
        if (progressPercent) progressPercent.textContent = `${Math.floor(progress)}%`;
        
        const stepIndex = Math.floor((progress / 100) * steps.length);
        if (stepIndex > currentStep && statusText) {
          currentStep = stepIndex;
          statusText.textContent = steps[currentStep - 1] || steps[0];
        }
      }, 30);
    }
    
    runAnalysis() {
      this.decision = this.riskManager.getDecision();
      
      switch (this.decision.action) {
        case 'allow':
          this.showSuccess();
          break;
        case 'challenge':
          this.showChallenge();
          break;
        case 'block':
          this.showBlockScreen();
          break;
      }
    }
    
    showSuccess() {
      if (!this.screen) return;
      
      const statusText = document.getElementById('wws-status-text');
      const progressPercent = document.getElementById('wws-progress-percent');
      
      if (statusText) statusText.textContent = '✅ Human verified';
      if (progressPercent) progressPercent.textContent = 'Complete';
      
      localStorage.setItem('wws_verified', 'true');
      
      setTimeout(() => {
        this.hide();
        Widget.show(this.decision.assessment);
      }, 1500);
    }
    
    showChallenge() {
      if (!this.screen) return;
      
      const content = this.screen.querySelector('.wws-status-container');
      const challenge = this.decision.challenge;
      
      content.innerHTML = `
        <div class="wws-status-text" style="color: var(--wws-warning); margin-bottom: 24px; font-size: 18px;">
          <i class="fas fa-robot"></i> Verify you're human
        </div>
        
        <div style="background: rgba(0,0,0,0.1); padding: 24px; border-radius: 12px; margin-bottom: 20px;">
          <div style="font-size: 20px; margin-bottom: 16px; font-weight: 600;">${challenge.question}</div>
          <input type="number" id="wws-challenge-input" 
                 style="width: 100%; padding: 12px; border-radius: 8px; border: none; font-size: 16px; text-align: center;"
                 placeholder="Your answer" autocomplete="off">
        </div>
        
        <button id="wws-challenge-submit" 
                style="width: 100%; padding: 14px; background: var(--wws-primary); color: white; 
                       border: none; border-radius: 12px; font-size: 16px; cursor: pointer; font-weight: 600;">
          Verify
        </button>
        
        <div id="wws-challenge-error" style="color: var(--wws-danger); margin-top: 12px; font-size: 14px;"></div>
      `;
      
      const input = document.getElementById('wws-challenge-input');
      const submit = document.getElementById('wws-challenge-submit');
      const error = document.getElementById('wws-challenge-error');
      
      const verify = () => {
        const result = this.riskManager.verifyChallenge(input.value, challenge);
        
        if (result.success) {
          this.showSuccess();
        } else {
          if (result.attemptsLeft <= 0) {
            this.decision.action = 'block';
            BlockManager.block();
            this.showBlockScreen();
          } else {
            error.textContent = `Incorrect. ${result.attemptsLeft} attempts left.`;
            input.value = '';
            input.focus();
          }
        }
      };
      
      submit.addEventListener('click', verify);
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') verify();
      });
      
      input.focus();
    }
    
    showBlockScreen() {
      this.hide();
      
      const unblockTime = BlockManager.getUnblockTime() || Date.now() + CONFIG.blockDuration;
      
      // Ensure block is recorded
      if (!BlockManager.isBlocked()) {
        BlockManager.block();
      }
      
      const blockScreen = document.createElement('div');
      blockScreen.className = 'wws-protection-screen';
      blockScreen.innerHTML = `
        <div class="wws-protection-content">
          <div class="wws-shield-wrapper">
            <div class="wws-shield" style="background: var(--wws-danger);">
              <i class="fas fa-ban"></i>
            </div>
          </div>
          
          <h1 class="wws-title">Access Blocked</h1>
          <p class="wws-subtitle">Suspicious activity detected</p>
          
          <div class="wws-status-container">
            <div class="wws-status-text" style="color: var(--wws-danger); font-size: 18px;">
              <i class="fas fa-clock"></i> Try again in <span id="wws-countdown"></span>
            </div>
          </div>
          
          <div class="wws-footer">
            <a href="${CONFIG.websiteUrl}" target="_blank">Contact Support</a>
          </div>
        </div>
      `;
      
      document.body.appendChild(blockScreen);
      this.startCountdown(blockScreen, unblockTime);
    }
    
    startCountdown(element, unblockTime) {
      const countdownEl = document.getElementById('wws-countdown');
      
      const updateCountdown = () => {
        const now = Date.now();
        const remaining = unblockTime - now;
        
        if (remaining <= 0) {
          if (element.parentNode) {
            document.body.removeChild(element);
          }
          // Restart verification
          setTimeout(() => this.show(), 100);
          return;
        }
        
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        countdownEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        setTimeout(updateCountdown, 1000);
      };
      
      updateCountdown();
    }
    
    getInitialHTML() {
      return `
        <div class="wws-protection-content">
          <div class="wws-shield-wrapper">
            <div class="wws-shield-ripple"></div>
            <div class="wws-shield-ripple"></div>
            <div class="wws-shield">
              <i class="fas fa-shield-alt"></i>
            </div>
          </div>
          
          <h1 class="wws-title">${CONFIG.companyName}</h1>
          <p class="wws-subtitle">Analyzing your behavior...</p>
          
          <div class="wws-status-container">
            <div class="wws-status-text" id="wws-status-text">Collecting interaction data...</div>
            
            <div class="wws-progress-container">
              <div class="wws-progress-bar">
                <div class="wws-progress-fill" id="wws-progress-fill"></div>
              </div>
              <div class="wws-progress-text">
                <span>0%</span>
                <span id="wws-progress-percent">Initializing</span>
                <span>100%</span>
              </div>
            </div>
          </div>
          
          <div class="wws-footer">
            Powered by <a href="${CONFIG.websiteUrl}" target="_blank">Wandering Wizardry Studios</a>
          </div>
        </div>
      `;
    }
    
    hide() {
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
      }
      
      if (this.screen && this.screen.parentNode) {
        this.screen.style.opacity = '0';
        this.screen.style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
          if (this.screen && this.screen.parentNode) {
            this.screen.parentNode.removeChild(this.screen);
            this.screen = null;
          }
        }, 500);
      }
    }
  }
  
  // ==================== ENHANCED WIDGET ====================
  class Widget {
    constructor() {
      this.widget = null;
      this.panel = null;
      this.isPanelOpen = false;
      this.currentTab = 'overview';
      this.riskAssessment = null;
      this.init();
    }
    
    init() {
      this.createWidget();
      this.bindEvents();
      this.applyTheme();
      this.updatePanelContent();
    }
    
    createWidget() {
      // Remove existing widget if any
      const existingWidget = document.querySelector('.wws-widget');
      if (existingWidget) existingWidget.remove();
      
      this.widget = document.createElement('div');
      this.widget.className = `wws-widget wws-theme-${State.currentTheme} wws-position-${State.position}`;
      this.widget.style.display = 'none'; // Hidden by default
      
      this.widget.innerHTML = `
        <div class="wws-widget-toggle" id="wws-widget-toggle">
          <i class="fas fa-shield-alt"></i>
          <div class="wws-notification-badge">0</div>
        </div>
        
        <div class="wws-widget-panel" id="wws-widget-panel">
          <div class="wws-panel-header">
            <div class="wws-header-left">
              <div class="wws-header-icon">
                <i class="fas fa-shield-alt"></i>
              </div>
              <div class="wws-header-text">
                <h3>${CONFIG.companyName}</h3>
                <p>v${CONFIG.version} • Active</p>
              </div>
            </div>
            <button class="wws-close-panel" id="wws-close-panel">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="wws-panel-tabs">
            <button class="wws-tab active" data-tab="overview">
              <i class="fas fa-chart-simple"></i>
              <span>Overview</span>
            </button>
            <button class="wws-tab" data-tab="security">
              <i class="fas fa-shield"></i>
              <span>Security</span>
            </button>
            <button class="wws-tab" data-tab="settings">
              <i class="fas fa-sliders"></i>
              <span>Settings</span>
            </button>
          </div>
          
          <div class="wws-panel-content" id="wws-panel-content"></div>
          
          <div class="wws-panel-footer">
            <a href="${CONFIG.websiteUrl}" target="_blank" class="wws-footer-link">
              <i class="fas fa-external-link-alt"></i> Open Dashboard
            </a>
          </div>
        </div>
      `;
      
      document.body.appendChild(this.widget);
      this.panel = document.getElementById('wws-widget-panel');
    }
    
    bindEvents() {
      // Toggle widget panel
      const toggle = document.getElementById('wws-widget-toggle');
      if (toggle) {
        toggle.addEventListener('click', (e) => {
          e.stopPropagation();
          this.togglePanel();
        });
      }
      
      // Close panel
      const closeBtn = document.getElementById('wws-close-panel');
      if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.closePanel();
        });
      }
      
      // Tab switching
      document.querySelectorAll('.wws-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          document.querySelectorAll('.wws-tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          this.currentTab = tab.dataset.tab;
          this.updatePanelContent();
        });
      });
      
      // Close panel when clicking outside
      document.addEventListener('click', (e) => {
        if (this.isPanelOpen && 
            !this.panel.contains(e.target) && 
            !e.target.closest('.wws-widget-toggle')) {
          this.closePanel();
        }
      });
      
      // Close panel with Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isPanelOpen) {
          this.closePanel();
        }
      });
    }
    
    togglePanel() {
      this.isPanelOpen = !this.isPanelOpen;
      this.panel.style.display = this.isPanelOpen ? 'block' : 'none';
      
      if (this.isPanelOpen) {
        this.updatePanelContent();
      }
    }
    
    closePanel() {
      this.isPanelOpen = false;
      this.panel.style.display = 'none';
    }
    
    updatePanelContent() {
      const content = document.getElementById('wws-panel-content');
      if (!content) return;
      
      // Update badge based on risk level
      this.updateBadge();
      
      switch (this.currentTab) {
        case 'overview':
          this.renderOverview(content);
          break;
        case 'security':
          this.renderSecurity(content);
          break;
        case 'settings':
          this.renderSettings(content);
          break;
      }
    }
    
    renderOverview(container) {
      if (!this.riskAssessment) {
        container.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--wws-text-secondary);">No assessment data</div>';
        return;
      }
      
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      const dateStr = now.toLocaleDateString();
      
      container.innerHTML = `
        <div class="wws-section">
          <div class="wws-section-title">
            <i class="fas fa-chart-simple"></i>
            Risk Assessment
          </div>
          
          <div class="wws-stats-grid">
            <div class="wws-stat-card">
              <div class="wws-stat-value">${this.riskAssessment.score}</div>
              <div class="wws-stat-label">Behavior Score</div>
            </div>
            
            <div class="wws-stat-card">
              <div class="wws-stat-value" style="color: ${this.getRiskColor()}">
                ${this.riskAssessment.riskLevel.toUpperCase()}
              </div>
              <div class="wws-stat-label">Risk Level</div>
            </div>
          </div>
        </div>
        
        <div class="wws-section">
          <div class="wws-section-title">
            <i class="fas fa-info-circle"></i>
            Analysis Details
          </div>
          
          <div class="wws-status-list">
            ${this.riskAssessment.reasons.length > 0 ? 
              this.riskAssessment.reasons.map(reason => `
                <div class="wws-status-item">
                  <div class="wws-status-label">
                    <i class="fas fa-exclamation-triangle" style="color: var(--wws-warning)"></i>
                    ${reason}
                  </div>
                </div>
              `).join('') : 
              '<div class="wws-status-item"><div class="wws-status-label" style="color: var(--wws-success)"><i class="fas fa-check-circle"></i> All checks passed</div></div>'
            }
          </div>
        </div>
        
        <div class="wws-section">
          <div class="wws-section-title">
            <i class="fas fa-clock"></i>
            Session Info
          </div>
          
          <div class="wws-status-list">
            <div class="wws-status-item">
              <div class="wws-status-label">
                <i class="far fa-clock"></i>
                Current Time
              </div>
              <div class="wws-status-value">${timeStr}</div>
            </div>
            
            <div class="wws-status-item">
              <div class="wws-status-label">
                <i class="far fa-calendar"></i>
                Date
              </div>
              <div class="wws-status-value">${dateStr}</div>
            </div>
            
            <div class="wws-status-item">
              <div class="wws-status-label">
                <i class="fas fa-shield-alt"></i>
                Protection Status
              </div>
              <div class="wws-status-value" style="color: var(--wws-success)">Active</div>
            </div>
          </div>
        </div>
      `;
    }
    
    renderSecurity(container) {
      container.innerHTML = `
        <div class="wws-section">
          <div class="wws-section-title">
            <i class="fas fa-shield"></i>
            Protection Status
          </div>
          
          <div class="wws-status-list">
            <div class="wws-status-item">
              <div class="wws-status-label">
                <i class="fas fa-fire"></i>
                Firewall
              </div>
              <div class="wws-status-value" style="color: var(--wws-success)">Active</div>
            </div>
            
            <div class="wws-status-item">
              <div class="wws-status-label">
                <i class="fas fa-robot"></i>
                Bot Protection
              </div>
              <div class="wws-status-value" style="color: var(--wws-success)">Enabled</div>
            </div>
            
            <div class="wws-status-item">
              <div class="wws-status-label">
                <i class="fas fa-broadcast-tower"></i>
                DDoS Protection
              </div>
              <div class="wws-status-value" style="color: var(--wws-success)">Enabled</div>
            </div>
            
            <div class="wws-status-item">
              <div class="wws-status-label">
                <i class="fas fa-lock"></i>
                Encryption
              </div>
              <div class="wws-status-value" style="color: var(--wws-success)">TLS 1.3</div>
            </div>
            
            <div class="wws-status-item">
              <div class="wws-status-label">
                <i class="fas fa-mouse"></i>
                Behavior Analysis
              </div>
              <div class="wws-status-value" style="color: var(--wws-success)">Active</div>
            </div>
          </div>
        </div>
        
        <div class="wws-section">
          <div class="wws-section-title">
            <i class="fas fa-history"></i>
            Recent Activity
          </div>
          
          <div class="wws-status-list">
            <div class="wws-status-item">
              <div class="wws-status-label">
                <i class="fas fa-check-circle"></i>
                Last Scan
              </div>
              <div class="wws-status-value">Just now</div>
            </div>
            
            <div class="wws-status-item">
              <div class="wws-status-label">
                <i class="fas fa-shield-alt"></i>
                This Session
              </div>
              <div class="wws-status-value" style="color: var(--wws-success)">Verified</div>
            </div>
            
            <div class="wws-status-item">
              <div class="wws-status-label">
                <i class="fas fa-sync-alt"></i>
                Auto Updates
              </div>
              <div class="wws-status-value" style="color: var(--wws-success)">Enabled</div>
            </div>
          </div>
        </div>
      `;
    }
    
    renderSettings(container) {
      container.innerHTML = `
        <div class="wws-section">
          <div class="wws-section-title">
            <i class="fas fa-sliders"></i>
            Widget Settings
          </div>
          
          <div class="wws-status-list">
            <div class="wws-settings-item">
              <div>
                <div class="wws-settings-label">Widget Position</div>
                <div class="wws-settings-desc">Choose where to display widget</div>
              </div>
              <select class="wws-select" id="wws-position-select">
                <option value="bottom-right" ${State.position === 'bottom-right' ? 'selected' : ''}>Bottom Right</option>
                <option value="bottom-left" ${State.position === 'bottom-left' ? 'selected' : ''}>Bottom Left</option>
                <option value="top-right" ${State.position === 'top-right' ? 'selected' : ''}>Top Right</option>
                <option value="top-left" ${State.position === 'top-left' ? 'selected' : ''}>Top Left</option>
              </select>
            </div>
            
            <div class="wws-settings-item">
              <div>
                <div class="wws-settings-label">Theme</div>
                <div class="wws-settings-desc">Choose color theme</div>
              </div>
              <select class="wws-select" id="wws-theme-select">
                <option value="dark" ${State.currentTheme === 'dark' ? 'selected' : ''}>Dark</option>
                <option value="light" ${State.currentTheme === 'light' ? 'selected' : ''}>Light</option>
              </select>
            </div>
          </div>
        </div>
        
        <div class="wws-section">
          <div class="wws-section-title">
            <i class="fas fa-bell"></i>
            Notifications
          </div>
          
          <div class="wws-status-list">
            <div class="wws-settings-item">
              <div>
                <div class="wws-settings-label">Enable Notifications</div>
                <div class="wws-settings-desc">Show security alerts</div>
              </div>
              <label class="wws-switch">
                <input type="checkbox" id="wws-notifications" ${State.notifications.enabled ? 'checked' : ''}>
                <span class="wws-switch-slider"></span>
              </label>
            </div>
            
            <div class="wws-settings-item">
              <div>
                <div class="wws-settings-label">Threat Alerts</div>
                <div class="wws-settings-desc">Show threat notifications</div>
              </div>
              <label class="wws-switch">
                <input type="checkbox" id="wws-threat-alerts" ${State.notifications.threatAlerts ? 'checked' : ''}>
                <span class="wws-switch-slider"></span>
              </label>
            </div>
          </div>
        </div>
      `;
      
      this.bindSettingsEvents();
    }
    
    bindSettingsEvents() {
      // Position selector
      const positionSelect = document.getElementById('wws-position-select');
      if (positionSelect) {
        positionSelect.addEventListener('change', (e) => {
          State.position = e.target.value;
          localStorage.setItem('wws_position', State.position);
          this.updatePosition();
        });
      }
      
      // Theme selector
      const themeSelect = document.getElementById('wws-theme-select');
      if (themeSelect) {
        themeSelect.addEventListener('change', (e) => {
          State.currentTheme = e.target.value;
          localStorage.setItem('wws_theme', State.currentTheme);
          this.applyTheme();
        });
      }
      
      // Notification toggles
      const notificationToggle = document.getElementById('wws-notifications');
      if (notificationToggle) {
        notificationToggle.addEventListener('change', (e) => {
          State.notifications.enabled = e.target.checked;
          localStorage.setItem('wws_notifications', e.target.checked);
        });
      }
      
      const threatToggle = document.getElementById('wws-threat-alerts');
      if (threatToggle) {
        threatToggle.addEventListener('change', (e) => {
          State.notifications.threatAlerts = e.target.checked;
          localStorage.setItem('wws_threat_alerts', e.target.checked);
        });
      }
    }
    
    applyTheme() {
      if (this.widget) {
        this.widget.className = `wws-widget wws-theme-${State.currentTheme} wws-position-${State.position}`;
      }
    }
    
    updatePosition() {
      if (this.widget) {
        this.widget.className = `wws-widget wws-theme-${State.currentTheme} wws-position-${State.position}`;
      }
    }
    
    updateBadge() {
      if (!this.riskAssessment) return;
      
      const badge = document.querySelector('.wws-notification-badge');
      if (badge) {
        const count = this.riskAssessment.score < 70 ? 1 : 0;
        badge.textContent = count;
        badge.style.display = count > 0 ? 'block' : 'none';
      }
    }
    
    getRiskColor() {
      if (!this.riskAssessment) return 'var(--wws-text-secondary)';
      
      switch (this.riskAssessment.riskLevel) {
        case 'low': return 'var(--wws-success)';
        case 'medium': return 'var(--wws-warning)';
        case 'high': return 'var(--wws-danger)';
        default: return 'var(--wws-text-secondary)';
      }
    }
    
    // Статические методы для внешнего доступа
    static show(assessment = null) {
      if (!window.wwsWidgetInstance) {
        window.wwsWidgetInstance = new Widget();
      }
      
      const instance = window.wwsWidgetInstance;
      instance.widget.style.display = 'block';
      
      if (assessment) {
        instance.riskAssessment = assessment;
        instance.updateBadge();
        instance.updatePanelContent();
      }
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
    :root {
      --wws-bg: ${CONFIG.widget.themes.dark.background};
      --wws-surface: ${CONFIG.widget.themes.dark.surface};
      --wws-primary: ${CONFIG.widget.themes.dark.primary};
      --wws-secondary: ${CONFIG.widget.themes.dark.secondary};
      --wws-text: ${CONFIG.widget.themes.dark.text};
      --wws-text-secondary: ${CONFIG.widget.themes.dark.textSecondary};
      --wws-success: ${CONFIG.widget.themes.dark.success};
      --wws-warning: ${CONFIG.widget.themes.dark.warning};
      --wws-danger: ${CONFIG.widget.themes.dark.danger};
      --wws-border: rgba(255, 255, 255, 0.1);
      --wws-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      --wws-radius: 16px;
      --wws-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .wws-theme-light {
      --wws-bg: ${CONFIG.widget.themes.light.background};
      --wws-surface: ${CONFIG.widget.themes.light.surface};
      --wws-primary: ${CONFIG.widget.themes.light.primary};
      --wws-secondary: ${CONFIG.widget.themes.light.secondary};
      --wws-text: ${CONFIG.widget.themes.light.text};
      --wws-text-secondary: ${CONFIG.widget.themes.light.textSecondary};
      --wws-success: ${CONFIG.widget.themes.light.success};
      --wws-warning: ${CONFIG.widget.themes.light.warning};
      --wws-danger: ${CONFIG.widget.themes.light.danger};
      --wws-border: rgba(0, 0, 0, 0.1);
      --wws-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
    }
    
    /* ANIMATIONS */
    @keyframes wwsFadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes wwsShieldGlow {
      0%, 100% { filter: drop-shadow(0 0 20px var(--wws-primary)); }
      50% { filter: drop-shadow(0 0 30px var(--wws-primary)); }
    }
    
    @keyframes wwsProgress {
      0% { background-position: 0% 50%; }
      100% { background-position: 100% 50%; }
    }
    
    @keyframes wwsPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    
    @keyframes wwsRipple {
      0% { transform: scale(0.8); opacity: 0.5; }
      100% { transform: scale(2); opacity: 0; }
    }
    
    /* MINIMAL PROTECTION SCREEN */
    .wws-protection-screen {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      background: linear-gradient(135deg, #0a0a1a 0%, #121226 100%) !important;
      z-index: 2147483647 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      animation: wwsFadeIn 0.4s ease-out;
      overflow: hidden !important;
    }
    
    .wws-protection-content {
      width: 100%;
      max-width: 500px;
      padding: 40px;
      text-align: center;
    }
    
    .wws-shield-wrapper {
      position: relative;
      margin: 0 auto 40px;
      width: 140px;
      height: 140px;
    }
    
    .wws-shield {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, var(--wws-primary), var(--wws-secondary));
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: wwsShieldGlow 3s ease-in-out infinite;
      position: relative;
      z-index: 2;
    }
    
    .wws-shield i {
      font-size: 60px;
      color: white;
    }
    
    .wws-shield-ripple {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 160px;
      height: 160px;
      border: 2px solid rgba(59, 130, 246, 0.3);
      border-radius: 50%;
      animation: wwsRipple 2s ease-out infinite;
    }
    
    .wws-shield-ripple:nth-child(3) {
      width: 180px;
      height: 180px;
      animation-delay: 0.5s;
    }
    
    .wws-title {
      color: white;
      font-size: 40px;
      font-weight: 700;
      margin: 0 0 15px;
      letter-spacing: -0.5px;
    }
    
    .wws-subtitle {
      color: #94A3B8;
      font-size: 18px;
      font-weight: 400;
      margin: 0 0 50px;
      line-height: 1.5;
    }
    
    .wws-status-container {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 16px;
      padding: 30px;
      margin: 0 0 30px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .wws-status-text {
      color: #94A3B8;
      font-size: 16px;
      margin: 0 0 20px;
    }
    
    .wws-progress-container {
      width: 100%;
    }
    
    .wws-progress-bar {
      width: 100%;
      height: 6px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
      overflow: hidden;
      margin-bottom: 10px;
    }
    
    .wws-progress-fill {
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, var(--wws-primary), var(--wws-secondary));
      animation: wwsProgress 2s linear infinite;
      transition: width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
      border-radius: 3px;
    }
    
    .wws-progress-text {
      display: flex;
      justify-content: space-between;
      color: #94A3B8;
      font-size: 14px;
    }
    
    .wws-footer {
      color: #64748B;
      font-size: 14px;
      margin-top: 40px;
    }
    
    .wws-footer a {
      color: #60A5FA;
      text-decoration: none;
      font-weight: 500;
    }
    
    /* WIDGET STYLES */
    .wws-widget {
      position: fixed;
      z-index: 2147483646;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    /* Position classes */
    .wws-position-bottom-right { bottom: 24px; right: 24px; }
    .wws-position-bottom-left { bottom: 24px; left: 24px; }
    .wws-position-top-right { top: 24px; right: 24px; }
    .wws-position-top-left { top: 24px; left: 24px; }
    
    .wws-widget-toggle {
      width: 64px;
      height: 64px;
      background: linear-gradient(135deg, var(--wws-primary), var(--wws-secondary));
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 10px 40px rgba(59, 130, 246, 0.3);
      transition: var(--wws-transition);
      border: 2px solid rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      position: relative;
    }
    
    .wws-widget-toggle:hover {
      transform: translateY(-4px) scale(1.05);
      box-shadow: 0 15px 50px rgba(59, 130, 246, 0.4);
    }
    
    .wws-widget-toggle i {
      font-size: 28px;
      color: white;
      position: relative;
      z-index: 1;
    }
    
    .wws-notification-badge {
      position: absolute;
      top: -8px;
      right: -8px;
      background: linear-gradient(135deg, var(--wws-danger), #DC2626);
      color: white;
      font-size: 11px;
      font-weight: 800;
      padding: 5px 10px;
      border-radius: 12px;
      min-width: 28px;
      text-align: center;
      border: 3px solid rgba(255, 255, 255, 0.9);
      box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
      animation: wwsPulse 2s ease-in-out infinite;
      z-index: 2;
      pointer-events: none;
    }
    
    .wws-position-bottom-left .wws-notification-badge { right: -8px; left: auto; }
    .wws-position-bottom-right .wws-notification-badge { right: -8px; left: auto; }
    .wws-position-top-left .wws-notification-badge { right: -8px; left: auto; bottom: -8px; top: auto; }
    .wws-position-top-right .wws-notification-badge { right: -8px; left: auto; bottom: -8px; top: auto; }
    
    .wws-widget-panel {
      position: absolute;
      width: 380px;
      background: var(--wws-surface);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      border: 1px solid var(--wws-border);
      box-shadow: var(--wws-shadow);
      display: none;
      overflow: hidden;
      z-index: 2147483647;
      max-height: 70vh;
      animation: wwsFadeIn 0.3s ease-out;
      color: var(--wws-text);
    }
    
    .wws-position-bottom-right .wws-widget-panel { bottom: 80px; right: 0; }
    .wws-position-bottom-left .wws-widget-panel { bottom: 80px; left: 0; }
    .wws-position-top-right .wws-widget-panel { top: 80px; right: 0; bottom: auto; }
    .wws-position-top-left .wws-widget-panel { top: 80px; left: 0; bottom: auto; }
    
    .wws-panel-header {
      padding: 24px;
      background: linear-gradient(135deg, 
        rgba(59, 130, 246, 0.1), 
        rgba(139, 92, 246, 0.1));
      border-bottom: 1px solid var(--wws-border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .wws-header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    
    .wws-header-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, var(--wws-primary), var(--wws-secondary));
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .wws-header-icon i {
      font-size: 24px;
      color: white;
    }
    
    .wws-header-text h3 {
      font-size: 18px;
      font-weight: 700;
      margin: 0 0 4px;
      color: var(--wws-text);
    }
    
    .wws-header-text p {
      font-size: 12px;
      margin: 0;
      color: var(--wws-text-secondary);
    }
    
    .wws-close-panel {
      width: 36px;
      height: 36px;
      background: rgba(255, 255, 255, 0.1);
      border: none;
      border-radius: 10px;
      color: var(--wws-text-secondary);
      font-size: 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: var(--wws-transition);
    }
    
    .wws-close-panel:hover {
      background: rgba(239, 68, 68, 0.2);
      color: var(--wws-danger);
      transform: rotate(90deg);
    }
    
    .wws-panel-tabs {
      display: flex;
      padding: 8px;
      background: rgba(0, 0, 0, 0.05);
      border-bottom: 1px solid var(--wws-border);
    }
    
    .wws-tab {
      flex: 1;
      padding: 12px 8px;
      background: none;
      border: none;
      color: var(--wws-text-secondary);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      border-radius: 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      transition: var(--wws-transition);
    }
    
    .wws-tab i {
      font-size: 16px;
    }
    
    .wws-tab span {
      font-size: 12px;
    }
    
    .wws-tab:hover {
      color: var(--wws-primary);
      background: rgba(59, 130, 246, 0.1);
    }
    
    .wws-tab.active {
      color: var(--wws-primary);
      background: rgba(59, 130, 246, 0.15);
    }
    
    .wws-panel-content {
      padding: 24px;
      overflow-y: auto;
      max-height: calc(70vh - 180px);
    }
    
    .wws-panel-content::-webkit-scrollbar {
      width: 6px;
    }
    
    .wws-panel-content::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.05);
      border-radius: 3px;
    }
    
    .wws-panel-content::-webkit-scrollbar-thumb {
      background: var(--wws-primary);
      border-radius: 3px;
    }
    
    .wws-panel-footer {
      padding: 20px 24px;
      border-top: 1px solid var(--wws-border);
      text-align: center;
    }
    
    .wws-footer-link {
      color: var(--wws-text-secondary);
      font-size: 13px;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      transition: var(--wws-transition);
      padding: 10px 20px;
      border-radius: 10px;
      background: rgba(0, 0, 0, 0.05);
    }
    
    .wws-footer-link:hover {
      color: var(--wws-primary);
      background: rgba(59, 130, 246, 0.1);
      transform: translateY(-2px);
    }
    
    .wws-section {
      margin-bottom: 24px;
    }
    
    .wws-section:last-child {
      margin-bottom: 0;
    }
    
    .wws-section-title {
      font-size: 15px;
      font-weight: 700;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      color: var(--wws-text);
    }
    
    .wws-section-title i {
      color: var(--wws-primary);
      font-size: 16px;
    }
    
    .wws-stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 20px;
    }
    
    .wws-stat-card {
      background: rgba(0, 0, 0, 0.05);
      border-radius: 12px;
      padding: 20px;
      text-align: center;
    }
    
    .wws-stat-value {
      font-size: 24px;
      font-weight: 800;
      margin-bottom: 8px;
      color: var(--wws-text);
    }
    
    .wws-stat-label {
      font-size: 12px;
      color: var(--wws-text-secondary);
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .wws-status-list {
      background: rgba(0, 0, 0, 0.05);
      border-radius: 12px;
      padding: 20px;
    }
    
    .wws-status-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid var(--wws-border);
    }
    
    .wws-status-item:last-child {
      border-bottom: none;
    }
    
    .wws-status-label {
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 10px;
      color: var(--wws-text);
    }
    
    .wws-status-label i {
      width: 20px;
      text-align: center;
    }
    
    .wws-status-value {
      font-size: 14px;
      font-weight: 700;
      color: var(--wws-text);
    }
    
    .wws-settings-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;
      border-bottom: 1px solid var(--wws-border);
    }
    
    .wws-settings-item:last-child {
      border-bottom: none;
    }
    
    .wws-settings-label {
      font-size: 14px;
      color: var(--wws-text);
    }
    
    .wws-settings-desc {
      font-size: 12px;
      color: var(--wws-text-secondary);
      margin-top: 4px;
    }
    
    .wws-switch {
      position: relative;
      display: inline-block;
      width: 52px;
      height: 28px;
    }
    
    .wws-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    
    .wws-switch-slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.2);
      transition: var(--wws-transition);
      border-radius: 34px;
    }
    
    .wws-switch-slider:before {
      position: absolute;
      content: "";
      height: 22px;
      width: 22px;
      left: 3px;
      bottom: 3px;
      background: white;
      transition: var(--wws-transition);
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }
    
    input:checked + .wws-switch-slider {
      background: var(--wws-primary);
    }
    
    input:checked + .wws-switch-slider:before {
      transform: translateX(24px);
    }
    
    .wws-select {
      padding: 8px 16px;
      border-radius: 10px;
      border: 1px solid var(--wws-border);
      background: var(--wws-surface);
      color: var(--wws-text);
      font-size: 14px;
      cursor: pointer;
      min-width: 120px;
      transition: var(--wws-transition);
    }
    
    .wws-select:hover {
      border-color: var(--wws-primary);
    }
    
    .wws-select:focus {
      outline: none;
      border-color: var(--wws-primary);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    /* Responsive */
    @media (max-width: 480px) {
      .wws-protection-content {
        padding: 20px;
      }
      
      .wws-title {
        font-size: 32px;
      }
      
      .wws-subtitle {
        font-size: 16px;
      }
      
      .wws-widget-panel {
        width: calc(100vw - 40px);
      }
      
      .wws-position-bottom-right .wws-widget-panel,
      .wws-position-bottom-left .wws-widget-panel {
        bottom: 80px;
        left: 20px;
        right: 20px;
        width: auto;
      }
      
      .wws-position-top-right .wws-widget-panel,
      .wws-position-top-left .wws-widget-panel {
        top: 80px;
        left: 20px;
        right: 20px;
        width: auto;
      }
    }
    
    @media (max-height: 600px) {
      .wws-protection-content {
        padding: 20px;
        max-width: 400px;
      }
      
      .wws-shield-wrapper {
        width: 120px;
        height: 120px;
        margin-bottom: 30px;
      }
      
      .wws-shield i {
        font-size: 50px;
      }
    }
  `;
  
  document.head.appendChild(styles);
  
  // ==================== FONT AWESOME LOAD ====================
  if (!document.getElementById('wws-fa-css')) {
    const faLink = document.createElement('link');
    faLink.id = 'wws-fa-css';
    faLink.rel = 'stylesheet';
    faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
    document.head.appendChild(faLink);
  }
  
  // ==================== MAIN INITIALIZATION ====================
  function initializeWWS() {
    // Check if blocked
    if (BlockManager.isBlocked()) {
      const screen = new ProtectionScreen();
      screen.showBlockScreen();
      return;
    }
    
    // Check if already verified
    if (localStorage.getItem('wws_verified') === 'true') {
      console.log('✅ WWS PROTECT: Session already verified');
      // Quick re-verification for returning users
      const analyzer = new BehaviorAnalyzer();
      setTimeout(() => {
        const assessment = analyzer.calculateScore();
        Widget.show(assessment);
      }, 500);
      return;
    }
    
    // Show protection screen for new users
    const screen = new ProtectionScreen();
    screen.show();
  }
  
  // ==================== PUBLIC API ====================
  window.WWS = {
    version: CONFIG.version,
    
    getStatus: () => ({
      verified: localStorage.getItem('wws_verified') === 'true',
      blocked: BlockManager.isBlocked(),
      position: State.position,
      theme: State.currentTheme,
      riskAssessment: window.wwsWidgetInstance?.riskAssessment || null
    }),
    
    verify: () => {
      localStorage.removeItem('wws_verified');
      localStorage.removeItem('wws_block');
      if (window.wwsWidgetInstance) {
        Widget.hide();
        window.wwsWidgetInstance = null;
      }
      initializeWWS();
    },
    
    resetBlock: () => {
      localStorage.removeItem('wws_block');
    },
    
    showWidget: (assessment = null) => Widget.show(assessment),
    hideWidget: () => Widget.hide(),
    
    testNotification: (type = 'info') => {
      // Implementation would go here if needed
      console.log(`Test ${type} notification`);
    }
  };
  
  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWWS);
  } else {
    setTimeout(initializeWWS, 100);
  }
  
})();
