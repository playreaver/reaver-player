/**
 * WWS Gateway v4.2 - Premium Security System
 * Complete Protection with Behavioral Analysis & Compact Widget
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
        <p id="wws-status-text" style="color: #a0a0c0; font-size: 16px; margin: 0 0 30px; font-weight: 300;">Initializing behavioral analysis...</p>
        
        <!-- Детали анализа -->
        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 15px; padding: 20px; margin-bottom: 25px; border: 1px solid rgba(255, 255, 255, 0.1);">
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 15px;">
            <div style="text-align: center;">
              <div style="color: #6C63FF; font-size: 22px; font-weight: bold;" id="wws-risk-display">0%</div>
              <div style="color: #6c6c8c; font-size: 11px; margin-top: 5px;">RISK LEVEL</div>
            </div>
            <div style="text-align: center;">
              <div style="color: #36D1DC; font-size: 22px; font-weight: bold;"><i class="fas fa-fingerprint" style="animation: wws-spin 4s linear infinite;"></i></div>
              <div style="color: #6c6c8c; font-size: 11px; margin-top: 5px;">DEVICE SCAN</div>
            </div>
            <div style="text-align: center;">
              <div style="color: #a78bfa; font-size: 22px; font-weight: bold;"><i class="fas fa-brain" style="animation: wws-pulse 2s ease-in-out infinite;"></i></div>
              <div style="color: #6c6c8c; font-size: 11px; margin-top: 5px;">BEHAVIORAL AI</div>
            </div>
          </div>
          
          <!-- Прогресс бар -->
          <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; margin: 0 auto 10px; overflow: hidden; box-shadow: 0 0 15px rgba(108, 99, 255, 0.2);">
            <div id="wws-progress-bar" style="height: 100%; width: 0%; background: linear-gradient(90deg, #6C63FF, #36D1DC, #6C63FF); background-size: 200% 100%; transition: width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); animation: wws-gradient-flow 2s ease-in-out infinite;"></div>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8;">
            <span>0%</span>
            <span id="wws-progress-text">Starting...</span>
            <span>100%</span>
          </div>
        </div>
        
        <!-- Статус иконки -->
        <div id="wws-status-icon" style="color: #fbbf24; font-size: 14px; margin-top: 20px; display: flex; align-items: center; justify-content: center; gap: 10px;">
          <i class="fas fa-cog fa-spin"></i> <span id="wws-status-message">Analyzing user behavior...</span>
        </div>
        
        <!-- Факторы риска (скрыты сначала) -->
        <div id="wws-risk-factors" style="display: none; margin-top: 25px;">
          <div style="color: #94a3b8; font-size: 12px; margin-bottom: 10px;">DETECTED RISK FACTORS:</div>
          <div id="wws-factors-list" style="max-height: 150px; overflow-y: auto;"></div>
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
      if (progressBar) progressBar.style.width = progress + '%';
      if (riskDisplay) riskDisplay.textContent = (risk || 0) + '%';
      if (statusMessage) statusMessage.textContent = message || 'Analyzing...';
      if (progressText) {
        progressText.textContent = progress === 100 ? 'Complete' : progress + '%';
      }
    }
    
    function showRiskFactors(factors) {
      const container = overlay.querySelector('#wws-risk-factors');
      const list = overlay.querySelector('#wws-factors-list');
      
      if (factors && factors.length > 0) {
        container.style.display = 'block';
        list.innerHTML = factors.slice(0, 3).map(factor => `
          <div style="padding: 8px 10px; margin-bottom: 6px; background: rgba(239, 68, 68, 0.1); border-left: 3px solid #ef4444; border-radius: 6px; font-size: 11px; color: #fca5a5;">
            <i class="fas fa-exclamation-circle"></i> ${factor.message}
          </div>
        `).join('');
        
        if (factors.length > 3) {
          list.innerHTML += `<div style="text-align: center; color: #94a3b8; font-size: 10px; padding: 5px;">+ ${factors.length - 3} more factors</div>`;
        }
      }
    }
    
    if (document.body) show();
    else document.addEventListener('DOMContentLoaded', show);
    
    return { show, hide, updateStatus, showRiskFactors };
  })();
  
  // ==================== ADVANCED BEHAVIORAL ANALYZER ====================
  
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
      // Мышь
      let lastMousePosition = null;
      let lastMouseTime = Date.now();
      
      document.addEventListener('mousemove', (e) => {
        const now = Date.now();
        const point = {
          x: e.clientX,
          y: e.clientY,
          t: now,
          speed: this.calculateSpeed(now, lastMousePosition, lastMouseTime)
        };
        
        this.currentPath.push(point);
        if (this.currentPath.length > 100) this.currentPath.shift();
        
        lastMousePosition = { x: e.clientX, y: e.clientY };
        lastMouseTime = now;
        
        if (this.currentPath.length > 20) {
          this.analyzeAdvancedMovement();
        }
      });
      
      // Клики
      document.addEventListener('click', (e) => {
        const now = Date.now();
        const interval = now - this.lastClickTime;
        this.clickIntervals.push(interval);
        this.lastClickTime = now;
        
        if (this.clickIntervals.length > 15) {
          this.clickIntervals.shift();
          this.analyzeClickPatterns();
        }
      });
      
      // Скроллинг
      let lastScrollTop = window.pageYOffset;
      document.addEventListener('scroll', (e) => {
        const now = Date.now();
        const scrollTop = window.pageYOffset;
        const scrollDelta = Math.abs(scrollTop - lastScrollTop);
        const timeDelta = now - this.lastScrollTime;
        
        this.scrollPattern.push({
          delta: scrollDelta,
          time: timeDelta,
          speed: scrollDelta / (timeDelta || 1)
        });
        
        if (this.scrollPattern.length > 20) this.scrollPattern.shift();
        this.lastScrollTime = now;
        lastScrollTop = scrollTop;
        
        this.analyzeScrollPattern();
      });
      
      // Клавиатура
      document.addEventListener('keydown', (e) => {
        this.keyboardPattern.push({
          key: e.key,
          code: e.code,
          time: Date.now()
        });
        
        if (this.keyboardPattern.length > 30) this.keyboardPattern.shift();
        this.analyzeKeyboardPattern();
      });
      
      // Фокус и видимость
      let focusTime = Date.now();
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          const timeOnPage = Date.now() - focusTime;
          if (timeOnPage < 1000 && this.clickIntervals.length > 3) {
            this.behaviorFlags.automationTools = true;
            this.suspiciousScore += 0.3;
          }
        } else {
          focusTime = Date.now();
        }
      });
      
      // Проверка инструментов разработчика
      this.detectDevTools();
      
      // Проверка headless браузера
      this.detectHeadless();
    }
    
    calculateSpeed(now, lastPosition, lastTime) {
      if (!lastPosition || !lastTime) return 0;
      const distance = Math.hypot(
        this.currentPath[this.currentPath.length - 1].x - lastPosition.x,
        this.currentPath[this.currentPath.length - 1].y - lastPosition.y
      );
      return distance / (now - lastTime);
    }
    
    analyzeAdvancedMovement() {
      const recent = this.currentPath.slice(-20);
      
      // 1. Проверка на линейность движения
      const linearity = this.calculateLinearity(recent);
      if (linearity > 0.9) {
        this.behaviorFlags.linearMovement = true;
        this.suspiciousScore += 0.4;
      }
      
      // 2. Проверка на идеальную кривизну
      const curvature = this.calculateCurvature(recent);
      if (curvature < 0.1) {
        this.suspiciousScore += 0.3;
      }
      
      // 3. Проверка скорости (боты часто слишком быстрые или слишком медленные)
      const speeds = recent.map(p => p.speed).filter(s => s > 0);
      const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
      if (avgSpeed > 10 || (avgSpeed < 0.5 && speeds.length > 5)) {
        this.suspiciousScore += 0.2;
      }
      
      // 4. Проверка паттернов (боты часто повторяют одни и те же движения)
      const patternRepeatability = this.checkPatternRepeatability(recent);
      if (patternRepeatability > 0.7) {
        this.suspiciousScore += 0.3;
      }
    }
    
    calculateLinearity(points) {
      if (points.length < 3) return 0;
      
      let totalAngleChange = 0;
      for (let i = 2; i < points.length; i++) {
        const v1 = { x: points[i-1].x - points[i-2].x, y: points[i-1].y - points[i-2].y };
        const v2 = { x: points[i].x - points[i-1].x, y: points[i].y - points[i-1].y };
        const angle = Math.abs(Math.atan2(v2.y, v2.x) - Math.atan2(v1.y, v1.x));
        totalAngleChange += angle;
      }
      
      const avgAngleChange = totalAngleChange / (points.length - 2);
      return 1 - Math.min(avgAngleChange / Math.PI, 1);
    }
    
    calculateCurvature(points) {
      if (points.length < 3) return 0;
      
      let curvatureSum = 0;
      for (let i = 1; i < points.length - 1; i++) {
        const prev = points[i-1];
        const curr = points[i];
        const next = points[i+1];
        
        const dx1 = curr.x - prev.x;
        const dy1 = curr.y - prev.y;
        const dx2 = next.x - curr.x;
        const dy2 = next.y - curr.y;
        
        const cross = Math.abs(dx1 * dy2 - dy1 * dx2);
        const dot = dx1 * dx2 + dy1 * dy2;
        
        if (cross !== 0) {
          const curvature = cross / (Math.sqrt(dx1*dx1 + dy1*dy1) * Math.sqrt(dx2*dx2 + dy2*dy2));
          curvatureSum += curvature;
        }
      }
      
      return curvatureSum / (points.length - 2);
    }
    
    checkPatternRepeatability(points) {
      if (points.length < 10) return 0;
      
      const segmentSize = 5;
      let matches = 0;
      
      for (let i = 0; i <= points.length - segmentSize * 2; i++) {
        const segment1 = points.slice(i, i + segmentSize);
        const segment2 = points.slice(i + segmentSize, i + segmentSize * 2);
        
        if (this.segmentsSimilar(segment1, segment2)) {
          matches++;
        }
      }
      
      return matches / (points.length - segmentSize * 2);
    }
    
    segmentsSimilar(seg1, seg2) {
      if (seg1.length !== seg2.length) return false;
      
      let totalDiff = 0;
      for (let i = 0; i < seg1.length; i++) {
        const dx = seg2[i].x - seg1[i].x;
        const dy = seg2[i].y - seg1[i].y;
        totalDiff += Math.sqrt(dx * dx + dy * dy);
      }
      
      const avgDiff = totalDiff / seg1.length;
      return avgDiff < 10; // Пикселей
    }
    
    analyzeClickPatterns() {
      if (this.clickIntervals.length < 5) return;
      
      // 1. Слишком быстрые клики
      const avgInterval = this.clickIntervals.reduce((a, b) => a + b) / this.clickIntervals.length;
      if (avgInterval < 100) {
        this.behaviorFlags.tooFastClicks = true;
        this.suspiciousScore += 0.5;
      }
      
      // 2. Слишком идеальные интервалы (робот)
      const variance = this.calculateVariance(this.clickIntervals);
      if (variance < 20 && this.clickIntervals.length > 8) {
        this.suspiciousScore += 0.4;
      }
      
      // 3. Экспоненциальное распределение (человек) vs равномерное (бот)
      const distributionScore = this.analyzeClickDistribution();
      if (distributionScore > 0.7) {
        this.suspiciousScore += 0.3;
      }
    }
    
    analyzeClickDistribution() {
      if (this.clickIntervals.length < 10) return 0;
      
      const sorted = [...this.clickIntervals].sort((a, b) => a - b);
      const q1 = sorted[Math.floor(sorted.length * 0.25)];
      const q3 = sorted[Math.floor(sorted.length * 0.75)];
      const iqr = q3 - q1;
      
      // Боты часто имеют меньший IQR
      return 1 - Math.min(iqr / 100, 1);
    }
    
    analyzeScrollPattern() {
      if (this.scrollPattern.length < 10) return;
      
      // Проверка на слишком идеальный скроллинг
      const speeds = this.scrollPattern.map(p => p.speed).filter(s => s > 0);
      const speedVariance = this.calculateVariance(speeds);
      
      if (speedVariance < 5 && speeds.length > 8) {
        this.behaviorFlags.perfectScrolling = true;
        this.suspiciousScore += 0.3;
      }
      
      // Проверка на линейный скроллинг (без ускорения/замедления)
      const accelerationPattern = this.analyzeScrollAcceleration();
      if (accelerationPattern < 0.2) {
        this.suspiciousScore += 0.2;
      }
    }
    
    analyzeScrollAcceleration() {
      if (this.scrollPattern.length < 5) return 1;
      
      let changes = 0;
      for (let i = 1; i < this.scrollPattern.length; i++) {
        if (Math.abs(this.scrollPattern[i].speed - this.scrollPattern[i-1].speed) > 10) {
          changes++;
        }
      }
      
      return changes / (this.scrollPattern.length - 1);
    }
    
    analyzeKeyboardPattern() {
      if (this.keyboardPattern.length < 5) return;
      
      // Проверка на слишком быстрый ввод
      const intervals = [];
      for (let i = 1; i < this.keyboardPattern.length; i++) {
        intervals.push(this.keyboardPattern[i].time - this.keyboardPattern[i-1].time);
      }
      
      const avgKeyInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      if (avgKeyInterval < 50) {
        this.suspiciousScore += 0.3;
      }
    }
    
    detectDevTools() {
      const element = new Image();
      Object.defineProperty(element, 'id', {
        get: () => {
          this.behaviorFlags.devToolsDetected = true;
          this.suspiciousScore += 0.4;
        }
      });
      
      console.log(element);
      console.clear();
    }
    
    detectHeadless() {
      // Проверка различных признаков headless браузеров
      const tests = [
        () => navigator.webdriver === true,
        () => navigator.plugins.length === 0,
        () => navigator.languages === undefined,
        () => !window.chrome,
        () => window.outerWidth === 0 && window.outerHeight === 0,
        () => window.callPhantom || window._phantom || window.phantom,
        () => window.__nightmare,
        () => window.Cypress
      ];
      
      tests.forEach(test => {
        try {
          if (test()) {
            this.behaviorFlags.headlessBrowser = true;
            this.suspiciousScore += 0.6;
          }
        } catch (e) {}
      });
    }
    
    calculateVariance(arr) {
      if (arr.length === 0) return 0;
      const mean = arr.reduce((a, b) => a + b) / arr.length;
      return arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length;
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
          this.clickIntervals.reduce((a, b) => a + b) / this.clickIntervals.length : 0,
        scrollEvents: this.scrollPattern.length,
        keyPresses: this.keyboardPattern.length,
        isBotLike: riskScore > 0.6,
        riskScore: riskScore,
        flags: this.behaviorFlags,
        pathComplexity: this.calculatePathComplexity(),
        linearityScore: this.calculateLinearity(this.currentPath.slice(-20)),
        humanProbability: Math.max(0, 1 - riskScore) * 100
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
      
      if (report.flags.perfectScrolling) {
        factors.push({
          type: 'behavior',
          level: 'medium',
          message: 'Mechanical scrolling patterns detected',
          score: 0.3
        });
      }
      
      if (report.flags.devToolsDetected) {
        factors.push({
          type: 'technical',
          level: 'critical',
          message: 'Browser DevTools detection triggered',
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
      
      if (report.flags.automationTools) {
        factors.push({
          type: 'behavior',
          level: 'high',
          message: 'Automation tool patterns detected',
          score: 0.3
        });
      }
      
      if (report.avgClickInterval < 150 && report.clickCount > 5) {
        factors.push({
          type: 'behavior',
          level: 'medium',
          message: 'Suspiciously consistent click timing',
          score: 0.3
        });
      }
      
      if (report.mouseMovements < 15) {
        factors.push({
          type: 'behavior',
          level: 'low',
          message: 'Low mouse activity for session duration',
          score: 0.2
        });
      }
      
      return factors;
    }
  }
  
  // ==================== MAIN SECURITY SYSTEM ====================
  
  const CONFIG = {
    debug: true,
    version: '4.2',
    
    riskThresholds: {
      LOW: 0.3,    // Мониторинг
      MEDIUM: 0.6,  // Простая проверка
      HIGH: 0.8    // Полная проверка или блокировка
    },
    
    weights: {
      behavior: 0.50,    // Поведенческий анализ - самый важный
      technical: 0.30,   // Технические данные
      reputation: 0.15,  // История и репутация
      network: 0.05      // Сетевая информация
    },
    
    analysisSteps: [
      { name: 'Behavior Tracking', duration: 2000 },
      { name: 'Device Fingerprint', duration: 1500 },
      { name: 'Technical Analysis', duration: 1500 },
      { name: 'Network Scan', duration: 1000 },
      { name: 'Reputation Check', duration: 1000 },
      { name: 'AI Evaluation', duration: 2000 }
    ],
    
    accessRules: {
      ALLOW: 'allow',
      MONITOR: 'allow_with_logging',
      VERIFY: 'simple_captcha',
      BLOCK: 'block'
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
      this.userHistory = null;
      this.currentPanel = 'overview';
      this.accessGranted = false;
      
      this.loadUserHistory();
      this.log('System initialized v' + CONFIG.version);
      
      // Проверяем, не верифицирована ли уже сессия
      if (sessionStorage.getItem('wws_session_passed') === 'true') {
        this.log('Premium session already verified');
        this.verdict = 'allow';
        this.riskScore = 0;
        this.behaviorAnalyzer = new AdvancedBehaviorAnalyzer();
        this.createWidget();
        this.analyzeRisk(); // Запускаем анализ в фоне для обновления виджета
        this.accessGranted = true;
        return;
      }
      
      // Если сессия новая - запускаем полный анализ
      this.startFullAnalysis();
    }
    
    async startFullAnalysis() {
      if (this.isRunning) return;
      this.isRunning = true;
      
      let currentStep = 0;
      
      const executeStep = async () => {
        if (currentStep >= CONFIG.analysisSteps.length) {
          this.completeAnalysis();
          return;
        }
        
        const step = CONFIG.analysisSteps[currentStep];
        const progress = ((currentStep + 1) / CONFIG.analysisSteps.length) * 100;
        
        switch(currentStep) {
          case 0:
            PROTECTION_LAYER.updateStatus('Tracking user behavior...', 20, 10, 'Analyzing mouse movements and clicks');
            this.behaviorAnalyzer = new AdvancedBehaviorAnalyzer();
            break;
          case 1:
            PROTECTION_LAYER.updateStatus('Creating device fingerprint...', 40, 25, 'Scanning browser and device characteristics');
            this.collectTechnicalData();
            break;
          case 2:
            PROTECTION_LAYER.updateStatus('Technical analysis...', 60, 40, 'Checking for bots and automation tools');
            this.analyzeTechnical();
            break;
          case 3:
            PROTECTION_LAYER.updateStatus('Network analysis...', 75, 55, 'Scanning network patterns and latency');
            this.collectNetworkData();
            break;
          case 4:
            PROTECTION_LAYER.updateStatus('Reputation check...', 85, 70, 'Checking user history and trust profile');
            this.loadUserHistory();
            break;
          case 5:
            PROTECTION_LAYER.updateStatus('Final AI evaluation...', 95, 85, 'Computing final risk assessment');
            this.collectBehaviorData();
            this.analyzeRisk();
            break;
        }
        
        // Показываем факторы риска если есть
        if (this.behaviorAnalyzer && currentStep >= 2) {
          const factors = this.behaviorAnalyzer.getRiskFactors();
          if (factors.length > 0) {
            PROTECTION_LAYER.showRiskFactors(factors);
          }
        }
        
        currentStep++;
        
        // Имитация времени выполнения шага
        await new Promise(resolve => setTimeout(resolve, step.duration));
        await executeStep();
      };
      
      try {
        await executeStep();
      } catch (error) {
        this.log('Analysis error:', error);
        this.verdict = 'allow_with_logging';
        this.riskScore = 0.5;
        this.completeAnalysis();
      }
    }
    
    completeAnalysis() {
      PROTECTION_LAYER.updateStatus('Applying security policy...', 100, Math.round(this.riskScore * 100), 'Finalizing protection');
      
      setTimeout(() => {
        PROTECTION_LAYER.hide();
        this.createWidget();
        this.executeVerdict();
        this.accessGranted = true;
      }, 1000);
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
          navigator.deviceMemory || 'unknown',
          this.getCanvasFingerprint(),
          this.getWebGLFingerprint()
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
    
    getWebGLFingerprint() {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!gl) return 'no_webgl';
        
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
          const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          return vendor + '|' + renderer;
        }
        return 'webgl_no_debug';
      } catch (e) {
        return 'webgl_error';
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
        
        .wws-verdict-badge.blocked {
          background: #dc2626;
        }
        
        .wws-human-score {
          display: inline-block;
          padding: 4px 10px;
          background: linear-gradient(135deg, #10b981, #34d399);
          color: white;
          font-size: 10px;
          font-weight: 700;
          border-radius: 12px;
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
      
      icon.addEventListener('click', (e) => {
        e.stopPropagation();
        panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
      });
      
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        panel.style.display = 'none';
      });
      
      document.addEventListener('click', (e) => {
        if (panel.style.display === 'block' && !panel.contains(e.target) && !icon.contains(e.target)) {
          panel.style.display = 'none';
        }
      });
      
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          tabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          this.currentPanel = tab.dataset.tab;
          this.updatePanelContent();
        });
      });
      
      setInterval(() => {
        if (panel.style.display === 'block') {
          this.updatePanelContent();
        }
        this.updateWidget();
      }, 3000);
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
      const humanProbability = report.humanProbability || 0;
      
      let verdictClass = '';
      let verdictText = this.verdict.toUpperCase().replace(/_/g, ' ');
      
      if (this.verdict === 'allow') {
        verdictClass = '';
      } else if (this.verdict === 'block') {
        verdictClass = 'blocked';
        verdictText = 'ACCESS BLOCKED';
      } else if (this.verdict.includes('captcha') || this.verdict === 'allow_with_logging') {
        verdictClass = 'warning';
      } else {
        verdictClass = 'danger';
      }
      
      container.innerHTML = `
        <div class="wws-section">
          <div class="wws-status-card">
            <div class="wws-status-row">
              <div class="wws-status-label">
                <i class="fas fa-shield-alt"></i>
                Security Status
              </div>
              <div class="wws-status-value">
                <span class="wws-verdict-badge ${verdictClass}">${verdictText}</span>
              </div>
            </div>
            
            <div class="wws-status-row">
              <div class="wws-status-label">
                <i class="fas fa-user-check"></i>
                Human Probability
              </div>
              <div class="wws-status-value">
                <span class="wws-human-score">${Math.round(humanProbability)}%</span>
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
            Behavioral AI Analysis
          </div>
          
          <div class="wws-stats-grid">
            <div class="wws-stat-card">
              <div class="wws-stat-value">${report.mouseMovements || 0}</div>
              <div class="wws-stat-label">Movements</div>
            </div>
            
            <div class="wws-stat-card">
              <div class="wws-stat-value">${report.clickCount || 0}</div>
              <div class="wws-stat-label">Clicks</div>
            </div>
            
            <div class="wws-stat-card">
              <div class="wws-stat-value">${report.isBotLike ? 'YES' : 'NO'}</div>
              <div class="wws-stat-label">Bot Detected</div>
            </div>
            
            <div class="wws-stat-card">
              <div class="wws-stat-value">${report.avgClickInterval ? Math.round(report.avgClickInterval) : 0}ms</div>
              <div class="wws-stat-label">Click Speed</div>
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
      
      const refreshBtn = container.querySelector('#wws-refresh-btn');
      if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
          this.forceReanalysis();
        });
      }
    }
    
    renderBehaviorPanel(container) {
      const report = this.behaviorAnalyzer ? this.behaviorAnalyzer.getBehaviorReport() : {};
      
      container.innerHTML = `
        <div class="wws-section">
          <div class="wws-section-title">
            <i class="fas fa-mouse"></i>
            Advanced Mouse Analysis
          </div>
          
          <div class="wws-stats-grid">
            <div class="wws-stat-card">
              <div class="wws-stat-value">${report.mouseMovements || 0}</div>
              <div class="wws-stat-label">Total Moves</div>
            </div>
            
            <div class="wws-stat-card">
              <div class="wws-stat-value">${report.pathComplexity ? (report.pathComplexity * 100).toFixed(0) : 0}%</div>
              <div class="wws-stat-label">Path Complexity</div>
            </div>
            
            <div class="wws-stat-card">
              <div class="wws-stat-value">${report.linearityScore ? (report.linearityScore * 100).toFixed(0) : 0}%</div>
              <div class="wws-stat-label">Linearity Score</div>
            </div>
            
            <div class="wws-stat-card">
              <div class="wws-stat-value">${report.flags?.linearMovement ? 'YES' : 'NO'}</div>
              <div class="wws-stat-label">Robotic Pattern</div>
            </div>
          </div>
        </div>
        
        <div class="wws-section">
          <div class="wws-section-title">
            <i class="fas fa-hand-pointer"></i>
            Click & Interaction Analysis
          </div>
          
          <div class="wws-stats-grid">
            <div class="wws-stat-card">
              <div class="wws-stat-value">${report.clickCount || 0}</div>
              <div class="wws-stat-label">Total Clicks</div>
            </div>
            
            <div class="wws-stat-card">
              <div class="wws-stat-value">${report.avgClickInterval ? Math.round(report.avgClickInterval) : 0}ms</div>
              <div class="wws-stat-label">Avg Interval</div>
            </div>
            
            <div class="wws-stat-card">
              <div class="wws-stat-value">${report.flags?.tooFastClicks ? 'YES' : 'NO'}</div>
              <div class="wws-stat-label">Fast Clicks</div>
            </div>
            
            <div class="wws-stat-card">
              <div class="wws-stat-value">${report.keyPresses || 0}</div>
              <div class="wws-stat-label">Key Presses</div>
            </div>
          </div>
        </div>
        
        <div class="wws-section">
          <div class="wws-section-title">
            <i class="fas fa-scroll"></i>
            Scroll Analysis
          </div>
          
          <div class="wws-status-card">
            <div class="wws-status-row">
              <div class="wws-status-label">
                <i class="fas fa-tachometer-alt"></i>
                Scroll Events
              </div>
              <div class="wws-status-value">${report.scrollEvents || 0}</div>
            </div>
            
            <div class="wws-status-row">
              <div class="wws-status-label">
                <i class="fas fa-robot"></i>
                Perfect Scrolling
              </div>
              <div class="wws-status-value" style="color: ${report.flags?.perfectScrolling ? '#ef4444' : '#10b981'}">
                ${report.flags?.perfectScrolling ? 'DETECTED' : 'NORMAL'}
              </div>
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
            Device & Browser Info
          </div>
          
          <div class="wws-tech-item">
            <div class="wws-tech-label">Browser</div>
            <div class="wws-tech-value">${navigator.userAgent.substring(0, 50)}...</div>
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
          
          <div class="wws-tech-item">
            <div class="wws-tech-label">WebDriver</div>
            <div class="wws-tech-value" style="color: ${navigator.webdriver ? '#ef4444' : '#10b981'}">
              ${navigator.webdriver ? 'DETECTED (Bot)' : 'Not detected'}
            </div>
          </div>
          
          <div class="wws-tech-item">
            <div class="wws-tech-label">Headless Detection</div>
            <div class="wws-tech-value" style="color: ${this.behaviorAnalyzer?.behaviorFlags?.headlessBrowser ? '#ef4444' : '#10b981'}">
              ${this.behaviorAnalyzer?.behaviorFlags?.headlessBrowser ? 'SUSPICIOUS' : 'CLEAN'}
            </div>
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
              Your session appears to be clean and human-like
            </div>
          </div>
        `;
        return;
      }
      
      let factorsHTML = '';
      this.riskFactors.slice(0, 6).forEach(factor => {
        const levelClass = factor.level || 'medium';
        factorsHTML += `
          <div class="wws-factor-item ${levelClass}">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <strong>${factor.type.toUpperCase()}</strong>
              <span style="font-size: 9px; background: ${factor.level === 'high' || factor.level === 'critical' ? '#ef4444' : factor.level === 'medium' ? '#f59e0b' : '#10b981'}; color: white; padding: 2px 6px; border-radius: 8px;">${factor.level}</span>
            </div>
            <div style="font-size: 10px;">${factor.message}</div>
            <div style="font-size: 9px; color: #94a3b8; margin-top: 4px;">Impact: ${Math.round((factor.score || 0) * 100)}%</div>
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
    
    detectWebGL() {
      try {
        const canvas = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && 
                 (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
      } catch (e) {
        return false;
      }
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
      
      // 1. Поведенческий анализ (самый важный)
      const behaviorRisk = this.analyzeAdvancedBehavior();
      totalRisk += behaviorRisk.score * CONFIG.weights.behavior;
      this.riskFactors.push(...behaviorRisk.factors);
      
      // 2. Технический анализ
      const technicalRisk = this.analyzeTechnical();
      totalRisk += technicalRisk.score * CONFIG.weights.technical;
      this.riskFactors.push(...technicalRisk.factors);
      
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
        totalRisk = Math.max(totalRisk, 0.4);
        this.riskFactors.push({
          type: 'system',
          level: 'medium',
          message: 'First visit to domain - establishing trust profile',
          details: { firstVisit: true },
          score: 0.4
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
      const behaviorFactors = this.behaviorAnalyzer.getRiskFactors();
      
      score = report.riskScore || 0;
      factors.push(...behaviorFactors);
      
      return { score: Math.min(1, score), factors };
    }
    
    analyzeTechnical() {
      let score = 0;
      const factors = [];
      const ua = this.technicalData.userAgent.toLowerCase();
      
      const botPatterns = [
        /bot/i, /crawl/i, /spider/i, /scrape/i,
        /headless/i, /phantom/i, /selenium/i,
        /puppeteer/i, /playwright/i, /cheerio/i,
        /scrapy/i, /curl/i, /wget/i, /python/i,
        /node/i, /axios/i, /request/i
      ];
      
      for (const pattern of botPatterns) {
        if (pattern.test(ua)) {
          score += 0.7;
          factors.push({
            type: 'technical',
            level: 'critical',
            message: 'Bot/Scraper User-Agent detected',
            details: { userAgent: ua.substring(0, 100) },
            score: 0.7
          });
          break;
        }
      }
      
      if (navigator.webdriver === true) {
        score += 0.8;
        factors.push({
          type: 'technical',
          level: 'critical',
          message: 'WebDriver detected (automation browser)',
          details: { webdriver: true },
          score: 0.8
        });
      }
      
      if (this.technicalData.plugins === 0 && !ua.includes('mobile')) {
        score += 0.3;
        factors.push({
          type: 'technical',
          level: 'medium',
          message: 'No browser plugins detected (headless indicator)',
          details: { plugins: 0 },
          score: 0.3
        });
      }
      
      if (!window.chrome && !ua.includes('firefox') && !ua.includes('safari')) {
        score += 0.2;
        factors.push({
          type: 'technical',
          level: 'low',
          message: 'Uncommon or custom browser detected',
          details: { hasChrome: false },
          score: 0.2
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
          message: 'New or infrequent user (low trust score)',
          details: { sessions: this.userHistory.sessions?.length || 0 },
          score: 0.2
        });
      }
      
      if (this.userHistory.incidents > 0) {
        score += Math.min(0.5, this.userHistory.incidents * 0.2);
        factors.push({
          type: 'reputation',
          level: 'medium',
          message: `Previous security incidents: ${this.userHistory.incidents}`,
          details: { incidents: this.userHistory.incidents },
          score: Math.min(0.5, this.userHistory.incidents * 0.2)
        });
      }
      
      if (this.userHistory.trusted) {
        score -= 0.4;
        factors.push({
          type: 'reputation',
          level: 'trusted',
          message: 'Trusted device verified (risk reduced)',
          details: { trusted: true },
          score: -0.4
        });
      }
      
      return { score: Math.max(0, Math.min(1, score)), factors };
    }
    
    analyzeNetwork() {
      let score = 0;
      const factors = [];
      
      if (this.networkData.connection) {
        if (this.networkData.connection.rtt > 500) {
          score += 0.3;
          factors.push({
            type: 'network',
            level: 'medium',
            message: 'High network latency (possible proxy/VPN)',
            details: { rtt: this.networkData.connection.rtt + 'ms' },
            score: 0.3
          });
        }
        
        if (this.networkData.connection.effectiveType === 'slow-2g' || 
            this.networkData.connection.effectiveType === '2g') {
          score += 0.1;
        }
      }
      
      return { score: Math.min(1, score), factors };
    }
    
    determineVerdict() {
      let verdict = 'allow';
      
      if (this.riskScore >= CONFIG.riskThresholds.HIGH) {
        verdict = Math.random() > 0.3 ? 'block' : 'full_captcha';
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
      
      // Для первого визита ужесточаем проверку
      if (this.isFirstVisit && this.riskScore > 0.4) {
        verdict = 'simple_captcha';
      }
      
      this.verdict = verdict;
      this.log(`Security verdict: ${verdict} (risk: ${(this.riskScore * 100).toFixed(1)}%)`);
    }
    
    executeVerdict() {
      this.updateWidget();
      
      switch (this.verdict) {
        case 'block':
          this.blockAccess();
          break;
        case 'full_captcha':
          this.showFullCaptcha();
          break;
        case 'simple_captcha':
          this.showSimpleCaptcha();
          break;
        case 'allow_with_logging':
          this.allowAccessWithLogging();
          break;
        default:
          this.allowAccess();
          break;
      }
    }
    
    blockAccess() {
      const overlay = document.createElement('div');
      overlay.id = 'wws-block-overlay';
      overlay.style.cssText = `
        position: fixed !important;
        top: 0 !important; left: 0 !important;
        width: 100vw !important; height: 100vh !important;
        background: linear-gradient(135deg, #1a0a0a, #261212, #1f0f0f) !important;
        z-index: 9999999 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-family: 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif !important;
      `;
      
      overlay.innerHTML = `
        <div style="text-align: center; max-width: 500px; padding: 40px;">
          <div style="margin-bottom: 30px;">
            <i class="fas fa-ban" style="font-size: 72px; color: #ef4444; animation: wws-shield-glow 3s ease-in-out infinite;"></i>
          </div>
          
          <h1 style="color: white; margin: 0 0 15px; font-size: 32px; font-weight: 700;">ACCESS BLOCKED</h1>
          <p style="color: #fca5a5; font-size: 16px; margin: 0 0 25px;">
            High-risk activity detected. Access to this resource has been restricted.
          </p>
          
          <div style="background: rgba(239, 68, 68, 0.1); border-radius: 15px; padding: 20px; margin-bottom: 30px; border: 1px solid rgba(239, 68, 68, 0.3);">
            <div style="color: #fca5a5; margin-bottom: 15px; font-size: 14px;">BLOCK REASONS:</div>
            <div id="wws-block-reasons" style="text-align: left; color: #fca5a5; font-size: 12px;"></div>
          </div>
          
          <div style="color: #94a3b8; font-size: 12px; margin-top: 30px;">
            If you believe this is an error, contact the site administrator.
          </div>
        </div>
      `;
      
      document.body.appendChild(overlay);
      
      const reasonsList = overlay.querySelector('#wws-block-reasons');
      if (reasonsList && this.riskFactors.length > 0) {
        const criticalFactors = this.riskFactors.filter(f => f.level === 'critical' || f.level === 'high');
        reasonsList.innerHTML = criticalFactors.slice(0, 5).map(factor => `
          <div style="padding: 8px 0; border-bottom: 1px solid rgba(239, 68, 68, 0.2);">
            <i class="fas fa-exclamation-circle"></i> ${factor.message}
          </div>
        `).join('');
      }
      
      this.log('Access blocked due to high risk');
    }
    
    showSimpleCaptcha() {
      const overlay = this.createOverlay('captcha');
      
      const a = Math.floor(Math.random() * 9) + 1;
      const b = Math.floor(Math.random() * 9) + 1;
      const answer = a + b;
      
      overlay.innerHTML = `
        <div style="max-width: 400px; width: 90%; padding: 30px; background: rgba(18, 18, 26, 0.95); border-radius: 20px; border: 1px solid rgba(108, 99, 255, 0.3); box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5); text-align: center; backdrop-filter: blur(10px);">
          <div style="margin-bottom: 20px;">
            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #6C63FF, #36D1DC); border-radius: 15px; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px;">🤖</div>
            <h3 style="color: white; margin: 0 0 10px;">Security Verification Required</h3>
            <p style="color: #94a3b8; font-size: 14px; margin: 0;">Complete this check to continue</p>
          </div>
          <div style="background: rgba(255, 255, 255, 0.05); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
            <div style="color: #94a3b8; margin-bottom: 10px; font-size: 14px;">Solve this simple math problem:</div>
            <div style="font-size: 36px; font-weight: bold; color: white; font-family: 'Courier New', monospace; margin: 15px 0;">${a} + ${b} = ?</div>
            <input type="text" id="captcha-answer" placeholder="Enter answer" style="width: 100%; padding: 15px; font-size: 18px; background: rgba(255, 255, 255, 0.1); border: 2px solid rgba(255, 255, 255, 0.2); border-radius: 10px; color: white; text-align: center; outline: none;" autocomplete="off">
          </div>
          <button id="captcha-submit" style="width: 100%; padding: 16px; background: linear-gradient(135deg, #6C63FF, #36D1DC); color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; font-size: 16px;">Verify & Continue</button>
          <div style="margin-top: 20px; color: #94a3b8; font-size: 11px;">
            <i class="fas fa-info-circle"></i> This helps prevent automated access
          </div>
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
            answerInput.placeholder = 'Enter answer';
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
      this.showSimpleCaptcha(); // В реальной системе здесь была бы сложная капча
    }
    
    createOverlay(type) {
      const oldOverlay = document.getElementById(`wws-${type}-overlay`);
      if (oldOverlay) oldOverlay.remove();
      
      const overlay = document.createElement('div');
      overlay.id = `wws-${type}-overlay`;
      overlay.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        background: rgba(5, 5, 15, 0.98) !important;
        backdrop-filter: blur(5px) !important;
        z-index: 9999999 !important;
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
      const overlays = document.querySelectorAll('[id^="wws-"][id$="-overlay"]');
      overlays.forEach(overlay => overlay.remove());
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
    
    allowAccessWithLogging() {
      this.log('Access granted with enhanced logging');
      this.saveSession();
      this.updateWidget();
      
      // Здесь можно добавить дополнительное логирование
      setInterval(() => {
        if (this.behaviorAnalyzer) {
          const report = this.behaviorAnalyzer.getBehaviorReport();
          if (report.riskScore > 0.5) {
            this.log('Suspicious behavior detected during session', report);
          }
        }
      }, 10000);
      
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
      
      if (this.userHistory.sessions.length > 50) {
        this.userHistory.sessions = this.userHistory.sessions.slice(-50);
      }
      
      // Отмечаем инциденты если был высокий риск
      if (this.riskScore > 0.7) {
        this.userHistory.incidents = (this.userHistory.incidents || 0) + 1;
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
    
    forceReanalysis() {
      this.log('Forcing reanalysis...');
      this.riskScore = 0;
      this.riskFactors = [];
      this.verdict = 'pending';
      
      if (this.behaviorAnalyzer) {
        const newReport = this.behaviorAnalyzer.getBehaviorReport();
        this.riskScore = newReport.riskScore || 0;
        this.riskFactors = this.behaviorAnalyzer.getRiskFactors();
        this.determineVerdict();
        this.updateWidget();
        this.updatePanelContent();
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
    hidePanel: () => {
      const panel = document.getElementById('wws-widget-panel');
      if (panel) panel.style.display = 'none';
    },
    blockSession: () => {
      if (window.wwsAnalyzer) {
        window.wwsAnalyzer.verdict = 'block';
        window.wwsAnalyzer.executeVerdict();
      }
    },
    onAccessGranted: (callback) => window.addEventListener('wws:access-granted', callback),
    onAccessBlocked: (callback) => window.addEventListener('wws:access-blocked', callback)
  };
  
  // Initialize only once
  if (!window.wwsInitialized) {
    initializeWWS();
    window.wwsInitialized = true;
  }
  
})();
