(function(){

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
    
    .rg-menu-trigger {
      position: fixed;
      left: 24px;
      bottom: 24px;
      z-index: 999999;
      padding: 16px 20px;
      border-radius: 20px;
      backdrop-filter: blur(20px) saturate(180%);
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #fff;
      font-family: 'Inter', system-ui, sans-serif;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 12px;
      transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      box-shadow: 
        0 8px 32px rgba(0, 0, 0, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.3),
        inset 0 -1px 0 rgba(0, 0, 0, 0.1);
    }

    .rg-menu-trigger:hover {
      background: rgba(255, 255, 255, 0.25);
      transform: translateY(-2px);
      box-shadow: 
        0 12px 40px rgba(0, 0, 0, 0.25),
        inset 0 1px 0 rgba(255, 255, 255, 0.4),
        inset 0 -1px 0 rgba(0, 0, 0, 0.05);
    }

    .rg-menu-trigger i {
      font-size: 20px;
      transition: transform 0.3s ease;
    }

    .rg-menu-overlay {
      position: fixed;
      inset: 0;
      backdrop-filter: blur(25px) brightness(0.7);
      background: rgba(0, 0, 0, 0.5);
      z-index: 999998;
      display: none;
      opacity: 0;
      transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }

    .rg-menu-overlay.rg-open {
      display: block;
      opacity: 1;
    }

    .rg-menu-shell {
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 360px;
      background: rgba(30, 30, 35, 0.85);
      border-right: 1px solid rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(30px) saturate(180%);
      transform: translateX(-100%);
      transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      padding: 30px;
      color: #fff;
      font-family: 'Inter', system-ui, sans-serif;
      box-shadow: 
        16px 0 40px rgba(0, 0, 0, 0.3),
        inset 1px 0 0 rgba(255, 255, 255, 0.1);
    }

    .rg-menu-overlay.rg-open .rg-menu-shell {
      transform: translateX(0);
    }

    .rg-menu-header {
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .rg-menu-header h2 {
      margin: 0 0 8px 0;
      font-size: 24px;
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
      padding: 18px 20px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.12);
      display: flex;
      align-items: center;
      gap: 16px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      text-decoration: none;
      color: #fff;
      position: relative;
      overflow: hidden;
    }

    .rg-menu-item::before {
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
      transition: left 0.6s ease;
    }

    .rg-menu-item:hover {
      background: rgba(255, 255, 255, 0.15);
      border-color: rgba(255, 255, 255, 0.2);
      transform: translateX(8px);
    }

    .rg-menu-item:hover::before {
      left: 100%;
    }

    .rg-menu-item:hover .rg-menu-icon {
      transform: scale(1.1);
    }

    .rg-menu-icon {
      width: 24px;
      text-align: center;
      opacity: 0.9;
      transition: transform 0.3s ease;
      font-size: 18px;
    }

    .rg-menu-text {
      flex: 1;
      font-weight: 500;
    }

    .rg-menu-badge {
      background: rgba(160, 160, 255, 0.2);
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 12px;
      border: 1px solid rgba(160, 160, 255, 0.3);
    }

    .rg-menu-footer {
      position: absolute;
      bottom: 30px;
      left: 30px;
      right: 30px;
      text-align: center;
      font-size: 12px;
      opacity: 0.6;
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
    // КНОПКА
    const btn = document.createElement("button");
    btn.className = "rg-menu-trigger";
    btn.innerHTML = `
      <i class="fa-solid fa-bars"></i>
      <span>WWS Menu</span>
    `;
    document.body.appendChild(btn);

    // ОВЕРЛЕЙ
    const overlay = document.createElement("div");
    overlay.className = "rg-menu-overlay";
    overlay.innerHTML = `
      <div class="rg-menu-shell">
        <div class="rg-menu-header">
          <h2>WWS Navigation</h2>
          <p>Добро пожаловать в панель управления</p>
        </div>

        <div class="rg-menu-items">
          <a class="rg-menu-item" href="https://wws.com" target="_blank">
            <div class="rg-menu-icon">🏠</div>
            <div class="rg-menu-text">Основной сайт WWS</div>
            <div class="rg-menu-badge">Главная</div>
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

    // ОБРАБОТЧИКИ СОБЫТИЙ
    btn.addEventListener("click", () => {
      overlay.classList.toggle("rg-open");
      const icon = btn.querySelector("i");
      icon.classList.toggle("fa-bars");
      icon.classList.toggle("fa-xmark");
    });

    overlay.addEventListener("click", e => {
      if(e.target === overlay){
        closeMenu();
      }
    });

    document.addEventListener("keydown", e => {
      if(e.key === "Escape"){
        closeMenu();
      }
    });

    function closeMenu() {
      overlay.classList.remove("rg-open");
      const icon = btn.querySelector("i");
      icon.classList.add("fa-bars");
      icon.classList.remove("fa-xmark");
    }
  }

})();

