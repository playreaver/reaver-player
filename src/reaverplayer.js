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
        this.videoContainer.appendChild(this.scrubPreview);

        // Индикатор уровня громкости
        this.volumeLevel = document.createElement('div');
        this.volumeLevel.className = 'volume-level';
        this.videoContainer.appendChild(this.volumeLevel);

        // Области для сенсорного управления
        this.touchActions = document.createElement('div');
        this.touchActions.className = 'touch-actions';
        this.touchActions.innerHTML = `
            <div class="touch-left"></div>
            <div class="touch-center"></div>
            <div class="touch-right"></div>
        `;
        this.videoContainer.appendChild(this.touchActions);

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
        
        // Переменные для обработки касаний
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchStartTime = 0;
        this.touchStartVolume = 1;
        this.seeking = false;
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
        this.speedSelect.querySelectorAll('option').forEach(opt => {
            if (opt.value === 1) opt.selected = true;
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
                if (s.default) opt.selected = true;
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
    }

    bindEvents() {
        this.playBtn.addEventListener('click', ()=>this.toggle());
        
        // Клик по видео для паузы/воспроизведения
        this.video.addEventListener('click', (e) => {
            if (e.target.closest('.controls') || e.target.closest('.btn') || this.seeking) return;
            this.toggle();
            this.showCenterPlayButton();
        });
        
        this.video.addEventListener('dblclick', () => this.toggleFullscreen());
        
        this.video.addEventListener('timeupdate', ()=>this.updateProgress());
        this.video.addEventListener('progress', ()=>this.updateBuffer());
        this.video.addEventListener('loadedmetadata', ()=> {
            this.updateTime();
            this.updateBuffer();
        });
        this.video.addEventListener('volumechange', ()=>this.updateVolumeIcon());
        this.video.addEventListener('seeked', ()=>this.hideLoading());
        
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
            this.showVolumeLevel();
        });

        this.volumeBtn.addEventListener('click', ()=>{
            this.video.muted = !this.video.muted;
            this.updateVolumeIcon();
            this.showVolumeLevel();
        });

        this.volumeBtn.addEventListener('mouseenter', () => {
            if (window.innerWidth <= 768) {
                this.volumeSliderContainer.classList.add('visible');
            }
        });

        this.volumeBtn.addEventListener('mouseleave', () => {
            if (window.innerWidth <= 768) {
                setTimeout(() => {
                    this.volumeSliderContainer.classList.remove('visible');
                }, 2000);
            }
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
            a.href = this.video.currentSrc || this.video.src;
            a.download = 'video.mp4';
            a.click();
        });

        // Качество
        if(this.qualitySelect){
            this.qualitySelect.addEventListener('change', ()=>{
                const t = this.video.currentTime;
                const wasPlaying = !this.video.paused;
                this.video.src = this.qualitySelect.value;
                this.video.currentTime = t;
                if (wasPlaying) this.video.play();
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
        
        // Обработка сенсорных событий для управления громкостью и перемоткой
        this.setupTouchControls();
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
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
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
                    this.showVolumeLevel();
                    break;
                case 'arrowdown':
                    this.video.volume = Math.max(this.video.volume - 0.1, 0);
                    this.volumeSlider.value = this.video.volume;
                    this.updateVolumeIcon();
                    this.showVolumeLevel();
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
                    this.showVolumeLevel();
                    break;
            }
        });
    }
    
    setupTouchControls() {
        const leftZone = this.touchActions.querySelector('.touch-left');
        const rightZone = this.touchActions.querySelector('.touch-right');
        const centerZone = this.touchActions.querySelector('.touch-center');
        
        // Левая зона - перемотка
        leftZone.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
            this.touchStartTime = this.video.currentTime;
            this.seeking = true;
        });
        
        leftZone.addEventListener('touchmove', (e) => {
            if (!this.seeking) return;
            
            const deltaX = e.touches[0].clientX - this.touchStartX;
            const deltaTime = (deltaX / window.innerWidth) * this.video.duration;
            
            let newTime = this.touchStartTime + deltaTime;
            newTime = Math.max(0, Math.min(newTime, this.video.duration));
            
            this.video.currentTime = newTime;
            
            // Показываем preview времени
            this.scrubPreview.textContent = `${this.formatTime(newTime)} / ${this.formatTime(this.video.duration)}`;
            this.scrubPreview.style.left = `${this.touchStartX + deltaX}px`;
            this.scrubPreview.classList.add('visible');
        });
        
        leftZone.addEventListener('touchend', () => {
            this.seeking = false;
            this.scrubPreview.classList.remove('visible');
        });
        
        // Правая зона - громкость
        rightZone.addEventListener('touchstart', (e) => {
            this.touchStartY = e.touches[0].clientY;
            this.touchStartVolume = this.video.volume;
        });
        
        rightZone.addEventListener('touchmove', (e) => {
            const deltaY = this.touchStartY - e.touches[0].clientY;
            const newVolume = Math.max(0, Math.min(this.touchStartVolume + (deltaY / 200), 1));
            
            this.video.volume = newVolume;
            this.volumeSlider.value = newVolume;
            this.updateVolumeIcon();
            this.showVolumeLevel();
        });
        
        // Центральная зона - показать/скрыть controls
        centerZone.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                this.toggleControls();
            } else if (e.touches.length === 2) {
                this.toggle();
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
    
    showVolumeLevel() {
        const volumeText = this.video.muted ? 'Muted' : `${Math.round(this.video.volume * 100)}%`;
        this.volumeLevel.textContent = volumeText;
        this.volumeLevel.classList.add('visible');
        
        clearTimeout(this.volumeLevelTimeout);
        this.volumeLevelTimeout = setTimeout(() => {
            this.volumeLevel.classList.remove('visible');
        }, 1000);
    }
    
    seek(e) {
        const rect = this.progressContainer.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        this.video.currentTime = pct * this.video.duration;
        this.createRippleEffect(this.progressContainer, e);
    }
    
    previewSeek(e) {
        const rect = this.progressContainer.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const time = pct * this.video.duration;
        
        this.scrubPreview.textContent = `${this.formatTime(time)} / ${this.formatTime(this.video.duration)}`;
        
        // Ограничиваем позицию preview в пределах видео
        const previewWidth = this.scrubPreview.offsetWidth;
        const maxLeft = rect.width - previewWidth / 2;
        const left = Math.max(previewWidth / 2, Math.min(e.clientX - rect.left, maxLeft));
        
        this.scrubPreview.style.left = `${left}px`;
        this.scrubPreview.classList.add('visible');
    }
    
    hideSeekPreview() {
        this.scrubPreview.classList.remove('visible');
    }
    
    formatTime(time) {
        if (isNaN(time)) return '0:00';
        
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor((time % 3600) / 60);
        const seconds = Math.floor(time % 60);
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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
            this.video.play().catch(e => console.error("Ошибка воспроизведения:", e));
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
            if (this.root.requestFullscreen) {
                this.root.requestFullscreen().catch(err => {
                    console.error("Ошибка полноэкранного режима:", err);
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
            } else {
                await document.exitPictureInPicture();
            }
        } catch (error) {
            console.error('Picture-in-Picture не поддерживается:', error);
        }
    }

    play(){ 
        this.video.play().catch(e => console.error("Ошибка воспроизведения:", e)); 
        this.playBtn.innerHTML='<i class="fas fa-pause"></i>'; 
    }
    
    pause(){ 
        this.video.pause(); 
        this.playBtn.innerHTML='<i class="fas fa-play"></i>'; 
    }
    
    setSource(url){ 
        this.video.src = url; 
        this.video.play().catch(e => console.error("Ошибка воспроизведения:", e)); 
        this.playBtn.innerHTML='<i class="fas fa-pause"></i>'; 
    }
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
