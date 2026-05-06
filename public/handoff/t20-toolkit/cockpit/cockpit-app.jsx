// cockpit-app.jsx — Root app, header, layout
// Depends on: all other cockpit-*.jsx files

const INITIAL_NOTES = `- Capitão tem a chave do cofre
- Serafina envenenada (3 turnos)
- Portal fecha em 5 rodadas
- Trog escondido no beco sul
- Recompensa: 800 TO + amuleto`;

function CockpitHeader({ round, session }) {
  const [time, setTime] = React.useState(new Date());
  React.useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const hh = time.getHours().toString().padStart(2,"0");
  const mm = time.getMinutes().toString().padStart(2,"0");
  const ss = time.getSeconds().toString().padStart(2,"0");

  return (
    <header style={{
      height: 54, flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 20px",
      borderBottom: "1px solid rgba(255,255,255,.07)",
      background: "linear-gradient(90deg,rgba(8,7,12,.98),rgba(12,10,16,.96))",
      backdropFilter: "blur(20px)",
    }}>
      {/* Left: world status */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4b9f91", boxShadow: "0 0 8px #4b9f91", animation: "statusPulse 2s ease-in-out infinite" }} />
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(245,221,177,.72)" }}>Mundo ativo</span>
          <span style={{ fontFamily: "var(--font-d)", fontSize: 15, fontWeight: 700, color: "#f4efe7", letterSpacing: "0.06em" }}>ARTON</span>
        </div>
        <div style={{ width: 1, height: 20, background: "rgba(255,255,255,.1)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, border: "1px solid rgba(75,159,145,.3)", background: "rgba(75,159,145,.1)", borderRadius: 9999, padding: "3px 10px", fontSize: 10, fontWeight: 600, color: "rgba(75,159,145,.9)" }}>
            Em operação
          </span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,.35)" }}>{session}</span>
        </div>
      </div>

      {/* Center: rodada */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
          <span style={{ fontSize: 8, color: "rgba(255,255,255,.3)", letterSpacing: "0.14em", textTransform: "uppercase" }}>Rodada</span>
          <span style={{ fontFamily: "var(--font-m)", fontSize: 18, fontWeight: 700, color: "#f4efe7", lineHeight: 1 }}>{round}</span>
        </div>
        <div style={{ width: 1, height: 20, background: "rgba(255,255,255,.1)" }} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
          <span style={{ fontSize: 8, color: "rgba(255,255,255,.3)", letterSpacing: "0.14em", textTransform: "uppercase" }}>Sessão</span>
          <span style={{ fontFamily: "var(--font-m)", fontSize: 13, fontWeight: 600, color: "rgba(213,162,64,.9)", lineHeight: 1 }}>12</span>
        </div>
      </div>

      {/* Right: clock + campaign */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,.3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Campanha</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,.65)" }}>Crônicas de Arton</div>
        </div>
        <div style={{ width: 1, height: 20, background: "rgba(255,255,255,.1)" }} />
        <div style={{ fontFamily: "var(--font-m)", fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,.5)", letterSpacing: "0.08em", minWidth: 64, textAlign: "center" }}>
          {hh}:{mm}:<span style={{ color: "rgba(255,255,255,.25)" }}>{ss}</span>
        </div>
      </div>
    </header>
  );
}

function CockpitApp() {
  const [activeModule, setActiveModule]   = React.useState("cockpit");
  const [collapsed, setCollapsed]         = React.useState(false);
  const [combatants, setCombatants]       = React.useState(INIT_COMBATANTS);
  const [currentTurn, setCurrentTurn]     = React.useState(0);
  const [round, setRound]                 = React.useState(3);
  const [revealedCells, setRevealedCells] = React.useState(new Set(PRE_REVEALED));
  const [rolls, setRolls]                 = React.useState(INITIAL_ROLLS);
  const [notes, setNotes]                 = React.useState(INITIAL_NOTES);

  // Persist turn state
  React.useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("t20-cockpit") || "{}");
      if (saved.round) setRound(saved.round);
      if (saved.currentTurn !== undefined) setCurrentTurn(saved.currentTurn);
      if (saved.notes) setNotes(saved.notes);
    } catch(e) {}
  }, []);

  React.useEffect(() => {
    try { localStorage.setItem("t20-cockpit", JSON.stringify({ round, currentTurn, notes })); } catch(e) {}
  }, [round, currentTurn, notes]);

  const panelStyle = {
    border: "1px solid rgba(255,255,255,.07)",
    borderRadius: 16,
    background: "linear-gradient(160deg,rgba(13,12,18,.97),rgba(9,8,13,.95))",
    overflow: "hidden",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,.04), 0 20px 60px rgba(0,0,0,.5)",
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg)", color: "var(--fg)", fontFamily: "var(--font-b)" }}>

      {/* Ambient background */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse 50% 40% at 15% 50%, rgba(188,74,63,.07), transparent 55%), radial-gradient(ellipse 40% 40% at 85% 50%, rgba(58,40,8,.08), transparent 55%)" }} />

      <CockpitSidebar
        activeModule={activeModule}
        onNavigate={navigateHandoffModule}
        collapsed={collapsed}
        onToggle={() => setCollapsed(c => !c)}
      />

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", zIndex: 1 }}>
        <CockpitHeader round={round} session="A Noite das Lâminas" />

        {/* Panel grid */}
        <div style={{
          flex: 1, overflow: "hidden",
          display: "grid",
          gridTemplateColumns: "260px 1fr 240px",
          gap: 10,
          padding: "10px",
        }}>
          {/* Left: Initiative */}
          <div style={panelStyle}>
            <InitiativePanel
              combatants={combatants}
              setCombatants={setCombatants}
              currentTurn={currentTurn}
              setCurrentTurn={setCurrentTurn}
              round={round}
              setRound={setRound}
            />
          </div>

          {/* Center: Map */}
          <div style={panelStyle}>
            <MapPanel
              revealedCells={revealedCells}
              setRevealedCells={setRevealedCells}
            />
          </div>

          {/* Right: Rolls + Notes + Atmosphere */}
          <div style={{ ...panelStyle, overflowY: "auto" }}>
            <RightPanel
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

const cockpitRoot = ReactDOM.createRoot(document.getElementById("root"));
cockpitRoot.render(<CockpitApp />);
