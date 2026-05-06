// transition-overlay.js — Universal screen transition overlay
// Drop-in: include this script on every page. Auto-intercepts <a href="X.html">
// clicks within the same folder and replays a cinematic transition.

(function() {
  'use strict';

  // ── Module metadata for transitions ──
  const MODULES = {
    "Cockpit.html":  { name: "Cockpit",       short: "Cockpit",   color: "#bc4a3f", icon: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",   tag: "TORRE DE COMANDO" },
    "Codex.html":    { name: "Codex",         short: "Codex",     color: "#d5a240", icon: "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z", tag: "BANCO DE ENTIDADES" },
    "Forja.html":    { name: "Forja",         short: "Forja",     color: "#e06155", icon: "M8 21h8m-4 0v-7M3 3l3 6h12l3-6M5 9l-2 5a2 2 0 0 0 2 3h14a2 2 0 0 0 2-3l-2-5", tag: "FORJA DE SESSÃO" },
    "Grafo.html":    { name: "Grafo",         short: "Grafo",     color: "#4b9f91", icon: "M12 4.5L4 8.5v7L12 19.5l8-4v-7zM4 8.5L12 12.5L20 8.5M12 12.5V19.5", tag: "GRAFO DO MUNDO" },
    "Visual.html":   { name: "Visual",        short: "Visual",    color: "#9b5de5", icon: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12", tag: "BIBLIOTECA VISUAL" },
    "Mesa.html":     { name: "Mesa ao Vivo",  short: "Mesa",      color: "#bc4a3f", icon: "M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3", tag: "SESSÃO AO VIVO" },
    "Memoria.html":  { name: "Memória",       short: "Memória",   color: "#4f7cff", icon: "M12 8v4l3 3M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z", tag: "LINHA DO TEMPO" },
  };

  function moduleFromUrl(url) {
    const file = url.split("/").pop().split("?")[0].split("#")[0];
    return MODULES[file];
  }

  // ── Inject overlay markup once ──
  const HOST_ID = "__t20_transition_host";
  function ensureHost() {
    if (document.getElementById(HOST_ID)) return document.getElementById(HOST_ID);
    const host = document.createElement("div");
    host.id = HOST_ID;
    host.innerHTML = `
      <style>
        #${HOST_ID} { position: fixed; inset: 0; pointer-events: none; z-index: 99999; font-family: 'DM Sans', sans-serif; }

        .t20-overlay {
          position: fixed; inset: 0; pointer-events: none; opacity: 0;
          background: radial-gradient(ellipse 60% 70% at 50% 50%, rgba(var(--t20-rgb),0.18), transparent 70%), rgba(6,7,12,0);
          transition: opacity .25s, background .25s;
        }
        .t20-overlay.active { opacity: 1; pointer-events: auto; background: radial-gradient(ellipse 80% 90% at 50% 50%, rgba(var(--t20-rgb),0.28), rgba(6,7,12,.95) 70%); }

        /* Sigil — animated rune at center */
        .t20-sigil {
          position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
          width: 220px; height: 220px;
          opacity: 0; scale: 0.6; rotate: -90deg;
          transition: opacity .35s cubic-bezier(.2,.6,.3,1), scale .55s cubic-bezier(.2,.6,.3,1), rotate .55s cubic-bezier(.2,.6,.3,1);
          filter: drop-shadow(0 0 40px var(--t20-color));
        }
        .t20-overlay.active .t20-sigil { opacity: 1; scale: 1; rotate: 0deg; }

        .t20-sigil .ring  { fill: none; stroke: var(--t20-color); stroke-width: 1.2; opacity: 0.4; }
        .t20-sigil .ring2 { fill: none; stroke: var(--t20-color); stroke-width: 0.7; opacity: 0.6; stroke-dasharray: 4 4; transform-origin: 50% 50%; animation: t20Rot 18s linear infinite; }
        .t20-sigil .ring3 { fill: none; stroke: var(--t20-color); stroke-width: 0.5; opacity: 0.45; stroke-dasharray: 1 5; transform-origin: 50% 50%; animation: t20Rot 26s linear infinite reverse; }
        .t20-sigil .glow  { fill: var(--t20-color); opacity: 0.12; filter: blur(8px); }
        .t20-sigil .icon  { fill: none; stroke: var(--t20-color); stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round; }

        @keyframes t20Rot { to { transform: rotate(360deg); } }

        /* Particles */
        .t20-particles { position: absolute; inset: 0; }
        .t20-p { position: absolute; width: 2px; height: 2px; background: var(--t20-color); border-radius: 50%; opacity: 0; box-shadow: 0 0 6px var(--t20-color); }
        .t20-overlay.active .t20-p { animation: t20Float 1.2s ease-out forwards; }

        @keyframes t20Float {
          0%   { opacity: 0; transform: translateY(20px) scale(0.5); }
          30%  { opacity: 0.9; }
          100% { opacity: 0; transform: translateY(-40px) scale(0.2); }
        }

        /* Module label */
        .t20-label {
          position: absolute; top: 50%; left: 50%; transform: translate(-50%, calc(-50% + 160px));
          opacity: 0; transition: opacity .3s .12s, transform .4s .12s;
          text-align: center; pointer-events: none;
        }
        .t20-overlay.active .t20-label { opacity: 1; transform: translate(-50%, calc(-50% + 140px)); }
        .t20-label .tag { font-size: 10px; font-weight: 700; letter-spacing: 0.32em; color: rgba(245,221,177,.65); margin-bottom: 6px; text-transform: uppercase; }
        .t20-label .name { font-family: 'Cinzel', Georgia, serif; font-size: 28px; font-weight: 900; letter-spacing: 0.08em; color: #f4efe7; text-transform: uppercase; }

        /* Veil — sweeping wipe from edges */
        .t20-veil { position: absolute; inset: 0; pointer-events: none; }
        .t20-veil::before, .t20-veil::after {
          content: ''; position: absolute; left: 0; right: 0; height: 50%;
          background: linear-gradient(180deg, rgba(6,7,12,.98), rgba(6,7,12,.4));
          transform: scaleY(0); transition: transform .5s cubic-bezier(.7,0,.3,1);
        }
        .t20-veil::before { top: 0; transform-origin: top; }
        .t20-veil::after  { bottom: 0; background: linear-gradient(0deg, rgba(6,7,12,.98), rgba(6,7,12,.4)); transform-origin: bottom; }
        .t20-overlay.active .t20-veil::before { transform: scaleY(1); }
        .t20-overlay.active .t20-veil::after  { transform: scaleY(1); }

        /* Vignette grain on overlay */
        .t20-grain { position: absolute; inset: 0; pointer-events: none;
          background-image: repeating-linear-gradient(47deg, rgba(255,255,255,.02) 0px, transparent 1px, transparent 4px, rgba(255,255,255,.012) 5px);
          opacity: 0; transition: opacity .25s; }
        .t20-overlay.active .t20-grain { opacity: 0.7; }

        /* ── Hub (radial menu) ── */
        .t20-hub {
          position: fixed; inset: 0; opacity: 0; pointer-events: none;
          background: radial-gradient(ellipse 70% 70% at 50% 50%, rgba(20,15,25,.85), rgba(6,7,12,.97));
          backdrop-filter: blur(20px);
          transition: opacity .3s;
          z-index: 99998;
        }
        .t20-hub.active { opacity: 1; pointer-events: auto; }
        .t20-hub-title {
          position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
          text-align: center; pointer-events: none;
        }
        .t20-hub-title .tag { font-size: 10px; font-weight: 700; letter-spacing: 0.32em; color: rgba(245,221,177,.6); margin-bottom: 6px; }
        .t20-hub-title .name { font-family: 'Cinzel', Georgia, serif; font-size: 22px; font-weight: 900; letter-spacing: 0.1em; color: #f4efe7; }
        .t20-hub-title .hint { margin-top: 10px; font-size: 10px; color: rgba(255,255,255,.3); letter-spacing: 0.18em; text-transform: uppercase; font-family: 'JetBrains Mono', monospace; }

        .t20-spoke {
          position: absolute; top: 50%; left: 50%;
          width: 152px; height: 152px;
          margin-left: -76px; margin-top: -76px;
          opacity: 0; scale: 0.4;
          transition: opacity .4s, scale .4s, transform .4s cubic-bezier(.2,.7,.3,1);
        }
        .t20-hub.active .t20-spoke { opacity: 1; scale: 1; }

        .t20-spoke-inner {
          width: 100%; height: 100%; border-radius: 50%;
          border: 1px solid rgba(255,255,255,.08);
          background: radial-gradient(circle at 50% 50%, rgba(20,18,26,.95), rgba(8,7,12,.9));
          box-shadow: 0 16px 50px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.04);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 10px; cursor: pointer; transition: all .2s; position: relative;
        }
        .t20-spoke-inner:hover {
          border-color: var(--spoke-c);
          transform: translateY(-4px) scale(1.04);
          box-shadow: 0 18px 50px rgba(0,0,0,.6), 0 0 50px var(--spoke-glow);
        }
        .t20-spoke-inner::before {
          content: ''; position: absolute; inset: 0; border-radius: 50%;
          background: radial-gradient(circle at 50% 30%, var(--spoke-glow), transparent 60%);
          opacity: 0; transition: opacity .25s; pointer-events: none;
        }
        .t20-spoke-inner:hover::before { opacity: 1; }

        .t20-spoke-icon { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; }
        .t20-spoke-icon svg { width: 100%; height: 100%; fill: none; stroke: var(--spoke-c); stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
        .t20-spoke-name { font-family: 'Cinzel', Georgia, serif; font-size: 13px; font-weight: 700; color: #f4efe7; letter-spacing: 0.12em; }
        .t20-spoke-tag  { font-size: 8px; color: rgba(255,255,255,.4); letter-spacing: 0.2em; text-transform: uppercase; }

        .t20-active-dot { position: absolute; top: 8px; right: 14px; width: 6px; height: 6px; border-radius: 50%; background: var(--spoke-c); box-shadow: 0 0 8px var(--spoke-c); }

        /* Connecting lines */
        .t20-hub-spokes-svg { position: absolute; inset: 0; pointer-events: none; opacity: 0; transition: opacity .4s .15s; }
        .t20-hub.active .t20-hub-spokes-svg { opacity: 1; }

        /* Hub close hint */
        .t20-hub-close {
          position: absolute; top: 24px; right: 24px;
          font-size: 10px; color: rgba(255,255,255,.4); letter-spacing: 0.16em; font-family: 'JetBrains Mono', monospace;
          padding: 6px 12px; border: 1px solid rgba(255,255,255,.1); border-radius: 8px; background: rgba(255,255,255,.03);
          cursor: pointer; user-select: none;
        }
        .t20-hub-close:hover { color: #fff; border-color: rgba(255,255,255,.25); }

        /* Hub trigger button — bottom-center */
        .t20-hub-trigger {
          position: fixed; bottom: 18px; left: 50%; transform: translateX(-50%);
          z-index: 998; pointer-events: auto;
          display: flex; align-items: center; gap: 8px;
          padding: 8px 14px; border-radius: 9999px;
          background: rgba(20,18,26,.85); border: 1px solid rgba(255,255,255,.08);
          backdrop-filter: blur(14px);
          color: rgba(255,255,255,.55); font-size: 11px; font-weight: 600;
          cursor: pointer; transition: all .18s;
          box-shadow: 0 8px 24px rgba(0,0,0,.4);
        }
        .t20-hub-trigger:hover { color: #fff; border-color: rgba(213,162,64,.4); background: rgba(35,30,40,.95); }
        .t20-hub-trigger kbd {
          font-family: 'JetBrains Mono', monospace; font-size: 9px; padding: 2px 6px;
          background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1); border-radius: 4px;
          color: rgba(255,255,255,.55); font-weight: 600;
        }
        .t20-hub-trigger .dot { width: 6px; height: 6px; border-radius: 50%; background: #d5a240; box-shadow: 0 0 6px #d5a240; }

        /* Page enter animation */
        @keyframes t20PageEnter {
          0%   { opacity: 0; transform: scale(0.985); filter: blur(6px); }
          100% { opacity: 1; transform: scale(1); filter: blur(0); }
        }
        body.t20-entering { animation: t20PageEnter .55s cubic-bezier(.2,.6,.3,1); }

      </style>

      <!-- Hub -->
      <div class="t20-hub" id="t20-hub">
        <svg class="t20-hub-spokes-svg" id="t20-hub-spokes" xmlns="http://www.w3.org/2000/svg"></svg>
        <div class="t20-hub-title">
          <div class="tag">T20 · Sistema Operacional</div>
          <div class="name">NAVEGAÇÃO</div>
          <div class="hint">Clique em um m&oacute;dulo &middot; ESC para fechar</div>
        </div>
        <div id="t20-spokes-container"></div>
        <button class="t20-hub-close" id="t20-hub-close">ESC</button>
      </div>

      <!-- Transition overlay -->
      <div class="t20-overlay" id="t20-overlay">
        <div class="t20-veil"></div>
        <div class="t20-grain"></div>
        <div class="t20-particles" id="t20-particles"></div>
        <svg class="t20-sigil" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle class="glow" cx="50" cy="50" r="20" />
          <circle class="ring"  cx="50" cy="50" r="46" />
          <circle class="ring2" cx="50" cy="50" r="38" />
          <circle class="ring3" cx="50" cy="50" r="30" />
          <g id="t20-sigil-icon" transform="translate(38 38) scale(1.0)"></g>
        </svg>
        <div class="t20-label">
          <div class="tag" id="t20-label-tag">CARREGANDO</div>
          <div class="name" id="t20-label-name">…</div>
        </div>
      </div>

      <!-- Hub trigger button -->
      <button class="t20-hub-trigger" id="t20-hub-trigger" title="Abrir hub de navegação (Ctrl+K ou Cmd+K)">
        <span class="dot"></span>
        <span>Hub</span>
        <kbd>⌘K</kbd>
      </button>
    `;
    document.body.appendChild(host);
    return host;
  }

  // ── Build hub spokes ──
  function buildHub() {
    const container = document.getElementById("t20-spokes-container");
    const svg       = document.getElementById("t20-hub-spokes");
    if (!container) return;
    container.innerHTML = "";
    const entries = Object.entries(MODULES);
    const radius  = Math.min(window.innerWidth, window.innerHeight) * 0.32;
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const currentFile = location.pathname.split("/").pop();

    svg.setAttribute("width",  window.innerWidth);
    svg.setAttribute("height", window.innerHeight);
    svg.setAttribute("viewBox", `0 0 ${window.innerWidth} ${window.innerHeight}`);
    svg.innerHTML = "";

    // central circle
    const centerCircle = document.createElementNS("http://www.w3.org/2000/svg","circle");
    centerCircle.setAttribute("cx", cx); centerCircle.setAttribute("cy", cy);
    centerCircle.setAttribute("r", 80);
    centerCircle.setAttribute("fill","none");
    centerCircle.setAttribute("stroke","rgba(213,162,64,.18)");
    centerCircle.setAttribute("stroke-dasharray","2 5");
    svg.appendChild(centerCircle);

    entries.forEach(([file, mod], i) => {
      const angle = (i / entries.length) * Math.PI * 2 - Math.PI / 2;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);

      // line from center to spoke
      const line = document.createElementNS("http://www.w3.org/2000/svg","line");
      line.setAttribute("x1", cx + 80 * Math.cos(angle));
      line.setAttribute("y1", cy + 80 * Math.sin(angle));
      line.setAttribute("x2", x - 76 * Math.cos(angle));
      line.setAttribute("y2", y - 76 * Math.sin(angle));
      line.setAttribute("stroke", mod.color);
      line.setAttribute("stroke-width","0.8");
      line.setAttribute("stroke-dasharray","3 4");
      line.setAttribute("opacity","0.35");
      svg.appendChild(line);

      const spoke = document.createElement("div");
      spoke.className = "t20-spoke";
      spoke.style.left = x + "px";
      spoke.style.top  = y + "px";
      spoke.style.marginLeft = "-76px";
      spoke.style.marginTop  = "-76px";
      spoke.style.transitionDelay = `${i * 60}ms`;

      const isActive = file === currentFile;
      spoke.innerHTML = `
        <div class="t20-spoke-inner" style="--spoke-c:${mod.color}; --spoke-glow:${mod.color}33">
          ${isActive ? '<div class="t20-active-dot"></div>' : ''}
          <div class="t20-spoke-icon">
            <svg viewBox="0 0 24 24"><path d="${mod.icon}"/></svg>
          </div>
          <div>
            <div class="t20-spoke-name">${mod.short.toUpperCase()}</div>
            <div class="t20-spoke-tag" style="color:${mod.color};opacity:.7">${mod.tag}</div>
          </div>
        </div>
      `;
      spoke.addEventListener("click", () => {
        if (isActive) { closeHub(); return; }
        closeHub();
        setTimeout(() => navigateWithTransition(file), 80);
      });
      container.appendChild(spoke);
    });
  }

  function openHub()  { buildHub(); document.getElementById("t20-hub").classList.add("active"); }
  function closeHub() { document.getElementById("t20-hub").classList.remove("active"); }

  // ── Transition flow ──
  function navigateWithTransition(targetFile) {
    const mod = MODULES[targetFile] || { name: "Carregando", color: "#d5a240", icon: "", tag: "" };
    const overlay = document.getElementById("t20-overlay");

    // hex → rgb
    const hex = mod.color.replace("#","");
    const r = parseInt(hex.substr(0,2),16);
    const g = parseInt(hex.substr(2,2),16);
    const b = parseInt(hex.substr(4,2),16);
    overlay.style.setProperty("--t20-rgb", `${r},${g},${b}`);
    overlay.style.setProperty("--t20-color", mod.color);

    // Set sigil icon
    const iconG = document.getElementById("t20-sigil-icon");
    iconG.innerHTML = `<path class="icon" d="${mod.icon}" transform="scale(1.0)"/>`;

    // Set label
    document.getElementById("t20-label-tag").textContent  = mod.tag;
    document.getElementById("t20-label-name").textContent = mod.name;

    // Spawn particles
    const ps = document.getElementById("t20-particles");
    ps.innerHTML = "";
    for (let i = 0; i < 24; i++) {
      const p = document.createElement("div");
      p.className = "t20-p";
      p.style.left = (40 + Math.random() * 20) + "%";
      p.style.top  = (45 + Math.random() * 20) + "%";
      p.style.animationDelay = (Math.random() * 0.6) + "s";
      p.style.animationDuration = (0.9 + Math.random() * 0.6) + "s";
      ps.appendChild(p);
    }

    overlay.classList.add("active");
    setTimeout(() => { window.location.href = targetFile; }, 600);
  }

  // ── Bind nav links + keys ──
  function bindLinks() {
    document.addEventListener("click", e => {
      const a = e.target.closest("a[href]");
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href) return;
      // Only intercept relative .html links (same folder)
      if (href.startsWith("http") || href.startsWith("//") || href.startsWith("#")) return;
      const file = href.split("/").pop().split("?")[0];
      if (!MODULES[file]) return;
      // Don't intercept same-page
      if (file === location.pathname.split("/").pop()) return;
      e.preventDefault();
      navigateWithTransition(file);
    });
  }

  function bindKeys() {
    document.addEventListener("keydown", e => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        const hub = document.getElementById("t20-hub");
        if (hub.classList.contains("active")) closeHub(); else openHub();
        return;
      }
      if (e.key === "Escape") {
        const hub = document.getElementById("t20-hub");
        if (hub && hub.classList.contains("active")) closeHub();
      }
    });
  }

  // ── Init ──
  function init() {
    ensureHost();
    bindLinks();
    bindKeys();
    document.body.classList.add("t20-entering");
    setTimeout(() => document.body.classList.remove("t20-entering"), 600);

    document.getElementById("t20-hub-trigger").addEventListener("click", openHub);
    document.getElementById("t20-hub-close").addEventListener("click", closeHub);
    document.getElementById("t20-hub").addEventListener("click", e => {
      if (e.target.id === "t20-hub") closeHub();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Expose for landing page CTA
  window.__t20Transition = navigateWithTransition;
  window.__t20OpenHub    = openHub;
})();
