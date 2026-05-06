// grafo-app.jsx — Grafo root app + header + filter + detail
// Depends on: cockpit-icons.jsx, cockpit-sidebar.jsx, codex-data.jsx, codex-grid.jsx, codex-detail.jsx, grafo-graph.jsx

function TypeFilterBar({ active, onChange, counts }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
      {FILTER_TYPES.filter(t => t !== "Evento" || counts["Evento"]).map(type => {
        const m   = TYPE_META[type];
        const cnt = type === "Todos" ? Object.values(counts).reduce((a,b)=>a+b,0) : (counts[type] || 0);
        const isActive = active === type;
        return (
          <button key={type} onClick={() => onChange(type)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "5px 12px", borderRadius: 9, cursor: "pointer", fontFamily: "inherit",
              border: `1px solid ${isActive ? (m?.border || "rgba(255,255,255,.25)") : "rgba(255,255,255,.08)"}`,
              background: isActive ? (m?.dim || "rgba(255,255,255,.08)") : "rgba(255,255,255,.03)",
              color: isActive ? (m?.color || "#f4efe7") : "rgba(255,255,255,.4)",
              fontSize: 11, fontWeight: isActive ? 700 : 400, transition: "all .15s",
            }}>
            {m && <LucideIcon name={m.icon} size={10} color={isActive ? m.color : "rgba(255,255,255,.3)"} />}
            {type}
            <span style={{ fontFamily: "var(--font-m)", fontSize: 9, opacity: 0.6, marginLeft: 2 }}>{cnt}</span>
          </button>
        );
      })}
    </div>
  );
}

function Legend() {
  const types = Object.entries(TYPE_META);
  return (
    <div style={{
      position: "absolute", top: 16, left: 16,
      background: "rgba(8,7,12,.92)", border: "1px solid rgba(255,255,255,.08)",
      borderRadius: 12, padding: "12px 14px",
      backdropFilter: "blur(16px)",
      boxShadow: "0 8px 30px rgba(0,0,0,.5)",
      pointerEvents: "none",
    }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(245,221,177,.65)", marginBottom: 8 }}>Legenda</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {types.map(([type, m]) => (
          <div key={type} style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ width: 8, height: 8, background: m.color, borderRadius: 2, flexShrink: 0 }} />
            <span style={{ fontSize: 10, color: "rgba(255,255,255,.5)" }}>{type}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 10, borderTop: "1px solid rgba(255,255,255,.06)", paddingTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{ width: 16, height: 1, background: "rgba(255,255,255,.2)", borderTop: "1px dashed rgba(255,255,255,.2)" }} />
          <span style={{ fontSize: 10, color: "rgba(255,255,255,.3)" }}>Relação</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#d5a240", flexShrink: 0 }} />
          <span style={{ fontSize: 10, color: "rgba(255,255,255,.3)" }}>Nó fixo</span>
        </div>
      </div>
    </div>
  );
}

function GrafoHeader() {
  return (
    <header style={{
      height: 56, flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 20px", borderBottom: "1px solid rgba(255,255,255,.07)",
      background: "linear-gradient(90deg,rgba(8,7,12,.98),rgba(12,10,16,.96))",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: "rgba(75,159,145,.12)", border: "1px solid rgba(75,159,145,.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <LucideIcon name="waypoints" size={16} color="#4b9f91" />
        </div>
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(245,221,177,.65)" }}>Arton · Relações do mundo</div>
          <div style={{ fontFamily: "var(--font-d)", fontSize: 16, fontWeight: 700, color: "#f4efe7", letterSpacing: "0.06em" }}>GRAFO DO MUNDO</div>
        </div>
        <div style={{ width: 1, height: 24, background: "rgba(255,255,255,.1)" }} />
        <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)" }}>{ENTITIES.length} entidades · {Object.keys(TYPE_META).length} tipos</div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <a href="Codex.html" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)",
          color: "rgba(255,255,255,.5)", borderRadius: 10, padding: "7px 13px",
          fontSize: 11, fontWeight: 500, textDecoration: "none", transition: "all .15s",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.08)"; e.currentTarget.style.color = "#fff"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.04)"; e.currentTarget.style.color = "rgba(255,255,255,.5)"; }}>
          <LucideIcon name="crown" size={12} />
          Codex
        </a>
        <a href="Cockpit.html" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)",
          color: "rgba(255,255,255,.5)", borderRadius: 10, padding: "7px 13px",
          fontSize: 11, fontWeight: 500, textDecoration: "none", transition: "all .15s",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.08)"; e.currentTarget.style.color = "#fff"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.04)"; e.currentTarget.style.color = "rgba(255,255,255,.5)"; }}>
          <LucideIcon name="chevron-left" size={12} />
          Cockpit
        </a>
      </div>
    </header>
  );
}

function GrafoApp() {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [selectedEntity, setSelectedEntity]     = React.useState(null);
  const [filterType, setFilterType]             = React.useState("Todos");

  const typeCounts = React.useMemo(() => {
    const counts = {};
    for (const e of ENTITIES) counts[e.type] = (counts[e.type] || 0) + 1;
    return counts;
  }, []);

  function handleNavigation(moduleId) {
    const routes = { cockpit: "Cockpit.html", codex: "Codex.html", forge: "Forja.html" };
    if (routes[moduleId]) window.location.href = routes[moduleId];
  }

  function handleNavigateTo(name) {
    const target = ENTITIES.find(e => e.name === name);
    if (target) setSelectedEntity(target);
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg)", color: "var(--fg)", fontFamily: "var(--font-b)" }}>

      {/* Ambient */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse 50% 60% at 50% 50%, rgba(75,159,145,.04), transparent 65%)" }} />

      <CockpitSidebar
        activeModule="graph"
        onNavigate={handleNavigation}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(c => !c)}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", zIndex: 1 }}>
        <GrafoHeader />

        {/* Filter bar */}
        <div style={{
          padding: "10px 18px", borderBottom: "1px solid rgba(255,255,255,.06)",
          display: "flex", alignItems: "center", gap: 12, flexShrink: 0,
          background: "rgba(8,7,12,.8)",
        }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,.3)", whiteSpace: "nowrap" }}>Filtrar</span>
          <TypeFilterBar active={filterType} onChange={setFilterType} counts={typeCounts} />
          <div style={{ marginLeft: "auto", fontSize: 10, color: "rgba(255,255,255,.25)", whiteSpace: "nowrap" }}>
            Clique para selecionar · Arraste para reposicionar
          </div>
        </div>

        {/* Graph canvas + detail */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden", display: "flex" }}>
          <GraphCanvas
            selectedId={selectedEntity?.id || null}
            onSelect={setSelectedEntity}
            filterType={filterType}
          />
          <Legend />

          {/* Detail panel */}
          {selectedEntity && (
            <CodexDetail
              entity={selectedEntity}
              onClose={() => setSelectedEntity(null)}
              onNavigateTo={handleNavigateTo}
            />
          )}
        </div>
      </div>
    </div>
  );
}

const grafoRoot = ReactDOM.createRoot(document.getElementById("root"));
grafoRoot.render(<GrafoApp />);
