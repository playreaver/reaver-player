/**
 * WWS Gateway v3.0 - Интеллектуальная система анализа рисков
 * Показывает проверку только подозрительным пользователям
 * @license MIT
 */

(function() {
  'use strict';
  
  console.log('🛡️ WWS Intelligence System initializing...');
  
  // Конфигурация системы
  const CONFIG = {
    debug: true, // Включить логирование
    version: '3.0',
    
    // Пороги риска
    riskThresholds: {
      LOW: 0.3,      // 0-30% риска - пропуск
      MEDIUM: 0.6,   // 30-60% - простая проверка
      HIGH: 0.8      // 60-100% - полная проверка
    },
    
    // Веса факторов
    weights: {
      behavior: 0.35,   // 35% - поведение
      technical: 0.35,  // 35% - технические признаки
      reputation: 0.20, // 20% - репутация
      network: 0.10     // 10% - сетевые признаки
    },
    
    // Время запоминания (в мс)
    memory: {
      session: 30 * 60 * 1000,      // 30 минут
      trustedDevice: 7 * 24 * 60 * 60 * 1000, // 7 дней
      suspiciousActivity: 2 * 60 * 60 * 1000  // 2 часа
    }
  };
  
  class WWSRiskAnalyzer {
    constructor() {
      this.userId = this.generateUserId();
      this.sessionId = this.generateSessionId();
      this.riskScore = 0;
      this.riskFactors = [];
      this.behaviorData = {};
      this.technicalData = {};
      this.networkData = {};
      this.verdict = 'pending';
      
      this.log('Система инициализирована');
      
      // Собираем данные
      this.collectAllData();
      
      // Анализируем и принимаем решение
      this.analyzeRisk();
    }
    
    // === ГЕНЕРАЦИЯ ID ===
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
        
        // Простой хеш
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
    
    // === СБОР ДАННЫХ ===
    collectAllData() {
      this.collectBehaviorData();
      this.collectTechnicalData();
      this.collectNetworkData();
      this.loadUserHistory();
    }
    
    collectBehaviorData() {
      this.behaviorData = {
        // Время и события
        pageLoadTime: Date.now(),
        mouseMovements: 0,
        clicks: 0,
        keyPresses: 0,
        scrollEvents: 0,
        
        // Источник
        referrer: document.referrer,
        directAccess: !document.referrer,
        
        // Скорость взаимодействия
        interactionSpeed: null
      };
      
      // Отслеживание поведения
      let mouseMoveCount = 0;
      let mouseMoveTimer = null;
      
      document.addEventListener('mousemove', () => {
        mouseMoveCount++;
        this.behaviorData.mouseMovements++;
        
        // Измеряем скорость движений
        if (!mouseMoveTimer) {
          mouseMoveTimer = setTimeout(() => {
            this.behaviorData.mouseSpeed = mouseMoveCount / 0.5; // движений в секунду
            mouseMoveCount = 0;
            mouseMoveTimer = null;
          }, 500);
        }
      });
      
      document.addEventListener('click', (e) => {
        this.behaviorData.clicks++;
        
        // Анализ кликов (целевые vs случайные)
        const tag = e.target.tagName.toLowerCase();
        if (tag === 'a' || tag === 'button' || e.target.onclick) {
          this.behaviorData.targetClicks = (this.behaviorData.targetClicks || 0) + 1;
        }
      });
      
      document.addEventListener('keydown', (e) => {
        // Игнорируем служебные клавиши
        if (!['Shift', 'Control', 'Alt', 'Meta', 'Tab', 'Escape'].includes(e.key)) {
          this.behaviorData.keyPresses++;
        }
      });
      
      let lastScroll = 0;
      document.addEventListener('scroll', () => {
        const now = Date.now();
        if (now - lastScroll > 100) { // Дебаунс
          this.behaviorData.scrollEvents++;
          lastScroll = now;
        }
      });
    }
    
    collectTechnicalData() {
      this.technicalData = {
        // Браузер и платформа
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        vendor: navigator.vendor,
        language: navigator.language,
        languages: navigator.languages,
        
        // Экран
        screenWidth: screen.width,
        screenHeight: screen.height,
        colorDepth: screen.colorDepth,
        pixelDepth: screen.pixelDepth,
        
        // Окно
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio,
        
        // Время и локализация
        timezone: new Date().getTimezoneOffset(),
        locale: navigator.language,
        
        // Возможности
        cookiesEnabled: navigator.cookieEnabled,
        javaEnabled: navigator.javaEnabled ? navigator.javaEnabled() : false,
        pdfViewerEnabled: navigator.pdfViewerEnabled || false,
        
        // Плагины
        plugins: navigator.plugins.length,
        pluginList: Array.from(navigator.plugins).map(p => p.name).join(', '),
        
        // Медиа устройства
        mediaDevices: 'mediaDevices' in navigator,
        
        // WebGL
        webgl: this.detectWebGL(),
        
        // Canvas fingerprint
        canvasFingerprint: this.getCanvasFingerprint()
      };
      
      // Дополнительные проверки
      this.checkHeadlessIndicators();
    }
    
    collectNetworkData() {
      this.networkData = {
        // Соединение
        connection: navigator.connection ? {
          effectiveType: navigator.connection.effectiveType,
          rtt: navigator.connection.rtt,
          downlink: navigator.connection.downlink,
          saveData: navigator.connection.saveData
        } : null,
        
        // Заголовки (будут получены с сервера)
        headers: {},
        
        // IP информация (будет получена с сервера)
        ipInfo: null,
        
        // Время загрузки
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
          
          // Очищаем старые записи (> 30 дней)
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
    
    // === АНАЛИЗ РИСКА ===
    analyzeRisk() {
      let totalRisk = 0;
      this.riskFactors = [];
      
      // 1. Анализ поведения (35%)
      const behaviorRisk = this.analyzeBehavior();
      totalRisk += behaviorRisk.score * CONFIG.weights.behavior;
      this.riskFactors.push(...behaviorRisk.factors);
      
      // 2. Технический анализ (35%)
      const technicalRisk = this.analyzeTechnical();
      totalRisk += technicalRisk.score * CONFIG.weights.technical;
      this.riskFactors.push(...technicalRisk.factors);
      
      // 3. Анализ репутации (20%)
      const reputationRisk = this.analyzeReputation();
      totalRisk += reputationRisk.score * CONFIG.weights.reputation;
      this.riskFactors.push(...reputationRisk.factors);
      
      // 4. Сетевой анализ (10%)
      const networkRisk = this.analyzeNetwork();
      totalRisk += networkRisk.score * CONFIG.weights.network;
      this.riskFactors.push(...networkRisk.factors);
      
      this.riskScore = Math.min(1, totalRisk);
      
      // Определяем вердикт
      this.determineVerdict();
      
      // Сохраняем результаты
      this.saveAnalysisResults();
      
      // Выполняем действие
      this.executeVerdict();
    }
    
    analyzeBehavior() {
      let score = 0;
      const factors = [];
      const timeSinceLoad = Date.now() - this.behaviorData.pageLoadTime;
      
      // 1. Слишком быстрое взаимодействие (боты кликают сразу)
      if (timeSinceLoad < 1000 && this.behaviorData.clicks > 2) {
        score += 0.4;
        factors.push({
          type: 'behavior',
          level: 'high',
          message: 'Слишком быстрое взаимодействие после загрузки',
          details: { time: timeSinceLoad, clicks: this.behaviorData.clicks }
        });
      }
      
      // 2. Отсутствие взаимодействия (скрипты)
      if (timeSinceLoad > 3000 && 
          this.behaviorData.mouseMovements < 2 && 
          this.behaviorData.clicks === 0) {
        score += 0.3;
        factors.push({
          type: 'behavior',
          level: 'medium',
          message: 'Отсутствие взаимодействия с сайтом',
          details: { time: timeSinceLoad, movements: this.behaviorData.mouseMovements }
        });
      }
      
      // 3. Неестественная скорость мыши
      if (this.behaviorData.mouseSpeed > 30) { // > 30 движений/сек - подозрительно
        score += 0.2;
        factors.push({
          type: 'behavior',
          level: 'medium',
          message: 'Неестественная скорость движений мыши',
          details: { speed: this.behaviorData.mouseSpeed }
        });
      }
      
      // 4. Прямой доступ (без реферера)
      if (this.behaviorData.directAccess) {
        score += 0.1;
        factors.push({
          type: 'behavior',
          level: 'low',
          message: 'Прямой доступ к сайту (без реферера)',
          details: { referrer: 'none' }
        });
      }
      
      // 5. Очень много кликов за короткое время
      const clicksPerSecond = this.behaviorData.clicks / (timeSinceLoad / 1000);
      if (clicksPerSecond > 5) { // > 5 кликов/сек
        score += 0.3;
        factors.push({
          type: 'behavior',
          level: 'high',
          message: 'Слишком высокая частота кликов',
          details: { clicksPerSecond }
        });
      }
      
      return { score: Math.min(1, score), factors };
    }
    
    analyzeTechnical() {
      let score = 0;
      const factors = [];
      const ua = this.technicalData.userAgent.toLowerCase();
      
      // 1. Известные боты и скрейперы
      const botPatterns = [
        /bot/i, /crawl/i, /spider/i, /scrape/i,
        /headless/i, /phantom/i, /selenium/i,
        /puppeteer/i, /playwright/i, /cheerio/i,
        /curl/i, /wget/i, /python/i, /java/i,
        /php/i, /perl/i, /ruby/i, /go-http/i,
        /node/i, /axios/i, /requests/i,
        /datanyze/i, /crawler/i, /scanner/i
      ];
      
      for (const pattern of botPatterns) {
        if (pattern.test(ua)) {
          score += 0.6;
          factors.push({
            type: 'technical',
            level: 'high',
            message: `Обнаружен User-Agent бота: ${pattern}`,
            details: { userAgent: ua }
          });
          break;
        }
      }
      
      // 2. WebDriver обнаружение (headless браузеры)
      if (navigator.webdriver === true) {
        score += 0.8;
        factors.push({
          type: 'technical',
          level: 'critical',
          message: 'Обнаружен WebDriver (headless браузер)',
          details: { webdriver: true }
        });
      }
      
      // 3. Отсутствие плагинов
      if (this.technicalData.plugins === 0) {
        score += 0.3;
        factors.push({
          type: 'technical',
          level: 'medium',
          message: 'Отсутствуют плагины браузера',
          details: { plugins: 0 }
        });
      }
      
      // 4. Нулевое разрешение
      if (this.technicalData.screenWidth === 0 || this.technicalData.screenHeight === 0) {
        score += 0.4;
        factors.push({
          type: 'technical',
          level: 'high',
          message: 'Нулевое разрешение экрана',
          details: { width: this.technicalData.screenWidth, height: this.technicalData.screenHeight }
        });
      }
      
      // 5. Подозрительные комбинации разрешений
      const suspiciousResolutions = [
        '800x600', '1024x768', '1280x720', '1366x768'
      ];
      const currentRes = `${this.technicalData.screenWidth}x${this.technicalData.screenHeight}`;
      if (suspiciousResolutions.includes(currentRes)) {
        score += 0.2;
        factors.push({
          type: 'technical',
          level: 'low',
          message: 'Подозрительное разрешение экрана',
          details: { resolution: currentRes }
        });
      }
      
      // 6. Нет WebGL (признак headless)
      if (!this.technicalData.webgl) {
        score += 0.2;
        factors.push({
          type: 'technical',
          level: 'medium',
          message: 'Отсутствует поддержка WebGL',
          details: { webgl: false }
        });
      }
      
      // 7. Пустой или короткий User-Agent
      if (!ua || ua.length < 20) {
        score += 0.3;
        factors.push({
          type: 'technical',
          level: 'high',
          message: 'Подозрительно короткий User-Agent',
          details: { length: ua ? ua.length : 0 }
        });
      }
      
      // 8. Проверка языков (боты часто имеют пустой список)
      if (!this.technicalData.languages || this.technicalData.languages.length === 0) {
        score += 0.2;
        factors.push({
          type: 'technical',
          level: 'medium',
          message: 'Отсутствует информация о языках',
          details: { languages: 'none' }
        });
      }
      
      return { score: Math.min(1, score), factors };
    }
    
    analyzeReputation() {
      let score = 0;
      const factors = [];
      
      // 1. Новый пользователь
      const isNewUser = !this.userHistory.sessions || this.userHistory.sessions.length < 2;
      if (isNewUser) {
        score += 0.2;
        factors.push({
          type: 'reputation',
          level: 'low',
          message: 'Новый или редко посещающий пользователь',
          details: { sessions: this.userHistory.sessions?.length || 0 }
        });
      }
      
      // 2. Прошлые инциденты
      if (this.userHistory.incidents > 0) {
        score += Math.min(0.5, this.userHistory.incidents * 0.1);
        factors.push({
          type: 'reputation',
          level: 'medium',
          message: `Найдены прошлые инциденты: ${this.userHistory.incidents}`,
          details: { incidents: this.userHistory.incidents }
        });
      }
      
      // 3. Частота посещений (слишком частые запросы)
      if (this.userHistory.sessions && this.userHistory.sessions.length > 10) {
        // Проверяем последние 10 сессий
        const recentSessions = this.userHistory.sessions.slice(-10);
        const timeSpan = recentSessions[recentSessions.length - 1].timestamp - 
                        recentSessions[0].timestamp;
        
        if (timeSpan < 5 * 60 * 1000) { // 10 сессий за 5 минут
          score += 0.3;
          factors.push({
            type: 'reputation',
            level: 'high',
            message: 'Слишком частые посещения',
            details: { sessions: 10, timeSpan: timeSpan / 1000 + 's' }
          });
        }
      }
      
      // 4. Время суток (ночные визиты более подозрительны)
      const hour = new Date().getHours();
      if (hour >= 0 && hour <= 5) { // Ночь 00:00-05:00
        score += 0.1;
        factors.push({
          type: 'reputation',
          level: 'low',
          message: 'Посещение в ночное время',
          details: { hour }
        });
      }
      
      // 5. Доверенное устройство (снижает риск)
      if (this.userHistory.trusted) {
        score -= 0.3; // Отрицательный вес - снижаем риск
        factors.push({
          type: 'reputation',
          level: 'trusted',
          message: 'Доверенное устройство',
          details: { trusted: true }
        });
      }
      
      return { score: Math.max(0, Math.min(1, score)), factors };
    }
    
    analyzeNetwork() {
      let score = 0;
      const factors = [];
      
      // 1. Медленное соединение (может быть VPN/Tor)
      if (this.networkData.connection && this.networkData.connection.rtt > 500) {
        score += 0.2;
        factors.push({
          type: 'network',
          level: 'medium',
          message: 'Высокая задержка сети',
          details: { rtt: this.networkData.connection.rtt + 'ms' }
        });
      }
      
      // 2. Сохранение данных (чаще на мобильных)
      if (this.networkData.connection && this.networkData.connection.saveData === true) {
        score += 0.1;
        factors.push({
          type: 'network',
          level: 'low',
          message: 'Включен режим экономии данных',
          details: { saveData: true }
        });
      }
      
      // 3. Тип соединения (2G/3G более подозрительны для ботов)
      if (this.networkData.connection && 
          ['slow-2g', '2g', '3g'].includes(this.networkData.connection.effectiveType)) {
        score += 0.1;
        factors.push({
          type: 'network',
          level: 'low',
          message: 'Медленный тип соединения',
          details: { effectiveType: this.networkData.connection.effectiveType }
        });
      }
      
      return { score: Math.min(1, score), factors };
    }
    
    // === ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ===
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
        
        // Рисуем текст
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = '#f60';
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = '#069';
        ctx.fillText('WWS Security', 2, 15);
        ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
        ctx.fillText('WWS Security', 4, 17);
        
        // Получаем data URL
        return canvas.toDataURL().substring(22, 50); // Часть данных
      } catch (e) {
        return 'error';
      }
    }
    
    checkHeadlessIndicators() {
      // Проверка пермиссий (боты часто имеют отклоненные)
      try {
        if (Notification.permission === 'denied') {
          this.technicalData.notificationsDenied = true;
        }
      } catch (e) {}
      
      // Проверка window.chrome (отсутствует в headless)
      this.technicalData.hasChrome = typeof window.chrome !== 'undefined';
      
      // Проверка свойств браузера
      this.technicalData.hasChromeRuntime = typeof chrome !== 'undefined' && 
                                           typeof chrome.runtime !== 'undefined';
    }
    
    // === ОПРЕДЕЛЕНИЕ ВЕРДИКТА ===
    determineVerdict() {
      let verdict = 'allow'; // По умолчанию пропускаем
      
      if (this.riskScore >= CONFIG.riskThresholds.HIGH) {
        verdict = 'full_captcha';
        this.log(`Вердикт: ПОЛНАЯ ПРОВЕРКА (риск: ${(this.riskScore * 100).toFixed(1)}%)`);
      } 
      else if (this.riskScore >= CONFIG.riskThresholds.MEDIUM) {
        verdict = 'simple_captcha';
        this.log(`Вердикт: ПРОСТАЯ ПРОВЕРКА (риск: ${(this.riskScore * 100).toFixed(1)}%)`);
      }
      else if (this.riskScore >= CONFIG.riskThresholds.LOW) {
        verdict = 'allow_with_logging';
        this.log(`Вердикт: ПРОПУСК С ЛОГИРОВАНИЕМ (риск: ${(this.riskScore * 100).toFixed(1)}%)`);
      }
      else {
        verdict = 'allow';
        this.log(`Вердикт: ПРОПУСК (риск: ${(this.riskScore * 100).toFixed(1)}%)`);
      }
      
      this.verdict = verdict;
    }
    
    // === ВЫПОЛНЕНИЕ РЕШЕНИЯ ===
    executeVerdict() {
      switch (this.verdict) {
        case 'full_captcha':
          this.showFullCaptcha();
          break;
          
        case 'simple_captcha':
          this.showSimpleCaptcha();
          break;
          
        case 'allow_with_logging':
          this.logAccess();
          this.allowAccess();
          break;
          
        case 'allow':
        default:
          this.allowAccess();
          break;
      }
    }
    
    // === ИНТЕРФЕЙСЫ ПРОВЕРОК ===
    showFullCaptcha() {
      this.log('Показываем полную капчу (высокий риск)');
      
      // Сохраняем оригинальный контент
      this.saveOriginalContent();
      
      // Показываем сложную проверку
      this.createFullCaptchaUI();
    }
    
    showSimpleCaptcha() {
      this.log('Показываем простую капчу (средний риск)');
      
      // Сохраняем оригинальный контент
      this.saveOriginalContent();
      
      // Показываем легкую проверку
      this.createSimpleCaptchaUI();
    }
    
    logAccess() {
      this.log('Логируем доступ (низкий риск)');
      // Отправляем аналитику на сервер
      this.sendAnalytics();
    }
    
    allowAccess() {
      this.log('Пропускаем пользователя');
      
      // Сохраняем сессию
      this.saveSession();
      
      // Если было доверенное прохождение - помечаем устройство
      if (this.riskScore < 0.2) {
        this.markAsTrusted();
      }
      
      // Отправляем событие
      this.emitAccessGranted();
    }
    
    // === UI КАПЧИ ===
    createSimpleCaptchaUI() {
      // Создаем оверлей поверх сайта
      const overlay = this.createOverlay();
      
      // Генерируем простую задачу
      const a = Math.floor(Math.random() * 9) + 1;
      const b = Math.floor(Math.random() * 9) + 1;
      const answer = a + b;
      
      overlay.innerHTML = `
        <div style="
          max-width: 400px;
          width: 90%;
          padding: 30px;
          background: rgba(18, 18, 26, 0.95);
          border-radius: 20px;
          border: 1px solid rgba(108, 99, 255, 0.3);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          text-align: center;
          backdrop-filter: blur(10px);
        ">
          <div style="margin-bottom: 20px;">
            <div style="
              width: 60px;
              height: 60px;
              background: linear-gradient(135deg, #6C63FF, #36D1DC);
              border-radius: 15px;
              margin: 0 auto 15px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 24px;
            ">
              🤖
            </div>
            <h3 style="color: white; margin: 0 0 10px;">Quick Check</h3>
            <p style="color: #94a3b8; font-size: 14px; margin: 0;">
              Please solve this simple math to continue
            </p>
          </div>
          
          <div style="
            background: rgba(255, 255, 255, 0.05);
            border-radius: 15px;
            padding: 25px;
            margin-bottom: 20px;
            border: 1px solid rgba(255, 255, 255, 0.1);
          ">
            <div style="
              font-size: 36px;
              font-weight: bold;
              color: white;
              font-family: 'Courier New', monospace;
              margin: 15px 0;
            ">
              ${a} + ${b} = ?
            </div>
            
            <input type="text" 
                   id="captcha-answer"
                   placeholder="Enter answer"
                   style="
                     width: 100%;
                     padding: 15px;
                     font-size: 18px;
                     background: rgba(255, 255, 255, 0.1);
                     border: 2px solid rgba(255, 255, 255, 0.2);
                     border-radius: 10px;
                     color: white;
                     text-align: center;
                     outline: none;
                   ">
          </div>
          
          <button id="captcha-submit"
                  style="
                    width: 100%;
                    padding: 16px;
                    background: linear-gradient(135deg, #6C63FF, #36D1DC);
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                    font-size: 16px;
                  ">
            Verify
          </button>
          
          <div style="
            color: #64748b;
            font-size: 12px;
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
          ">
            Risk level: <strong>${(this.riskScore * 100).toFixed(0)}%</strong>
          </div>
        </div>
      `;
      
      // Обработчики
      const answerInput = overlay.querySelector('#captcha-answer');
      const submitBtn = overlay.querySelector('#captcha-submit');
      
      answerInput.focus();
      
      const checkAnswer = () => {
        const userAnswer = parseInt(answerInput.value.trim());
        
        if (userAnswer === answer) {
          this.log('Простая капча пройдена');
          this.removeOverlay();
          this.allowAccess();
        } else {
          answerInput.value = '';
          answerInput.placeholder = 'Wrong, try again';
          answerInput.style.borderColor = '#ef4444';
          
          // Можно добавить счетчик попыток
        }
      };
      
      submitBtn.addEventListener('click', checkAnswer);
      answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkAnswer();
      });
    }
    
    createFullCaptchaUI() {
      // Создаем оверлей
      const overlay = this.createOverlay();
      
      // Создаем сложную задачу (перетаскивание, последовательности и т.д.)
      overlay.innerHTML = `
        <div style="
          max-width: 500px;
          width: 90%;
          padding: 40px 30px;
          background: rgba(10, 10, 18, 0.98);
          border-radius: 20px;
          border: 1px solid rgba(239, 68, 68, 0.3);
          box-shadow: 0 20px 80px rgba(0, 0, 0, 0.7);
          text-align: center;
          backdrop-filter: blur(20px);
        ">
          <!-- Заголовок с предупреждением -->
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
              color: white;
              font-size: 28px;
              animation: pulse 2s infinite;
            ">
              ⚠️
            </div>
            <h3 style="color: #f87171; margin: 0 0 10px; font-size: 24px;">
              Enhanced Security Check
            </h3>
            <p style="color: #94a3b8; line-height: 1.5; font-size: 15px;">
              Suspicious activity detected. Complete this verification to continue.
            </p>
          </div>
          
          <!-- Задача с последовательностью -->
          <div style="
            background: rgba(255, 255, 255, 0.05);
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 25px;
            border: 1px solid rgba(255, 255, 255, 0.15);
          ">
            <div style="color: #94a3b8; margin-bottom: 15px; font-size: 14px;">
              Complete the sequence:
            </div>
            
            <div style="
              font-size: 28px;
              font-family: 'Courier New', monospace;
              color: white;
              letter-spacing: 8px;
              margin: 20px 0;
              padding: 15px;
              background: rgba(0, 0, 0, 0.3);
              border-radius: 10px;
            ">
              2, 4, 6, 8, ?
            </div>
            
            <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
              ${[10, 12, 14, 16].map(num => `
                <button class="sequence-option" 
                        data-value="${num}"
                        style="
                          padding: 12px 20px;
                          background: rgba(255, 255, 255, 0.1);
                          border: 1px solid rgba(255, 255, 255, 0.2);
                          border-radius: 8px;
                          color: white;
                          cursor: pointer;
                          font-size: 16px;
                          transition: all 0.3s;
                        "
                        onmouseover="this.style.background='rgba(108, 99, 255, 0.2)';"
                        onmouseout="this.style.background='rgba(255, 255, 255, 0.1)';">
                  ${num}
                </button>
              `).join('')}
            </div>
          </div>
          
          <!-- Информация о риске -->
          <div style="
            background: rgba(239, 68, 68, 0.1);
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 20px;
            border: 1px solid rgba(239, 68, 68, 0.2);
            font-size: 13px;
            color: #fca5a5;
            text-align: left;
          ">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span>Risk factors detected:</span>
              <strong>${this.riskFactors.filter(f => f.level === 'high' || f.level === 'critical').length}</strong>
            </div>
            <div style="font-size: 12px; color: #fca5a5;">
              ${this.riskFactors.slice(0, 2).map(f => `• ${f.message}`).join('<br>')}
            </div>
          </div>
          
          <!-- Кнопки -->
          <div style="display: flex; gap: 15px;">
            <button id="verify-btn"
                    style="
                      flex: 1;
                      padding: 18px;
                      background: linear-gradient(135deg, #dc2626, #ef4444);
                      color: white;
                      border: none;
                      border-radius: 12px;
                      font-weight: 600;
                      cursor: pointer;
                      font-size: 16px;
                    ">
              Verify & Continue
            </button>
            
            <button id="report-btn"
                    style="
                      padding: 18px 25px;
                      background: rgba(255, 255, 255, 0.1);
                      color: #94a3b8;
                      border: 1px solid rgba(255, 255, 255, 0.2);
                      border-radius: 12px;
                      cursor: pointer;
                      font-size: 14px;
                    "
                    title="Report false positive">
              ⚠️ Report
            </button>
          </div>
          
          <!-- Таймер -->
          <div id="captcha-timer" style="
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
            <div>WWS Security • Session: ${this.sessionId.substring(0, 8)}</div>
            <div style="font-size: 11px; margin-top: 5px;">
              If this is incorrect, please report
            </div>
          </div>
        </div>
        
        <style>
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          
          .sequence-option.selected {
            background: rgba(108, 99, 255, 0.4) !important;
            border-color: #6C63FF !important;
            transform: scale(1.05);
          }
        </style>
      `;
      
      // Таймер (60 секунд)
      let timeLeft = 60;
      const timerElement = overlay.querySelector('#captcha-timer');
      
      const updateTimer = () => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerElement.textContent = `Time left: ${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeLeft <= 0) {
          clearInterval(timerInterval);
          this.handleTimeout();
        }
        timeLeft--;
      };
      
      const timerInterval = setInterval(updateTimer, 1000);
      updateTimer();
      
      // Обработчики
      const options = overlay.querySelectorAll('.sequence-option');
      const verifyBtn = overlay.querySelector('#verify-btn');
      const reportBtn = overlay.querySelector('#report-btn');
      
      let selectedOption = null;
      
      options.forEach(option => {
        option.addEventListener('click', () => {
          options.forEach(opt => opt.classList.remove('selected'));
          option.classList.add('selected');
          selectedOption = option.dataset.value;
        });
      });
      
      verifyBtn.addEventListener('click', () => {
        clearInterval(timerInterval);
        
        if (selectedOption === '10') { // Правильный ответ для последовательности
          this.log('Полная капча пройдена');
          this.removeOverlay();
          this.allowAccess();
        } else {
          this.log('Полная капча не пройдена');
          // Можно показать ошибку
        }
      });
      
      reportBtn.addEventListener('click', () => {
        if (confirm('Report this as a false positive?')) {
          this.reportFalsePositive();
          this.removeOverlay();
          this.allowAccess();
        }
      });
    }
    
    // === УТИЛИТЫ ===
    createOverlay() {
      // Удаляем старый оверлей
      const oldOverlay = document.getElementById('wws-security-overlay');
      if (oldOverlay) oldOverlay.remove();
      
      // Создаем новый
      const overlay = document.createElement('div');
      overlay.id = 'wws-security-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(5, 5, 15, 0.98);
        backdrop-filter: blur(5px);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      `;
      
      document.body.appendChild(overlay);
      
      // Блокируем скролл оригинального сайта
      document.body.style.overflow = 'hidden';
      
      return overlay;
    }
    
    removeOverlay() {
      const overlay = document.getElementById('wws-security-overlay');
      if (overlay) overlay.remove();
      
      // Восстанавливаем скролл
      document.body.style.overflow = '';
    }
    
    saveOriginalContent() {
      // Уже сохранен при инициализации
      if (!window._wwsOriginalContent) {
        window._wwsOriginalContent = {
          bodyHTML: document.body.innerHTML,
          title: document.title,
          bodyStyle: document.body.getAttribute('style')
        };
      }
    }
    
    restoreOriginalContent() {
      if (window._wwsOriginalContent) {
        document.body.innerHTML = window._wwsOriginalContent.bodyHTML;
        document.title = window._wwsOriginalContent.title;
        if (window._wwsOriginalContent.bodyStyle) {
          document.body.setAttribute('style', window._wwsOriginalContent.bodyStyle);
        }
      }
    }
    
    saveSession() {
      const session = {
        sessionId: this.sessionId,
        timestamp: Date.now(),
        riskScore: this.riskScore,
        verdict: this.verdict,
        factors: this.riskFactors,
        userAgent: this.technicalData.userAgent,
        deviceFingerprint: this.generateDeviceFingerprint()
      };
      
      // Сохраняем в историю
      if (!this.userHistory.sessions) this.userHistory.sessions = [];
      this.userHistory.sessions.push(session);
      
      // Ограничиваем количество сессий
      if (this.userHistory.sessions.length > 50) {
        this.userHistory.sessions = this.userHistory.sessions.slice(-50);
      }
      
      // Сохраняем в localStorage
      try {
        localStorage.setItem(`wws_history_${this.userId}`, JSON.stringify(this.userHistory));
        sessionStorage.setItem('wws_session_active', 'true');
      } catch (e) {
        this.log('Ошибка сохранения сессии:', e);
      }
    }
    
    markAsTrusted() {
      this.userHistory.trusted = true;
      this.userHistory.trustedSince = Date.now();
      this.userHistory.trustedDevice = this.generateDeviceFingerprint();
      
      try {
        localStorage.setItem(`wws_history_${this.userId}`, JSON.stringify(this.userHistory));
      } catch (e) {
        this.log('Ошибка сохранения доверия:', e);
      }
    }
    
    reportFalsePositive() {
      const report = {
        userId: this.userId,
        sessionId: this.sessionId,
        riskScore: this.riskScore,
        factors: this.riskFactors,
        userAgent: this.technicalData.userAgent,
        timestamp: Date.now(),
        type: 'false_positive'
      };
      
      // Сохраняем отчет
      try {
        const reports = JSON.parse(localStorage.getItem('wws_false_positives') || '[]');
        reports.push(report);
        localStorage.setItem('wws_false_positives', JSON.stringify(reports.slice(-100)));
      } catch (e) {
        this.log('Ошибка сохранения отчета:', e);
      }
      
      // Можно отправить на сервер
      this.sendReportToServer(report);
    }
    
    sendAnalytics() {
      // Отправляем аналитику на ваш сервер
      const analytics = {
        userId: this.userId,
        sessionId: this.sessionId,
        riskScore: this.riskScore,
        verdict: this.verdict,
        factors: this.riskFactors.filter(f => f.level === 'high' || f.level === 'critical'),
        timestamp: Date.now()
      };
      
      // Пример отправки
      if (typeof gtag !== 'undefined') {
        gtag('event', 'wws_security_scan', {
          risk_score: this.riskScore,
          verdict: this.verdict,
          factors_count: analytics.factors.length
        });
      }
    }
    
    sendReportToServer(report) {
      // Отправка отчета на сервер
      // fetch('/api/wws/report-false-positive', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(report)
      // });
    }
    
    emitAccessGranted() {
      const event = new CustomEvent('wws:access-granted', {
        detail: {
          userId: this.userId,
          sessionId: this.sessionId,
          riskScore: this.riskScore,
          verdict: this.verdict,
          factors: this.riskFactors,
          timestamp: Date.now()
        }
      });
      
      window.dispatchEvent(event);
      this.log('Доступ предоставлен');
    }
    
    saveAnalysisResults() {
      const analysis = {
        userId: this.userId,
        sessionId: this.sessionId,
        timestamp: Date.now(),
        riskScore: this.riskScore,
        verdict: this.verdict,
        factors: this.riskFactors,
        behaviorData: this.behaviorData,
        technicalData: {
          // Только безопасные данные
          userAgent: this.technicalData.userAgent,
          platform: this.technicalData.platform,
          screen: `${this.technicalData.screenWidth}x${this.technicalData.screenHeight}`,
          language: this.technicalData.language
        }
      };
      
      // Сохраняем для отладки
      if (CONFIG.debug) {
        console.log('🛡️ WWS Analysis:', analysis);
      }
      
      // Можно сохранить в localStorage для анализа
      try {
        const analyses = JSON.parse(localStorage.getItem('wws_analyses') || '[]');
        analyses.push(analysis);
        localStorage.setItem('wws_analyses', JSON.stringify(analyses.slice(-20)));
      } catch (e) {
        // Игнорируем ошибки localStorage
      }
    }
    
    handleTimeout() {
      this.log('Время проверки истекло');
      
      const overlay = document.getElementById('wws-security-overlay');
      if (overlay) {
        overlay.innerHTML = `
          <div style="text-align: center; color: white; max-width: 400px;">
            <div style="font-size: 48px; margin-bottom: 20px;">⏰</div>
            <h3 style="margin-bottom: 10px;">Time Expired</h3>
            <p style="color: #94a3b8; margin-bottom: 30px;">
              Please refresh the page and try again.
            </p>
            <button onclick="location.reload()"
                    style="
                      padding: 12px 30px;
                      background: #6C63FF;
                      color: white;
                      border: none;
                      border-radius: 8px;
                      cursor: pointer;
                    ">
              Refresh Page
            </button>
          </div>
        `;
      }
    }
    
    log(message, data) {
      if (CONFIG.debug) {
        console.log(`🛡️ WWS: ${message}`, data || '');
      }
    }
  }
  
  // === ИНИЦИАЛИЗАЦИЯ СИСТЕМЫ ===
  function initializeWWS() {
    // Проверяем, не отключена ли система
    if (localStorage.getItem('wws_disabled') === 'true') {
      console.log('🛡️ WWS отключена пользователем');
      return;
    }
    
    // Проверяем, не проходили ли мы уже проверку в этой сессии
    if (sessionStorage.getItem('wws_session_passed') === 'true') {
      console.log('🛡️ Уже проходили проверку в этой сессии');
      return;
    }
    
    // Проверяем доверенное устройство
    const userId = localStorage.getItem('wws_user_id');
    if (userId) {
      try {
        const history = JSON.parse(localStorage.getItem(`wws_history_${userId}`) || '{}');
        if (history.trusted && history.trustedSince) {
          const timeSinceTrusted = Date.now() - history.trustedSince;
          if (timeSinceTrusted < CONFIG.memory.trustedDevice) {
            console.log('🛡️ Доверенное устройство, пропускаем проверку');
            sessionStorage.setItem('wws_session_passed', 'true');
            return;
          }
        }
      } catch (e) {}
    }
    
    // Проверяем время последней подозрительной активности
    const lastSuspicious = localStorage.getItem('wws_last_suspicious');
    if (lastSuspicious) {
      const timeSinceSuspicious = Date.now() - parseInt(lastSuspicious);
      if (timeSinceSuspicious < CONFIG.memory.suspiciousActivity) {
        console.log('🛡️ Недавно была подозрительная активность, показываем проверку');
      }
    }
    
    // Запускаем анализатор
    window.wwsAnalyzer = new WWSRiskAnalyzer();
  }
  
  // Запускаем когда страница полностью загружена
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWWS);
  } else {
    initializeWWS();
  }
  
  // Экспортируем API
  window.WWS = {
    version: CONFIG.version,
    
    // Методы для интеграции
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
    
    disableTemporarily: (hours = 24) => {
      localStorage.setItem('wws_disabled_until', Date.now() + (hours * 60 * 60 * 1000));
    },
    
    getRiskScore: () => window.wwsAnalyzer?.riskScore || 0,
    
    getRiskFactors: () => window.wwsAnalyzer?.riskFactors || [],
    
    // События
    onAccessGranted: (callback) => {
      window.addEventListener('wws:access-granted', callback);
    }
  };
  
})();
