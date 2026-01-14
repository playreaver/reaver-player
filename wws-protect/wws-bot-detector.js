/**
 * Модуль детектирования ботов
 */

export default class WWSDotDetector {
  constructor(wws) {
    this.wws = wws;
    this.botPatterns = [
      /bot/i, /crawl/i, /spider/i, /scrape/i,
      /curl/i, /wget/i, /python/i, /java/i,
      /php/i, /go-http/i, /node/i,
      /headless/i, /phantom/i, /selenium/i,
      /puppeteer/i, /playwright/i
    ];
    
    this.suspiciousPatterns = [
      /Mozilla\/5\.0 \(compatible; .*\)/i,
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i, // UUID в UA
      /^\s*$/ // Пустой UA
    ];
  }
  
  async init(config) {
    this.config = config;
    console.log('✅ Bot Detector initialized');
  }
  
  /**
   * Расчет угрозы от ботов
   */
  async calculateThreatScore(context) {
    let score = 0;
    
    // Проверка User Agent
    const ua = navigator.userAgent;
    
    // 1. Проверка на известных ботов
    if (this.isKnownBot(ua)) {
      score += 60;
    }
    
    // 2. Проверка подозрительных UA
    if (this.isSuspiciousUA(ua)) {
      score += 40;
    }
    
    // 3. Проверка headless браузеров
    if (await this.isHeadlessBrowser()) {
      score += 80;
    }
    
    // 4. Проверка WebDriver
    if (this.hasWebDriver()) {
      score += 70;
    }
    
    // 5. Проверка плагинов (боты обычно имеют мало плагинов)
    if (this.hasFewPlugins()) {
      score += 20;
    }
    
    // 6. Проверка разрешения экрана
    if (this.hasUnusualResolution()) {
      score += 30;
    }
    
    return score;
  }
  
  /**
   * Проверка на известных ботов
   */
  isKnownBot(userAgent) {
    if (!userAgent) return true;
    
    for (const pattern of this.botPatterns) {
      if (pattern.test(userAgent)) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Проверка подозрительного User Agent
   */
  isSuspiciousUA(userAgent) {
    if (!userAgent || userAgent.length < 10) return true;
    
    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(userAgent)) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Проверка headless браузера
   */
  async isHeadlessBrowser() {
    const tests = [
      // Chrome headless detection
      () => navigator.webdriver === true,
      () => window.chrome === undefined,
      () => navigator.plugins.length === 0,
      
      // Проверка пермиссий
      () => {
        try {
          return Notification.permission === 'denied';
        } catch (e) {
          return false;
        }
      },
      
      // Проверка WebGL
      () => {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        return !gl;
      },
      
      // Проверка языков
      () => navigator.languages.length === 0
    ];
    
    let headlessScore = 0;
    for (const test of tests) {
      if (await Promise.resolve(test())) {
        headlessScore += 20;
      }
    }
    
    return headlessScore > 60;
  }
  
  /**
   * Проверка наличия WebDriver
   */
  hasWebDriver() {
    return navigator.webdriver === true;
  }
  
  /**
   * Проверка количества плагинов
   */
  hasFewPlugins() {
    return navigator.plugins.length < 2;
  }
  
  /**
   * Проверка необычного разрешения
   */
  hasUnusualResolution() {
    const unusualResolutions = [
      { width: 0, height: 0 },
      { width: 800, height: 600 },
      { width: 1024, height: 768 }
    ];
    
    const current = {
      width: window.screen.width,
      height: window.screen.height
    };
    
    return unusualResolutions.some(res => 
      res.width === current.width && res.height === current.height
    );
  }
  
  /**
   * Полная проверка клиента
   */
  async fullClientCheck() {
    const results = {
      userAgent: navigator.userAgent,
      isBot: false,
      botProbability: 0,
      reasons: []
    };
    
    // Собираем все проверки
    const checks = [
      { name: 'Known Bot', check: () => this.isKnownBot(results.userAgent), weight: 0.6 },
      { name: 'Suspicious UA', check: () => this.isSuspiciousUA(results.userAgent), weight: 0.4 },
      { name: 'Headless', check: () => this.isHeadlessBrowser(), weight: 0.8 },
      { name: 'WebDriver', check: () => this.hasWebDriver(), weight: 0.7 },
      { name: 'Few Plugins', check: () => this.hasFewPlugins(), weight: 0.2 },
      { name: 'Unusual Resolution', check: () => this.hasUnusualResolution(), weight: 0.3 }
    ];
    
    for (const check of checks) {
      const isPositive = await Promise.resolve(check.check());
      if (isPositive) {
        results.botProbability += check.weight;
        results.reasons.push(check.name);
      }
    }
    
    results.botProbability = Math.min(1, results.botProbability);
    results.isBot = results.botProbability > 0.7;
    
    return results;
  }
  
  destroy() {
    // Очистка ресурсов
  }
}
