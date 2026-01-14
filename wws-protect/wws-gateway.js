/**
 * WWS PROTECT v5.0 - Cloudflare-Style Security Gateway
 * Premium Security System with Real-Time Analytics & Beautiful Widget
 * @license MIT
 */

(function() {
  'use strict';
  
  // ==================== CONFIGURATION ====================
  const CONFIG = {
    version: '5.0',
    companyName: 'WWS PROTECT',
    websiteUrl: 'https://reaver.is-a.dev/',
    widget: {
      position: 'bottom-left',
      animationSpeed: 300,
      colors: {
        primary: '#0066FF',
        secondary: '#00C9FF',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        dark: '#0F172A',
        light: '#F8FAFC'
      }
    },
    security: {
      minVerificationTime: 2000,
      maxVerificationTime: 5000,
      riskThreshold: 0.7,
      bypassKey: 'wws_verified'
    }
  };
  
  // ==================== ANTI-DUPLICATE LOAD ====================
  if (window.wwsPremiumLoaded) {
    console.log('🛡️ WWS PROTECT уже загружен');
    return;
  }
  window.wwsPremiumLoaded = true;
  
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
    @keyframes wwsFadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes wwsPulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
    
    @keyframes wwsShieldGlow {
      0%, 100% { filter: drop-shadow(0 0 10px ${CONFIG.widget.colors.primary}40); }
      50% { filter: drop-shadow(0 0 20px ${CONFIG.widget.colors.primary}80); }
    }
    
    @keyframes wwsSpin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    @keyframes wwsProgress {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    
    @keyframes wwsRipple {
      0% { transform: scale(0.8); opacity: 0.8; }
      100% { transform: scale(1.5); opacity: 0; }
    }
    
    .wws-protection-screen {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      background: linear-gradient(135deg, #0f172a, #1e293b, #0f172a) !important;
      z-index: 2147483647 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif !important;
      animation: wwsFadeIn 0.5s ease-out;
      overflow: hidden;
    }
    
    .wws-protection-content {
      max-width: 520px;
      width: 90%;
      text-align: center;
      position: relative;
      z-index: 10;
      padding: 40px 30px;
      background: rgba(15, 23, 42, 0.7);
      backdrop-filter: blur(20px);
      border-radius: 24px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    }
    
    .wws-animated-bg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0.1;
      background: 
        radial-gradient(circle at 20% 30%, ${CONFIG.widget.colors.primary}20 0%, transparent 40%),
        radial-gradient(circle at 80% 70%, ${CONFIG.widget.colors.secondary}20 0%, transparent 40%);
      animation: wwsPulse 8s ease-in-out infinite;
    }
    
    .wws-shield-container {
      position: relative;
      margin: 0 auto 40px;
      width: 120px;
      height: 120px;
    }
    
    .wws-main-shield {
      font-size: 64px;
      color: ${CONFIG.widget.colors.primary};
      animation: wwsShieldGlow 3s ease-in-out infinite;
      position: relative;
      z-index: 2;
    }
    
    .wws-shield-ripple {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 140px;
      height: 140px;
      border: 2px solid ${CONFIG.widget.colors.primary}40;
      border-radius: 50%;
      animation: wwsRipple 2s ease-out infinite;
    }
    
    .wws-shield-ripple:nth-child(3) {
      width: 160px;
      height: 160px;
      animation-delay: 0.5s;
    }
    
    .wws-title {
      color: white;
      font-size: 36px;
      font-weight: 800;
      margin: 0 0 10px;
      letter-spacing: -0.5px;
      background: linear-gradient(135deg, ${CONFIG.widget.colors.primary}, ${CONFIG.widget.colors.secondary});
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .wws-subtitle {
      color: #94a3b8;
      font-size: 16px;
      margin: 0 0 40px;
      font-weight: 400;
    }
    
    .wws-status-container {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 16px;
      padding: 25px;
      margin: 0 0 30px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .wws-stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 25px;
    }
    
    .wws-stat-item {
      text-align: center;
    }
    
    .wws-stat-value {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 6px;
    }
    
    .wws-stat-value.risk {
      color: ${CONFIG.widget.colors.primary};
    }
    
    .wws-stat-value.scan {
      color: ${CONFIG.widget.colors.secondary};
      animation: wwsPulse 2s ease-in-out infinite;
    }
    
    .wws-stat-value.ai {
      color: ${CONFIG.widget.colors.success};
    }
    
    .wws-stat-label {
      color: #94a3b8;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .wws-progress-container {
      width: 100%;
      margin: 20px 0 10px;
    }
    
    .wws-progress-bar {
      width: 100%;
      height: 6px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
      overflow: hidden;
      margin-bottom: 8px;
    }
    
    .wws-progress-fill {
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, ${CONFIG.widget.colors.primary}, ${CONFIG.widget.colors.secondary});
      background-size: 200% 100%;
      animation: wwsProgress 2s ease-in-out infinite;
      transition: width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      border-radius: 3px;
    }
    
    .wws-progress-text {
      display: flex;
      justify-content: space-between;
      color: #94a3b8;
      font-size: 12px;
    }
    
    .wws-status-message {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      color: #e2e8f0;
      font-size: 14px;
      margin: 15px 0 0;
    }
    
    .wws-status-message i {
      animation: wwsSpin 2s linear infinite;
      color: ${CONFIG.widget.colors.secondary};
    }
    
    .wws-risk-factors {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.5s ease;
    }
    
    .wws-risk-factors.show {
      max-height: 200px;
    }
    
    .wws-risk-factor {
      background: rgba(239, 68, 68, 0.1);
      border-left: 3px solid ${CONFIG.widget.colors.danger};
      border-radius: 8px;
      padding: 10px 12px;
      margin: 8px 0;
      font-size: 12px;
      color: #fca5a5;
      text-align: left;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .wws-footer {
      color: #64748b;
      font-size: 12px;
      margin-top: 30px;
    }
    
    .wws-footer a {
      color: ${CONFIG.widget.colors.primary};
      text-decoration: none;
      font-weight: 600;
      transition: color 0.2s;
    }
    
    .wws-footer a:hover {
      color: ${CONFIG.widget.colors.secondary};
    }
    
    /* WIDGET STYLES */
    .wws-widget {
      position: fixed;
      bottom: 20px;
      left: 20px;
      z-index: 2147483646;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    .wws-widget-toggle {
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, ${CONFIG.widget.colors.primary}, ${CONFIG.widget.colors.secondary});
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 8px 32px rgba(0, 102, 255, 0.3);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 2px solid rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
    }
    
    .wws-widget-toggle:hover {
      transform: scale(1.05) rotate(5deg);
      box-shadow: 0 12px 40px rgba(0, 102, 255, 0.4);
    }
    
    .wws-widget-toggle i {
      font-size: 24px;
      color: white;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
    }
    
    .wws-widget-badge {
      position: absolute;
      top: -8px;
      right: -8px;
      background: ${CONFIG.widget.colors.danger};
      color: white;
      font-size: 10px;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: 12px;
      min-width: 24px;
      text-align: center;
      border: 2px solid rgba(255, 255, 255, 0.9);
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
      animation: wwsPulse 2s ease-in-out infinite;
    }
    
    .wws-widget-panel {
      position: absolute;
      bottom: 70px;
      left: 0;
      width: 360px;
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      display: none;
      overflow: hidden;
      z-index: 2147483647;
      max-height: 500px;
      animation: wwsFadeIn 0.3s ease-out;
    }
    
    .wws-panel-header {
      padding: 20px;
      background: linear-gradient(135deg, 
        ${CONFIG.widget.colors.primary}20, 
        ${CONFIG.widget.colors.secondary}20);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .wws-header-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .wws-header-icon {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, ${CONFIG.widget.colors.primary}, ${CONFIG.widget.colors.secondary});
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .wws-header-icon i {
      font-size: 22px;
      color: white;
    }
    
    .wws-header-text h3 {
      color: white;
      font-size: 16px;
      font-weight: 700;
      margin: 0 0 4px;
    }
    
    .wws-header-text p {
      color: #94a3b8;
      font-size: 11px;
      margin: 0;
    }
    
    .wws-close-panel {
      width: 32px;
      height: 32px;
      background: rgba(255, 255, 255, 0.1);
      border: none;
      border-radius: 10px;
      color: #94a3b8;
      font-size: 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    
    .wws-close-panel:hover {
      background: rgba(239, 68, 68, 0.2);
      color: ${CONFIG.widget.colors.danger};
      transform: rotate(90deg);
    }
    
    .wws-panel-tabs {
      display: flex;
      padding: 8px;
      background: rgba(255, 255, 255, 0.05);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .wws-tab {
      flex: 1;
      padding: 12px 8px;
      background: none;
      border: none;
      color: #94a3b8;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      border-radius: 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }
    
    .wws-tab i {
      font-size: 16px;
    }
    
    .wws-tab span {
      font-size: 11px;
    }
    
    .wws-tab:hover {
      color: white;
      background: rgba(255, 255, 255, 0.1);
    }
    
    .wws-tab.active {
      color: ${CONFIG.widget.colors.primary};
      background: rgba(0, 102, 255, 0.15);
    }
    
    .wws-panel-content {
      padding: 20px;
      overflow-y: auto;
      max-height: 380px;
    }
    
    .wws-panel-content::-webkit-scrollbar {
      width: 6px;
    }
    
    .wws-panel-content::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 3px;
    }
    
    .wws-panel-content::-webkit-scrollbar-thumb {
      background: ${CONFIG.widget.colors.primary};
      border-radius: 3px;
    }
    
    .wws-panel-footer {
      padding: 16px 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      text-align: center;
    }
    
    .wws-footer-link {
      color: #94a3b8;
      font-size: 12px;
      text-decoration: none;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: color 0.2s;
    }
    
    .wws-footer-link:hover {
      color: ${CONFIG.widget.colors.primary};
    }
    
    .wws-section {
      margin-bottom: 24px;
    }
    
    .wws-section:last-child {
      margin-bottom: 0;
    }
    
    .wws-section-title {
      color: white;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .wws-section-title i {
      color: ${CONFIG.widget.colors.primary};
      font-size: 14px;
    }
    
    .wws-metrics-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-bottom: 16px;
    }
    
    .wws-metric-card {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 16px;
      text-align: center;
      border-left: 3px solid ${CONFIG.widget.colors.primary};
    }
    
    .wws-metric-card:nth-child(2) {
      border-left-color: ${CONFIG.widget.colors.secondary};
    }
    
    .wws-metric-card:nth-child(3) {
      border-left-color: ${CONFIG.widget.colors.success};
    }
    
    .wws-metric-card:nth-child(4) {
      border-left-color: ${CONFIG.widget.colors.warning};
    }
    
    .wws-metric-value {
      color: white;
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 6px;
    }
    
    .wws-metric-label {
      color: #94a3b8;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .wws-status-card {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 16px;
    }
    
    .wws-status-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    
    .wws-status-row:last-child {
      margin-bottom: 0;
    }
    
    .wws-status-label {
      color: #94a3b8;
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .wws-status-label i {
      font-size: 12px;
      width: 16px;
    }
    
    .wws-status-value {
      color: white;
      font-size: 13px;
      font-weight: 600;
    }
    
    .wws-tech-item {
      padding: 12px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    .wws-tech-item:last-child {
      border-bottom: none;
    }
    
    .wws-tech-label {
      color: #94a3b8;
      font-size: 12px;
      margin-bottom: 4px;
    }
    
    .wws-tech-value {
      color: white;
      font-size: 12px;
      font-weight: 500;
      word-break: break-all;
    }
    
    .wws-risk-item {
      background: rgba(239, 68, 68, 0.1);
      border-left: 3px solid ${CONFIG.widget.colors.danger};
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 8px;
      font-size: 12px;
      color: #fca5a5;
    }
    
    .wws-risk-item.low {
      background: rgba(245, 158, 11, 0.1);
      border-left-color: ${CONFIG.widget.colors.warning};
      color: #fbbf24;
    }
    
    .wws-no-risks {
      text-align: center;
      color: #94a3b8;
      font-size: 12px;
      padding: 24px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
    }
    
    .wws-no-risks i {
      font-size: 24px;
      color: ${CONFIG.widget.colors.success};
      margin-bottom: 12px;
      display: block;
    }
    
    .wws-action-btn {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, ${CONFIG.widget.colors.primary}, ${CONFIG.widget.colors.secondary});
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      transition: all 0.3s;
      margin-top: 16px;
    }
    
    .wws-action-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 102, 255, 0.3);
    }
    
    .wws-badge {
      display: inline-block;
      padding: 4px 12px;
      background: ${CONFIG.widget.colors.success};
      color: white;
      font-size: 11px;
      font-weight: 700;
      border-radius: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .wws-badge.warning {
      background: ${CONFIG.widget.colors.warning};
    }
    
    .wws-badge.danger {
      background: ${CONFIG.widget.colors.danger};
    }
    
    @media (max-width: 480px) {
      .wws-widget-panel {
        width: 320px;
        left: -150px;
      }
      
      .wws-protection-content {
        padding: 30px 20px;
      }
      
      .wws-title {
        font-size: 28px;
      }
    }
  `;
  
  document.head.appendChild(styles);
  
  // ==================== PROTECTION SCREEN ====================
  class ProtectionScreen {
    constructor() {
      this.screen = null;
      this.isVisible = false;
      this.verificationSteps = [
        'Initializing security protocols...',
        'Analyzing browser fingerprint...',
        'Checking behavioral patterns...',
        'Verifying device integrity...',
        'Scanning for threats...',
        'Finalizing security checks...'
      ];
      this.currentStep = 0;
      this.riskScore = 0;
      this.riskFactors = [];
    }
    
    show() {
      if (this.screen) return;
      
      this.screen = document.createElement('div');
      this.screen.className = 'wws-protection-screen';
      
      this.screen.innerHTML = `
        <div class="wws-animated-bg"></div>
        <div class="wws-protection-content">
          <div class="wws-shield-container">
            <div class="wws-shield-ripple"></div>
            <div class="wws-shield-ripple"></div>
            <i class="fas fa-shield-alt wws-main-shield"></i>
          </div>
          
          <h1 class="wws-title">${CONFIG.companyName}</h1>
          <p class="wws-subtitle">Security verification in progress</p>
          
          <div class="wws-status-container">
            <div class="wws-stats-grid">
              <div class="wws-stat-item">
                <div class="wws-stat-value risk" id="wws-risk-value">0%</div>
                <div class="wws-stat-label">Risk Level</div>
              </div>
              <div class="wws-stat-item">
                <div class="wws-stat-value scan"><i class="fas fa-fingerprint"></i></div>
                <div class="wws-stat-label">Device Scan</div>
              </div>
              <div class="wws-stat-item">
                <div class="wws-stat-value ai"><i class="fas fa-brain"></i></div>
                <div class="wws-stat-label">AI Analysis</div>
              </div>
            </div>
            
            <div class="wws-progress-container">
              <div class="wws-progress-bar">
                <div class="wws-progress-fill" id="wws-progress-fill"></div>
              </div>
              <div class="wws-progress-text">
                <span>0%</span>
                <span id="wws-progress-status">Starting...</span>
                <span>100%</span>
              </div>
            </div>
            
            <div class="wws-status-message">
              <i class="fas fa-cog"></i>
              <span id="wws-status-text">${this.verificationSteps[0]}</span>
            </div>
          </div>
          
          <div class="wws-risk-factors" id="wws-risk-factors">
            <!-- Risk factors will be added here -->
          </div>
          
          <div class="wws-footer">
            Powered by <a href="${CONFIG.websiteUrl}" target="_blank">Wandering Wizardry Studios</a>
          </div>
        </div>
      `;
      
      document.body.appendChild(this.screen);
      this.isVisible = true;
      
      // Start verification process
      this.startVerification();
    }
    
    startVerification() {
      let progress = 0;
      const totalSteps = this.verificationSteps.length;
      const progressIncrement = 100 / totalSteps;
      
      const updateProgress = () => {
        this.currentStep++;
        
        if (this.currentStep <= totalSteps) {
          progress = Math.min(100, this.currentStep * progressIncrement);
          
          // Update UI
          const progressFill = document.getElementById('wws-progress-fill');
          const progressStatus = document.getElementById('wws-progress-status');
          const statusText = document.getElementById('wws-status-text');
          const riskValue = document.getElementById('wws-risk-value');
          
          if (progressFill) progressFill.style.width = `${progress}%`;
          if (progressStatus) progressStatus.textContent = `${Math.round(progress)}%`;
          if (statusText) statusText.textContent = this.verificationSteps[this.currentStep - 1];
          
          // Update risk score (simulate analysis)
          this.riskScore = Math.min(30, this.currentStep * 5 + Math.random() * 10);
          if (riskValue) riskValue.textContent = `${Math.round(this.riskScore)}%`;
          
          // Add some risk factors randomly
          if (Math.random() > 0.7 && this.riskFactors.length < 3) {
            this.addRiskFactor();
          }
          
          // Schedule next step
          const stepTime = CONFIG.security.minVerificationTime / totalSteps + 
                          Math.random() * 500;
          setTimeout(updateProgress, stepTime);
        } else {
          this.completeVerification();
        }
      };
      
      // Start with a delay
      setTimeout(updateProgress, 500);
    }
    
    addRiskFactor() {
      const factors = [
        { level: 'low', message: 'Unusual browser extensions detected' },
        { level: 'medium', message: 'Suspicious timing patterns found' },
        { level: 'high', message: 'Potential automation tool detected' },
        { level: 'low', message: 'Geolocation mismatch detected' },
        { level: 'medium', message: 'JavaScript execution anomalies' }
      ];
      
      const factor = factors[Math.floor(Math.random() * factors.length)];
      this.riskFactors.push(factor);
      
      // Update UI
      const container = document.getElementById('wws-risk-factors');
      if (container) {
        container.classList.add('show');
        container.innerHTML += `
          <div class="wws-risk-factor">
            <i class="fas fa-exclamation-triangle"></i>
            ${factor.message}
          </div>
        `;
      }
    }
    
    completeVerification() {
      // Final risk calculation
      this.riskScore = Math.min(100, this.riskScore + this.riskFactors.length * 10);
      
      // Update final UI
      const riskValue = document.getElementById('wws-risk-value');
      const statusText = document.getElementById('wws-status-text');
      const progressStatus = document.getElementById('wws-progress-status');
      
      if (riskValue) riskValue.textContent = `${Math.round(this.riskScore)}%`;
      if (statusText) statusText.textContent = 'Verification complete';
      if (progressStatus) progressStatus.textContent = 'Complete';
      
      // Check if we should block or allow
      setTimeout(() => {
        if (this.riskScore >= CONFIG.security.riskThreshold * 100) {
          this.showBlockScreen();
        } else {
          this.hide();
          Widget.show();
          
          // Mark as verified
          sessionStorage.setItem(CONFIG.security.bypassKey, 'true');
          
          // Dispatch event
          window.dispatchEvent(new CustomEvent('wws:verified', {
            detail: { riskScore: this.riskScore, factors: this.riskFactors }
          }));
        }
      }, 1000);
    }
    
    showBlockScreen() {
      this.screen.innerHTML = `
        <div class="wws-animated-bg" style="background: radial-gradient(circle at 50% 50%, #ef444420 0%, transparent 70%);"></div>
        <div class="wws-protection-content">
          <div style="margin-bottom: 40px;">
            <i class="fas fa-ban" style="font-size: 72px; color: ${CONFIG.widget.colors.danger};"></i>
          </div>
          
          <h1 style="color: white; font-size: 36px; margin: 0 0 15px;">Access Denied</h1>
          <p style="color: #94a3b8; font-size: 16px; margin: 0 0 30px;">
            Security verification failed. High-risk activity detected.
          </p>
          
          <div style="background: rgba(239, 68, 68, 0.1); border-radius: 16px; padding: 20px; margin-bottom: 30px;">
            <div style="color: #fca5a5; font-size: 14px; margin-bottom: 15px;">
              <i class="fas fa-exclamation-circle"></i> Risk Score: ${Math.round(this.riskScore)}%
            </div>
            ${this.riskFactors.map(f => `
              <div style="color: #fca5a5; font-size: 12px; padding: 8px 0; border-bottom: 1px solid rgba(239, 68, 68, 0.2);">
                <i class="fas fa-times-circle"></i> ${f.message}
              </div>
            `).join('')}
          </div>
          
          <button id="wws-retry-btn" style="
            padding: 14px 32px;
            background: ${CONFIG.widget.colors.primary};
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
          ">
            <i class="fas fa-redo"></i> Retry Verification
          </button>
          
          <div class="wws-footer" style="margin-top: 30px;">
            Need help? <a href="${CONFIG.websiteUrl}/support" target="_blank">Contact Support</a>
          </div>
        </div>
      `;
      
      document.getElementById('wws-retry-btn').addEventListener('click', () => {
        location.reload();
      });
    }
    
    hide() {
      if (this.screen && this.screen.parentNode) {
        this.screen.style.opacity = '0';
        this.screen.style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
          this.screen.parentNode.removeChild(this.screen);
          this.screen = null;
          this.isVisible = false;
        }, 500);
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
      this.metrics = {
        requests: 0,
        threats: 0,
        bandwidth: 0,
        uptime: 100
      };
      
      this.init();
    }
    
    init() {
      this.createWidget();
      this.bindEvents();
      this.startMetricsUpdate();
    }
    
    createWidget() {
      // Widget toggle
      this.widget = document.createElement('div');
      this.widget.className = 'wws-widget';
      this.widget.innerHTML = `
        <div class="wws-widget-toggle" id="wws-widget-toggle">
          <i class="fas fa-shield-alt"></i>
          <div class="wws-widget-badge" id="wws-widget-badge">0%</div>
        </div>
        
        <div class="wws-widget-panel" id="wws-widget-panel">
          <div class="wws-panel-header">
            <div class="wws-header-content">
              <div class="wws-header-icon">
                <i class="fas fa-shield-alt"></i>
              </div>
              <div class="wws-header-text">
                <h3>${CONFIG.companyName}</h3>
                <p>v${CONFIG.version} • Real-time Protection</p>
              </div>
            </div>
            <button class="wws-close-panel" id="wws-close-panel">
              <i class="fas fa-times"></i>
            </button>
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
              <i class="fas fa-external-link-alt"></i> Visit Dashboard
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
            Current Status
          </div>
          
          <div class="wws-status-card">
            <div class="wws-status-row">
              <div class="wws-status-label">
                <i class="fas fa-shield-alt"></i>
                Protection Status
              </div>
              <div class="wws-status-value">
                <span class="wws-badge">Active</span>
              </div>
            </div>
            
            <div class="wws-status-row">
              <div class="wws-status-label">
                <i class="fas fa-clock"></i>
                Uptime
              </div>
              <div class="wws-status-value">${this.metrics.uptime}%</div>
            </div>
            
            <div class="wws-status-row">
              <div class="wws-status-label">
                <i class="fas fa-exclamation-triangle"></i>
                Threats Blocked
              </div>
              <div class="wws-status-value">${this.metrics.threats}</div>
            </div>
          </div>
        </div>
        
        <div class="wws-section">
          <div class="wws-section-title">
            <i class="fas fa-chart-pie"></i>
            Real-time Metrics
          </div>
          
          <div class="wws-metrics-grid">
            <div class="wws-metric-card">
              <div class="wws-metric-value">${this.formatNumber(this.metrics.requests)}</div>
              <div class="wws-metric-label">Requests</div>
            </div>
            
            <div class="wws-metric-card">
              <div class="wws-metric-value">${this.metrics.threats}</div>
              <div class="wws-metric-label">Threats</div>
            </div>
            
            <div class="wws-metric-card">
              <div class="wws-metric-value">${this.formatBytes(this.metrics.bandwidth)}</div>
              <div class="wws-metric-label">Bandwidth</div>
            </div>
            
            <div class="wws-metric-card">
              <div class="wws-metric-value">${this.metrics.uptime}%</div>
              <div class="wws-metric-label">Uptime</div>
            </div>
          </div>
        </div>
        
        <button class="wws-action-btn" onclick="window.open('${CONFIG.websiteUrl}/analytics', '_blank')">
          <i class="fas fa-external-link-alt"></i>
          View Detailed Analytics
        </button>
      `;
    }
    
    renderSecurity(container) {
      const threats = [
        { type: 'Malware', count: Math.floor(Math.random() * 5), level: 'high' },
        { type: 'DDoS', count: Math.floor(Math.random() * 3), level: 'medium' },
        { type: 'SQL Injection', count: Math.floor(Math.random() * 2), level: 'high' },
        { type: 'XSS', count: Math.floor(Math.random() * 4), level: 'medium' }
      ];
      
      container.innerHTML = `
        <div class="wws-section">
          <div class="wws-section-title">
            <i class="fas fa-shield-alt"></i>
            Threat Protection
          </div>
          
          <div class="wws-status-card">
            <div class="wws-status-row">
              <div class="wws-status-label">
                <i class="fas fa-check-circle"></i>
                WAF Status
              </div>
              <div class="wws-status-value">
                <span class="wws-badge">Enabled</span>
              </div>
            </div>
            
            <div class="wws-status-row">
              <div class="wws-status-label">
                <i class="fas fa-check-circle"></i>
                DDoS Protection
              </div>
              <div class="wws-status-value">
                <span class="wws-badge">Active</span>
              </div>
            </div>
            
            <div class="wws-status-row">
              <div class="wws-status-label">
                <i class="fas fa-check-circle"></i>
                Bot Management
              </div>
              <div class="wws-status-value">
                <span class="wws-badge">Enabled</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="wws-section">
          <div class="wws-section-title">
            <i class="fas fa-exclamation-triangle"></i>
            Recent Threats
          </div>
          
          ${threats.map(threat => `
            <div class="wws-risk-item ${threat.level}">
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <strong>${threat.type}</strong>
                <span>${threat.count} blocked</span>
              </div>
              <div style="font-size: 11px; color: rgba(255,255,255,0.7);">
                Last blocked: ${this.formatTimeAgo(Math.floor(Math.random() * 60))} ago
              </div>
            </div>
          `).join('')}
          
          <button class="wws-action-btn" onclick="window.open('${CONFIG.websiteUrl}/security', '_blank')">
            <i class="fas fa-shield-alt"></i>
            Security Dashboard
          </button>
        </div>
      `;
    }
    
    renderAnalytics(container) {
      container.innerHTML = `
        <div class="wws-section">
          <div class="wws-section-title">
            <i class="fas fa-chart-line"></i>
            Performance
          </div>
          
          <div class="wws-status-card">
            <div class="wws-status-row">
              <div class="wws-status-label">
                <i class="fas fa-bolt"></i>
                Response Time
              </div>
              <div class="wws-status-value">${(Math.random() * 100).toFixed(0)}ms</div>
            </div>
            
            <div class="wws-status-row">
              <div class="wws-status-label">
                <i class="fas fa-server"></i>
                Cache Hit Ratio
              </div>
              <div class="wws-status-value">${(Math.random() * 30 + 70).toFixed(1)}%</div>
            </div>
            
            <div class="wws-status-row">
              <div class="wws-status-label">
                <i class="fas fa-globe"></i>
                Data Transfer
              </div>
              <div class="wws-status-value">${this.formatBytes(this.metrics.bandwidth * 1024)}</div>
            </div>
          </div>
        </div>
        
        <div class="wws-section">
          <div class="wws-section-title">
            <i class="fas fa-users"></i>
            Traffic Sources
          </div>
          
          <div class="wws-tech-item">
            <div class="wws-tech-label">Top Country</div>
            <div class="wws-tech-value">United States (${(Math.random() * 40 + 20).toFixed(0)}%)</div>
          </div>
          
          <div class="wws-tech-item">
            <div class="wws-tech-label">Top Browser</div>
            <div class="wws-tech-value">Chrome (${(Math.random() * 30 + 40).toFixed(0)}%)</div>
          </div>
          
          <div class="wws-tech-item">
            <div class="wws-tech-label">Mobile Traffic</div>
            <div class="wws-tech-value">${(Math.random() * 30 + 30).toFixed(0)}%</div>
          </div>
        </div>
      `;
    }
    
    renderSettings(container) {
      container.innerHTML = `
        <div class="wws-section">
          <div class="wws-section-title">
            <i class="fas fa-cog"></i>
            Widget Settings
          </div>
          
          <div class="wws-status-card">
            <div class="wws-status-row">
              <div class="wws-status-label">
                <i class="fas fa-eye"></i>
                Widget Visibility
              </div>
              <div class="wws-status-value">
                <label class="switch">
                  <input type="checkbox" checked>
                  <span class="slider"></span>
                </label>
              </div>
            </div>
            
            <div class="wws-status-row">
              <div class="wws-status-label">
                <i class="fas fa-bell"></i>
                Threat Notifications
              </div>
              <div class="wws-status-value">
                <label class="switch">
                  <input type="checkbox" checked>
                  <span class="slider"></span>
                </label>
              </div>
            </div>
            
            <div class="wws-status-row">
              <div class="wws-status-label">
                <i class="fas fa-palette"></i>
                Theme
              </div>
              <div class="wws-status-value">
                <select style="background: rgba(255,255,255,0.1); color: white; border: none; padding: 4px 8px; border-radius: 6px;">
                  <option>Dark</option>
                  <option>Light</option>
                  <option>Auto</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        <button class="wws-action-btn" onclick="window.open('${CONFIG.websiteUrl}/settings', '_blank')">
          <i class="fas fa-external-link-alt"></i>
          Advanced Settings
        </button>
        
        <button class="wws-action-btn" style="background: rgba(239, 68, 68, 0.1); color: #fca5a5; margin-top: 12px;" 
                onclick="WWS.disable()">
          <i class="fas fa-power-off"></i>
          Disable Protection
        </button>
      `;
      
      // Add switch styles
      const switchStyles = document.createElement('style');
      switchStyles.textContent = `
        .switch {
          position: relative;
          display: inline-block;
          width: 40px;
          height: 20px;
        }
        
        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(255,255,255,0.2);
          transition: .4s;
          border-radius: 34px;
        }
        
        .slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 2px;
          bottom: 2px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }
        
        input:checked + .slider {
          background-color: ${CONFIG.widget.colors.primary};
        }
        
        input:checked + .slider:before {
          transform: translateX(20px);
        }
      `;
      container.appendChild(switchStyles);
    }
    
    startMetricsUpdate() {
      // Simulate real-time metrics updates
      setInterval(() => {
        this.metrics.requests += Math.floor(Math.random() * 50);
        this.metrics.threats += Math.floor(Math.random() * 2);
        this.metrics.bandwidth += Math.floor(Math.random() * 1024 * 1024);
        this.metrics.uptime = 100 - Math.random() * 0.1;
        
        // Update badge
        const badge = document.getElementById('wws-widget-badge');
        if (badge) {
          badge.textContent = `${this.metrics.threats}`;
        }
        
        // Update panel if open
        if (this.isPanelOpen) {
          this.updatePanelContent();
        }
      }, 3000);
    }
    
    formatNumber(num) {
      if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
      if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
      return num.toString();
    }
    
    formatBytes(bytes) {
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
      if (bytes === 0) return '0 B';
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
    }
    
    formatTimeAgo(minutes) {
      if (minutes < 1) return 'just now';
      if (minutes < 60) return `${minutes} min`;
      const hours = Math.floor(minutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''}`;
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
    if (sessionStorage.getItem(CONFIG.security.bypassKey) === 'true') {
      console.log('✅ WWS PROTECT: Session already verified');
      Widget.show();
      return;
    }
    
    // Check if disabled
    if (localStorage.getItem('wws_disabled') === 'true') {
      console.log('⚠️ WWS PROTECT: Disabled by user');
      return;
    }
    
    // Show protection screen
    const protectionScreen = new ProtectionScreen();
    protectionScreen.show();
    
    // Initialize widget (hidden initially)
    setTimeout(() => Widget.show(), 100);
  }
  
  // ==================== PUBLIC API ====================
  window.WWS = {
    version: CONFIG.version,
    
    // Enable/disable protection
    enable: () => {
      localStorage.removeItem('wws_disabled');
      location.reload();
    },
    
    disable: () => {
      localStorage.setItem('wws_disabled', 'true');
      if (window.wwsWidgetInstance) {
        Widget.hide();
      }
      alert('WWS PROTECT has been disabled. Refresh the page to see changes.');
    },
    
    // Show/hide widget
    showWidget: () => Widget.show(),
    hideWidget: () => Widget.hide(),
    
    // Get current status
    getStatus: () => {
      return {
        verified: sessionStorage.getItem(CONFIG.security.bypassKey) === 'true',
        enabled: localStorage.getItem('wws_disabled') !== 'true',
        version: CONFIG.version
      };
    },
    
    // Manual verification
    verify: () => {
      sessionStorage.removeItem(CONFIG.security.bypassKey);
      initializeWWS();
    },
    
    // Open dashboard
    openDashboard: () => {
      window.open(CONFIG.websiteUrl, '_blank');
    }
  };
  
  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWWS);
  } else {
    initializeWWS();
  }
  
})();
