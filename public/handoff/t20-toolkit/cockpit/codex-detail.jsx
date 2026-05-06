// codex-detail.jsx — Sliding entity detail panel
// Depends on: cockpit-icons.jsx, codex-data.jsx, codex-grid.jsx

function AttrCell({ label, val, color }) {
  return (
    <div style={{
      padding: "10px 12px", borderRadius: 10,
      background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)",
      display: "flex", flexDirection: "column", gap: 3,
    }}>
      <span style={{ fontSize: 9, color: "rgba(255,255,255,.35)", letterSpacing: "0.14em", textTransform: "uppercase" }}>{label}</span>
      <span style={{ fontFamily: "var(--font-m)", fontSize: 14, fontWeight: 700, color: color || "#f4efe7", lineHeight: 1 }}>{val}</span>
    </div>
  );
}

function RelationPill({ rel, onNavigate }) {
  const m = TYPE_META[rel.type] || {};
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
      borderRadius: 12, border: `1px solid ${m.border || "rgba(255,255,255,.08)"}`,
      background: m.dim || "rgba(255,255,255,.03)",
      cursor: "pointer", transition: "all .15s",
    }}
    onMouseEnter={e => e.currentTarget.style.filter = "brightness(1.2)"}
    onMouseLeave={e => e.currentTarget.style.filter = ""}
    onClick={() => onNavigate && onNavigate(rel.name)}>
      <EntityIcon type={rel.type} size={28} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#f4efe7", lineHeight: 1.2 }}>{rel.name}</div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)", marginTop: 2 }}>{rel.rel}</div>
      </div>
      <LucideIcon name="chevron-right" size={13} color="rgba(255,255,255,.2)" />
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 9, fontWeight: 700, letterSpacing: "0.2em",
      textTransform: "uppercase", color: "rgba(245,221,177,.7)",
      marginBottom: 10, display: "flex", alignItems: "center", gap: 8,
    }}>
      <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(245,221,177,.2), transparent)" }} />
      {children}
      <div style={{ flex: 1, height: 1, background: "linear-gradient(270deg, rgba(245,221,177,.2), transparent)" }} />
    </div>
  );
}

function CodexDetail({ entity, onClose, onNavigateTo, gmNotes, setGmNotes }) {
  const [visible, setVisible] = React.useState(false);
  const m = TYPE_META[entity.type] || { color: "#b5aea4", border: "rgba(181,174,164,.3)", dim: "rgba(181,174,164,.06)", icon: "boxes" };

  // Animate in
  React.useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 280);
  }

  const noteKey = `t20-note-${entity.id}`;
  const [localNote, setLocalNote] = React.useState(() => {
    try { return localStorage.getItem(noteKey) || entity.notes || ""; } catch { return entity.notes || ""; }
  });
  function saveNote(val) {
    setLocalNote(val);
    try { localStorage.setItem(noteKey, val); } catch {}
    setGmNotes && setGmNotes(val);
  }

  return (
    <>
      {/* Backdrop */}
      <div onClick={handleClose} style={{
        position: "absolute", inset: 0, zIndex: 20,
        background: "rgba(6,7,12,.6)",
        backdropFilter: "blur(2px)",
        opacity: visible ? 1 : 0,
        transition: "opacity .28s",
      }} />

      {/* Panel */}
      <div style={{
        position: "absolute", top: 0, right: 0, bottom: 0,
        width: 400, zIndex: 30,
        background: "linear-gradient(160deg,rgba(14,13,20,.99),rgba(9,8,14,.99))",
        borderLeft: `1px solid ${m.border}`,
        boxShadow: `-20px 0 60px rgba(0,0,0,.7), inset 1px 0 0 ${m.dim}`,
        display: "flex", flexDirection: "column",
        transform: visible ? "translateX(0)" : "translateX(100%)",
        transition: "transform .28s cubic-bezier(.2,.65,.3,.9)",
      }}>
        {/* Top color bar */}
        <div style={{ height: 3, background: `linear-gradient(90deg, ${m.color}, transparent)`, flexShrink: 0 }} />

        {/* Header */}
        <div style={{
          padding: "18px 20px 14px", borderBottom: "1px solid rgba(255,255,255,.07)",
          flexShrink: 0,
          background: `linear-gradient(135deg, ${m.dim}, transparent 60%)`,
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <EntityIcon type={entity.type} size={44} />
              <div>
                <div style={{ fontFamily: "var(--font-d)", fontSize: 18, fontWeight: 700, color: "#f4efe7", letterSpacing: "0.02em", lineHeight: 1.1, marginBottom: 4 }}>{entity.name}</div>
                <div style={{ fontSize: 11, color: m.color, fontWeight: 500 }}>{entity.tagline}</div>
              </div>
            </div>
            <button onClick={handleClose} style={{
              background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)",
              borderRadius: 8, padding: 7, cursor: "pointer", color: "rgba(255,255,255,.5)",
              display: "flex", transition: "all .15s", flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.1)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.06)"; e.currentTarget.style.color = "rgba(255,255,255,.5)"; }}>
              <LucideIcon name="x" size={14} />
            </button>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <TypeBadge type={entity.type} />
            <StatusBadge status={entity.status} />
          </div>
        </div>

        {/* Body — scrollable */}
        <div style={{ flex: 1, overflowY: "auto", padding: "18px 20px" }}>

          {/* Descrição */}
          <div style={{ marginBottom: 22 }}>
            <SectionLabel>Descrição</SectionLabel>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,.65)", lineHeight: 1.65, textWrap: "pretty" }}>{entity.desc}</p>
          </div>

          {/* Atributos */}
          <div style={{ marginBottom: 22 }}>
            <SectionLabel>Atributos</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
              {entity.attrs.map(a => (
                <AttrCell key={a.label} label={a.label} val={a.val} color={m.color} />
              ))}
            </div>
          </div>

          {/* História */}
          <div style={{ marginBottom: 22 }}>
            <SectionLabel>História</SectionLabel>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,.5)", lineHeight: 1.7, textWrap: "pretty" }}>{entity.history}</p>
          </div>

          {/* Relações */}
          {entity.relations?.length > 0 && (
            <div style={{ marginBottom: 22 }}>
              <SectionLabel>Relações</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {entity.relations.map((r, i) => (
                  <RelationPill key={i} rel={r} onNavigate={onNavigateTo} />
                ))}
              </div>
            </div>
          )}

          {/* Notas do Mestre */}
          <div style={{ marginBottom: 8 }}>
            <SectionLabel>Notas do Mestre</SectionLabel>
            <div style={{ position: "relative" }}>
              <textarea
                value={localNote}
                onChange={e => saveNote(e.target.value)}
                rows={5}
                placeholder="Anotações privadas sobre esta entidade…"
                style={{
                  width: "100%", boxSizing: "border-box",
                  background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.08)",
                  borderRadius: 12, color: "#f4efe7", fontFamily: "var(--font-m)",
                  fontSize: 11, lineHeight: 1.65, padding: "12px 14px",
                  resize: "vertical", outline: "none",
                  transition: "border-color .2s",
                }}
                onFocus={e => e.target.style.borderColor = `${m.border}`}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,.08)"}
              />
              <div style={{ position: "absolute", bottom: 10, right: 12, fontSize: 9, color: "rgba(255,255,255,.2)" }}>Auto-salvo</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

Object.assign(window, { CodexDetail });
