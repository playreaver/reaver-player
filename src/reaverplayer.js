class ReaverPlayer {
    constructor(root) {
        this.root = root;
        const src = root.dataset.src;

        this.video = document.createElement('video');
        this.video.src = src;
        this.video.preload = 'metadata';
        this.video.style.display = 'block';
        root.appendChild(this.video);

        this.createControls();

        root.player = this;
        this.bindEvents();
    }

    createControls() {
        const controls = document.createElement('div');
        controls.className = 'controls';

        // Play/Pause
        this.playBtn = document.createElement('button');
        this.playBtn.className = 'btn';
        this.playBtn.innerHTML = '▶';
        this.playBtn.title = 'Play/Pause';
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
        this.volumeBtn.innerHTML = '🔊';
        this.volumeBtn.title = 'Volume';
        
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
        this.fullscreenBtn.innerHTML = '⛶';
        this.fullscreenBtn.title = 'Fullscreen';
        controls.appendChild(this.fullscreenBtn);

        // Picture-in-Picture
        this.pipBtn = document.createElement('button');
        this.pipBtn.className = 'btn pip-btn';
        this.pipBtn.innerHTML = '📌';
        this.pipBtn.title = 'Picture in Picture';
        controls.appendChild(this.pipBtn);

        // Меню
        this.menu = document.createElement('div');
        this.menu.className = 'menu';

        this.menuBtn = document.createElement('button');
        this.menuBtn.className = 'menu-btn';
        this.menuBtn.innerHTML = '⚙️';
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
        this.downloadBtn.textContent = 'Скачать видео';
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
        this.subBtn.textContent = 'Субтитры';
        this.menuContent.appendChild(this.subBtn);

        this.menu.appendChild(this.menuContent);
        controls.appendChild(this.menu);

        // Название плеера
        const titleElement = document.createElement('div');
        titleElement.className = 'player-title';
        titleElement.textContent = 'Reaver Player v2.0';
        this.root.appendChild(titleElement);

        this.root.appendChild(controls);
    }

    bindEvents() {
        this.playBtn.addEventListener('click', ()=>this.toggle());
        this.video.addEventListener('timeupdate', ()=>this.updateProgress());
        this.video.addEventListener('progress', ()=>this.updateBuffer());
        this.video.addEventListener('loadedmetadata', ()=>this.updateTime());
        this.video.addEventListener('volumechange', ()=>this.updateVolumeIcon());

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
            this.video.volume = this.video.volume > 0 ? 0 : 1;
            this.volumeSlider.value = this.video.volume;
            this.updateVolumeIcon();
        });

        // Полноэкранный режим
        this.fullscreenBtn.addEventListener('click', ()=>this.toggleFullscreen());

        // Picture-in-Picture
        this.pipBtn.addEventListener('click', ()=>this.togglePip());

        // Меню кнопка
        this.menuBtn.addEventListener('click', ()=>{
            this.menuContent.style.display = this.menuContent.style.display==='block' ? 'none' : 'block';
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

        // Закрытие меню при клике вне его
        document.addEventListener('click', (e) => {
            if (!this.menu.contains(e.target)) {
                this.menuContent.style.display = 'none';
            }
        });
    }

    toggle(){
        if(this.video.paused){
            this.video.play();
            this.playBtn.innerHTML='⏸';
        } else{
            this.video.pause();
            this.playBtn.innerHTML='▶';
        }
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
        this.volumeBtn.innerHTML = this.video.volume === 0 ? '🔇' : 
                                 this.video.volume < 0.5 ? '🔈' : '🔊';
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

    play(){ this.video.play(); this.playBtn.innerHTML='⏸'; }
    pause(){ this.video.pause(); this.playBtn.innerHTML='▶'; }
    setSource(url){ this.video.src=url; this.video.play(); this.playBtn.innerHTML='⏸'; }
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

