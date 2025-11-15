(function () {
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
      backdrop-filter: blur(22px) saturate(190%);
      background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.35), rgba(255,255,255,0.08));
      border: 1px solid rgba(255, 255, 255, 0.25);
      color: #fff;
      font-family: 'Inter', system-ui, sans-serif;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      box-shadow: 
        0 10px 35px rgba(0, 0, 0, 0.35),
        inset 0 1px 0 rgba(255, 255, 255, 0.4),
        inset 0 -1px 0 rgba(0, 0, 0, 0.15);
      overflow: hidden;
    }

    .rg-menu-trigger::before {
      content: '';
      position: absolute;
      inset: -40%;
      background:
        radial-gradient(circle at 20% 20%, rgba(255,255,255,0.4), transparent 55%),
        radial-gradient(circle at 80% 80%, rgba(147,197,253,0.3), transparent 55%);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .rg-menu-trigger:hover {
      background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.5), rgba(255,255,255,0.14));
      transform: translateY(-2px) scale(1.06);
      box-shadow: 
        0 14px 45px rgba(0, 0, 0, 0.45),
        inset 0 1px 0 rgba(255, 255, 255, 0.5),
        inset 0 -1px 0 rgba(0, 0, 0, 0.08);
    }

    .rg-menu-trigger:hover::before {
      opacity: 1;
    }

    .rg-menu-trigger i {
      font-size: 22px;
      transition: all 0.45s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      position: relative;
      z-index: 2;
    }

    .rg-menu-trigger:hover i {
      transform: rotate(15deg) scale(1.05);
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
      backdrop-filter: blur(28px) brightness(0.7);
      background: radial-gradient(circle at top left, rgba(59,130,246,0.35), transparent 60%),
                  radial-gradient(circle at bottom right, rgba(236,72,153,0.25), transparent 60%),
                  rgba(0, 0, 0, 0.60);
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
      background: radial-gradient(circle at 0% 0%, rgba(255,255,255,0.14), transparent 55%),
                  radial-gradient(circle at 100% 100%, rgba(129,140,248,0.18), transparent 55%),
                  rgba(15, 23, 42, 0.92);
      border-right: 1px solid rgba(255, 255, 255, 0.18);
      backdrop-filter: blur(40px) saturate(210%);
      transform: translateX(-100%) skewX(-5deg);
      transition: transform 0.65s cubic-bezier(0.34, 1.56, 0.64, 1);
      padding: 30px;
      color: #fff;
      font-family: 'Inter', system-ui, sans-serif;
      box-shadow: 
        18px 0 60px rgba(15, 23, 42, 0.6),
        inset 1px 0 0 rgba(255, 255, 255, 0.12);
      overflow: hidden;
    }

    .rg-menu-shell::before {
      content: '';
      position: absolute;
      top: -40%;
      right: -30%;
      width: 260px;
      height: 260px;
      background: radial-gradient(circle at center, rgba(96,165,250,0.22), transparent 65%);
      filter: blur(2px);
      opacity: 0.9;
      pointer-events: none;
    }

    .rg-menu-overlay.rg-open .rg-menu-shell {
      transform: translateX(0) skewX(0);
      transition-delay: 0.08s;
    }

    .rg-menu-shell::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
      opacity: 0.7;
    }

    .rg-menu-header {
      margin-bottom: 40px;
      padding-bottom: 25px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.35);
      position: relative;
      transform: translateX(-40px);
      opacity: 0;
      transition: all 0.55s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .rg-menu-overlay.rg-open .rg-menu-header {
      transform: translateX(0);
      opacity: 1;
      transition-delay: 0.3s;
    }

    .rg-menu-header h2 {
      margin: 0 0 8px 0;
      font-size: 26px;
      font-weight: 600;
      letter-spacing: 0.03em;
      background: linear-gradient(135deg, #ffffff 0%, #c4b5fd 40%, #38bdf8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .rg-menu-header p {
      margin: 0;
      font-size: 13px;
      opacity: 0.8;
    }

    .rg-menu-items {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .rg-menu-item {
      padding: 18px 18px;
      border-radius: 18px;
      background: radial-gradient(circle at top left, rgba(255,255,255,0.14), rgba(15,23,42,0.9));
      border: 1px solid rgba(148, 163, 184, 0.45);
      display: flex;
      align-items: center;
      gap: 16px;
      cursor: pointer;
      transition: all 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      text-decoration: none;
      color: #f9fafb;
      position: relative;
      overflow: hidden;
      transform: translateX(-60px);
      opacity: 0;
    }

    .rg-menu-overlay.rg-open .rg-menu-item {
      transform: translateX(0);
      opacity: 1;
    }

    .rg-menu-item:nth-child(1) { transition-delay: 0.40s; }
    .rg-menu-item:nth-child(2) { transition-delay: 0.46s; }
    .rg-menu-item:nth-child(3) { transition-delay: 0.52s; }
    .rg-menu-item:nth-child(4) { transition-delay: 0.58s; }

    .rg-menu-item::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, 
        transparent, 
        rgba(255, 255, 255, 0.18), 
        transparent
      );
      transition: left 0.6s ease;
    }

    .rg-menu-item:hover {
      background: radial-gradient(circle at top left, rgba(255,255,255,0.22), rgba(15,23,42,0.95));
      border-color: rgba(191, 219, 254, 0.75);
      transform: translateX(8px) translateY(-1px) !important;
      box-shadow: 0 18px 40px rgba(15,23,42,0.55);
    }

    .rg-menu-item:hover::before {
      left: 100%;
    }

    .rg-menu-icon {
      width: 28px;
      text-align: center;
      opacity: 0.95;
      transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      font-size: 18px;
      flex-shrink: 0;
    }

    .rg-menu-item:hover .rg-menu-icon {
      transform: scale(1.18) rotate(8deg) translateY(-1px);
      text-shadow: 0 0 10px rgba(129,140,248,0.7);
    }

    .rg-menu-text {
      flex: 1;
      font-weight: 500;
      font-size: 14px;
    }

    .rg-menu-subtext {
      font-size: 11px;
      opacity: 0.7;
      margin-top: 2px;
    }

    .rg-menu-badge {
      background: linear-gradient(135deg, rgba(129,140,248,0.15), rgba(56,189,248,0.2));
      padding: 6px 12px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 500;
      border: 1px solid rgba(191, 219, 254, 0.7);
      transition: all 0.3s ease;
      white-space: nowrap;
    }

    .rg-menu-item:hover .rg-menu-badge {
      background: linear-gradient(135deg, rgba(129,140,248,0.3), rgba(56,189,248,0.35));
      transform: scale(1.05) translateY(-1px);
    }

    .rg-menu-footer {
      position: absolute;
      bottom: 26px;
      left: 30px;
      right: 30px;
      text-align: center;
      font-size: 11px;
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
      color: rgba(209,213,219,0.85);
    }

    .rg-menu-footer span {
      opacity: 0.85;
    }

    .rg-menu-footer i {
      font-size: 10px;
      margin: 0 4px;
      opacity: 0.9;
    }

    .rg-menu-overlay.rg-open .rg-menu-footer {
      transform: translateY(0);
      opacity: 0.7;
      transition-delay: 0.65s;
    }

    @keyframes pulse {
      0% { transform: scale(1); box-shadow: 0 10px 35px rgba(0,0,0,0.35); }
      50% { transform: scale(1.05); box-shadow: 0 14px 45px rgba(59,130,246,0.55); }
      100% { transform: scale(1); box-shadow: 0 10px 35px rgba(0,0,0,0.35); }
    }

    .rg-menu-trigger.pulse {
      animation: pulse 2.4s infinite;
    }

    @media (max-width: 600px) {
      .rg-menu-shell {
        width: 82%;
        max-width: 360px;
      }
      .rg-menu-header h2 {
        font-size: 22px;
      }
    }
  `;

  // Inject Font Awesome if not present
  function ensureFontAwesome() {
    const existing = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
      .some(link => link.href && link.href.includes('font-awesome'));
    if (!existing) {
      const fa = document.createElement('link');
      fa.rel = 'stylesheet';
      fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
      fa.crossOrigin = 'anonymous';
      fa.referrerPolicy = 'no-referrer';
      document.head.appendChild(fa);
    }
  }

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
  ensureFontAwesome();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMenu);
  } else {
    initMenu();
  }

  function initMenu() {
    // Trigger button
    const btn = document.createElement('button');
    btn.className = 'rg-menu-trigger pulse';
    btn.setAttribute('aria-label', 'Open WWS navigation');
    btn.innerHTML = `<i class="fa-solid fa-bars"></i>`;
    document.body.appendChild(btn);

    // Overlay
    const overlay = document.createElement('div');
    overlay.className = 'rg-menu-overlay';
    overlay.innerHTML = `
      <div class="rg-menu-backdrop"></div>
      <div class="rg-menu-shell">
        <div class="rg-menu-header">
          <h2>WWS Quick Hub</h2>
          <p>Your liquid-glass dock for Wandering Wizardry Studios tools.</p>
        </div>

        <div class="rg-menu-items">
          <a class="rg-menu-item" href="https://wanderingwizardry.com" target="_blank" rel="noreferrer">
            <div class="rg-menu-icon">
              <i class="fa-solid fa-meteor"></i>
            </div>
            <div class="rg-menu-text">
              Main WWS Website
              <div class="rg-menu-subtext">Studio overview, projects & news</div>
            </div>
            <div class="rg-menu-badge">Core hub</div>
          </a>

          <a class="rg-menu-item" href="https://reaver-gradient.example" target="_blank" rel="noreferrer">
            <div class="rg-menu-icon">
              <i class="fa-solid fa-palette"></i>
            </div>
            <div class="rg-menu-text">
              Reaver Gradient
              <div class="rg-menu-subtext">Liquid-glass CSS gradients & presets</div>
            </div>
          </a>

          <a class="rg-menu-item" href="https://reaver-markdown.example" target="_blank" rel="noreferrer">
            <div class="rg-menu-icon">
              <i class="fa-solid fa-pen-nib"></i>
            </div>
            <div class="rg-menu-text">
              Reaver Markdown
              <div class="rg-menu-subtext">Clean writing, notes & docs editor</div>
            </div>
          </a>

          <a class="rg-menu-item" href="https://reaver-table.example" target="_blank" rel="noreferrer">
            <div class="rg-menu-icon">
              <i class="fa-solid fa-table-list"></i>
            </div>
            <div class="rg-menu-text">
              Reaver Table
              <div class="rg-menu-subtext">Smart tables & structured content</div>
            </div>
          </a>
        </div>

        <div class="rg-menu-footer">
          <span>Wandering Wizardry Studios • <span id="rg-year"></span></span>
          <i class="fa-solid fa-sparkles"></i>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const footerYear = overlay.querySelector('#rg-year');
    if (footerYear) footerYear.textContent = new Date().getFullYear().toString();

    const icon = btn.querySelector('i');

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpening = !overlay.classList.contains('rg-open');

      if (isOpening) {
        overlay.classList.add('rg-open');
        btn.classList.remove('pulse');
        if (icon) {
          icon.classList.remove('fa-bars');
          icon.classList.add('fa-xmark');
        }
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

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeMenu();
      }
    });

    function closeMenu() {
      overlay.classList.remove('rg-open');
      if (icon) {
        icon.classList.add('fa-bars');
        icon.classList.remove('fa-xmark');
      }
      btn.style.transform = '';

      setTimeout(() => {
        if (!overlay.classList.contains('rg-open')) {
          btn.classList.add('pulse');
        }
      }, 900);
    }

    overlay.querySelector('.rg-menu-shell').addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }
})();
