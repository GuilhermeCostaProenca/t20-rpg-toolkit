// codex-app.jsx — Codex root app
// Depends on: all cockpit-*.jsx and codex-*.jsx

function CodexHeader() {
  return (
    <header style={{
      height: 58, flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 24px",
      borderBottom: "1px solid rgba(255,255,255,.07)",
      background: "linear-gradient(90deg,rgba(8,7,12,.98),rgba(12,10,16,.96))",
    }}>
      {/* Left */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10, flexShrink: 0,
            background: "rgba(213,162,64,.12)", border: "1px solid rgba(213,162,64,.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <LucideIcon name="crown" size={16} color="#d5a240" />
          </div>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(245,221,177,.65)" }}>Mundo ativo · Arton</div>
            <div style={{ fontFamily: "var(--font-d)", fontSize: 16, fontWeight: 700, color: "#f4efe7", letterSpacing: "0.06em" }}>CODEX DO MUNDO</div>
          </div>
        </div>
        <div style={{ width: 1, height: 24, background: "rgba(255,255,255,.1)" }} />
        <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)" }}>Entidades conectadas do mundo de Arton</div>
      </div>

      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <a href="Cockpit.html" style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)",
          color: "rgba(255,255,255,.5)", borderRadius: 10, padding: "7px 14px",
          fontSize: 11, fontWeight: 500, textDecoration: "none",
          transition: "all .15s",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.08)"; e.currentTarget.style.color = "#fff"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.04)"; e.currentTarget.style.color = "rgba(255,255,255,.5)"; }}>
          <LucideIcon name="chevron-left" size={13} />
          Cockpit
        </a>
        <button style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          background: "rgba(188,74,63,.12)", border: "1px solid rgba(188,74,63,.3)",
          color: "#e06155", borderRadius: 10, padding: "7px 14px",
          fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
          transition: "all .15s",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(188,74,63,.2)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "rgba(188,74,63,.12)"; }}>
          <LucideIcon name="plus" size={13} color="#e06155" />
          Nova entidade
        </button>
      </div>
    </header>
  );
}

function CodexApp() {
  const [activeModule, setActiveModule] = React.useState("codex");
  const [collapsed, setCollapsed]       = React.useState(false);
  const [selected, setSelected]         = React.useState(null);
  const [search, setSearch]             = React.useState("");
  const [filter, setFilter]             = React.useState("Todos");

  function handleSelect(entity) {
    if (selected?.id === entity.id) { setSelected(null); return; }
    setSelected(entity);
  }

  function handleNavigateTo(name) {
    const target = ENTITIES.find(e => e.name === name);
    if (target) setSelected(target);
  }

  function handleNavigation(moduleId) {
    navigateHandoffModule(moduleId);
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg)", color: "var(--fg)", fontFamily: "var(--font-b)" }}>

      {/* Ambient bg */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse 40% 50% at 15% 50%, rgba(213,162,64,.05), transparent 55%), radial-gradient(ellipse 40% 40% at 85% 50%, rgba(75,159,145,.04), transparent 55%)" }} />

      <CockpitSidebar
        activeModule={activeModule}
        onNavigate={handleNavigation}
        collapsed={collapsed}
        onToggle={() => setCollapsed(c => !c)}
      />

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", zIndex: 1 }}>
        <CodexHeader />

        {/* Content area with relative positioning for detail panel */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          <CodexGrid
            entities={ENTITIES}
            selectedId={selected?.id}
            onSelect={handleSelect}
            search={search}
            setSearch={setSearch}
            filter={filter}
            setFilter={setFilter}
          />

          {/* Sliding detail panel */}
          {selected && (
            <CodexDetail
              entity={selected}
              onClose={() => setSelected(null)}
              onNavigateTo={handleNavigateTo}
            />
          )}
        </div>
      </div>
    </div>
  );
}

const codexRoot = ReactDOM.createRoot(document.getElementById("root"));
codexRoot.render(<CodexApp />);
