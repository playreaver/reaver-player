/**
 * WWS-Protect v1.0.0 - Web Work Shield
 * Система защиты от ботов и атак для веб-сайтов
 * @license MIT
 */

(function(window, document) {
  'use strict';
  
  const WWS_VERSION = '1.0.0';
  const WWS_STORAGE_KEY = 'wws_protection_data';
  
  // Конфигурация по умолчанию
  const DEFAULT_CONFIG = {
    // Основные настройки
    enabled: true,
    debug: false,
    autoInit: true,
    
    // Модули защиты
    modules: {
      botDetector: true,
      rateLimiter: true,
      firewall: true,
      honeypot: true,
      captcha: {
        enabled: true,
        difficulty: 'medium', // easy, medium, hard
        type: 'math' // math, puzzle, text
      }
    },
    
    // Правила защиты
    rules: {
      maxRequestsPerMinute: 30,
      blockSuspiciousUA: true,
      blockHeadless: true,
      blockVPN: false, // Опционально
      allowCrawlers: false
    },
    
    // Действия при обнаружении
    actions: {
      onBotDetected: 'challenge', // challenge, block, redirect, ignore
      challengeTimeout: 30000, // 30 секунд на решение
      redirectUrl: '/blocked.html',
      silentMode: false // Тихий режим (не показывать капчу)
    },
    
    // UI настройки
    ui: {
      theme: 'dark', // dark, light, auto
      position: 'bottom-right',
      language: 'ru' // ru, en
    }
  };
  
  // Локализация
  const LANGUAGES = {
    ru: {
      challengeTitle: 'Подтвердите, что вы человек',
      challengeInstructions: 'Решите задачу ниже:',
      submit: 'Проверить',
      tryAgain: 'Попробовать снова',
      accessDenied: 'Доступ запрещен',
      tooManyRequests: 'Слишком много запросов'
    },
    en: {
      challengeTitle: 'Verify you are human',
      challengeInstructions: 'Solve the challenge below:',
      submit: 'Verify',
      tryAgain: 'Try again',
      accessDenied: 'Access denied',
      tooManyRequests: 'Too many requests'
    }
  };
  
  /**
   * Главный класс WWS-Protect
   */
  class WWSProtect {
    constructor(userConfig = {}) {
      this.config = this.mergeConfigs(DEFAULT_CONFIG, userConfig);
      this.modules = {};
      this.threats = [];
      this.stats = {
        blocked: 0,
        challenged: 0,
        allowed: 0,
        threatsDetected: []
      };
      this.isInitialized = false;
      
      // Загрузка сохраненных данных
      this.loadSavedData();
      
      if (this.config.autoInit) {
        this.init();
      }
    }
    
    /**
     * Инициализация системы
     */
    async init() {
      if (this.isInitialized || !this.config.enabled) {
        return;
      }
      
      try {
        console.log(`🛡️ WWS-Protect v${WWS_VERSION} initializing...`);
        
        // Загружаем модули
        await this.loadModules();
        
        // Инициализируем модули
        for (const [name, module] of Object.entries(this.modules)) {
          if (this.config.modules[name] !== false) {
            await module.init(this.config);
          }
        }
        
        // Настройка глобальных обработчиков
        this.setupGlobalHandlers();
        
        this.isInitialized = true;
        
        // Отправляем событие инициализации
        this.emitEvent('wws:ready', { 
          version: WWS_VERSION,
          config: this.config 
        });
        
        console.log(`✅ WWS-Protect initialized successfully`);
        
        // Автосохранение каждые 5 минут
        setInterval(() => this.saveData(), 5 * 60 * 1000);
        
      } catch (error) {
        console.error('❌ WWS-Protect initialization failed:', error);
      }
    }
    
    /**
     * Загрузка модулей
     */
    async loadModules() {
      const moduleLoaders = [];
      
      // Загрузка детектора ботов
      if (this.config.modules.botDetector) {
        moduleLoaders.push(
          this.loadModule('botDetector', './wws-bot-detector.js')
        );
      }
      
      // Загрузка rate limiter
      if (this.config.modules.rateLimiter) {
        moduleLoaders.push(
          this.loadModule('rateLimiter', './wws-rate-limiter.js')
        );
      }
      
      // Загрузка firewall
      if (this.config.modules.firewall) {
        moduleLoaders.push(
          this.loadModule('firewall', './wws-firewall.js')
        );
      }
      
      // Загрузка honeypot
      if (this.config.modules.honeypot) {
        moduleLoaders.push(
          this.loadModule('honeypot', './wws-honeypot.js')
        );
      }
      
      // Загрузка капчи
      if (this.config.modules.captcha && this.config.modules.captcha.enabled) {
        moduleLoaders.push(
          this.loadModule('captcha', './wws-captcha.js')
        );
      }
      
      await Promise.all(moduleLoaders);
    }
    
    /**
     * Загрузка отдельного модуля
     */
    async loadModule(name, path) {
      try {
        const module = await import(path);
        this.modules[name] = module.default ? 
          new module.default(this) : 
          new module(this);
      } catch (error) {
        console.warn(`⚠️ Module ${name} not found:`, error);
        this.modules[name] = { init: () => Promise.resolve() };
      }
    }
    
    /**
     * Настройка глобальных обработчиков
     */
    setupGlobalHandlers() {
      // Перехват отправки форм
      document.addEventListener('submit', (e) => {
        if (!this.config.enabled) return;
        
        const form = e.target;
        if (form.tagName === 'FORM') {
          this.checkFormSubmission(form, e);
        }
      });
      
      // Перехват AJAX запросов
      this.interceptFetch();
      this.interceptXHR();
      
      // Защита от копирования (опционально)
      if (this.config.modules.firewall) {
        document.addEventListener('copy', (e) => {
          this.emitEvent('wws:copy-attempt', { 
            text: window.getSelection().toString() 
          });
        });
      }
    }
    
    /**
     * Проверка отправки формы
     */
    async checkFormSubmission(form, event) {
      const threatScore = await this.calculateThreatScore(form);
      
      if (threatScore > 70) { // Высокий риск
        event.preventDefault();
        
        if (this.config.actions.onBotDetected === 'challenge') {
          await this.showChallenge(form);
        } else if (this.config.actions.onBotDetected === 'block') {
          this.blockAccess();
        } else if (this.config.actions.onBotDetected === 'redirect') {
          window.location.href = this.config.actions.redirectUrl;
        }
        
        this.recordThreat('form_submission', threatScore);
      }
    }
    
    /**
     * Расчет уровня угрозы
     */
    async calculateThreatScore(context) {
      let score = 0;
      
      // Проверяем через все модули
      for (const [name, module] of Object.entries(this.modules)) {
        if (module.calculateThreatScore) {
          const moduleScore = await module.calculateThreatScore(context);
          score += moduleScore;
        }
      }
      
      return Math.min(100, score);
    }
    
    /**
     * Показать капчу/задачу
     */
    async showChallenge(context) {
      if (this.config.modules.captcha && this.modules.captcha) {
        return await this.modules.captcha.showChallenge(context);
      }
      return true; // Если капча отключена, пропускаем
    }
    
    /**
     * Блокировка доступа
     */
    blockAccess() {
      document.documentElement.innerHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Access Denied</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 50px; 
              background: #f8f9fa;
            }
            .blocked-container {
              max-width: 500px;
              margin: 0 auto;
              padding: 40px;
              background: white;
              border-radius: 10px;
              box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }
          </style>
        </head>
        <body>
          <div class="blocked-container">
            <h1>🛡️ Access Restricted</h1>
            <p>Our security system has detected unusual activity.</p>
            <p>If you believe this is an error, please contact support.</p>
          </div>
        </body>
        </html>
      `;
    }
    
    /**
     * Перехват fetch запросов
     */
    interceptFetch() {
      const originalFetch = window.fetch;
      
      window.fetch = async (...args) => {
        const threatScore = await this.calculateThreatScore({
          type: 'fetch',
          url: args[0]
        });
        
        if (threatScore > 80) {
          throw new Error('Security restriction');
        }
        
        return originalFetch.apply(window, args);
      };
    }
    
    /**
     * Перехват XMLHttpRequest
     */
    interceptXHR() {
      const originalOpen = XMLHttpRequest.prototype.open;
      const originalSend = XMLHttpRequest.prototype.send;
      
      XMLHttpRequest.prototype.open = function(...args) {
        this._wwsRequestUrl = args[1];
        return originalOpen.apply(this, args);
      };
      
      XMLHttpRequest.prototype.send = function(...args) {
        const threatScore = this._wws.calculateThreatScore({
          type: 'xhr',
          url: this._wwsRequestUrl
        });
        
        if (threatScore > 80) {
          throw new Error('Security restriction');
        }
        
        return originalSend.apply(this, args);
      };
    }
    
    /**
     * Сохранение данных
     */
    saveData() {
      try {
        const data = {
          stats: this.stats,
          threats: this.threats.slice(-100), // Последние 100 угроз
          timestamp: Date.now()
        };
        
        localStorage.setItem(WWS_STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        console.warn('Failed to save WWS data:', error);
      }
    }
    
    /**
     * Загрузка сохраненных данных
     */
    loadSavedData() {
      try {
        const saved = localStorage.getItem(WWS_STORAGE_KEY);
        if (saved) {
          const data = JSON.parse(saved);
          this.stats = data.stats || this.stats;
          this.threats = data.threats || this.threats;
        }
      } catch (error) {
        console.warn('Failed to load WWS data:', error);
      }
    }
    
    /**
     * Запись угрозы
     */
    recordThreat(type, score, details = {}) {
      const threat = {
        id: 'threat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        type,
        score,
        details,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        ip: 'detected_later' // Будет заполнено сервером
      };
      
      this.threats.push(threat);
      this.stats.threatsDetected.push(threat);
      this.stats.blocked++;
      
      this.emitEvent('wws:threat-detected', threat);
      
      // Отправка на сервер (если настроено)
      if (this.config.analyticsEndpoint) {
        this.reportThreat(threat);
      }
    }
    
    /**
     * Отправка угрозы на сервер
     */
    async reportThreat(threat) {
      try {
        await fetch(this.config.analyticsEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(threat)
        });
      } catch (error) {
        // Игнорируем ошибки отправки
      }
    }
    
    /**
     * Генерация события
     */
    emitEvent(name, detail = {}) {
      const event = new CustomEvent(name, {
        detail: { ...detail, timestamp: Date.now() }
      });
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
    
    // Получить модуль
    getModule(name) {
      return this.modules[name];
    }
    
    // Обновить конфигурацию
    updateConfig(newConfig) {
      this.config = this.mergeConfigs(this.config, newConfig);
      this.emitEvent('wws:config-updated', { config: this.config });
    }
    
    // Получить статистику
    getStats() {
      return { ...this.stats };
    }
    
    // Получить список угроз
    getThreats(limit = 50) {
      return this.threats.slice(-limit);
    }
    
    // Проверить IP (заглушка для серверной проверки)
    async checkIP(ip) {
      // Можно интегрировать с сервисами типа AbuseIPDB
      return { risk: 'low' };
    }
    
    // Деструктор
    destroy() {
      Object.values(this.modules).forEach(module => {
        if (module.destroy) module.destroy();
      });
      
      this.modules = {};
      this.isInitialized = false;
      this.saveData();
      
      this.emitEvent('wws:destroyed');
      
      console.log('🛡️ WWS-Protect destroyed');
    }
  }
  
  // Экспорт в глобальную область видимости
  window.WWSProtect = WWSProtect;
  
  // Автоматическое создание экземпляра при загрузке
  if (document.currentScript) {
    const script = document.currentScript;
    
    // Чтение конфигурации из data-атрибутов
    const config = {};
    
    if (script.dataset.config) {
      try {
        Object.assign(config, JSON.parse(script.dataset.config));
      } catch (e) {
        console.warn('Invalid WWS config JSON:', e);
      }
    }
    
    // Добавление отдельных атрибутов
    if (script.dataset.debug !== undefined) {
      config.debug = script.dataset.debug === 'true';
    }
    
    if (script.dataset.theme) {
      config.ui = config.ui || {};
      config.ui.theme = script.dataset.theme;
    }
    
    // Создание экземпляра
    if (script.dataset.autoInit !== 'false') {
      window.wwsProtect = new WWSProtect(config);
      
      // Глобальный вызов для удобства
      window.WWS = window.wwsProtect;
    }
  }
  
})(window, document);
