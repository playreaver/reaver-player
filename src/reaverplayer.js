class ReaverPlayer {
    constructor(root) {
        this.root = root;
        const src = root.dataset.src;

        // Создаем контейнер для видео
        this.videoContainer = document.createElement('div');
        this.videoContainer.className = 'video-container';
        this.videoContainer.style.position = 'relative';
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
            <div class="loading-text">Загрузка...</div>
        `;
        this.videoContainer.appendChild(this.loadingOverlay);

        // Создаем модальное окно для горячих клавиш
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

        // Создаем оверлей для модальных окон
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
        
        this.volumeSlider = document.createElement('input');
        this.volumeSlider.type = 'range';
        this.volumeSlider.className = 'volume-slider';
        this.volumeSlider.min = 0;
        this.volumeSlider.max = 1;
        this.volumeSlider.step = 0.1;
        this.volumeSlider.value = 1;
        
        this.volumeContainer.appendChild(this.volumeBtn);
        this.volumeContainer.appendChild(this.volumeSlider);
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
    }

    bindEvents() {
        this.playBtn.addEventListener('click', ()=>this.toggle());
        this.video.addEventListener('timeupdate', ()=>this.updateProgress());
        this.video.addEventListener('progress', ()=>this.updateBuffer());
        this.video.addEventListener('loadedmetadata', ()=>this.updateTime());
        this.video.addEventListener('volumechange', ()=>this.updateVolumeIcon());
        
        // События загрузки
        this.video.addEventListener('loadstart', ()=>this.showLoading());
        this.video.addEventListener('canplay', ()=>this.hideLoading());
        this.video.addEventListener('waiting', ()=>this.showLoading());
        this.video.addEventListener('playing', ()=>this.hideLoading());
        this.video.addEventListener('error', ()=>this.hideLoading());

        this.progressContainer.addEventListener('click', e=>{
            const rect = this.progressContainer.getBoundingClientRect();
            const pct = (e.clientX - rect.left)/rect.width;
            this.video.currentTime = pct * this.video.duration;
        });

        // Громкость
        this.volumeSlider.addEventListener('input', ()=>{
            this.video.volume = this.volumeSlider.value;
            this.updateVolumeIcon();
        });

        this.volumeBtn.addEventListener('click', ()=>{
            this.video.muted = !this.video.muted;
            this.updateVolumeIcon();
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
            
            if (this.modalOverlay.style.display === 'block') {
                this.hideShortcutsModal();
            }
        });
        
        // Закрытие модального окна по клику на оверлей
        this.modalOverlay.addEventListener('click', () => {
            this.hideShortcutsModal();
        });
    }
    
    setupFontAwesome() {
        // Проверяем, есть ли уже Font Awesome
        if (!document.querySelector('link[href*="font-awesome"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
            document.head.appendChild(link);
        }
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Игнорируем горячие клавиши, если фокус в поле ввода
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
                return;
            }
            
            switch(e.key.toLowerCase()) {
                case ' ': // Пробел - play/pause
                    e.preventDefault();
                    this.toggle();
                    break;
                case 'k': // K - play/pause
                    this.toggle();
                    break;
                case 's': // S - остановить
                    this.video.pause();
                    this.video.currentTime = 0;
                    this.updatePlayButton();
                    break;
                case 'arrowright': // Стрелка вправо - вперед на 5 сек
                    this.video.currentTime = Math.min(this.video.currentTime + 5, this.video.duration);
                    break;
                case 'arrowleft': // Стрелка влево - назад на 5 сек
                    this.video.currentTime = Math.max(this.video.currentTime - 5, 0);
                    break;
                case 'arrowup': // Стрелка вверх - громкость +
                    this.video.volume = Math.min(this.video.volume + 0.1, 1);
                    this.volumeSlider.value = this.video.volume;
                    this.updateVolumeIcon();
                    break;
                case 'arrowdown': // Стрелка вниз - громкость -
                    this.video.volume = Math.max(this.video.volume - 0.1, 0);
                    this.volumeSlider.value = this.video.volume;
                    this.updateVolumeIcon();
                    break;
                case 'f': // F - полноэкранный режим
                    this.toggleFullscreen();
                    break;
                case 'p': // P - picture in picture
                    this.togglePip();
                    break;
                case 'm': // M - mute/unmute
                    this.video.muted = !this.video.muted;
                    this.updateVolumeIcon();
                    break;
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
        // Показываем подсказку на 5 секунд при загрузке
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
        const pct = (this.video.currentTime / this.video.duration)*100;
        this.progress.style.width = pct+'%';
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
        const format = t=>{
            const m = Math.floor(t/60);
            const s = Math.floor(t%60).toString().padStart(2,'0');
            return `${m}:${s}`;
        };
        this.time.textContent = `${format(this.video.currentTime)} / ${format(this.video.duration)}`;
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
                alert(`Ошибка при переходе в полноэкранный режим: ${err.message}`);
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
            alert('Ваш браузер не поддерживает Picture-in-Picture!');
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
