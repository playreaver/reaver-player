(function(){

  const faLink = document.createElement('link');
  faLink.rel = 'stylesheet';
  faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
  document.head.appendChild(faLink);

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    .wws-menu-trigger {
      position: fixed;
      left: 30px;
      bottom: 30px;
      z-index: 10000;
      width: 70px;
      height: 70px;
      border-radius: 50%;
      backdrop-filter: blur(25px) saturate(200%);
      background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%);
      border: 1px solid rgba(255, 255, 255, 0.25);
      color: #fff;
      font-family: 'Inter', system-ui, sans-serif;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      box-shadow: 
        0 12px 40px rgba(0, 0, 0, 0.25),
        inset 0 1px 0 rgba(255, 255, 255, 0.3),
        inset 0 -1px 0 rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .wws-menu-trigger::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at 30% 30%, rgba(120, 119, 198, 0.3) 0%, transparent 70%);
      opacity: 0;
      transition: opacity 0.4s ease;
    }

    .wws-menu-trigger::after {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      background: conic-gradient(from 0deg, #ff6b6b, #ee5a24, #fbc531, #4cd137, #00a8ff, #9c88ff, #ff6b6b);
      border-radius: 50%;
      z-index: -1;
      opacity: 0;
      transition: opacity 0.4s ease;
    }

    .wws-menu-trigger:hover {
      transform: translateY(-3px) scale(1.08);
      box-shadow: 
        0 20px 50px rgba(0, 0, 0, 0.35),
        inset 0 1px 0 rgba(255, 255, 255, 0.4),
        inset 0 -1px 0 rgba(0, 0, 0, 0.05);
    }

    .wws-menu-trigger:hover::before {
      opacity: 1;
    }

    .wws-menu-trigger:hover::after {
      opacity: 1;
      animation: rotate 3s linear infinite;
    }

    @keyframes rotate {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .wws-menu-trigger i {
      font-size: 24px;
      transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      position: relative;
      z-index: 2;
      text-shadow: 0 2px 10px rgba(0,0,0,0.2);
    }

    .wws-menu-trigger.active i {
      transform: rotate(90deg);
    }

    .wws-menu-overlay {
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: none;
    }

    .wws-menu-overlay.active {
      display: block;
    }

    .wws-menu-backdrop {
      position: absolute;
      inset: 0;
      backdrop-filter: blur(30px) brightness(0.6);
      background: rgba(10, 10, 15, 0.7);
      opacity: 0;
      transition: opacity 0.6s cubic-bezier(0.23, 1, 0.32, 1);
    }

    .wws-menu-overlay.active .wws-menu-backdrop {
      opacity: 1;
    }

    .wws-menu-container {
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 420px;
      transform: translateX(-100%) perspective(1000px) rotateY(10deg);
      transition: transform 0.8s cubic-bezier(0.23, 1, 0.32, 1);
      padding: 40px 0;
    }

    .wws-menu-overlay.active .wws-menu-container {
      transform: translateX(0) perspective(1000px) rotateY(0deg);
    }

    .wws-menu-shell {
      height: 100%;
      background: linear-gradient(135deg, rgba(25, 25, 35, 0.95) 0%, rgba(15, 15, 25, 0.98) 100%);
      border-right: 1px solid rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(50px) saturate(200%);
      padding: 40px 35px;
      color: #fff;
      font-family: 'Inter', system-ui, sans-serif;
      box-shadow: 
        25px 0 80px rgba(0, 0, 0, 0.5),
        inset 1px 0 0 rgba(255, 255, 255, 0.1);
      overflow-y: auto;
      position: relative;
    }

    .wws-menu-shell::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    }

    .wws-menu-header {
      margin-bottom: 50px;
      padding-bottom: 30px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      position: relative;
      transform: translateX(-50px);
      opacity: 0;
      transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1) 0.2s;
    }

    .wws-menu-overlay.active .wws-menu-header {
      transform: translateX(0);
      opacity: 1;
    }

    .wws-menu-header h2 {
      margin: 0 0 12px 0;
      font-size: 32px;
      font-weight: 700;
      background: linear-gradient(135deg, #fff 0%, #a78bfa 50%, #60a5fa 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-size: 200% 200%;
      animation: gradientShift 4s ease infinite;
    }

    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    .wws-menu-header p {
      margin: 0;
      font-size: 15px;
      opacity: 0.8;
      font-weight: 300;
      letter-spacing: 0.5px;
    }

    .wws-menu-items {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .wws-menu-item {
      padding: 22px 25px;
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      gap: 18px;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
      text-decoration: none;
      color: #fff;
      position: relative;
      overflow: hidden;
      transform: translateX(-60px);
      opacity: 0;
    }

    .wws-menu-overlay.active .wws-menu-item {
      transform: translateX(0);
      opacity: 1;
    }

    .wws-menu-item:nth-child(1) { transition-delay: 0.3s; }
    .wws-menu-item:nth-child(2) { transition-delay: 0.4s; }
    .wws-menu-item:nth-child(3) { transition-delay: 0.5s; }
    .wws-menu-item:nth-child(4) { transition-delay: 0.6s; }

    .wws-menu-item::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, 
        transparent, 
        rgba(255, 255, 255, 0.1), 
        transparent
      );
      transition: left 0.7s ease;
    }

    .wws-menu-item:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.2);
      transform: translateX(15px) scale(1.02);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }

    .wws-menu-item:hover::before {
      left: 100%;
    }

    .wws-menu-item:hover .wws-menu-icon {
      transform: scale(1.15) rotate(5deg);
      background: linear-gradient(135deg, #a78bfa, #60a5fa);
    }

    .wws-menu-icon {
      width: 50px;
      height: 50px;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      font-size: 20px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .wws-menu-content {
      flex: 1;
    }

    .wws-menu-title {
      font-weight: 600;
      font-size: 16px;
      margin-bottom: 4px;
    }

    .wws-menu-desc {
      font-size: 13px;
      opacity: 0.7;
      font-weight: 300;
    }

    .wws-menu-badge {
      background: linear-gradient(135deg, #a78bfa, #60a5fa);
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(96, 165, 250, 0.3);
    }

    .wws-menu-item:hover .wws-menu-badge {
      transform: scale(1.08);
      box-shadow: 0 6px 20px rgba(96, 165, 250, 0.4);
    }

    .wws-menu-footer {
      position: absolute;
      bottom: 40px;
      left: 35px;
      right: 35px;
      text-align: center;
      font-size: 13px;
      opacity: 0.5;
      transform: translateY(30px);
      opacity: 0;
      transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
    }

    .wws-menu-overlay.active .wws-menu-footer {
      transform: translateY(0);
      opacity: 0.5;
      transition-delay: 0.7s;
    }

    @keyframes pulse-glow {
      0% { box-shadow: 0 0 0 0 rgba(167, 139, 250, 0.4); }
      70% { box-shadow: 0 0 0 15px rgba(167, 139, 250, 0); }
      100% { box-shadow: 0 0 0 0 rgba(167, 139, 250, 0); }
    }

    .wws-menu-trigger.pulse {
      animation: pulse-glow 3s infinite;
    }

    @media (max-width: 768px) {
      .wws-menu-container {
        width: 100%;
      }
      
      .wws-menu-trigger {
        left: 20px;
        bottom: 20px;
        width: 60px;
        height: 60px;
      }
    }
  `;

  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMenu);
  } else {
    initMenu();
  }

  function initMenu() {

    const btn = document.createElement("button");
    btn.className = "wws-menu-trigger pulse";
    btn.innerHTML = `<i class="fas fa-compass"></i>`;
    document.body.appendChild(btn);


    const overlay = document.createElement("div");
    overlay.className = "wws-menu-overlay";
    overlay.innerHTML = `
      <div class="wws-menu-backdrop"></div>
      <div class="wws-menu-container">
        <div class="wws-menu-shell">
          <div class="wws-menu-header">
            <h2>WWS Navigation</h2>
            <p>Откройте для себя все возможности платформы</p>
          </div>

          <div class="wws-menu-items">
            <a class="wws-menu-item" href="https://wws.com" target="_blank">
              <div class="wws-menu-icon">
                <i class="fas fa-rocket"></i>
              </div>
              <div class="wws-menu-content">
                <div class="wws-menu-title">Основной сайт WWS</div>
                <div class="wws-menu-desc">Главный портал компании</div>
              </div>
              <div class="wws-menu-badge">NEW</div>
            </a>

            <a class="wws-menu-item" href="https://reaver-gradient.example" target="_blank">
              <div class="wws-menu-icon">
                <i class="fas fa-palette"></i>
              </div>
              <div class="wws-menu-content">
                <div class="wws-menu-title">Reaver Gradient</div>
                <div class="wws-menu-desc">Создание градиентов</div>
              </div>
            </a>

            <a class="wws-menu-item" href="https://reaver-markdown.example" target="_blank">
              <div class="wws-menu-icon">
                <i class="fas fa-file-alt"></i>
              </div>
              <div class="wws-menu-content">
                <div class="wws-menu-title">Reaver Markdown</div>
                <div class="wws-menu-desc">Редактор Markdown</div>
              </div>
            </a>

            <a class="wws-menu-item" href="https://reaver-table.example" target="_blank">
              <div class="wws-menu-icon">
                <i class="fas fa-table"></i>
              </div>
              <div class="wws-menu-content">
                <div class="wws-menu-title">Reaver Table</div>
                <div class="wws-menu-desc">Работа с таблицами</div>
              </div>
            </a>
          </div>

          <div class="wws-menu-footer">
            WWS Platform &copy; 2024 • Все права защищены
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    let isAnimating = false;

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (isAnimating) return;
      
      const isOpening = !overlay.classList.contains('active');
      toggleMenu(isOpening);
    });

    overlay.addEventListener('click', (e) => {
      if (e.target.classList.contains('wws-menu-backdrop')) {
        toggleMenu(false);
      }
    });

    document.addEventListener("keydown", (e) => {
      if(e.key === "Escape" && overlay.classList.contains('active')){
        toggleMenu(false);
      }
    });

    function toggleMenu(open) {
      isAnimating = true;
      
      if (open) {
        overlay.classList.add('active');
        btn.classList.add('active');
        btn.classList.remove('pulse');
        setTimeout(() => {
          isAnimating = false;
        }, 800);
      } else {
        overlay.classList.remove('active');
        btn.classList.remove('active');
        setTimeout(() => {
          btn.classList.add('pulse');
          isAnimating = false;
        }, 600);
      }
    }

    overlay.querySelector('.wws-menu-shell').addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

})();
