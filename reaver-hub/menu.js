(function () {
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
      transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      box-shadow: 
        0 8px 32px rgba(0, 0, 0, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.3),
        inset 0 -1px 0 rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .wws-menu-trigger:hover {
      transform: translateY(-2px) scale(1.03);
      box-shadow: 
        0 12px 40px rgba(0, 0, 0, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.4),
        inset 0 -1px 0 rgba(0, 0, 0, 0.05);
    }

    .wws-menu-trigger.active {
      transform: translateY(-2px) scale(1.05);
      box-shadow:
        0 14px 45px rgba(0, 0, 0, 0.4),
        0 0 18px rgba(96, 165, 250, 0.8);
    }

    .wws-menu-trigger i {
      font-size: 22px;
      transition: all 0.4s ease;
      position: relative;
      z-index: 2;
    }

    .wws-menu-trigger.active i {
      transform: rotate(90deg);
    }

    .wws-menu-overlay {
      position: fixed;
      inset: 0;
      z-index: 9999;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.35s ease;
    }

    .wws-menu-overlay.active {
      opacity: 1;
      pointer-events: all;
    }

    .wws-menu-backdrop {
      position: absolute;
      inset: 0;
      backdrop-filter: blur(25px);
      background: radial-gradient(circle at top left, rgba(96,165,250,0.25), transparent 55%), 
                  radial-gradient(circle at bottom right, rgba(244,114,182,0.25), transparent 55%),
                  rgba(10, 10, 15, 0.75);
      opacity: 0;
      transition: opacity 0.4s ease;
    }

    .wws-menu-overlay.active .wws-menu-backdrop {
      opacity: 1;
    }

    .wws-menu-container {
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: min(420px, 90vw);
      transform: translateX(-100%) scale(0.96);
      transition: transform 0.5s cubic-bezier(0.33, 1, 0.68, 1);
      padding: 20px 0;
    }

    .wws-menu-overlay.active .wws-menu-container {
      transform: translateX(0) scale(1);
    }

    .wws-menu-shell {
      height: 100%;
      background: linear-gradient(135deg, rgba(25, 25, 35, 0.98) 0%, rgba(15, 15, 25, 0.99) 100%);
      border-right: 1px solid rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(40px) saturate(180%);
      padding: 40px 30px;
      color: #fff;
      font-family: 'Inter', system-ui, sans-serif;
      box-shadow: 
        25px 0 60px rgba(0, 0, 0, 0.4),
        inset 1px 0 0 rgba(255, 255, 255, 0.1);
      overflow-y: auto;
      position: relative;
    }

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
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    }

    .wws-menu-header {
      margin-bottom: 40px;
      padding-bottom: 25px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      position: relative;
      opacity: 0;
      transform: translateY(-20px);
    }

    .wws-menu-overlay.active .wws-menu-header {
      animation: fadeInDown 0.6s ease 0.2s both;
    }

    @keyframes fadeInDown {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .wws-menu-header h2 {
      margin: 0 0 12px 0;
      font-size: clamp(24px, 5vw, 32px);
      font-weight: 700;
      background: linear-gradient(135deg, #fff 0%, #a78bfa 50%, #60a5fa 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .wws-menu-header p {
      margin: 0;
      font-size: clamp(13px, 3vw, 15px);
      opacity: 0.8;
      font-weight: 300;
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
      transition: all 0.3s ease;
      text-decoration: none;
      color: #fff;
      position: relative;
      overflow: hidden;
      opacity: 0;
      transform: translateX(-30px);
    }

    .wws-menu-overlay.active .wws-menu-item {
      animation: slideInLeft 0.6s ease both;
    }

    .wws-menu-overlay.active .wws-menu-item:nth-child(1) { animation-delay: 0.3s; }
    .wws-menu-overlay.active .wws-menu-item:nth-child(2) { animation-delay: 0.4s; }
    .wws-menu-overlay.active .wws-menu-item:nth-child(3) { animation-delay: 0.5s; }
    .wws-menu-overlay.active .wws-menu-item:nth-child(4) { animation-delay: 0.6s; }
    .wws-menu-overlay.active .wws-menu-item:nth-child(5) { animation-delay: 0.7s; }
    .wws-menu-overlay.active .wws-menu-item:nth-child(6) { animation-delay: 0.8s; }

    @keyframes slideInLeft {
      from {
        opacity: 0;
        transform: translateX(-30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

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
      transition: left 0.6s ease;
    }

    .wws-menu-item:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.2);
      transform: translateX(8px);
      box-shadow: 0 16px 35px rgba(15,23,42,0.7);
    }

    .wws-menu-item:hover::before {
      left: 100%;
    }

    .wws-menu-item:hover .wws-menu-icon {
      transform: scale(1.1);
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
      transition: all 0.3s ease;
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
    }

    .wws-menu-badge.beta {
      background: linear-gradient(135deg, #fbc531, #e84118);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .wws-menu-badge.pro {
      background: linear-gradient(135deg, #00b894, #0984e3);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .wws-menu-badge.free {
      background: linear-gradient(135deg, #00cec9, #fd79a8);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .wws-menu-badge.coming {
      background: linear-gradient(135deg, #636e72, #2d3436);
      border-color: rgba(255, 255, 255, 0.1);
    }

    .wws-menu-item:hover .wws-menu-badge {
      transform: scale(1.05);
    }

    .wws-menu-footer {
      margin-top: 40px;
      text-align: center;
      font-size: clamp(11px, 2.5vw, 13px);
      opacity: 0;
    }

    .wws-menu-overlay.active .wws-menu-footer {
      animation: fadeIn 0.6s ease 0.9s both;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 0.5; }
    }

    .wws-menu-light .wws-menu-trigger {
      background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%);
      border: 1px solid rgba(255, 255, 255, 0.8);
      color: #333;
      box-shadow: 
        0 8px 32px rgba(0, 0, 0, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.9),
        inset 0 -1px 0 rgba(0, 0, 0, 0.05);
    }

    .wws-menu-light .wws-menu-trigger:hover {
      background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.8) 100%);
      box-shadow: 
        0 12px 40px rgba(0, 0, 0, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.95),
        inset 0 -1px 0 rgba(0, 0, 0, 0.03);
    }

    .wws-menu-light .wws-menu-backdrop {
      background: rgba(255, 255, 255, 0.7);
    }

    .wws-menu-light .wws-menu-shell {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 245, 255, 0.98) 100%);
      border-right: 1px solid rgba(0, 0, 0, 0.1);
      color: #333;
      box-shadow: 
        25px 0 60px rgba(0, 0, 0, 0.1),
        inset 1px 0 0 rgba(0, 0, 0, 0.05);
    }

    .wws-menu-light .wws-menu-shell::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.05);
    }

    .wws-menu-light .wws-menu-shell::-webkit-scrollbar-thumb {
      background: linear-gradient(135deg, #7e6ff8, #4a7dff);
    }

    .wws-menu-light .wws-menu-header {
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    }

    .wws-menu-light .wws-menu-header h2 {
      background: linear-gradient(135deg, #333 0%, #7e6ff8 50%, #4a7dff 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .wws-menu-light .wws-menu-header p {
      color: #666;
    }

    .wws-menu-light .wws-menu-item {
      background: rgba(0, 0, 0, 0.03);
      border: 1px solid rgba(0, 0, 0, 0.08);
      color: #333;
    }

    .wws-menu-light .wws-menu-item:hover {
      background: rgba(0, 0, 0, 0.06);
      border-color: rgba(0, 0, 0, 0.12);
    }

    .wws-menu-light .wws-menu-item::before {
      background: linear-gradient(90deg, 
        transparent, 
        rgba(0, 0, 0, 0.05), 
        transparent
      );
    }

    .wws-menu-light .wws-menu-icon {
      background: rgba(0, 0, 0, 0.05);
      border: 1px solid rgba(0, 0, 0, 0.08);
      color: #555;
    }

    .wws-menu-light .wws-menu-item:hover .wws-menu-icon {
      background: linear-gradient(135deg, #7e6ff8, #4a7dff);
      color: white;
    }

    .wws-menu-light .wws-menu-desc {
      color: #666;
    }

    .wws-menu-light .wws-menu-badge {
      color: white;
    }

    .wws-menu-light .wws-menu-footer {
      color: #888;
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
        transform: translateX(8px);
      }
      
      .wws-menu-light .wws-menu-item:active {
        background: rgba(0, 0, 0, 0.06);
      }
      
      .wws-menu-trigger:active {
        transform: scale(0.98);
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
    function detectTheme() {
      const isLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
      document.body.classList.toggle('wws-menu-light', isLight);
    }

    detectTheme();

    if (window.matchMedia) {
      const mq = window.matchMedia('(prefers-color-scheme: light)');
      if (typeof mq.addEventListener === 'function') {
        mq.addEventListener('change', detectTheme);
      } else if (typeof mq.addListener === 'function') {
        mq.addListener(detectTheme);
      }
    }

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
            <p>Discover everything the platform can do.</p>
          </div>

          <div class="wws-menu-items">
            <a class="wws-menu-item" href="https://reaver.is-a.dev/" target="_blank" rel="noopener">
              <div class="wws-menu-icon">
                <i class="fas fa-rocket"></i>
              </div>
              <div class="wws-menu-content">
                <div class="wws-menu-title">Main WWS Website</div>
                <div class="wws-menu-desc">Primary portal for the studio</div>
              </div>
            </a>

            <a class="wws-menu-item" href="https://reaver.is-a.dev/gradient" target="_blank" rel="noopener">
              <div class="wws-menu-icon">
                <i class="fas fa-palette"></i>
              </div>
              <div class="wws-menu-content">
                <div class="wws-menu-title">Reaver.Gradient V2</div>
                <div class="wws-menu-desc">Advanced CSS gradient generator</div>
              </div>
              <div class="wws-menu-badge beta">BETA</div>
            </a>
          </div>

          <div class="wws-menu-footer">
            WWS Platform &copy; 2024 • All rights reserved
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    let isOpen = false;

    function openMenu() {
      if (isOpen) return;
      isOpen = true;
      overlay.classList.add('active');
      btn.classList.add('active');
      overlay.setAttribute('aria-hidden', 'false');
      btn.setAttribute('aria-label', 'Close menu');
      btn.querySelector('i').className = 'fas fa-times';
    }

    function closeMenu() {
      if (!isOpen) return;
      isOpen = false;
      overlay.classList.remove('active');
      btn.classList.remove('active');
      overlay.setAttribute('aria-hidden', 'true');
      btn.setAttribute('aria-label', 'Open menu');
      btn.querySelector('i').className = 'fas fa-bars';
    }

    function toggleMenu() {
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    }

    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      toggleMenu();
    });

    overlay.addEventListener('click', function (e) {
      if (e.target.classList.contains('wws-menu-backdrop')) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isOpen) {
        closeMenu();
      }
    });

    overlay.querySelectorAll('.wws-menu-item').forEach(function (item) {
      item.addEventListener('click', function () {
        if (window.innerWidth <= 768) {
          closeMenu();
        }
      });
    });

    overlay.querySelector('.wws-menu-shell').addEventListener('click', function (e) {
      e.stopPropagation();
    });

    window.WWSMenu = {
      open: openMenu,
      close: closeMenu,
      toggle: toggleMenu,
      setTheme: function (theme) {
        document.body.classList.toggle('wws-menu-light', theme === 'light');
      }
    };
  }
})();

