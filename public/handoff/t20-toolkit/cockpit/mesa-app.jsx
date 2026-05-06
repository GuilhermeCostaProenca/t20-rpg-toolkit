// mesa-app.jsx — Mesa ao Vivo root
// Depends on: all mesa-*.jsx + cockpit-icons.jsx + cockpit-sidebar.jsx

const INITIAL_NOTES = `- Cap. tem chave do cofre
- Serafina envenenada (cura em 3T)
- Portal fecha em 5 rodadas
- Reféns: 2 civis + 1 guarda convertido
- Grimório reage ao toque de Serafina`;

function SessionStatusBar({ round, sessionName, elapsedMs }) {
  const [time, setTime] = React.useState(new Date());
  const [elapsed, setElapsed] = React.useState(elapsedMs);
  React.useEffect(() => { const t = setInterval(() => { setTime(new Date()); setElapsed(e => e + 1000); }, 1000); return () => clearInterval(t); }, []);
  const hh = String(time.getHours()).padStart(2,"0");
  const mm = String(time.getMinutes()).padStart(2,"0");
  const ss = String(time.getSeconds()).padStart(2,"0");
  const eh = String(Math.floor(elapsed/3600000)).padStart(2,"0");
  const em = String(Math.floor((elapsed%3600000)/60000)).padStart(2,"0");
  const es = String(Math.floor((elapsed%60000)/1000)).padStart(2,"0");

  return (
    <header style={{
      height: 52, flexShrink: 0,
      display: "flex", alignItems: "center", gap: 0,
      borderBottom: "1px solid rgba(255,255,255,.07)",
      background: "linear-gradient(90deg,rgba(8,7,12,.99),rgba(12,8,10,.97))",
    }}>
      {/* Session live indicator */}
      <div style={{ padding: "0 16px", display: "flex", alignItems: "center", gap: 10, borderRight: "1px solid rgba(255,255,255,.07)" }}>
        <div style={{ position: "relative" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#bc4a3f", boxShadow: "0 0 10px #bc4a3f" }} />
          <div style={{ position: "absolute", inset: -4, borderRadius: "50%", border: "1px solid rgba(188,74,63,.3)", animation: "livePulse 2s ease-out infinite" }} />
        </div>
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(188,74,63,.9)" }}>Ao Vivo</div>
          <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,.7)" }}>{sessionName}</div>
        </div>
      </div>

      {/* Rodada */}
      <div style={{ padding: "0 14px", display: "flex", flexDirection: "column", alignItems: "center", borderRight: "1px solid rgba(255,255,255,.07)" }}>
        <span style={{ fontSize: 8, color: "rgba(255,255,255,.3)", letterSpacing: "0.14em", textTransform: "uppercase" }}>Rodada</span>
        <span id="roundDisplay" style={{ fontFamily: "var(--font-m)", fontSize: 16, fontWeight: 700, color: "#f4efe7", lineHeight: 1 }}>—</span>
      </div>

      {/* World */}
      <div style={{ padding: "0 14px", flex: 1, display: "flex", alignItems: "center", gap: 8, borderRight: "1px solid rgba(255,255,255,.07)" }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(245,221,177,.65)" }}>Mundo:</div>
        <div style={{ fontFamily: "var(--font-d)", fontSize: 13, fontWeight: 700, color: "#f4efe7", letterSpacing: "0.06em" }}>ARTON</div>
        <div style={{ width: 1, height: 12, background: "rgba(255,255,255,.15)" }} />
        <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)" }}>Crônicas de Arton</div>
      </div>

      {/* Elapsed */}
      <div style={{ padding: "0 14px", display: "flex", flexDirection: "column", alignItems: "center", borderRight: "1px solid rgba(255,255,255,.07)" }}>
        <span style={{ fontSize: 8, color: "rgba(255,255,255,.3)", letterSpacing: "0.12em" }}>Sessão</span>
        <span style={{ fontFamily: "var(--font-m)", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.5)" }}>{eh}:{em}:{es}</span>
      </div>

      {/* Clock */}
      <div style={{ padding: "0 16px" }}>
        <span style={{ fontFamily: "var(--font-m)", fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,.45)", letterSpacing: "0.08em" }}>
          {hh}:{mm}<span style={{ color: "rgba(255,255,255,.2)" }}>:{ss}</span>
        </span>
      </div>

      {/* Nav */}
      <div style={{ padding: "0 12px", borderLeft: "1px solid rgba(255,255,255,.07)", display: "flex", gap: 6 }}>
        <a href="Cockpit.html" style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.45)", borderRadius: 8, padding: "5px 10px", fontSize: 10, textDecoration: "none", transition: "all .15s" }}
          onMouseEnter={e => { e.currentTarget.style.color="#fff"; e.currentTarget.style.background="rgba(255,255,255,.08)"; }}
          onMouseLeave={e => { e.currentTarget.style.color="rgba(255,255,255,.45)"; e.currentTarget.style.background="rgba(255,255,255,.04)"; }}>
          <LucideIcon name="chevron-left" size={11} /> Cockpit
        </a>
      </div>
    </header>
  );
}

function MesaApp() {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(true); // collapsed by default for more space
  const [combatants, setCombatants]   = React.useState(MESA_COMBATANTS);
  const [currentTurn, setCurrentTurn] = React.useState(0);
  const [round, setRound]             = React.useState(3);
  const [portalRounds, setPortalRounds] = React.useState(4);
  const [quickEntity, setQuickEntity]   = React.useState(null);
  const [rolls, setRolls]               = React.useState(INITIAL_MESA_ROLLS);
  const [notes, setNotes]               = React.useState(INITIAL_NOTES);

  // Persist
  React.useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem("t20-mesa") || "{}");
      if (s.round) setRound(s.round);
      if (s.currentTurn !== undefined) setCurrentTurn(s.currentTurn);
      if (s.notes) setNotes(s.notes);
      if (s.portalRounds !== undefined) setPortalRounds(s.portalRounds);
    } catch {}
  }, []);
  React.useEffect(() => {
    try { localStorage.setItem("t20-mesa", JSON.stringify({ round, currentTurn, notes, portalRounds })); } catch {}
  }, [round, currentTurn, notes, portalRounds]);

  // Expose round to header display
  React.useEffect(() => {
    const el = document.getElementById("roundDisplay");
    if (el) el.textContent = round;
  }, [round]);

  const panelBase = {
    border: "1px solid rgba(255,255,255,.07)",
    borderRadius: 14,
    background: "linear-gradient(160deg,rgba(13,12,18,.98),rgba(9,8,13,.96))",
    overflow: "hidden",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,.04), 0 16px 50px rgba(0,0,0,.5)",
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg)", color: "var(--fg)", fontFamily: "var(--font-b)" }}>

      {/* Ambient red glow — more intense for live session */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse 40% 50% at 10% 50%, rgba(188,74,63,.09), transparent 55%), radial-gradient(ellipse 30% 40% at 90% 50%, rgba(107,18,32,.08), transparent 55%)" }} />

      <CockpitSidebar
        activeModule="live"
        onNavigate={id => {
          const r = { cockpit:"Cockpit.html", codex:"Codex.html", forge:"Forja.html", graph:"Grafo.html", visual:"Visual.html" };
          if (r[id]) window.location.href = r[id];
        }}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(c => !c)}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", zIndex: 1, minWidth: 0 }}>
        <SessionStatusBar round={round} sessionName="A Noite das Lâminas · Sessão 12" elapsedMs={5220000} />

        {/* 3-panel grid */}
        <div style={{
          flex: 1, overflow: "hidden",
          display: "grid",
          gridTemplateColumns: "270px 1fr 240px",
          gap: 8, padding: 8,
        }}>
          <div style={panelBase}>
            <MesaInitiative
              combatants={combatants}
              setCombatants={setCombatants}
              currentTurn={currentTurn}
              setCurrentTurn={setCurrentTurn}
              round={round}
              setRound={setRound}
            />
          </div>

          <div style={panelBase}>
            <MesaCenter
              beats={MESA_BEATS}
              scene={MESA_SCENES[0]}
              portalRounds={portalRounds}
              setPortalRounds={setPortalRounds}
              quickEntity={quickEntity}
              setQuickEntity={setQuickEntity}
            />
          </div>

          <div style={panelBase}>
            <MesaRight
              rolls={rolls}
              setRolls={setRolls}
              notes={notes}
              setNotes={setNotes}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const mesaRoot = ReactDOM.createRoot(document.getElementById("root"));
mesaRoot.render(<MesaApp />);
