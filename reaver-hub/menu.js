(function(){

  const css = `
    .rg-menu-trigger{
      position:fixed;
      left:16px;
      bottom:16px;
      z-index:999999;
      padding:10px 14px;
      border-radius:12px;
      backdrop-filter:blur(12px) saturate(160%);
      background:rgba(0,0,0,0.35);
      color:#fff;
      font-family:system-ui, sans-serif;
      border:1px solid rgba(255,255,255,0.17);
      cursor:pointer;
      display:flex;
      align-items:center;
      gap:8px;
      transition:.25s ease;
    }
    .rg-menu-trigger:hover{
      background:rgba(0,0,0,0.45);
    }
    .rg-menu-trigger i{
      font-size:18px;
    }
    .rg-menu-overlay{
      position:fixed;
      inset:0;
      backdrop-filter:blur(14px) brightness(0.4);
      background:rgba(0,0,0,0.45);
      z-index:999998;
      display:none;
      opacity:0;
      transition:.25s ease;
    }
    .rg-menu-overlay.rg-open{
      display:block;
      opacity:1;
    }
    .rg-menu-shell{
      position:absolute;
      left:0;
      top:0;
      height:100%;
      width:300px;
      background:rgba(22,22,22,0.95);
      border-right:1px solid rgba(255,255,255,0.12);
      backdrop-filter:blur(20px);
      transform:translateX(-100%);
      transition:.3s cubic-bezier(.2,.7,.2,1);
      padding:20px;
      color:#fff;
      font-family:system-ui, sans-serif;
    }
    .rg-menu-overlay.rg-open .rg-menu-shell{
      transform:translateX(0);
    }
    .rg-menu-shell h2{
      margin:0 0 20px;
      font-size:22px;
    }
    .rg-menu-item{
      padding:12px 10px;
      margin-bottom:6px;
      border-radius:8px;
      background:rgba(255,255,255,0.06);
      border:1px solid rgba(255,255,255,0.14);
      display:flex;
      align-items:center;
      gap:10px;
      cursor:pointer;
      transition:.18s ease;
      text-decoration:none;
      color:#fff;
    }
    .rg-menu-item:hover{
      background:rgba(255,255,255,0.12);
    }
    .rg-menu-item i{
      width:22px;
      text-align:center;
      opacity:0.85;
    }
  `;

  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);


  /* ===========================
      2) СОЗДАЁМ HTML-СТРУКТУРУ
  =========================== */

  // КНОПКА
  const btn = document.createElement("button");
  btn.className = "rg-menu-trigger";
  btn.innerHTML = `<i class="fa-solid fa-bars"></i>`;
  document.body.appendChild(btn);

  // ОВЕРЛЕЙ
  const overlay = document.createElement("div");
  overlay.className = "rg-menu-overlay";
  overlay.innerHTML = `
    <div class="rg-menu-shell">
      <h2>Reaver Menu</h2>

      <a class="rg-menu-item" href="https://reaver-gradient.example" target="_blank">
        <i class="fa-solid fa-palette"></i>Reaver.Gradient
      </a>

      <a class="rg-menu-item" href="https://reaver-markdown.example" target="_blank">
        <i class="fa-solid fa-file-lines"></i>Reaver.Markdown
      </a>

      <a class="rg-menu-item" href="https://reaver-table.example" target="_blank">
        <i class="fa-solid fa-table"></i>Reaver.Table
      </a>

    </div>
  `;
  document.body.appendChild(overlay);


  /* ===========================
      3) ЛОГИКА ОТКРЫТИЯ/ЗАКРЫТИЯ
  =========================== */
  btn.addEventListener("click", () => {
    overlay.classList.toggle("rg-open");
    const icon = btn.querySelector("i");
    icon.classList.toggle("fa-bars");
    icon.classList.toggle("fa-xmark");
  });

  overlay.addEventListener("click", e => {
    if(e.target === overlay){
      overlay.classList.remove("rg-open");
      const icon = btn.querySelector("i");
      icon.classList.add("fa-bars");
      icon.classList.remove("fa-xmark");
    }
  });

  document.addEventListener("keydown", e => {
    if(e.key === "Escape"){
      overlay.classList.remove("rg-open");
      const icon = btn.querySelector("i");
      icon.classList.add("fa-bars");
      icon.classList.remove("fa-xmark");
    }
  });

})();

