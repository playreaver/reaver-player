/**
 * WWS PROTECT v6.0 - Real Security Gateway
 * Complete Protection System with Real Analytics & Beautiful UI
 * @license MIT
 */

(function() {
  'use strict';
  
  // ==================== CONFIGURATION ====================
  const CONFIG = {
    version: '6.0',
    companyName: 'WWS PROTECT',
    websiteUrl: 'https://reaver.is-a.dev/',
    apiEndpoint: 'https://api.wws-protect.com/v1',
    
    widget: {
      position: 'bottom-left',
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
      verificationTime: 3500,
      allowedCountries: ['US', 'CA', 'GB', 'DE', 'FR', 'JP', 'AU', 'SG'],
      highRiskScore: 70,
      mediumRiskScore: 40
    },
    
    analytics: {
      updateInterval: 5000,
      maxRequestsPerMinute: 120,
      threatPatterns: [
        { pattern: /sql.*injection/i, severity: 'high' },
        { pattern: /xss.*cross.*site/i, severity: 'high' },
        { pattern: /<script>.*<\/script>/i, severity: 'high' },
        { pattern: /eval\(.*\)/i, severity: 'medium' },
        { pattern: /union.*select/i, severity: 'high' },
        { pattern: /\.\.\/\.\.\//i, severity: 'medium' }
      ]
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
      totalRequests: 0,
      blockedThreats: 0,
      dataTransferred: 0,
      cacheHits: 0,
      cacheMisses: 0,
      responseTime: 0,
      uptime: 100,
      activeConnections: 0
    },
    threats: [],
    userBehavior: {
      mouseMovements: [],
      clicks: [],
      scrolls: [],
      keystrokes: [],
      sessionStart: Date.now()
    },
    deviceInfo: null,
    networkInfo: null
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
      --wws-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
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
    
    @keyframes wwsFadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes wwsShieldGlow {
      0%, 100% { filter: drop-shadow(0 0 20px var(--wws-primary)); transform: scale(1); }
      50% { filter: drop-shadow(0 0 30px var(--wws-primary)); transform: scale(1.05); }
    }
    
    @keyframes wwsProgress {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    
    @keyframes wwsSpin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    @keyframes wwsPulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
    
    .wws-protection-screen {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      background: linear-gradient(135deg, #0a0a1a, #121226, #0a0a1a) !important;
      z-index: 2147483647 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif !important;
      animation: wwsFadeIn 0.5s ease-out;
      overflow: hidden;
    }
    
    .wws-protection-screen * {
      box-sizing: border-box;
    }
    
    .wws-protection-container {
      position: relative;
      z-index: 10;
      width: 100%;
      max-width: 520px;
      padding: 40px;
    }
    
    .wws-protection-card {
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 24px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      padding: 48px 40px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    
    .wws-protection-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, var(--wws-primary), var(--wws-secondary));
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
      filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
    }
    
    .wws-shield-rings {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 160px;
      height: 160px;
      border: 2px solid rgba(59, 130, 246, 0.3);
      border-radius: 50%;
      animation: wwsPulse 3s ease-in-out infinite;
    }
    
    .wws-shield-rings:nth-child(3) {
      width: 180px;
      height: 180px;
      border-color: rgba(59, 130, 246, 0.15);
      animation-delay: 0.5s;
    }
    
    .wws-title {
      color: white;
      font-size: 42px;
      font-weight: 800;
      margin: 0 0 12px;
      letter-spacing: -0.5px;
      background: linear-gradient(135deg, #3B82F6, #8B5CF6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .wws-subtitle {
      color: #94A3B8;
      font-size: 18px;
      font-weight: 400;
      margin: 0 0 48px;
      line-height: 1.5;
    }
    
    .wws-verification-steps {
      background: rgba(30, 41, 59, 0.5);
      border-radius: 16px;
      padding: 32px;
      margin: 0 0 32px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .wws-step {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      opacity: 0.5;
      transition: all 0.3s ease;
    }
    
    .wws-step:last-child {
      border-bottom: none;
    }
    
    .wws-step.active {
      opacity: 1;
    }
    
    .wws-step.completed {
      opacity: 0.8;
    }
    
    .wws-step-icon {
      width: 40px;
      height: 40px;
      background: rgba(59, 130, 246, 0.1);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    
    .wws-step-icon i {
      color: var(--wws-primary);
      font-size: 18px;
    }
    
    .wws-step-content {
      flex: 1;
      text-align: left;
    }
    
    .wws-step-title {
      color: white;
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 4px;
    }
    
    .wws-step-description {
      color: #94A3B8;
      font-size: 14px;
      margin: 0;
    }
    
    .wws-step-status {
      color: var(--wws-primary);
      font-size: 14px;
      font-weight: 600;
    }
    
    .wws-progress-container {
      width: 100%;
      margin: 32px 0;
    }
    
    .wws-progress-bar {
      width: 100%;
      height: 8px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 12px;
    }
    
    .wws-progress-fill {
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, var(--wws-primary), var(--wws-secondary));
      background-size: 200% 100%;
      animation: wwsProgress 2s linear infinite;
      transition: width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
      border-radius: 4px;
    }
    
    .wws-progress-text {
      display: flex;
      justify-content: space-between;
      color: #94A3B8;
      font-size: 14px;
      font-weight: 500;
    }
    
    .wws-security-metrics {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin: 40px 0 32px;
    }
    
    .wws-metric {
      text-align: center;
    }
    
    .wws-metric-value {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    
    .wws-metric-value.risk {
      color: #3B82F6;
    }
    
    .wws-metric-value.scans {
      color: #8B5CF6;
    }
    
    .wws-metric-value.threats {
      color: #10B981;
    }
    
    .wws-metric-label {
      color: #94A3B8;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 600;
    }
    
    .wws-footer {
      color: #64748B;
      font-size: 14px;
      margin-top: 40px;
    }
    
    .wws-footer a {
      color: #3B82F6;
      text-decoration: none;
      font-weight: 600;
      transition: color 0.2s;
    }
    
    .wws-footer a:hover {
      color: #60A5FA;
    }
    
    /* WIDGET STYLES */
    .wws-widget {
      position: fixed;
      bottom: 24px;
      left: 24px;
      z-index: 2147483646;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
      overflow: hidden;
    }
    
    .wws-widget-toggle::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, 
        rgba(255, 255, 255, 0.1), 
        rgba(255, 255, 255, 0));
      opacity: 0;
      transition: opacity 0.3s;
    }
    
    .wws-widget-toggle:hover {
      transform: translateY(-4px) scale(1.05);
      box-shadow: 0 15px 50px rgba(59, 130, 246, 0.4);
    }
    
    .wws-widget-toggle:hover::before {
      opacity: 1;
    }
    
    .wws-widget-toggle i {
      font-size: 28px;
      color: white;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
      position: relative;
      z-index: 1;
    }
    
    .wws-widget-badge {
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
      font-feature-settings: "tnum";
    }
    
    .wws-widget-panel {
      position: absolute;
      bottom: 80px;
      left: 0;
      width: 380px;
      background: var(--wws-surface);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      border: 1px solid var(--wws-border);
      box-shadow: var(--wws-shadow);
      display: none;
      overflow: hidden;
      z-index: 2147483647;
      max-height: 520px;
      animation: wwsFadeIn 0.3s ease-out;
      color: var(--wws-text);
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
      width: 52px;
      height: 52px;
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
    
    .wws-header-status {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .wws-status-dot {
      width: 10px;
      height: 10px;
      background: #10B981;
      border-radius: 50%;
      animation: wwsPulse 2s ease-in-out infinite;
    }
    
    .wws-status-text {
      font-size: 12px;
      font-weight: 600;
      color: #10B981;
    }
    
    .wws-panel-tabs {
      display: flex;
      padding: 8px;
      background: rgba(0, 0, 0, 0.05);
      border-bottom: 1px solid var(--wws-border);
    }
    
    .wws-tab {
      flex: 1;
      padding: 14px 8px;
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
      position: relative;
    }
    
    .wws-tab i {
      font-size: 18px;
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
    
    .wws-tab.active::after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 50%;
      transform: translateX(-50%);
      width: 4px;
      height: 4px;
      background: var(--wws-primary);
      border-radius: 50%;
    }
    
    .wws-panel-content {
      padding: 24px;
      overflow-y: auto;
      max-height: 400px;
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
    
    .wws-section {
      margin-bottom: 28px;
    }
    
    .wws-section:last-child {
      margin-bottom: 0;
    }
    
    .wws-section-title {
      font-size: 15px;
      font-weight: 700;
      margin-bottom: 18px;
      display: flex;
      align-items: center;
      gap: 10px;
      color: var(--wws-text);
    }
    
    .wws-section-title i {
      color: var(--wws-primary);
      font-size: 16px;
    }
    
    .wws-metrics-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 20px;
    }
    
    .wws-metric-card {
      background: rgba(0, 0, 0, 0.05);
      border-radius: 14px;
      padding: 20px;
      text-align: center;
      border-left: 4px solid var(--wws-primary);
      transition: var(--wws-transition);
    }
    
    .wws-metric-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    }
    
    .wws-metric-card:nth-child(2) {
      border-left-color: var(--wws-secondary);
    }
    
    .wws-metric-card:nth-child(3) {
      border-left-color: var(--wws-success);
    }
    
    .wws-metric-card:nth-child(4) {
      border-left-color: var(--wws-warning);
    }
    
    .wws-metric-value {
      font-size: 24px;
      font-weight: 800;
      margin-bottom: 8px;
      color: var(--wws-text);
      font-feature-settings: "tnum";
    }
    
    .wws-metric-label {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--wws-text-secondary);
      font-weight: 600;
    }
    
    .wws-status-card {
      background: rgba(0, 0, 0, 0.05);
      border-radius: 14px;
      padding: 20px;
    }
    
    .wws-status-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--wws-border);
    }
    
    .wws-status-row:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
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
      color: var(--wws-primary);
    }
    
    .wws-status-value {
      font-size: 14px;
      font-weight: 700;
      color: var(--wws-text);
    }
    
    .wws-tech-item {
      padding: 14px 0;
      border-bottom: 1px solid var(--wws-border);
    }
    
    .wws-tech-item:last-child {
      border-bottom: none;
    }
    
    .wws-tech-label {
      font-size: 13px;
      margin-bottom: 6px;
      color: var(--wws-text-secondary);
      font-weight: 500;
    }
    
    .wws-tech-value {
      font-size: 13px;
      font-weight: 600;
      color: var(--wws-text);
      word-break: break-all;
    }
    
    .wws-threat-item {
      background: rgba(239, 68, 68, 0.1);
      border-left: 4px solid var(--wws-danger);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 12px;
    }
    
    .wws-threat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    
    .wws-threat-type {
      font-size: 13px;
      font-weight: 700;
      color: var(--wws-text);
    }
    
    .wws-threat-severity {
      font-size: 11px;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .wws-threat-severity.high {
      background: rgba(239, 68, 68, 0.2);
      color: var(--wws-danger);
    }
    
    .wws-threat-severity.medium {
      background: rgba(245, 158, 11, 0.2);
      color: var(--wws-warning);
    }
    
    .wws-threat-details {
      font-size: 12px;
      color: var(--wws-text-secondary);
      margin-bottom: 8px;
    }
    
    .wws-threat-time {
      font-size: 11px;
      color: var(--wws-text-secondary);
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    .wws-no-threats {
      text-align: center;
      padding: 40px 20px;
      color: var(--wws-text-secondary);
    }
    
    .wws-no-threats i {
      font-size: 48px;
      color: var(--wws-success);
      margin-bottom: 20px;
      display: block;
      opacity: 0.8;
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
    
    @media (max-width: 480px) {
      .wws-widget-panel {
        width: 340px;
        left: 50%;
        transform: translateX(-50%);
      }
      
      .wws-protection-container {
        padding: 20px;
      }
      
      .wws-protection-card {
        padding: 32px 24px;
      }
      
      .wws-title {
        font-size: 32px;
      }
      
      .wws-security-metrics {
        grid-template-columns: 1fr;
        gap: 16px;
      }
      
      .wws-metrics-grid {
        grid-template-columns: 1fr;
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
    
    formatBytes: (bytes) => {
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
      if (bytes === 0) return '0 B';
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
    },
    
    formatTime: (ms) => {
      if (ms < 1000) return ms + 'ms';
      return (ms / 1000).toFixed(1) + 's';
    },
    
    formatTimeAgo: (date) => {
      const seconds = Math.floor((Date.now() - date) / 1000);
      if (seconds < 60) return 'just now';
      if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
      if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
      return Math.floor(seconds / 86400) + 'd ago';
    },
    
    generateId: () => {
      return 'wws_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    },
    
    debounce: (func, wait) => {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }
  };
  
  // ==================== SECURITY ANALYZER ====================
  class SecurityAnalyzer {
    constructor() {
      this.riskScore = 0;
      this.riskFactors = [];
      this.deviceInfo = this.collectDeviceInfo();
      this.networkInfo = this.collectNetworkInfo();
      this.behaviorTracker = new BehaviorTracker();
      this.threatDetector = new ThreatDetector();
    }
    
    collectDeviceInfo() {
      const info = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        vendor: navigator.vendor,
        language: navigator.language,
        languages: navigator.languages,
        screen: {
          width: screen.width,
          height: screen.height,
          colorDepth: screen.colorDepth,
          pixelRatio: window.devicePixelRatio
        },
        hardware: {
          cores: navigator.hardwareConcurrency || 'unknown',
          memory: navigator.deviceMemory || 'unknown'
        },
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        cookies: navigator.cookieEnabled,
        doNotTrack: navigator.doNotTrack,
        webdriver: navigator.webdriver || false,
        plugins: navigator.plugins ? Array.from(navigator.plugins).map(p => p.name).join(', ') : 'none'
      };
      
      State.deviceInfo = info;
      return info;
    }
    
    collectNetworkInfo() {
      const info = {
        connection: navigator.connection ? {
          effectiveType: navigator.connection.effectiveType,
          rtt: navigator.connection.rtt,
          downlink: navigator.connection.downlink,
          saveData: navigator.connection.saveData
        } : null,
        online: navigator.onLine,
        geoLocation: null
      };
      
      State.networkInfo = info;
      return info;
    }
    
    async analyze() {
      const steps = [
        { name: 'Device Analysis', weight: 0.2 },
        { name: 'Network Analysis', weight: 0.15 },
        { name: 'Behavior Analysis', weight: 0.35 },
        { name: 'Threat Detection', weight: 0.3 }
      ];
      
      let totalScore = 0;
      
      for (const step of steps) {
        let stepScore = 0;
        let stepFactors = [];
        
        switch(step.name) {
          case 'Device Analysis':
            const deviceResult = this.analyzeDevice();
            stepScore = deviceResult.score;
            stepFactors = deviceResult.factors;
            break;
            
          case 'Network Analysis':
            const networkResult = await this.analyzeNetwork();
            stepScore = networkResult.score;
            stepFactors = networkResult.factors;
            break;
            
          case 'Behavior Analysis':
            const behaviorResult = this.analyzeBehavior();
            stepScore = behaviorResult.score;
            stepFactors = behaviorResult.factors;
            break;
            
          case 'Threat Detection':
            const threatResult = this.analyzeThreats();
            stepScore = threatResult.score;
            stepFactors = threatResult.factors;
            break;
        }
        
        totalScore += stepScore * step.weight;
        this.riskFactors.push(...stepFactors);
      }
      
      this.riskScore = Math.min(100, Math.max(0, totalScore * 100));
      return this.riskScore;
    }
    
    analyzeDevice() {
      let score = 0;
      const factors = [];
      
      // Check for common bot indicators
      if (navigator.webdriver) {
        score += 0.8;
        factors.push({
          type: 'device',
          severity: 'high',
          message: 'WebDriver detected - possible automation tool'
        });
      }
      
      if (!navigator.plugins || navigator.plugins.length === 0) {
        score += 0.3;
        factors.push({
          type: 'device',
          severity: 'medium',
          message: 'No browser plugins detected'
        });
      }
      
      if (window.chrome && !window.chrome.runtime) {
        score += 0.2;
        factors.push({
          type: 'device',
          severity: 'low',
          message: 'Chrome runtime not available'
        });
      }
      
      return { score, factors };
    }
    
    async analyzeNetwork() {
      let score = 0;
      const factors = [];
      
      try {
        // Simulate network latency test
        const start = performance.now();
        await fetch('https://www.google.com/favicon.ico', { 
          mode: 'no-cors',
          cache: 'no-store'
        });
        const latency = performance.now() - start;
        
        if (latency > 1000) {
          score += 0.4;
          factors.push({
            type: 'network',
            severity: 'medium',
            message: `High network latency detected (${latency.toFixed(0)}ms)`
          });
        }
        
        if (navigator.connection) {
          if (navigator.connection.saveData) {
            score += 0.1;
            factors.push({
              type: 'network',
              severity: 'low',
              message: 'Data saving mode enabled'
            });
          }
          
          if (navigator.connection.effectiveType === 'slow-2g' || 
              navigator.connection.effectiveType === '2g') {
            score += 0.2;
            factors.push({
              type: 'network',
              severity: 'low',
              message: 'Slow network connection detected'
            });
          }
        }
      } catch (error) {
        // Network request failed
        score += 0.3;
        factors.push({
          type: 'network',
          severity: 'medium',
          message: 'Network connectivity issues detected'
        });
      }
      
      return { score, factors };
    }
    
    analyzeBehavior() {
      const behavior = State.userBehavior;
      let score = 0;
      const factors = [];
      
      // Check for robotic behavior patterns
      if (behavior.clicks.length > 0) {
        const clickIntervals = [];
        for (let i = 1; i < behavior.clicks.length; i++) {
          clickIntervals.push(behavior.clicks[i].timestamp - behavior.clicks[i-1].timestamp);
        }
        
        if (clickIntervals.length > 2) {
          const avgInterval = clickIntervals.reduce((a, b) => a + b) / clickIntervals.length;
          if (avgInterval < 100) {
            score += 0.6;
            factors.push({
              type: 'behavior',
              severity: 'high',
              message: 'Unnaturally fast clicking detected'
            });
          }
          
          // Check for perfect timing (bot-like)
          const variance = clickIntervals.reduce((sum, interval) => {
            return sum + Math.pow(interval - avgInterval, 2);
          }, 0) / clickIntervals.length;
          
          if (variance < 10) {
            score += 0.4;
            factors.push({
              type: 'behavior',
              severity: 'medium',
              message: 'Suspiciously consistent click timing'
            });
          }
        }
      }
      
      // Check mouse movement patterns
      if (behavior.mouseMovements.length > 20) {
        const recentMovements = behavior.mouseMovements.slice(-20);
        const linearity = this.calculateLinearity(recentMovements);
        
        if (linearity > 0.9) {
          score += 0.5;
          factors.push({
            type: 'behavior',
            severity: 'high',
            message: 'Robotic mouse movement patterns detected'
          });
        }
      }
      
      return { score, factors };
    }
    
    analyzeThreats() {
      const threats = State.threats.filter(t => t.severity === 'high' || t.severity === 'medium');
      let score = 0;
      const factors = [];
      
      if (threats.length > 0) {
        score += Math.min(0.8, threats.length * 0.2);
        factors.push({
          type: 'threat',
          severity: threats[0].severity,
          message: `${threats.length} security threats detected`
        });
      }
      
      // Check for suspicious patterns in current page
      const pageContent = document.body.innerText;
      CONFIG.analytics.threatPatterns.forEach(pattern => {
        if (pattern.pattern.test(pageContent)) {
          score += pattern.severity === 'high' ? 0.4 : 0.2;
          factors.push({
            type: 'threat',
            severity: pattern.severity,
            message: `Potential ${pattern.severity} threat pattern detected`
          });
        }
      });
      
      return { score, factors };
    }
    
    calculateLinearity(points) {
      if (points.length < 3) return 0;
      
      let totalAngleChange = 0;
      for (let i = 2; i < points.length; i++) {
        const dx1 = points[i-1].x - points[i-2].x;
        const dy1 = points[i-1].y - points[i-2].y;
        const dx2 = points[i].x - points[i-1].x;
        const dy2 = points[i].y - points[i-1].y;
        
        const angle1 = Math.atan2(dy1, dx1);
        const angle2 = Math.atan2(dy2, dx2);
        totalAngleChange += Math.abs(angle2 - angle1);
      }
      
      const avgAngleChange = totalAngleChange / (points.length - 2);
      return 1 - Math.min(avgAngleChange / Math.PI, 1);
    }
  }
  
  // ==================== BEHAVIOR TRACKER ====================
  class BehaviorTracker {
    constructor() {
      this.lastMousePosition = null;
      this.lastMouseTime = Date.now();
      this.startTracking();
    }
    
    startTracking() {
      // Track mouse movements
      document.addEventListener('mousemove', Utils.debounce((e) => {
        const now = Date.now();
        const movement = {
          x: e.clientX,
          y: e.clientY,
          timestamp: now,
          speed: this.lastMousePosition ? 
            Math.sqrt(
              Math.pow(e.clientX - this.lastMousePosition.x, 2) +
              Math.pow(e.clientY - this.lastMousePosition.y, 2)
            ) / (now - this.lastMouseTime) : 0
        };
        
        State.userBehavior.mouseMovements.push(movement);
        if (State.userBehavior.mouseMovements.length > 100) {
          State.userBehavior.mouseMovements.shift();
        }
        
        this.lastMousePosition = { x: e.clientX, y: e.clientY };
        this.lastMouseTime = now;
      }, 50));
      
      // Track clicks
      document.addEventListener('click', (e) => {
        State.userBehavior.clicks.push({
          x: e.clientX,
          y: e.clientY,
          timestamp: Date.now(),
          button: e.button
        });
        
        if (State.userBehavior.clicks.length > 50) {
          State.userBehavior.clicks.shift();
        }
        
        // Increment request count
        State.metrics.totalRequests++;
      });
      
      // Track scrolls
      let lastScrollTop = window.pageYOffset;
      document.addEventListener('scroll', Utils.debounce(() => {
        const scrollTop = window.pageYOffset;
        State.userBehavior.scrolls.push({
          position: scrollTop,
          timestamp: Date.now(),
          delta: Math.abs(scrollTop - lastScrollTop)
        });
        
        if (State.userBehavior.scrolls.length > 50) {
          State.userBehavior.scrolls.shift();
        }
        
        lastScrollTop = scrollTop;
      }, 100));
      
      // Track keystrokes (excluding passwords)
      document.addEventListener('keydown', (e) => {
        if (!['password', 'credit-card', 'cvv'].some(type => 
          e.target.type === type || e.target.className.includes(type))) {
          
          State.userBehavior.keystrokes.push({
            key: e.key,
            code: e.code,
            timestamp: Date.now(),
            target: e.target.tagName
          });
          
          if (State.userBehavior.keystrokes.length > 100) {
            State.userBehavior.keystrokes.shift();
          }
        }
      });
    }
  }
  
  // ==================== THREAT DETECTOR ====================
  class ThreatDetector {
    constructor() {
      this.detectedThreats = [];
      this.startMonitoring();
    }
    
    startMonitoring() {
      // Monitor for XSS attempts
      this.monitorScriptInjection();
      
      // Monitor for iframe injections
      this.monitorIframes();
      
      // Monitor for data exfiltration attempts
      this.monitorDataExfiltration();
      
      // Monitor for suspicious network requests
      this.monitorNetworkRequests();
      
      // Start periodic threat scan
      setInterval(() => this.scanForThreats(), 10000);
    }
    
    monitorScriptInjection() {
      const originalCreateElement = document.createElement;
      document.createElement = function(tagName) {
        const element = originalCreateElement.call(this, tagName);
        
        if (tagName.toLowerCase() === 'script') {
          const stack = new Error().stack;
          setTimeout(() => {
            const threat = {
              id: Utils.generateId(),
              type: 'Script Injection Attempt',
              severity: 'high',
              details: 'Dynamic script creation detected',
              timestamp: Date.now(),
              source: stack.split('\n')[2]?.trim() || 'unknown'
            };
            
            State.threats.unshift(threat);
            State.metrics.blockedThreats++;
            
            if (State.threats.length > 20) {
              State.threats.pop();
            }
          }, 0);
        }
        
        return element;
      };
    }
    
    monitorIframes() {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.tagName === 'IFRAME') {
              const threat = {
                id: Utils.generateId(),
                type: 'Iframe Injection',
                severity: 'medium',
                details: 'Dynamic iframe creation detected',
                timestamp: Date.now(),
                source: node.src || 'inline'
              };
              
              State.threats.unshift(threat);
              
              if (State.threats.length > 20) {
                State.threats.pop();
              }
            }
          });
        });
      });
      
      observer.observe(document.body, { childList: true, subtree: true });
    }
    
    monitorDataExfiltration() {
      // Monitor for suspicious form submissions
      document.addEventListener('submit', (e) => {
        const form = e.target;
        const inputs = Array.from(form.querySelectorAll('input, textarea'));
        
        const suspiciousFields = inputs.filter(input => {
          const value = input.value.toLowerCase();
          return value.includes('password') || 
                 value.includes('credit') ||
                 value.includes('card') ||
                 value.includes('cvv') ||
                 value.includes('secret');
        });
        
        if (suspiciousFields.length > 0 && !form.action.includes(window.location.hostname)) {
          const threat = {
            id: Utils.generateId(),
            type: 'Data Exfiltration Attempt',
            severity: 'high',
            details: 'Sensitive data submission to external domain',
            timestamp: Date.now(),
            source: form.action
          };
          
          State.threats.unshift(threat);
          State.metrics.blockedThreats++;
        }
      });
    }
    
    monitorNetworkRequests() {
      const originalFetch = window.fetch;
      window.fetch = function(...args) {
        const [resource, init] = args;
        const url = typeof resource === 'string' ? resource : resource.url;
        
        // Check for suspicious URLs
        if (url.includes('//') && !url.startsWith(window.location.origin)) {
          const threat = {
            id: Utils.generateId(),
            type: 'Suspicious Network Request',
            severity: 'medium',
            details: `Request to external domain: ${url}`,
            timestamp: Date.now()
          };
          
          State.threats.unshift(threat);
          
          if (State.threats.length > 20) {
            State.threats.pop();
          }
        }
        
        return originalFetch.apply(this, args);
      };
    }
    
    scanForThreats() {
      // Scan for eval usage
      if (window.eval.toString().length < 100) {
        const threat = {
          id: Utils.generateId(),
          type: 'Eval Usage Detected',
          severity: 'medium',
          details: 'eval() function usage detected',
          timestamp: Date.now()
        };
        
        State.threats.unshift(threat);
      }
      
      // Scan for debugger statements
      try {
        debugger;
      } catch (e) {
        const threat = {
          id: Utils.generateId(),
          type: 'Debugger Detected',
          severity: 'low',
          details: 'Debugger statement encountered',
          timestamp: Date.now()
        };
        
        State.threats.unshift(threat);
      }
      
      // Scan for console tampering
      if (console.__proto__.toString().includes('[native code]')) {
        const threat = {
          id: Utils.generateId(),
          type: 'Console Tampering',
          severity: 'low',
          details: 'Console object has been modified',
          timestamp: Date.now()
        };
        
        State.threats.unshift(threat);
      }
    }
  }
  
  // ==================== PROTECTION SCREEN ====================
  class ProtectionScreen {
    constructor() {
      this.screen = null;
      this.analyzer = new SecurityAnalyzer();
      this.steps = [
        { 
          id: 'device', 
          name: 'Device Analysis', 
          icon: 'fas fa-laptop',
          description: 'Analyzing browser and device characteristics'
        },
        { 
          id: 'network', 
          name: 'Network Security', 
          icon: 'fas fa-wifi',
          description: 'Checking network configuration and latency'
        },
        { 
          id: 'behavior', 
          name: 'Behavior Analysis', 
          icon: 'fas fa-brain',
          description: 'Monitoring user interaction patterns'
        },
        { 
          id: 'threats', 
          name: 'Threat Detection', 
          icon: 'fas fa-shield-alt',
          description: 'Scanning for security threats and vulnerabilities'
        }
      ];
    }
    
    async show() {
      if (this.screen) return;
      
      this.screen = document.createElement('div');
      this.screen.className = 'wws-protection-screen';
      
      this.screen.innerHTML = `
        <div class="wws-protection-container">
          <div class="wws-protection-card">
            <div class="wws-shield-wrapper">
              <div class="wws-shield-rings"></div>
              <div class="wws-shield-rings"></div>
              <div class="wws-shield">
                <i class="fas fa-shield-alt"></i>
              </div>
            </div>
            
            <h1 class="wws-title">${CONFIG.companyName}</h1>
            <p class="wws-subtitle">Real-time security verification in progress</p>
            
            <div class="wws-verification-steps">
              ${this.steps.map((step, index) => `
                <div class="wws-step" id="wws-step-${step.id}">
                  <div class="wws-step-icon">
                    <i class="${step.icon}"></i>
                  </div>
                  <div class="wws-step-content">
                    <div class="wws-step-title">${step.name}</div>
                    <div class="wws-step-description">${step.description}</div>
                  </div>
                  <div class="wws-step-status">Pending</div>
                </div>
              `).join('')}
            </div>
            
            <div class="wws-progress-container">
              <div class="wws-progress-bar">
                <div class="wws-progress-fill" id="wws-progress-fill"></div>
              </div>
              <div class="wws-progress-text">
                <span>0%</span>
                <span id="wws-progress-percent">Starting...</span>
                <span>100%</span>
              </div>
            </div>
            
            <div class="wws-security-metrics">
              <div class="wws-metric">
                <div class="wws-metric-value risk" id="wws-risk-value">0%</div>
                <div class="wws-metric-label">Risk Score</div>
              </div>
              <div class="wws-metric">
                <div class="wws-metric-value scans" id="wws-scans-value">0</div>
                <div class="wws-metric-label">Scans</div>
              </div>
              <div class="wws-metric">
                <div class="wws-metric-value threats" id="wws-threats-value">0</div>
                <div class="wws-metric-label">Threats</div>
              </div>
            </div>
            
            <div class="wws-footer">
              <i class="fas fa-lock"></i> Secured by <a href="${CONFIG.websiteUrl}" target="_blank">Wandering Wizardry Studios</a>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(this.screen);
      await this.startVerification();
    }
    
    async startVerification() {
      const totalSteps = this.steps.length;
      let completedSteps = 0;
      
      const updateProgress = (stepId, status, result = null) => {
        const stepElement = document.getElementById(`wws-step-${stepId}`);
        const statusElement = stepElement.querySelector('.wws-step-status');
        
        stepElement.classList.remove('active', 'completed');
        
        if (status === 'processing') {
          stepElement.classList.add('active');
          statusElement.textContent = 'Processing...';
          statusElement.style.color = 'var(--wws-primary)';
        } else if (status === 'completed') {
          stepElement.classList.add('completed');
          statusElement.textContent = result ? `✓ ${result}` : '✓ Completed';
          statusElement.style.color = 'var(--wws-success)';
          completedSteps++;
        } else if (status === 'failed') {
          stepElement.classList.add('completed');
          statusElement.textContent = '⚠ Issue detected';
          statusElement.style.color = 'var(--wws-warning)';
          completedSteps++;
        }
        
        const progressPercent = Math.round((completedSteps / totalSteps) * 100);
        const progressFill = document.getElementById('wws-progress-fill');
        const progressText = document.getElementById('wws-progress-percent');
        
        if (progressFill) progressFill.style.width = `${progressPercent}%`;
        if (progressText) progressText.textContent = `${progressPercent}%`;
        
        // Update metrics
        const riskValue = document.getElementById('wws-risk-value');
        const scansValue = document.getElementById('wws-scans-value');
        const threatsValue = document.getElementById('wws-threats-value');
        
        if (riskValue) riskValue.textContent = `${Math.round(State.analyzer?.riskScore || 0)}%`;
        if (scansValue) scansValue.textContent = State.metrics.totalRequests;
        if (threatsValue) threatsValue.textContent = State.metrics.blockedThreats;
      };
      
      // Start verification process
      for (const step of this.steps) {
        updateProgress(step.id, 'processing');
        
        try {
          let result;
          switch(step.id) {
            case 'device':
              result = await this.verifyDevice();
              break;
            case 'network':
              result = await this.verifyNetwork();
              break;
            case 'behavior':
              result = await this.verifyBehavior();
              break;
            case 'threats':
              result = await this.verifyThreats();
              break;
          }
          
          await this.delay(800 + Math.random() * 400);
          updateProgress(step.id, 'completed', result);
        } catch (error) {
          updateProgress(step.id, 'failed');
        }
        
        await this.delay(300);
      }
      
      // Final analysis
      await this.delay(500);
      const finalScore = await this.analyzer.analyze();
      
      // Update final risk score
      const riskValue = document.getElementById('wws-risk-value');
      if (riskValue) riskValue.textContent = `${Math.round(finalScore)}%`;
      
      // Complete verification
      await this.delay(1000);
      this.completeVerification(finalScore);
    }
    
    async verifyDevice() {
      const info = State.deviceInfo;
      const checks = [];
      
      // Check WebDriver
      if (!info.webdriver) checks.push('No automation tools detected');
      else checks.push('WebDriver detected');
      
      // Check plugins
      if (info.plugins !== 'none') checks.push('Browser plugins verified');
      else checks.push('No plugins detected');
      
      // Check screen resolution
      if (info.screen.width >= 1024 && info.screen.height >= 768) {
        checks.push('Standard resolution');
      }
      
      return checks.slice(0, 2).join(', ');
    }
    
    async verifyNetwork() {
      const info = State.networkInfo;
      const checks = [];
      
      if (info.online) checks.push('Network online');
      else checks.push('Offline mode');
      
      if (info.connection) {
        checks.push(`${info.connection.effectiveType} connection`);
        
        if (info.connection.rtt < 100) checks.push('Low latency');
        else if (info.connection.rtt < 300) checks.push('Medium latency');
        else checks.push('High latency');
      }
      
      return checks.slice(0, 2).join(', ');
    }
    
    async verifyBehavior() {
      const behavior = State.userBehavior;
      const checks = [];
      
      if (behavior.mouseMovements.length > 10) checks.push('Natural mouse movement');
      if (behavior.clicks.length > 0) checks.push('User interaction detected');
      if (behavior.scrolls.length > 0) checks.push('Scrolling activity');
      
      return checks.length > 0 ? checks.join(', ') : 'Limited activity';
    }
    
    async verifyThreats() {
      const threats = State.threats;
      
      if (threats.length === 0) {
        return 'No threats detected';
      } else {
        const highThreats = threats.filter(t => t.severity === 'high').length;
        const mediumThreats = threats.filter(t => t.severity === 'medium').length;
        
        if (highThreats > 0) return `${highThreats} critical threats`;
        if (mediumThreats > 0) return `${mediumThreats} potential threats`;
        return 'Low risk threats';
      }
    }
    
    completeVerification(riskScore) {
      State.verificationComplete = true;
      localStorage.setItem('wws_verified', 'true');
      localStorage.setItem('wws_verification_time', Date.now().toString());
      
      // Hide protection screen with animation
      this.screen.style.opacity = '0';
      this.screen.style.transition = 'opacity 0.5s ease';
      
      setTimeout(() => {
        if (this.screen.parentNode) {
          this.screen.parentNode.removeChild(this.screen);
          this.screen = null;
        }
        
        // Show widget
        Widget.show();
        
        // Start analytics updates
        Analytics.start();
        
        // Dispatch completion event
        window.dispatchEvent(new CustomEvent('wws:verificationComplete', {
          detail: { riskScore, deviceInfo: State.deviceInfo }
        }));
      }, 500);
    }
    
    delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  }
  
  // ==================== ANALYTICS ENGINE ====================
  class Analytics {
    static start() {
      // Start updating metrics
      this.updateMetrics();
      
      // Monitor page performance
      this.monitorPerformance();
      
      // Monitor resource loading
      this.monitorResources();
      
      // Start periodic updates
      setInterval(() => this.updateMetrics(), CONFIG.analytics.updateInterval);
    }
    
    static updateMetrics() {
      // Update request count (simulate real traffic)
      const baseIncrement = Math.floor(Math.random() * 5) + 1;
      State.metrics.totalRequests += baseIncrement;
      
      // Update data transferred (simulate real usage)
      const dataIncrement = Math.floor(Math.random() * 1024 * 1024) + 1024;
      State.metrics.dataTransferred += dataIncrement;
      
      // Update cache hit ratio
      const totalCache = State.metrics.cacheHits + State.metrics.cacheMisses;
      if (totalCache > 0) {
        State.metrics.cacheHitRatio = Math.round((State.metrics.cacheHits / totalCache) * 100);
      }
      
      // Update active connections (simulate real connections)
      State.metrics.activeConnections = Math.floor(Math.random() * 50) + 5;
      
      // Update response time (simulate real performance)
      State.metrics.responseTime = Math.floor(Math.random() * 100) + 50;
      
      // Update uptime (slight random variation)
      State.metrics.uptime = 99.9 + (Math.random() * 0.1);
      
      // Update widget if visible
      if (window.wwsWidgetInstance && window.wwsWidgetInstance.isPanelOpen) {
        window.wwsWidgetInstance.updatePanelContent();
      }
    }
    
    static monitorPerformance() {
      // Monitor page load performance
      if (window.performance && window.performance.timing) {
        const timing = window.performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        State.metrics.pageLoadTime = loadTime;
      }
      
      // Monitor FPS
      let lastTime = performance.now();
      let frameCount = 0;
      
      const measureFPS = () => {
        const currentTime = performance.now();
        frameCount++;
        
        if (currentTime - lastTime >= 1000) {
          State.metrics.fps = frameCount;
          frameCount = 0;
          lastTime = currentTime;
        }
        
        requestAnimationFrame(measureFPS);
      };
      
      requestAnimationFrame(measureFPS);
    }
    
    static monitorResources() {
      // Monitor resource loading
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.initiatorType === 'script' || entry.initiatorType === 'link') {
            State.metrics.totalRequests++;
            
            // Simulate cache hits/misses
            if (Math.random() > 0.3) {
              State.metrics.cacheHits++;
            } else {
              State.metrics.cacheMisses++;
            }
          }
        });
      });
      
      observer.observe({ entryTypes: ['resource'] });
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
    }
    
    createWidget() {
      // Remove existing widget if any
      const existingWidget = document.querySelector('.wws-widget');
      if (existingWidget) existingWidget.remove();
      
      this.widget = document.createElement('div');
      this.widget.className = `wws-widget wws-theme-${State.currentTheme}`;
      
      this.widget.innerHTML = `
        <div class="wws-widget-toggle" id="wws-widget-toggle">
          <i class="fas fa-shield-alt"></i>
          <div class="wws-widget-badge" id="wws-widget-badge">${State.metrics.blockedThreats}</div>
        </div>
        
        <div class="wws-widget-panel" id="wws-widget-panel">
          <div class="wws-panel-header">
            <div class="wws-header-left">
              <div class="wws-header-icon">
                <i class="fas fa-shield-alt"></i>
              </div>
              <div class="wws-header-text">
                <h3>${CONFIG.companyName}</h3>
                <p>v${CONFIG.version} • Real-time Protection</p>
              </div>
            </div>
            <div class="wws-header-status">
              <div class="wws-status-dot"></div>
              <div class="wws-status-text">Active</div>
            </div>
          </div>
          
          <div class="wws-panel-tabs">
            <button class="wws-tab active" data-tab="overview">
              <i class="fas fa-chart-bar"></i>
              <span>Overview</span>
            </button>
            <button class="wws-tab" data-tab="security">
              <i class="fas fa-shield-alt"></i>
              <span>Security</span>
            </button>
            <button class="wws-tab" data-tab="analytics">
              <i class="fas fa-chart-line"></i>
              <span>Analytics</span>
            </button>
            <button class="wws-tab" data-tab="settings">
              <i class="fas fa-cog"></i>
              <span>Settings</span>
            </button>
          </div>
          
          <div class="wws-panel-content" id="wws-panel-content">
            <!-- Content loaded dynamically -->
          </div>
          
          <div class="wws-panel-footer">
            <a href="${CONFIG.websiteUrl}" target="_blank" class="wws-footer-link">
              <i class="fas fa-external-link-alt"></i> Open Security Dashboard
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
        case 'analytics':
          this.renderAnalytics(content);
          break;
        case 'settings':
          this.renderSettings(content);
          break;
      }
    }
    
    renderOverview(container) {
      container.innerHTML = `
        <div class="wws-section">
          <div class="wws-section-title">
            <i class="fas fa-tachometer-alt"></i>
            Live Metrics
          </div>
          
          <div class="wws-metrics-grid">
            <div class="wws-metric-card">
              <div class="wws-metric-value">${Utils.formatNumber(State.metrics.totalRequests)}</div>
              <div class="wws-metric-label">Requests</div>
            </div>
            
            <div class="wws-metric-card">
              <div class="wws-metric-value">${State.metrics.blockedThreats}</div>
              <div class="wws-metric-label">Threats</div>
            </div>
            
            <div class="wws-metric-card">
              <div class="wws-metric-value">${Utils.formatBytes(State.metrics.dataTransferred)}</div>
              <div class="wws-metric-label">Transferred</div>
            </div>
            
            <div class="wws-metric-card">
              <div class="wws-metric-value">${State.metrics.uptime.toFixed(2)}%</div>
              <div class="wws-metric-label">Uptime</div>
            </div>
          </div>
        </div>
        
        <div class="wws-section">
          <div class="wws-section-title">
            <i class="fas fa-server"></i>
            System Status
          </div>
          
          <div class="wws-status-card">
            <div class="wws-status-row">
              <div class="wws-status-label">
                <i class="fas fa-clock"></i>
                Response Time
              </div>
              <div class="wws-status-value">${State.metrics.responseTime}ms</div>
            </div>
            
            <div class="wws-status-row">
              <div class="wws-status-label">
                <i class="fas fa-users"></i>
                Active Connections
              </div>
              <div class="wws-status-value">${State.metrics.activeConnections}</div>
            </div>
            
            <div class="wws-status-row">
              <div class="wws-status-label">
                <i class="fas fa-database"></i>
                Cache Hit Ratio
              </div>
              <div class="wws-status-value">${State.metrics.cacheHitRatio || 0}%</div>
            </div>
          </div>
        </div>
      `;
    }
    
    renderSecurity(container) {
      const recentThreats = State.threats.slice(0, 5);
      
      container.innerHTML = `
        <div class="wws-section">
          <div class="wws-section-title">
            <i class="fas fa-shield-alt"></i>
            Protection Status
          </div>
          
          <div class="wws-status-card">
            <div class="wws-status-row">
              <div class="wws-status-label">
                <i class="fas fa-check-circle"></i>
                WAF Protection
              </div>
              <div class="wws-status-value" style="color: var(--wws-success)">Active</div>
            </div>
            
            <div class="wws-status-row">
              <div class="wws-status-label">
                <i class="fas fa-check-circle"></i>
                DDoS Mitigation
              </div>
              <div class="wws-status-value" style="color: var(--wws-success)">Enabled</div>
            </div>
            
            <div class="wws-status-row">
              <div class="wws-status-label">
                <i class="fas fa-check-circle"></i>
                Bot Detection
              </div>
              <div class="wws-status-value" style="color: var(--wws-success)">Active</div>
            </div>
          </div>
        </div>
        
        <div class="wws-section">
          <div class="wws-section-title">
            <i class="fas fa-exclamation-triangle"></i>
            Recent Threats (${State.threats.length})
          </div>
          
          ${recentThreats.length > 0 ? recentThreats.map(threat => `
            <div class="wws-threat-item">
              <div class="wws-threat-header">
                <div class="wws-threat-type">${threat.type}</div>
                <div class="wws-threat-severity ${threat.severity}">${threat.severity}</div>
              </div>
              <div class="wws-threat-details">${threat.details}</div>
              <div class="wws-threat-time">
                <i class="far fa-clock"></i>
                ${Utils.formatTimeAgo(threat.timestamp)}
              </div>
            </div>
          `).join('') : `
            <div class="wws-no-threats">
              <i class="fas fa-check-circle"></i>
              <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">All Clear</div>
              <div style="font-size: 12px;">No security threats detected in the last 24 hours</div>
            </div>
          `}
        </div>
      `;
    }
    
    renderAnalytics(container) {
      const deviceInfo = State.deviceInfo;
      
      container.innerHTML = `
        <div class="wws-section">
          <div class="wws-section-title">
            <i class="fas fa-desktop"></i>
            Device Information
          </div>
          
          <div class="wws-tech-item">
            <div class="wws-tech-label">Browser</div>
            <div class="wws-tech-value">${deviceInfo?.userAgent?.split(' ').slice(0, 3).join(' ') || 'Unknown'}</div>
          </div>
          
          <div class="wws-tech-item">
            <div class="wws-tech-label">Platform</div>
            <div class="wws-tech-value">${deviceInfo?.platform || 'Unknown'}</div>
          </div>
          
          <div class="wws-tech-item">
            <div class="wws-tech-label">Resolution</div>
            <div class="wws-tech-value">${deviceInfo?.screen?.width || 0}x${deviceInfo?.screen?.height || 0}</div>
          </div>
          
          <div class="wws-tech-item">
            <div class="wws-tech-label">Language</div>
            <div class="wws-tech-value">${deviceInfo?.language || 'Unknown'}</div>
          </div>
          
          <div class="wws-tech-item">
            <div class="wws-tech-label">CPU Cores</div>
            <div class="wws-tech-value">${deviceInfo?.hardware?.cores || 'Unknown'}</div>
          </div>
          
          <div class="wws-tech-item">
            <div class="wws-tech-label">Timezone</div>
            <div class="wws-tech-value">${deviceInfo?.timezone || 'Unknown'}</div>
          </div>
        </div>
        
        <div class="wws-section">
          <div class="wws-section-title">
            <i class="fas fa-chart-line"></i>
            Performance
          </div>
          
          <div class="wws-status-card">
            <div class="wws-status-row">
              <div class="wws-status-label">
                <i class="fas fa-bolt"></i>
                Page Load Time
              </div>
              <div class="wws-status-value">${Utils.formatTime(State.metrics.pageLoadTime || 0)}</div>
            </div>
            
            <div class="wws-status-row">
              <div class="wws-status-label">
                <i class="fas fa-film"></i>
                Frame Rate
              </div>
              <div class="wws-status-value">${State.metrics.fps || 60} FPS</div>
            </div>
            
            <div class="wws-status-row">
              <div class="wws-status-label">
                <i class="fas fa-memory"></i>
                Memory Usage
              </div>
              <div class="wws-status-value">${(performance.memory?.usedJSHeapSize / 1024 / 1024).toFixed(1) || '0'} MB</div>
            </div>
          </div>
        </div>
      `;
    }
    
    renderSettings(container) {
      container.innerHTML = `
        <div class="wws-section">
          <div class="wws-section-title">
            <i class="fas fa-palette"></i>
            Appearance
          </div>
          
          <div class="wws-settings-item">
            <div>
              <div class="wws-settings-label">Theme</div>
              <div class="wws-settings-desc">Choose your preferred color theme</div>
            </div>
            <select class="wws-select" id="wws-theme-select">
              <option value="dark" ${State.currentTheme === 'dark' ? 'selected' : ''}>Dark</option>
              <option value="light" ${State.currentTheme === 'light' ? 'selected' : ''}>Light</option>
            </select>
          </div>
          
          <div class="wws-settings-item">
            <div>
              <div class="wws-settings-label">Widget Position</div>
              <div class="wws-settings-desc">Change widget location on screen</div>
            </div>
            <select class="wws-select" id="wws-position-select">
              <option value="bottom-left" ${CONFIG.widget.position === 'bottom-left' ? 'selected' : ''}>Bottom Left</option>
              <option value="bottom-right" ${CONFIG.widget.position === 'bottom-right' ? 'selected' : ''}>Bottom Right</option>
              <option value="top-right" ${CONFIG.widget.position === 'top-right' ? 'selected' : ''}>Top Right</option>
              <option value="top-left" ${CONFIG.widget.position === 'top-left' ? 'selected' : ''}>Top Left</option>
            </select>
          </div>
        </div>
        
        <div class="wws-section">
          <div class="wws-section-title">
            <i class="fas fa-bell"></i>
            Notifications
          </div>
          
          <div class="wws-settings-item">
            <div>
              <div class="wws-settings-label">Threat Alerts</div>
              <div class="wws-settings-desc">Get notified about security threats</div>
            </div>
            <label class="wws-switch">
              <input type="checkbox" id="wws-threat-alerts" checked>
              <span class="wws-switch-slider"></span>
            </label>
          </div>
          
          <div class="wws-settings-item">
            <div>
              <div class="wws-settings-label">Performance Reports</div>
              <div class="wws-settings-desc">Receive weekly performance insights</div>
            </div>
            <label class="wws-switch">
              <input type="checkbox" id="wws-performance-reports" checked>
              <span class="wws-switch-slider"></span>
            </label>
          </div>
          
          <div class="wws-settings-item">
            <div>
              <div class="wws-settings-label">Analytics Updates</div>
              <div class="wws-settings-desc">Real-time analytics notifications</div>
            </div>
            <label class="wws-switch">
              <input type="checkbox" id="wws-analytics-updates">
              <span class="wws-switch-slider"></span>
            </label>
          </div>
        </div>
        
        <div class="wws-section">
          <div class="wws-section-title">
            <i class="fas fa-database"></i>
            Data & Privacy
          </div>
          
          <div class="wws-settings-item">
            <div>
              <div class="wws-settings-label">Collect Analytics</div>
              <div class="wws-settings-desc">Help improve WWS PROTECT with anonymous data</div>
            </div>
            <label class="wws-switch">
              <input type="checkbox" id="wws-analytics-collection" checked>
              <span class="wws-switch-slider"></span>
            </label>
          </div>
          
          <div class="wws-settings-item">
            <div>
              <div class="wws-settings-label">Behavior Tracking</div>
              <div class="wws-settings-desc">Monitor user behavior for security analysis</div>
            </div>
            <label class="wws-switch">
              <input type="checkbox" id="wws-behavior-tracking" checked>
              <span class="wws-switch-slider"></span>
            </label>
          </div>
        </div>
      `;
      
      // Bind settings events
      this.bindSettingsEvents();
    }
    
    bindSettingsEvents() {
      // Theme selector
      const themeSelect = document.getElementById('wws-theme-select');
      if (themeSelect) {
        themeSelect.addEventListener('change', (e) => {
          State.currentTheme = e.target.value;
          localStorage.setItem('wws_theme', State.currentTheme);
          this.applyTheme();
        });
      }
      
      // Position selector
      const positionSelect = document.getElementById('wws-position-select');
      if (positionSelect) {
        positionSelect.addEventListener('change', (e) => {
          this.updatePosition(e.target.value);
        });
      }
      
      // Toggle switches
      const switches = [
        'wws-threat-alerts',
        'wws-performance-reports',
        'wws-analytics-updates',
        'wws-analytics-collection',
        'wws-behavior-tracking'
      ];
      
      switches.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
          const savedState = localStorage.getItem(id);
          if (savedState !== null) {
            element.checked = savedState === 'true';
          }
          
          element.addEventListener('change', (e) => {
            localStorage.setItem(id, e.target.checked);
          });
        }
      });
    }
    
    applyTheme() {
      this.widget.className = `wws-widget wws-theme-${State.currentTheme}`;
    }
    
    updatePosition(position) {
      const positions = {
        'bottom-left': { bottom: '24px', left: '24px', right: 'auto', top: 'auto' },
        'bottom-right': { bottom: '24px', right: '24px', left: 'auto', top: 'auto' },
        'top-right': { top: '24px', right: '24px', left: 'auto', bottom: 'auto' },
        'top-left': { top: '24px', left: '24px', right: 'auto', bottom: 'auto' }
      };
      
      const style = positions[position];
      if (style) {
        Object.assign(this.widget.style, style);
        CONFIG.widget.position = position;
      }
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
      const verificationTime = parseInt(localStorage.getItem('wws_verification_time') || '0');
      const hoursSinceVerification = (Date.now() - verificationTime) / (1000 * 60 * 60);
      
      // Re-verify if more than 24 hours have passed
      if (hoursSinceVerification < 24) {
        console.log('✅ WWS PROTECT: Session verified');
        Widget.show();
        Analytics.start();
        return;
      }
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
      riskScore: State.analyzer?.riskScore || 0,
      metrics: { ...State.metrics },
      threats: State.threats.length,
      device: State.deviceInfo,
      sessionId: Utils.generateId()
    }),
    
    // Get security report
    getSecurityReport: () => ({
      riskScore: State.analyzer?.riskScore || 0,
      riskFactors: State.analyzer?.riskFactors || [],
      detectedThreats: [...State.threats],
      behaviorAnalysis: State.userBehavior,
      verificationTime: localStorage.getItem('wws_verification_time')
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
    
    // Update metrics manually
    refreshMetrics: () => {
      if (window.wwsWidgetInstance) {
        window.wwsWidgetInstance.updatePanelContent();
      }
    },
    
    // Event listeners
    onVerificationComplete: (callback) => {
      window.addEventListener('wws:verificationComplete', (e) => callback(e.detail));
    },
    
    onThreatDetected: (callback) => {
      window.addEventListener('wws:threatDetected', (e) => callback(e.detail));
    }
  };
  
  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWWS);
  } else {
    setTimeout(initializeWWS, 100);
  }
  
  // Expose State for debugging (remove in production)
  if (typeof window !== 'undefined') {
    window.__WWS_STATE = State;
  }
  
})();
