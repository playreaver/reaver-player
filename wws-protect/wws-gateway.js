/**
 * WWS Protect — All-in-One Frontend Protection
 * Версия: 2.0.0
 * Описание: Фронтенд-защита от ботов с капчей и виджетом риска
 */

(function() {
  'use strict';

  class WWSProtect {
    constructor() {
      this.riskScore = 0;
      this.lastRiskScore = parseInt(localStorage.getItem('wwsProtectLastRisk') || '0');
      this.isVerified = localStorage.getItem('wwsProtectPassed') === 'true';
      this.blockCount = parseInt(localStorage.getItem('wwsProtectBlockCount') || '0');
      this.signals = [];
      this.behavioralData = {
        mouseMoves: [],
        clicks: [],
        scrolls: [],
        keypresses: [],
        focusChanges: [],
        startTime: Date.now(),
        currentSession: []
      };
      this.dataCollectionActive = false;
      this.widgetExpanded = false;
      this.elements = {};
      
      // Конфигурация (можно переопределить до инициализации)
      this.config = {
        // Веса сигналов риска
        weights: {
          webdriver: 40,
          mouseJitter: 20,
          clickInterval: 10,
          scrollLinearity: 10,
          keyboardSpeed: 10,
          focusFrequency: 10,
          automationUA: 15,
          webGLAnomaly: 10,
          audioContext: 5,
          fonts: 5,
          timezone: 3,
          screenMismatch: 8,
          touchSupport: 5
        },
        // Пороги риска
        thresholds: {
          safe: 30,
          suspicious: 65,
          block: 100
        },
        // Длительность блокировки (базовая, увеличивается с blockCount)
        baseBlockDuration: 30 * 1000, // 30 секунд
        // Таймауты
        captchaTypes: ['math', 'hold'], // 'math', 'hold', или ['math', 'hold']
        verifyHoldDuration: 3000, // ms для hold-капчи
        behavioralCollectionTime: 2000, // ms сбора данных
        // Рандомизация весов для усложнения обхода
        randomizeWeights: true
      };
      
      // Рандомизация весов (±20%)
      if (this.config.randomizeWeights) {
        Object.keys(this.config.weights).forEach(key => {
          const base = this.config.weights[key];
          this.config.weights[key] = base * (0.9 + Math.random() * 0.4);
        });
      }
      
      // Иконки (Aviosom style SVG data-uri)
      this.icons = {
        shield: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2300ff88'%3E%3Cpath d='M12 2l7 4v6c0 5.55-3.84 10.74-7 12-3.16-1.26-7-6.45-7-12V6l7-4z'/%3E%3C/svg%3E`,
        warning: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ffaa00'%3E%3Cpath d='M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z'/%3E%3C/svg%3E`,
        lock: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ff4444'%3E%3Cpath d='M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z'/%3E%3C/svg%3E`,
        arrowRight: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23e0e0e0'%3E%3Cpath d='M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z'/%3E%3C/svg%3E`,
        arrowDown: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23e0e0e0'%3E%3Cpath d='M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z'/%3E%3C/svg%3E`
      };
      
      // Создать DOM и стили
      this.createElements();
      this.injectStyles();
    }

    /**
     * Создание всех DOM элементов
     */
    createElements() {
      // Экран защиты
      const screen = document.createElement('div');
      screen.id = 'wws-protect-screen';
      screen.innerHTML = `
        <div class="wws-protect-container">
          <div class="wws-protect-spinner"></div>
          <div class="wws-protect-title">WWS Protect</div>
          <div class="wws-protect-status" id="wws-status-text">Анализ поведения...</div>
          <div class="wws-progress-bar">
            <div class="wws-progress-fill" id="wws-progress-fill"></div>
          </div>
          <div id="wws-protect-content"></div>
        </div>
      `;
      
      // Виджет риска
      const widget = document.createElement('div');
      widget.id = 'wws-widget';
      widget.className = 'wws-widget collapsed';
      widget.innerHTML = `
        <div class="wws-widget-header">
          <img src="${this.icons.shield}" class="wws-icon" id="wws-icon">
          <span class="wws-risk-text" id="wws-risk-text">Safe</span>
          <button class="wws-toggle" id="wws-toggle">⯈</button>
        </div>
        <div class="wws-widget-body" id="wws-widget-body">
          <div class="wws-risk-bar">
            <div class="wws-risk-fill" id="wws-risk-fill"></div>
          </div>
          <div class="wws-risk-value" id="wws-risk-value">Risk: 0/100</div>
          <div class="wws-signals" id="wws-signals"></div>
        </div>
      `;
      
      // Добавить в DOM
      document.body.appendChild(screen);
      document.body.appendChild(widget);
      
      // Сохранить ссылки
      this.elements = {
        screen,
        content: document.getElementById('wws-protect-content'),
        statusText: document.getElementById('wws-status-text'),
        progressFill: document.getElementById('wws-progress-fill'),
        widget,
        widgetBody: document.getElementById('wws-widget-body'),
        icon: document.getElementById('wws-icon'),
        riskText: document.getElementById('wws-risk-text'),
        toggle: document.getElementById('wws-toggle'),
        riskFill: document.getElementById('wws-risk-fill'),
        riskValue: document.getElementById('wws-risk-value'),
        signals: document.getElementById('wws-signals')
      };
      
      // Обработчики виджета
      this.elements.toggle.addEventListener('click', () => this.toggleWidget());
      this.elements.widget.addEventListener('mouseenter', () => this.expandWidget());
      this.elements.widget.addEventListener('mouseleave', () => this.collapseWidget());
    }

    /**
     * Внедрение CSS стилей
     */
    injectStyles() {
      const styles = `
        /* === WWS Protect Screen === */
        #wws-protect-screen {
          position: fixed;
          inset: 0;
          background: #0a0a0a;
          z-index: 999999;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          transition: opacity 0.5s ease;
        }
        
        #wws-protect-screen.hidden {
          opacity: 0;
          pointer-events: none;
        }
        
        .wws-protect-container {
          text-align: center;
          color: #e0e0e0;
          max-width: 500px;
          padding: 2rem;
          background: #1a1a1a;
          border-radius: 16px;
          border: 1px solid #333;
          box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        }
        
        .wws-protect-spinner {
          width: 60px;
          height: 60px;
          border: 3px solid #1a1a1a;
          border-top-color: #00ff88;
          border-radius: 50%;
          animation: wws-spin 1s linear infinite;
          margin: 0 auto 2rem;
        }
        
        @keyframes wws-spin {
          to { transform: rotate(360deg); }
        }
        
        .wws-protect-title {
          font-size: 1.8rem;
          margin-bottom: 1rem;
          color: #fff;
          font-weight: 600;
        }
        
        .wws-protect-status {
          font-size: 0.9rem;
          opacity: 0.8;
          margin-bottom: 2rem;
        }
        
        .wws-progress-bar {
          width: 100%;
          height: 4px;
          background: #1a1a1a;
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 2rem;
        }
        
        .wws-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #00ff88, #00cc6a);
          width: 0%;
          transition: width 0.3s ease;
        }
        
        /* === CAPTCHA === */
        .wws-captcha-container {
          background: #0a0a0a;
          padding: 2rem;
          border-radius: 12px;
          border: 1px solid #333;
        }
        
        .wws-captcha-title {
          font-size: 1.3rem;
          margin-bottom: 1.5rem;
          color: #fff;
          font-weight: 600;
        }
        
        .wws-math-captcha {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }
        
        .wws-math-question {
          font-size: 2rem;
          font-weight: 600;
          color: #00ff88;
          letter-spacing: 0.1em;
        }
        
        .wws-math-input {
          width: 120px;
          padding: 0.75rem;
          font-size: 1.2rem;
          text-align: center;
          background: #1a1a1a;
          border: 2px solid #333;
          border-radius: 8px;
          color: #fff;
          transition: border-color 0.2s;
        }
        
        .wws-math-input:focus {
          outline: none;
          border-color: #00ff88;
        }
        
        .wws-math-submit {
          background: #00ff88;
          color: #000;
          border: none;
          padding: 0.75rem 2rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .wws-math-submit:hover {
          background: #00cc6a;
          transform: translateY(-1px);
        }
        
        .wws-math-submit:active {
          transform: translateY(0);
        }
        
        .wws-hold-captcha {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }
        
        .wws-hold-button {
          width: 280px;
          height: 70px;
          background: #1a1a1a;
          border: 2px solid #444;
          border-radius: 12px;
          color: #fff;
          font-size: 1.1rem;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.2s;
          user-select: none;
        }
        
        .wws-hold-button:active {
          border-color: #00ff88;
          transform: scale(0.98);
        }
        
        .wws-hold-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 4px;
          background: #00ff88;
          width: 0%;
          transition: width 0.1s linear;
        }
        
        .wws-hold-text {
          position: relative;
          z-index: 1;
        }
        
        /* === Widget === */
        #wws-widget {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: rgba(0, 0, 0, 0.95);
          backdrop-filter: blur(10px);
          color: #fff;
          border-radius: 12px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 0.8rem;
          z-index: 999998;
          min-width: 220px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        #wws-widget.collapsed {
          width: 140px;
          height: 50px;
          overflow: hidden;
        }
        
        #wws-widget.expanded {
          width: 280px;
          height: auto;
          padding: 1rem;
        }
        
        .wws-widget-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          cursor: pointer;
        }
        
        .wws-icon {
          width: 24px;
          height: 24px;
        }
        
        .wws-risk-text {
          font-weight: 600;
          font-size: 0.9rem;
          flex: 1;
        }
        
        .wws-toggle {
          background: none;
          border: none;
          color: #e0e0e0;
          font-size: 1.2rem;
          cursor: pointer;
          transition: transform 0.3s;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .wws-widget.expanded .wws-toggle {
          transform: rotate(90deg);
        }
        
        .wws-widget-body {
          padding: 0 1rem 1rem;
          display: none;
        }
        
        .wws-widget.expanded .wws-widget-body {
          display: block;
          animation: wws-fade-in 0.3s;
        }
        
        @keyframes wws-fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .wws-risk-bar {
          width: 100%;
          height: 6px;
          background: #1a1a1a;
          border-radius: 3px;
          overflow: hidden;
          margin: 0.75rem 0;
        }
        
        .wws-risk-fill {
          height: 100%;
          width: 0%;
          transition: width 0.5s ease, background 0.3s ease;
        }
        
        .wws-risk-fill.safe { background: #00ff88; }
        .wws-risk-fill.warning { background: #ffaa00; }
        .wws-risk-fill.danger { background: #ff4444; }
        
        .wws-risk-value {
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
        }
        
        .wws-signals {
          font-size: 0.7rem;
          opacity: 0.8;
          line-height: 1.4;
          max-height: 120px;
          overflow-y: auto;
          padding-right: 0.5rem;
        }
        
        .wws-signals::-webkit-scrollbar {
          width: 4px;
        }
        
        .wws-signals::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 2px;
        }
        
        /* === Block Screen === */
        .wws-block-container {
          text-align: center;
          padding: 2rem;
        }
        
        .wws-block-icon {
          font-size: 4rem;
          margin-bottom: 1.5rem;
        }
        
        .wws-block-timer {
          font-size: 2.5rem;
          font-weight: bold;
          color: #ff4444;
          margin: 1.5rem 0;
          font-variant-numeric: tabular-nums;
        }
        
        .wws-block-reasons {
          text-align: left;
          background: #1a1a1a;
          padding: 1rem;
          border-radius: 8px;
          margin: 1rem 0;
          font-size: 0.85rem;
          border: 1px solid #333;
        }
        
        /* === Utilities === */
        .wws-hidden {
          display: none !important;
        }
      `;
      
      const styleSheet = document.createElement('style');
      styleSheet.id = 'wws-protect-styles';
      styleSheet.textContent = styles;
      document.head.appendChild(styleSheet);
    }

    /**
     * Инициализация защиты
     */
    async init() {
      console.log('[WWS Protect] Инициализация...');
      
      // Проверить блокировку
      const blockedUntil = localStorage.getItem('wwsProtectBlockedUntil');
      if (blockedUntil && Date.now() < parseInt(blockedUntil)) {
        this.showBlockScreen(parseInt(blockedUntil));
        return;
      }
      
      // Показать капчу при первом посещении или если риск был высоким
      if (!this.isVerified || this.lastRiskScore > 30) {
        this.showCaptcha();
        return;
      }
      
      // Если уже верифицирован и риск low — скрыть виджет
      this.elements.widget.classList.add('wws-hidden');
      
      // Быстрая проверка fingerprint
      await this.collectFingerprint();
      
      // Начать сбор данных
      this.startDataCollection();
      
      // Показать прогресс
      this.updateProgress(50);
      
      // Собрать поведенческие данные
      await this.wait(this.config.behavioralCollectionTime);
      
      // Рассчитать риск
      this.calculateRiskScore();
      
      // Принять решение
      this.makeDecision();
      
      // Запустить постоянный мониторинг
      this.setupContinuousMonitoring();
    }

    /**
     * Показать капчу (выбор типа)
     */
    showCaptcha() {
      const captchaType = Array.isArray(this.config.captchaTypes) 
        ? this.config.captchaTypes[Math.floor(Math.random() * this.config.captchaTypes.length)]
        : this.config.captchaTypes;
      
      if (captchaType === 'math') {
        this.showMathCaptcha();
      } else {
        this.showHoldCaptcha();
      }
    }

    /**
     * Математическая капча
     */
    showMathCaptcha() {
      const a = Math.floor(Math.random() * 10 + 1);
      const b = Math.floor(Math.random() * 10 + 1);
      const ops = ['+', '-', '*'];
      const op = ops[Math.floor(Math.random() * ops.length)];
      let answer;
      switch(op) {
        case '+': answer = a + b; break;
        case '-': answer = a - b; break;
        case '*': answer = a * b; break;
      }
      
      this.captchaAnswer = answer;
      
      this.elements.content.innerHTML = `
        <div class="wws-captcha-container">
          <div class="wws-captcha-title">Докажите, что вы человек</div>
          <div class="wws-math-captcha">
            <div class="wws-math-question">${a} ${op} ${b} = ?</div>
            <input type="number" class="wws-math-input" id="wws-math-input" placeholder="Ответ" autocomplete="off">
            <button class="wws-math-submit" id="wws-math-submit">Проверить</button>
            <div style="margin-top: 1rem; font-size: 0.8rem; opacity: 0.7;">
              Решите простую задачу для продолжения
            </div>
          </div>
        </div>
      `;
      
      const input = document.getElementById('wws-math-input');
      const submit = document.getElementById('wws-math-submit');
      
      const checkAnswer = () => {
        const value = parseInt(input.value);
        if (value === this.captchaAnswer) {
          this.completeCaptcha();
        } else {
          input.style.borderColor = '#ff4444';
          setTimeout(() => {
            input.style.borderColor = '#333';
            input.value = '';
          }, 500);
        }
      };
      
      submit.addEventListener('click', checkAnswer);
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkAnswer();
      });
      
      input.focus();
    }

    /**
     * Hold-to-continue капча
     */
    showHoldCaptcha() {
      this.elements.content.innerHTML = `
        <div class="wws-captcha-container">
          <div class="wws-captcha-title">Докажите, что вы человек</div>
          <div class="wws-hold-captcha">
            <button class="wws-hold-button" id="wws-hold-button">
              <span class="wws-hold-text">Удерживайте 3 секунды</span>
              <div class="wws-hold-progress" id="wws-hold-progress"></div>
            </button>
            <div style="margin-top: 1rem; font-size: 0.8rem; opacity: 0.7;">
              Удерживайте кнопку в течение 3 секунд
            </div>
          </div>
        </div>
      `;
      
      const button = document.getElementById('wws-hold-button');
      const progress = document.getElementById('wws-hold-progress');
      let holdStart = 0;
      let holdInterval;
      
      const startHold = () => {
        holdStart = Date.now();
        button.style.borderColor = '#00ff88';
        
        holdInterval = setInterval(() => {
          const elapsed = Date.now() - holdStart;
          const percent = Math.min(100, (elapsed / this.config.verifyHoldDuration) * 100);
          progress.style.width = percent + '%';
          
          if (elapsed >= this.config.verifyHoldDuration) {
            clearInterval(holdInterval);
            this.completeCaptcha();
          }
        }, 50);
      };
      
      const endHold = () => {
        clearInterval(holdInterval);
        progress.style.width = '0%';
        button.style.borderColor = '#444';
        holdStart = 0;
      };
      
      button.addEventListener('mousedown', startHold);
      button.addEventListener('mouseup', endHold);
      button.addEventListener('mouseleave', endHold);
      
      // Touch support
      button.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startHold();
      });
      button.addEventListener('touchend', (e) => {
        e.preventDefault();
        endHold();
      });
    }

    /**
     * Успешное прохождение капчи
     */
    completeCaptcha() {
      console.log('[WWS Protect] Капча пройдена');
      localStorage.setItem('wwsProtectPassed', 'true');
      localStorage.setItem('wwsProtectLastRisk', '0');
      
      // Начать основной процесс
      this.isVerified = true;
      this.riskScore = 0;
      
      // Скрыть экран и показать основной контент
      this.hideScreen();
      
      // Начать сбор данных
      this.startDataCollection();
      
      // Показать виджет
      this.elements.widget.classList.remove('wws-hidden');
      this.updateWidget();
      
      // Запустить мониторинг
      this.setupContinuousMonitoring();
    }

    /**
     * Старт сбора поведенческих данных
     */
    startDataCollection() {
      if (this.dataCollectionActive) return;
      this.dataCollectionActive = true;
      
      // Mouse tracking
      let lastMove = Date.now();
      let lastX = 0, lastY = 0;
      
      document.addEventListener('mousemove', (e) => {
        const now = Date.now();
        const deltaTime = now - lastMove;
        const deltaX = e.clientX - lastX;
        const deltaY = e.clientY - lastY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const velocity = distance / deltaTime;
        const angle = Math.atan2(deltaY, deltaX);
        
        this.behavioralData.mouseMoves.push({
          x: e.clientX,
          y: e.clientY,
          time: now,
          deltaTime,
          velocity,
          angle,
          isTrusted: e.isTrusted
        });
        
        lastX = e.clientX;
        lastY = e.clientY;
        lastMove = now;
      }, true);
      
      // Click tracking
      let lastClickTime = 0;
      document.addEventListener('click', (e) => {
        const now = Date.now();
        const interval = now - lastClickTime;
        
        this.behavioralData.clicks.push({
          x: e.clientX,
          y: e.clientY,
          time: now,
          interval,
          isTrusted: e.isTrusted
        });
        
        lastClickTime = now;
      }, true);
      
      // Scroll tracking
      let lastScrollTime = 0;
      let lastScrollY = 0;
      
      window.addEventListener('scroll', () => {
        const now = Date.now();
        const deltaY = window.scrollY - lastScrollY;
        const velocity = deltaY / (now - lastScrollTime);
        
        this.behavioralData.scrolls.push({
          y: window.scrollY,
          time: now,
          deltaY,
          velocity
        });
        
        lastScrollY = window.scrollY;
        lastScrollTime = now;
      }, true);
      
      // Keyboard tracking
      let lastKeyTime = 0;
      document.addEventListener('keydown', (e) => {
        const now = Date.now();
        const interval = now - lastKeyTime;
        
        this.behavioralData.keypresses.push({
          key: e.key,
          time: now,
          interval
        });
        
        lastKeyTime = now;
      }, true);
      
      // Focus tracking
      document.addEventListener('visibilitychange', () => {
        this.behavioralData.focusChanges.push({
          hidden: document.hidden,
          time: Date.now()
        });
      });
      
      // Idle time
      let idleTimer;
      const resetIdle = () => {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
          this.behavioralData.idleTime = (Date.now() - this.behavioralData.startTime) / 1000;
        }, 3000);
      };
      
      document.addEventListener('mousemove', resetIdle);
      document.addEventListener('keydown', resetIdle);
      resetIdle();
    }

    /**
     * Сбор fingerprint данных
     */
    async collectFingerprint() {
      const fp = {};
      
      // WebDriver
      fp.webdriver = navigator.webdriver || false;
      
      // UserAgent
      const ua = navigator.userAgent.toLowerCase();
      fp.userAgent = navigator.userAgent;
      fp.automationUA = /headless|phantomjs|selenium|puppeteer|playwright/.test(ua);
      
      // Screen
      fp.screenWidth = screen.width;
      fp.screenHeight = screen.height;
      fp.windowWidth = window.innerWidth;
      fp.windowHeight = window.innerHeight;
      fp.devicePixelRatio = window.devicePixelRatio;
      fp.screenMismatch = Math.abs(screen.width - window.innerWidth) > 100;
      
      // Timezone
      try {
        fp.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        fp.timezoneOffset = new Date().getTimezoneOffset();
      } catch (e) {
        fp.timezone = 'unknown';
      }
      
      // WebGL
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) {
          const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
          fp.webGLVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
          fp.webGLRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          fp.webGLAnomaly = /Mesa|SwiftShader|Google|llvmpipe/.test(fp.webGLRenderer);
        }
      } catch (e) {
        fp.webGLAnomaly = true;
      }
      
      // AudioContext
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        fp.audioContext = audioCtx.destination.channelInterpretation === 'speakers';
        await audioCtx.close();
      } catch (e) {
        fp.audioContext = false;
      }
      
      // Fonts
      const fontList = [
        'Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 'Georgia',
        'Impact', 'Times New Roman', 'Trebuchet MS', 'Verdana', 'Segoe UI'
      ];
      
      const testFonts = (font) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const testString = 'abcdefghijklmnopqrstuvwxyz0123456789';
        const baseFont = 'monospace';
        
        canvas.width = 100;
        canvas.height = 30;
        
        ctx.font = `16px ${baseFont}`;
        const baseWidth = ctx.measureText(testString).width;
        
        ctx.font = `16px ${font}, ${baseFont}`;
        const fontWidth = ctx.measureText(testString).width;
        
        return baseWidth !== fontWidth;
      };
      
      fp.fonts = fontList.filter(testFonts);
      fp.fontCount = fp.fonts.length;
      
      // Touch support
      fp.touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // Platform
      fp.platform = navigator.platform;
      fp.hardwareConcurrency = navigator.hardwareConcurrency || 1;
      
      this.fingerprint = fp;
      console.log('[WWS Protect] Fingerprint:', fp);
    }

    /**
     * Расчет риск-скора
     */
    calculateRiskScore() {
      let score = 0;
      this.signals = [];
      
      // WebDriver
      if (this.fingerprint.webdriver) {
        score += this.config.weights.webdriver;
        this.signals.push('Обнаружен WebDriver');
      }
      
      // Automation UA
      if (this.fingerprint.automationUA) {
        score += this.config.weights.automationUA;
        this.signals.push('Подозрительный UserAgent');
      }
      
      // WebGL anomaly
      if (this.fingerprint.webGLAnomaly) {
        score += this.config.weights.webGLAnomaly;
        this.signals.push('Аномальный WebGL renderer');
      }
      
      // Mouse jitter
      if (this.behavioralData.mouseMoves.length > 10) {
        const jitters = this.calculateMouseJitter();
        if (jitters.avgJitter < 0.5) {
          score += this.config.weights.mouseJitter;
          this.signals.push(`Мышь слишком плавная (jitter: ${jitters.avgJitter.toFixed(2)})`);
        }
        if (jitters.automationRate > 0.2) {
          score += 15;
          this.signals.push('События мыши без isTrusted');
        }
      } else if (this.behavioralData.mouseMoves.length === 0) {
        score += 25;
        this.signals.push('Нет движения мыши');
      }
      
      // Click intervals
      if (this.behavioralData.clicks.length > 3) {
        const intervals = this.behavioralData.clicks.slice(1).map(c => c.interval);
        const stdDev = this.calculateStdDev(intervals);
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        
        if (stdDev < 20) {
          score += this.config.weights.clickInterval;
          this.signals.push(`Регулярные клики (std: ${stdDev.toFixed(1)}ms)`);
        }
        if (avgInterval < 150) {
          score += this.config.weights.clickInterval / 2;
          this.signals.push(`Слишком быстрые клики (${avgInterval.toFixed(0)}ms)`);
        }
      }
      
      // Scroll linearity
      if (this.behavioralData.scrolls.length > 5) {
        const linearity = this.calculateScrollLinearity();
        if (linearity.isLinear) {
          score += this.config.weights.scrollLinearity;
          this.signals.push('Линейная прокрутка');
        }
      }
      
      // Keyboard speed
      if (this.behavioralData.keypresses.length > 5) {
        const intervals = this.behavioralData.keypresses.slice(1).map(k => k.interval);
        const avgSpeed = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        
        if (avgSpeed < 50) {
          score += this.config.weights.keyboardSpeed;
          this.signals.push(`Сверхбыстрая печать (${avgSpeed.toFixed(0)}ms)`);
        }
        if (this.isTooUniform(intervals)) {
          score += this.config.weights.keyboardSpeed / 2;
          this.signals.push('Равномерные интервалы печати');
        }
      }
      
      // Focus changes
      if (this.behavioralData.focusChanges.length > 3) {
        score += this.config.weights.focusFrequency;
        this.signals.push('Частые потери фокуса');
      }
      
      // Screen mismatch
      if (this.fingerprint.screenMismatch) {
        score += this.config.weights.screenMismatch;
        this.signals.push('Несоответствие размеров экрана');
      }
      
      // AudioContext
      if (!this.fingerprint.audioContext) {
        score += this.config.weights.audioContext;
        this.signals.push('AudioContext недоступен');
      }
      
      // Fonts
      if (this.fingerprint.fontCount < 3) {
        score += this.config.weights.fonts;
        this.signals.push(`Мало шрифтов (${this.fingerprint.fontCount})`);
      }
      
      // Touch without mouse
      if (this.fingerprint.touchSupport && this.behavioralData.mouseMoves.length < 5) {
        score += this.config.weights.touchSupport;
        this.signals.push('Touch без mouse событий');
      }
      
      // Ограничение 0-100
      this.riskScore = Math.min(100, Math.round(score));
      
      // Сохранить в localStorage
      localStorage.setItem('wwsProtectLastRisk', this.riskScore);
      
      console.log('[WWS Protect] Risk Score:', this.riskScore);
      console.log('[WWS Protect] Signals:', this.signals);
    }

    /**
     * Расчет джиттера мыши
     */
    calculateMouseJitter() {
      const moves = this.behavioralData.mouseMoves;
      if (moves.length < 2) return { avgJitter: 1, automationRate: 0 };
      
      let jitters = [];
      let automationEvents = 0;
      
      for (let i = 1; i < moves.length; i++) {
        const prev = moves[i - 1];
        const curr = moves[i];
        
        const angleDiff = Math.abs(curr.angle - prev.angle);
        const velocityDiff = Math.abs(curr.velocity - prev.velocity);
        const jitter = angleDiff / (velocityDiff + 0.001);
        
        jitters.push(jitter);
        if (!curr.isTrusted) automationEvents++;
      }
      
      const avgJitter = jitters.reduce((a, b) => a + b, 0) / jitters.length;
      const automationRate = automationEvents / moves.length;
      
      return { avgJitter, automationRate };
    }

    /**
     * Расчет линейности скролла
     */
    calculateScrollLinearity() {
      const scrolls = this.behavioralData.scrolls;
      if (scrolls.length < 3) return { isLinear: false };
      
      const velocities = scrolls.map(s => s.velocity);
      const stdDev = this.calculateStdDev(velocities);
      
      // Если стандартное отклонение очень мало — линейный
      const isLinear = stdDev < 0.1 && Math.abs(velocities.filter(v => v !== 0).length) > 0;
      
      return { isLinear, stdDev };
    }

    /**
     * Расчет стандартного отклонения
     */
    calculateStdDev(arr) {
      const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
      const variance = arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length;
      return Math.sqrt(variance);
    }

    /**
     * Проверка на слишком равномерные интервалы
     */
    isTooUniform(arr) {
      if (arr.length < 3) return false;
      const stdDev = this.calculateStdDev(arr);
      const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
      return stdDev / mean < 0.1; // Коэффициент вариации < 10%
    }

    /**
     * Принятие решения по доступу
     */
    makeDecision() {
      this.updateWidget();
      
      if (this.riskScore <= this.config.thresholds.safe) {
        this.setStatus('safe');
      } else if (this.riskScore <= this.config.thresholds.suspicious) {
        this.setStatus('warning');
        // Требуется повторная капча при следующем заходе
        localStorage.setItem('wwsProtectPassed', 'false');
      } else {
        this.setStatus('danger');
        this.blockAccess();
      }
    }

    /**
     * Установить статус
     */
    setStatus(status) {
      const riskClass = status === 'safe' ? 'safe' : status === 'warning' ? 'warning' : 'danger';
      const icon = status === 'safe' ? this.icons.shield : status === 'warning' ? this.icons.warning : this.icons.lock;
      const text = status === 'safe' ? 'Безопасно' : status === 'warning' ? 'Подозрительно' : 'Заблокировано';
      
      this.elements.icon.src = icon;
      this.elements.riskText.textContent = text;
      this.elements.riskFill.className = `wws-risk-fill ${riskClass}`;
      
      if (status === 'safe') {
        this.elements.widget.classList.add('wws-hidden');
      } else {
        this.elements.widget.classList.remove('wws-hidden');
      }
    }

    /**
     * Блокировать доступ
     */
    blockAccess() {
      // Увеличить счетчик блокировок
      this.blockCount++;
      localStorage.setItem('wwsProtectBlockCount', this.blockCount.toString());
      
      // Динамическая длительность блокировки
      const duration = this.config.baseBlockDuration * Math.pow(2, this.blockCount - 1);
      const blockedUntil = Date.now() + duration;
      localStorage.setItem('wwsProtectBlockedUntil', blockedUntil.toString());
      
      this.showBlockScreen(blockedUntil);
    }

    /**
     * Показать экран блокировки
     */
    showBlockScreen(blockedUntil) {
      this.elements.statusText.textContent = 'Достог временно ограничен';
      
      const remaining = Math.ceil((blockedUntil - Date.now()) / 1000);
      
      this.elements.content.innerHTML = `
        <div class="wws-block-container">
          <div class="wws-block-icon">🚫</div>
          <div class="wws-block-timer" id="wws-block-timer">${this.formatTime(remaining)}</div>
          <div style="margin-bottom: 1rem;">Подозрительная активность обнаружена</div>
          <div class="wws-block-reasons">
            <strong>Возможные причины:</strong><br>
            ${this.signals.slice(0, 4).map(s => `• ${s}`).join('<br>')}
          </div>
          <div style="margin-top: 1rem; font-size: 0.8rem; opacity: 0.7;">
            Повторная проверка через ${this.formatTime(remaining)}
          </div>
        </div>
      `;
      
      // Таймер обратного отсчета
      const timerInterval = setInterval(() => {
        const now = Date.now();
        if (now >= blockedUntil) {
          clearInterval(timerInterval);
          localStorage.removeItem('wwsProtectBlockedUntil');
          location.reload();
          return;
        }
        
        const remaining = Math.ceil((blockedUntil - now) / 1000);
        const timerEl = document.getElementById('wws-block-timer');
        if (timerEl) {
          timerEl.textContent = this.formatTime(remaining);
        }
      }, 1000);
    }

    /**
     * Скрыть защитный экран
     */
    hideScreen() {
      this.elements.screen.classList.add('hidden');
      setTimeout(() => {
        this.elements.screen.style.display = 'none';
      }, 500);
    }

    /**
     * Обновить прогресс
     */
    updateProgress(percent) {
      if (this.elements.progressFill) {
        this.elements.progressFill.style.width = percent + '%';
      }
    }

    /**
     * Обновить виджет риска
     */
    updateWidget() {
      const riskClass = this.riskScore <= 30 ? 'safe' : 
                       this.riskScore <= 65 ? 'warning' : 'danger';
      const icon = riskClass === 'safe' ? this.icons.shield : 
                  riskClass === 'warning' ? this.icons.warning : this.icons.lock;
      const text = riskClass === 'safe' ? 'Безопасно' : 
                  riskClass === 'warning' ? 'Подозрительно' : 'Заблокировано';
      
      this.elements.icon.src = icon;
      this.elements.riskText.textContent = text;
      this.elements.riskFill.className = `wws-risk-fill ${riskClass}`;
      this.elements.riskFill.style.width = this.riskScore + '%';
      this.elements.riskValue.textContent = `Risk: ${this.riskScore}/100`;
      
      // Обновить сигналы
      if (this.signals.length > 0) {
        this.elements.signals.innerHTML = '<strong>Обнаружено:</strong><br>' + 
          this.signals.slice(0, 3).map(s => `• ${s}`).join('<br>');
      } else {
        this.elements.signals.innerHTML = 'Поведение в норме';
      }
      
      // Показать/скрыть виджет
      if (this.riskScore <= 30 && this.isVerified) {
        this.elements.widget.classList.add('wws-hidden');
      } else {
        this.elements.widget.classList.remove('wws-hidden');
      }
    }

    /**
     * Развернуть виджет
     */
    expandWidget() {
      if (this.widgetExpanded) return;
      this.widgetExpanded = true;
      this.elements.widget.classList.remove('collapsed');
      this.elements.widget.classList.add('expanded');
      this.elements.toggle.textContent = '⯈';
    }

    /**
     * Свернуть виджет
     */
    collapseWidget() {
      if (!this.widgetExpanded) return;
      this.widgetExpanded = false;
      this.elements.widget.classList.remove('expanded');
      this.elements.widget.classList.add('collapsed');
      this.elements.toggle.textContent = '⯈';
    }

    /**
     * Переключить виджет (по клику)
     */
    toggleWidget() {
      if (this.widgetExpanded) {
        this.collapseWidget();
      } else {
        this.expandWidget();
      }
    }

    /**
     * Постоянный мониторинг поведения
     */
    setupContinuousMonitoring() {
      // Обновлять риск каждые 5 секунд
      setInterval(() => {
        this.calculateRiskScore();
        this.updateWidget();
        
        // Если риск стал высоким — запросить повторную капчу при следующем заходе
        if (this.riskScore > 30) {
          localStorage.setItem('wwsProtectPassed', 'false');
        }
      }, 5000);
      
      // Ограничение на количество данных
      setInterval(() => {
        // Оставить последние 1000 событий
        Object.keys(this.behavioralData).forEach(key => {
          if (Array.isArray(this.behavioralData[key])) {
            if (this.behavioralData[key].length > 1000) {
              this.behavioralData[key] = this.behavioralData[key].slice(-1000);
            }
          }
        });
      }, 30000);
    }

    /**
     * Форматировать время
     */
    formatTime(seconds) {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}:${s.toString().padStart(2, '0')}`;
    }

    /**
     * Ожидание
     */
    wait(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  }

  // Автоинициализация
  function initWWSProtect() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        window.WWSProtect = new WWSProtect();
        setTimeout(() => window.WWSProtect.init(), 100);
      });
    } else {
      window.WWSProtect = new WWSProtect();
      setTimeout(() => window.WWSProtect.init(), 100);
    }
  }

  initWWSProtect();
})();
