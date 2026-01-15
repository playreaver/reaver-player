(function(){
  // -----------------------------
  // Конфиг
  // -----------------------------
  const HOLD_TIME = 3000; // ms для hold-to-continue
  const BLOCK_BASE = 30000; // базовое время блокировки 30s
  const RISK_THRESHOLD = 30; // после чего снова проверка
  const SUPER_RISK = 66; // выше чего блокируем
  const WIDGET_POS = 'bottom-right'; // где виджет
  
  // -----------------------------
  // Helper функции
  // -----------------------------
  function randomMathExpression(){
    const a = Math.floor(Math.random()*10+1);
    const b = Math.floor(Math.random()*10+1);
    const ops = ['+','-','*'];
    const op = ops[Math.floor(Math.random()*3)];
    let answer;
    switch(op){
      case '+': answer=a+b; break;
      case '-': answer=a-b; break;
      case '*': answer=a*b; break;
    }
    return {question:`${a} ${op} ${b}`, answer};
  }

  function createWidget(){
    const w = document.createElement('div');
    w.id = 'wws-widget';
    w.style.cssText = 'position:fixed;right:20px;bottom:20px;width:200px;background:rgba(0,0,0,0.8);color:#fff;font-family:sans-serif;border-radius:8px;padding:8px;box-shadow:0 4px 12px rgba(0,0,0,0.5);z-index:9999;transition:all 0.3s;cursor:pointer;';
    w.innerHTML = `
      <div id="wws-header" style="display:flex;justify-content:space-between;align-items:center;">
        <span id="wws-risk-label">Safe</span>
        <span id="wws-toggle" style="cursor:pointer;">⯈</span>
      </div>
      <div id="wws-body" style="display:none;margin-top:5px;font-size:12px;">
        <ul style="padding-left:18px;">
          <li id="wws-mouse">Mouse jitter: 0</li>
          <li id="wws-click">Click variance: 0ms</li>
          <li id="wws-scroll">Scroll pattern: normal</li>
          <li id="wws-focus">Focus changes: 0</li>
        </ul>
      </div>
    `;
    document.body.appendChild(w);

    const header = document.getElementById('wws-header');
    const body = document.getElementById('wws-body');
    document.getElementById('wws-toggle').onclick = ()=>body.style.display = body.style.display==='none'?'block':'none';
    return w;
  }

  function showProtectScreen(type){
    const overlay = document.createElement('div');
    overlay.id='wws-protect-overlay';
    overlay.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:#111;color:#fff;display:flex;flex-direction:column;justify-content:center;align-items:center;z-index:10000;font-family:sans-serif;';
    
    if(type==='math'){
      const {question, answer} = randomMathExpression();
      overlay.innerHTML = `<div style="text-align:center;"><p>Solve: <strong>${question}</strong></p>
      <input id="wws-math-input" style="padding:5px;margin-top:5px;"><br>
      <button id="wws-math-btn" style="margin-top:5px;padding:5px 10px;">Submit</button></div>`;
      document.body.appendChild(overlay);
      document.getElementById('wws-math-btn').onclick = ()=>{
        const val = document.getElementById('wws-math-input').value;
        if(parseInt(val) === answer){
          localStorage.setItem('wwsProtectPassed','true');
          document.body.removeChild(overlay);
        } else {
          alert('Incorrect, try again.');
        }
      }
    } else if(type==='hold'){
      overlay.innerHTML = `<div style="text-align:center;">
        <p>Hold the button ${HOLD_TIME/1000} sec to continue</p>
        <button id="wws-hold-btn" style="padding:10px 20px;">Hold</button>
        <div id="wws-hold-bar" style="width:0%;height:5px;background:#0f0;margin-top:5px;"></div>
      </div>`;
      document.body.appendChild(overlay);
      const btn = document.getElementById('wws-hold-btn');
      const bar = document.getElementById('wws-hold-bar');
      let holdStart=0, interval;
      btn.onmousedown = ()=>{
        holdStart = Date.now();
        interval = setInterval(()=>{
          let perc = Math.min(100,(Date.now()-holdStart)/HOLD_TIME*100);
          bar.style.width = perc+'%';
        },50);
      };
      btn.onmouseup = ()=>{
        clearInterval(interval);
        bar.style.width='0%';
        if(Date.now()-holdStart >= HOLD_TIME){
          localStorage.setItem('wwsProtectPassed','true');
          document.body.removeChild(overlay);
        }
      };
    }
  }

  // -----------------------------
  // Поведенческие сборы
  // -----------------------------
  let mouseMoves=[], clickIntervals=[], lastClick=Date.now(), focusChanges=0, lastScroll=0;
  document.addEventListener('mousemove', e=>{
    const t=Date.now();
    mouseMoves.push({x:e.clientX,y:e.clientY,t});
    if(mouseMoves.length>50) mouseMoves.shift();
  });
  document.addEventListener('click', e=>{
    const t=Date.now();
    clickIntervals.push(t-lastClick);
    lastClick=t;
    if(clickIntervals.length>20) clickIntervals.shift();
  });
  window.addEventListener('focus', ()=>focusChanges++);
  window.addEventListener('blur', ()=>focusChanges++);

  let scrollPattern='normal';
  window.addEventListener('scroll', ()=>{
    const pos=window.scrollY;
    scrollPattern = Math.abs(pos-lastScroll)>50?'fast':'normal';
    lastScroll=pos;
  });

  // -----------------------------
  // Risk calculation
  // -----------------------------
  function calcRisk(){
    let risk=0;
    if(navigator.webdriver) risk+=40;

    // mouse jitter
    if(mouseMoves.length>=2){
      let jitter=0;
      for(let i=1;i<mouseMoves.length;i++){
        const dx=mouseMoves[i].x-mouseMoves[i-1].x;
        const dy=mouseMoves[i].y-mouseMoves[i-1].y;
        jitter+=Math.sqrt(dx*dx+dy*dy);
      }
      jitter/=mouseMoves.length;
      if(jitter<2) risk+=20;
    }

    // click variance
    if(clickIntervals.length>=2){
      const avg = clickIntervals.reduce((a,b)=>a+b,0)/clickIntervals.length;
      const variance = clickIntervals.reduce((a,b)=>a+Math.pow(b-avg,2),0)/clickIntervals.length;
      if(variance<15) risk+=10;
    }

    if(scrollPattern==='fast') risk+=10;
    if(focusChanges>5) risk+=10;

    risk=Math.min(100,risk);
    localStorage.setItem('wwsProtectLastRisk',risk);
    return risk;
  }

  // -----------------------------
  // Widget
  // -----------------------------
  const widget=createWidget();
  const riskLabel=document.getElementById('wws-risk-label');
  const mouseLi=document.getElementById('wws-mouse');
  const clickLi=document.getElementById('wws-click');
  const scrollLi=document.getElementById('wws-scroll');
  const focusLi=document.getElementById('wws-focus');

  function updateWidget(){
    const r=calcRisk();
    riskLabel.innerText = r<31?'Safe':r<66?'Suspicious':'High Risk';
    riskLabel.style.color = r<31?'#0f0':r<66?'#ff0':'#f00';
    mouseLi.innerText='Mouse jitter: '+ (mouseMoves.length>=2?mouseMoves.map((m,i)=>i>0?Math.sqrt(Math.pow(m.x-mouseMoves[i-1].x,2)+Math.pow(m.y-mouseMoves[i-1].y,2)):0).reduce((a,b)=>a+b,0)/mouseMoves.length:0).toFixed(2);
    clickLi.innerText='Click variance: '+ (clickIntervals.length>0?Math.round(clickIntervals.reduce((a,b)=>a+Math.pow(b-(clickIntervals.reduce((x,y)=>x+y,0)/clickIntervals.length),2),0)/clickIntervals.length):0)+'ms';
    scrollLi.innerText='Scroll pattern: '+scrollPattern;
    focusLi.innerText='Focus changes: '+focusChanges;
  }
  setInterval(updateWidget,500);

  // -----------------------------
  // Проверка блокировки / капчи
  // -----------------------------
  function initProtect(){
    const blockedUntil = parseInt(localStorage.getItem('wwsProtectBlockedUntil')||0);
    const now = Date.now();
    if(blockedUntil && blockedUntil>now){
      const overlay = document.createElement('div');
      overlay.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:#111;color:#fff;display:flex;justify-content:center;align-items:center;font-size:24px;z-index:10000;';
      overlay.innerText = `Blocked! Wait...`;
      document.body.appendChild(overlay);
      let interval = setInterval(()=>{
        const remain = blockedUntil-Date.now();
        if(remain<=0){ clearInterval(interval); document.body.removeChild(overlay);}
        else overlay.innerText = `Blocked! Wait ${Math.ceil(remain/1000)}s`;
      },500);
      return;
    }

    const passed = localStorage.getItem('wwsProtectPassed')==='true';
    const lastRisk = parseInt(localStorage.getItem('wwsProtectLastRisk')||0);
    if(!passed || lastRisk>RISK_THRESHOLD){
      // выбор варианта капчи случайно
      const type = Math.random()>0.5?'math':'hold';
      showProtectScreen(type);
    }
  }

  initProtect();

})();
