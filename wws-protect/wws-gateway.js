/**
 * WWS Gateway v1.0.0 - Защитный шлюз для сайта
 * Показывается ДО загрузки основного контента
 * @license MIT
 */

(function() {
  'use strict';
  
  // Блокируем рендеринг страницы до проверки
  document.documentElement.style.visibility = 'hidden';
  
  const GATEWAY_CONFIG = {
    // Настройки шлюза
    enabled: true,
    debug: false,
    
    // Кому показывать капчу
    showTo: {
      newVisitors: true,       // Новым посетителям
      suspiciousIP: true,      // Подозрительным IP
      vpnUsers: false,         // Пользователям VPN
      highRiskCountries: false // Из стран риска
    },
    
    // Тип проверки
    verification: {
      type: 'captcha',         // captcha, question, puzzle
      difficulty: 'medium',     // easy, medium, hard
      timeout: 300000,         // 5 минут на решение
      attempts: 3              // Максимум попыток
    },
    
    // Внешний вид
    theme: {
      primary: '#2563eb',      // Основной цвет
      background: '#0f172a',   // Фон
      text: '#f8fafc',         // Текст
      mode: 'dark'             // dark, light, auto
    },
    
    // Поведение
    behavior: {
      rememberDevice: true,    // Запоминать устройство (30 дней)
      autoRedirect: true,      // Авторедирект после успеха
      showLoader: true,        // Показывать загрузку
      allowSkip: false         // Разрешить пропуск
    },
    
    // Сообщения (локализация)
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
      footer: 'Система защиты WWS Protect v1.0'
    }
  };
  
  /**
   * Класс защитного шлюза
   */
  class WWSGateway {
    constructor() {
      this.config = this.loadConfig();
      this.attempts = 0;
      this.isVerified = false;
      this.startTime = Date.now();
      this.challenge = null;
      this.sessionId = this.generateSessionId();
      
      this.init();
    }
    
    /**
     * Загрузка конфигурации
     */
    loadConfig() {
      let config = { ...GATEWAY_CONFIG };
      
      // Проверяем конфигурацию из data-атрибутов
      const script = document.currentScript;
      if (script && script.dataset.config) {
        try {
          const userConfig = JSON.parse(script.dataset.config);
          config = this.mergeConfigs(config, userConfig);
        } catch (e) {
          console.warn('Invalid gateway config:', e);
        }
      }
      
      return config;
    }
    
    /**
     * Инициализация шлюза
     */
    async init() {
      // Проверяем, нужно ли показывать шлюз
      const shouldShow = await this.shouldShowGateway();
      
      if (!shouldShow) {
        this.allowAccess();
        return;
      }
      
      // Показываем шлюз
      this.showGateway();
      
      // Начинаем таймер
      this.startTimeoutTimer();
    }
    
    /**
     * Проверка необходимости показа шлюза
     */
    async shouldShowGateway() {
      if (!this.config.enabled) return false;
      
      // Проверяем localStorage на наличие валидного токена
      const token = localStorage.getItem('wws_gateway_token');
      if (token && this.isTokenValid(token)) {
        if (this.config.debug) console.log('✅ Valid token found, skipping gateway');
        return false;
      }
      
      // Проверяем куки
      if (document.cookie.includes('wws_verified=true')) {
        if (this.config.debug) console.log('✅ Cookie found, skipping gateway');
        return false;
      }
      
      // Проверяем, первый ли это визит
      const isFirstVisit = !sessionStorage.getItem('wws_visited');
      if (isFirstVisit && this.config.showTo.newVisitors) {
        return true;
      }
      
      // Дополнительные проверки можно добавить здесь
      // Например, проверка IP через API
      
      return true;
    }
    
    /**
     * Показ шлюза
     */
    showGateway() {
      // Создаем структуру шлюза
      this.createGatewayHTML();
      
      // Генерируем задачу
      this.generateChallenge();
      
      // Назначаем обработчики
      this.setupEventListeners();
      
      // Показываем шлюз
      document.getElementById('wws-gateway').style.display = 'flex';
      
      // Записываем время начала
      this.recordGatewayView();
    }
    
    /**
     * Создание HTML структуры шлюза
     */
    createGatewayHTML() {
      const gateway = document.createElement('div');
      gateway.id = 'wws-gateway';
      gateway.innerHTML = `
        <div class="wws-gateway-container">
          <!-- Заголовок -->
          <div class="wws-gateway-header">
            <div class="wws-logo">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="${this.config.theme.primary}" stroke-width="2"/>
                <path d="M2 17L12 22L22 17" stroke="${this.config.theme.primary}" stroke-width="2"/>
                <path d="M2 12L12 17L22 12" stroke="${this.config.theme.primary}" stroke-width="2"/>
              </svg>
              <h1>${this.config.messages.title}</h1>
            </div>
            <div class="wws-subtitle">${this.config.messages.subtitle}</div>
          </div>
          
          <!-- Основной контент -->
          <div class="wws-gateway-content">
            <div class="wws-instructions">
              <p>${this.config.messages.instructions}</p>
            </div>
            
            <!-- Задача -->
            <div class="wws-challenge-section">
              <div class="wws-challenge-label">${this.config.messages.solving}</div>
              <div class="wws-challenge-display" id="wws-challenge-display">
                <!-- Сюда вставляется задача -->
              </div>
              
              <!-- Поле ввода -->
              <div class="wws-input-group">
                <input type="text" 
                       id="wws-answer-input" 
                       placeholder="${this.config.messages.placeholder}"
                       autocomplete="off"
                       autocorrect="off"
                       autocapitalize="off"
                       spellcheck="false">
                <div class="wws-input-hint" id="wws-input-hint"></div>
              </div>
              
              <!-- Счетчик попыток -->
              <div class="wws-attempts" id="wws-attempts-counter">
                Попытка: <span>1</span> из ${this.config.verification.attempts}
              </div>
              
              <!-- Таймер -->
              <div class="wws-timer" id="wws-timer">
                Осталось времени: <span>05:00</span>
              </div>
            </div>
            
            <!-- Кнопки -->
            <div class="wws-gateway-actions">
              <button class="wws-btn wws-btn-primary" id="wws-submit-btn">
                ${this.config.messages.submit}
              </button>
              
              ${this.config.behavior.allowSkip ? `
                <button class="wws-btn wws-btn-skip" id="wws-skip-btn">
                  ${this.config.messages.skip}
                </button>
              ` : ''}
            </div>
            
            <!-- Загрузка -->
            <div class="wws-loader" id="wws-loader">
              <div class="wws-spinner"></div>
              <div class="wws-loader-text">${this.config.messages.verifying}</div>
            </div>
            
            <!-- Уведомления -->
            <div class="wws-notification" id="wws-notification"></div>
          </div>
          
          <!-- Футер -->
          <div class="wws-gateway-footer">
            <div class="wws-footer-text">${this.config.messages.footer}</div>
            <div class="wws-session-id">Сессия: ${this.sessionId.substring(0, 8)}</div>
          </div>
        </div>
        
        <!-- Фоновые элементы -->
        <div class="wws-background">
          <div class="wws-bg-shape shape-1"></div>
          <div class="wws-bg-shape shape-2"></div>
          <div class="wws-bg-shape shape-3"></div>
        </div>
      `;
      
      document.body.appendChild(gateway);
      
      // Инжектим стили
      this.injectStyles();
    }
    
    /**
     * Инжект стилей
     */
    injectStyles() {
      const style = document.createElement('style');
      style.textContent = this.getGatewayCSS();
      document.head.appendChild(style);
    }
    
    /**
     * CSS стили для шлюза
     */
    getGatewayCSS() {
      return `
        /* Базовые стили */
        #wws-gateway {
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
        }
        
        .wws-gateway-container {
          max-width: 500px;
          margin: 40px auto;
          padding: 40px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          position: relative;
          z-index: 2;
        }
        
        /* Заголовок */
        .wws-gateway-header {
          text-align: center;
          margin-bottom: 40px;
        }
        
        .wws-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          margin-bottom: 15px;
        }
        
        .wws-logo h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
          background: linear-gradient(135deg, ${this.config.theme.primary}, #60a5fa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .wws-subtitle {
          font-size: 16px;
          color: #94a3b8;
          line-height: 1.5;
        }
        
        /* Контент */
        .wws-gateway-content {
          margin-bottom: 30px;
        }
        
        .wws-instructions {
          background: rgba(255, 255, 255, 0.05);
          padding: 20px;
          border-radius: 10px;
          margin-bottom: 30px;
          border-left: 4px solid ${this.config.theme.primary};
        }
        
        .wws-instructions p {
          margin: 0;
          line-height: 1.6;
        }
        
        /* Задача */
        .wws-challenge-section {
          margin-bottom: 30px;
        }
        
        .wws-challenge-label {
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #94a3b8;
          margin-bottom: 10px;
        }
        
        .wws-challenge-display {
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          padding: 30px;
          margin-bottom: 25px;
          text-align: center;
          font-size: 32px;
          font-weight: bold;
          font-family: 'Courier New', monospace;
          min-height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        /* Поле ввода */
        .wws-input-group {
          margin-bottom: 20px;
        }
        
        #wws-answer-input {
          width: 100%;
          padding: 18px 20px;
          font-size: 18px;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          color: ${this.config.theme.text};
          text-align: center;
          transition: all 0.3s;
        }
        
        #wws-answer-input:focus {
          outline: none;
          border-color: ${this.config.theme.primary};
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.3);
        }
        
        #wws-answer-input::placeholder {
          color: #64748b;
        }
        
        .wws-input-hint {
          font-size: 14px;
          color: #94a3b8;
          margin-top: 8px;
          min-height: 20px;
        }
        
        /* Счетчик и таймер */
        .wws-attempts, .wws-timer {
          font-size: 14px;
          color: #94a3b8;
          margin-bottom: 10px;
          display: flex;
          justify-content: space-between;
        }
        
        .wws-attempts span, .wws-timer span {
          color: ${this.config.theme.text};
          font-weight: 600;
        }
        
        /* Кнопки */
        .wws-gateway-actions {
          display: flex;
          gap: 15px;
          margin-top: 30px;
        }
        
        .wws-btn {
          flex: 1;
          padding: 18px;
          font-size: 16px;
          font-weight: 600;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .wws-btn-primary {
          background: linear-gradient(135deg, ${this.config.theme.primary}, #3b82f6);
          color: white;
        }
        
        .wws-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(37, 99, 235, 0.3);
        }
        
        .wws-btn-skip {
          background: rgba(255, 255, 255, 0.1);
          color: #94a3b8;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .wws-btn-skip:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        
        /* Загрузка */
        .wws-loader {
          display: none;
          flex-direction: column;
          align-items: center;
          margin: 30px 0;
        }
        
        .wws-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(255, 255, 255, 0.1);
          border-top-color: ${this.config.theme.primary};
          border-radius: 50%;
          animation: wws-spin 1s linear infinite;
          margin-bottom: 15px;
        }
        
        @keyframes wws-spin {
          to { transform: rotate(360deg); }
        }
        
        .wws-loader-text {
          color: #94a3b8;
          font-size: 14px;
        }
        
        /* Уведомления */
        .wws-notification {
          display: none;
          padding: 15px;
          border-radius: 10px;
          margin-top: 20px;
          text-align: center;
          font-weight: 500;
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
        
        /* Футер */
        .wws-gateway-footer {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: #64748b;
        }
        
        .wws-session-id {
          font-family: 'Courier New', monospace;
          background: rgba(255, 255, 255, 0.05);
          padding: 5px 10px;
          border-radius: 5px;
        }
        
        /* Фон */
        .wws-background {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1;
          overflow: hidden;
        }
        
        .wws-bg-shape {
          position: absolute;
          border-radius: 50%;
          background: linear-gradient(135deg, ${this.config.theme.primary}, transparent);
          opacity: 0.1;
        }
        
        .wws-bg-shape.shape-1 {
          width: 500px;
          height: 500px;
          top: -250px;
          right: -250px;
        }
        
        .wws-bg-shape.shape-2 {
          width: 300px;
          height: 300px;
          bottom: -150px;
          left: -150px;
        }
        
        .wws-bg-shape.shape-3 {
          width: 200px;
          height: 200px;
          top: 50%;
          left: 10%;
        }
        
        /* Адаптивность */
        @media (max-width: 600px) {
          .wws-gateway-container {
            margin: 20px;
            padding: 25px;
          }
          
          .wws-gateway-actions {
            flex-direction: column;
          }
          
          .wws-challenge-display {
            font-size: 24px;
            padding: 20px;
          }
        }
      `;
    }
    
    /**
     * Генерация задачи
     */
    generateChallenge() {
      const type = this.config.verification.type;
      let challenge;
      
      switch (type) {
        case 'question':
          challenge = this.generateQuestionChallenge();
          break;
        case 'puzzle':
          challenge = this.generatePuzzleChallenge();
          break;
        default: // captcha
          challenge = this.generateMathChallenge();
      }
      
      this.challenge = challenge;
      
      // Отображаем задачу
      const display = document.getElementById('wws-challenge-display');
      display.innerHTML = challenge.display;
      
      // Показываем подсказку если есть
      const hint = document.getElementById('wws-input-hint');
      if (challenge.hint) {
        hint.textContent = challenge.hint;
      }
    }
    
    /**
     * Математическая задача
     */
    generateMathChallenge() {
      const difficulties = {
        easy: { min: 1, max: 10, ops: ['+', '-'] },
        medium: { min: 1, max: 20, ops: ['+', '-', '*'] },
        hard: { min: 10, max: 50, ops: ['+', '-', '*', '/'] }
      };
      
      const diff = difficulties[this.config.verification.difficulty] || difficulties.medium;
      const a = Math.floor(Math.random() * (diff.max - diff.min + 1)) + diff.min;
      const b = Math.floor(Math.random() * (diff.max - diff.min + 1)) + diff.min;
      const op = diff.ops[Math.floor(Math.random() * diff.ops.length)];
      
      let question, answer;
      
      switch (op) {
        case '+':
          question = `${a} + ${b} = ?`;
          answer = a + b;
          break;
        case '-':
          question = `${a} - ${b} = ?`;
          answer = a - b;
          break;
        case '*':
          question = `${a} × ${b} = ?`;
          answer = a * b;
          break;
        case '/':
          // Убедимся, что деление целочисленное
          const product = a * b;
          question = `${product} ÷ ${a} = ?`;
          answer = b;
          break;
      }
      
      return {
        type: 'math',
        display: `<div class="math-challenge">${question}</div>`,
        answer: answer.toString(),
        hint: 'Введите числовой ответ'
      };
    }
    
    /**
     * Вопрос с вариантами
     */
    generateQuestionChallenge() {
      const questions = [
        {
          question: "Сколько цветов у радуги?",
          options: ["5", "6", "7", "8"],
          answer: "7"
        },
        {
          question: "Сколько дней в феврале в високосный год?",
          options: ["28", "29", "30", "31"],
          answer: "29"
        },
        {
          question: "Какое животное является символом России?",
          options: ["Медведь", "Орёл", "Волк", "Тигр"],
          answer: "Медведь"
        },
        {
          question: "Сколько сторон у квадрата?",
          options: ["3", "4", "5", "6"],
          answer: "4"
        }
      ];
      
      const q = questions[Math.floor(Math.random() * questions.length)];
      const optionsHTML = q.options.map(opt => 
        `<div class="question-option" data-value="${opt}">${opt}</div>`
      ).join('');
      
      return {
        type: 'question',
        display: `
          <div class="question-challenge">
            <div class="question-text">${q.question}</div>
            <div class="question-options">${optionsHTML}</div>
          </div>
        `,
        answer: q.answer,
        hint: 'Выберите правильный вариант'
      };
    }
    
    /**
     * Пазл (перетаскивание)
     */
    generatePuzzleChallenge() {
      const shapes = ['▲', '●', '■', '◆', '★'];
      const targetShape = shapes[Math.floor(Math.random() * shapes.length)];
      const otherShapes = shapes.filter(s => s !== targetShape);
      const shuffledShapes = [...otherShapes.slice(0, 3), targetShape]
        .sort(() => Math.random() - 0.5);
      
      const shapesHTML = shuffledShapes.map(shape => 
        `<div class="puzzle-piece" data-shape="${shape}">${shape}</div>`
      ).join('');
      
      return {
        type: 'puzzle',
        display: `
          <div class="puzzle-challenge">
            <div class="puzzle-instruction">Перетащите фигуру: <strong>${targetShape}</strong></div>
            <div class="puzzle-area">
              <div class="puzzle-source">${shapesHTML}</div>
              <div class="puzzle-target" id="puzzle-target">
                <div class="puzzle-dropzone">Перетащите сюда</div>
              </div>
            </div>
          </div>
        `,
        answer: targetShape,
        hint: 'Перетащите правильную фигуру в зону справа'
      };
    }
    
    /**
     * Настройка обработчиков событий
     */
    setupEventListeners() {
      const submitBtn = document.getElementById('wws-submit-btn');
      const skipBtn = document.getElementById('wws-skip-btn');
      const input = document.getElementById('wws-answer-input');
      
      // Отправка ответа
      submitBtn.addEventListener('click', () => this.handleSubmit());
      
      // Enter в поле ввода
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.handleSubmit();
        }
      });
      
      // Пропуск (если разрешено)
      if (skipBtn) {
        skipBtn.addEventListener('click', () => {
          if (confirm('Вы уверены, что хотите пропустить проверку безопасности?')) {
            this.allowAccess();
          }
        });
      }
      
      // Обработка выбора вариантов для вопросов
      document.addEventListener('click', (e) => {
        if (e.target.classList.contains('question-option')) {
          this.handleQuestionSelect(e.target);
        }
      });
      
      // Обработка пазлов
      if (this.challenge?.type === 'puzzle') {
        this.setupPuzzleListeners();
      }
    }
    
    /**
     * Обработка выбора варианта вопроса
     */
    handleQuestionSelect(optionElement) {
      // Снимаем выделение со всех вариантов
      document.querySelectorAll('.question-option').forEach(el => {
        el.classList.remove('selected');
      });
      
      // Выделяем выбранный
      optionElement.classList.add('selected');
      
      // Заполняем поле ввода
      document.getElementById('wws-answer-input').value = 
        optionElement.dataset.value;
    }
    
    /**
     * Настройка пазла
     */
    setupPuzzleListeners() {
      const pieces = document.querySelectorAll('.puzzle-piece');
      const dropzone = document.getElementById('puzzle-target');
      
      pieces.forEach(piece => {
        piece.setAttribute('draggable', 'true');
        
        piece.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', piece.dataset.shape);
          piece.classList.add('dragging');
        });
        
        piece.addEventListener('dragend', () => {
          piece.classList.remove('dragging');
        });
      });
      
      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('drag-over');
      });
      
      dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('drag-over');
      });
      
      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('drag-over');
        
        const shape = e.dataTransfer.getData('text/plain');
        const input = document.getElementById('wws-answer-input');
        input.value = shape;
        
        // Показываем выбранную фигуру в дропзоне
        dropzone.innerHTML = `<div class="puzzle-selected">${shape}</div>`;
      });
    }
    
    /**
     * Обработка отправки ответа
     */
    async handleSubmit() {
      const input = document.getElementById('wws-answer-input');
      const answer = input.value.trim();
      
      if (!answer) {
        this.showNotification('Пожалуйста, введите ответ', 'error');
        return;
      }
      
      // Показываем загрузку
      this.showLoader(true);
      
      // Имитация проверки (можно заменить на реальную)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Проверяем ответ
      const isCorrect = this.checkAnswer(answer);
      
      this.showLoader(false);
      
      if (isCorrect) {
        this.handleSuccess();
      } else {
        this.handleFailure();
      }
    }
    
    /**
     * Проверка ответа
     */
    checkAnswer(userAnswer) {
      if (this.challenge.type === 'puzzle' || this.challenge.type === 'question') {
        return userAnswer === this.challenge.answer;
      }
      
      // Для математики приводим к числу
      const userNum = parseFloat(userAnswer);
      const correctNum = parseFloat(this.challenge.answer);
      
      return !isNaN(userNum) && Math.abs(userNum - correctNum) < 0.001;
    }
    
    /**
     * Успешная проверка
     */
    handleSuccess() {
      this.isVerified = true;
      this.attempts = 0;
      
      // Показываем уведомление об успехе
      this.showNotification(this.config.messages.success, 'success');
      
      // Сохраняем токен
      this.saveVerificationToken();
      
      // Записываем куки
      document.cookie = 'wws_verified=true; path=/; max-age=2592000'; // 30 дней
      
      // Отмечаем посещение
      sessionStorage.setItem('wws_visited', 'true');
      
      // Ждем немного и разрешаем доступ
      setTimeout(() => {
        this.allowAccess();
      }, 1500);
    }
    
    /**
     * Неудачная попытка
     */
    handleFailure() {
      this.attempts++;
      
      // Обновляем счетчик попыток
      const attemptsCounter = document.getElementById('wws-attempts-counter');
      attemptsCounter.innerHTML = `Попытка: <span>${this.attempts + 1}</span> из ${this.config.verification.attempts}`;
      
      // Показываем ошибку
      this.showNotification(this.config.messages.error, 'error');
      
      // Очищаем поле ввода
      document.getElementById('wws-answer-input').value = '';
      document.getElementById('wws-answer-input').focus();
      
      // Если превышено количество попыток
      if (this.attempts >= this.config.verification.attempts) {
        this.handleMaxAttempts();
      } else {
        // Генерируем новую задачу
        setTimeout(() => {
          this.generateChallenge();
        }, 1000);
      }
    }
    
    /**
     * Превышено количество попыток
     */
    handleMaxAttempts() {
      this.showNotification('Превышено количество попыток. Доступ заблокирован.', 'error');
      
      // Блокируем форму
      document.getElementById('wws-submit-btn').disabled = true;
      document.getElementById('wws-answer-input').disabled = true;
      
      // Редирект через 3 секунды
      setTimeout(() => {
        window.location.href = 'https://google.com'; // Или ваша страница блокировки
      }, 3000);
    }
    
    /**
     * Показать/скрыть загрузку
     */
    showLoader(show) {
      const loader = document.getElementById('wws-loader');
      const actions = document.querySelector('.wws-gateway-actions');
      const submitBtn = document.getElementById('wws-submit-btn');
      
      if (show) {
        loader.style.display = 'flex';
        actions.style.opacity = '0.5';
        submitBtn.disabled = true;
      } else {
        loader.style.display = 'none';
        actions.style.opacity = '1';
        submitBtn.disabled = false;
      }
    }
    
    /**
     * Показать уведомление
     */
    showNotification(message, type) {
      const notification = document.getElementById('wws-notification');
      notification.textContent = message;
      notification.className = `wws-notification ${type}`;
      notification.style.display = 'block';
      
      // Автоскрытие через 3 секунды
      setTimeout(() => {
        notification.style.display = 'none';
      }, 3000);
    }
    
    /**
     * Запуск таймера
     */
    startTimeoutTimer() {
      const timeLimit = this.config.verification.timeout;
      const timerElement = document.getElementById('wws-timer').querySelector('span');
      
      const updateTimer = () => {
        const elapsed = Date.now() - this.startTime;
        const remaining = Math.max(0, timeLimit - elapsed);
        
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (remaining <= 0) {
          clearInterval(timerInterval);
          this.handleTimeout();
        }
      };
      
      const timerInterval = setInterval(updateTimer, 1000);
      updateTimer();
    }
    
    /**
     * Истекло время
     */
    handleTimeout() {
      this.showNotification('Время истекло. Пожалуйста, обновите страницу.', 'error');
      document.getElementById('wws-submit-btn').disabled = true;
    }
    
    /**
     * Разрешить доступ к сайту
     */
    allowAccess() {
      // Показываем страницу
      document.documentElement.style.visibility = 'visible';
      
      // Плавно скрываем шлюз
      const gateway = document.getElementById('wws-gateway');
      gateway.style.opacity = '0';
      gateway.style.transition = 'opacity 0.5s ease';
      
      // Удаляем шлюз через некоторое время
      setTimeout(() => {
        if (gateway.parentNode) {
          gateway.parentNode.removeChild(gateway);
        }
        
        // Отправляем событие
        this.emitEvent('wws:gateway-passed', {
          sessionId: this.sessionId,
          attempts: this.attempts,
          timeSpent: Date.now() - this.startTime
        });
        
        if (this.config.debug) {
          console.log('🚪 Gateway passed successfully');
        }
      }, 500);
    }
    
    /**
     * Генерация ID сессии
     */
    generateSessionId() {
      return 'wws_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * Сохранение токена верификации
     */
    saveVerificationToken() {
      const token = {
        value: btoa(this.sessionId + '_' + Date.now()),
        expires: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 дней
        device: this.getDeviceFingerprint()
      };
      
      localStorage.setItem('wws_gateway_token', JSON.stringify(token));
    }
    
    /**
     * Проверка токена
     */
    isTokenValid(tokenString) {
      try {
        const token = JSON.parse(tokenString);
        
        // Проверка срока действия
        if (token.expires < Date.now()) {
          return false;
        }
        
        // Можно добавить проверку device fingerprint
        // if (token.device !== this.getDeviceFingerprint()) {
        //   return false;
        // }
        
        return true;
      } catch (e) {
        return false;
      }
    }
    
    /**
     * Получение отпечатка устройства
     */
    getDeviceFingerprint() {
      // Простой fingerprint
      const data = [
        navigator.userAgent,
        navigator.language,
        screen.width + 'x' + screen.height,
        navigator.platform,
        new Date().getTimezoneOffset()
      ].join('|');
      
      return btoa(data).substr(0, 32);
    }
    
    /**
     * Запись просмотра шлюза
     */
    recordGatewayView() {
      const views = parseInt(localStorage.getItem('wws_gateway_views') || '0');
      localStorage.setItem('wws_gateway_views', (views + 1).toString());
    }
    
    /**
     * Отправка события
     */
    emitEvent(name, detail) {
      const event = new CustomEvent(name, { detail });
      window.dispatchEvent(event);
    }
    
    /**
     * Объединение конфигураций
     */
    mergeConfigs(defaultConfig, userConfig) {
      const merged = { ...defaultConfig };
      
      for (const key in userConfig) {
        if (userConfig[key] !== null && typeof userConfig[key] === 'object') {
          merged[key] = this.mergeConfigs(merged[key] || {}, userConfig[key]);
        } else {
          merged[key] = userConfig[key];
        }
      }
      
      return merged;
    }
    
    /**
     * Публичное API
     */
    forceShow() {
      this.showGateway();
    }
    
    skipGateway() {
      this.allowAccess();
    }
    
    reset() {
      localStorage.removeItem('wws_gateway_token');
      sessionStorage.removeItem('wws_visited');
      document.cookie = 'wws_verified=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
  }
  
  // Автоматическая инициализация
  if (document.currentScript && document.currentScript.dataset.autoInit !== 'false') {
    window.addEventListener('DOMContentLoaded', () => {
      window.wwsGateway = new WWSGateway();
    });
  }
  
  // Экспортируем класс
  window.WWSGateway = WWSGateway;
  
})();
