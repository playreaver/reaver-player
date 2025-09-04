class ReaverPlayer {
  constructor(root) {
    this.root = root;
    const src = root.dataset.src;
    this.video = document.createElement('video');
    this.video.src = src;
    this.video.controls = true; 
    root.appendChild(this.video);
    root.player = this; 
  }
  play(){ this.video.play(); }
  pause(){ this.video.pause(); }
  setSource(url){ this.video.src = url; this.video.play(); }
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
