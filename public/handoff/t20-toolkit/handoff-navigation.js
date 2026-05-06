(function () {
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function ensureOverlay() {
    let overlay = document.getElementById("handoffTransitionOverlay");
    if (overlay) return overlay;

    const style = document.createElement("style");
    style.textContent = `
      #handoffTransitionOverlay {
        position: fixed;
        inset: 0;
        z-index: 2147483000;
        display: grid;
        place-items: center;
        opacity: 0;
        pointer-events: none;
        background:
          radial-gradient(ellipse 54% 42% at 50% 42%, rgba(188,74,63,.26), transparent 62%),
          radial-gradient(ellipse 48% 40% at 48% 60%, rgba(213,162,64,.10), transparent 62%),
          rgba(6,7,12,.88);
        backdrop-filter: blur(0);
        transition: opacity .26s ease, backdrop-filter .42s ease;
      }
      #handoffTransitionOverlay.is-active {
        opacity: 1;
        pointer-events: auto;
        backdrop-filter: blur(18px);
      }
      .handoff-transition-card {
        position: relative;
        min-width: min(460px, calc(100vw - 48px));
        border: 1px solid rgba(255,255,255,.12);
        border-radius: 22px;
        padding: 34px 38px;
        text-align: center;
        color: #f4efe7;
        background: linear-gradient(150deg, rgba(12,11,18,.94), rgba(7,7,12,.88));
        box-shadow: 0 28px 90px rgba(0,0,0,.58), inset 0 1px 0 rgba(255,255,255,.05);
        transform: translateY(12px) scale(.98);
        transition: transform .42s cubic-bezier(.2,.65,.22,1);
        overflow: hidden;
      }
      #handoffTransitionOverlay.is-active .handoff-transition-card {
        transform: translateY(0) scale(1);
      }
      .handoff-transition-card::before {
        content: "";
        position: absolute;
        inset: -40%;
        background: conic-gradient(from 90deg, transparent, rgba(188,74,63,.22), transparent, rgba(213,162,64,.18), transparent);
        animation: handoffSpin 1.4s linear infinite;
        opacity: .72;
      }
      .handoff-transition-card::after {
        content: "";
        position: absolute;
        inset: 1px;
        border-radius: 21px;
        background: linear-gradient(150deg, rgba(12,11,18,.96), rgba(7,7,12,.92));
      }
      .handoff-transition-content {
        position: relative;
        z-index: 1;
      }
      .handoff-transition-kicker {
        font: 700 10px/1 "DM Sans", sans-serif;
        letter-spacing: .24em;
        text-transform: uppercase;
        color: rgba(245,221,177,.72);
      }
      .handoff-transition-title {
        margin-top: 12px;
        font: 900 clamp(25px, 4vw, 42px)/1.05 "Cinzel", Georgia, serif;
        letter-spacing: .08em;
        text-transform: uppercase;
      }
      .handoff-transition-bar {
        width: 160px;
        height: 1px;
        margin: 22px auto 0;
        background: linear-gradient(90deg, transparent, rgba(188,74,63,.9), rgba(213,162,64,.75), transparent);
        box-shadow: 0 0 18px rgba(188,74,63,.55);
      }
      @keyframes handoffSpin {
        to { transform: rotate(360deg); }
      }
      @media (prefers-reduced-motion: reduce) {
        #handoffTransitionOverlay,
        .handoff-transition-card {
          transition: none;
        }
        .handoff-transition-card::before {
          animation: none;
        }
      }
    `;
    document.head.appendChild(style);

    overlay = document.createElement("div");
    overlay.id = "handoffTransitionOverlay";
    overlay.innerHTML = `
      <div class="handoff-transition-card">
        <div class="handoff-transition-content">
          <div class="handoff-transition-kicker">Abrindo módulo</div>
          <div class="handoff-transition-title" id="handoffTransitionTitle">T20 OS</div>
          <div class="handoff-transition-bar"></div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    return overlay;
  }

  window.transitionToHandoff = function transitionToHandoff(route, label) {
    if (!route) return;
    if (reduceMotion) {
      window.location.href = route;
      return;
    }

    const overlay = ensureOverlay();
    const title = document.getElementById("handoffTransitionTitle");
    if (title) title.textContent = label || "T20 OS";

    requestAnimationFrame(() => overlay.classList.add("is-active"));
    window.setTimeout(() => {
      window.location.href = route;
    }, 520);
  };
})();
