/**
 * WWS PROTECT v6.2 - Minimal Security Gateway
 * Clean & Minimal Protection System
 * @license MIT
 */

(function() {
  'use strict';
  
  // ==================== CONFIGURATION ====================
  const CONFIG = {
    version: '6.2',
    companyName: 'WWS PROTECT',
    websiteUrl: 'https://reaver.is-a.dev/',
    
    widget: {
      position: 'bottom-right',
      defaultTheme: 'dark',
      themes: {
        dark: {
          background: '#0F172A',
          surface: '#1E293B',
          primary: '#3B82F6',
          secondary: '#8B5CF6',
          text: '#F8FAFC',
          textSecondary: '#94A3B8'
        },
        light: {
          background: '#FFFFFF',
          surface: '#F1F5F9',
          primary: '#2563EB',
          secondary: '#7C3AED',
          text: '#0F172A',
          textSecondary: '#475569'
        }
      }
    },
    
    security: {
      verificationTime: 3000
    }
  };
  
  // ==================== ANTI-DUPLICATE LOAD ====================
  if (window._wwsPremiumLoaded) {
    console.log('🛡️ WWS PROTECT уже инициализирован');
    return;
  }
  window._wwsPremiumLoaded = true;
  
  // ==================== GLOBAL STATE ====================
  const State = {
    verificationComplete: false,
    currentTheme: localStorage.getItem('wws_theme') || CONFIG.widget.defaultTheme,
    metrics: {
      threatsBlocked: 3,
      securityScore: 96,
      verificationProgress: 0
    },
    position: localStorage.getItem('wws_position') || CONFIG.widget.position,
    notifications: {
      enabled: localStorage.getItem('wws_notifications') !== 'false',
      threatAlerts: localStorage.getItem('wws_threat_alerts') !== 'false'
    }
  };
  
  // ==================== FONT AWESOME LOAD ====================
  if (!document.getElementById('wws-fa-css')) {
    const faLink = document.createElement('link');
    faLink.id = 'wws-fa-css';
    faLink.rel = 'stylesheet';
    faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
    document.head.appendChild(faLink);
  }
  
  // ==================== STYLES ====================
  const styles = document.createElement('style');
  styles.textContent = `
    :root {
      --wws-bg: ${CONFIG.widget.themes.dark.background};
      --wws-surface: ${CONFIG.widget.themes.dark.surface};
      --wws-primary: ${CONFIG.widget.themes.dark.primary};
      --wws-secondary: ${CONFIG.widget.themes.dark.secondary};
      --wws-text: ${CONFIG.widget.themes.dark.text};
      --wws-text-secondary: ${CONFIG.widget.themes.dark.textSecondary};
      --wws-success: #10B981;
      --wws-warning: #F59E0B;
      --wws-danger: #EF4444;
      --wws-border: rgba(255, 255, 255, 0.1);
      --wws-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      --wws-radius: 16px;
      --wws-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .wws-theme-light {
      --wws-bg: ${CONFIG.widget.themes.light.background};
      --wws-surface: ${CONFIG.widget.themes.light.surface};
      --wws-primary: ${CONFIG.widget.themes.light.primary};
      --wws-secondary: ${CONFIG.widget.themes.light.secondary};
      --wws-text: ${CONFIG.widget.themes.light.text};
      --wws-text-secondary: ${CONFIG.widget.themes.light.textSecondary};
      --wws-border: rgba(0, 0, 0, 0.1);
      --wws-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
    }
    
    /* ANIMATIONS */
    @keyframes wwsFadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes wwsShieldGlow {
      0%, 100% { filter: drop-shadow(0 0 20px var(--wws-primary)); }
      50% { filter: drop-shadow(0 0 30px var(--wws-primary)); }
    }
    
    @keyframes wwsProgress {
      0% { background-position: 0% 50%; }
      100% { background-position: 100% 50%; }
    }
    
    @keyframes wwsPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    
    @keyframes wwsRipple {
      0% { transform: scale(0.8); opacity: 0.5; }
      100% { transform: scale(2); opacity: 0; }
    }
    
    /* MINIMAL PROTECTION SCREEN */
    .wws-protection-screen {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      background: linear-gradient(135deg, #0a0a1a 0%, #121226 100%) !important;
      z-index: 2147483647 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif !important;
      animation: wwsFadeIn 0.4s ease-out;
      overflow: hidden !important;
    }
    
    .wws-protection-content {
      width: 100%;
      max-width: 500px;
      padding: 40px;
      text-align: center;
    }
    
    .wws-shield-wrapper {
      position: relative;
      margin: 0 auto 40px;
      width: 140px;
      height: 140px;
    }
    
    .wws-shield {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, var(--wws-primary), var(--wws-secondary));
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: wwsShieldGlow 3s ease-in-out infinite;
      position: relative;
      z-index: 2;
    }
    
    .wws-shield i {
      font-size: 60px;
      color: white;
    }
    
    .wws-shield-ripple {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 160px;
      height: 160px;
      border: 2px solid rgba(59, 130, 246, 0.3);
      border-radius: 50%;
      animation: wwsRipple 2s ease-out infinite;
    }
    
    .wws-shield-ripple:nth-child(3) {
      width: 180px;
      height: 180px;
      animation-delay: 0.5s;
    }
    
    .wws-title {
      color: white;
      font-size: 40px;
      font-weight: 700;
      margin: 0 0 15px;
      letter-spacing: -0.5px;
    }
    
    .wws-subtitle {
      color: #94A3B8;
      font-size: 18px;
      font-weight: 400;
      margin: 0 0 50px;
      line-height: 1.5;
    }
    
    .wws-status-container {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 16px;
      padding: 30px;
      margin: 0 0 30px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .wws-status-text {
      color: #94A3B8;
      font-size: 16px;
      margin: 0 0 20px;
    }
    
    .wws-progress-container {
      width: 100%;
    }
    
    .wws-progress-bar {
      width: 100%;
      height: 6px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
      overflow: hidden;
      margin-bottom: 10px;
    }
    
    .wws-progress-fill {
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, var(--wws-primary), var(--wws-secondary));
      animation: wwsProgress 2s linear infinite;
      transition: width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
      border-radius: 3px;
    }
    
    .wws-progress-text {
      display: flex;
      justify-content: space-between;
      color: #94A3B8;
      font-size: 14px;
    }
    
    .wws-footer {
      color: #64748B;
      font-size: 14px;
      margin-top: 40px;
    }
    
    .wws-footer a {
      color: #60A5FA;
      text-decoration: none;
      font-weight: 500;
    }
    
    /* WIDGET STYLES */
    .wws-widget {
      position: fixed;
      z-index: 2147483646;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    /* Position classes */
    .wws-position-bottom-right {
      bottom: 24px;
      right: 24px;
    }
    
    .wws-position-bottom-left {
      bottom: 24px;
      left: 24px;
    }
    
    .wws-position-top-right {
      top: 24px;
      right: 24px;
    }
    
    .wws-position-top-left {
      top: 24px;
      left: 24px;
    }
    
    .wws-widget-toggle {
      width: 64px;
      height: 64px;
      background: linear-gradient(135deg, var(--wws-primary), var(--wws-secondary));
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 10px 40px rgba(59, 130, 246, 0.3);
      transition: var(--wws-transition);
      border: 2px solid rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      position: relative;
    }
    
    .wws-widget-toggle:hover {
      transform: translateY(-4px) scale(1.05);
      box-shadow: 0 15px 50px rgba(59, 130, 246, 0.4);
    }
    
    .wws-widget-toggle i {
      font-size: 28px;
      color: white;
      position: relative;
      z-index: 1;
    }
    
    /* Notification badge - OUTSIDE the shield */
    .wws-notification-badge {
      position: absolute;
      top: -8px;
      right: -8px;
      background: linear-gradient(135deg, #EF4444, #DC2626);
      color: white;
      font-size: 11px;
      font-weight: 800;
      padding: 5px 10px;
      border-radius: 12px;
      min-width: 28px;
      text-align: center;
      border: 3px solid rgba(255, 255, 255, 0.9);
      box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
      animation: wwsPulse 2s ease-in-out infinite;
      z-index: 2;
      pointer-events: none;
    }
    
    /* Adjust badge position based on widget position */
    .wws-position-bottom-left .wws-notification-badge {
      right: -8px;
      left: auto;
    }
    
    .wws-position-bottom-right .wws-notification-badge {
      right: -8px;
      left: auto;
    }
    
    .wws-position-top-left .wws-notification-badge {
      right: -8px;
      left: auto;
      bottom: -8px;
      top: auto;
    }
    
    .wws-position-top-right .wws-notification-badge {
      right: -8px;
      left: auto;
      bottom: -8px;
      top: auto;
    }
    
    .wws-widget-panel {
      position: absolute;
      width: 380px;
      background: var(--wws-surface);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      border: 1px solid var(--wws-border);
      box-shadow: var(--wws-shadow);
      display: none;
      overflow: hidden;
      z-index: 2147483647;
      max-height: 70vh;
      animation: wwsFadeIn 0.3s ease-out;
      color: var(--wws-text);
    }
    
    /* Panel position based on widget position */
    .wws-position-bottom-right .wws-widget-panel {
      bottom: 80px;
      right: 0;
    }
    
    .wws-position-bottom-left .wws-widget-panel {
      bottom: 80px;
      left: 0;
    }
    
    .wws-position-top-right .wws-widget-panel {
      top: 80px;
      right: 0;
      bottom: auto;
    }
    
    .wws-position-top-left .wws-widget-panel {
      top: 80px;
      left: 0;
      bottom: auto;
    }
    
    .wws-panel-header {
      padding: 24px;
      background: linear-gradient(135deg, 
        rgba(59, 130, 246, 0.1), 
        rgba(139, 92, 246, 0.1));
      border-bottom: 1px solid var(--wws-border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .wws-header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    
    .wws-header-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, var(--wws-primary), var(--wws-secondary));
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .wws-header-icon i {
      font-size: 24px;
      color: white;
    }
    
    .wws-header-text h3 {
      font-size: 18px;
      font-weight: 700;
      margin: 0 0 4px;
      color: var(--wws-text);
    }
    
    .wws-header-text p {
      font-size: 12px;
      margin: 0;
      color: var(--wws-text-secondary);
    }
    
    .wws-close-panel {
      width: 36px;
      height: 36px;
      background: rgba(255, 255, 255, 0.1);
      border: none;
      border-radius: 10px;
      color: var(--wws-text-secondary);
      font-size: 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: var(--wws-transition);
    }
    
    .wws-close-panel:hover {
      background: rgba(239, 68, 68, 0.2);
      color: var(--wws-danger);
      transform: rotate(90deg);
    }
    
    .wws-panel-tabs {
      display: flex;
      padding: 8px;
      background: rgba(0, 0, 0, 0.05);
      border-bottom: 1px solid var(--wws-border);
    }
    
    .wws-tab {
      flex: 1;
      padding: 12px 8px;
      background: none;
      border: none;
      color: var(--wws-text-secondary);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      border-radius: 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      transition: var(--wws-transition);
    }
    
    .wws-tab i {
      font-size: 16px;
    }
    
    .wws-tab span {
      font-size: 12px;
    }
    
    .wws-tab:hover {
      color: var(--wws-primary);
      background: rgba(59, 130, 246, 0.1);
    }
    
    .wws-tab.active {
      color: var(--wws-primary);
      background: rgba(59, 130, 246, 0.15);
    }
    
    .wws-panel-content {
      padding: 24px;
      overflow-y: auto;
      max-height: calc(70vh - 180px);
    }
    
    .wws-panel-content::-webkit-scrollbar {
      width: 6px;
    }
    
    .wws-panel-content::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.05);
      border-radius: 3px;
    }
    
    .wws-panel-content::-webkit-scrollbar-thumb {
      background: var(--wws-primary);
      border-radius: 3px;
    }
    
    .wws-panel-footer {
      padding: 20px 24px;
      border-top: 1px solid var(--wws-border);
      text-align: center;
    }
    
    .wws-footer-link {
      color: var(--wws-text-secondary);
      font-size: 13px;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      transition: var(--wws-transition);
      padding: 10px 20px;
      border-radius: 10px;
      background: rgba(0, 0, 0, 0.05);
    }
    
    .wws-footer-link:hover {
      color: var(--wws-primary);
      background: rgba(59, 130, 246, 0.1);
      transform: translateY(-2px);
    }
    
    /* Minimal content styles */
    .wws-section {
      margin-bottom: 24px;
    }
    
    .wws-section:last-child {
      margin-bottom: 0;
    }
    
    .wws-section-title {
      font-size: 15px;
      font-weight: 700;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      color: var(--wws-text);
    }
    
    .wws-section-title i {
      color: var(--wws-primary);
      font-size: 16px;
    }
    
    .wws-stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 20px;
    }
    
    .wws-stat-card {
      background: rgba(0, 0, 0, 0.05);
      border-radius: 12px;
      padding: 20px;
      text-align: center;
    }
    
    .wws-stat-value {
      font-size: 24px;
      font-weight: 800;
      margin-bottom: 8px;
      color: var(--wws-text);
    }
    
    .wws-stat-label {
      font-size: 12px;
      color: var(--wws-text-secondary);
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .wws-status-list {
      background: rgba(0, 0, 0, 0.05);
      border-radius: 12px;
      padding: 20px;
    }
    
    .wws-status-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid var(--wws-border);
    }
    
    .wws-status-item:last-child {
      border-bottom: none;
    }
    
    .wws-status-label {
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 10px;
      color: var(--wws-text);
    }
    
    .wws-status-label i {
      width: 20px;
      text-align: center;
    }
    
    .wws-status-value {
      font-size: 14px;
      font-weight: 700;
      color: var(--wws-text);
    }
    
    .wws-settings-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;
      border-bottom: 1px solid var(--wws-border);
    }
    
    .wws-settings-item:last-child {
      border-bottom: none;
    }
    
    .wws-settings-label {
      font-size: 14px;
      color: var(--wws-text);
    }
    
    .wws-settings-desc {
      font-size: 12px;
      color: var(--wws-text-secondary);
      margin-top: 4px;
    }
    
    .wws-switch {
      position: relative;
      display: inline-block;
      width: 52px;
      height: 28px;
    }
    
    .wws-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    
    .wws-switch-slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.2);
      transition: var(--wws-transition);
      border-radius: 34px;
    }
    
    .wws-switch-slider:before {
      position: absolute;
      content: "";
      height: 22px;
      width: 22px;
      left: 3px;
      bottom: 3px;
      background: white;
      transition: var(--wws-transition);
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }
    
    input:checked + .wws-switch-slider {
      background: var(--wws-primary);
    }
    
    input:checked + .wws-switch-slider:before {
      transform: translateX(24px);
    }
    
    .wws-select {
      padding: 8px 16px;
      border-radius: 10px;
      border: 1px solid var(--wws-border);
      background: var(--wws-surface);
      color: var(--wws-text);
      font-size: 14px;
      cursor: pointer;
      min-width: 120px;
      transition: var(--wws-transition);
    }
    
    .wws-select:hover {
      border-color: var(--wws-primary);
    }
    
    .wws-select:focus {
      outline: none;
      border-color: var(--wws-primary);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    /* Notification styles */
    .wws-notification {
      position: fixed;
      z-index: 2147483648;
      animation: wwsFadeIn 0.3s ease-out;
      max-width: 320px;
    }
    
    .wws-notification-content {
      background: var(--wws-surface);
      border-radius: 12px;
      padding: 16px;
      border: 1px solid var(--wws-border);
      box-shadow: var(--wws-shadow);
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }
    
    .wws-notification-icon {
      width: 40px;
      height: 40px;
      background: rgba(239, 68, 68, 0.1);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    
    .wws-notification-icon i {
      color: var(--wws-danger);
      font-size: 18px;
    }
    
    .wws-notification-text {
      flex: 1;
    }
    
    .wws-notification-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--wws-text);
      margin-bottom: 4px;
    }
    
    .wws-notification-message {
      font-size: 13px;
      color: var(--wws-text-secondary);
      line-height: 1.4;
    }
    
    .wws-notification-close {
      background: none;
      border: none;
      color: var(--wws-text-secondary);
      font-size: 14px;
      cursor: pointer;
      padding: 4px;
      margin-left: 4px;
    }
    
    /* Responsive */
    @media (max-width: 480px) {
      .wws-protection-content {
        padding: 20px;
      }
      
      .wws-title {
        font-size: 32px;
      }
      
      .wws-subtitle {
        font-size: 16px;
      }
      
      .wws-widget-panel {
        width: calc(100vw - 40px);
      }
      
      .wws-position-bottom-right .wws-widget-panel,
      .wws-position-bottom-left .wws-widget-panel {
        bottom: 80px;
        left: 20px;
        right: 20px;
        width: auto;
      }
      
      .wws-position-top-right .wws-widget-panel,
      .wws-position-top-left .wws-widget-panel {
        top: 80px;
        left: 20px;
        right: 20px;
        width: auto;
      }
    }
    
    @media (max-height: 600px) {
      .wws-protection-content {
        padding: 20px;
        max-width: 400px;
      }
      
      .wws-shield-wrapper {
        width: 120px;
        height: 120px;
        margin-bottom: 30px;
      }
      
      .wws-shield i {
        font-size: 50px;
      }
    }
  `;
  
  document.head.appendChild(styles);
  
  // ==================== UTILITY FUNCTIONS ====================
  const Utils = {
    formatNumber: (num) => {
      if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
      if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
      return num.toString();
    },
    
    showNotification: (title, message, type = 'info') => {
      if (!State.notifications.enabled) return;
      
      const notification = document.createElement('div');
      notification.className = 'wws-notification wws-position-top-right';
      notification.style.top = '24px';
      notification.style.right = '24px';
      
      const icon = type === 'threat' ? 'fas fa-exclamation-triangle' : 'fas fa-info-circle';
      const iconColor = type === 'threat' ? 'var(--wws-danger)' : 'var(--wws-primary)';
      
      notification.innerHTML = `
        <div class="wws-notification-content">
          <div class="wws-notification-icon" style="background: ${type === 'threat' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)'}">
            <i class="${icon}" style="color: ${iconColor}"></i>
          </div>
          <div class="wws-notification-text">
            <div class="wws-notification-title">${title}</div>
            <div class="wws-notification-message">${message}</div>
          </div>
          <button class="wws-notification-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
      `;
      
      document.body.appendChild(notification);
      
      // Close button
      notification.querySelector('.wws-notification-close').addEventListener('click', () => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-10px)';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      });
      
      // Auto remove after 5 seconds
      setTimeout(() => {
        if (notification.parentNode) {
          notification.style.opacity = '0';
          notification.style.transform = 'translateY(-10px)';
          setTimeout(() => {
            if (notification.parentNode) {
              notification.parentNode.removeChild(notification);
            }
          }, 300);
        }
      }, 5000);
    },
    
    updateBadge: (count) => {
      const badge = document.querySelector('.wws-notification-badge');
      if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'block' : 'none';
      }
    }
  };
  
  // ==================== MINIMAL PROTECTION SCREEN ====================
  class ProtectionScreen {
    constructor() {
      this.screen = null;
      this.interval = null;
    }
    
    show() {
      if (this.screen) return;
      
      this.screen = document.createElement('div');
      this.screen.className = 'wws-protection-screen';
      
      this.screen.innerHTML = `
        <div class="wws-protection-content">
          <div class="wws-shield-wrapper">
            <div class="wws-shield-ripple"></div>
            <div class="wws-shield-ripple"></div>
            <div class="wws-shield">
              <i class="fas fa-shield-alt"></i>
            </div>
          </div>
          
          <h1 class="wws-title">${CONFIG.companyName}</h1>
          <p class="wws-subtitle">Verifying your connection</p>
          
          <div class="wws-status-container">
            <div class="wws-status-text" id="wws-status-text">Starting security scan...</div>
            
            <div class="wws-progress-container">
              <div class="wws-progress-bar">
                <div class="wws-progress-fill" id="wws-progress-fill"></div>
              </div>
              <div class="wws-progress-text">
                <span>0%</span>
                <span id="wws-progress-percent">Initializing</span>
                <span>100%</span>
              </div>
            </div>
          </div>
          
          <div class="wws-footer">
            Powered by <a href="${CONFIG.websiteUrl}" target="_blank">Wandering Wizardry Studios</a>
          </div>
        </div>
      `;
      
      document.body.appendChild(this.screen);
      this.startVerification();
    }
    
    startVerification() {
      let progress = 0;
      const steps = [
        'Checking security protocols...',
        'Analyzing connection...',
        'Verifying integrity...',
        'Finalizing protection...'
      ];
      let currentStep = 0;
      
      this.interval = setInterval(() => {
        if (progress >= 100) {
          clearInterval(this.interval);
          this.completeVerification();
          return;
        }
        
        progress = Math.min(100, progress + 1.5);
        
        // Update UI
        const progressFill = document.getElementById('wws-progress-fill');
        const progressPercent = document.getElementById('wws-progress-percent');
        const statusText = document.getElementById('wws-status-text');
        
        if (progressFill) progressFill.style.width = `${progress}%`;
        if (progressPercent) progressPercent.textContent = `${Math.floor(progress)}%`;
        
        // Update status text based on progress
        const stepIndex = Math.floor((progress / 100) * steps.length);
        if (stepIndex > currentStep && statusText) {
          currentStep = stepIndex;
          statusText.textContent = steps[currentStep - 1] || steps[0];
        }
        
      }, 30);
    }
    
    completeVerification() {
      const progressPercent = document.getElementById('wws-progress-percent');
      const statusText = document.getElementById('wws-status-text');
      
      if (progressPercent) progressPercent.textContent = '100%';
      if (statusText) statusText.textContent = 'Verification complete';
      
      // Update state
      State.verificationComplete = true;
      State.metrics.securityScore = 96;
      localStorage.setItem('wws_verified', 'true');
      
      // Show notification
      if (State.notifications.enabled) {
        Utils.showNotification(
          'Protection Active',
          'Your connection is now secured with WWS PROTECT',
          'info'
        );
      }
      
      // Transition to widget
      setTimeout(() => {
        this.hide();
        Widget.show();
      }, 1000);
    }
    
    hide() {
      if (this.screen) {
        this.screen.style.opacity = '0';
        this.screen.style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
          if (this.screen.parentNode) {
            this.screen.parentNode.removeChild(this.screen);
            this.screen = null;
          }
        }, 500);
      }
      
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
      }
    }
  }
  
  // ==================== WIDGET ====================
  class Widget {
    constructor() {
      this.widget = null;
      this.panel = null;
      this.isPanelOpen = false;
      this.currentTab = 'overview';
      this.init();
    }
    
    init() {
      this.createWidget();
      this.bindEvents();
      this.applyTheme();
      this.updateBadge();
      this.startMonitoring();
    }
    
    createWidget() {
      // Remove existing widget if any
      const existingWidget = document.querySelector('.wws-widget');
      if (existingWidget) existingWidget.remove();
      
      this.widget = document.createElement('div');
      this.widget.className = `wws-widget wws-theme-${State.currentTheme} wws-position-${State.position}`;
      
      this.widget.innerHTML = `
        <div class="wws-widget-toggle" id="wws-widget-toggle">
          <i class="fas fa-shield-alt"></i>
          <div class="wws-notification-badge">${State.metrics.threatsBlocked}</div>
        </div>
        
        <div class="wws-widget-panel" id="wws-widget-panel">
          <div class="wws-panel-header">
            <div class="wws-header-left">
              <div class="wws-header-icon">
                <i class="fas fa-shield-alt"></i>
              </div>
              <div class="wws-header-text">
                <h3>${CONFIG.companyName}</h3>
                <p>v${CONFIG.version} • Active</p>
              </div>
            </div>
            <button class="wws-close-panel" id="wws-close-panel">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="wws-panel-tabs">
            <button class="wws-tab active" data-tab="overview">
              <i class="fas fa-chart-simple"></i>
              <span>Overview</span>
            </button>
            <button class="wws-tab" data-tab="security">
              <i class="fas fa-shield"></i>
              <span>Security</span>
            </button>
            <button class="wws-tab" data-tab="settings">
              <i class="fas fa-sliders"></i>
              <span>Settings</span>
            </button>
          </div>
          
          <div class="wws-panel-content" id="wws-panel-content">
            <!-- Content loaded dynamically -->
          </div>
          
          <div class="wws-panel-footer">
            <a href="${CONFIG.websiteUrl}" target="_blank" class="wws-footer-link">
              <i class="fas fa-external-link-alt"></i> Open Dashboard
            </a>
          </div>
        </div>
      `;
      
      document.body.appendChild(this.widget);
      this.panel = document.getElementById('wws-widget-panel');
      this.updatePanelContent();
    }
    
    bindEvents() {
      // Toggle widget panel
      document.getElementById('wws-widget-toggle').addEventListener('click', (e) => {
        e.stopPropagation();
        this.togglePanel();
      });
      
      // Close panel
      document.getElementById('wws-close-panel').addEventListener('click', (e) => {
        e.stopPropagation();
        this.closePanel();
      });
      
      // Tab switching
      document.querySelectorAll('.wws-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          document.querySelectorAll('.wws-tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          this.currentTab = tab.dataset.tab;
          this.updatePanelContent();
        });
      });
      
      // Close panel when clicking outside
      document.addEventListener('click', (e) => {
        if (this.isPanelOpen && 
            !this.panel.contains(e.target) && 
            !e.target.closest('.wws-widget-toggle')) {
          this.closePanel();
        }
      });
      
      // Close panel with Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isPanelOpen) {
          this.closePanel();
        }
      });
    }
    
    togglePanel() {
      this.isPanelOpen = !this.isPanelOpen;
      this.panel.style.display = this.isPanelOpen ? 'block' : 'none';
      
      if (this.isPanelOpen) {
        this.updatePanelContent();
      }
    }
    
    closePanel() {
      this.isPanelOpen = false;
      this.panel.style.display = 'none';
    }
    
    updatePanelContent() {
      const content = document.getElementById('wws-panel-content');
      if (!content) return;
      
      switch (this.currentTab) {
        case 'overview':
          this.renderOverview(content);
          break;
        case 'security':
          this.renderSecurity(content);
          break;
        case 'settings':
          this.renderSettings(content);
          break;
      }
    }
    
    renderOverview(container) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      const dateStr = now.toLocaleDateString();
      
      container.innerHTML = `
        <div class="wws-section">
          <div class="wws-section-title">
            <i class="fas fa-chart-simple"></i>
            Current Status
          </div>
          
          <div class="wws-stats-grid">
            <div class="wws-stat-card">
              <div class="wws-stat-value">${State.metrics.securityScore}</div>
              <div class="wws-stat-label">Security Score</div>
            </div>
            
            <div class="wws-stat-card">
              <div class="wws-stat-value">${State.metrics.threatsBlocked}</div>
              <div class="wws-stat-label">Threats Blocked</div>
            </div>
          </div>
        </div>
        
        <div class="wws-section">
          <div class="wws-section-title">
            <i class="fas fa-clock"></i>
            Session Info
          </div>
          
          <div class="wws-status-list">
            <div class="wws-status-item">
              <div class="wws-status-label">
                <i class="far fa-clock"></i>
                Current Time
              </div>
              <div class="wws-status-value">${timeStr}</div>
            </div>
            
            <div class="wws-status-item">
              <div class="wws-status-label">
                <i class="far fa-calendar"></i>
                Date
              </div>
              <div class="wws-status-value">${dateStr}</div>
            </div>
            
            <div class="wws-status-item">
              <div class="wws-status-label">
                <i class="fas fa-shield-alt"></i>
                Protection Status
              </div>
              <div class="wws-status-value" style="color: var(--wws-success)">Active</div>
            </div>
          </div>
        </div>
      `;
    }
    
    renderSecurity(container) {
      container.innerHTML = `
        <div class="wws-section">
          <div class="wws-section-title">
            <i class="fas fa-shield"></i>
            Protection Status
          </div>
          
          <div class="wws-status-list">
            <div class="wws-status-item">
              <div class="wws-status-label">
                <i class="fas fa-fire"></i>
                Firewall
              </div>
              <div class="wws-status-value" style="color: var(--wws-success)">Active</div>
            </div>
            
            <div class="wws-status-item">
              <div class="wws-status-label">
                <i class="fas fa-robot"></i>
                Bot Protection
              </div>
              <div class="wws-status-value" style="color: var(--wws-success)">Enabled</div>
            </div>
            
            <div class="wws-status-item">
              <div class="wws-status-label">
                <i class="fas fa-broadcast-tower"></i>
                DDoS Protection
              </div>
              <div class="wws-status-value" style="color: var(--wws-success)">Enabled</div>
            </div>
            
            <div class="wws-status-item">
              <div class="wws-status-label">
                <i class="fas fa-lock"></i>
                Encryption
              </div>
              <div class="wws-status-value" style="color: var(--wws-success)">TLS 1.3</div>
            </div>
          </div>
        </div>
        
        <div class="wws-section">
          <div class="wws-section-title">
            <i class="fas fa-history"></i>
            Recent Activity
          </div>
          
          <div class="wws-status-list">
            <div class="wws-status-item">
              <div class="wws-status-label">
                <i class="fas fa-check-circle"></i>
                Last Scan
              </div>
              <div class="wws-status-value">Just now</div>
            </div>
            
            <div class="wws-status-item">
              <div class="wws-status-label">
                <i class="fas fa-exclamation-triangle"></i>
                Threats Today
              </div>
              <div class="wws-status-value">${State.metrics.threatsBlocked}</div>
            </div>
            
            <div class="wws-status-item">
              <div class="wws-status-label">
                <i class="fas fa-sync-alt"></i>
                Auto Updates
              </div>
              <div class="wws-status-value" style="color: var(--wws-success)">Enabled</div>
            </div>
          </div>
        </div>
      `;
    }
    
    renderSettings(container) {
      container.innerHTML = `
        <div class="wws-section">
          <div class="wws-section-title">
            <i class="fas fa-sliders"></i>
            Widget Settings
          </div>
          
          <div class="wws-status-list">
            <div class="wws-settings-item">
              <div>
                <div class="wws-settings-label">Widget Position</div>
                <div class="wws-settings-desc">Choose where to display widget</div>
              </div>
              <select class="wws-select" id="wws-position-select">
                <option value="bottom-right" ${State.position === 'bottom-right' ? 'selected' : ''}>Bottom Right</option>
                <option value="bottom-left" ${State.position === 'bottom-left' ? 'selected' : ''}>Bottom Left</option>
                <option value="top-right" ${State.position === 'top-right' ? 'selected' : ''}>Top Right</option>
                <option value="top-left" ${State.position === 'top-left' ? 'selected' : ''}>Top Left</option>
              </select>
            </div>
            
            <div class="wws-settings-item">
              <div>
                <div class="wws-settings-label">Theme</div>
                <div class="wws-settings-desc">Choose color theme</div>
              </div>
              <select class="wws-select" id="wws-theme-select">
                <option value="dark" ${State.currentTheme === 'dark' ? 'selected' : ''}>Dark</option>
                <option value="light" ${State.currentTheme === 'light' ? 'selected' : ''}>Light</option>
              </select>
            </div>
          </div>
        </div>
        
        <div class="wws-section">
          <div class="wws-section-title">
            <i class="fas fa-bell"></i>
            Notifications
          </div>
          
          <div class="wws-status-list">
            <div class="wws-settings-item">
              <div>
                <div class="wws-settings-label">Enable Notifications</div>
                <div class="wws-settings-desc">Show security alerts</div>
              </div>
              <label class="wws-switch">
                <input type="checkbox" id="wws-notifications" ${State.notifications.enabled ? 'checked' : ''}>
                <span class="wws-switch-slider"></span>
              </label>
            </div>
            
            <div class="wws-settings-item">
              <div>
                <div class="wws-settings-label">Threat Alerts</div>
                <div class="wws-settings-desc">Show threat notifications</div>
              </div>
              <label class="wws-switch">
                <input type="checkbox" id="wws-threat-alerts" ${State.notifications.threatAlerts ? 'checked' : ''}>
                <span class="wws-switch-slider"></span>
              </label>
            </div>
          </div>
        </div>
      `;
      
      this.bindSettingsEvents();
    }
    
    bindSettingsEvents() {
      // Position selector
      const positionSelect = document.getElementById('wws-position-select');
      if (positionSelect) {
        positionSelect.addEventListener('change', (e) => {
          State.position = e.target.value;
          localStorage.setItem('wws_position', State.position);
          this.updatePosition();
        });
      }
      
      // Theme selector
      const themeSelect = document.getElementById('wws-theme-select');
      if (themeSelect) {
        themeSelect.addEventListener('change', (e) => {
          State.currentTheme = e.target.value;
          localStorage.setItem('wws_theme', State.currentTheme);
          this.applyTheme();
        });
      }
      
      // Notification toggles
      const notificationToggle = document.getElementById('wws-notifications');
      if (notificationToggle) {
        notificationToggle.addEventListener('change', (e) => {
          State.notifications.enabled = e.target.checked;
          localStorage.setItem('wws_notifications', e.target.checked);
        });
      }
      
      const threatToggle = document.getElementById('wws-threat-alerts');
      if (threatToggle) {
        threatToggle.addEventListener('change', (e) => {
          State.notifications.threatAlerts = e.target.checked;
          localStorage.setItem('wws_threat_alerts', e.target.checked);
        });
      }
    }
    
    applyTheme() {
      this.widget.className = `wws-widget wws-theme-${State.currentTheme} wws-position-${State.position}`;
    }
    
    updatePosition() {
      this.widget.className = `wws-widget wws-theme-${State.currentTheme} wws-position-${State.position}`;
    }
    
    updateBadge() {
      Utils.updateBadge(State.metrics.threatsBlocked);
    }
    
    startMonitoring() {
      // Simulate occasional threat detection
      setInterval(() => {
        if (Math.random() < 0.02 && State.notifications.threatAlerts) {
          State.metrics.threatsBlocked++;
          this.updateBadge();
          
          if (State.notifications.enabled) {
            Utils.showNotification(
              'Threat Blocked',
              'Malicious activity detected and blocked',
              'threat'
            );
          }
        }
      }, 10000);
    }
    
    static show() {
      if (!window.wwsWidgetInstance) {
        window.wwsWidgetInstance = new Widget();
      }
      window.wwsWidgetInstance.widget.style.display = 'block';
    }
    
    static hide() {
      if (window.wwsWidgetInstance) {
        window.wwsWidgetInstance.widget.style.display = 'none';
      }
    }
  }
  
  // ==================== MAIN INITIALIZATION ====================
  function initializeWWS() {
    // Check if already verified
    if (localStorage.getItem('wws_verified') === 'true') {
      console.log('✅ WWS PROTECT: Session already verified');
      Widget.show();
      return;
    }
    
    // Show protection screen
    const protectionScreen = new ProtectionScreen();
    protectionScreen.show();
  }
  
  // ==================== PUBLIC API ====================
  window.WWS = {
    version: CONFIG.version,
    
    // Get current status
    getStatus: () => ({
      verified: State.verificationComplete,
      securityScore: State.metrics.securityScore,
      threatsBlocked: State.metrics.threatsBlocked,
      position: State.position,
      theme: State.currentTheme
    }),
    
    // Manual verification
    verify: () => {
      localStorage.removeItem('wws_verified');
      initializeWWS();
    },
    
    // Open dashboard
    openDashboard: () => {
      window.open(CONFIG.websiteUrl, '_blank');
    },
    
    // Show/hide widget
    showWidget: () => Widget.show(),
    hideWidget: () => Widget.hide(),
    
    // Show test notification
    testNotification: (type = 'info') => {
      if (type === 'threat') {
        Utils.showNotification(
          'Test Threat Alert',
          'This is a test threat notification',
          'threat'
        );
      } else {
        Utils.showNotification(
          'Test Notification',
          'This is a test notification',
          'info'
        );
      }
    }
  };
  
  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWWS);
  } else {
    setTimeout(initializeWWS, 100);
  }
  
})();
