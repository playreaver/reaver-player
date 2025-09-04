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
    controls.appendChild(this.playBtn);

    // Время
    this.time = document.createElement('span');
    this.time.className = 'time';
    this.time.textContent = '0:00 / 0:00';
    controls.appendChild(this.time);

    // Прогресс
    this.progress = document.createElement('div');
    this.progress.className = 'progress';
    this.filled = document.createElement('div');
    this.filled.className = 'filled';
    this.progress.appendChild(this.filled);
    controls.appendChild(this.progress);

    // Меню
    this.menu = document.createElement('div');
    this.menu.className = 'menu';

    this.menuBtn = document.createElement('button');
    this.menuBtn.className = 'menu-btn';
    this.menuBtn.textContent = 'Меню';
    this.menu.appendChild(this.menuBtn);

    this.menuContent = document.createElement('div');
    this.menuContent.className = 'menu-content';

    // Скорость
    this.speedSelect = document.createElement('select');
    ['0.5x','1x','1.5x','2x'].forEach(s=>{
      const opt = document.createElement('option');
      opt.value = parseFloat(s);
      opt.textContent = s;
      this.speedSelect.appendChild(opt);
    });
    this.menuContent.appendChild(this.speedSelect);

    // Скачать
    this.downloadBtn = document.createElement('button');
    this.downloadBtn.textContent = 'Скачать';
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

    // Новый функционал: Субтитры
    this.subBtn = document.createElement('button');
    this.subBtn.textContent = 'Субтитры';
    this.menuContent.appendChild(this.subBtn);

    this.menu.appendChild(this.menuContent);
    controls.appendChild(this.menu);

    this.root.appendChild(controls);
  }

  bindEvents() {
    this.playBtn.addEventListener('click', ()=>this.toggle());
    this.video.addEventListener('timeupdate', ()=>this.updateProgress());
    this.video.addEventListener('loadedmetadata', ()=>this.updateTime());

    this.progress.addEventListener('click', e=>{
      const rect = this.progress.getBoundingClientRect();
      const pct = (e.clientX - rect.left)/rect.width;
      this.video.currentTime = pct * this.video.duration;
    });

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

    // Субтитры (демо)
    this.subBtn.addEventListener('click', ()=>{
      alert('Функция субтитров пока в разработке!');
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
    this.filled.style.width = pct+'%';
    this.updateTime();
  }

  updateTime(){
    const format = t=>{
      const m = Math.floor(t/60);
      const s = Math.floor(t%60).toString().padStart(2,'0');
      return `${m}:${s}`;
    };
    this.time.textContent = `${format(this.video.currentTime)} / ${format(this.video.duration)}`;
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

