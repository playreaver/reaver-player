/**
 * WWS Gateway v2.0 - Интеллектуальный защитный шлюз
 * Анализирует поведение, показывает капчу только при подозрениях
 * @license MIT
 */

(function() {
  'use strict';
  
  // Конфигурация
  const CONFIG = {
    debug: false,
    
    // Уровни риска
    riskLevels: {
      LOW: 0.3,      // Риск <30% - пропускаем
      MEDIUM: 0.6,   // Риск 30-60% - простая проверка
      HIGH: 0.8      // Риск >60% - сложная проверка
    },
    
    // Факторы анализа
    factors: {
      behavior: 0.4,      // 40% - анализ поведения
      reputation: 0.3,    // 30% - репутация устройства/IP
      technical: 0.3      // 30% - технические признаки
    },
    
    // Действия по уровням риска
    actions: {
      LOW: 'allow',       // Пропустить
      MEDIUM: 'captcha',  // Простая капча
      HIGH: 'gateway'     // Полный шлюз
    }
  };
  
  // Основной класс
  class IntelligentWWSGateway {
    constructor() {
      this.userId = this.generateUserId();
      this.sessionId = this.generateSessionId();
      this.riskScore = 0;
      this.verdict = null;
      this.behaviorData = {};
      this.startTime = Date.now();
      
      this.log('Система инициализирована');
      
      // Начинаем сбор данных
      this.startBehaviorTracking();
      
      // Анализируем и принимаем решение
      setTimeout(() => this.analyzeAndDecide(), 1000);
    }
    
    // Генерация ID
    generateUserId() {
      let userId = localStorage.getItem('wws_user_id');
      if (!userId) {
        userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('wws_user_id', userId);
      }
      return userId;
    }
    
    generateSessionId() {
      return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    }
    
    // Логирование
    log(message, data = null) {
      if (CONFIG.debug) {
        console.log(`🛡️ WWS: ${message}`, data || '');
      }
    }
    
    // ========== АНАЛИЗ ПОВЕДЕНИЯ ==========
    
    startBehaviorTracking() {
      this.behaviorData = {
        // Время и активность
        pageLoadTime: Date.now(),
        mouseMovements: 0,
        clicks: 0,
        keyPresses: 0,
        scrolls: 0,
        timeOnPage: 0,
        
        // Технические данные
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screenRes: `${screen.width}x${screen.height}`,
        colorDepth: screen.colorDepth,
        timezone: new Date().getTimezoneOffset(),
        
        // Сетевые данные
        connection: navigator.connection ? {
          effectiveType: navigator.connection.effectiveType,
          rtt: navigator.connection.rtt,
          downlink: navigator.connection.downlink
        } : null,
        
        // Источник перехода
        referrer: document.referrer,
        directAccess: !document.referrer
      };
      
      // Отслеживание мыши
      document.addEventListener('mousemove', () => {
        this.behaviorData.mouseMovements++;
      });
      
      // Отслеживание кликов
      document.addEventListener('click', (e) => {
        this.behaviorData.clicks++;
        
        // Анализ целевых кликов (ссылки, кнопки)
        const tag = e.target.tagName.toLowerCase();
        if (tag === 'a' || tag === 'button') {
          this.behaviorData.targetClicks = (this.behaviorData.targetClicks || 0) + 1;
        }
      });
      
      // Отслеживание клавиатуры
      document.addEventListener('keydown', () => {
        this.behaviorData.keyPresses++;
      });
      
      // Отслеживание скролла
      let lastScroll = window.pageYOffset;
      document.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        if (Math.abs(currentScroll - lastScroll) > 50) {
          this.behaviorData.scrolls++;
          lastScroll = currentScroll;
        }
      });
      
      // Таймер времени на странице
      setInterval(() => {
        this.behaviorData.timeOnPage = Date.now() - this.behaviorData.pageLoadTime;
      }, 1000);
    }
    
    // ========== АНАЛИЗ РИСКА ==========
    
    async analyzeAndDecide() {
      try {
        this.log('Начинаем анализ риска...');
        
        // Собираем все факторы
        const behaviorRisk = await this.calculateBehaviorRisk();
        const reputationRisk = await this.calculateReputationRisk();
        const technicalRisk = await this.calculateTechnicalRisk();
        
        // Итоговый риск
        this.riskScore = 
          behaviorRisk * CONFIG.factors.behavior +
          reputationRisk * CONFIG.factors.reputation +
          technicalRisk * CONFIG.factors.technical;
        
        this.log('Результаты анализа:', {
          behaviorRisk: behaviorRisk.toFixed(2),
          reputationRisk: reputationRisk.toFixed(2),
          technicalRisk: technicalRisk.toFixed(2),
          totalRisk: this.riskScore.toFixed(2)
        });
        
        // Определяем вердикт
        this.verdict = this.getVerdict();
        this.log(`Вердикт: ${this.verdict} (риск: ${(this.riskScore * 100).toFixed(1)}%)`);
        
        // Выполняем действие
        await this.executeVerdict();
        
      } catch (error) {
        this.log('Ошибка анализа:', error);
        this.allowAccess(); // При ошибке пропускаем
      }
    }
    
    // Расчет риска поведения
    calculateBehaviorRisk() {
      let risk = 0;
      
      // Слишком быстрое взаимодействие (бот)
      const timeSinceLoad = Date.now() - this.behaviorData.pageLoadTime;
      if (timeSinceLoad < 2000 && this.behaviorData.clicks > 3) {
        risk += 0.4;
        this.log('Подозрение: слишком быстрое взаимодействие');
      }
      
      // Отсутствие взаимодействия (скрипт)
      if (timeSinceLoad > 5000 && 
          this.behaviorData.mouseMovements < 3 && 
          this.behaviorData.clicks === 0) {
        risk += 0.3;
        this.log('Подозрение: отсутствие взаимодействия');
      }
      
      // Неестественные движения мыши
      if (this.behaviorData.mouseMovements > 0) {
        const movementPerSecond = this.behaviorData.mouseMovements / (timeSinceLoad / 1000);
        if (movementPerSecond > 20) { // Слишком быстро
          risk += 0.2;
          this.log('Подозрение: неестественные движения мыши');
        }
      }
      
      // Прямой доступ (без реферера)
      if (this.behaviorData.directAccess) {
        risk += 0.1;
      }
      
      return Math.min(1, risk);
    }
    
    // Расчет риска репутации
    async calculateReputationRisk() {
      let risk = 0;
      
      // Проверка истории пользователя
      const userHistory = this.getUserHistory();
      
      // Новый пользователь
      if (!userHistory.firstSeen) {
        risk += 0.2;
        this.log('Новый пользователь');
      } else {
        // Проверяем частоту посещений
        const visits = userHistory.visits || [];
        if (visits.length < 3) {
          risk += 0.1;
        }
        
        // Проверяем прошлые инциденты
        if (userHistory.incidents && userHistory.incidents > 0) {
          risk += 0.3;
          this.log(`Пользователь имел инциденты: ${userHistory.incidents}`);
        }
      }
      
      // Проверка времени суток (боты часто работают ночью)
      const hour = new Date().getHours();
      if (hour >= 0 && hour <= 5) { // Ночь
        risk += 0.1;
      }
      
      // Проверка VPN/Proxy (упрощенно)
      const isLikelyVPN = await this.checkVPN();
      if (isLikelyVPN) {
        risk += 0.2;
        this.log('Подозрение на VPN/Proxy');
      }
      
      return Math.min(1, risk);
    }
    
    // Расчет технического риска
    async calculateTechnicalRisk() {
      let risk = 0;
      
      // Проверка User Agent
      const ua = this.behaviorData.userAgent.toLowerCase();
      
      // Известные боты
      const botPatterns = [
        /bot/, /crawl/, /spider/, /scrape/,
        /headless/, /phantom/, /selenium/,
        /puppeteer/, /playwright/, /curl/,
        /wget/, /python/, /java/, /php/
      ];
      
      for (const pattern of botPatterns) {
        if (pattern.test(ua)) {
          risk += 0.5;
          this.log(`Обнаружен паттерн бота: ${pattern}`);
          break;
        }
      }
      
      // Подозрительные UA
      if (!ua || ua.length < 10) {
        risk += 0.3;
        this.log('Подозрительный User Agent');
      }
      
      // Проверка WebDriver (headless браузеры)
      if (navigator.webdriver === true) {
        risk += 0.7;
        this.log('Обнаружен WebDriver (headless браузер)');
      }
      
      // Проверка плагинов
      if (navigator.plugins.length === 0) {
        risk += 0.2;
        this.log('Нет плагинов (признак headless)');
      }
      
      // Проверка разрешения
      if (screen.width === 0 || screen.height === 0) {
        risk += 0.3;
        this.log('Нулевое разрешение экрана');
      }
      
      // Проверка поддержки WebGL
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) {
          risk += 0.1;
        }
      } catch (e) {
        // Игнорируем
      }
      
      return Math.min(1, risk);
    }
    
    // Получение вердикта
    getVerdict() {
      if (this.riskScore < CONFIG.riskLevels.LOW) {
        return CONFIG.actions.LOW;
      } else if (this.riskScore < CONFIG.riskLevels.HIGH) {
        return CONFIG.actions.MEDIUM;
      } else {
        return CONFIG.actions.HIGH;
      }
    }
    
    // ========== ВЫПОЛНЕНИЕ РЕШЕНИЯ ==========
    
    async executeVerdict() {
      switch (this.verdict) {
        case 'allow':
          await this.allowAccess();
          break;
          
        case 'captcha':
          await this.showSimpleCaptcha();
          break;
          
        case 'gateway':
          await this.showFullGateway();
          break;
          
        default:
          await this.allowAccess();
      }
    }
    
    // Пропуск (низкий риск)
    async allowAccess() {
      this.log('Пропускаем пользователя (низкий риск)');
      
      // Обновляем историю
      this.updateUserHistory({
        passed: true,
        riskScore: this.riskScore,
        timestamp: Date.now()
      });
      
      // Загружаем сайт
      this.loadOriginalSite();
    }
    
    // Простая капча (средний риск)
    async showSimpleCaptcha() {
      this.log('Показываем простую капчу (средний риск)');
      
      // Сохраняем оригинальный контент
      this.saveOriginalContent();
      
      // Показываем легкую проверку
      this.displaySimpleCaptcha();
    }
    
    // Полный шлюз (высокий риск)
    async showFullGateway() {
      this.log('Показываем полный шлюз (высокий риск)');
      
      // Сохраняем оригинальный контент
      this.saveOriginalContent();
      
      // Показываем полную проверку
      this.displayFullGateway();
    }
    
    // ========== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ==========
    
    // Получение истории пользователя
    getUserHistory() {
      try {
        const history = localStorage.getItem(`wws_history_${this.userId}`);
        return history ? JSON.parse(history) : {};
      } catch (e) {
        return {};
      }
    }
    
    // Обновление истории пользователя
    updateUserHistory(data) {
      try {
        const history = this.getUserHistory();
        
        // Инициализируем если нужно
        if (!history.firstSeen) {
          history.firstSeen = Date.now();
          history.visits = [];
          history.incidents = 0;
        }
        
        // Добавляем текущий визит
        history.visits.push({
          timestamp: Date.now(),
          sessionId: this.sessionId,
          riskScore: this.riskScore,
          verdict: this.verdict,
          ...data
        });
        
        // Ограничиваем историю 50 последними визитами
        if (history.visits.length > 50) {
          history.visits = history.visits.slice(-50);
        }
        
        // Сохраняем
        localStorage.setItem(`wws_history_${this.userId}`, JSON.stringify(history));
        
      } catch (e) {
        this.log('Ошибка сохранения истории:', e);
      }
    }
    
    // Проверка VPN (упрощенно)
    async checkVPN() {
      // В реальном проекте здесь был бы запрос к API
      // Сейчас используем эвристики
      
      try {
        // Проверка часового пояса vs IP (упрощенно)
        const timezoneOffset = new Date().getTimezoneOffset();
        
        // Проверка языка vs геолокации
        const language = navigator.language;
        
        // Подозрительные комбинации
        if (language === 'en-US' && Math.abs(timezoneOffset) !== 300 && 
            Math.abs(timezoneOffset) !== 240 && Math.abs(timezoneOffset) !== 180) {
          return true;
        }
        
        if (language.startsWith('ru') && Math.abs(timezoneOffset) !== -180) {
          return true;
        }
        
        return false;
      } catch (e) {
        return false;
      }
    }
    
    // Сохранение оригинального контента
    saveOriginalContent() {
      // Сохраняем body и title
      if (!window._originalBodyHTML) {
        window._originalBodyHTML = document.body.innerHTML;
        window._originalTitle = document.title;
      }
      
      // Очищаем страницу для капчи
      document.body.innerHTML = '';
      document.body.style.cssText = `
        margin: 0;
        padding: 0;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #0f172a;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;
    }
    
    // Загрузка оригинального сайта
    loadOriginalSite() {
      // Если контент был сохранен - восстанавливаем
      if (window._originalBodyHTML) {
        document.body.innerHTML = window._originalBodyHTML;
        document.title = window._originalTitle;
        document.body.style.cssText = '';
      }
      
      // Отправляем событие
      const event = new CustomEvent('wws:access-granted', {
        detail: {
          userId: this.userId,
          sessionId: this.sessionId,
          riskScore: this.riskScore,
          verdict: this.verdict,
          timestamp: Date.now()
        }
      });
      window.dispatchEvent(event);
      
      this.log('Доступ к сайту предоставлен');
    }
    
    // ========== ИНТЕРФЕЙС КАПЧИ ==========
    
    // Простая капча (для среднего риска)
    displaySimpleCaptcha() {
      const challenge = this.generateMathChallenge();
      
      document.body.innerHTML = `
        <div style="
          max-width: 400px;
          width: 90%;
          padding: 30px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 15px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          text-align: center;
        ">
          <h3 style="color: #60a5fa; margin-top: 0;">Быстрая проверка</h3>
          <p style="color: #94a3b8;">Подтвердите, что вы не робот:</p>
          
          <div style="
            font-size: 32px;
            font-weight: bold;
            margin: 25px 0;
            color: white;
            font-family: 'Courier New', monospace;
          ">${challenge.question}</div>
          
          <input type="text" 
                 id="simple-captcha-input"
                 placeholder="Ответ..."
                 style="
                   width: 100%;
                   padding: 15px;
                   font-size: 18px;
                   text-align: center;
                   background: rgba(255, 255, 255, 0.1);
                   border: 2px solid rgba(255, 255, 255, 0.2);
                   border-radius: 10px;
                   color: white;
                   outline: none;
                   margin-bottom: 15px;
                 ">
          
          <button id="simple-captcha-submit"
                  style="
                    width: 100%;
                    padding: 15px;
                    background: #3b82f6;
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                  ">
            Подтвердить
          </button>
          
          <p style="color: #64748b; font-size: 12px; margin-top: 20px;">
            Система определила подозрительную активность
          </p>
        </div>
      `;
      
      // Обработчики
      const input = document.getElementById('simple-captcha-input');
      const button = document.getElementById('simple-captcha-submit');
      
      input.focus();
      
      const checkAnswer = () => {
        const answer = input.value.trim();
        const isCorrect = parseInt(answer) === challenge.answer;
        
        if (isCorrect) {
          this.updateUserHistory({ captchaPassed: true });
          this.loadOriginalSite();
        } else {
          input.value = '';
          input.placeholder = 'Неверно, попробуйте снова';
          input.style.borderColor = '#ef4444';
          
          // После 3 ошибок пропускаем но отмечаем
          this.captchaErrors = (this.captchaErrors || 0) + 1;
          if (this.captchaErrors >= 3) {
            this.updateUserHistory({ captchaFailed: true, incidents: 1 });
            this.loadOriginalSite();
          }
        }
      };
      
      button.addEventListener('click', checkAnswer);
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkAnswer();
      });
    }
    
    // Полный шлюз (для высокого риска)
    displayFullGateway() {
      const challenge = this.generateAdvancedChallenge();
      
      document.body.innerHTML = `
        <div style="
          max-width: 500px;
          width: 90%;
          padding: 40px 30px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          text-align: center;
          backdrop-filter: blur(10px);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        ">
          <!-- Заголовок -->
          <div style="margin-bottom: 30px;">
            <div style="
              width: 70px;
              height: 70px;
              background: linear-gradient(135deg, #dc2626, #ef4444);
              border-radius: 20px;
              margin: 0 auto 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 28px;
              color: white;
            ">
              ⚠️
            </div>
            <h1 style="
              margin: 0 0 10px;
              font-size: 28px;
              color: #f87171;
            ">Повышенный уровень безопасности</h1>
            <p style="color: #94a3b8; line-height: 1.5;">
              Обнаружена подозрительная активность. Требуется дополнительная проверка.
            </p>
          </div>
          
          <!-- Задача -->
          <div style="
            background: rgba(255, 255, 255, 0.08);
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 25px;
            border: 2px solid rgba(255, 255, 255, 0.15);
          ">
            ${challenge.display}
            
            <div id="gateway-answer-container" style="margin-top: 20px;">
              ${challenge.input}
            </div>
            
            <div id="gateway-hint" style="
              font-size: 14px;
              color: #94a3b8;
              margin-top: 15px;
            ">${challenge.hint}</div>
          </div>
          
          <!-- Кнопки -->
          <div style="display: flex; gap: 15px;">
            <button id="gateway-submit"
                    style="
                      flex: 1;
                      padding: 18px;
                      background: linear-gradient(135deg, #dc2626, #ef4444);
                      color: white;
                      border: none;
                      border-radius: 12px;
                      font-weight: 600;
                      cursor: pointer;
                    ">
              Проверить
            </button>
            
            <button id="gateway-report"
                    style="
                      padding: 18px 25px;
                      background: rgba(255, 255, 255, 0.1);
                      color: #94a3b8;
                      border: 1px solid rgba(255, 255, 255, 0.2);
                      border-radius: 12px;
                      cursor: pointer;
                      font-size: 14px;
                    "
                    title="Сообщить о ложном срабатывании">
              ⚠️
            </button>
          </div>
          
          <!-- Таймер -->
          <div id="gateway-timer" style="
            color: #fbbf24;
            margin-top: 20px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
          "></div>
          
          <!-- Футер -->
          <div style="
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            padding-top: 20px;
            margin-top: 25px;
            color: #64748b;
            font-size: 12px;
          ">
            <div>WWS Security System • Уровень риска: <strong>${(this.riskScore * 100).toFixed(0)}%</strong></div>
            <div style="font-size: 11px; margin-top: 5px;">ID: ${this.sessionId}</div>
          </div>
        </div>
      `;
      
      // Таймер
      let timeLeft = 120;
      const timerElement = document.getElementById('gateway-timer');
      const updateTimer = () => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerElement.textContent = `Осталось: ${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeLeft <= 0) {
          clearInterval(timerInterval);
          this.handleGatewayTimeout();
        }
        timeLeft--;
      };
      
      const timerInterval = setInterval(updateTimer, 1000);
      updateTimer();
      
      // Обработчики
      const submitBtn = document.getElementById('gateway-submit');
      const reportBtn = document.getElementById('gateway-report');
      
      submitBtn.addEventListener('click', () => {
        clearInterval(timerInterval);
        const isCorrect = challenge.checkAnswer();
        
        if (isCorrect) {
          this.updateUserHistory({ 
            gatewayPassed: true,
            highRiskResolved: true 
          });
          this.loadOriginalSite();
        } else {
          this.updateUserHistory({ 
            gatewayFailed: true,
            incidents: 1 
          });
          this.displayFullGateway(); // Новая попытка
        }
      });
      
      reportBtn.addEventListener('click', () => {
        if (confirm('Вы уверены, что это ложное срабатывание? Ваш отчет поможет улучшить систему.')) {
          this.updateUserHistory({ falsePositiveReported: true });
          this.loadOriginalSite();
        }
      });
      
      // Инициализируем задачу
      challenge.init();
    }
    
    // Генерация математической задачи
    generateMathChallenge() {
      const operations = [
        { symbol: '+', fn: (a, b) => a + b },
        { symbol: '-', fn: (a, b) => a - b },
        { symbol: '×', fn: (a, b) => a * b }
      ];
      
      const op = operations[Math.floor(Math.random() * operations.length)];
      let a, b;
      
      if (op.symbol === '×') {
        a = Math.floor(Math.random() * 8) + 2;
        b = Math.floor(Math.random() * 8) + 2;
      } else {
        a = Math.floor(Math.random() * 15) + 5;
        b = Math.floor(Math.random() * 15) + 5;
      }
      
      return {
        question: `${a} ${op.symbol} ${b} = ?`,
        answer: op.fn(a, b)
      };
    }
    
    // Генерация сложной задачи
    generateAdvancedChallenge() {
      const types = ['math', 'sequence', 'puzzle'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      switch (type) {
        case 'sequence':
          return this.generateSequenceChallenge();
        case 'puzzle':
          return this.generatePuzzleChallenge();
        default:
          return this.generateMathChallengeAdvanced();
      }
    }
    
    generateSequenceChallenge() {
      // Простая числовая последовательность
      const sequences = [
        { seq: [2, 4, 6, 8, ?], answer: 10, hint: 'Арифметическая прогрессия' },
        { seq: [1, 1, 2, 3, 5, ?], answer: 8, hint: 'Числа Фибоначчи' },
        { seq: [1, 4, 9, 16, ?], answer: 25, hint: 'Квадраты чисел' }
      ];
      
      const selected = sequences[Math.floor(Math.random() * sequences.length)];
      
      return {
        display: `
          <div style="color: #94a3b8; margin-bottom: 10px;">Продолжите последовательность:</div>
          <div style="
            font-size: 24px;
            font-family: 'Courier New', monospace;
            color: white;
            letter-spacing: 5px;
          ">${selected.seq}</div>
        `,
        input: `
          <input type="text" 
                 id="advanced-answer"
                 style="
                   width: 100px;
                   padding: 12px;
                   font-size: 18px;
                   text-align: center;
                   background: rgba(255, 255, 255, 0.1);
                   border: 2px solid rgba(255, 255, 255, 0.2);
                   border-radius: 8px;
                   color: white;
                   outline: none;
                 "
                 placeholder="?">
        `,
        hint: selected.hint,
        checkAnswer: () => {
          const input = document.getElementById('advanced-answer');
          return parseInt(input.value) === selected.answer;
        },
        init: () => {
          document.getElementById('advanced-answer').focus();
        }
      };
    }
    
    generateMathChallengeAdvanced() {
      const a = Math.floor(Math.random() * 20) + 10;
      const b = Math.floor(Math.random() * 10) + 5;
      const c = Math.floor(Math.random() * 5) + 1;
      const answer = a + b - c;
      
      return {
        display: `
          <div style="color: #94a3b8; margin-bottom: 10px;">Решите выражение:</div>
          <div style="
            font-size: 28px;
            font-family: 'Courier New', monospace;
            color: white;
          ">${a} + ${b} - ${c} = ?</div>
        `,
        input: `
          <input type="text" 
                 id="advanced-answer"
                 style="
                   width: 120px;
                   padding: 12px;
                   font-size: 18px;
                   text-align: center;
                   background: rgba(255, 255, 255, 0.1);
                   border: 2px solid rgba(255, 255, 255, 0.2);
                   border-radius: 8px;
                   color: white;
                   outline: none;
                 "
                 placeholder="Ответ">
        `,
        hint: 'Сначала сложение, потом вычитание',
        checkAnswer: () => {
          const input = document.getElementById('advanced-answer');
          return parseInt(input.value) === answer;
        },
        init: () => {
          document.getElementById('advanced-answer').focus();
        }
      };
    }
    
    handleGatewayTimeout() {
      this.updateUserHistory({ gatewayTimeout: true, incidents: 1 });
      
      document.body.innerHTML = `
        <div style="text-align: center; padding: 40px;">
          <div style="font-size: 48px; color: #ef4444; margin-bottom: 20px;">⏰</div>
          <h2 style="color: white;">Время истекло</h2>
          <p style="color: #94a3b8;">Пожалуйста, обновите страницу для повторной проверки.</p>
          <button onclick="location.reload()"
                  style="
                    padding: 12px 30px;
                    background: #3b82f6;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    margin-top: 20px;
                  ">
            Обновить страницу
          </button>
        </div>
      `;
    }
  }
  
  // Инициализация системы
  window.addEventListener('load', () => {
    // Проверяем, не проходили ли мы уже проверку в этой сессии
    const sessionVerified = sessionStorage.getItem('wws_session_verified');
    const recentVerification = localStorage.getItem('wws_recent_verification');
    
    // Если уже проверялись в этой сессии - пропускаем
    if (sessionVerified === 'true') {
      console.log('🛡️ Уже проверено в этой сессии');
      return;
    }
    
    // Если недавно проходили проверку (менее часа назад) - пропускаем
    if (recentVerification) {
      const timeSinceVerification = Date.now() - parseInt(recentVerification);
      if (timeSinceVerification < 3600000) { // 1 час
        console.log('🛡️ Недавно проходили проверку');
        sessionStorage.setItem('wws_session_verified', 'true');
        return;
      }
    }
    
    // Запускаем интеллектуальную систему
    window.wwsGateway = new IntelligentWWSGateway();
  });
  
})();
