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

    this.playBtn = document.createElement('button');
    this.playBtn.className = 'btn';
    this.playBtn.innerHTML = '▶';
    controls.appendChild(this.playBtn);

    this.time = document.createElement('span');
    this.time.className = 'time';
    this.time.textContent = '0:00 / 0:00';
    controls.appendChild(this.time);

    this.progress = document.createElement('div');
    this.progress.className = 'progress';
    this.filled = document.createElement('div');
    this.filled.className = 'filled';
    this.progress.appendChild(this.filled);
    controls.appendChild(this.progress);

    this.speedSelect = document.createElement('select');
    this.speedSelect.className = 'speed-select';
    ['0.5x','1x','1.5x','2x'].forEach(s=>{
      const opt = document.createElement('option');
      opt.value = parseFloat(s);
      opt.textContent = s;
      this.speedSelect.appendChild(opt);
    });
    controls.appendChild(this.speedSelect);

    this.downloadBtn = document.createElement('button');
    this.downloadBtn.className = 'download-btn';
    this.downloadBtn.textContent = 'Скачать';
    controls.appendChild(this.downloadBtn);

    // Качество видео (если есть разные src)
    if(this.root.dataset.sources){
      this.qualitySelect = document.createElement('select');
      this.qualitySelect.className = 'quality-select';
      const sources = JSON.parse(this.root.dataset.sources);
      sources.forEach(s=>{
        const opt = document.createElement('option');
        opt.value = s.url;
        opt.textContent = s.label;
        this.qualitySelect.appendChild(opt);
      });
      controls.appendChild(this.qualitySelect);
    }

    this.root.appendChild(controls);
  }

  bindEvents() {
    this.playBtn.addEventListener('click', () => this.toggle());
    this.video.addEventListener('timeupdate', () => this.updateProgress());
    this.video.addEventListener('loadedmetadata', () => this.updateTime());

    this.progress.addEventListener('click', e => {
      const rect = this.progress.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      this.video.currentTime = pct * this.video.duration;
    });

    this.speedSelect.addEventListener('change', ()=>{
      this.video.playbackRate = parseFloat(this.speedSelect.value);
    });

    this.downloadBtn.addEventListener('click', ()=>{
      const a = document.createElement('a');
      a.href = this.video.currentSrc;
      a.download = 'video.mp4';
      a.click();
    });

    if(this.qualitySelect){
      this.qualitySelect.addEventListener('change', ()=>{
        const t = this.video.currentTime;
        this.video.src = this.qualitySelect.value;
        this.video.currentTime = t;
        this.video.play();
      });
    }
  }

  toggle() {
    if(this.video.paused){
      this.video.play();
      this.playBtn.innerHTML = '⏸';
    } else {
      this.video.pause();
      this.playBtn.innerHTML = '▶';
    }
  }

  updateProgress() {
    const pct = (this.video.currentTime / this.video.duration)*100;
    this.filled.style.width = pct + '%';
    this.updateTime();
  }

  updateTime() {
    const format = t => {
      const m = Math.floor(t/60);
      const s = Math.floor(t%60).toString().padStart(2,'0');
      return `${m}:${s}`;
    };
    this.time.textContent = `${format(this.video.currentTime)} / ${format(this.video.duration)}`;
  }

  play(){ this.video.play(); this.playBtn.innerHTML = '⏸'; }
  pause(){ this.video.pause(); this.playBtn.innerHTML = '▶'; }
  setSource(url){ this.video.src=url; this.video.play(); this.playBtn.innerHTML='⏸'; }
}

(function(){
  function boot() {
    document.querySelectorAll('.reaver-player').forEach(el=>{
      if(!el.player) new ReaverPlayer(el);
    });
  }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',boot);
  } else boot();
  window.ReaverPlayer = ReaverPlayer;
})();

