/**
 * WWS Gateway v4.3 - Premium Security System
 * Real-time Analysis with Instant Results
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
      <div style="text-align: center; z-index: 10; position: relative; max-width: 500px; padding: 30px;">
        <!-- Главная иконка с анимацией -->
        <div style="margin-bottom: 40px; position: relative;">
          <div style="position: relative; display: inline-block;">
            <i class="fas fa-shield-alt" style="font-size: 72px; background: linear-gradient(135deg, #6C63FF, #36D1DC); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; display: inline-block; animation: wws-shield-glow 3s ease-in-out infinite;"></i>
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 100px; height: 100px; border: 2px solid rgba(108, 99, 255, 0.3); border-radius: 50%; animation: wws-ripple 2s ease-out infinite;"></div>
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 120px; height: 120px; border: 2px solid rgba(108, 99, 255, 0.1); border-radius: 50%; animation: wws-ripple 2s ease-out infinite; animation-delay: 0.5s;"></div>
          </div>
        </div>
        
        <!-- Текст -->
        <h1 style="color: white; margin: 0 0 15px; font-size: 32px; font-weight: 700; letter-spacing: 1px;">WWS PROTECT</h1>
        <p id="wws-status-text" style="color: #a0a0c0; font-size: 16px; margin: 0 0 30px; font-weight: 300;">Real-time security scan...</p>
        
        <!-- Детали анализа -->
        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 15px; padding: 20px; margin-bottom: 25px; border: 1px solid rgba(255, 255, 255, 0.1);">
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 15px;">
            <div style="text-align: center;">
              <div style="color: #6C63FF; font-size: 22px; font-weight: bold;" id="wws-risk-display">0%</div>
              <div style="color: #6c6c8c; font-size: 11px; margin-top: 5px;">RISK LEVEL</div>
            </div>
            <div style="text-align: center;">
              <div style="color: #36D1DC; font-size: 22px; font-weight: bold;"><i class="fas fa-fingerprint" style="animation: wws-spin 2s linear infinite;"></i></div>
              <div style="color: #6c6c8c; font-size: 11px; margin-top: 5px;">DEVICE SCAN</div>
            </div>
            <div style="text-align: center;">
              <div style="color: #a78bfa; font-size: 22px; font-weight: bold;"><i class="fas fa-brain" style="animation: wws-pulse 1.5s ease-in-out infinite;"></i></div>
              <div style="color: #6c6c8c; font-size: 11px; margin-top: 5px;">BEHAVIORAL AI</div>
            </div>
          </div>
          
          <!-- Прогресс бар -->
          <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; margin: 0 auto 10px; overflow: hidden; box-shadow: 0 0 15px rgba(108, 99, 255, 0.2);">
            <div id="wws-progress-bar" style="height: 100%; width: 0%; background: linear-gradient(90deg, #6C63FF, #36D1DC, #6C63FF); background-size: 200% 100%; transition: width 0.3s ease; animation: wws-gradient-flow 2s ease-in-out infinite;"></div>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8;">
            <span>0%</span>
            <span id="wws-progress-text">Initializing...</span>
            <span>100%</span>
          </div>
        </div>
        
        <!-- Результат проверки -->
        <div id="wws-result-container" style="display: none; margin-top: 25px;">
          <div id="wws-result-icon" style="font-size: 60px; margin-bottom: 20px;"></div>
          <div id="wws-result-text" style="color: #a0a0c0; font-size: 16px; margin: 0 0 15px;"></div>
          <div id="wws-result-action" style="margin-top: 20px;"></div>
        </div>
        
        <!-- Статус иконки -->
        <div id="wws-status-icon" style="color: #fbbf24; font-size: 14px; margin-top: 20px; display: flex; align-items: center; justify-content: center; gap: 10px;">
          <i class="fas fa-cog fa-spin"></i> <span id="wws-status-message">Analyzing security parameters...</span>
        </div>
        
        <!-- Powered by -->
        <div style="margin-top: 40px; color: #6c6c8c; font-size: 12px;">
          Powered by <a href="https://reaver.is-a.dev/" target="_blank" style="color: #6C63FF; text-decoration: none; font-weight: 600;">Wandering Wizardry Studios</a>
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
        
        @keyframes wws-checkmark {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes wws-cross {
          0% { transform: rotate(0deg) scale(0); opacity: 0; }
          50% { transform: rotate(-180deg) scale(1.2); opacity: 1; }
          100% { transform: rotate(-360deg) scale(1); opacity: 1; }
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
    
    function updateStatus(text, progress, risk, message) {
      const statusEl = overlay.querySelector('#wws-status-text');
      const progressBar = overlay.querySelector('#wws-progress-bar');
      const riskDisplay = overlay.querySelector('#wws-risk-display');
      const statusMessage = overlay.querySelector('#wws-status-message');
      const progressText = overlay.querySelector('#wws-progress-text');
      
      if (statusEl) statusEl.textContent = text;
      if (progressBar) {
        progressBar.style.width = progress + '%';
      }
      if (riskDisplay) riskDisplay.textContent = (risk || 0) + '%';
      if (statusMessage) statusMessage.textContent = message || 'Analyzing...';
      if (progressText) {
        progressText.textContent = progress === 100 ? 'Complete' : progress + '%';
      }
    }
    
    function showResult(icon, text, color, actionHTML) {
      const container = overlay.querySelector('#wws-result-container');
      const iconEl = overlay.querySelector('#wws-result-icon');
      const textEl = overlay.querySelector('#wws-result-text');
      const actionEl = overlay.querySelector('#wws-result-action');
      const statusIcon = overlay.querySelector('#wws-status-icon');
      
      if (container) container.style.display = 'block';
      if (iconEl) {
        iconEl.innerHTML = icon;
        iconEl.style.color = color;
        iconEl.style.animation = 'none';
      }
      if (textEl) {
        textEl.textContent = text;
        textEl.style.color = color;
      }
      if (actionEl && actionHTML) {
        actionEl.innerHTML = actionHTML;
      }
      if (statusIcon) statusIcon.style.display = 'none';
    }
    
    function hideResult() {
      const container = overlay.querySelector('#wws-result-container');
      if (container) container.style.display = 'none';
    }
    
    function resetResult() {
      hideResult();
      const statusIcon = overlay.querySelector('#wws-status-icon');
      if (statusIcon) statusIcon.style.display = 'flex';
    }
    
    if (document.body) show();
    else document.addEventListener('DOMContentLoaded', show);
    
    return { show, hide, updateStatus, showResult, hideResult, resetResult };
  })();
  
  // ==================== ADVANCED BEHAVIORAL ANALYZER (БЫСТРАЯ ВЕРСИЯ) ====================
  
  class AdvancedBehaviorAnalyzer {
    constructor() {
      this.mousePattern = [];
      this.clickIntervals = [];
      this.movementSpeeds = [];
      this.scrollPattern = [];
      this.keyboardPattern = [];
      this.lastClickTime = Date.now();
      this.lastMoveTime = Date.now();
      this.lastScrollTime = Date.now();
      this.currentPath = [];
      this.isBotLike = false;
      this.suspiciousScore = 0;
      this.behaviorFlags = {
        tooFastClicks: false,
        linearMovement: false,
        perfectScrolling: false,
        devToolsDetected: false,
        headlessBrowser: false,
        automationTools: false
      };
      
      this.startAdvancedTracking();
    }
    
    startAdvancedTracking() {
      // Только базовое отслеживание для быстрой проверки
      let lastMousePosition = null;
      let lastMouseTime = Date.now();
      
      document.addEventListener('mousemove', (e) => {
        const now = Date.now();
        const point = {
          x: e.clientX,
          y: e.clientY,
          t: now
        };
        
        this.currentPath.push(point);
        if (this.currentPath.length > 50) this.currentPath.shift();
      });
      
      document.addEventListener('click', (e) => {
        const now = Date.now();
        const interval = now - this.lastClickTime;
        this.clickIntervals.push(interval);
        this.lastClickTime = now;
        
        if (this.clickIntervals.length > 10) {
          this.clickIntervals.shift();
        }
      });
    }
    
    getRiskScore() {
      return Math.min(this.suspiciousScore, 1);
    }
    
    getBehaviorReport() {
      const riskScore = this.getRiskScore();
      
      return {
        mouseMovements: this.currentPath.length,
        clickCount: this.clickIntervals.length,
        avgClickInterval: this.clickIntervals.length > 0 ? 
          this.clickIntervals.reduce((a, b) => a + b, 0) / this.clickIntervals.length : 0,
        scrollEvents: this.scrollPattern.length,
        keyPresses: this.keyboardPattern.length,
        isBotLike: riskScore > 0.6,
        riskScore: riskScore,
        flags: this.behaviorFlags,
        humanProbability: Math.max(0, 1 - riskScore) * 100
      };
    }
    
    getRiskFactors() {
      const factors = [];
      const report = this.getBehaviorReport();
      
      if (report.flags.tooFastClicks) {
        factors.push({
          type: 'behavior',
          level: 'high',
          message: 'Unnaturally fast clicking detected',
          score: 0.5
        });
      }
      
      if (report.flags.linearMovement) {
        factors.push({
          type: 'behavior',
          level: 'high',
          message: 'Robotic linear mouse movement patterns',
          score: 0.4
        });
      }
      
      if (report.flags.headlessBrowser) {
        factors.push({
          type: 'technical',
          level: 'critical',
          message: 'Headless browser indicators detected',
          score: 0.6
        });
      }
      
      return factors;
    }
  }
  
  // ==================== MAIN SECURITY SYSTEM ====================
  
  const CONFIG = {
    debug: true,
    version: '4.3',
    
    riskThresholds: {
      LOW: 0.3,    // Мониторинг
      MEDIUM: 0.6,  // Простая проверка
      HIGH: 0.8    // Полная проверка или блокировка
    },
    
    weights: {
      behavior: 0.50,
      technical: 0.30,
      reputation: 0.15,
      network: 0.05
    },
    
    blockDuration: 5 * 60 * 1000, // 5 минут в миллисекундах
    analysisTimeout: 3000, // Максимум 3 секунды на проверку
    minAnalysisTime: 1500 // Минимум 1.5 секунды для визуала
  };
  
  window.WWS = null;
  
  class WWSRiskAnalyzer {
    constructor() {
      // Проверяем блокировку
      const blockExpiry = sessionStorage.getItem('wws_block_expiry');
      if (blockExpiry && Date.now() < parseInt(blockExpiry)) {
        const timeLeft = Math.ceil((parseInt(blockExpiry) - Date.now()) / 1000 / 60);
        this.showBlockScreen(`Access blocked. Try again in ${timeLeft} minutes.`);
        return;
      }
      
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
      this.currentPanel = 'overview';
      this.accessGranted = false;
      this.analysisStartTime = Date.now();
      
      this.loadUserHistory();
      this.log('System initialized v' + CONFIG.version);
      
      // Проверяем, не верифицирована ли уже сессия
      if (sessionStorage.getItem('wws_session_passed') === 'true') {
        this.log('Premium session already verified');
        this.verdict = 'allow';
        this.riskScore = 0;
        this.behaviorAnalyzer = new AdvancedBehaviorAnalyzer();
        this.showSuccessAndProceed();
        return;
      }
      
      // Запускаем быструю проверку
      this.startQuickAnalysis();
    }
    
    async startQuickAnalysis() {
      if (this.isRunning) return;
      this.isRunning = true;
      
      console.log('🛡️ Starting quick real-time analysis');
      
      // Запускаем анимацию прогресса
      this.startProgressAnimation();
      
      // Запускаем реальную проверку параллельно
      try {
        await Promise.race([
          this.performRealAnalysis(),
          new Promise(resolve => setTimeout(resolve, CONFIG.analysisTimeout))
        ]);
      } catch (error) {
        console.error('🛡️ Analysis error:', error);
        this.verdict = 'allow_with_logging';
        this.riskScore = 0.3;
      }
      
      // Ждем минимум 1.5 секунды для визуала
      const elapsed = Date.now() - this.analysisStartTime;
      if (elapsed < CONFIG.minAnalysisTime) {
        await new Promise(resolve => setTimeout(resolve, CONFIG.minAnalysisTime - elapsed));
      }
      
      // Показываем результат
      this.showAnalysisResult();
    }
    
    startProgressAnimation() {
      let progress = 0;
      const steps = 30; // 30 шагов за 1.5 секунды
      const stepDuration = 50; // 50ms каждый шаг
      
      const animate = () => {
        progress += 3.33; // До 100% за 30 шагов
        if (progress > 100) progress = 100;
        
        const risk = Math.min(progress * 0.8, 80);
        
        PROTECTION_LAYER.updateStatus(
          'Performing security scan...',
          progress,
          Math.round(risk),
          this.getStatusMessage(progress)
        );
        
        if (progress < 100) {
          setTimeout(animate, stepDuration);
        }
      };
      
      setTimeout(animate, stepDuration);
    }
    
    getStatusMessage(progress) {
      const messages = [
        'Checking device fingerprint...',
        'Analyzing browser integrity...',
        'Scanning for automation tools...',
        'Evaluating behavioral patterns...',
        'Finalizing security assessment...'
      ];
      
      const index = Math.floor((progress / 100) * messages.length);
      return messages[Math.min(index, messages.length - 1)];
    }
    
    async performRealAnalysis() {
      // Быстрая реальная проверка
      PROTECTION_LAYER.updateStatus('Collecting behavioral data...', 20, 10, 'Tracking initial interactions');
      this.behaviorAnalyzer = new AdvancedBehaviorAnalyzer();
      
      // Даем 500ms для сбора начальных поведенческих данных
      await new Promise(resolve => setTimeout(resolve, 500));
      
      PROTECTION_LAYER.updateStatus('Analyzing technical parameters...', 50, 30, 'Checking browser and device');
      this.collectTechnicalData();
      this.collectNetworkData();
      this.loadUserHistory();
      
      PROTECTION_LAYER.updateStatus('Computing risk assessment...', 80, 60, 'Final analysis');
      this.analyzeRisk();
      
      console.log('🛡️ Real analysis completed in', Date.now() - this.analysisStartTime, 'ms');
    }
    
    showAnalysisResult() {
      console.log('🛡️ Analysis result:', {
        verdict: this.verdict,
        riskScore: this.riskScore,
        factors: this.riskFactors.length
      });
      
      switch (this.verdict) {
        case 'block':
          this.showBlockResult();
          break;
        case 'full_captcha':
        case 'simple_captcha':
          this.showVerificationResult();
          break;
        case 'allow_with_logging':
          this.showWarningResult();
          break;
        default:
          this.showSuccessResult();
          break;
      }
    }
    
    showSuccessResult() {
      // Зеленая галочка
      PROTECTION_LAYER.showResult(
        '<i class="fas fa-check-circle" style="animation: wws-checkmark 0.5s ease-out forwards;"></i>',
        'Security check passed ✓',
        '#10b981',
        '<button id="wws-continue-btn" style="padding: 12px 24px; background: #10b981; color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; font-size: 14px;">Continue to Site <i class="fas fa-arrow-right"></i></button>'
      );
      
      document.getElementById('wws-continue-btn').addEventListener('click', () => {
        this.allowAccess();
      });
      
      // Автоматически продолжаем через 2 секунды
      setTimeout(() => {
        if (!this.accessGranted) {
          this.allowAccess();
        }
      }, 2000);
    }
    
    showWarningResult() {
      // Желтый восклицательный знак
      PROTECTION_LAYER.showResult(
        '<i class="fas fa-exclamation-triangle" style="animation: wws-pulse 1s ease-in-out infinite;"></i>',
        'Suspicious activity detected',
        '#f59e0b',
        '<button id="wws-proceed-btn" style="padding: 12px 24px; background: #f59e0b; color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; font-size: 14px; margin-right: 10px;">Proceed with Caution</button>' +
        '<button id="wws-verify-btn" style="padding: 12px 24px; background: transparent; color: #f59e0b; border: 2px solid #f59e0b; border-radius: 10px; font-weight: 600; cursor: pointer; font-size: 14px;">Verify Identity</button>'
      );
      
      document.getElementById('wws-proceed-btn').addEventListener('click', () => {
        this.allowAccessWithLogging();
      });
      
      document.getElementById('wws-verify-btn').addEventListener('click', () => {
        this.showVerificationResult();
      });
    }
    
    showVerificationResult() {
      // Синий щит с вопросом
      PROTECTION_LAYER.showResult(
        '<i class="fas fa-shield-alt" style="animation: wws-pulse 1s ease-in-out infinite;"></i>',
        'Additional verification required',
        '#3b82f6',
        '<div style="background: rgba(59, 130, 246, 0.1); border-radius: 10px; padding: 20px; margin-bottom: 15px;">' +
          '<div style="font-size: 24px; font-weight: bold; color: white; margin-bottom: 10px;" id="captcha-question">3 + 4 = ?</div>' +
          '<input type="text" id="captcha-answer" placeholder="Enter answer" style="width: 100%; padding: 12px; background: rgba(255,255,255,0.1); border: 2px solid #3b82f6; border-radius: 8px; color: white; text-align: center; font-size: 16px; outline: none;">' +
        '</div>' +
        '<button id="captcha-submit" style="width: 100%; padding: 14px; background: #3b82f6; color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; font-size: 14px;">Verify & Continue</button>'
      );
      
      // Генерируем простую капчу
      const a = Math.floor(Math.random() * 5) + 1;
      const b = Math.floor(Math.random() * 5) + 1;
      const answer = a + b;
      document.getElementById('captcha-question').textContent = `${a} + ${b} = ?`;
      
      document.getElementById('captcha-submit').addEventListener('click', () => {
        const userAnswer = parseInt(document.getElementById('captcha-answer').value.trim());
        if (userAnswer === answer) {
          this.showSuccessAndProceed();
        } else {
          document.getElementById('captcha-answer').value = '';
          document.getElementById('captcha-answer').placeholder = 'Incorrect, try again';
          document.getElementById('captcha-answer').style.borderColor = '#ef4444';
          setTimeout(() => {
            document.getElementById('captcha-answer').placeholder = 'Enter answer';
            document.getElementById('captcha-answer').style.borderColor = '#3b82f6';
          }, 1500);
        }
      });
      
      document.getElementById('captcha-answer').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          document.getElementById('captcha-submit').click();
        }
      });
    }
    
    showBlockResult() {
      // Красный крестик
      PROTECTION_LAYER.showResult(
        '<i class="fas fa-ban" style="animation: wws-cross 0.8s ease-out forwards;"></i>',
        'Access denied - High risk detected',
        '#ef4444',
        '<div style="text-align: left; background: rgba(239, 68, 68, 0.1); padding: 15px; border-radius: 10px; margin-bottom: 15px; font-size: 12px;">' +
          '<div style="color: #fca5a5; margin-bottom: 8px;"><i class="fas fa-exclamation-circle"></i> Blocked for 5 minutes</div>' +
          '<div id="block-reasons" style="color: #fca5a5;"></div>' +
        '</div>' +
        '<div style="color: #94a3b8; font-size: 11px; margin-top: 10px;">Try again later or contact support</div>'
      );
      
      // Показываем причины
      const reasonsEl = document.getElementById('block-reasons');
      if (reasonsEl && this.riskFactors.length > 0) {
        const criticalFactors = this.riskFactors.filter(f => f.level === 'critical' || f.level === 'high');
        reasonsEl.innerHTML = criticalFactors.slice(0, 3).map(factor => 
          `<div style="margin-bottom: 5px;">• ${factor.message}</div>`
        ).join('');
      }
      
      // Устанавливаем блокировку на 5 минут
      sessionStorage.setItem('wws_block_expiry', Date.now() + CONFIG.blockDuration);
    }
    
    showBlockScreen(message = 'Access temporarily blocked') {
      PROTECTION_LAYER.showResult(
        '<i class="fas fa-ban" style="color: #ef4444; font-size: 60px;"></i>',
        message,
        '#ef4444',
        '<div style="color: #94a3b8; font-size: 12px; margin-top: 10px;">Please wait and try again</div>'
      );
    }
    
    showSuccessAndProceed() {
      PROTECTION_LAYER.showResult(
        '<i class="fas fa-check-circle" style="color: #10b981; font-size: 60px; animation: wws-checkmark 0.5s ease-out forwards;"></i>',
        'Session verified ✓',
        '#10b981',
        '<div style="color: #94a3b8; font-size: 12px; margin-top: 10px;">Redirecting to site...</div>'
      );
      
      setTimeout(() => {
        this.allowAccess();
      }, 1000);
    }
    
    // ==================== БАЗОВЫЕ МЕТОДЫ ====================
    
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
    
    collectTechnicalData() {
      this.technicalData = {
        userAgent: navigator.userAgent || '',
        platform: navigator.platform || '',
        language: navigator.language || '',
        screenWidth: screen.width,
        screenHeight: screen.height,
        colorDepth: screen.colorDepth,
        timezone: new Date().getTimezoneOffset(),
        cookiesEnabled: navigator.cookieEnabled,
        plugins: navigator.plugins ? navigator.plugins.length : 0,
        webdriver: navigator.webdriver
      };
    }
    
    collectNetworkData() {
      this.networkData = {
        connection: navigator.connection ? {
          effectiveType: navigator.connection.effectiveType,
          rtt: navigator.connection.rtt
        } : null
      };
    }
    
    loadUserHistory() {
      try {
        const history = localStorage.getItem(`wws_history_${this.userId}`);
        if (history) {
          this.userHistory = JSON.parse(history);
        } else {
          this.userHistory = {
            userId: this.userId,
            firstSeen: Date.now(),
            sessions: [],
            incidents: 0,
            trusted: false
          };
        }
      } catch (e) {
        this.userHistory = {
          userId: this.userId,
          firstSeen: Date.now(),
          sessions: [],
          incidents: 0,
          trusted: false
        };
      }
    }
    
    analyzeRisk() {
      let totalRisk = 0;
      this.riskFactors = [];
      
      // 1. Технический анализ
      const technicalRisk = this.analyzeTechnical();
      totalRisk += technicalRisk.score * CONFIG.weights.technical;
      this.riskFactors.push(...technicalRisk.factors);
      
      // 2. Поведенческий анализ
      if (this.behaviorAnalyzer) {
        const behaviorRisk = this.behaviorAnalyzer.getRiskScore();
        totalRisk += behaviorRisk * CONFIG.weights.behavior;
        this.riskFactors.push(...this.behaviorAnalyzer.getRiskFactors());
      }
      
      // 3. Репутация
      const reputationRisk = this.analyzeReputation();
      totalRisk += reputationRisk.score * CONFIG.weights.reputation;
      this.riskFactors.push(...reputationRisk.factors);
      
      // 4. Сеть
      const networkRisk = this.analyzeNetwork();
      totalRisk += networkRisk.score * CONFIG.weights.network;
      this.riskFactors.push(...networkRisk.factors);
      
      // 5. Первый визит
      if (this.isFirstVisit) {
        totalRisk += 0.2;
        this.riskFactors.push({
          type: 'system',
          level: 'low',
          message: 'First visit to domain',
          score: 0.2
        });
      }
      
      this.riskScore = Math.min(1, totalRisk);
      this.determineVerdict();
    }
    
    analyzeTechnical() {
      let score = 0;
      const factors = [];
      const ua = (this.technicalData.userAgent || '').toLowerCase();
      
      const botPatterns = [
        /headless/i, /phantom/i, /selenium/i,
        /puppeteer/i, /playwright/i, /webdriver/i,
        /bot/i, /crawl/i, /spider/i
      ];
      
      for (const pattern of botPatterns) {
        if (pattern.test(ua)) {
          score += 0.8;
          factors.push({
            type: 'technical',
            level: 'critical',
            message: 'Automation tool detected',
            score: 0.8
          });
          break;
        }
      }
      
      if (navigator.webdriver === true) {
        score += 0.9;
        factors.push({
          type: 'technical',
          level: 'critical',
          message: 'WebDriver API detected',
          score: 0.9
        });
      }
      
      if (this.technicalData.plugins === 0 && !ua.includes('mobile')) {
        score += 0.3;
        factors.push({
          type: 'technical',
          level: 'medium',
          message: 'No browser plugins detected',
          score: 0.3
        });
      }
      
      return { score: Math.min(1, score), factors };
    }
    
    analyzeReputation() {
      let score = 0;
      const factors = [];
      
      if (this.userHistory.incidents > 2) {
        score += 0.5;
        factors.push({
          type: 'reputation',
          level: 'high',
          message: `Multiple previous incidents: ${this.userHistory.incidents}`,
          score: 0.5
        });
      }
      
      if (this.userHistory.trusted) {
        score -= 0.3;
      }
      
      return { score: Math.max(0, score), factors };
    }
    
    analyzeNetwork() {
      let score = 0;
      const factors = [];
      
      if (this.networkData.connection && this.networkData.connection.rtt > 1000) {
        score += 0.2;
        factors.push({
          type: 'network',
          level: 'low',
          message: 'High network latency detected',
          score: 0.2
        });
      }
      
      return { score, factors };
    }
    
    determineVerdict() {
      let verdict = 'allow';
      
      if (this.riskScore >= CONFIG.riskThresholds.HIGH) {
        verdict = 'block';
      } 
      else if (this.riskScore >= CONFIG.riskThresholds.MEDIUM) {
        verdict = 'simple_captcha';
      }
      else if (this.riskScore >= CONFIG.riskThresholds.LOW) {
        verdict = 'allow_with_logging';
      }
      
      this.verdict = verdict;
      this.log(`Security verdict: ${verdict} (risk: ${(this.riskScore * 100).toFixed(1)}%)`);
    }
    
    allowAccess() {
      this.accessGranted = true;
      this.log('Access granted to site');
      this.saveSession();
      
      if (this.riskScore < 0.2) {
        this.markAsTrusted();
      }
      
      // Плавный переход на сайт
      setTimeout(() => {
        PROTECTION_LAYER.hide();
        this.createWidget();
        
        const event = new CustomEvent('wws:access-granted', {
          detail: {
            userId: this.userId,
            sessionId: this.sessionId,
            riskScore: this.riskScore,
            verdict: this.verdict
          }
        });
        window.dispatchEvent(event);
      }, 500);
    }
    
    allowAccessWithLogging() {
      this.log('Access granted with enhanced logging');
      this.allowAccess();
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
      
      if (this.riskScore > 0.7) {
        this.userHistory.incidents = (this.userHistory.incidents || 0) + 1;
      }
      
      try {
        localStorage.setItem(`wws_history_${this.userId}`, JSON.stringify(this.userHistory));
        sessionStorage.setItem('wws_session_passed', 'true');
        sessionStorage.removeItem('wws_block_expiry'); // Снимаем блокировку если была
      } catch (e) {
        this.log('Session save error:', e);
      }
    }
    
    markAsTrusted() {
      this.userHistory.trusted = true;
      this.userHistory.trustedSince = Date.now();
      
      try {
        localStorage.setItem(`wws_history_${this.userId}`, JSON.stringify(this.userHistory));
      } catch (e) {
        this.log('Trust save error:', e);
      }
    }
    
    createWidget() {
      // Простой виджет (как в предыдущей версии, но оптимизированный)
      const widget = document.createElement('div');
      widget.id = 'wws-widget';
      widget.innerHTML = `
        <div style="position: fixed; bottom: 20px; left: 20px; z-index: 999998;">
          <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #6C63FF, #36D1DC); border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 20px rgba(108, 99, 255, 0.3); border: 2px solid rgba(255, 255, 255, 0.3);" title="WWS Protection">
            <i class="fas fa-shield-alt" style="font-size: 22px; color: white;"></i>
            <div style="position: absolute; top: -8px; right: -8px; background: ${this.riskScore > 0.6 ? '#ef4444' : this.riskScore > 0.3 ? '#f59e0b' : '#10b981'}; color: white; font-size: 10px; font-weight: 700; padding: 3px 6px; border-radius: 10px; border: 2px solid rgba(255, 255, 255, 0.9);">${Math.round(this.riskScore * 100)}%</div>
          </div>
        </div>
      `;
      
      document.body.appendChild(widget);
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
    
    console.log('🛡️ Initializing WWS Security v' + CONFIG.version);
    window.wwsAnalyzer = new WWSRiskAnalyzer();
  }
  
  // API
  window.WWS = {
    version: CONFIG.version,
    forceCheck: () => {
      sessionStorage.removeItem('wws_session_passed');
      sessionStorage.removeItem('wws_block_expiry');
      window.wwsAnalyzer = new WWSRiskAnalyzer();
      return window.wwsAnalyzer;
    },
    clearBlock: () => {
      sessionStorage.removeItem('wws_block_expiry');
      location.reload();
    },
    getRiskScore: () => window.wwsAnalyzer?.riskScore || 0,
    getVerdict: () => window.wwsAnalyzer?.verdict || 'unknown'
  };
  
  // Initialize only once
  if (!window.wwsInitialized) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeWWS);
    } else {
      setTimeout(initializeWWS, 100);
    }
    window.wwsInitialized = true;
  }
  
})();
