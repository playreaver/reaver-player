/**
 * WWS Gateway v3.1 - Интеллектуальная система анализа рисков с обязательной проверкой
 * Показывает проверку 1 раз при первом посещении, затем только при подозрениях
 * @license MIT
 */

(function() {
  'use strict';
  
  console.log('🛡️ WWS Intelligence System v3.1 initializing...');
  
  // Конфигурация системы
  const CONFIG = {
    debug: true, // Включить логирование
    version: '3.1',
    
    // Пороги риска
    riskThresholds: {
      LOW: 0.3,      // 0-30% риска - пропуск с логированием
      MEDIUM: 0.6,   // 30-60% - простая проверка
      HIGH: 0.8      // 60-100% - полная проверка
    },
    
    // Веса факторов
    weights: {
      behavior: 0.35,
      technical: 0.35,
      reputation: 0.20,
      network: 0.10
    },
    
    // Время запоминания
    memory: {
      session: 30 * 60 * 1000,
      trustedDevice: 7 * 24 * 60 * 60 * 1000,
      suspiciousActivity: 2 * 60 * 60 * 1000
    },
    
    // Настройки виджета
    widget: {
      position: 'bottom-left', // bottom-left, bottom-right, top-left, top-right
      autoHide: false, // Автоматически скрывать виджет
      showDetails: true // Показывать детализированную информацию
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
      this.isFirstVisit = this.checkFirstVisit();
      this.widget = null;
      
      this.log('Система инициализирована');
      
      // Собираем данные
      this.collectAllData();
      
      // Создаем виджет ДО анализа
      this.createWidget();
      
      // Анализируем и принимаем решение
      this.analyzeRisk();
    }
    
    // === ПРОВЕРКА ПЕРВОГО ПОСЕЩЕНИЯ ===
    checkFirstVisit() {
      const firstVisit = localStorage.getItem('wws_first_visit');
      if (!firstVisit) {
        localStorage.setItem('wws_first_visit', Date.now().toString());
        return true;
      }
      return false;
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
    
    // === СОЗДАНИЕ ВИДЖЕТА ===
    createWidget() {
      // Удаляем старый виджет если есть
      const oldWidget = document.getElementById('wws-widget');
      if (oldWidget) oldWidget.remove();
      
      const widget = document.createElement('div');
      widget.id = 'wws-widget';
      widget.innerHTML = `
        <div class="wws-widget-icon">
          <div class="wws-icon-shield">🛡️</div>
          <div class="wws-risk-badge" id="wws-risk-badge">0%</div>
        </div>
        <div class="wws-widget-panel">
          <div class="wws-panel-header">
            <h3>🛡️ WWS Security</h3>
            <button class="wws-close-panel">×</button>
          </div>
          <div class="wws-panel-content">
            <div class="wws-status-section">
              <div class="wws-status-item">
                <span class="wws-label">Статус:</span>
                <span class="wws-value" id="wws-status-value">Анализ...</span>
              </div>
              <div class="wws-status-item">
                <span class="wws-label">Риск:</span>
                <span class="wws-value">
                  <span class="wws-risk-meter">
                    <span class="wws-risk-fill" id="wws-risk-fill"></span>
                  </span>
                  <span id="wws-risk-value">0%</span>
                </span>
              </div>
              <div class="wws-status-item">
                <span class="wws-label">Сессия:</span>
                <span class="wws-value" id="wws-session-id">${this.sessionId.substring(0, 8)}...</span>
              </div>
            </div>
            
            <div class="wws-behavior-section">
              <h4>📊 Поведение</h4>
              <div class="wws-stats-grid">
                <div class="wws-stat">
                  <span class="wws-stat-label">Клики</span>
                  <span class="wws-stat-value" id="wws-clicks">0</span>
                </div>
                <div class="wws-stat">
                  <span class="wws-stat-label">Движения</span>
                  <span class="wws-stat-value" id="wws-movements">0</span>
                </div>
                <div class="wws-stat">
                  <span class="wws-stat-label">Клавиши</span>
                  <span class="wws-stat-value" id="wws-keypress">0</span>
                </div>
                <div class="wws-stat">
                  <span class="wws-stat-label">Скролл</span>
                  <span class="wws-stat-value" id="wws-scroll">0</span>
                </div>
              </div>
            </div>
            
            <div class="wws-factors-section">
              <h4>⚠️ Факторы риска</h4>
              <div class="wws-factors-list" id="wws-factors-list">
                <div class="wws-no-factors">Не обнаружено</div>
              </div>
            </div>
            
            <div class="wws-actions-section">
              <button class="wws-action-btn" id="wws-refresh-btn">
                🔄 Обновить
              </button>
              <button class="wws-action-btn secondary" id="wws-details-btn">
                📊 Подробности
              </button>
            </div>
            
            <div class="wws-footer">
              <small>Сессия: ${this.sessionId.substring(0, 12)}</small>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(widget);
      
      // Добавляем стили
      this.addWidgetStyles();
      
      // Инициализируем обработчики
      this.initWidgetHandlers();
      
      this.widget = widget;
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
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .wws-widget-icon {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #6C63FF, #36D1DC);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(108, 99, 255, 0.3);
          transition: all 0.3s ease;
          position: relative;
          border: 2px solid rgba(255, 255, 255, 0.2);
        }
        
        .wws-widget-icon:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 25px rgba(108, 99, 255, 0.4);
        }
        
        .wws-icon-shield {
          font-size: 28px;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
        }
        
        .wws-risk-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #ef4444;
          color: white;
          font-size: 10px;
          font-weight: bold;
          padding: 2px 6px;
          border-radius: 10px;
          min-width: 20px;
          text-align: center;
          border: 2px solid #1a1a2e;
        }
        
        .wws-widget-panel {
          position: absolute;
          bottom: 70px;
          left: 0;
          width: 350px;
          background: rgba(18, 18, 26, 0.98);
          backdrop-filter: blur(10px);
          border-radius: 15px;
          border: 1px solid rgba(108, 99, 255, 0.3);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
          display: none;
          overflow: hidden;
          z-index: 999999;
        }
        
        .wws-widget-panel.show {
          display: block;
          animation: wws-panel-slide 0.3s ease;
        }
        
        @keyframes wws-panel-slide {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .wws-panel-header {
          padding: 15px 20px;
          background: rgba(108, 99, 255, 0.1);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .wws-panel-header h3 {
          margin: 0;
          color: white;
          font-size: 16px;
          font-weight: 600;
        }
        
        .wws-close-panel {
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 24px;
          cursor: pointer;
          line-height: 1;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
        }
        
        .wws-close-panel:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .wws-panel-content {
          padding: 20px;
          max-height: 60vh;
          overflow-y: auto;
        }
        
        .wws-status-section {
          margin-bottom: 20px;
        }
        
        .wws-status-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          padding: 8px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .wws-label {
          color: #94a3b8;
          font-size: 14px;
        }
        
        .wws-value {
          color: white;
          font-weight: 500;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .wws-risk-meter {
          width: 80px;
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          overflow: hidden;
        }
        
        .wws-risk-fill {
          height: 100%;
          background: #10b981;
          width: 0%;
          transition: width 0.5s ease;
          border-radius: 3px;
        }
        
        .wws-behavior-section {
          margin-bottom: 20px;
          padding: 15px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        
        .wws-behavior-section h4 {
          margin: 0 0 15px 0;
          color: white;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .wws-stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        
        .wws-stat {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 6px;
        }
        
        .wws-stat-label {
          color: #94a3b8;
          font-size: 12px;
        }
        
        .wws-stat-value {
          color: white;
          font-weight: bold;
          font-size: 14px;
        }
        
        .wws-factors-section {
          margin-bottom: 20px;
        }
        
        .wws-factors-section h4 {
          margin: 0 0 10px 0;
          color: white;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .wws-factors-list {
          max-height: 150px;
          overflow-y: auto;
        }
        
        .wws-factor-item {
          padding: 8px 12px;
          margin-bottom: 5px;
          background: rgba(239, 68, 68, 0.1);
          border-left: 3px solid #ef4444;
          border-radius: 4px;
          font-size: 12px;
          color: #fca5a5;
        }
        
        .wws-factor-item.low {
          background: rgba(245, 158, 11, 0.1);
          border-left-color: #f59e0b;
          color: #fbbf24;
        }
        
        .wws-no-factors {
          padding: 10px;
          text-align: center;
          color: #94a3b8;
          font-size: 12px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 6px;
        }
        
        .wws-actions-section {
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
        }
        
        .wws-action-btn {
          flex: 1;
          padding: 10px 15px;
          background: linear-gradient(135deg, #6C63FF, #36D1DC);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        
        .wws-action-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(108, 99, 255, 0.3);
        }
        
        .wws-action-btn.secondary {
          background: rgba(255, 255, 255, 0.1);
          color: #94a3b8;
        }
        
        .wws-action-btn.secondary:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        
        .wws-footer {
          text-align: center;
          color: #64748b;
          font-size: 11px;
          padding-top: 15px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        /* Адаптивность */
        @media (max-width: 768px) {
          .wws-widget-panel {
            width: 300px;
            left: 10px;
            bottom: 80px;
          }
          
          #wws-widget {
            bottom: 10px;
            left: 10px;
          }
        }
        
        @media (max-width: 480px) {
          .wws-widget-panel {
            width: calc(100vw - 40px);
            left: 10px;
            right: 10px;
          }
        }
      `;
      
      document.head.appendChild(style);
    }
    
    initWidgetHandlers() {
      const icon = this.widget.querySelector('.wws-widget-icon');
      const panel = this.widget.querySelector('.wws-widget-panel');
      const closeBtn = this.widget.querySelector('.wws-close-panel');
      const refreshBtn = this.widget.querySelector('#wws-refresh-btn');
      const detailsBtn = this.widget.querySelector('#wws-details-btn');
      
      // Открытие/закрытие панели
      icon.addEventListener('click', (e) => {
        e.stopPropagation();
        panel.classList.toggle('show');
      });
      
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        panel.classList.remove('show');
      });
      
      // Закрытие при клике вне виджета
      document.addEventListener('click', (e) => {
        if (!this.widget.contains(e.target)) {
          panel.classList.remove('show');
        }
      });
      
      // Обновление данных
      refreshBtn.addEventListener('click', () => {
        this.collectAllData();
        this.analyzeRisk();
        this.updateWidget();
        panel.classList.remove('show');
      });
      
      // Подробности
      detailsBtn.addEventListener('click', () => {
        this.showDetailedReport();
        panel.classList.remove('show');
      });
    }
    
    updateWidget() {
      if (!this.widget) return;
      
      // Обновляем значения
      const riskValue = Math.round(this.riskScore * 100);
      const riskBadge = this.widget.querySelector('#wws-risk-badge');
      const riskFill = this.widget.querySelector('#wws-risk-fill');
      const riskValueEl = this.widget.querySelector('#wws-risk-value');
      const statusValue = this.widget.querySelector('#wws-status-value');
      const clicksEl = this.widget.querySelector('#wws-clicks');
      const movementsEl = this.widget.querySelector('#wws-movements');
      const keypressEl = this.widget.querySelector('#wws-keypress');
      const scrollEl = this.widget.querySelector('#wws-scroll');
      const factorsList = this.widget.querySelector('#wws-factors-list');
      
      // Цвет риска
      let riskColor = '#10b981'; // зеленый
      if (this.riskScore > 0.6) riskColor = '#ef4444'; // красный
      else if (this.riskScore > 0.3) riskColor = '#f59e0b'; // желтый
      
      riskBadge.textContent = `${riskValue}%`;
      riskBadge.style.background = riskColor;
      riskFill.style.background = riskColor;
      riskFill.style.width = `${riskValue}%`;
      riskValueEl.textContent = `${riskValue}%`;
      
      // Статус
      const statusMap = {
        'pending': '⏳ Анализ...',
        'allow': '✅ Разрешено',
        'allow_with_logging': '📝 Логирование',
        'simple_captcha': '⚠️ Проверка',
        'full_captcha': '🚨 Полная проверка'
      };
      statusValue.textContent = statusMap[this.verdict] || this.verdict;
      
      // Поведение
      clicksEl.textContent = this.behaviorData.clicks || 0;
      movementsEl.textContent = this.behaviorData.mouseMovements || 0;
      keypressEl.textContent = this.behaviorData.keyPresses || 0;
      scrollEl.textContent = this.behaviorData.scrollEvents || 0;
      
      // Факторы риска
      if (this.riskFactors.length > 0) {
        const factorsHTML = this.riskFactors.slice(0, 3).map(factor => `
          <div class="wws-factor-item ${factor.level}">
            ${factor.message}
          </div>
        `).join('');
        
        factorsList.innerHTML = factorsHTML;
      } else {
        factorsList.innerHTML = '<div class="wws-no-factors">Не обнаружено</div>';
      }
    }
    
    showDetailedReport() {
      const overlay = this.createOverlay();
      
      overlay.innerHTML = `
        <div style="
          max-width: 800px;
          width: 95%;
          max-height: 90vh;
          overflow-y: auto;
          background: rgba(18, 18, 26, 0.98);
          border-radius: 20px;
          border: 1px solid rgba(108, 99, 255, 0.3);
          padding: 30px;
          color: white;
        ">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
            <h2 style="margin: 0; color: #6C63FF;">📊 Детальный отчет WWS</h2>
            <button id="wws-close-report" style="
              background: none;
              border: none;
              color: #94a3b8;
              font-size: 24px;
              cursor: pointer;
            ">×</button>
          </div>
          
          <div style="
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
          ">
            <div style="background: rgba(108, 99, 255, 0.1); padding: 20px; border-radius: 10px;">
              <h3 style="margin-top: 0; color: #6C63FF;">👤 Пользователь</h3>
              <p><strong>ID:</strong> ${this.userId}</p>
              <p><strong>Сессия:</strong> ${this.sessionId}</p>
              <p><strong>Устройство:</strong> ${this.generateDeviceFingerprint()}</p>
            </div>
            
            <div style="background: rgba(16, 185, 129, 0.1); padding: 20px; border-radius: 10px;">
              <h3 style="margin-top: 0; color: #10b981;">📈 Статистика риска</h3>
              <p><strong>Общий риск:</strong> ${(this.riskScore * 100).toFixed(1)}%</p>
              <p><strong>Вердикт:</strong> ${this.verdict}</p>
              <p><strong>Факторов:</strong> ${this.riskFactors.length}</p>
            </div>
          </div>
          
          <div style="margin-bottom: 30px;">
            <h3 style="color: #f59e0b;">⚠️ Детали факторов риска</h3>
            ${this.riskFactors.length > 0 ? this.riskFactors.map(factor => `
              <div style="
                background: rgba(239, 68, 68, 0.1);
                padding: 15px;
                margin-bottom: 10px;
                border-left: 4px solid ${factor.level === 'high' ? '#ef4444' : factor.level === 'medium' ? '#f59e0b' : '#10b981'};
                border-radius: 5px;
              ">
                <div style="display: flex; justify-content: space-between;">
                  <strong>${factor.message}</strong>
                  <span style="
                    background: ${factor.level === 'high' ? '#ef4444' : factor.level === 'medium' ? '#f59e0b' : '#10b981'};
                    color: white;
                    padding: 2px 8px;
                    border-radius: 10px;
                    font-size: 12px;
                  ">${factor.level}</span>
                </div>
                <div style="font-size: 12px; color: #94a3b8; margin-top: 5px;">
                  Тип: ${factor.type} | ${new Date().toLocaleTimeString()}
                </div>
              </div>
            `).join('') : '<p style="text-align: center; color: #94a3b8;">Факторы риска не обнаружены</p>'}
          </div>
          
          <div style="margin-bottom: 30px;">
            <h3 style="color: #36D1DC;">📊 Поведенческие данные</h3>
            <div style="
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
              gap: 10px;
            ">
              <div style="text-align: center; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 10px;">
                <div style="font-size: 24px; margin-bottom: 5px;">🖱️</div>
                <div style="font-size: 12px; color: #94a3b8;">Клики</div>
                <div style="font-size: 24px; font-weight: bold;">${this.behaviorData.clicks || 0}</div>
              </div>
              <div style="text-align: center; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 10px;">
                <div style="font-size: 24px; margin-bottom: 5px;">🎮</div>
                <div style="font-size: 12px; color: #94a3b8;">Движения</div>
                <div style="font-size: 24px; font-weight: bold;">${this.behaviorData.mouseMovements || 0}</div>
              </div>
              <div style="text-align: center; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 10px;">
                <div style="font-size: 24px; margin-bottom: 5px;">⌨️</div>
                <div style="font-size: 12px; color: #94a3b8;">Клавиши</div>
                <div style="font-size: 24px; font-weight: bold;">${this.behaviorData.keyPresses || 0}</div>
              </div>
              <div style="text-align: center; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 10px;">
                <div style="font-size: 24px; margin-bottom: 5px;">📜</div>
                <div style="font-size: 12px; color: #94a3b8;">Скролл</div>
                <div style="font-size: 24px; font-weight: bold;">${this.behaviorData.scrollEvents || 0}</div>
              </div>
            </div>
          </div>
          
          <button onclick="this.removeOverlay()" style="
            width: 100%;
            padding: 15px;
            background: linear-gradient(135deg, #6C63FF, #36D1DC);
            color: white;
            border: none;
            border-radius: 10px;
            font-weight: bold;
            cursor: pointer;
            font-size: 16px;
          ">
            Закрыть отчет
          </button>
        </div>
      `;
      
      overlay.querySelector('#wws-close-report').addEventListener('click', () => {
        this.removeOverlay();
      });
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
        pageLoadTime: Date.now(),
        mouseMovements: 0,
        clicks: 0,
        keyPresses: 0,
        scrollEvents: 0,
        referrer: document.referrer,
        directAccess: !document.referrer,
        interactionSpeed: null
      };
      
      // Отслеживание поведения
      let mouseMoveCount = 0;
      let mouseMoveTimer = null;
      
      const updateWidgetStats = () => {
        this.updateWidget();
      };
      
      document.addEventListener('mousemove', () => {
        mouseMoveCount++;
        this.behaviorData.mouseMovements++;
        
        if (!mouseMoveTimer) {
          mouseMoveTimer = setTimeout(() => {
            this.behaviorData.mouseSpeed = mouseMoveCount / 0.5;
            mouseMoveCount = 0;
            mouseMoveTimer = null;
            updateWidgetStats();
          }, 500);
        } else {
          updateWidgetStats();
        }
      });
      
      document.addEventListener('click', (e) => {
        this.behaviorData.clicks++;
        updateWidgetStats();
      });
      
      document.addEventListener('keydown', (e) => {
        if (!['Shift', 'Control', 'Alt', 'Meta', 'Tab', 'Escape'].includes(e.key)) {
          this.behaviorData.keyPresses++;
          updateWidgetStats();
        }
      });
      
      let lastScroll = 0;
      document.addEventListener('scroll', () => {
        const now = Date.now();
        if (now - lastScroll > 100) {
          this.behaviorData.scrollEvents++;
          lastScroll = now;
          updateWidgetStats();
        }
      });
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
        plugins: navigator.plugins.length,
        webgl: this.detectWebGL(),
        canvasFingerprint: this.getCanvasFingerprint()
      };
      
      this.checkHeadlessIndicators();
    }
    
    collectNetworkData() {
      this.networkData = {
        connection: navigator.connection ? {
          effectiveType: navigator.connection.effectiveType,
          rtt: navigator.connection.rtt,
          downlink: navigator.connection.downlink,
          saveData: navigator.connection.saveData
        } : null,
        headers: {},
        ipInfo: null,
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
      
      // ОБЯЗАТЕЛЬНАЯ ПРОВЕРКА ПРИ ПЕРВОМ ПОСЕЩЕНИИ
      if (this.isFirstVisit) {
        // Для первого посещения добавляем небольшой риск, чтобы гарантировать проверку
        totalRisk = Math.max(totalRisk, 0.4); // Минимум 40% риска при первом посещении
        this.riskFactors.push({
          type: 'system',
          level: 'medium',
          message: 'Первое посещение сайта - требуется базовая проверка',
          details: { firstVisit: true }
        });
      }
      
      this.riskScore = Math.min(1, totalRisk);
      
      // Определяем вердикт
      this.determineVerdict();
      
      // Сохраняем результаты
      this.saveAnalysisResults();
      
      // Обновляем виджет
      this.updateWidget();
      
      // Выполняем действие
      this.executeVerdict();
    }
    
    analyzeBehavior() {
      let score = 0;
      const factors = [];
      const timeSinceLoad = Date.now() - this.behaviorData.pageLoadTime;
      
      // 1. Слишком быстрое взаимодействие
      if (timeSinceLoad < 1000 && this.behaviorData.clicks > 2) {
        score += 0.4;
        factors.push({
          type: 'behavior',
          level: 'high',
          message: 'Слишком быстрое взаимодействие после загрузки',
          details: { time: timeSinceLoad, clicks: this.behaviorData.clicks }
        });
      }
      
      // 2. Отсутствие взаимодействия
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
      if (this.behaviorData.mouseSpeed > 30) {
        score += 0.2;
        factors.push({
          type: 'behavior',
          level: 'medium',
          message: 'Неестественная скорость движений мыши',
          details: { speed: this.behaviorData.mouseSpeed }
        });
      }
      
      // 4. Прямой доступ
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
      if (clicksPerSecond > 5) {
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
      
      // 1. Известные боты
      const botPatterns = [
        /bot/i, /crawl/i, /spider/i, /scrape/i,
        /headless/i, /phantom/i, /selenium/i,
        /puppeteer/i, /playwright/i, /cheerio/i
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
      
      // 2. WebDriver обнаружение
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
      
      // 3. Частота посещений
      if (this.userHistory.sessions && this.userHistory.sessions.length > 10) {
        const recentSessions = this.userHistory.sessions.slice(-10);
        const timeSpan = recentSessions[recentSessions.length - 1].timestamp - 
                        recentSessions[0].timestamp;
        
        if (timeSpan < 5 * 60 * 1000) {
          score += 0.3;
          factors.push({
            type: 'reputation',
            level: 'high',
            message: 'Слишком частые посещения',
            details: { sessions: 10, timeSpan: timeSpan / 1000 + 's' }
          });
        }
      }
      
      // 4. Доверенное устройство (снижает риск)
      if (this.userHistory.trusted) {
        score -= 0.3;
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
      
      // 1. Медленное соединение
      if (this.networkData.connection && this.networkData.connection.rtt > 500) {
        score += 0.2;
        factors.push({
          type: 'network',
          level: 'medium',
          message: 'Высокая задержка сети',
          details: { rtt: this.networkData.connection.rtt + 'ms' }
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
    
    checkHeadlessIndicators() {
      try {
        if (Notification.permission === 'denied') {
          this.technicalData.notificationsDenied = true;
        }
      } catch (e) {}
      
      this.technicalData.hasChrome = typeof window.chrome !== 'undefined';
      this.technicalData.hasChromeRuntime = typeof chrome !== 'undefined' && 
                                           typeof chrome.runtime !== 'undefined';
    }
    
    // === ОПРЕДЕЛЕНИЕ ВЕРДИКТА ===
    determineVerdict() {
      let verdict = 'allow';
      
      // ОБЯЗАТЕЛЬНАЯ ПРОВЕРКА ПРИ ПЕРВОМ ПОСЕЩЕНИИ
      if (this.isFirstVisit) {
        if (this.riskScore >= CONFIG.riskThresholds.HIGH) {
          verdict = 'full_captcha';
          this.log(`ПЕРВОЕ ПОСЕЩЕНИЕ: ПОЛНАЯ ПРОВЕРКА (риск: ${(this.riskScore * 100).toFixed(1)}%)`);
        } else if (this.riskScore >= CONFIG.riskThresholds.LOW) {
          verdict = 'simple_captcha';
          this.log(`ПЕРВОЕ ПОСЕЩЕНИЕ: ПРОСТАЯ ПРОВЕРКА (риск: ${(this.riskScore * 100).toFixed(1)}%)`);
        } else {
          verdict = 'allow_with_logging';
          this.log(`ПЕРВОЕ ПОСЕЩЕНИЕ: АВТОМАТИЧЕСКАЯ ПРОВЕРКА (риск: ${(this.riskScore * 100).toFixed(1)}%)`);
        }
      } 
      // ПОВТОРНЫЕ ПОСЕЩЕНИЯ
      else if (this.riskScore >= CONFIG.riskThresholds.HIGH) {
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
      // Обновляем виджет перед показом проверки
      this.updateWidget();
      
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
      this.log('Показываем полную капчу');
      this.saveOriginalContent();
      this.createFullCaptchaUI();
    }
    
    showSimpleCaptcha() {
      this.log('Показываем простую капчу');
      this.saveOriginalContent();
      this.createSimpleCaptchaUI();
    }
    
    logAccess() {
      this.log('Логируем доступ');
      this.sendAnalytics();
    }
    
    allowAccess() {
      this.log('Пропускаем пользователя');
      
      this.saveSession();
      
      if (this.riskScore < 0.2) {
        this.markAsTrusted();
      }
      
      this.emitAccessGranted();
      this.updateWidget();
    }
    
    // === UI КАПЧИ ===
    createSimpleCaptchaUI() {
      const overlay = this.createOverlay();
      
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
            <h3 style="color: white; margin: 0 0 10px;">Проверка безопасности</h3>
            <p style="color: #94a3b8; font-size: 14px; margin: 0;">
              ${this.isFirstVisit ? 'Первое посещение сайта' : 'Обновление сессии'}
            </p>
          </div>
          
          <div style="
            background: rgba(255, 255, 255, 0.05);
            border-radius: 15px;
            padding: 25px;
            margin-bottom: 20px;
            border: 1px solid rgba(255, 255, 255, 0.1);
          ">
            <div style="color: #94a3b8; margin-bottom: 10px; font-size: 14px;">
              Решите простой пример:
            </div>
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
                   placeholder="Введите ответ"
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
                   "
                   autocomplete="off">
          </div>
          
          <div style="
            color: #64748b;
            font-size: 12px;
            margin-bottom: 15px;
            padding: 10px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
          ">
            Уровень риска: <strong>${(this.riskScore * 100).toFixed(0)}%</strong>
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
                    transition: all 0.3s;
                  "
                  onmouseover="this.style.transform='translateY(-2px)';"
                  onmouseout="this.style.transform='translateY(0)';">
            Проверить
          </button>
          
          <div style="
            color: #64748b;
            font-size: 11px;
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
          ">
            WWS Security • Сессия: ${this.sessionId.substring(0, 8)}
          </div>
        </div>
      `;
      
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
          answerInput.placeholder = 'Неверно, попробуйте еще';
          answerInput.style.borderColor = '#ef4444';
        }
      };
      
      submitBtn.addEventListener('click', checkAnswer);
      answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkAnswer();
      });
    }
    
    createFullCaptchaUI() {
      const overlay = this.createOverlay();
      
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
              Повышенная проверка
            </h3>
            <p style="color: #94a3b8; line-height: 1.5; font-size: 15px;">
              Обнаружены подозрительные факторы. Требуется дополнительная проверка.
            </p>
          </div>
          
          <div style="
            background: rgba(255, 255, 255, 0.05);
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 25px;
            border: 1px solid rgba(255, 255, 255, 0.15);
          ">
            <div style="color: #94a3b8; margin-bottom: 15px; font-size: 14px;">
              Выберите правильное продолжение:
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
              <span>Факторов риска:</span>
              <strong>${this.riskFactors.filter(f => f.level === 'high' || f.level === 'critical').length}</strong>
            </div>
            <div style="font-size: 12px; color: #fca5a5;">
              ${this.riskFactors.slice(0, 2).map(f => `• ${f.message}`).join('<br>')}
            </div>
          </div>
          
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
              Проверить
            </button>
          </div>
          
          <div id="captcha-timer" style="
            color: #fbbf24;
            margin-top: 20px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
          "></div>
          
          <div style="
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            padding-top: 20px;
            margin-top: 25px;
            color: #64748b;
            font-size: 12px;
          ">
            <div>WWS Security • Сессия: ${this.sessionId.substring(0, 8)}</div>
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
      
      // Таймер
      let timeLeft = 60;
      const timerElement = overlay.querySelector('#captcha-timer');
      
      const updateTimer = () => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerElement.textContent = `Осталось: ${minutes}:${seconds.toString().padStart(2, '0')}`;
        
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
        
        if (selectedOption === '10') {
          this.log('Полная капча пройдена');
          this.removeOverlay();
          this.allowAccess();
        } else {
          this.log('Полная капча не пройдена');
        }
      });
    }
    
    // === УТИЛИТЫ ===
    createOverlay() {
      const oldOverlay = document.getElementById('wws-security-overlay');
      if (oldOverlay) oldOverlay.remove();
      
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
      document.body.style.overflow = 'hidden';
      
      return overlay;
    }
    
    removeOverlay() {
      const overlay = document.getElementById('wws-security-overlay');
      if (overlay) overlay.remove();
      document.body.style.overflow = '';
    }
    
    saveOriginalContent() {
      if (!window._wwsOriginalContent) {
        window._wwsOriginalContent = {
          bodyHTML: document.body.innerHTML,
          title: document.title,
          bodyStyle: document.body.getAttribute('style')
        };
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
      
      if (!this.userHistory.sessions) this.userHistory.sessions = [];
      this.userHistory.sessions.push(session);
      
      if (this.userHistory.sessions.length > 50) {
        this.userHistory.sessions = this.userHistory.sessions.slice(-50);
      }
      
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
    
    sendAnalytics() {
      const analytics = {
        userId: this.userId,
        sessionId: this.sessionId,
        riskScore: this.riskScore,
        verdict: this.verdict,
        factors: this.riskFactors.filter(f => f.level === 'high' || f.level === 'critical'),
        timestamp: Date.now()
      };
      
      if (typeof gtag !== 'undefined') {
        gtag('event', 'wws_security_scan', {
          risk_score: this.riskScore,
          verdict: this.verdict,
          factors_count: analytics.factors.length
        });
      }
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
          userAgent: this.technicalData.userAgent,
          platform: this.technicalData.platform,
          screen: `${this.technicalData.screenWidth}x${this.technicalData.screenHeight}`,
          language: this.technicalData.language
        }
      };
      
      if (CONFIG.debug) {
        console.log('🛡️ WWS Analysis:', analysis);
      }
      
      try {
        const analyses = JSON.parse(localStorage.getItem('wws_analyses') || '[]');
        analyses.push(analysis);
        localStorage.setItem('wws_analyses', JSON.stringify(analyses.slice(-20)));
      } catch (e) {}
    }
    
    handleTimeout() {
      this.log('Время проверки истекло');
      
      const overlay = document.getElementById('wws-security-overlay');
      if (overlay) {
        overlay.innerHTML = `
          <div style="text-align: center; color: white; max-width: 400px;">
            <div style="font-size: 48px; margin-bottom: 20px;">⏰</div>
            <h3 style="margin-bottom: 10px;">Время истекло</h3>
            <p style="color: #94a3b8; margin-bottom: 30px;">
              Обновите страницу и попробуйте снова.
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
              Обновить
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
            console.log('🛡️ Доверенное устройство, проверка не требуется');
            sessionStorage.setItem('wws_session_passed', 'true');
            // Но все равно создаем виджет для отображения информации
            const analyzer = new WWSRiskAnalyzer();
            analyzer.verdict = 'allow';
            analyzer.updateWidget();
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
        console.log('🛡️ Недавно была подозрительная активность');
      }
    }
    
    // Запускаем анализатор (ОБЯЗАТЕЛЬНО при первом запуске)
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
    
    showWidget: () => {
      const widget = document.getElementById('wws-widget');
      if (widget) {
        const panel = widget.querySelector('.wws-widget-panel');
        panel.classList.add('show');
      }
    },
    
    hideWidget: () => {
      const widget = document.getElementById('wws-widget');
      if (widget) {
        const panel = widget.querySelector('.wws-widget-panel');
        panel.classList.remove('show');
      }
    },
    
    // События
    onAccessGranted: (callback) => {
      window.addEventListener('wws:access-granted', callback);
    }
  };
  
})();
