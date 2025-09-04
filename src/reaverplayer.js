class ReaverPlayer {
    constructor(root) {
        this.root = root;
        const src = root.dataset.src;

        // Создаем контейнер для видео
        this.videoContainer = document.createElement('div');
        this.videoContainer.className = 'video-container';
        root.appendChild(this.videoContainer);

        this.video = document.createElement('video');
        this.video.src = src;
        this.video.preload = 'metadata';
        this.video.style.display = 'block';
        this.video.style.width = '100%';
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
        this.scrubPreview.innerHTML = `
            <div class="scrub-thumbnail"></div>
            <div class="scrub-time">0:00</div>
        `;
        this.videoContainer.appendChild(this.scrubPreview);

        // Создаем элемент для отображения времени при наведении
        this.hoverTime = document.createElement('div');
        this.hoverTime.className = 'hover-time';
        this.progressContainer.appendChild(this.hoverTime);

        // Создаем оверлей для миниатюр
        this.thumbnailOverlay = document.createElement('div');
        this.thumbnailOverlay.className = 'thumbnail-overlay';
        this.videoContainer.appendChild(this.thumbnailOverlay);

        // Создаем панель настроек
        this.settingsPanel = document.createElement('div');
        this.settingsPanel.className = 'settings-panel';
        this.settingsPanel.innerHTML = `
            <div class="settings-item">
                <label for="brightness">Яркость</label>
                <input type="range" id="brightness" min="0" max="200" value="100">
            </div>
            <div class="settings-item">
                <label for="contrast">Контрастность</label>
                <input type="range" id="contrast" min="0" max="200" value="100">
            </div>
            <div class="settings-item">
                <label for="saturation">Насыщенность</label>
                <input type="range" id="saturation" min="0" max="200" value="100">
            </div>
        `;
        this.videoContainer.appendChild(this.settingsPanel);

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
                <li><span>Яркость +</span> <span class="key">B + ↑</span></li>
                <li><span>Яркость -</span> <span class="key">B + ↓</span></li>
            </ul>
        `;
        this.videoContainer.appendChild(this.shortcutsModal);

        // Оверлей для модальных окон
        this.modalOverlay = document.createElement('div');
        this.modalOverlay.className = 'modal-overlay';
        this.videoContainer.appendChild(this.modalOverlay);

        this.createControls();

        root.player = this;
        this.bindEvents();
        this.setupFontAwesome();
        this.setupKeyboardShortcuts();
        
        // Показываем подсказку о горячих клавишах
        this.showShortcutsHint();
        
        // Таймер для скрытия контролов
        this.controlsTimeout = null;
        this.controlsVisible = false;
        
        // Инициализация настроек видео
        this.brightness = 100;
        this.contrast = 100;
        this.saturation = 100;
        this.updateVideoFilters();
        
        // Кэш для миниатюр
        this.thumbnailsCache = {};
    }

    createControls() {
        const controls = document.createElement('div');
        controls.className = 'controls';

        // Play/Pause
        this.playBtn = document.createElement('button');
        this.playBtn.className = 'btn';
        this.playBtn.innerHTML = '<i class="fas fa-play"></i>';
        this.playBtn.title = 'Play/Pause (Space)';
        controls.appendChild(this.playBtn);

        // Время
        this.time = document.createElement('span');
        this.time.className = 'time';
        this.time.textContent = '0:00 / 0:00';
        controls.appendChild(this.time);

        // Прогресс-бар
        this.progressContainer = document.createElement('div');
        this.progressContainer.className = 'progress-container';
        
        this.buffer = document.createElement('div');
        this.buffer.className = 'buffer';
        
        this.progress = document.createElement('div');
        this.progress.className = 'progress';
        
        // Маркеры глав
        this.chapterMarkers = document.createElement('div');
        this.chapterMarkers.className = 'chapter-markers';
        this.progressContainer.appendChild(this.chapterMarkers);
        
        this.progressContainer.appendChild(this.buffer);
        this.progressContainer.appendChild(this.progress);
        controls.appendChild(this.progressContainer);

        // Громкость
        this.volumeContainer = document.createElement('div');
        this.volumeContainer.className = 'volume-container';
        
        this.volumeBtn = document.createElement('button');
        this.volumeBtn.className = 'btn';
        this.volumeBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
        this.volumeBtn.title = 'Volume (M)';
        
        this.volumeSliderContainer = document.createElement('div');
        this.volumeSliderContainer.className = 'volume-slider-container';
        
        this.volumeSlider = document.createElement('input');
        this.volumeSlider.type = 'range';
        this.volumeSlider.className = 'volume-slider';
        this.volumeSlider.min = 0;
        this.volumeSlider.max = 1;
        this.volumeSlider.step = 0.05;
        this.volumeSlider.value = 1;
        
        this.volumeSliderContainer.appendChild(this.volumeSlider);
        this.volumeContainer.appendChild(this.volumeBtn);
        this.volumeContainer.appendChild(this.volumeSliderContainer);
        controls.appendChild(this.volumeContainer);

        // Настройки
        this.settingsBtn = document.createElement('button');
        this.settingsBtn.className = 'btn settings-btn';
        this.settingsBtn.innerHTML = '<i class="fas fa-sliders-h"></i>';
        this.settingsBtn.title = 'Настройки';
        controls.appendChild(this.settingsBtn);

        // Полноэкранный режим
        this.fullscreenBtn = document.createElement('button');
        this.fullscreenBtn.className = 'btn fullscreen-btn';
        this.fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
        this.fullscreenBtn.title = 'Fullscreen (F)';
        controls.appendChild(this.fullscreenBtn);

        // Picture-in-Picture
        this.pipBtn = document.createElement('button');
        this.pipBtn.className = 'btn pip-btn';
        this.pipBtn.innerHTML = '<i class="fas fa-compress-arrows-alt"></i>';
        this.pipBtn.title = 'Picture in Picture (P)';
        controls.appendChild(this.pipBtn);

        // Меню
        this.menu = document.createElement('div');
        this.menu.className = 'menu';

        this.menuBtn = document.createElement('button');
        this.menuBtn.className = 'menu-btn';
        this.menuBtn.innerHTML = '<i class="fas fa-cog"></i>';
        this.menuBtn.title = 'Settings';
        this.menu.appendChild(this.menuBtn);

        this.menuContent = document.createElement('div');
        this.menuContent.className = 'menu-content';

        // Заголовок плеера
        const playerTitle = document.createElement('h3');
        playerTitle.textContent = 'Reaver Player';
        this.menuContent.appendChild(playerTitle);

        // Скорость
        this.speedSelect = document.createElement('select');
        ['0.5x','0.75x','1x','1.25x','1.5x','2x'].forEach(s=>{
            const opt = document.createElement('option');
            opt.value = parseFloat(s);
            opt.textContent = s;
            if (s === '1x') opt.selected = true;
            this.speedSelect.appendChild(opt);
        });
        this.menuContent.appendChild(this.speedSelect);

        // Скачать
        this.downloadBtn = document.createElement('button');
        this.downloadBtn.innerHTML = '<i class="fas fa-download"></i> Скачать видео';
        this.menuContent.appendChild(this.downloadBtn);

        // Качество видео
        if(this.root.dataset.sources){
            this.qualitySelect = document.createElement('select');
            const sources = JSON.parse(this.root.dataset.sources);
            sources.forEach(s=>{
                const opt = document.createElement('option');
                opt.value = s.url;
                opt.textContent = s.label;
                this.qualitySelect.appendChild(opt);
            });
            this.menuContent.appendChild(this.qualitySelect);
        }

        // Субтитры
        this.subBtn = document.createElement('button');
        this.subBtn.innerHTML = '<i class="fas fa-closed-captioning"></i> Субтитры';
        this.menuContent.appendChild(this.subBtn);

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
        
        // Добавляем маркеры глав, если они есть
        this.addChapterMarkers();
    }

    addChapterMarkers() {
        if (this.root.dataset.chapters) {
            try {
                const chapters = JSON.parse(this.root.dataset.chapters);
                chapters.forEach(chapter => {
                    const marker = document.createElement('div');
                    marker.className = 'chapter-marker';
                    marker.style.left = `${(chapter.time / this.video.duration) * 100}%`;
                    marker.setAttribute('data-title', chapter.title);
                    this.chapterMarkers.appendChild(marker);
                });
            } catch (e) {
                console.error('Ошибка парсинга глав:', e);
            }
        }
    }

    bindEvents() {
        this.playBtn.addEventListener('click', ()=>this.toggle());
        
        // Клик по видео для паузы/воспроизведения
        this.video.addEventListener('click', (e) => {
            // Предотвращаем срабатывание, если клик был на элементах управления
            if (e.target.closest('.controls') || e.target.closest('.btn')) return;
            this.toggle();
            this.showCenterPlayButton();
        });
        
        this.video.addEventListener('dblclick', () => this.toggleFullscreen());
        
        this.video.addEventListener('timeupdate', ()=>this.updateProgress());
        this.video.addEventListener('progress', ()=>this.updateBuffer());
        this.video.addEventListener('loadedmetadata', ()=> {
            this.updateTime();
            this.addChapterMarkers();
        });
        this.video.addEventListener('volumechange', ()=>this.updateVolumeIcon());
        
        // События загрузки
        this.video.addEventListener('loadstart', ()=>this.showLoading());
        this.video.addEventListener('canplay', ()=>this.hideLoading());
        this.video.addEventListener('waiting', ()=>this.showLoading());
        this.video.addEventListener('playing', ()=>this.hideLoading());
        this.video.addEventListener('error', ()=>this.hideLoading());
        
        // Управление видимостью контролов
        this.videoContainer.addEventListener('mousemove', () => this.showControls());
        this.videoContainer.addEventListener('mouseleave', () => this.hideControls());
        this.videoContainer.addEventListener('touchstart', () => this.toggleControls());
        
        // Перемотка
        this.progressContainer.addEventListener('click', e=>this.seek(e));
        this.progressContainer.addEventListener('mousemove', e=>this.previewSeek(e));
        this.progressContainer.addEventListener('mouseleave', ()=>this.hideSeekPreview());
        
        // Громкость
        this.volumeSlider.addEventListener('input', ()=>{
            this.video.volume = this.volumeSlider.value;
            this.updateVolumeIcon();
        });

        this.volumeBtn.addEventListener('click', ()=>{
            this.video.muted = !this.video.muted;
            this.updateVolumeIcon();
        });
        
        // Настройки
        this.settingsBtn.addEventListener('click', (e) => {
            this.settingsPanel.classList.toggle('visible');
            e.stopPropagation();
        });
        
        // Обработчики для настроек видео
        const brightnessSlider = this.settingsPanel.querySelector('#brightness');
        const contrastSlider = this.settingsPanel.querySelector('#contrast');
        const saturationSlider = this.settingsPanel.querySelector('#saturation');
        
        brightnessSlider.addEventListener('input', () => {
            this.brightness = brightnessSlider.value;
            this.updateVideoFilters();
        });
        
        contrastSlider.addEventListener('input', () => {
            this.contrast = contrastSlider.value;
            this.updateVideoFilters();
        });
        
        saturationSlider.addEventListener('input', () => {
            this.saturation = saturationSlider.value;
            this.updateVideoFilters();
        });

        // Полноэкранный режим
        this.fullscreenBtn.addEventListener('click', ()=>this.toggleFullscreen());

        // Picture-in-Picture
        this.pipBtn.addEventListener('click', ()=>this.togglePip());

        // Меню кнопка
        this.menuBtn.addEventListener('click', (e)=>{
            this.menuContent.style.display = this.menuContent.style.display==='block' ? 'none' : 'block';
            e.stopPropagation();
        });

        // Скорость
        this.speedSelect.addEventListener('change', ()=>{
            this.video.playbackRate = parseFloat(this.speedSelect.value);
        });

        // Скачать
        this.downloadBtn.addEventListener('click', ()=>{
            const a = document.createElement('a');
            a.href = this.video.currentSrc;
            a.download = 'video.mp4';
            a.click();
        });

        // Качество
        if(this.qualitySelect){
            this.qualitySelect.addEventListener('change', ()=>{
                const t = this.video.currentTime;
                this.video.src = this.qualitySelect.value;
                this.video.currentTime = t;
                this.video.play();
            });
        }

        // Субтитры
        this.subBtn.addEventListener('click', ()=>{
            alert('Функция субтитров в разработке!');
        });

        // Подсказка горячих клавиш
        this.shortcutsHint.addEventListener('click', (e)=>{
            this.showShortcutsModal();
            e.stopPropagation();
        });

        // Закрытие меню при клике вне его
        document.addEventListener('click', (e) => {
            if (!this.menu.contains(e.target)) {
                this.menuContent.style.display = 'none';
            }
            
            if (!this.settingsPanel.contains(e.target) && e.target !== this.settingsBtn) {
                this.settingsPanel.classList.remove('visible');
            }
            
            if (this.modalOverlay.style.display === 'block') {
                this.hideShortcutsModal();
            }
        });
        
        // Закрытие модального окна по клику на оверлей
        this.modalOverlay.addEventListener('click', () => {
            this.hideShortcutsModal();
        });
        
        // Обработка изменения размера окна
        window.addEventListener('resize', () => this.handleResize());
    }
    
    updateVideoFilters() {
        this.video.style.filter = `brightness(${this.brightness}%) contrast(${this.contrast}%) saturate(${this.saturation}%)`;
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
        let brightnessMode = false;
        
        document.addEventListener('keydown', (e) => {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
                return;
            }
            
            // Режим регулировки яркости
            if (e.key.toLowerCase() === 'b') {
                brightnessMode = true;
                return;
            }
            
            if (brightnessMode) {
                e.preventDefault();
                const brightnessSlider = this.settingsPanel.querySelector('#brightness');
                
                if (e.key === 'ArrowUp') {
                    this.brightness = Math.min(parseInt(this.brightness) + 5, 200);
                    brightnessSlider.value = this.brightness;
                    this.updateVideoFilters();
                } else if (e.key === 'ArrowDown') {
                    this.brightness = Math.max(parseInt(this.brightness) - 5, 0);
                    brightnessSlider.value = this.brightness;
                    this.updateVideoFilters();
                }
                
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
                    break;
                case 'arrowright':
                    this.video.currentTime = Math.min(this.video.currentTime + 5, this.video.duration);
                    this.createRippleEffect(this.videoContainer, e);
                    break;
                case 'arrowleft':
                    this.video.currentTime = Math.max(this.video.currentTime - 5, 0);
                    this.createRippleEffect(this.videoContainer, e);
                    break;
                case 'arrowup':
                    this.video.volume = Math.min(this.video.volume + 0.1, 1);
                    this.volumeSlider.value = this.video.volume;
                    this.updateVolumeIcon();
                    break;
                case 'arrowdown':
                    this.video.volume = Math.max(this.video.volume - 0.1, 0);
                    this.volumeSlider.value = this.video.volume;
                    this.updateVolumeIcon();
                    break;
                case 'f':
                    this.toggleFullscreen();
                    break;
                case 'p':
                    this.togglePip();
                    break;
                case 'm':
                    this.video.muted = !this.video.muted;
                    this.updateVolumeIcon();
                    break;
            }
        });
        
        document.addEventListener('keyup', (e) => {
            if (e.key.toLowerCase() === 'b') {
                brightnessMode = false;
            }
        });
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
        
        clearTimeout(this.controlsTimeout);
        this.controlsTimeout = setTimeout(() => {
            this.hideControls();
        }, 3000);
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
                this.centerPlayBtn.classList.remove('visible');
            }, 1000);
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
        const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const time = pct * this.video.duration;
        
        // Обновляем время при наведении
        this.hoverTime.textContent = this.formatTime(time);
        this.hoverTime.style.left = `${e.clientX - rect.left}px`;
        
        // Обновляем превью
        this.scrubPreview.querySelector('.scrub-time').textContent = this.formatTime(time);
        this.scrubPreview.style.left = `${e.clientX - rect.left}px`;
        this.scrubPreview.classList.add('visible');
        
        // Показываем миниатюру, если доступна
        this.showThumbnailAtTime(time);
    }
    
    showThumbnailAtTime(time) {
        // Если есть шаблон для миниатюр
        if (this.root.dataset.thumbnails) {
            const thumbTime = Math.floor(time);
            const thumbUrl = this.root.dataset.thumbnails.replace('{time}', thumbTime);
            
            // Используем кэш для миниатюр
            if (!this.thumbnailsCache[thumbTime]) {
                this.thumbnailsCache[thumbTime] = thumbUrl;
            }
            
            const thumbnail = this.scrubPreview.querySelector('.scrub-thumbnail');
            thumbnail.style.backgroundImage = `url(${this.thumbnailsCache[thumbTime]})`;
            
            // Также показываем миниатюру как оверлей
            this.thumbnailOverlay.style.backgroundImage = `url(${this.thumbnailsCache[thumbTime]})`;
            this.thumbnailOverlay.classList.add('visible');
        }
    }
    
    hideSeekPreview() {
        this.scrubPreview.classList.remove('visible');
        this.thumbnailOverlay.classList.remove('visible');
    }
    
    formatTime(time) {
        const h = Math.floor(time / 3600);
        const m = Math.floor((time % 3600) / 60);
        const s = Math.floor(time % 60).toString().padStart(2, '0');
        
        if (h > 0) {
            return `${h}:${m.toString().padStart(2, '0')}:${s}`;
        } else {
            return `${m}:${s}`;
        }
    }
    
    createRippleEffect(element, event) {
        const ripple = document.createElement('div');
        ripple.className = 'ripple-effect';
        
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
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

    toggle(){
        if(this.video.paused){
            this.video.play();
            this.playBtn.innerHTML='<i class="fas fa-pause"></i>';
        } else{
            this.video.pause();
            this.playBtn.innerHTML='<i class="fas fa-play"></i>';
        }
    }
    
    updatePlayButton() {
        this.playBtn.innerHTML = this.video.paused ? 
            '<i class="fas fa-play"></i>' : 
            '<i class="fas fa-pause"></i>';
    }

    updateProgress(){
        const pct = (this.video.currentTime / this.video.duration) * 100;
        this.progress.style.width = pct + '%';
        this.updateTime();
    }

    updateBuffer() {
        if (this.video.buffered.length > 0) {
            const bufferedEnd = this.video.buffered.end(this.video.buffered.length - 1);
            const duration = this.video.duration;
            if (duration > 0) {
                this.buffer.style.width = (bufferedEnd / duration) * 100 + '%';
            }
        }
    }

    updateTime(){
        this.time.textContent = `${this.formatTime(this.video.currentTime)} / ${this.formatTime(this.video.duration)}`;
    }

    updateVolumeIcon() {
        if (this.video.muted || this.video.volume === 0) {
            this.volumeBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
            this.volumeSlider.value = 0;
        } else if (this.video.volume < 0.5) {
            this.volumeBtn.innerHTML = '<i class="fas fa-volume-down"></i>';
        } else {
            this.volumeBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
        }
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.root.requestFullscreen().catch(err => {
                console.error(`Ошибка при переходе в полноэкранный режим: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }

    async togglePip() {
        try {
            if (this.video !== document.pictureInPictureElement) {
                await this.video.requestPictureInPicture();
            } else {
                await document.exitPictureInPicture();
            }
        } catch (error) {
            console.error('Ваш браузер не поддерживает Picture-in-Picture!');
        }
    }

    play(){ this.video.play(); this.playBtn.innerHTML='<i class="fas fa-pause"></i>'; }
    pause(){ this.video.pause(); this.playBtn.innerHTML='<i class="fas fa-play"></i>'; }
    setSource(url){ this.video.src=url; this.video.play(); this.playBtn.innerHTML='<i class="fas fa-pause"></i>'; }
}

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
