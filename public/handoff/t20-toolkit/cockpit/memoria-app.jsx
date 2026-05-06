// memoria-app.jsx — Memória root app
// Depends on: all memoria-*.jsx + cockpit-sidebar.jsx

function MemoriaHeader({ eventCount, pendingCount }) {
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
          <LucideIcon name="book-marked" size={16} color="#4b9f91" />
        </div>
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(245,221,177,.65)" }}>Arton · Continuidade narrativa</div>
          <div style={{ fontFamily: "var(--font-d)", fontSize: 16, fontWeight: 700, color: "#f4efe7", letterSpacing: "0.06em" }}>MEMÓRIA DO MUNDO</div>
        </div>
        <div style={{ width: 1, height: 24, background: "rgba(255,255,255,.1)" }} />
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontFamily: "var(--font-m)", fontSize: 13, fontWeight: 700, color: "#f4efe7" }}>{eventCount}</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,.35)" }}>eventos</span>
          </div>
          <div style={{ width: 1, height: 12, background: "rgba(255,255,255,.12)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#d5a240", boxShadow: "0 0 5px #d5a240", display: "inline-block" }} />
            <span style={{ fontFamily: "var(--font-m)", fontSize: 13, fontWeight: 700, color: "#d5a240" }}>{pendingCount}</span>
            <span style={{ fontSize: 11, color: "rgba(213,162,64,.6)" }}>pendentes</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          background: "rgba(75,159,145,.1)", border: "1px solid rgba(75,159,145,.3)",
          color: "#4b9f91", borderRadius: 10, padding: "7px 14px",
          fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all .15s",
        }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(75,159,145,.2)"}
        onMouseLeave={e => e.currentTarget.style.background = "rgba(75,159,145,.1)"}>
          <LucideIcon name="plus" size={13} color="#4b9f91" />
          Registrar evento
        </button>
        <a href="Mesa.html" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "rgba(188,74,63,.1)", border: "1px solid rgba(188,74,63,.25)",
          color: "rgba(188,74,63,.8)", borderRadius: 10, padding: "7px 13px",
          fontSize: 11, fontWeight: 500, textDecoration: "none", transition: "all .15s",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(188,74,63,.18)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "rgba(188,74,63,.1)"; }}>
          <LucideIcon name="swords" size={12} color="rgba(188,74,63,.8)" />
          Mesa ao Vivo
        </a>
        <a href="Cockpit.html" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)",
          color: "rgba(255,255,255,.5)", borderRadius: 10, padding: "7px 13px",
          fontSize: 11, textDecoration: "none", transition: "all .15s",
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

function MemoriaApp() {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [selected, setSelected]     = React.useState(null);
  const [filter, setFilter]         = React.useState("Todos");
  const [search, setSearch]         = React.useState("");

  const pendingCount = WORLD_EVENTS.filter(e => e.pending).length;

  function handleSelect(event) {
    if (selected?.id === event.id) { setSelected(null); return; }
    setSelected(event);
  }

  function handleNavigation(moduleId) {
    const routes = {
      cockpit: "Cockpit.html", codex: "Codex.html", forge: "Forja.html",
      graph: "Grafo.html", visual: "Visual.html", live: "Mesa.html",
    };
    if (routes[moduleId]) window.location.href = routes[moduleId];
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg)", color: "var(--fg)", fontFamily: "var(--font-b)" }}>

      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse 40% 50% at 50% 30%, rgba(75,159,145,.04), transparent 60%)" }} />

      <CockpitSidebar
        activeModule="memory"
        onNavigate={handleNavigation}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(c => !c)}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", zIndex: 1 }}>
        <MemoriaHeader eventCount={WORLD_EVENTS.length} pendingCount={pendingCount} />

        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          <MemoriaTimeline
            events={WORLD_EVENTS}
            selectedId={selected?.id}
            onSelect={handleSelect}
            filter={filter}
            setFilter={setFilter}
            search={search}
            setSearch={setSearch}
          />
          {selected && (
            <MemoriaDetail
              event={selected}
              onClose={() => setSelected(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

const memoriaRoot = ReactDOM.createRoot(document.getElementById("root"));
memoriaRoot.render(<MemoriaApp />);
