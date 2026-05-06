// codex-grid.jsx — Search bar, filter chips, entity card grid
// Depends on: cockpit-icons.jsx, codex-data.jsx

function TypeBadge({ type, small }) {
  const m = TYPE_META[type] || { color: "#b5aea4", bg: "rgba(181,174,164,.08)", border: "rgba(181,174,164,.2)", label: type };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      border: `1px solid ${m.border}`, background: m.dim,
      borderRadius: 9999, padding: small ? "2px 7px" : "3px 9px",
      fontSize: small ? 9 : 10, fontWeight: 700,
      color: m.color, letterSpacing: "0.08em", textTransform: "uppercase",
      whiteSpace: "nowrap",
    }}>
      <LucideIcon name={m.icon} size={small ? 9 : 10} color={m.color} />
      {m.label}
    </span>
  );
}

function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META["Ativo"];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      border: `1px solid ${m.border}`, background: m.bg,
      borderRadius: 9999, padding: "2px 8px",
      fontSize: 9, fontWeight: 600, color: m.color,
      letterSpacing: "0.06em", whiteSpace: "nowrap",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: m.color, display: "inline-block" }} />
      {status}
    </span>
  );
}

function EntityIcon({ type, size = 52 }) {
  const m = TYPE_META[type] || { color: "#b5aea4", dim: "rgba(181,174,164,.1)", icon: "boxes" };
  return (
    <div style={{
      width: size, height: size, borderRadius: 14, flexShrink: 0,
      background: m.dim, border: `1px solid ${m.border || "rgba(255,255,255,.1)"}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: `0 0 20px ${m.color}22`,
    }}>
      <LucideIcon name={m.icon} size={Math.round(size * 0.44)} color={m.color} />
    </div>
  );
}

function EntityCard({ entity, selected, onClick }) {
  const m = TYPE_META[entity.type] || {};
  const [hovered, setHovered] = React.useState(false);
  const active = selected || hovered;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative", overflow: "hidden",
        borderRadius: 16, cursor: "pointer",
        border: `1px solid ${active ? (m.border || "rgba(255,255,255,.2)") : "rgba(255,255,255,.07)"}`,
        background: active
          ? `linear-gradient(145deg, ${m.dim || "rgba(255,255,255,.04)"}, rgba(8,7,12,.97))`
          : "linear-gradient(160deg,rgba(14,13,19,.97),rgba(8,7,12,.95))",
        boxShadow: active
          ? `0 0 0 1px ${m.border || "transparent"}, 0 16px 50px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.05)`
          : "inset 0 1px 0 rgba(255,255,255,.03), 0 8px 30px rgba(0,0,0,.4)",
        transition: "all .2s cubic-bezier(.2,.65,.3,.9)",
        transform: active ? "translateY(-2px)" : "none",
      }}>

      {/* Top color strip */}
      <div style={{
        height: 3,
        background: `linear-gradient(90deg, ${m.color || "#bc4a3f"}, transparent)`,
        opacity: active ? 1 : 0.4,
        transition: "opacity .2s",
      }} />

      <div style={{ padding: "16px 16px 14px" }}>
        {/* Icon + type */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
          <EntityIcon type={entity.type} size={44} />
          <StatusBadge status={entity.status} />
        </div>

        {/* Name */}
        <div style={{
          fontFamily: "var(--font-d)", fontSize: 14, fontWeight: 700,
          color: "#f4efe7", letterSpacing: "0.02em", lineHeight: 1.2,
          marginBottom: 4, textWrap: "pretty",
        }}>{entity.name}</div>

        {/* Tagline */}
        <div style={{ fontSize: 11, color: m.color || "#b5aea4", fontWeight: 500, marginBottom: 8, opacity: 0.85 }}>
          {entity.tagline}
        </div>

        {/* Desc */}
        <div style={{
          fontSize: 11, color: "rgba(255,255,255,.45)", lineHeight: 1.55,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>{entity.desc}</div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
          <TypeBadge type={entity.type} small />
          <div style={{ display: "flex", alignItems: "center", gap: 4, color: active ? (m.color || "#b5aea4") : "rgba(255,255,255,.25)", transition: "color .2s" }}>
            <span style={{ fontSize: 10 }}>Ver ficha</span>
            <LucideIcon name="chevron-right" size={11} />
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchBar({ value, onChange }) {
  return (
    <div style={{ position: "relative", flex: 1, maxWidth: 480 }}>
      <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
        <LucideIcon name="crosshair" size={15} color="rgba(255,255,255,.3)" />
      </div>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Buscar entidades, locais, facções…"
        style={{
          width: "100%", padding: "11px 14px 11px 40px",
          background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)",
          borderRadius: 14, color: "#f4efe7", fontFamily: "var(--font-b)",
          fontSize: 13, outline: "none",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,.04)",
          transition: "border-color .2s",
        }}
        onFocus={e => e.target.style.borderColor = "rgba(188,74,63,.4)"}
        onBlur={e => e.target.style.borderColor = "rgba(255,255,255,.1)"}
      />
      {value && (
        <button onClick={() => onChange("")}
          style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,.4)", padding: 2 }}>
          <LucideIcon name="x" size={13} />
        </button>
      )}
    </div>
  );
}

function FilterChips({ active, onChange }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {FILTER_TYPES.map(type => {
        const m = TYPE_META[type];
        const isActive = active === type;
        return (
          <button key={type} onClick={() => onChange(type)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "6px 13px", borderRadius: 10, cursor: "pointer", fontFamily: "inherit",
              border: `1px solid ${isActive ? (m?.border || "rgba(255,255,255,.25)") : "rgba(255,255,255,.08)"}`,
              background: isActive ? (m?.dim || "rgba(255,255,255,.08)") : "rgba(255,255,255,.03)",
              color: isActive ? (m?.color || "#f4efe7") : "rgba(255,255,255,.45)",
              fontSize: 11, fontWeight: isActive ? 700 : 400,
              transition: "all .15s",
            }}>
            {m && <LucideIcon name={m.icon} size={11} color={isActive ? m.color : "rgba(255,255,255,.35)"} />}
            {type}
          </button>
        );
      })}
    </div>
  );
}

function CodexGrid({ entities, selectedId, onSelect, search, setSearch, filter, setFilter }) {
  const filtered = entities.filter(e => {
    const matchType = filter === "Todos" || e.type === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || e.name.toLowerCase().includes(q) || e.tagline.toLowerCase().includes(q) || e.desc.toLowerCase().includes(q) || e.type.toLowerCase().includes(q);
    return matchType && matchSearch;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Toolbar */}
      <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid rgba(255,255,255,.06)", display: "flex", flexDirection: "column", gap: 12, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <SearchBar value={search} onChange={setSearch} />
          <div style={{ fontSize: 10, color: "rgba(255,255,255,.3)", whiteSpace: "nowrap", fontFamily: "var(--font-m)" }}>
            {filtered.length} / {entities.length}
          </div>
        </div>
        <FilterChips active={filter} onChange={setFilter} />
      </div>

      {/* Grid */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
        {filtered.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, gap: 12, color: "rgba(255,255,255,.25)" }}>
            <LucideIcon name="crosshair" size={32} color="rgba(255,255,255,.15)" />
            <div style={{ fontSize: 13 }}>Nenhuma entidade encontrada</div>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
            gap: 12,
          }}>
            {filtered.map(e => (
              <EntityCard key={e.id} entity={e} selected={selectedId === e.id} onClick={() => onSelect(e)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { CodexGrid, TypeBadge, StatusBadge, EntityIcon });
