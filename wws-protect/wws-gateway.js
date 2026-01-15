/**
 * WWS Protect — All-in-One
 * Версия: 1.0.0
 * Описание: Чисто фронтенд защита от ботов в одном файле
 * Использование: <script src="wws-protect-full.js"></script>
 */

(function() {
    'use strict';

    class WWSProtect {
        constructor() {
            this.riskScore = 0;
            this.signals = [];
            this.behavioralData = {
                mouseMoves: [],
                clicks: [],
                scrolls: [],
                keypresses: [],
                focusChanges: [],
                startTime: Date.now()
            };
            this.dataCollectionActive = false;
            this.elements = {};
            
            this.config = {
                weights: {
                    webdriver: 40,
                    mouseJitter: 20,
                    clickInterval: 10,
                    scrollLinearity: 10,
                    keyboardSpeed: 10,
                    focusFrequency: 10,
                    automationUA: 15,
                    webGLAnomaly: 10,
                    audioContext: 5,
                    fonts: 5,
                    timezone: 3,
                    screenMismatch: 8,
                    touchSupport: 5
                },
                randomizeWeights: true
            };
            
            // Рандомизация весов (±20%)
            if (this.config.randomizeWeights) {
                Object.keys(this.config.weights).forEach(key => {
                    const variation = 0.2;
                    const base = this.config.weights[key];
                    this.config.weights[key] = base * (1 + (Math.random() * 2 - 1) * variation);
                });
            }
            
            // Создать DOM элементы при инициализации
            this.createElements();
            this.injectStyles();
        }

        /**
         * Создание всех DOM элементов
         */
        createElements() {
            // Экран защиты
            const screen = document.createElement('div');
            screen.id = 'wws-protect-screen';
            screen.innerHTML = `
                <div class="wws-protect-container">
                    <div class="wws-protect-spinner"></div>
                    <div class="wws-protect-title">WWS Protect</div>
                    <div class="wws-protect-status" id="wws-status-text">Анализ поведения...</div>
                    <div class="wws-progress-bar">
                        <div class="wws-progress-fill" id="wws-progress-fill"></div>
                    </div>
                    <div id="wws-protect-content"></div>
                </div>
            `;
            
            // Виджет риска
            const widget = document.createElement('div');
            widget.id = 'wws-protect-widget';
            widget.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span>WWS Protect</span>
                    <span id="wws-risk-value">0</span>
                </div>
                <div id="wws-risk-meter">
                    <div id="wws-risk-fill"></div>
                </div>
                <div id="wws-status">Safe</div>
                <div id="wws-timer"></div>
                <div class="wws-reasons" id="wws-reasons"></div>
            `;
            
            // Добавить в DOM
            document.body.appendChild(screen);
            document.body.appendChild(widget);
            
            // Сохранить ссылки
            this.elements = {
                screen,
                widget,
                content: document.getElementById('wws-protect-content'),
                statusText: document.getElementById('wws-status-text'),
                progressFill: document.getElementById('wws-progress-fill'),
                riskValue: document.getElementById('wws-risk-value'),
                riskFill: document.getElementById('wws-risk-fill'),
                status: document.getElementById('wws-status'),
                timer: document.getElementById('wws-timer'),
                reasons: document.getElementById('wws-reasons')
            };
        }

        /**
         * Внедрение CSS стилей
         */
        injectStyles() {
            const styles = `
                /* === WWS Protect Screen === */
                #wws-protect-screen {
                    position: fixed;
                    inset: 0;
                    background: #0a0a0a;
                    z-index: 999999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    transition: opacity 0.5s ease;
                }
                
                #wws-protect-screen.hidden {
                    opacity: 0;
                    pointer-events: none;
                }
                
                .wws-protect-container {
                    text-align: center;
                    color: #e0e0e0;
                    max-width: 500px;
                    padding: 2rem;
                }
                
                .wws-protect-spinner {
                    width: 60px;
                    height: 60px;
                    border: 3px solid #1a1a1a;
                    border-top-color: #00ff88;
                    border-radius: 50%;
                    animation: wws-spin 1s linear infinite;
                    margin: 0 auto 2rem;
                }
                
                @keyframes wws-spin {
                    to { transform: rotate(360deg); }
                }
                
                .wws-protect-title {
                    font-size: 1.5rem;
                    margin-bottom: 1rem;
                    color: #fff;
                }
                
                .wws-protect-status {
                    font-size: 0.9rem;
                    opacity: 0.8;
                    margin-bottom: 2rem;
                }
                
                .wws-progress-bar {
                    width: 100%;
                    height: 4px;
                    background: #1a1a1a;
                    border-radius: 2px;
                    overflow: hidden;
                    margin-bottom: 1rem;
                }
                
                .wws-progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #00ff88, #00cc6a);
                    width: 0%;
                    transition: width 0.3s ease;
                }
                
                /* === Risk Widget === */
                #wws-protect-widget {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: rgba(0, 0, 0, 0.9);
                    backdrop-filter: blur(10px);
                    color: #fff;
                    padding: 1rem;
                    border-radius: 8px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    font-size: 0.8rem;
                    z-index: 999998;
                    min-width: 200px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    display: none;
                }
                
                #wws-protect-widget.visible {
                    display: block;
                }
                
                #wws-risk-meter {
                    width: 100%;
                    height: 6px;
                    background: #1a1a1a;
                    border-radius: 3px;
                    overflow: hidden;
                    margin: 0.5rem 0;
                }
                
                #wws-risk-fill {
                    height: 100%;
                    width: 0%;
                    transition: width 0.5s ease, background 0.3s ease;
                }
                
                .wws-risk-low { background: #00ff88; }
                .wws-risk-medium { background: #ffaa00; }
                .wws-risk-high { background: #ff4444; }
                
                #wws-status {
                    font-weight: 600;
                    margin: 0.5rem 0;
                }
                
                #wws-timer {
                    font-size: 0.7rem;
                    opacity: 0.8;
                }
                
                .wws-reasons {
                    font-size: 0.7rem;
                    opacity: 0.7;
                    margin-top: 0.5rem;
                    max-height: 60px;
                    overflow-y: auto;
                }
                
                /* === Verification Screen === */
                .wws-verification-container {
                    background: #1a1a1a;
                    padding: 2rem;
                    border-radius: 12px;
                    border: 1px solid #333;
                }
                
                .wws-verification-title {
                    font-size: 1.2rem;
                    margin-bottom: 1.5rem;
                    color: #fff;
                }
                
                .wws-verification-task {
                    margin: 1.5rem 0;
                }
                
                .wws-btn {
                    background: #00ff88;
                    color: #000;
                    border: none;
                    padding: 0.75rem 2rem;
                    border-radius: 6px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .wws-btn:hover {
                    background: #00cc6a;
                    transform: translateY(-1px);
                }
                
                .wws-btn:active {
                    transform: translateY(0);
                }
                
                /* === Drag & Drop === */
                #wws-drag-area {
                    width: 300px;
                    height: 200px;
                    background: #0a0a0a;
                    border: 2px dashed #444;
                    border-radius: 8px;
                    position: relative;
                    margin: 1rem auto;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                #wws-drag-object {
                    width: 60px;
                    height: 60px;
                    background: radial-gradient(circle, #00ff88, #00cc6a);
                    border-radius: 50%;
                    cursor: grab;
                    position: absolute;
                    box-shadow: 0 4px 15px rgba(0, 255, 136, 0.3);
                    transition: transform 0.1s;
                    left: 50%;
                    top: 50%;
                    transform: translate(-50%, -50%);
                }
                
                #wws-drag-object.dragging {
                    cursor: grabbing;
                    transform: scale(1.1);
                }
                
                /* === Hold Button === */
                #wws-hold-button {
                    width: 200px;
                    height: 60px;
                    background: #1a1a1a;
                    border: 2px solid #444;
                    border-radius: 8px;
                    color: #fff;
                    font-size: 1rem;
                    cursor: pointer;
                    position: relative;
                    overflow: hidden;
                }
                
                #wws-hold-button:active {
                    border-color: #00ff88;
                }
                
                #wws-hold-progress {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    height: 4px;
                    background: #00ff88;
                    width: 0%;
                    transition: width 0.1s linear;
                }
                
                /* === Canvas Game === */
                #wws-canvas-game {
                    width: 300px;
                    height: 250px;
                    background: #0a0a0a;
                    border: 2px solid #333;
                    border-radius: 8px;
                    display: block;
                    margin: 1rem auto;
                    cursor: crosshair;
                }
                
                /* === Block Screen === */
                .wws-block-timer {
                    font-size: 2rem;
                    font-weight: bold;
                    color: #ff4444;
                    margin: 1.5rem 0;
                }
                
                .wws-block-reasons {
                    text-align: left;
                    background: #1a1a1a;
                    padding: 1rem;
                    border-radius: 6px;
                    margin: 1rem 0;
                    font-size: 0.85rem;
                }
            `;
            
            const styleSheet = document.createElement('style');
            styleSheet.id = 'wws-protect-styles';
            styleSheet.textContent = styles;
            document.head.appendChild(styleSheet);
        }

        /**
         * Инициализация защиты
         */
        async init() {
            console.log('[WWS Protect] Инициализация...');
            
            // Проверка блокировки
            const blockedUntil = localStorage.getItem('wwsProtectBlockedUntil');
            if (blockedUntil && Date.now() < parseInt(blockedUntil)) {
                this.showBlockScreen(parseInt(blockedUntil));
                return;
            }
            
            // Начать сбор данных
            this.startDataCollection();
            
            // Собрать fingerprint
            await this.collectFingerprint();
            
            // Показать прогресс
            this.updateProgress(30);
            
            // Собрать поведенческие данные (2 секунды)
            await this.wait(2000);
            this.updateProgress(60);
            
            // Рассчитать риск
            this.calculateRiskScore();
            this.updateProgress(90);
            
            // Принять решение
            this.makeDecision();
            this.updateProgress(100);
        }

        /**
         * Старт сбора поведенческих данных
         */
        startDataCollection() {
            if (this.dataCollectionActive) return;
            this.dataCollectionActive = true;

            // Mouse tracking
            let lastMove = Date.now();
            let lastX = 0, lastY = 0;
            
            document.addEventListener('mousemove', (e) => {
                const now = Date.now();
                const deltaTime = now - lastMove;
                const deltaX = e.clientX - lastX;
                const deltaY = e.clientY - lastY;
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                const velocity = distance / deltaTime;
                const angle = Math.atan2(deltaY, deltaX);
                
                this.behavioralData.mouseMoves.push({
                    x: e.clientX,
                    y: e.clientY,
                    time: now,
                    deltaTime,
                    velocity,
                    angle,
                    isTrusted: e.isTrusted
                });
                
                lastX = e.clientX;
                lastY = e.clientY;
                lastMove = now;
            }, true);

            // Click tracking
            let lastClickTime = 0;
            document.addEventListener('click', (e) => {
                const now = Date.now();
                const interval = now - lastClickTime;
                
                this.behavioralData.clicks.push({
                    x: e.clientX,
                    y: e.clientY,
                    time: now,
                    interval: interval,
                    isTrusted: e.isTrusted
                });
                
                lastClickTime = now;
            }, true);

            // Scroll tracking
            let lastScrollTime = 0;
            let lastScrollY = 0;
            
            window.addEventListener('scroll', () => {
                const now = Date.now();
                const deltaY = window.scrollY - lastScrollY;
                const velocity = deltaY / (now - lastScrollTime);
                
                this.behavioralData.scrolls.push({
                    y: window.scrollY,
                    time: now,
                    deltaY,
                    velocity
                });
                
                lastScrollY = window.scrollY;
                lastScrollTime = now;
            }, true);

            // Keyboard tracking
            let lastKeyTime = 0;
            document.addEventListener('keydown', (e) => {
                const now = Date.now();
                const interval = now - lastKeyTime;
                
                this.behavioralData.keypresses.push({
                    key: e.key,
                    time: now,
                    interval: interval
                });
                
                lastKeyTime = now;
            }, true);

            // Focus tracking
            document.addEventListener('visibilitychange', () => {
                this.behavioralData.focusChanges.push({
                    hidden: document.hidden,
                    time: Date.now()
                });
            });

            // Idle time
            let idleTimer;
            const resetIdle = () => {
                clearTimeout(idleTimer);
                idleTimer = setTimeout(() => {
                    this.behavioralData.idleTime = (Date.now() - this.behavioralData.startTime) / 1000;
                }, 3000);
            };
            
            document.addEventListener('mousemove', resetIdle);
            document.addEventListener('keydown', resetIdle);
            resetIdle();
        }

        /**
         * Сбор fingerprint данных
         */
        async collectFingerprint() {
            const fp = {};

            // 1. WebDriver check
            fp.webdriver = navigator.webdriver || false;

            // 2. UserAgent анализ
            const ua = navigator.userAgent.toLowerCase();
            fp.userAgent = navigator.userAgent;
            fp.automationUA = /headless|phantomjs|selenium|puppeteer|playwright/.test(ua);

            // 3. Screen данные
            fp.screenWidth = screen.width;
            fp.screenHeight = screen.height;
            fp.windowWidth = window.innerWidth;
            fp.windowHeight = window.innerHeight;
            fp.devicePixelRatio = window.devicePixelRatio;
            fp.screenMismatch = Math.abs(screen.width - window.innerWidth) > 100;

            // 4. Timezone
            try {
                fp.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                fp.timezoneOffset = new Date().getTimezoneOffset();
            } catch (e) {
                fp.timezone = 'unknown';
            }

            // 5. WebGL
            try {
                const canvas = document.createElement('canvas');
                const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                if (gl) {
                    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                    fp.webGLVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
                    fp.webGLRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                    fp.webGLAnomaly = /Mesa|SwiftShader|Google|llvmpipe/.test(fp.webGLRenderer);
                }
            } catch (e) {
                fp.webGLAnomaly = true;
            }

            // 6. AudioContext
            try {
                const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                fp.audioContext = audioCtx.destination.channelInterpretation === 'speakers';
                await audioCtx.close();
            } catch (e) {
                fp.audioContext = false;
            }

            // 7. Fonts enumeration
            const fontList = [
                'Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 'Georgia',
                'Impact', 'Times New Roman', 'Trebuchet MS', 'Verdana', 'Segoe UI'
            ];
            
            const testFonts = (font) => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const testString = 'abcdefghijklmnopqrstuvwxyz0123456789';
                const baseFont = 'monospace';
                
                canvas.width = 100;
                canvas.height = 30;
                
                ctx.font = `16px ${baseFont}`;
                const baseWidth = ctx.measureText(testString).width;
                
                ctx.font = `16px ${font}, ${baseFont}`;
                const fontWidth = ctx.measureText(testString).width;
                
                return baseWidth !== fontWidth;
            };
            
            fp.fonts = fontList.filter(testFonts);
            fp.fontCount = fp.fonts.length;

            // 8. Touch support
            fp.touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

            // 9. Permissions API
            try {
                const permissions = await navigator.permissions.query({ name: 'notifications' });
                fp.permissionsState = permissions.state;
            } catch (e) {
                fp.permissionsState = 'unsupported';
            }

            // 10. Language
            fp.language = navigator.language;
            fp.languages = navigator.languages || [navigator.language];

            // 11. Platform
            fp.platform = navigator.platform;
            fp.hardwareConcurrency = navigator.hardwareConcurrency || 1;

            this.fingerprint = fp;
            console.log('[WWS Protect] Fingerprint:', fp);
        }

        /**
         * Расчет риск-скора
         */
        calculateRiskScore() {
            let score = 0;
            this.signals = [];

            // Проверка webdriver
            if (this.fingerprint.webdriver) {
                score += this.config.weights.webdriver;
                this.signals.push('Обнаружен WebDriver');
            }

            // Аномальный UserAgent
            if (this.fingerprint.automationUA) {
                score += this.config.weights.automationUA;
                this.signals.push('Подозрительный UserAgent');
            }

            // WebGL аномалия
            if (this.fingerprint.webGLAnomaly) {
                score += this.config.weights.webGLAnomaly;
                this.signals.push('Аномальный WebGL renderer');
            }

            // Анализ поведения мыши
            if (this.behavioralData.mouseMoves.length > 0) {
                const jitters = this.calculateMouseJitter();
                if (jitters.avgJitter < 0.2) {
                    score += this.config.weights.mouseJitter;
                    this.signals.push('Слишком плавное движение мыши');
                }
                if (jitters.automationRate > 0.3) {
                    score += 15;
                    this.signals.push('События мыши без isTrusted');
                }
            } else {
                score += 25;
                this.signals.push('Отсутствуют события мыши');
            }

            // Анализ кликов
            if (this.behavioralData.clicks.length > 1) {
                const intervals = this.behavioralData.clicks.slice(1).map((c, i) => c.interval);
                const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
                const stdDev = this.calculateStdDev(intervals);
                
                if (stdDev < 15) {
                    score += this.config.weights.clickInterval;
                    this.signals.push('Регулярные интервалы кликов');
                }
                if (avgInterval < 100) {
                    score += this.config.weights.clickInterval / 2;
                    this.signals.push('Слишком быстрые клики');
                }
            } else if (this.behavioralData.clicks.length === 0) {
                score += 15;
                this.signals.push('Нет кликов');
            }

            // Анализ скролла
            if (this.behavioralData.scrolls.length > 0) {
                const linearity = this.calculateScrollLinearity();
                if (linearity.isLinear) {
                    score += this.config.weights.scrollLinearity;
                    this.signals.push('Линейная прокрутка');
                }
            }

            // Анализ клавиатуры
            if (this.behavioralData.keypresses.length > 5) {
                const intervals = this.behavioralData.keypresses.slice(1).map(k => k.interval);
                const avgSpeed = intervals.reduce((a, b) => a + b, 0) / intervals.length;
                
                if (avgSpeed < 30) {
                    score += this.config.weights.keyboardSpeed;
                    this.signals.push('Сверхбыстрая печать');
                }
                if (this.isTooUniform(intervals)) {
                    score += this.config.weights.keyboardSpeed / 2;
                    this.signals.push('Равномерные интервалы печати');
                }
            }

            // Анализ фокуса
            if (this.behavioralData.focusChanges.length > 5) {
                score += this.config.weights.focusFrequency;
                this.signals.push('Частые потери фокуса');
            }

            // Screen mismatch
            if (this.fingerprint.screenMismatch) {
                score += this.config.weights.screenMismatch;
                this.signals.push('Несоответствие размеров экрана');
            }

            // AudioContext
            if (!this.fingerprint.audioContext) {
                score += this.config.weights.audioContext;
                this.signals.push('AudioContext недоступен');
            }

            // Fonts
            if (this.fingerprint.fontCount < 3) {
                score += this.config.weights.fonts;
                this.signals.push('Мало системных шрифтов');
            }

            // Touch support
            if (this.fingerprint.touchSupport && !this.behavioralData.mouseMoves.length) {
                score += this.config.weights.touchSupport;
                this.signals.push('Touch без mouse событий');
            }

            // Ограничение 0-100
            this.riskScore = Math.min(100, Math.round(score));
            
            console.log('[WWS Protect] Risk Score:', this.riskScore);
            console.log('[WWS Protect] Signals:', this.signals);
        }

        /**
         * Расчет джиттера мыши
         */
        calculateMouseJitter() {
            const moves = this.behavioralData.mouseMoves;
            if (moves.length < 2) return { avgJitter: 1, automationRate: 0 };

            let jitters = [];
            let automationEvents = 0;

            for (let i = 1; i < moves.length; i++) {
                const prev = moves[i - 1];
                const curr = moves[i];
                
                const angleDiff = Math.abs(curr.angle - prev.angle);
                const velocityDiff = Math.abs(curr.velocity - prev.velocity);
                
                const jitter = angleDiff / (velocityDiff + 0.001);
                jitters.push(jitter);

                if (!curr.isTrusted) automationEvents++;
            }

            const avgJitter = jitters.reduce((a, b) => a + b, 0) / jitters.length;
            const automationRate = automationEvents / moves.length;

            return { avgJitter, automationRate };
        }

        /**
         * Расчет линейности скролла
         */
        calculateScrollLinearity() {
            const scrolls = this.behavioralData.scrolls;
            if (scrolls.length < 3) return { isLinear: false };

            const velocities = scrolls.map(s => s.velocity);
            const stdDev = this.calculateStdDev(velocities);
            
            const isLinear = stdDev < 0.1 && Math.abs(velocities[0]) > 0;
            
            return { isLinear, stdDev };
        }

        /**
         * Расчет стандартного отклонения
         */
        calculateStdDev(arr) {
            const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
            const variance = arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length;
            return Math.sqrt(variance);
        }

        /**
         * Проверка на слишком равномерные интервалы
         */
        isTooUniform(arr) {
            if (arr.length < 3) return false;
            const stdDev = this.calculateStdDev(arr);
            const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
            return (stdDev / mean) < 0.1;
        }

        /**
         * Принятие решения по доступу
         */
        makeDecision() {
            this.updateWidget();
            
            if (this.riskScore <= 30) {
                this.allowAccess();
            } else if (this.riskScore <= 65) {
                this.requestVerification();
            } else {
                this.blockAccess();
            }
        }

        /**
         * Разрешить доступ
         */
        allowAccess() {
            console.log('[WWS Protect] ✅ Доступ разрешен');
            this.hideScreen();
            this.updateStatus('Safe');
        }

        /**
         * Запросить верификацию
         */
        requestVerification() {
            console.log('[WWS Protect] ⚠ Требуется верификация');
            this.updateStatus('Suspicious');
            this.showVerificationScreen();
        }

        /**
         * Блокировать доступ
         */
        blockAccess() {
            console.log('[WWS Protect] 🚫 Доступ заблокирован');
            this.updateStatus('Blocked');
            
            const blockDuration = 5 * 60 * 1000;
            const blockedUntil = Date.now() + blockDuration;
            localStorage.setItem('wwsProtectBlockedUntil', blockedUntil);
            
            this.showBlockScreen(blockedUntil);
        }

        /**
         * Показать экран верификации
         */
        showVerificationScreen() {
            const tasks = ['dragdrop', 'hold', 'canvas', 'pattern'];
            const task = tasks[Math.floor(Math.random() * tasks.length)];
            
            switch(task) {
                case 'dragdrop':
                    this.elements.content.innerHTML = `
                        <div class="wws-verification-container">
                            <div class="wws-verification-title">Перетащите круг в зону</div>
                            <div id="wws-drag-area">
                                <div id="wws-drag-object"></div>
                            </div>
                            <div class="wws-verification-task">
                                <small>Перетащите зеленый круг в правый верхний угол</small>
                            </div>
                        </div>
                    `;
                    this.setupDragDrop();
                    break;
                    
                case 'hold':
                    this.elements.content.innerHTML = `
                        <div class="wws-verification-container">
                            <div class="wws-verification-title">Удерживайте кнопку</div>
                            <div class="wws-verification-task">
                                <button id="wws-hold-button">
                                    Удерживайте 3 секунды
                                    <div id="wws-hold-progress"></div>
                                </button>
                            </div>
                            <div style="margin-top: 1rem;">
                                <small>Чтобы подтвердить, что вы человек</small>
                            </div>
                        </div>
                    `;
                    this.setupHoldButton();
                    break;
                    
                case 'canvas':
                    this.elements.content.innerHTML = `
                        <div class="wws-verification-container">
                            <div class="wws-verification-title">Кликните по цели</div>
                            <canvas id="wws-canvas-game"></canvas>
                            <div class="wws-verification-task">
                                <small>Кликните по движущемуся кружку</small>
                            </div>
                        </div>
                    `;
                    this.setupCanvasGame();
                    break;
                    
                case 'pattern':
                    this.elements.content.innerHTML = `
                        <div class="wws-verification-container">
                            <div class="wws-verification-title">Нажмите на красные круги</div>
                            <div id="wws-pattern-game" style="width: 300px; height: 200px; margin: 1rem auto; position: relative; background: #0a0a0a; border: 1px solid #333; border-radius: 8px;"></div>
                            <div class="wws-verification-task">
                                <small id="wws-pattern-counter">Нажато: 0/5</small>
                            </div>
                        </div>
                    `;
                    this.setupPatternGame();
                    break;
            }
        }

        /**
         * Drag & Drop верификация
         */
        setupDragDrop() {
            const obj = document.getElementById('wws-drag-object');
            const area = document.getElementById('wws-drag-area');
            let isDragging = false;
            let startX, startY, currentX, currentY;
            
            obj.addEventListener('mousedown', (e) => {
                isDragging = true;
                obj.classList.add('dragging');
                startX = e.clientX - obj.offsetLeft;
                startY = e.clientY - obj.offsetTop;
                e.preventDefault();
            });
            
            document.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                
                currentX = e.clientX - startX;
                currentY = e.clientY - startY;
                
                const maxX = area.clientWidth - obj.clientWidth;
                const maxY = area.clientHeight - obj.clientHeight;
                
                currentX = Math.max(0, Math.min(currentX, maxX));
                currentY = Math.max(0, Math.min(currentY, maxY));
                
                obj.style.left = currentX + 'px';
                obj.style.top = currentY + 'px';
            });
            
            document.addEventListener('mouseup', () => {
                if (!isDragging) return;
                
                isDragging = false;
                obj.classList.remove('dragging');
                
                // Проверка успешности (правый верхний угол)
                const areaRect = area.getBoundingClientRect();
                const objRect = obj.getBoundingClientRect();
                
                const thresholdX = areaRect.width * 0.7;
                const thresholdY = areaRect.height * 0.3;
                
                if (currentX > thresholdX && currentY < thresholdY) {
                    this.completeVerification();
                } else {
                    obj.style.left = '50%';
                    obj.style.top = '50%';
                    obj.style.transform = 'translate(-50%, -50%)';
                }
            });
        }

        /**
         * Hold button верификация
         */
        setupHoldButton() {
            const btn = document.getElementById('wws-hold-button');
            const progress = document.getElementById('wws-hold-progress');
            let holdStart = 0;
            let holdInterval;
            const requiredMs = 3000;
            
            btn.addEventListener('mousedown', (e) => {
                e.preventDefault();
                holdStart = Date.now();
                
                holdInterval = setInterval(() => {
                    const elapsed = Date.now() - holdStart;
                    const percent = Math.min(100, (elapsed / requiredMs) * 100);
                    progress.style.width = percent + '%';
                    
                    if (elapsed >= requiredMs) {
                        clearInterval(holdInterval);
                        this.completeVerification();
                    }
                }, 50);
            });
            
            btn.addEventListener('mouseup', () => {
                clearInterval(holdInterval);
                progress.style.width = '0%';
                holdStart = 0;
            });
            
            btn.addEventListener('mouseleave', () => {
                clearInterval(holdInterval);
                progress.style.width = '0%';
                holdStart = 0;
            });
        }

        /**
         * Canvas game верификация
         */
        setupCanvasGame() {
            const canvas = document.getElementById('wws-canvas-game');
            const ctx = canvas.getContext('2d');
            canvas.width = 300;
            canvas.height = 250;
            
            let target = {
                x: Math.random() * (canvas.width - 40) + 20,
                y: Math.random() * (canvas.height - 40) + 20,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                radius: 20
            };
            
            let animationId;
            let clicked = false;
            
            const animate = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                target.x += target.vx;
                target.y += target.vy;
                
                if (target.x - target.radius <= 0 || target.x + target.radius >= canvas.width) {
                    target.vx = -target.vx;
                }
                if (target.y - target.radius <= 0 || target.y + target.radius >= canvas.height) {
                    target.vy = -target.vy;
                }
                
                ctx.beginPath();
                ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
                ctx.fillStyle = '#ff4444';
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                animationId = requestAnimationFrame(animate);
            };
            
            animate();
            
            canvas.addEventListener('click', (e) => {
                if (clicked) return;
                
                const rect = canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const distance = Math.sqrt(Math.pow(x - target.x, 2) + Math.pow(y - target.y, 2));
                
                if (distance <= target.radius) {
                    clicked = true;
                    cancelAnimationFrame(animationId);
                    this.completeVerification();
                }
            });
        }

        /**
         * Pattern game верификация
         */
        setupPatternGame() {
            const container = document.getElementById('wws-pattern-game');
            let clickedCount = 0;
            const requiredClicks = 5;
            
            for (let i = 0; i < 10; i++) {
                const circle = document.createElement('div');
                circle.style.position = 'absolute';
                circle.style.width = '30px';
                circle.style.height = '30px';
                circle.style.borderRadius = '50%';
                circle.style.cursor = 'pointer';
                circle.style.left = Math.random() * (container.offsetWidth - 30) + 'px';
                circle.style.top = Math.random() * (container.offsetHeight - 30) + 'px';
                
                const isRed = Math.random() > 0.6;
                circle.style.background = isRed ? '#ff4444' : '#4444ff';
                circle.dataset.red = isRed;
                circle.style.border = '2px solid #fff';
                circle.style.boxSizing = 'border-box';
                
                circle.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (e.target.dataset.clicked === 'true') return;
                    
                    e.target.dataset.clicked = 'true';
                    e.target.style.opacity = '0.3';
                    e.target.style.pointerEvents = 'none';
                    
                    if (e.target.dataset.red === 'true') {
                        clickedCount++;
                        document.getElementById('wws-pattern-counter').textContent = `Нажато: ${clickedCount}/${requiredClicks}`;
                        
                        if (clickedCount >= requiredClicks) {
                            setTimeout(() => this.completeVerification(), 300);
                        }
                    } else {
                        setTimeout(() => {
                            container.querySelectorAll('[data-clicked="true"]').forEach(el => {
                                if (el.dataset.red === 'true') {
                                    el.dataset.clicked = 'false';
                                    el.style.opacity = '1';
                                    el.style.pointerEvents = 'auto';
                                }
                            });
                            clickedCount = 0;
                            document.getElementById('wws-pattern-counter').textContent = `Нажато: 0/${requiredClicks}`;
                        }, 500);
                    }
                });
                
                container.appendChild(circle);
            }
        }

        /**
         * Успешная верификация
         */
        completeVerification() {
            console.log('[WWS Protect] Верификация пройдена');
            this.riskScore = Math.max(0, this.riskScore - 30);
            this.allowAccess();
        }

        /**
         * Показать экран блокировки
         */
        showBlockScreen(blockedUntil) {
            this.elements.statusText.textContent = 'Обнаружена подозрительная активность';
            
            const remaining = Math.ceil((blockedUntil - Date.now()) / 1000);
            
            this.elements.content.innerHTML = `
                <div class="wws-verification-container">
                    <div style="text-align: center;">
                        <div style="font-size: 4rem; margin-bottom: 1rem;">🚫</div>
                        <div class="wws-block-timer">${this.formatTime(remaining)}</div>
                        <p style="margin-bottom: 1rem;">Повторная попытка через</p>
                        <div class="wws-block-reasons">
                            <strong>Возможные причины:</strong><br>
                            ${this.signals.slice(0, 3).map(s => `• ${s}`).join('<br>')}
                        </div>
                    </div>
                </div>
            `;
            
            const timerInterval = setInterval(() => {
                const now = Date.now();
                if (now >= blockedUntil) {
                    clearInterval(timerInterval);
                    localStorage.removeItem('wwsProtectBlockedUntil');
                    location.reload();
                    return;
                }
                
                const remaining = Math.ceil((blockedUntil - now) / 1000);
                const timerEl = document.querySelector('.wws-block-timer');
                if (timerEl) timerEl.textContent = this.formatTime(remaining);
            }, 1000);
        }

        /**
         * Скрыть защитный экран
         */
        hideScreen() {
            this.elements.screen.classList.add('hidden');
            
            setTimeout(() => {
                this.elements.screen.style.display = 'none';
            }, 500);
        }

        /**
         * Обновить прогресс
         */
        updateProgress(percent) {
            if (this.elements.progressFill) {
                this.elements.progressFill.style.width = percent + '%';
            }
        }

        /**
         * Обновить виджет риска
         */
        updateWidget() {
            this.elements.widget.classList.add('visible');
            this.elements.riskValue.textContent = this.riskScore;
            
            this.elements.riskFill.style.width = this.riskScore + '%';
            this.elements.riskFill.className = this.riskScore <= 30 ? 'wws-risk-low' : 
                                              this.riskScore <= 65 ? 'wws-risk-medium' : 'wws-risk-high';
            
            // Показать причины
            if (this.signals.length > 0) {
                this.elements.reasons.innerHTML = '<strong>Обнаружено:</strong><br>' + 
                    this.signals.slice(0, 2).map(s => `• ${s}`).join('<br>');
            }
        }

        /**
         * Обновить статус
         */
        updateStatus(status) {
            const text = status === 'Safe' ? 'Безопасно' : 
                        status === 'Suspicious' ? 'Требуется проверка' : 'Заблокировано';
            this.elements.status.textContent = text;
        }

        /**
         * Форматировать время
         */
        formatTime(seconds) {
            const m = Math.floor(seconds / 60);
            const s = seconds % 60;
            return `${m}:${s.toString().padStart(2, '0')}`;
        }

        /**
         * Ожидание
         */
        wait(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
    }

    // Авто-инициализация при загрузке DOM
    function initWWSProtect() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                window.WWSProtect = new WWSProtect();
                // Небольшая задержка для демонстрации
                setTimeout(() => window.WWSProtect.init(), 500);
            });
        } else {
            window.WWSProtect = new WWSProtect();
            setTimeout(() => window.WWSProtect.init(), 500);
        }
    }

    // Запуск
    initWWSProtect();
})();
