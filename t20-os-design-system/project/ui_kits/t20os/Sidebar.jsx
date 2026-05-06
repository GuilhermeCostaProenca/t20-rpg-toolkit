// Sidebar.jsx — T20 OS App Sidebar
// Exported to window.T20Sidebar

const T20SidebarData = {
  brand: { abbr: "T20", name: "OS", sub: "Tormenta" },
  worldSections: [
    {
      id: "world", label: "MUNDO",
      items: [
        { id: "cockpit",  label: "Cockpit",      icon: "layout-dashboard" },
        { id: "codex",    label: "Codex",         icon: "crown" },
        { id: "forge",    label: "Forja",          icon: "flame" },
        { id: "graph",    label: "Grafo",          icon: "waypoints" },
        { id: "visual",   label: "Visual",         icon: "images" },
      ],
    },
    {
      id: "table", label: "MESA",
      items: [
        { id: "campaigns",label: "Campanhas",     icon: "swords" },
        { id: "live",     label: "Mesa ao Vivo",  icon: "presentation", badge: "Hot" },
        { id: "memory",   label: "Memória",        icon: "book-marked" },
      ],
    },
    {
      id: "support", label: "APOIO",
      items: [
        { id: "compendium",label:"Compêndio",     icon: "book-open-text" },
        { id: "map",      label: "Atlas",          icon: "scroll-text" },
        { id: "balance",  label: "Balanceamento",  icon: "scale", disabled: true },
      ],
    },
  ],
};

function LucideIcon({ name, size = 16, style = {} }) {
  const icons = {
    "layout-dashboard": "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
    "crown": "M2 20h20M5 20V9l7-6 7 6v11",
    "flame": "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z",
    "waypoints": "M9 3H5a2 2 0 0 0-2 2v4M9 3h10a2 2 0 0 1 2 2v4M9 3v18M3 9v10a2 2 0 0 0 2 2h4M21 9v10a2 2 0 0 1-2 2h-4",
    "images": "M18 22H4a2 2 0 0 1-2-2V6M22 13V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h9M16 8h.01M22 16l-4-4-4 4",
    "swords": "M14.5 17.5 3 6 3 3h3l11.5 11.5M13 19l6-6M2 2l20 20M20 2L6.5 15.5",
    "presentation": "M2 3h20v14H2zM8 21h8M12 17v4",
    "book-marked": "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5V5a2 2 0 0 1 2-2h14v10h-6l-2 2-2-2H4",
    "book-open-text": "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7zM6 8h2M6 12h2M16 8h2M16 12h2",
    "scroll-text": "M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4M12 11h8M12 15h8",
    "scale": "M16 16h6M2 16h6M12 3v1M3 7l3 6M21 7l-3 6M12 4 3 7M12 4l9 3M9 13c0 2 1.3 3 3 3s3-1 3-3",
    "globe-2": "M15 21v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4M7 7h10l2 9H5zM12 12v5M8 7V5a4 4 0 0 1 8 0v2",
    "sparkles": "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0zM20 3v4M22 5h-4M4 17v2M5 18H3",
    "boxes": "M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42zM7 16.5l-4.74-2.85M7 16.5l5-3M7 16.5V19M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3zM17 16.5l-5-3M17 16.5l4.74-2.85M17 16.5V19M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8zM12 8 7.26 5.15M12 8l4.74-2.85M12 8v4.5",
  };
  const d = icons[name];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      {d && d.split("M").filter(Boolean).map((seg, i) => (
        <path key={i} d={"M" + seg} />
      ))}
    </svg>
  );
}

function BrandMark({ small }) {
  const sz = small ? 32 : 44;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: small ? 8 : 12 }}>
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: 10, background: "linear-gradient(135deg,rgba(188,74,63,.7),#bc4a3f,#6b1220)", filter: "blur(8px)", opacity: .8 }} />
        <div style={{ position: "relative", display: "flex", width: sz, height: sz, alignItems: "center", justifyContent: "center", borderRadius: 10, border: "1px solid rgba(188,74,63,.4)", background: "linear-gradient(135deg,rgba(188,74,63,.8),#bc4a3f,#6b1220)", fontSize: small ? 10 : 14, fontWeight: 900, color: "#fff9f2", boxShadow: "0 10px 34px rgba(226,69,69,.35)", letterSpacing: "0.05em" }}>T20</div>
      </div>
      <div style={{ lineHeight: 1 }}>
        <div style={{ fontSize: 10, textTransform: "uppercase", color: "#b5aea4", letterSpacing: "0.14em" }}>Tormenta</div>
        <div style={{ fontSize: small ? 16 : 22, fontWeight: 900, color: "#f4efe7" }}>OS</div>
      </div>
    </div>
  );
}

function Sidebar({ activeModule, onNavigate, worldName = "Arton" }) {
  return (
    <aside style={{ width: 286, flexShrink: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", borderRight: "1px solid rgba(255,255,255,.1)", background: "linear-gradient(180deg,rgba(8,8,12,.98),rgba(12,11,16,.94))", padding: "24px 20px", height: "100vh", position: "sticky", top: 0, overflowY: "auto", backdropFilter: "blur(24px)" }}>
      <div>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <BrandMark small />
          <span style={{ display: "inline-flex", border: "1px solid rgba(188,74,63,.2)", background: "rgba(188,74,63,.05)", borderRadius: 9999, padding: "2px 10px", fontSize: 10, color: "rgba(188,74,63,.9)", fontWeight: 600 }}>Em operação</span>
        </div>

        {/* World info */}
        <div style={{ position: "relative", overflow: "hidden", border: "1px solid rgba(255,255,255,.08)", borderRadius: 24, padding: 16, background: "linear-gradient(160deg,rgba(255,250,244,.045),rgba(255,255,255,.02) 40%,rgba(188,74,63,.06) 100%),linear-gradient(145deg,rgba(188,74,63,.08),transparent 42%,rgba(192,149,71,.1) 100%)", boxShadow: "0 20px 80px rgba(0,0,0,.55)", backdropFilter: "blur(20px)", marginBottom: 24 }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(245,221,177,.78)" }}>Mundo ativo</div>
          <div style={{ marginTop: 8, fontSize: 13, fontWeight: 600, color: "#f4efe7" }}>{worldName}</div>
          <div style={{ marginTop: 4, fontSize: 12, color: "#b5aea4", lineHeight: 1.5 }}>Navegue pelo mundo sem perder o contexto do que está vivo na mesa.</div>
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,.08)", marginBottom: 20 }} />

        {/* Nav sections */}
        {T20SidebarData.worldSections.map(section => (
          <div key={section.id} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(245,221,177,.78)", padding: "0 8px", marginBottom: 6 }}>{section.label}</div>
            <nav>
              {section.items.map(item => {
                const isActive = activeModule === item.id;
                const isDisabled = item.disabled;
                return (
                  <button
                    key={item.id}
                    onClick={() => !isDisabled && onNavigate(item.id)}
                    style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "10px 16px", borderRadius: 16, border: `1px solid ${isActive ? "rgba(188,74,63,.25)" : "transparent"}`, background: isActive ? "rgba(188,74,63,.12)" : "transparent", color: isActive ? "#bc4a3f" : isDisabled ? "rgba(255,255,255,.3)" : "#b5aea4", boxShadow: isActive ? "0 0 18px rgba(188,74,63,.18)" : "none", fontSize: 13, fontWeight: 500, cursor: isDisabled ? "not-allowed" : "pointer", marginBottom: 2, textAlign: "left", transition: "all .15s", fontFamily: "inherit" }}
                  >
                    <LucideIcon name={item.icon} size={16} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.badge && (
                      <span style={{ border: "1px solid rgba(255,165,0,.2)", background: "rgba(249,115,22,.1)", borderRadius: 9999, padding: "1px 8px", fontSize: 10, fontWeight: 600, color: "rgba(251,191,36,.9)" }}>{item.badge}</span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        ))}

        {/* Priority cards */}
        <div>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(245,221,177,.78)", padding: "0 8px", marginBottom: 8 }}>Prioridades</div>
          <div style={{ border: "1px solid rgba(255,255,255,.08)", borderRadius: 16, padding: 16, background: "linear-gradient(180deg,rgba(15,14,20,.9),rgba(10,10,16,.86)), radial-gradient(circle at top left,rgba(188,74,63,.12),transparent 36%)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.05), 0 18px 70px rgba(0,0,0,.42)", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#f4efe7" }}>
              <LucideIcon name="boxes" size={14} style={{ color: "rgba(251,191,36,.8)" }} />
              Atualização 1
            </div>
            <div style={{ marginTop: 6, fontSize: 12, color: "#b5aea4", lineHeight: 1.5 }}>Shell total, cockpit vivo e base visual cinemática.</div>
          </div>
          <div style={{ border: "1px solid rgba(255,255,255,.08)", borderRadius: 16, padding: 16, background: "linear-gradient(180deg,rgba(15,14,20,.9),rgba(10,10,16,.86)), radial-gradient(circle at top left,rgba(188,74,63,.12),transparent 36%)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.05), 0 18px 70px rgba(0,0,0,.42)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#f4efe7" }}>
              <LucideIcon name="book-marked" size={14} style={{ color: "rgba(188,74,63,.9)" }} />
              Próxima frente
            </div>
            <div style={{ marginTop: 6, fontSize: 12, color: "#b5aea4", lineHeight: 1.5 }}>Forja do Mundo como bootstrap vivo de criação.</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ position: "relative", overflow: "hidden", border: "1px solid rgba(255,255,255,.08)", borderRadius: 24, padding: 16, background: "linear-gradient(160deg,rgba(255,250,244,.045),rgba(255,255,255,.02) 40%,rgba(188,74,63,.06) 100%),linear-gradient(145deg,rgba(188,74,63,.08),transparent 42%,rgba(192,149,71,.1) 100%)", boxShadow: "0 20px 80px rgba(0,0,0,.55)", marginTop: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(188,74,63,.8)", marginBottom: 8 }}>
          <LucideIcon name="sparkles" size={12} />
          Master system
        </div>
        <div style={{ fontSize: 12, color: "#b5aea4", lineHeight: 1.5, marginBottom: 12 }}>Você está dentro do cockpit vivo. O foco agora é reduzir troca de contexto.</div>
        <button onClick={() => onNavigate("cockpit")} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "8px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.05)", color: "#f4efe7", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
          <LucideIcon name="layout-dashboard" size={14} />
          Voltar ao cockpit
        </button>
      </div>
    </aside>
  );
}

Object.assign(window, { Sidebar, BrandMark, LucideIcon });
