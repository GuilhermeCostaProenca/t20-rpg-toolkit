// cockpit-sidebar.jsx — T20 OS Sidebar for Cockpit
// Depends on: cockpit-icons.jsx

const NAV_SECTIONS = [
  { id: "world", label: "MUNDO", items: [
    { id: "cockpit",  label: "Cockpit",     icon: "layout-dashboard" },
    { id: "codex",    label: "Codex",        icon: "crown" },
    { id: "forge",    label: "Forja",         icon: "flame" },
    { id: "graph",    label: "Grafo",         icon: "waypoints" },
    { id: "visual",   label: "Visual",        icon: "images" },
  ]},
  { id: "table", label: "MESA", items: [
    { id: "campaigns",label: "Campanhas",   icon: "swords" },
    { id: "live",     label: "Mesa ao Vivo", icon: "presentation", badge: "Hot" },
    { id: "memory",   label: "Memória",      icon: "book-marked" },
  ]},
  { id: "support", label: "APOIO", items: [
    { id: "compendium",label:"Compêndio",   icon: "book-open-text" },
    { id: "map",      label: "Atlas",        icon: "scroll-text" },
    { id: "balance",  label: "Balanceamento",icon: "scale", disabled: true },
  ]},
];

function CockpitSidebar({ activeModule, onNavigate, collapsed, onToggle }) {
  const w = collapsed ? 60 : 240;
  return (
    <aside style={{
      width: w, flexShrink: 0, display: "flex", flexDirection: "column",
      borderRight: "1px solid rgba(255,255,255,0.07)",
      background: "linear-gradient(180deg,rgba(7,7,11,0.99),rgba(11,10,15,0.97))",
      height: "100vh", position: "sticky", top: 0, overflowY: "auto",
      overflowX: "hidden", transition: "width 0.28s cubic-bezier(0.2,0.65,0.3,0.9)",
      backdropFilter: "blur(24px)", zIndex: 10,
    }}>
      {/* Brand + toggle */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between", padding: collapsed ? "20px 0" : "18px 16px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        {!collapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: 8, background: "linear-gradient(135deg,rgba(188,74,63,.7),#6b1220)", filter: "blur(6px)", opacity: .8 }} />
              <div style={{ position: "relative", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, border: "1px solid rgba(188,74,63,.4)", background: "linear-gradient(135deg,rgba(188,74,63,.9),#6b1220)", fontSize: 10, fontWeight: 900, color: "#fff9f2", letterSpacing: "0.04em" }}>T20</div>
            </div>
            <div style={{ lineHeight: 1 }}>
              <div style={{ fontSize: 9, textTransform: "uppercase", color: "#b5aea4", letterSpacing: "0.14em" }}>Tormenta</div>
              <div style={{ fontSize: 17, fontWeight: 900, color: "#f4efe7" }}>OS</div>
            </div>
          </div>
        )}
        {collapsed && (
          <div style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, border: "1px solid rgba(188,74,63,.4)", background: "linear-gradient(135deg,rgba(188,74,63,.9),#6b1220)", fontSize: 10, fontWeight: 900, color: "#fff9f2" }}>T20</div>
        )}
        {!collapsed && (
          <button onClick={onToggle} style={{ background: "none", border: "none", cursor: "pointer", color: "#b5aea4", padding: 4, borderRadius: 6, display: "flex" }}>
            <LucideIcon name="chevron-left" size={14} />
          </button>
        )}
      </div>

      {collapsed && (
        <button onClick={onToggle} style={{ background: "none", border: "none", cursor: "pointer", color: "#b5aea4", padding: "10px 0", display: "flex", justifyContent: "center" }}>
          <LucideIcon name="chevron-right" size={14} />
        </button>
      )}

      {/* World pill */}
      {!collapsed && (
        <div style={{ margin: "12px 12px 8px", padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.07)", background: "linear-gradient(145deg,rgba(188,74,63,.07),transparent 60%,rgba(213,162,64,.06))" }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(245,221,177,0.7)", marginBottom: 3 }}>Mundo ativo</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#f4efe7" }}>Arton</div>
        </div>
      )}

      {/* Nav */}
      <div style={{ flex: 1, padding: collapsed ? "8px 0" : "4px 8px", display: "flex", flexDirection: "column", gap: collapsed ? 0 : 12 }}>
        {NAV_SECTIONS.map(section => (
          <div key={section.id}>
            {!collapsed && (
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(245,221,177,0.6)", padding: "4px 8px 4px", marginBottom: 2 }}>{section.label}</div>
            )}
            {section.items.map(item => {
              const isActive = activeModule === item.id;
              const isDisabled = item.disabled;
              return (
                <button key={item.id} onClick={() => !isDisabled && onNavigate(item.id)}
                  title={collapsed ? item.label : undefined}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    width: "100%", padding: collapsed ? "10px 0" : "9px 12px",
                    justifyContent: collapsed ? "center" : "flex-start",
                    borderRadius: collapsed ? 0 : 12,
                    border: `1px solid ${isActive ? "rgba(188,74,63,.3)" : "transparent"}`,
                    background: isActive ? "rgba(188,74,63,.12)" : "transparent",
                    color: isActive ? "#e06155" : isDisabled ? "rgba(255,255,255,.22)" : "rgba(255,255,255,.55)",
                    boxShadow: isActive ? "inset 0 0 18px rgba(188,74,63,.08)" : "none",
                    fontSize: 12, fontWeight: isActive ? 600 : 400,
                    cursor: isDisabled ? "not-allowed" : "pointer",
                    marginBottom: 1, textAlign: "left",
                    transition: "all .12s", fontFamily: "inherit",
                  }}>
                  <LucideIcon name={item.icon} size={15} color={isActive ? "#e06155" : "currentColor"} />
                  {!collapsed && <span style={{ flex: 1 }}>{item.label}</span>}
                  {!collapsed && item.badge && (
                    <span style={{ border: "1px solid rgba(251,191,36,.25)", background: "rgba(249,115,22,.12)", borderRadius: 9999, padding: "1px 7px", fontSize: 9, fontWeight: 700, color: "rgba(251,191,36,.9)" }}>{item.badge}</span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Status footer */}
      {!collapsed && (
        <div style={{ margin: "8px 12px 16px", padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#4b9f91", boxShadow: "0 0 6px #4b9f91", flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(75,159,145,.9)" }}>Em operação</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,.35)", letterSpacing: "0.04em" }}>Sessão 12 · Rodada 3</div>
          </div>
        </div>
      )}
    </aside>
  );
}

Object.assign(window, { CockpitSidebar });
