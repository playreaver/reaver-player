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
      low: 30,      // Score > 70 = low risk
      medium: 60    // Score 30-70 = medium risk (challenge)
    },
    
    // Block settings
    blockDuration: 5 * 60 * 1000, // 5 minutes in ms
    
    // Behavior analysis settings
    behavior: {
      minHumanTime: 2000,        // Minimum time on page (ms)
      maxBotClicks: 50,          // Max clicks per second for bot detection
      requiredInteractions: 3,   // Min different interaction types
      maxMouseSpeed: 2000        // Max mouse speed px/sec for human
    },
    
    widget: {
      position: 'bottom-right',
      defaultTheme: 'dark',
      themes: { /* Same as before */ }
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
        hasNaturalScrolling: false
      };
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
        this.data.clicks++;
        this.checkClickSpeed();
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
    
    checkClickSpeed() {
      const recentClicks = this.data.mouseMoves.filter(move => 
        Date.now() - move.timestamp < 1000
      ).length;
      if (recentClicks > CONFIG.behavior.maxBotClicks) {
        this.data.abnormalClickSpeed = true;
      }
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
        reasons.push('Too fast page visit');
      }
      
      // 2. Mouse movement realism (25 points)
      if (this.data.hasMouseMovement) {
        const avgSpeed = this.data.mouseMoves.reduce((sum, move) => sum + move.speed, 0) / 
                        (this.data.mouseMoves.length || 1);
        if (avgSpeed < CONFIG.behavior.maxMouseSpeed) {
          score += 25;
        } else {
          reasons.push('Unnatural mouse speed');
        }
      } else {
        reasons.push('No mouse movement');
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
        reasons.push('Limited interaction types');
      }
      
      // 4. Natural behavior (20 points)
      if (this.data.hasNaturalScrolling && !this.data.abnormalClickSpeed) {
        score += 20;
      } else {
        reasons.push('Abnormal interaction pattern');
      }
      
      // Bot signature detection (-50 points)
      if (this.detectBotSignature()) {
        score = Math.max(0, score - 50);
        reasons.push('Bot signature detected');
      }
      
      return {
        score: Math.min(100, Math.max(0, score)),
        riskLevel: this.getRiskLevel(score),
        reasons: reasons,
        rawData: { ...this.data }
      };
    }
    
    detectBotSignature() {
      // Check for headless browser
      if (navigator.webdriver || navigator.automationControlled) return true;
      
      // Check for common bot indicators
      const botIndicators = [
        'bot', 'crawler', 'spider', 'headless', 'phantom'
      ];
      if (botIndicators.some(ind => navigator.userAgent.toLowerCase().includes(ind))) {
        return true;
      }
      
      // Check screen resolution (bots often have 0x0 or unusual sizes)
      if (screen.width === 0 || screen.height === 0) return true;
      
      // Check plugins and languages (bots have none)
      if (navigator.plugins.length === 0 && navigator.languages.length === 0) return true;
      
      return false;
    }
    
    getRiskLevel(score) {
      if (score > CONFIG.riskThresholds.low) return 'low';
      if (score > CONFIG.riskThresholds.medium) return 'medium';
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
            reason: 'Human behavior confirmed'
          };
        
        case 'medium':
          return {
            action: 'challenge',
            message: 'Verification required',
            reason: 'Suspicious behavior detected',
            challenge: this.generateChallenge()
          };
        
        case 'high':
          return {
            action: 'block',
            message: 'Access blocked',
            reason: 'Bot detected',
            unblockTime: Date.now() + CONFIG.blockDuration
          };
      }
    }
    
    generateChallenge() {
      // Simple math challenge (can be replaced with reCAPTCHA)
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
      
      const { unblockTime } = JSON.parse(blockData);
      if (Date.now() > unblockTime) {
        localStorage.removeItem('wws_block');
        return false;
      }
      
      return true;
    }
    
    static block(duration = CONFIG.blockDuration) {
      const unblockTime = Date.now() + duration;
      localStorage.setItem('wws_block', JSON.stringify({ unblockTime }));
      return unblockTime;
    }
    
    static getUnblockTime() {
      const blockData = localStorage.getItem('wws_block');
      if (!blockData) return null;
      return JSON.parse(blockData).unblockTime;
    }
  }
  
  // ==================== PROTECTION SCREEN ====================
  class ProtectionScreen {
    constructor() {
      this.screen = null;
      this.riskManager = new RiskManager();
      this.decision = null;
    }
    
    show() {
      if (BlockManager.isBlocked()) {
        this.showBlockScreen();
        return;
      }
      
      // Start behavior analysis
      this.screen = document.createElement('div');
      this.screen.className = 'wws-protection-screen';
      this.screen.innerHTML = this.getInitialHTML();
      document.body.appendChild(this.screen);
      
      // Analyze in background
      setTimeout(() => this.runAnalysis(), 1500);
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
      const statusText = document.getElementById('wws-status-text');
      const progressPercent = document.getElementById('wws-progress-percent');
      
      if (statusText) statusText.textContent = 'Human verified';
      if (progressPercent) progressPercent.textContent = 'Complete';
      
      localStorage.setItem('wws_verified', 'true');
      
      setTimeout(() => {
        this.hide();
        Widget.show(this.decision);
      }, 1500);
    }
    
    showChallenge() {
      if (!this.screen) return;
      
      const content = this.screen.querySelector('.wws-status-container');
      const challenge = this.decision.challenge;
      
      content.innerHTML = `
        <div class="wws-status-text" style="color: var(--wws-warning); margin-bottom: 24px;">
          <i class="fas fa-robot"></i> Verify you're human
        </div>
        
        <div style="background: rgba(0,0,0,0.1); padding: 24px; border-radius: 12px; margin-bottom: 20px;">
          <div style="font-size: 18px; margin-bottom: 16px;">${challenge.question}</div>
          <input type="number" id="wws-challenge-input" 
                 style="width: 100%; padding: 12px; border-radius: 8px; border: none; font-size: 16px; text-align: center;"
                 placeholder="Your answer">
        </div>
        
        <button id="wws-challenge-submit" 
                style="width: 100%; padding: 14px; background: var(--wws-primary); color: white; 
                       border: none; border-radius: 12px; font-size: 16px; cursor: pointer;">
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
      
      const unblockTime = BlockManager.getUnblockTime();
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
            <div class="wws-status-text" style="color: var(--wws-danger);">
              <i class="fas fa-clock"></i> Try again in 
              <span id="wws-countdown"></span>
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
          document.body.removeChild(element);
          this.show(); // Restart verification
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
      if (this.screen && this.screen.parentNode) {
        this.screen.parentNode.removeChild(this.screen);
        this.screen = null;
      }
    }
  }
  
  // ==================== ENHANCED WIDGET ====================
  class Widget {
    // ... (остается таким же, но с реальными данными)
    constructor() {
      this.widget = null;
      this.panel = null;
      this.isPanelOpen = false;
      this.currentTab = 'overview';
      this.riskAssessment = null;
      this.init();
    }
    
    show(assessment) {
      this.riskAssessment = assessment;
      // ... остальной код
    }
    
    renderOverview(container) {
      if (!this.riskAssessment) return;
      
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
            ${this.riskAssessment.reasons.map(reason => `
              <div class="wws-status-item">
                <div class="wws-status-label">
                  <i class="fas fa-exclamation-triangle" style="color: var(--wws-warning)"></i>
                  ${reason}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
    
    getRiskColor() {
      switch (this.riskAssessment?.riskLevel) {
        case 'low': return 'var(--wws-success)';
        case 'medium': return 'var(--wws-warning)';
        case 'high': return 'var(--wws-danger)';
        default: return 'var(--wws-text-secondary)';
      }
    }
    
    // ... Остальные методы остаются без изменений
  }
  
  // ==================== MAIN INITIALIZATION ====================
  function initializeWWS() {
    if (BlockManager.isBlocked()) {
      const screen = new ProtectionScreen();
      screen.showBlockScreen();
      return;
    }
    
    if (localStorage.getItem('wws_verified') === 'true') {
      // Quick re-verification for returning users
      const analyzer = new BehaviorAnalyzer();
      setTimeout(() => {
        const assessment = analyzer.calculateScore();
        Widget.show(assessment);
      }, 500);
      return;
    }
    
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
      riskAssessment: window.wwsWidgetInstance?.riskAssessment
    }),
    verify: () => {
      localStorage.removeItem('wws_verified');
      localStorage.removeItem('wws_block');
      initializeWWS();
    },
    resetBlock: () => {
      localStorage.removeItem('wws_block');
    },
    // ... Остальной API
  };
  
  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWWS);
  } else {
    initializeWWS();
  }
  
})();
