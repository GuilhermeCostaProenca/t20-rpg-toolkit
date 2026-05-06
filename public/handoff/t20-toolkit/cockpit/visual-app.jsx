// visual-app.jsx — Visual module root app
// Depends on: cockpit-icons.jsx, cockpit-sidebar.jsx, visual-data.jsx, visual-gallery.jsx

function VisualHeader({ totalCount, filteredCount }) {
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
          background: "rgba(155,93,229,.12)", border: "1px solid rgba(155,93,229,.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <LucideIcon name="images" size={16} color="#9b5de5" />
        </div>
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(245,221,177,.65)" }}>Arton · Biblioteca visual</div>
          <div style={{ fontFamily: "var(--font-d)", fontSize: 16, fontWeight: 700, color: "#f4efe7", letterSpacing: "0.06em" }}>VISUAL DO MUNDO</div>
        </div>
        <div style={{ width: 1, height: 24, background: "rgba(255,255,255,.1)" }} />
        <div style={{ fontFamily: "var(--font-m)", fontSize: 11, color: "rgba(255,255,255,.35)" }}>
          {filteredCount} <span style={{ color: "rgba(255,255,255,.2)" }}>/ {totalCount}</span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Layout toggles */}
        <div style={{ display: "flex", gap: 2, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.09)", borderRadius: 9, padding: 3 }}>
          {[
            { icon: "boxes",        id: "masonry" },
            { icon: "layout-dashboard", id: "grid" },
          ].map(btn => (
            <div key={btn.id} style={{
              width: 26, height: 26, borderRadius: 6,
              background: btn.id === "masonry" ? "rgba(255,255,255,.08)" : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}>
              <LucideIcon name={btn.icon} size={13} color={btn.id === "masonry" ? "#f4efe7" : "rgba(255,255,255,.3)"} />
            </div>
          ))}
        </div>

        <button style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          background: "rgba(155,93,229,.12)", border: "1px solid rgba(155,93,229,.3)",
          color: "#9b5de5", borderRadius: 10, padding: "7px 14px",
          fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
          transition: "all .15s",
        }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(155,93,229,.22)"}
        onMouseLeave={e => e.currentTarget.style.background = "rgba(155,93,229,.12)"}>
          <LucideIcon name="plus" size={13} color="#9b5de5" />
          Adicionar ativo
        </button>

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

function VisualApp() {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [category, setCategory]                 = React.useState("Todos");
  const [lightboxAsset, setLightboxAsset]       = React.useState(null);
  const [search, setSearch]                     = React.useState("");

  const filtered = VISUAL_ASSETS.filter(a => {
    const matchCat    = category === "Todos" || a.category === category;
    const q           = search.toLowerCase();
    const matchSearch = !q || a.title.toLowerCase().includes(q) || a.category.toLowerCase().includes(q) || (a.entityName || "").toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  // Sort featured first
  const sorted = [...filtered].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  function openLightbox(asset) { setLightboxAsset(asset); }
  function closeLightbox()     { setLightboxAsset(null); }

  function lightboxNav(dir) {
    if (!lightboxAsset) return;
    const idx = sorted.findIndex(a => a.id === lightboxAsset.id);
    const next = sorted[(idx + dir + sorted.length) % sorted.length];
    setLightboxAsset(next);
  }

  function handleNavigation(moduleId) {
    navigateHandoffModule(moduleId);
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg)", color: "var(--fg)", fontFamily: "var(--font-b)" }}>

      {/* Ambient */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse 50% 60% at 50% 30%, rgba(155,93,229,.04), transparent 60%)" }} />

      <CockpitSidebar
        activeModule="visual"
        onNavigate={handleNavigation}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(c => !c)}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", zIndex: 1 }}>
        <VisualHeader totalCount={VISUAL_ASSETS.length} filteredCount={sorted.length} />

        {/* Filter + search bar */}
        <div style={{
          padding: "10px 20px", borderBottom: "1px solid rgba(255,255,255,.06)",
          display: "flex", alignItems: "center", gap: 12, flexShrink: 0,
          background: "rgba(8,7,12,.8)",
        }}>
          <CategoryFilter active={category} onChange={setCategory} />
          <div style={{ marginLeft: "auto", position: "relative", flexShrink: 0 }}>
            <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
              <LucideIcon name="crosshair" size={13} color="rgba(255,255,255,.3)" />
            </div>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar ativos…"
              style={{
                background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)",
                borderRadius: 10, color: "#f4efe7", fontFamily: "var(--font-b)",
                fontSize: 12, padding: "7px 12px 7px 32px", outline: "none",
                width: 200, transition: "border-color .2s",
              }}
              onFocus={e => e.target.style.borderColor = "rgba(155,93,229,.4)"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,.1)"}
            />
          </div>
        </div>

        {/* Gallery */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {sorted.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12, color: "rgba(255,255,255,.25)" }}>
              <LucideIcon name="images" size={36} color="rgba(255,255,255,.1)" />
              <div style={{ fontSize: 13 }}>Nenhum ativo encontrado</div>
            </div>
          ) : (
            <MasonryGrid assets={sorted} onCardClick={openLightbox} />
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxAsset && (
        <Lightbox
          asset={lightboxAsset}
          onClose={closeLightbox}
          onPrev={() => lightboxNav(-1)}
          onNext={() => lightboxNav(1)}
        />
      )}
    </div>
  );
}

const visualRoot = ReactDOM.createRoot(document.getElementById("root"));
visualRoot.render(<VisualApp />);
