// JavaScript
class ReaverPlayer {
    constructor(root) {
        this.root = root;
        this.src = root.dataset.src;
        this.isMobile = this.isMobileDevice();
        this.isFullscreen = false;
        this.volumeBeforeMute = 1;
        this.playbackRates = ['0.5', '0.75', '1', '1.25', '1.5', '2'];
        this.currentPlaybackRate = 1;
        this.qualityLevels = [];
        this.currentQualityIndex = 0;
        
        this.initPlayer();
        this.setupFontAwesome();
        this.setupKeyboardShortcuts();
        
        // Показываем подсказку о горячих клавишах
        this.showShortcutsHint();
        
        // Таймер для скрытия контролов
        this.controlsTimeout = null;
        this.controlsVisible = false;
        
        // Инициализация жестов
        this.setupGestures();
        
        // Сохранение настроек
        this.loadSettings();
    }

    initPlayer() {
        // Очищаем контейнер
        this.root.innerHTML = '';
        this.root.classList.add('reaver-player');

        // Создаем контейнер для видео
        this.videoContainer = document.createElement('div');
        this.videoContainer.className = 'video-container';
        this.root.appendChild(this.videoContainer);

        this.video = document.createElement('video');
        this.video.src = this.src;
        this.video.preload = 'metadata';
        this.video.style.display = 'block';
        this.video.style.width = '100%';
        this.video.setAttribute('playsinline', '');
        this.videoContainer.appendChild(this.video);

        // Создаем оверлей загрузки
        this.loadingOverlay = document.createElement('div');
        this.loadingOverlay.className = 'loading-overlay';
        this.loadingOverlay.innerHTML = `
            <div class="loading-spinner"></div>
        `;
        this.videoContainer.appendChild(this.loadingOverlay);

        // Создаем кнопку воспроизведения по центру
        this.centerPlayBtn = document.createElement('div');
        this.centerPlayBtn.className = 'center-play-btn';
        this.centerPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
        this.videoContainer.appendChild(this.centerPlayBtn);

        // Создаем превью для перемотки
        this.scrubPreview = document.createElement('div');
        this.scrubPreview.className = 'scrub-preview';
        this.videoContainer.appendChild(this.scrubPreview);

        // Модальное окно для горячих клавиш
        this.shortcutsModal = document.createElement('div');
        this.shortcutsModal.className = 'shortcuts-modal';
        this.shortcutsModal.innerHTML = `
            <h3>Горячие клавиши</h3>
            <ul>
                <li><span>Пространство</span> <span class="key">Space</span></li>
                <li><span>Воспроизведение/Пауза</span> <span class="key">K</span></li>
                <li><span>Остановить</span> <span class="key">S</span></li>
                <li><span>Вперед на 5 сек</span> <span class="key">→</span></li>
                <li><span>Назад на 5 сек</span> <span class="key">←</span></li>
                <li><span>Громкость +</span> <span class="key">↑</span></li>
                <li><span>Громкость -</span> <span class="key">↓</span></li>
                <li><span>Полный экран</span> <span class="key">F</span></li>
                <li><span>Picture-in-Picture</span> <span class="key">P</span></li>
                <li><span>Mute/Unmute</span> <span class="key">M</span></li>
            </ul>
        `;
        this.videoContainer.appendChild(this.shortcutsModal);

        // Оверлей для модальных окон
        this.modalOverlay = document.createElement('div');
        this.modalOverlay.className = 'modal-overlay';
        this.videoContainer.appendChild(this.modalOverlay);

        // Toast уведомления
        this.toast = document.createElement('div');
        this.toast.className = 'toast';
        this.videoContainer.appendChild(this.toast);

        // Мобильный ползунок громкости
        this.volumeSliderMobile = document.createElement('input');
        this.volumeSliderMobile.type = 'range';
        this.volumeSliderMobile.className = 'volume-slider-mobile';
        this.volumeSliderMobile.min = 0;
        this.volumeSliderMobile.max = 1;
        this.volumeSliderMobile.step = 0.05;
        this.volumeSliderMobile.value = 1;
        this.videoContainer.appendChild(this.volumeSliderMobile);

        this.createControls();
        this.bindEvents();
    }

    createControls() {
        const controls = document.createElement('div');
        controls.className = 'controls';

        // Play/Pause
        this.playBtn = document.createElement('button');
        this.playBtn.className = 'btn';
        this.playBtn.innerHTML = '<i class="fas fa-play"></i>';
        this.playBtn.title = 'Play/Pause (Space)';
        this.playBtn.setAttribute('aria-label', 'Play/Pause');
        controls.appendChild(this.playBtn);

        // Время
        this.time = document.createElement('span');
        this.time.className = 'time';
        this.time.textContent = '0:00 / 0:00';
        controls.appendChild(this.time);

        // Прогресс-бар
        this.progressContainer = document.createElement('div');
        this.progressContainer.className = 'progress-container';
        this.progressContainer.setAttribute('aria-label', 'Progress bar');
        
        this.buffer = document.createElement('div');
        this.buffer.className = 'buffer';
        
        this.progress = document.createElement('div');
        this.progress.className = 'progress';
        
        this.progressContainer.appendChild(this.buffer);
        this.progressContainer.appendChild(this.progress);
        controls.appendChild(this.progressContainer);

        // Полноэкранный режим (теперь первая кнопка справа)
        this.fullscreenBtn = document.createElement('button');
        this.fullscreenBtn.className = 'btn fullscreen-btn';
        this.fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
        this.fullscreenBtn.title = 'Fullscreen (F)';
        this.fullscreenBtn.setAttribute('aria-label', 'Fullscreen');
        controls.appendChild(this.fullscreenBtn);

        // Picture-in-Picture (теперь вторая кнопка справа)
        this.pipBtn = document.createElement('button');
        this.pipBtn.className = 'btn pip-btn';
        this.pipBtn.innerHTML = '<i class="fas fa-compress-arrows-alt"></i>';
        this.pipBtn.title = 'Picture in Picture (P)';
        this.pipBtn.setAttribute('aria-label', 'Picture in Picture');
        controls.appendChild(this.pipBtn);

        // Меню (теперь последняя кнопка справа)
        this.menu = document.createElement('div');
        this.menu.className = 'menu';

        this.menuBtn = document.createElement('button');
        this.menuBtn.className = 'menu-btn';
        this.menuBtn.innerHTML = '<i class="fas fa-cog"></i>';
        this.menuBtn.title = 'Settings';
        this.menuBtn.setAttribute('aria-label', 'Settings menu');
        this.menu.appendChild(this.menuBtn);

        this.menuContent = document.createElement('div');
        this.menuContent.className = 'menu-content';

        // Заголовок плеера
        const playerTitle = document.createElement('h3');
        playerTitle.textContent = 'Reaver Player';
        this.menuContent.appendChild(playerTitle);

        // Громкость (добавляем в меню)
        const volumeLabel = document.createElement('span');
        volumeLabel.textContent = 'Громкость:';
        volumeLabel.style.color = 'rgba(255, 255, 255, 0.7)';
        volumeLabel.style.fontSize = '12px';
        volumeLabel.style.marginBottom = '5px';
        volumeLabel.style.display = 'block';
        this.menuContent.appendChild(volumeLabel);
        
        this.volumeSliderMenu = document.createElement('input');
        this.volumeSliderMenu.type = 'range';
        this.volumeSliderMenu.min = 0;
        this.volumeSliderMenu.max = 1;
        this.volumeSliderMenu.step = 0.05;
        this.volumeSliderMenu.value = 1;
        this.volumeSliderMenu.style.width = '100%';
        this.volumeSliderMenu.style.marginBottom = '15px';
        this.menuContent.appendChild(this.volumeSliderMenu);

        // Кнопка mute/unmute в меню
        this.menuMuteBtn = document.createElement('button');
        this.menuMuteBtn.innerHTML = '<i class="fas fa-volume-up"></i> Mute/Unmute';
        this.menuMuteBtn.style.marginBottom = '15px';
        this.menuContent.appendChild(this.menuMuteBtn);

        // Picture-in-Picture в меню
        this.menuPipBtn = document.createElement('button');
        this.menuPipBtn.innerHTML = '<i class="fas fa-compress-arrows-alt"></i> Picture in Picture';
        this.menuPipBtn.style.marginBottom = '15px';
        this.menuContent.appendChild(this.menuPipBtn);

        // Скорость
        const speedLabel = document.createElement('span');
        speedLabel.textContent = 'Скорость:';
        speedLabel.style.color = 'rgba(255, 255, 255, 0.7)';
        speedLabel.style.fontSize = '12px';
        speedLabel.style.marginBottom = '5px';
        speedLabel.style.display = 'block';
        this.menuContent.appendChild(speedLabel);
        
        this.speedSelect = document.createElement('select');
        this.playbackRates.forEach(rate => {
            const opt = document.createElement('option');
            opt.value = rate;
            opt.textContent = rate + 'x';
            if (rate === '1') opt.selected = true;
            this.speedSelect.appendChild(opt);
        });
        this.menuContent.appendChild(this.speedSelect);

        // Скачать
        this.downloadBtn = document.createElement('button');
        this.downloadBtn.innerHTML = '<i class="fas fa-download"></i> Скачать видео';
        this.menuContent.appendChild(this.downloadBtn);

        // Качество видео
        if(this.root.dataset.sources){
            const qualityLabel = document.createElement('span');
            qualityLabel.textContent = 'Качество:';
            qualityLabel.style.color = 'rgba(255, 255, 255, 0.7)';
            qualityLabel.style.fontSize = '12px';
            qualityLabel.style.marginBottom = '5px';
            qualityLabel.style.display = 'block';
            this.menuContent.appendChild(qualityLabel);
            
            this.qualitySelect = document.createElement('select');
            const sources = JSON.parse(this.root.dataset.sources);
            sources.forEach((s, i) => {
                const opt = document.createElement('option');
                opt.value = i;
                opt.textContent = s.label;
                if (i === 0) opt.selected = true;
                this.qualitySelect.appendChild(opt);
                this.qualityLevels.push(s);
            });
            this.menuContent.appendChild(this.qualitySelect);
        }

        // Субтитры
        if(this.root.dataset.subtitles){
            const subLabel = document.createElement('span');
            subLabel.textContent = 'Субтитры:';
            subLabel.style.color = 'rgba(255, 255, 255, 0.7)';
            subLabel.style.fontSize = '12px';
            subLabel.style.marginBottom = '5px';
            subLabel.style.display = 'block';
            this.menuContent.appendChild(subLabel);
            
            this.subSelect = document.createElement('select');
            this.subSelect.innerHTML = '<option value="off">Выкл</option>';
            const subtitles = JSON.parse(this.root.dataset.subtitles);
            subtitles.forEach((sub, i) => {
                const opt = document.createElement('option');
                opt.value = i;
                opt.textContent = sub.label;
                this.subSelect.appendChild(opt);
            });
            this.menuContent.appendChild(this.subSelect);
        }

        this.menu.appendChild(this.menuContent);
        controls.appendChild(this.menu);

        // Название плеера
        const titleElement = document.createElement('div');
        titleElement.className = 'player-title';
        titleElement.textContent = 'Reaver Player v2.0';
        this.root.appendChild(titleElement);

        // Подсказка горячих клавиш
        this.shortcutsHint = document.createElement('div');
        this.shortcutsHint.className = 'shortcuts-hint';
        this.shortcutsHint.innerHTML = '<i class="fas fa-keyboard"></i>';
        this.shortcutsHint.title = 'Показать горячие клавиши';
        this.root.appendChild(this.shortcutsHint);

        this.root.appendChild(controls);
    }

    bindEvents() {
        this.playBtn.addEventListener('click', () => this.toggle());
        
        // Клик по видео для паузы/воспроизведения
        this.video.addEventListener('click', (e) => {
            // Предотвращаем срабатывание, если клик был на элементах управления
            if (e.target.closest('.controls') || e.target.closest('.btn')) return;
            this.toggle();
            this.showCenterPlayButton();
        });
        
        this.centerPlayBtn.addEventListener('click', () => this.toggle());
        
        this.video.addEventListener('dblclick', () => this.toggleFullscreen());
        
        this.video.addEventListener('timeupdate', () => this.updateProgress());
        this.video.addEventListener('progress', () => this.updateBuffer());
        this.video.addEventListener('loadedmetadata', () => {
            this.updateTime();
            this.hideLoading();
        });
        this.video.addEventListener('volumechange', () => this.updateVolumeIcon());
        this.video.addEventListener('ratechange', () => this.updatePlaybackRate());
        
        // События загрузки
        this.video.addEventListener('loadstart', () => this.showLoading());
        this.video.addEventListener('canplay', () => this.hideLoading());
        this.video.addEventListener('waiting', () => this.showLoading());
        this.video.addEventListener('playing', () => this.hideLoading());
        this.video.addEventListener('ended', () => this.handleVideoEnd());
        this.video.addEventListener('error', (e) => {
            this.hideLoading();
            this.showToast('Ошибка загрузки видео');
            console.error('Video error:', e);
        });
        
        // Управление видимостью контролов
        this.videoContainer.addEventListener('mousemove', () => this.showControls());
        this.videoContainer.addEventListener('mouseleave', () => this.hideControls());
        this.videoContainer.addEventListener('touchstart', () => this.toggleControls());
        
        // Перемотка
        this.progressContainer.addEventListener('click', e => this.seek(e));
        this.progressContainer.addEventListener('mousemove', e => this.previewSeek(e));
        this.progressContainer.addEventListener('mouseleave', () => this.hideSeekPreview());
        
        // Громкость через меню
        this.volumeSliderMenu.addEventListener('input', () => {
            this.video.volume = this.volumeSliderMenu.value;
            this.volumeSliderMobile.value = this.video.volume;
            this.updateVolumeIcon();
            this.saveSettings();
        });

        this.menuMuteBtn.addEventListener('click', () => {
            if (this.video.muted) {
                this.video.muted = false;
                this.video.volume = this.volumeBeforeMute;
            } else {
                this.volumeBeforeMute = this.video.volume;
                this.video.muted = true;
            }
            this.updateVolumeIcon();
            this.saveSettings();
        });

        this.volumeSliderMobile.addEventListener('input', () => {
            this.video.volume = this.volumeSliderMobile.value;
            this.volumeSliderMenu.value = this.video.volume;
            this.updateVolumeIcon();
            this.saveSettings();
        });

        // Полноэкранный режим
        this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());

        // Обработка изменения полноэкранного режима
        document.addEventListener('fullscreenchange', () => {
            this.isFullscreen = !!document.fullscreenElement;
            this.updateFullscreenIcon();
            this.handleFullscreenChange();
        });

        // Picture-in-Picture через меню
        this.menuPipBtn.addEventListener('click', () => this.togglePip());

        // Меню кнопка
        this.menuBtn.addEventListener('click', (e) => {
            this.menuContent.style.display = this.menuContent.style.display === 'block' ? 'none' : 'block';
            e.stopPropagation();
        });

        // Скорость
        this.speedSelect.addEventListener('change', () => {
            this.video.playbackRate = parseFloat(this.speedSelect.value);
            this.currentPlaybackRate = this.video.playbackRate;
            this.showToast('Скорость: ' + this.speedSelect.value + 'x');
            this.saveSettings();
        });

        // Скачать
        this.downloadBtn.addEventListener('click', () => {
            const a = document.createElement('a');
            a.href = this.video.currentSrc || this.video.src;
            a.download = 'video.mp4';
            a.click();
        });

        // Качество
        if(this.qualitySelect){
            this.qualitySelect.addEventListener('change', () => {
                this.changeQuality(parseInt(this.qualitySelect.value));
            });
        }

        // Субтитры
        if(this.subSelect){
            this.subSelect.addEventListener('change', () => {
                this.changeSubtitles(parseInt(this.subSelect.value));
            });
        }

        // Подсказка горячих клавиш
        this.shortcutsHint.addEventListener('click', (e) => {
            this.showShortcutsModal();
            e.stopPropagation();
        });

        // Закрытие меню при клике вне его
        document.addEventListener('click', (e) => {
            if (!this.menu.contains(e.target)) {
                this.menuContent.style.display = 'none';
            }
            
            if (this.modalOverlay.style.display === 'block') {
                this.hideShortcutsModal();
            }
            
            // Скрываем мобильный ползунок громкости
            if (this.isMobile && this.volumeSliderMobile.style.display === 'block') {
                this.volumeSliderMobile.style.display = 'none';
            }
        });
        
        // Закрытие модального окна по клику на оверлей
        this.modalOverlay.addEventListener('click', () => {
            this.hideShortcutsModal();
        });
        
        // Обработка изменения размера окна
        window.addEventListener('resize', () => this.handleResize());
        
        // Сохранение позиции воспроизведения при выгрузке страницы
        window.addEventListener('beforeunload', () => this.saveSettings());
        
        // Автоматическое скрытие панели управления
        this.setupAutoHideControls();
    }
    
    setupAutoHideControls() {
        let inactivityTimer;
        const hideDelay = 3000; // 3 секунды бездействия
        
        const resetTimer = () => {
            clearTimeout(inactivityTimer);
            inactivityTimer = setTimeout(() => {
                if (!this.video.paused) {
                    this.hideControls();
                }
            }, hideDelay);
        };
        
        // События, которые сбрасывают таймер
        const events = ['mousemove', 'mousedown', 'touchstart', 'touchmove', 'keypress'];
        events.forEach(event => {
            this.videoContainer.addEventListener(event, () => {
                this.showControls();
                resetTimer();
            });
        });
        
        // Начальный запуск таймера
        resetTimer();
    }
    
    setupGestures() {
        if (!this.isMobile) return;
        
        let touchStartX = 0;
        let touchStartY = 0;
        let touchStartTime = 0;
        let seeking = false;
        let volumeGesture = false;
        let tapTimer = null;
        
        this.videoContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            touchStartTime = Date.now();
            seeking = false;
            volumeGesture = false;
            
            // Таймер для определения тапа (без движения)
            tapTimer = setTimeout(() => {
                if (!seeking && !volumeGesture) {
                    this.toggleControls();
                }
            }, 300);
        }, { passive: true });
        
        this.videoContainer.addEventListener('touchmove', (e) => {
            if (!this.video.duration) return;
            
            const touchX = e.touches[0].clientX;
            const touchY = e.touches[0].clientY;
            const deltaX = touchX - touchStartX;
            const deltaY = touchStartY - touchY; // inverted for more intuitive volume control
            
            // Определяем тип жеста после определенного порога движения
            if (!seeking && !volumeGesture) {
                if (Math.abs(deltaX) > 20) {
                    seeking = true;
                    clearTimeout(tapTimer);
                    this.showToast('Перемотка');
                } else if (Math.abs(deltaY) > 20) {
                    volumeGesture = true;
                    clearTimeout(tapTimer);
                    this.showToast('Громкость');
                }
            }
            
            if (seeking) {
                e.preventDefault();
                const percent = deltaX / this.videoContainer.offsetWidth;
                const seekTime = this.video.currentTime + percent * this.video.duration * 2; // 2x sensitivity
                this.video.currentTime = Math.max(0, Math.min(seekTime, this.video.duration));
                touchStartX = touchX;
                
                // Show seek preview
                this.scrubPreview.textContent = this.formatTime(this.video.currentTime);
                this.scrubPreview.style.left = `${touchX - this.videoContainer.getBoundingClientRect().left}px`;
                this.scrubPreview.classList.add('visible');
            }
            
            if (volumeGesture) {
                e.preventDefault();
                const volumeChange = deltaY / 100; // Adjust sensitivity
                let newVolume = this.video.volume + volumeChange;
                newVolume = Math.max(0, Math.min(newVolume, 1));
                this.video.volume = newVolume;
                this.volumeSliderMenu.value = newVolume;
                this.volumeSliderMobile.value = newVolume;
                this.updateVolumeIcon();
                touchStartY = e.touches[0].clientY;
                
                // Show volume slider on mobile
                this.volumeSliderMobile.style.display = 'block';
                this.volumeSliderMobile.style.opacity = '1';
                setTimeout(() => {
                    if (this.volumeSliderMobile.style.display === 'block') {
                        this.volumeSliderMobile.style.opacity = '0';
                        setTimeout(() => {
                            this.volumeSliderMobile.style.display = 'none';
                        }, 300);
                    }
                }, 2000);
            }
        }, { passive: false });
        
        this.videoContainer.addEventListener('touchend', () => {
            clearTimeout(tapTimer);
            this.scrubPreview.classList.remove('visible');
            
            // Handle tap (play/pause)
            if (!seeking && !volumeGesture && (Date.now() - touchStartTime < 300)) {
                this.toggle();
                this.showCenterPlayButton();
            }
            
            // Скрываем ползунок громкости через 2 секунды
            if (volumeGesture && this.volumeSliderMobile.style.display === 'block') {
                setTimeout(() => {
                    this.volumeSliderMobile.style.opacity = '0';
                    setTimeout(() => {
                        this.volumeSliderMobile.style.display = 'none';
                    }, 300);
                }, 2000);
            }
            
            seeking = false;
            volumeGesture = false;
        }, { passive: true });
        
        // Двойное касание для полноэкранного режима
        let lastTap = 0;
        this.videoContainer.addEventListener('touchend', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            if (tapLength < 300 && tapLength > 0) {
                // Double tap detected
                this.toggleFullscreen();
            }
            lastTap = currentTime;
        }, { passive: true });
    }
    
    setupFontAwesome() {
        if (!document.querySelector('link[href*="font-awesome"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
            document.head.appendChild(link);
        }
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ignore if typing in inputs or if modal is open
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName) || 
                this.modalOverlay.style.display === 'block') {
                return;
            }
            
            switch(e.key.toLowerCase()) {
                case ' ':
                    e.preventDefault();
                    this.toggle();
                    this.showCenterPlayButton();
                    break;
                case 'k':
                    this.toggle();
                    this.showCenterPlayButton();
                    break;
                case 's':
                    this.video.pause();
                    this.video.currentTime = 0;
                    this.updatePlayButton();
                    this.showToast('Воспроизведение остановлено');
                    break;
                case 'arrowright':
                    this.video.currentTime = Math.min(this.video.currentTime + 5, this.video.duration);
                    this.createRippleEffect(this.videoContainer);
                    this.showToast('+5 сек');
                    break;
                case 'arrowleft':
                    this.video.currentTime = Math.max(this.video.currentTime - 5, 0);
                    this.createRippleEffect(this.videoContainer);
                    this.showToast('-5 сек');
                    break;
                case 'arrowup':
                    this.video.volume = Math.min(this.video.volume + 0.1, 1);
                    this.volumeSliderMenu.value = this.video.volume;
                    this.volumeSliderMobile.value = this.video.volume;
                    this.updateVolumeIcon();
                    this.showToast('Громкость: ' + Math.round(this.video.volume * 100) + '%');
                    this.saveSettings();
                    break;
                case 'arrowdown':
                    this.video.volume = Math.max(this.video.volume - 0.1, 0);
                    this.volumeSliderMenu.value = this.video.volume;
                    this.volumeSliderMobile.value = this.video.volume;
                    this.updateVolumeIcon();
                    this.showToast('Громкость: ' + Math.round(this.video.volume * 100) + '%');
                    this.saveSettings();
                    break;
                case 'f':
                    this.toggleFullscreen();
                    break;
                case 'p':
                    this.togglePip();
                    break;
                case 'm':
                    if (this.video.muted) {
                        this.video.muted = false;
                        this.video.volume = this.volumeBeforeMute;
                        this.showToast('Звук включен');
                    } else {
                        this.volumeBeforeMute = this.video.volume;
                        this.video.muted = true;
                        this.showToast('Звук выключен');
                    }
                    this.volumeSliderMenu.value = this.video.volume;
                    this.updateVolumeIcon();
                    this.saveSettings();
                    break;
                case 'c':
                    this.toggleCaptions();
                    break;
                case 't':
                    this.showToast('Тестовое уведомление', 2000);
                    break;
            }
        });
    }
    
    isMobileDevice() {
        return (('ontouchstart' in window) ||
               (navigator.maxTouchPoints > 0) ||
               (navigator.msMaxTouchPoints > 0));
    }
    
    showLoading() {
        this.loadingOverlay.classList.add('visible');
    }
    
    hideLoading() {
        this.loadingOverlay.classList.remove('visible');
    }
    
    showShortcutsHint() {
        setTimeout(() => {
            this.shortcutsHint.style.opacity = '0.5';
            setTimeout(() => {
                this.shortcutsHint.style.opacity = '0.7';
            }, 5000);
        }, 2000);
    }
    
    showShortcutsModal() {
        this.shortcutsModal.style.display = 'block';
        this.modalOverlay.style.display = 'block';
    }
    
    hideShortcutsModal() {
        this.shortcutsModal.style.display = 'none';
        this.modalOverlay.style.display = 'none';
    }
    
    showControls() {
        this.root.classList.add('controls-visible');
        this.controlsVisible = true;
    }
    
    hideControls() {
        if (!this.video.paused) {
            this.root.classList.remove('controls-visible');
            this.controlsVisible = false;
        }
    }
    
    toggleControls() {
        if (this.controlsVisible) {
            this.hideControls();
        } else {
            this.showControls();
        }
    }
    
    showCenterPlayButton() {
        if (this.video.paused) {
            this.centerPlayBtn.classList.add('visible');
            setTimeout(() => {
                if (!this.video.paused) {
                    this.centerPlayBtn.classList.remove('visible');
                }
            }, 1000);
        } else {
            this.centerPlayBtn.classList.remove('visible');
        }
    }
    
    seek(e) {
        const rect = this.progressContainer.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        this.video.currentTime = pct * this.video.duration;
        this.createRippleEffect(this.progressContainer, e);
    }
    
    previewSeek(e) {
        const rect = this.progressContainer.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        const time = pct * this.video.duration;
        
        this.scrubPreview.textContent = this.formatTime(time);
        this.scrubPreview.style.left = `${e.clientX - rect.left}px`;
        this.scrubPreview.classList.add('visible');
    }
    
    hideSeekPreview() {
        this.scrubPreview.classList.remove('visible');
    }
    
    formatTime(time) {
        if (isNaN(time)) return '0:00';
        
        const h = Math.floor(time / 3600);
        const m = Math.floor((time % 3600) / 60);
        const s = Math.floor(time % 60);
        
        if (h > 0) {
            return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        } else {
            return `${m}:${s.toString().padStart(2, '0')}`;
        }
    }
    
    createRippleEffect(element, event) {
        const ripple = document.createElement('div');
        ripple.className = 'ripple-effect';
        
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        let x, y;
        
        if (event) {
            x = event.clientX - rect.left - size / 2;
            y = event.clientY - rect.top - size / 2;
        } else {
            x = rect.width / 2 - size / 2;
            y = rect.height / 2 - size / 2;
        }
        
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
    
    handleResize() {
        // Обновление позиций элементов при изменении размера окна
        if (this.scrubPreview.classList.contains('visible')) {
            this.scrubPreview.classList.remove('visible');
        }
    }
    
    handleFullscreenChange() {
        if (this.isFullscreen) {
            // В полноэкранном режиме добавляем класс для центрирования
            this.video.style.objectFit = 'contain';
            this.videoContainer.style.display = 'flex';
            this.videoContainer.style.justifyContent = 'center';
            this.videoContainer.style.alignItems = 'center';
            this.videoContainer.style.backgroundColor = '#000';
        } else {
            // Возвращаем исходные стили
            this.video.style.objectFit = 'cover';
            this.videoContainer.style.display = 'block';
            this.videoContainer.style.justifyContent = 'initial';
            this.videoContainer.style.alignItems = 'initial';
            this.videoContainer.style.backgroundColor = 'transparent';
        }
    }
    
    handleVideoEnd() {
        this.playBtn.innerHTML = '<i class="fas fa-play"></i>';
        this.showCenterPlayButton();
    }

    toggle(){
        if(this.video.paused){
            this.video.play().catch(e => {
                console.error('Playback error:', e);
                this.showToast('Ошибка воспроизведения');
            });
            this.playBtn.innerHTML='<i class="fas fa-pause"></i>';
            this.centerPlayBtn.classList.remove('visible');
        } else{
            this.video.pause();
            this.playBtn.innerHTML='<i class="fas fa-play"></i>';
            this.showCenterPlayButton();
        }
    }
    
    updatePlayButton() {
        this.playBtn.innerHTML = this.video.paused ? 
            '<i class="fas fa-play"></i>' : 
            '<i class="fas fa-pause"></i>';
    }

    updateProgress(){
        if (this.video.duration) {
            const pct = (this.video.currentTime / this.video.duration) * 100;
            this.progress.style.width = pct + '%';
            this.updateTime();
        }
    }

    updateBuffer() {
        if (this.video.buffered.length > 0 && this.video.duration) {
            const bufferedEnd = this.video.buffered.end(this.video.buffered.length - 1);
            this.buffer.style.width = (bufferedEnd / this.video.duration) * 100 + '%';
        }
    }

    updateTime(){
        if (this.video.duration) {
            this.time.textContent = `${this.formatTime(this.video.currentTime)} / ${this.formatTime(this.video.duration)}`;
        } else {
            this.time.textContent = '0:00 / 0:00';
        }
    }

    updateVolumeIcon() {
        if (this.video.muted || this.video.volume === 0) {
            this.menuMuteBtn.innerHTML = '<i class="fas fa-volume-mute"></i> Unmute';
        } else if (this.video.volume < 0.5) {
            this.menuMuteBtn.innerHTML = '<i class="fas fa-volume-down"></i> Mute';
        } else {
            this.menuMuteBtn.innerHTML = '<i class="fas fa-volume-up"></i> Mute';
        }
    }
    
    updateFullscreenIcon() {
        if (this.isFullscreen) {
            this.fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
            this.fullscreenBtn.title = 'Exit Fullscreen (F)';
            this.fullscreenBtn.classList.add('active');
        } else {
            this.fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
            this.fullscreenBtn.title = 'Fullscreen (F)';
            this.fullscreenBtn.classList.remove('active');
        }
    }
    
    updatePlaybackRate() {
        this.speedSelect.value = this.video.playbackRate.toString();
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            if (this.root.requestFullscreen) {
                this.root.requestFullscreen().catch(err => {
                    console.error(`Ошибка при переходе в полноэкранный режим: ${err.message}`);
                    this.showToast('Ошибка полноэкранного режима');
                });
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }

    async togglePip() {
        try {
            if (this.video !== document.pictureInPictureElement) {
                await this.video.requestPictureInPicture();
                this.showToast('Picture-in-Picture включен');
                this.pipBtn.classList.add('active');
            } else {
                await document.exitPictureInPicture();
                this.showToast('Picture-in-Picture выключен');
                this.pipBtn.classList.remove('active');
            }
        } catch (error) {
            console.error('Picture-in-Picture error:', error);
            this.showToast('Ваш браузер не поддерживает Picture-in-Picture!');
        }
    }
    
    toggleCaptions() {
        if (this.video.textTracks && this.video.textTracks.length > 0) {
            for (let i = 0; i < this.video.textTracks.length; i++) {
                const track = this.video.textTracks[i];
                track.mode = track.mode === 'showing' ? 'hidden' : 'showing';
            }
            this.showToast(this.video.textTracks[0].mode === 'showing' ? 'Субтитры включены' : 'Субтитры выключены');
        }
    }
    
    changeQuality(index) {
        if (!this.qualityLevels[index]) return;
        
        const currentTime = this.video.currentTime;
        const wasPlaying = !this.video.paused;
        
        this.video.src = this.qualityLevels[index].url;
        this.video.currentTime = currentTime;
        
        if (wasPlaying) {
            this.video.play().catch(e => console.error('Playback error:', e));
        }
        
        this.showToast('Качество: ' + this.qualityLevels[index].label);
        this.saveSettings();
    }
    
    changeSubtitles(index) {
        if (index === -1 || !this.video.textTracks) return;
        
        // Turn off all tracks first
        for (let i = 0; i < this.video.textTracks.length; i++) {
            this.video.textTracks[i].mode = 'hidden';
        }
        
        // Enable selected track if available
        if (index < this.video.textTracks.length) {
            this.video.textTracks[index].mode = 'showing';
            this.showToast('Субтитры: ' + this.video.textTracks[index].label);
        }
        
        this.saveSettings();
    }
    
    showToast(message, duration = 2000) {
        this.toast.textContent = message;
        this.toast.classList.add('visible');
        
        setTimeout(() => {
            this.toast.classList.remove('visible');
        }, duration);
    }
    
    saveSettings() {
        const settings = {
            volume: this.video.volume,
            playbackRate: this.video.playbackRate,
            currentTime: this.video.currentTime,
            isMuted: this.video.muted,
            quality: this.qualitySelect ? this.qualitySelect.value : 0,
            subtitles: this.subSelect ? this.subSelect.value : -1
        };
        
        localStorage.setItem('reaverPlayerSettings', JSON.stringify(settings));
    }
    
    loadSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem('reaverPlayerSettings'));
            
            if (settings) {
                if (settings.volume !== undefined) {
                    this.video.volume = settings.volume;
                    this.volumeSliderMenu.value = settings.volume;
                    this.volumeSliderMobile.value = settings.volume;
                }
                
                if (settings.playbackRate !== undefined) {
                    this.video.playbackRate = settings.playbackRate;
                    this.currentPlaybackRate = settings.playbackRate;
                    if (this.speedSelect) {
                        this.speedSelect.value = settings.playbackRate.toString();
                    }
                }
                
                if (settings.isMuted !== undefined) {
                    this.video.muted = settings.isMuted;
                }
                
                if (settings.currentTime !== undefined) {
                    this.video.currentTime = settings.currentTime;
                }
                
                if (settings.quality !== undefined && this.qualitySelect) {
                    this.qualitySelect.value = settings.quality;
                }
                
                if (settings.subtitles !== undefined && this.subSelect) {
                    this.subSelect.value = settings.subtitles;
                    this.changeSubtitles(parseInt(settings.subtitles));
                }
                
                this.updateVolumeIcon();
            }
        } catch (e) {
            console.error('Error loading settings:', e);
        }
    }

    play(){ 
        this.video.play().catch(e => {
            console.error('Play error:', e);
            this.showToast('Ошибка воспроизведения');
        }); 
        this.playBtn.innerHTML='<i class="fas fa-pause"></i>'; 
    }
    
    pause(){ 
        this.video.pause(); 
        this.playBtn.innerHTML='<i class="fas fa-play"></i>'; 
    }
    
    setSource(url){ 
        this.video.src=url; 
        this.video.play().catch(e => {
            console.error('Play error:', e);
            this.showToast('Ошибка воспроизведения');
        }); 
        this.playBtn.innerHTML='<i class="fas fa-pause"></i>'; 
    }
}

// Автоматическая инициализация всех плееров на странице
(function(){
    function boot(){
        document.querySelectorAll('.reaver-player').forEach(el=>{
            if(!el.player) new ReaverPlayer(el);
        });
    }
    if(document.readyState==='loading'){
        document.addEventListener('DOMContentLoaded', boot);
    } else boot();
    window.ReaverPlayer = ReaverPlayer;
})();
