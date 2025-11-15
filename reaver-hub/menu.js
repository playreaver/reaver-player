(function(){

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
    
    .rg-menu-trigger {
      position: fixed;
      left: 24px;
      bottom: 24px;
      z-index: 999999;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      backdrop-filter: blur(20px) saturate(180%);
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #fff;
      font-family: 'Inter', system-ui, sans-serif;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      box-shadow: 
        0 8px 32px rgba(0, 0, 0, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.3),
        inset 0 -1px 0 rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .rg-menu-trigger::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, transparent 70%);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .rg-menu-trigger:hover {
      background: rgba(255, 255, 255, 0.25);
      transform: translateY(-2px) scale(1.05);
      box-shadow: 
        0 12px 40px rgba(0, 0, 0, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.4),
        inset 0 -1px 0 rgba(0, 0, 0, 0.05);
    }

    .rg-menu-trigger:hover::before {
      opacity: 1;
    }

    .rg-menu-trigger i {
      font-size: 22px;
      transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      position: relative;
      z-index: 2;
    }

    .rg-menu-trigger:hover i {
      transform: rotate(15deg);
    }

    .rg-menu-overlay {
      position: fixed;
      inset: 0;
      z-index: 999998;
      display: none;
      opacity: 0;
    }

    .rg-menu-overlay.rg-open {
      display: block;
    }

    .rg-menu-backdrop {
      position: absolute;
      inset: 0;
      backdrop-filter: blur(25px) brightness(0.7);
      background: rgba(0, 0, 0, 0.5);
      opacity: 0;
      transition: opacity 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }

    .rg-menu-overlay.rg-open .rg-menu-backdrop {
      opacity: 1;
    }

    .rg-menu-shell {
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 380px;
      background: rgba(20, 20, 25, 0.95);
      border-right: 1px solid rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(40px) saturate(200%);
      transform: translateX(-100%) skewX(-5deg);
      transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
      padding: 30px;
      color: #fff;
      font-family: 'Inter', system-ui, sans-serif;
      box-shadow: 
        16px 0 60px rgba(0, 0, 0, 0.4),
        inset 1px 0 0 rgba(255, 255, 255, 0.1);
      overflow: hidden;
    }

    .rg-menu-overlay.rg-open .rg-menu-shell {
      transform: translateX(0) skewX(0);
      transition-delay: 0.1s;
    }

    .rg-menu-shell::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    }

    .rg-menu-header {
      margin-bottom: 40px;
      padding-bottom: 25px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      position: relative;
      transform: translateX(-50px);
      opacity: 0;
      transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .rg-menu-overlay.rg-open .rg-menu-header {
      transform: translateX(0);
      opacity: 1;
      transition-delay: 0.3s;
    }

    .rg-menu-header h2 {
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 600;
      background: linear-gradient(135deg, #fff 0%, #a0a0ff 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .rg-menu-header p {
      margin: 0;
      font-size: 14px;
      opacity: 0.7;
    }

    .rg-menu-items {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .rg-menu-item {
      padding: 20px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.07);
      border: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      gap: 16px;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      text-decoration: none;
      color: #fff;
      position: relative;
      overflow: hidden;
      transform: translateX(-60px);
      opacity: 0;
    }

    .rg-menu-overlay.rg-open .rg-menu-item {
      transform: translateX(0);
      opacity: 1;
    }

    .rg-menu-item:nth-child(1) { transition-delay: 0.4s; }
    .rg-menu-item:nth-child(2) { transition-delay: 0.45s; }
    .rg-menu-item:nth-child(3) { transition-delay: 0.5s; }
    .rg-menu-item:nth-child(4) { transition-delay: 0.55s; }

    .rg-menu-item::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, 
        transparent, 
        rgba(255, 255, 255, 0.15), 
        transparent
      );
      transition: left 0.6s ease;
    }

    .rg-menu-item:hover {
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.2);
      transform: translateX(8px) !important;
    }

    .rg-menu-item:hover::before {
      left: 100%;
    }

    .rg-menu-item:hover .rg-menu-icon {
      transform: scale(1.2) rotate(10deg);
    }

    .rg-menu-icon {
      width: 24px;
      text-align: center;
      opacity: 0.9;
      transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      font-size: 18px;
    }

    .rg-menu-text {
      flex: 1;
      font-weight: 500;
      font-size: 15px;
    }

    .rg-menu-badge {
      background: rgba(160, 160, 255, 0.2);
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
      border: 1px solid rgba(160, 160, 255, 0.3);
      transition: all 0.3s ease;
    }

    .rg-menu-item:hover .rg-menu-badge {
      background: rgba(160, 160, 255, 0.3);
      transform: scale(1.05);
    }

    .rg-menu-footer {
      position: absolute;
      bottom: 30px;
      left: 30px;
      right: 30px;
      text-align: center;
      font-size: 12px;
      opacity: 0.6;
      transform: translateY(20px);
      opacity: 0;
      transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .rg-menu-overlay.rg-open .rg-menu-footer {
      transform: translateY(0);
      opacity: 0.6;
      transition-delay: 0.6s;
    }

    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }

    .rg-menu-trigger.pulse {
      animation: pulse 2s infinite;
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
    btn.className = "rg-menu-trigger pulse";
    btn.innerHTML = `<i class="fa-solid fa-bars"></i>`;
    document.body.appendChild(btn);

    // ОВЕРЛЕЙ
    const overlay = document.createElement("div");
    overlay.className = "rg-menu-overlay";
    overlay.innerHTML = `
      <div class="rg-menu-backdrop"></div>
      <div class="rg-menu-shell">
        <div class="rg-menu-header">
          <h2>WWS Navigation</h2>
          <p>Ваш портал к возможностям</p>
        </div>

        <div class="rg-menu-items">
          <a class="rg-menu-item" href="https://wws.com" target="_blank">
            <div class="rg-menu-icon">🚀</div>
            <div class="rg-menu-text">Основной сайт WWS</div>
            <div class="rg-menu-badge">NEW</div>
          </a>

          <a class="rg-menu-item" href="https://reaver-gradient.example" target="_blank">
            <div class="rg-menu-icon">🎨</div>
            <div class="rg-menu-text">Reaver Gradient</div>
          </a>

          <a class="rg-menu-item" href="https://reaver-markdown.example" target="_blank">
            <div class="rg-menu-icon">📝</div>
            <div class="rg-menu-text">Reaver Markdown</div>
          </a>

          <a class="rg-menu-item" href="https://reaver-table.example" target="_blank">
            <div class="rg-menu-icon">📊</div>
            <div class="rg-menu-text">Reaver Table</div>
          </a>
        </div>

        <div class="rg-menu-footer">
          WWS Platform © 2024
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpening = !overlay.classList.contains('rg-open');
      
      if (isOpening) {
        overlay.classList.add('rg-open');
        btn.classList.remove('pulse');
        const icon = btn.querySelector("i");
        icon.classList.remove("fa-bars");
        icon.classList.add("fa-xmark");
        btn.style.transform = 'translateY(-2px) scale(1.1)';
      } else {
        closeMenu();
      }
    });

    overlay.addEventListener('click', (e) => {
      if (e.target.classList.contains('rg-menu-backdrop')) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", (e) => {
      if(e.key === "Escape"){
        closeMenu();
      }
    });

    function closeMenu() {
      overlay.classList.remove("rg-open");
      const icon = btn.querySelector("i");
      icon.classList.add("fa-bars");
      icon.classList.remove("fa-xmark");
      btn.style.transform = '';
      
      setTimeout(() => {
        if (!overlay.classList.contains('rg-open')) {
          btn.classList.add('pulse');
        }
      }, 1000);
    }

    overlay.querySelector('.rg-menu-shell').addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

})();

