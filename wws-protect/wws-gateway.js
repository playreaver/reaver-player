/**
 * WWS Gateway v1.0.1 - Защитный шлюз для сайта
 * Показывается ДО загрузки основного контента
 * @license MIT
 */

(function() {
  'use strict';
  
  // Блокируем рендеринг страницы до проверки
  document.documentElement.style.visibility = 'hidden';
  document.documentElement.style.opacity = '0';
  
  const GATEWAY_CONFIG = {
    // Настройки шлюза
    enabled: true,
    debug: true, // Временно включим дебаг
    
    // Кому показывать капчу
    showTo: {
      newVisitors: true,
      suspiciousIP: true,
      vpnUsers: false,
      highRiskCountries: false
    },
    
    // Тип проверки
    verification: {
      type: 'captcha',
      difficulty: 'easy', // Упростим для теста
      timeout: 300000,
      attempts: 3
    },
    
    // Внешний вид
    theme: {
      primary: '#2563eb',
      background: '#0f172a',
      text: '#f8fafc',
      mode: 'dark'
    },
    
    // Поведение
    behavior: {
      rememberDevice: true,
      autoRedirect: true,
      showLoader: true,
      allowSkip: true // Разрешим пропуск для тестирования
    },
    
    // Сообщения
    messages: {
      title: 'WWS Protect Gateway',
      subtitle: 'Пожалуйста, подтвердите, что вы не робот',
      instructions: 'Это необходимо для защиты сайта от автоматических атак',
      solving: 'Решите задачу ниже:',
      placeholder: 'Введите ответ...',
      submit: 'Продолжить на сайт',
      verifying: 'Проверяем...',
      success: 'Проверка пройдена!',
      error: 'Неправильный ответ. Попробуйте снова.',
      skip: 'Пропустить проверку',
      footer: 'Система защиты WWS Protect v1.0.1'
    }
  };
  
  class WWSGateway {
    constructor() {
      this.config = this.loadConfig();
      this.attempts = 0;
      this.isVerified = false;
      this.startTime = Date.now();
      this.challenge = null;
      this.sessionId = this.generateSessionId();
      this.gatewayElement = null;
      this.timerInterval = null;
      
      if (this.config.debug) {
        console.log('🛡️ WWS Gateway initializing...', this.config);
      }
      
      // Ждем полной загрузки DOM
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.init());
      } else {
        this.init();
      }
    }
    
    loadConfig() {
      let config = { ...GATEWAY_CONFIG };
      
      try {
        const script = document.currentScript;
        if (script && script.dataset.config) {
          const userConfig = JSON.parse(script.dataset.config);
          config = this.deepMerge(config, userConfig);
        }
      } catch (e) {
        console.warn('Invalid gateway config:', e);
      }
      
      return config;
    }
    
    async init() {
      try {
        const shouldShow = await this.shouldShowGateway();
        
        if (!shouldShow) {
          this.allowAccess();
          return;
        }
        
        this.showGateway();
        this.startTimeoutTimer();
        
      } catch (error) {
        console.error('Gateway init error:', error);
        // В случае ошибки все равно показываем сайт
        this.allowAccess();
      }
    }
    
    async shouldShowGateway() {
      if (!this.config.enabled) {
        if (this.config.debug) console.log('Gateway disabled');
        return false;
      }
      
      // Проверка токена
      const token = localStorage.getItem('wws_gateway_token');
      if (token) {
        try {
          const tokenData = JSON.parse(token);
          if (tokenData.expires > Date.now()) {
            if (this.config.debug) console.log('Valid token found');
            return false;
          }
        } catch (e) {
          // Невалидный токен, продолжаем
        }
      }
      
      // Проверка куки
      if (document.cookie.includes('wws_verified=true')) {
        if (this.config.debug) console.log('Cookie found');
        return false;
      }
      
      // Проверка первого визита
      const isFirstVisit = !sessionStorage.getItem('wws_visited');
      if (isFirstVisit && this.config.showTo.newVisitors) {
        if (this.config.debug) console.log('First visit - showing gateway');
        return true;
      }
      
      // По умолчанию показываем для теста
      return true;
    }
    
    showGateway() {
      this.createGatewayHTML();
      
      // Теперь когда элемент создан, можем его найти
      this.gatewayElement = document.getElementById('wws-gateway');
      
      if (!this.gatewayElement) {
        console.error('Gateway element not found!');
        this.allowAccess();
        return;
      }
      
      this.gatewayElement.style.display = 'flex';
      this.generateChallenge();
      this.setupEventListeners();
      this.recordGatewayView();
      
      if (this.config.debug) {
        console.log('Gateway displayed');
      }
    }
    
    createGatewayHTML() {
      // Сначала создаем минимальные стили
      this.injectCriticalCSS();
      
      // Создаем основной контейнер
      const gateway = document.createElement('div');
      gateway.id = 'wws-gateway';
      gateway.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: ${this.config.theme.background};
        color: ${this.config.theme.text};
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        z-index: 999999;
        display: none;
        overflow: auto;
        align-items: center;
        justify-content: center;
      `;
      
      gateway.innerHTML = `
        <div class="wws-gateway-container" style="
          max-width: 500px;
          margin: 20px;
          padding: 30px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          position: relative;
          z-index: 2;
        ">
          <!-- Заголовок -->
          <div class="wws-gateway-header" style="text-align: center; margin-bottom: 30px;">
            <div class="wws-logo" style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 15px;">
              <div style="width: 40px; height: 40px; background: ${this.config.theme.primary}; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">WWS</div>
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; background: linear-gradient(135deg, ${this.config.theme.primary}, #60a5fa); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${this.config.messages.title}</h1>
            </div>
            <div class="wws-subtitle" style="font-size: 16px; color: #94a3b8; line-height: 1.5;">${this.config.messages.subtitle}</div>
          </div>
          
          <!-- Контент -->
          <div class="wws-gateway-content">
            <div class="wws-instructions" style="background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 10px; margin-bottom: 30px; border-left: 4px solid ${this.config.theme.primary};">
              <p style="margin: 0; line-height: 1.6;">${this.config.messages.instructions}</p>
            </div>
            
            <!-- Задача -->
            <div class="wws-challenge-section" style="margin-bottom: 30px;">
              <div class="wws-challenge-label" style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 10px;">${this.config.messages.solving}</div>
              <div class="wws-challenge-display" id="wws-challenge-display" style="
                background: rgba(255, 255, 255, 0.1);
                border: 2px solid rgba(255, 255, 255, 0.2);
                border-radius: 10px;
                padding: 25px;
                margin-bottom: 20px;
                text-align: center;
                font-size: 28px;
                font-weight: bold;
                font-family: 'Courier New', monospace;
                min-height: 100px;
                display: flex;
                align-items: center;
                justify-content: center;
              ">
                <!-- Задача будет здесь -->
              </div>
              
              <!-- Поле ввода -->
              <div class="wws-input-group" style="margin-bottom: 20px;">
                <input type="text" 
                       id="wws-answer-input" 
                       placeholder="${this.config.messages.placeholder}"
                       autocomplete="off"
                       autocorrect="off"
                       autocapitalize="off"
                       spellcheck="false"
                       style="
                         width: 100%;
                         padding: 15px 20px;
                         font-size: 18px;
                         background: rgba(255, 255, 255, 0.1);
                         border: 2px solid rgba(255, 255, 255, 0.2);
                         border-radius: 10px;
                         color: ${this.config.theme.text};
                         text-align: center;
                         transition: all 0.3s;
                       ">
                <div class="wws-input-hint" id="wws-input-hint" style="font-size: 14px; color: #94a3b8; margin-top: 8px; min-height: 20px;"></div>
              </div>
              
              <!-- Счетчик и таймер -->
              <div class="wws-attempts" id="wws-attempts-counter" style="font-size: 14px; color: #94a3b8; margin-bottom: 10px; display: flex; justify-content: space-between;">
                Попытка: <span style="color: ${this.config.theme.text}; font-weight: 600;">1</span> из ${this.config.verification.attempts}
              </div>
              
              <div class="wws-timer" id="wws-timer" style="font-size: 14px; color: #94a3b8; margin-bottom: 20px; display: flex; justify-content: space-between;">
                Осталось времени: <span style="color: ${this.config.theme.text}; font-weight: 600;">05:00</span>
              </div>
            </div>
            
            <!-- Кнопки -->
            <div class="wws-gateway-actions" style="display: flex; gap: 15px; margin-top: 30px;">
              <button class="wws-btn wws-btn-primary" id="wws-submit-btn" style="
                flex: 1;
                padding: 16px;
                font-size: 16px;
                font-weight: 600;
                border: none;
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.3s;
                text-transform: uppercase;
                letter-spacing: 1px;
                background: linear-gradient(135deg, ${this.config.theme.primary}, #3b82f6);
                color: white;
              ">
                ${this.config.messages.submit}
              </button>
              
              ${this.config.behavior.allowSkip ? `
                <button class="wws-btn wws-btn-skip" id="wws-skip-btn" style="
                  flex: 1;
                  padding: 16px;
                  font-size: 16px;
                  font-weight: 600;
                  border: none;
                  border-radius: 10px;
                  cursor: pointer;
                  transition: all 0.3s;
                  text-transform: uppercase;
                  letter-spacing: 1px;
                  background: rgba(255, 255, 255, 0.1);
                  color: #94a3b8;
                  border: 1px solid rgba(255, 255, 255, 0.2);
                ">
                  ${this.config.messages.skip}
                </button>
              ` : ''}
            </div>
            
            <!-- Загрузка -->
            <div class="wws-loader" id="wws-loader" style="display: none; flex-direction: column; align-items: center; margin: 30px 0;">
              <div class="wws-spinner" style="
                width: 40px;
                height: 40px;
                border: 4px solid rgba(255, 255, 255, 0.1);
                border-top-color: ${this.config.theme.primary};
                border-radius: 50%;
                animation: wws-spin 1s linear infinite;
                margin-bottom: 15px;
              "></div>
              <div class="wws-loader-text" style="color: #94a3b8; font-size: 14px;">${this.config.messages.verifying}</div>
            </div>
            
            <!-- Уведомления -->
            <div class="wws-notification" id="wws-notification" style="display: none; padding: 15px; border-radius: 10px; margin-top: 20px; text-align: center; font-weight: 500;"></div>
          </div>
          
          <!-- Футер -->
          <div class="wws-gateway-footer" style="border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 20px; margin-top: 20px; display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #64748b;">
            <div class="wws-footer-text">${this.config.messages.footer}</div>
            <div class="wws-session-id" style="font-family: 'Courier New', monospace; background: rgba(255, 255, 255, 0.05); padding: 5px 10px; border-radius: 5px;">ID: ${this.sessionId.substring(0, 8)}</div>
          </div>
        </div>
        
        <!-- Фон -->
        <div class="wws-background" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 1; overflow: hidden; pointer-events: none;">
          <div style="position: absolute; width: 500px; height: 500px; border-radius: 50%; background: linear-gradient(135deg, ${this.config.theme.primary}, transparent); opacity: 0.1; top: -250px; right: -250px;"></div>
          <div style="position: absolute; width: 300px; height: 300px; border-radius: 50%; background: linear-gradient(135deg, ${this.config.theme.primary}, transparent); opacity: 0.1; bottom: -150px; left: -150px;"></div>
        </div>
      `;
      
      document.body.appendChild(gateway);
      
      // Добавляем CSS анимацию
      this.injectAnimationCSS();
    }
    
    injectCriticalCSS() {
      const style = document.createElement('style');
      style.textContent = `
        @keyframes wws-spin {
          to { transform: rotate(360deg); }
        }
        
        .wws-notification.success {
          background: rgba(34, 197, 94, 0.2);
          color: #4ade80;
          border: 1px solid rgba(34, 197, 94, 0.3);
        }
        
        .wws-notification.error {
          background: rgba(239, 68, 68, 0.2);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }
        
        .question-option {
          padding: 10px 15px;
          margin: 5px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .question-option:hover,
        .question-option.selected {
          background: rgba(37, 99, 235, 0.3);
          border: 1px solid rgba(37, 99, 235, 0.5);
        }
        
        .puzzle-piece {
          display: inline-block;
          width: 50px;
          height: 50px;
          margin: 5px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          cursor: move;
        }
        
        .puzzle-piece.dragging {
          opacity: 0.5;
        }
        
        .puzzle-dropzone {
          width: 100px;
          height: 100px;
          border: 2px dashed rgba(255, 255, 255, 0.3);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
        }
        
        .puzzle-dropzone.drag-over {
          border-color: ${this.config.theme.primary};
          background: rgba(37, 99, 235, 0.1);
        }
        
        @media (max-width: 600px) {
          .wws-gateway-actions {
            flex-direction: column;
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    injectAnimationCSS() {
      // Уже добавлено в injectCriticalCSS
    }
    
    generateChallenge() {
      const type = this.config.verification.type;
      
      if (type === 'question') {
        this.challenge = this.generateQuestionChallenge();
      } else if (type === 'puzzle') {
        this.challenge = this.generatePuzzleChallenge();
      } else {
        this.challenge = this.generateMathChallenge();
      }
      
      const display = document.getElementById('wws-challenge-display');
      const hint = document.getElementById('wws-input-hint');
      
      if (display) {
        display.innerHTML = this.challenge.display;
      }
      
      if (hint && this.challenge.hint) {
        hint.textContent = this.challenge.hint;
      }
    }
    
    generateMathChallenge() {
      const a = Math.floor(Math.random() * 10) + 1;
      const b = Math.floor(Math.random() * 10) + 1;
      const op = Math.random() > 0.5 ? '+' : '-';
      const answer = op === '+' ? a + b : a - b;
      
      return {
        type: 'math',
        display: `<div>${a} ${op} ${b} = ?</div>`,
        answer: answer.toString(),
        hint: 'Введите числовой ответ'
      };
    }
    
    generateQuestionChallenge() {
      const questions = [
        { q: "Сколько цветов у радуги?", a: "7", options: ["5", "6", "7", "8"] },
        { q: "Сколько дней в неделе?", a: "7", options: ["5", "6", "7", "8"] },
        { q: "Сколько сторон у квадрата?", a: "4", options: ["3", "4", "5", "6"] }
      ];
      
      const q = questions[Math.floor(Math.random() * questions.length)];
      const options = q.options.map(opt => 
        `<div class="question-option" data-value="${opt}">${opt}</div>`
      ).join('');
      
      return {
        type: 'question',
        display: `
          <div style="text-align: left;">
            <div style="margin-bottom: 15px; font-size: 18px;">${q.q}</div>
            <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 10px;">
              ${options}
            </div>
          </div>
        `,
        answer: q.a,
        hint: 'Выберите правильный вариант'
      };
    }
    
    setupEventListeners() {
      const submitBtn = document.getElementById('wws-submit-btn');
      const skipBtn = document.getElementById('wws-skip-btn');
      const input = document.getElementById('wws-answer-input');
      
      if (submitBtn) {
        submitBtn.addEventListener('click', () => this.handleSubmit());
      }
      
      if (input) {
        input.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            this.handleSubmit();
          }
        });
        
        // Фокус на поле ввода
        setTimeout(() => input.focus(), 100);
      }
      
      if (skipBtn) {
        skipBtn.addEventListener('click', () => {
          if (confirm('Пропустить проверку безопасности?')) {
            this.allowAccess();
          }
        });
      }
      
      // Обработка выбора вариантов
      document.addEventListener('click', (e) => {
        if (e.target.classList.contains('question-option')) {
          this.handleQuestionSelect(e.target);
        }
      });
    }
    
    handleQuestionSelect(element) {
      document.querySelectorAll('.question-option').forEach(el => {
        el.classList.remove('selected');
      });
      element.classList.add('selected');
      
      const input = document.getElementById('wws-answer-input');
      if (input) {
        input.value = element.dataset.value;
      }
    }
    
    async handleSubmit() {
      const input = document.getElementById('wws-answer-input');
      const answer = input ? input.value.trim() : '';
      
      if (!answer) {
        this.showNotification('Введите ответ', 'error');
        return;
      }
      
      this.showLoader(true);
      
      // Имитация проверки
      await new Promise(resolve => setTimeout(resolve, 800));
      
      this.showLoader(false);
      
      const isCorrect = this.checkAnswer(answer);
      
      if (isCorrect) {
        this.handleSuccess();
      } else {
        this.handleFailure();
      }
    }
    
    checkAnswer(userAnswer) {
      if (!this.challenge) return false;
      
      if (this.challenge.type === 'question' || this.challenge.type === 'puzzle') {
        return userAnswer === this.challenge.answer;
      }
      
      // Для математики
      const userNum = parseFloat(userAnswer);
      const correctNum = parseFloat(this.challenge.answer);
      return !isNaN(userNum) && Math.abs(userNum - correctNum) < 0.001;
    }
    
    handleSuccess() {
      this.showNotification(this.config.messages.success, 'success');
      
      // Сохраняем данные
      this.saveVerificationToken();
      document.cookie = 'wws_verified=true; path=/; max-age=2592000';
      sessionStorage.setItem('wws_visited', 'true');
      
      setTimeout(() => {
        this.allowAccess();
      }, 1000);
    }
    
    handleFailure() {
      this.attempts++;
      
      const attemptsElement = document.getElementById('wws-attempts-counter');
      if (attemptsElement) {
        attemptsElement.innerHTML = `Попытка: <span style="color: ${this.config.theme.text}; font-weight: 600;">${this.attempts + 1}</span> из ${this.config.verification.attempts}`;
      }
      
      this.showNotification(this.config.messages.error, 'error');
      
      const input = document.getElementById('wws-answer-input');
      if (input) {
        input.value = '';
        input.focus();
      }
      
      if (this.attempts >= this.config.verification.attempts) {
        this.handleMaxAttempts();
      } else {
        setTimeout(() => {
          this.generateChallenge();
        }, 1000);
      }
    }
    
    handleMaxAttempts() {
      this.showNotification('Превышено количество попыток', 'error');
      
      const submitBtn = document.getElementById('wws-submit-btn');
      const input = document.getElementById('wws-answer-input');
      
      if (submitBtn) submitBtn.disabled = true;
      if (input) input.disabled = true;
      
      setTimeout(() => {
        this.allowAccess(); // Все равно пропускаем для теста
      }, 3000);
    }
    
    showLoader(show) {
      const loader = document.getElementById('wws-loader');
      const submitBtn = document.getElementById('wws-submit-btn');
      
      if (loader) {
        loader.style.display = show ? 'flex' : 'none';
      }
      
      if (submitBtn) {
        submitBtn.disabled = show;
      }
    }
    
    showNotification(message, type) {
      const notification = document.getElementById('wws-notification');
      if (!notification) return;
      
      notification.textContent = message;
      notification.className = `wws-notification ${type}`;
      notification.style.display = 'block';
      
      setTimeout(() => {
        notification.style.display = 'none';
      }, 3000);
    }
    
    startTimeoutTimer() {
      const timeLimit = this.config.verification.timeout;
      const timerElement = document.getElementById('wws-timer');
      
      if (!timerElement) return;
      
      const updateTimer = () => {
        const elapsed = Date.now() - this.startTime;
        const remaining = Math.max(0, timeLimit - elapsed);
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        
        const span = timerElement.querySelector('span');
        if (span) {
          span.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        if (remaining <= 0) {
          clearInterval(this.timerInterval);
          this.handleTimeout();
        }
      };
      
      this.timerInterval = setInterval(updateTimer, 1000);
      updateTimer();
    }
    
    handleTimeout() {
      this.showNotification('Время истекло', 'error');
      const submitBtn = document.getElementById('wws-submit-btn');
      if (submitBtn) submitBtn.disabled = true;
    }
    
    allowAccess() {
      // Очищаем таймер
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
      }
      
      // Показываем страницу
      document.documentElement.style.visibility = 'visible';
      document.documentElement.style.opacity = '1';
      document.documentElement.style.transition = 'opacity 0.5s ease';
      
      // Удаляем шлюз
      if (this.gatewayElement && this.gatewayElement.parentNode) {
        this.gatewayElement.style.opacity = '0';
        this.gatewayElement.style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
          this.gatewayElement.parentNode.removeChild(this.gatewayElement);
        }, 500);
      }
      
      if (this.config.debug) {
        console.log('🚪 Access granted');
      }
    }
    
    generateSessionId() {
      return 'wws_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    saveVerificationToken() {
      const token = {
        value: btoa(this.sessionId + '_' + Date.now()),
        expires: Date.now() + (30 * 24 * 60 * 60 * 1000),
        device: this.getDeviceFingerprint()
      };
      
      localStorage.setItem('wws_gateway_token', JSON.stringify(token));
    }
    
    getDeviceFingerprint() {
      const data = [
        navigator.userAgent,
        navigator.language,
        screen.width + 'x' + screen.height,
        navigator.platform
      ].join('|');
      
      return btoa(data).substr(0, 32);
    }
    
    recordGatewayView() {
      const views = parseInt(localStorage.getItem('wws_gateway_views') || '0');
      localStorage.setItem('wws_gateway_views', (views + 1).toString());
    }
    
    deepMerge(target, source) {
      const result = { ...target };
      
      for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          result[key] = this.deepMerge(result[key] || {}, source[key]);
        } else {
          result[key] = source[key];
        }
      }
      
      return result;
    }
    
    // Публичные методы
    forceShow() {
      this.showGateway();
    }
    
    skip() {
      this.allowAccess();
    }
    
    reset() {
      localStorage.removeItem('wws_gateway_token');
      sessionStorage.removeItem('wws_visited');
      document.cookie = 'wws_verified=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
  }
  
  // Инициализация
  window.addEventListener('load', () => {
    window.wwsGateway = new WWSGateway();
    window.WWSGateway = WWSGateway;
  });
  
})();
