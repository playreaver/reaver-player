(function(){

  const faLink = document.createElement('link');
  faLink.rel = 'stylesheet';
  faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
  document.head.appendChild(faLink);

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    .wws-menu-trigger {
      position: fixed;
      left: 20px;
      bottom: 20px;
      z-index: 10000;
      width: 64px;
      height: 64px;
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
        0 8px 32px rgba(0, 0, 0, 0.2),
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

    .wws-menu-trigger:hover {
      transform: translateY(-2px) scale(1.05);
      box-shadow: 
        0 12px 40px rgba(0, 0, 0, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.4),
        inset 0 -1px 0 rgba(0, 0, 0, 0.05);
    }

    .wws-menu-trigger:hover::before {
      opacity: 1;
    }

    .wws-menu-trigger i {
      font-size: 22px;
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
      pointer-events: none;
    }

    .wws-menu-overlay.active {
      display: block;
      pointer-events: all;
    }

    .wws-menu-backdrop {
      position: absolute;
      inset: 0;
      backdrop-filter: blur(30px) brightness(0.6);
      background: rgba(10, 10, 15, 0.8);
      opacity: 0;
      transition: opacity 0.6s cubic-bezier(0.23, 1, 0.32, 1);
    }

    .wws-menu-overlay.active .wws-menu-backdrop {
      opacity: 1;
    }

    .wws-menu-overlay.closing .wws-menu-backdrop {
      opacity: 0;
    }

    .wws-menu-container {
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: min(420px, 90vw);
      transform: translateX(-100%) scale(0.9);
      transform-origin: left center;
      transition: transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
      padding: 20px 0;
    }

    .wws-menu-overlay.active .wws-menu-container {
      transform: translateX(0) scale(1);
    }

    .wws-menu-overlay.closing .wws-menu-container {
      transform: translateX(-100%) scale(0.9);
    }

    .wws-menu-shell {
      height: 100%;
      background: linear-gradient(135deg, rgba(25, 25, 35, 0.98) 0%, rgba(15, 15, 25, 0.99) 100%);
      border-right: 1px solid rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(50px) saturate(200%);
      padding: 40px 30px;
      color: #fff;
      font-family: 'Inter', system-ui, sans-serif;
      box-shadow: 
        25px 0 80px rgba(0, 0, 0, 0.5),
        inset 1px 0 0 rgba(255, 255, 255, 0.1);
      overflow-y: auto;
      position: relative;
    }

    /* Кастомный скроллбар */
    .wws-menu-shell::-webkit-scrollbar {
      width: 6px;
    }

    .wws-menu-shell::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 3px;
    }

    .wws-menu-shell::-webkit-scrollbar-thumb {
      background: linear-gradient(135deg, #a78bfa, #60a5fa);
      border-radius: 3px;
      transition: all 0.3s ease;
    }

    .wws-menu-shell::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(135deg, #9370db, #4a90e2);
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

    @keyframes slideInItem {
      0% {
        opacity: 0;
        transform: translateX(-50px) scale(0.9);
      }
      100% {
        opacity: 1;
        transform: translateX(0) scale(1);
      }
    }

    @keyframes slideOutItem {
      0% {
        opacity: 1;
        transform: translateX(0) scale(1);
      }
      100% {
        opacity: 0;
        transform: translateX(-30px) scale(0.95);
      }
    }

    @keyframes slideInHeader {
      0% {
        opacity: 0;
        transform: translateY(-30px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes slideOutHeader {
      0% {
        opacity: 1;
        transform: translateY(0);
      }
      100% {
        opacity: 0;
        transform: translateY(-20px);
      }
    }

    .wws-menu-header {
      margin-bottom: 40px;
      padding-bottom: 25px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      position: relative;
      opacity: 0;
    }

    .wws-menu-overlay.active .wws-menu-header {
      animation: slideInHeader 0.6s cubic-bezier(0.23, 1, 0.32, 1) 0.3s forwards;
    }

    .wws-menu-overlay.closing .wws-menu-header {
      animation: slideOutHeader 0.4s cubic-bezier(0.23, 1, 0.32, 1) forwards;
    }

    .wws-menu-header h2 {
      margin: 0 0 12px 0;
      font-size: clamp(24px, 5vw, 32px);
      font-weight: 700;
      background: linear-gradient(135deg, #fff 0%, #a78bfa 50%, #60a5fa 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-size: 200% 200%;
    }

    .wws-menu-header p {
      margin: 0;
      font-size: clamp(13px, 3vw, 15px);
      opacity: 0.8;
      font-weight: 300;
      letter-spacing: 0.5px;
    }

    .wws-menu-items {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .wws-menu-item {
      padding: clamp(16px, 4vw, 22px) clamp(20px, 4vw, 25px);
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      gap: clamp(14px, 3vw, 18px);
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
      text-decoration: none;
      color: #fff;
      position: relative;
      overflow: hidden;
      opacity: 0;
      transform: translateX(-50px) scale(0.9);
    }

    .wws-menu-overlay.active .wws-menu-item {
      animation: slideInItem 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards;
    }

    .wws-menu-overlay.closing .wws-menu-item {
      animation: slideOutItem 0.4s cubic-bezier(0.23, 1, 0.32, 1) forwards;
    }

    .wws-menu-item:nth-child(1) { animation-delay: 0.4s; }
    .wws-menu-item:nth-child(2) { animation-delay: 0.5s; }
    .wws-menu-item:nth-child(3) { animation-delay: 0.6s; }
    .wws-menu-item:nth-child(4) { animation-delay: 0.7s; }
    .wws-menu-item:nth-child(5) { animation-delay: 0.8s; }
    .wws-menu-item:nth-child(6) { animation-delay: 0.9s; }

    .wws-menu-overlay.closing .wws-menu-item:nth-child(1) { animation-delay: 0.1s; }
    .wws-menu-overlay.closing .wws-menu-item:nth-child(2) { animation-delay: 0.2s; }
    .wws-menu-overlay.closing .wws-menu-item:nth-child(3) { animation-delay: 0.3s; }
    .wws-menu-overlay.closing .wws-menu-item:nth-child(4) { animation-delay: 0.4s; }

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
      transform: translateX(8px) scale(1.02);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    }

    .wws-menu-item:hover::before {
      left: 100%;
    }

    .wws-menu-item:hover .wws-menu-icon {
      transform: scale(1.1) rotate(5deg);
      background: linear-gradient(135deg, #a78bfa, #60a5fa);
    }

    .wws-menu-icon {
      width: clamp(44px, 10vw, 50px);
      height: clamp(44px, 10vw, 50px);
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      font-size: clamp(18px, 4vw, 20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      flex-shrink: 0;
    }

    .wws-menu-content {
      flex: 1;
      min-width: 0;
    }

    .wws-menu-title {
      font-weight: 600;
      font-size: clamp(14px, 3vw, 16px);
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .wws-menu-desc {
      font-size: clamp(12px, 2.5vw, 13px);
      opacity: 0.7;
      font-weight: 300;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .wws-menu-badge {
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      border: 1px solid;
      transition: all 0.3s ease;
      flex-shrink: 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .wws-menu-badge.new {
      background: linear-gradient(135deg, #a78bfa, #60a5fa);
      border-color: rgba(255, 255, 255, 0.2);
      box-shadow: 0 4px 15px rgba(96, 165, 250, 0.3);
    }

    .wws-menu-badge.beta {
      background: linear-gradient(135deg, #fbc531, #e84118);
      border-color: rgba(255, 255, 255, 0.2);
      box-shadow: 0 4px 15px rgba(235, 87, 87, 0.3);
    }

    .wws-menu-badge.pro {
      background: linear-gradient(135deg, #00b894, #0984e3);
      border-color: rgba(255, 255, 255, 0.2);
      box-shadow: 0 4px 15px rgba(9, 132, 227, 0.3);
    }

    .wws-menu-badge.free {
      background: linear-gradient(135deg, #00cec9, #fd79a8);
      border-color: rgba(255, 255, 255, 0.2);
      box-shadow: 0 4px 15px rgba(253, 121, 168, 0.3);
    }

    .wws-menu-badge.coming {
      background: linear-gradient(135deg, #636e72, #2d3436);
      border-color: rgba(255, 255, 255, 0.1);
      box-shadow: 0 4px 15px rgba(45, 52, 54, 0.3);
    }

    .wws-menu-item:hover .wws-menu-badge {
      transform: scale(1.05);
    }

    .wws-menu-item:hover .wws-menu-badge.new {
      box-shadow: 0 6px 20px rgba(96, 165, 250, 0.4);
    }

    .wws-menu-item:hover .wws-menu-badge.beta {
      box-shadow: 0 6px 20px rgba(235, 87, 87, 0.4);
    }

    .wws-menu-item:hover .wws-menu-badge.pro {
      box-shadow: 0 6px 20px rgba(9, 132, 227, 0.4);
    }

    .wws-menu-footer {
      margin-top: 40px;
      text-align: center;
      font-size: clamp(11px, 2.5vw, 13px);
      opacity: 0.5;
      transform: translateY(20px);
      opacity: 0;
      transition: all 0.5s ease;
    }

    .wws-menu-overlay.active .wws-menu-footer {
      animation: slideInHeader 0.6s cubic-bezier(0.23, 1, 0.32, 1) 0.8s forwards;
    }

    .wws-menu-overlay.closing .wws-menu-footer {
      animation: slideOutHeader 0.4s cubic-bezier(0.23, 1, 0.32, 1) 0.1s forwards;
    }

    @keyframes morphOpen {
      0% {
        transform: translateX(-100%) scale(0.8) rotateY(15deg);
        opacity: 0;
      }
      50% {
        transform: translateX(-20%) scale(0.95) rotateY(5deg);
        opacity: 0.7;
      }
      100% {
        transform: translateX(0) scale(1) rotateY(0deg);
        opacity: 1;
      }
    }

    .wws-menu-overlay.active .wws-menu-container {
      animation: morphOpen 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }

    @keyframes morphClose {
      0% {
        transform: translateX(0) scale(1) rotateY(0deg);
        opacity: 1;
      }
      50% {
        transform: translateX(-20%) scale(0.95) rotateY(5deg);
        opacity: 0.7;
      }
      100% {
        transform: translateX(-100%) scale(0.8) rotateY(15deg);
        opacity: 0;
      }
    }

    .wws-menu-overlay.closing .wws-menu-container {
      animation: morphClose 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }

    @media (max-width: 480px) {
      .wws-menu-trigger {
        left: 15px;
        bottom: 15px;
        width: 56px;
        height: 56px;
      }

      .wws-menu-container {
        width: 85vw;
        padding: 15px 0;
      }

      .wws-menu-shell {
        padding: 30px 20px;
      }

      .wws-menu-items {
        gap: 10px;
      }

      .wws-menu-item {
        padding: 16px 18px;
        gap: 12px;
      }

      .wws-menu-icon {
        width: 42px;
        height: 42px;
        font-size: 18px;
      }
    }

    @media (max-width: 320px) {
      .wws-menu-container {
        width: 100vw;
      }
      
      .wws-menu-shell {
        padding: 25px 15px;
      }
    }

    @media (hover: none) and (pointer: coarse) {
      .wws-menu-item:active {
        background: rgba(255, 255, 255, 0.1);
        transform: translateX(8px) scale(1.02);
      }
      
      .wws-menu-trigger:active {
        transform: scale(0.95);
      }
    }

    .wws-menu-container {
      will-change: transform;
    }

    .wws-menu-item {
      will-change: transform, opacity;
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
    btn.className = "wws-menu-trigger";
    btn.setAttribute('aria-label', 'Open menu');
    btn.innerHTML = `<i class="fas fa-bars"></i>`;
    document.body.appendChild(btn);

    const overlay = document.createElement("div");
    overlay.className = "wws-menu-overlay";
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = `
      <div class="wws-menu-backdrop"></div>
      <div class="wws-menu-container">
        <div class="wws-menu-shell">
          <div class="wws-menu-header">
            <h2>WWS Navigation</h2>
            <p>Откройте для себя все возможности платформы</p>
          </div>

          <div class="wws-menu-items">
            <a class="wws-menu-item" href="https://wws.com" target="_blank" rel="noopener">
              <div class="wws-menu-icon">
                <i class="fas fa-rocket"></i>
              </div>
              <div class="wws-menu-content">
                <div class="wws-menu-title">Основной сайт WWS</div>
                <div class="wws-menu-desc">Главный портал компании</div>
              </div>
              <div class="wws-menu-badge new">NEW</div>
            </a>

            <a class="wws-menu-item" href="https://reaver-gradient.example" target="_blank" rel="noopener">
              <div class="wws-menu-icon">
                <i class="fas fa-palette"></i>
              </div>
              <div class="wws-menu-content">
                <div class="wws-menu-title">Reaver Gradient</div>
                <div class="wws-menu-desc">Создание градиентов</div>
              </div>
              <div class="wws-menu-badge beta">BETA</div>
            </a>

            <a class="wws-menu-item" href="https://reaver-markdown.example" target="_blank" rel="noopener">
              <div class="wws-menu-icon">
                <i class="fas fa-file-alt"></i>
              </div>
              <div class="wws-menu-content">
                <div class="wws-menu-title">Reaver Markdown</div>
                <div class="wws-menu-desc">Редактор Markdown</div>
              </div>
              <div class="wws-menu-badge pro">PRO</div>
            </a>

            <a class="wws-menu-item" href="https://reaver-table.example" target="_blank" rel="noopener">
              <div class="wws-menu-icon">
                <i class="fas fa-table"></i>
              </div>
              <div class="wws-menu-content">
                <div class="wws-menu-title">Reaver Table</div>
                <div class="wws-menu-desc">Работа с таблицами</div>
              </div>
              <div class="wws-menu-badge free">FREE</div>
            </a>

            <a class="wws-menu-item" href="https://reaver-ai.example" target="_blank" rel="noopener">
              <div class="wws-menu-icon">
                <i class="fas fa-robot"></i>
              </div>
              <div class="wws-menu-content">
                <div class="wws-menu-title">Reaver AI</div>
                <div class="wws-menu-desc">Искусственный интеллект</div>
              </div>
              <div class="wws-menu-badge coming">SOON</div>
            </a>

            <a class="wws-menu-item" href="https://reaver-cloud.example" target="_blank" rel="noopener">
              <div class="wws-menu-icon">
                <i class="fas fa-cloud"></i>
              </div>
              <div class="wws-menu-content">
                <div class="wws-menu-title">Reaver Cloud</div>
                <div class="wws-menu-desc">Облачное хранилище</div>
              </div>
              <div class="wws-menu-badge new">NEW</div>
            </a>
          </div>

          <div class="wws-menu-footer">
            WWS Platform &copy; 2024 • Все права защищены
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    let isOpen = false;
    let isAnimating = false;

    function openMenu() {
      if (isAnimating) return;
      
      isAnimating = true;
      isOpen = true;
      
      overlay.classList.remove('closing');
      overlay.classList.add('active');
      btn.classList.add('active');
      overlay.setAttribute('aria-hidden', 'false');
      btn.setAttribute('aria-label', 'Close menu');
      btn.querySelector('i').className = 'fas fa-times';

      setTimeout(() => {
        isAnimating = false;
      }, 900);
    }

    function closeMenu() {
      if (isAnimating) return;
      
      isAnimating = true;
      overlay.classList.add('closing');
      btn.classList.remove('active');
      overlay.setAttribute('aria-hidden', 'true');
      btn.setAttribute('aria-label', 'Open menu');
      btn.querySelector('i').className = 'fas fa-bars';

      setTimeout(() => {
        overlay.classList.remove('active', 'closing');
        isOpen = false;
        isAnimating = false;
      }, 700);
    }

    function toggleMenu() {
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    }

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleMenu();
    });

    overlay.addEventListener('click', (e) => {
      if (e.target.classList.contains('wws-menu-backdrop')) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", (e) => {
      if(e.key === "Escape" && isOpen){
        closeMenu();
      }
    });

    overlay.querySelectorAll('.wws-menu-item').forEach(item => {
      item.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          closeMenu();
        }
      });
    });

    overlay.querySelector('.wws-menu-shell').addEventListener('click', (e) => {
      e.stopPropagation();
    });

    let startX = 0;
    let currentX = 0;

    overlay.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    }, { passive: true });

    overlay.addEventListener('touchmove', (e) => {
      if (!isOpen) return;
      currentX = e.touches[0].clientX;
      const diff = startX - currentX;
      
      if (diff > 50) {
        closeMenu();
      }
    }, { passive: true });

    window.WWSMenu = {
      open: openMenu,
      close: closeMenu,
      toggle: toggleMenu
    };
  }

})();
