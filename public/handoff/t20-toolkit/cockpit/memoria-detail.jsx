// memoria-detail.jsx — Sliding event detail panel
// Depends on: cockpit-icons.jsx, memoria-data.jsx, memoria-timeline.jsx

function ConsequenceRow({ text, done, onToggle }) {
  return (
    <div
      onClick={onToggle}
      style={{
        display: "flex", alignItems: "flex-start", gap: 9, padding: "7px 0",
        borderBottom: "1px solid rgba(255,255,255,.04)", cursor: "pointer",
        opacity: done ? 0.5 : 1, transition: "opacity .2s",
      }}>
      <div style={{
        width: 16, height: 16, borderRadius: 5, flexShrink: 0, marginTop: 1,
        border: `1px solid ${done ? "rgba(75,159,145,.5)" : "rgba(255,255,255,.2)"}`,
        background: done ? "rgba(75,159,145,.15)" : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all .15s",
      }}>
        {done && <LucideIcon name="check" size={10} color="#4b9f91" />}
      </div>
      <span style={{ fontSize: 12, color: done ? "rgba(255,255,255,.4)" : "rgba(255,255,255,.7)", lineHeight: 1.5, textDecoration: done ? "line-through" : "none" }}>{text}</span>
    </div>
  );
}

function SectionLabelM({ children }) {
  return (
    <div style={{
      fontSize: 9, fontWeight: 700, letterSpacing: "0.2em",
      textTransform: "uppercase", color: "rgba(245,221,177,.65)",
      marginBottom: 10, display: "flex", alignItems: "center", gap: 8,
    }}>
      <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(245,221,177,.2), transparent)" }} />
      {children}
      <div style={{ flex: 1, height: 1, background: "linear-gradient(270deg, rgba(245,221,177,.2), transparent)" }} />
    </div>
  );
}

function MemoriaDetail({ event, onClose }) {
  const [visible, setVisible]   = React.useState(false);
  const [resolved, setResolved] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem(`t20-mem-${event.id}`) || "[]"); } catch { return []; }
  });

  React.useEffect(() => { const t = setTimeout(() => setVisible(true), 10); return () => clearTimeout(t); }, []);

  function handleClose() { setVisible(false); setTimeout(onClose, 280); }

  function toggleConsequence(idx) {
    setResolved(prev => {
      const next = prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx];
      try { localStorage.setItem(`t20-mem-${event.id}`, JSON.stringify(next)); } catch {}
      return next;
    });
  }

  const tm = EVENT_TYPES[event.type] || { color: "#b5aea4", border: "rgba(181,174,164,.3)", dim: "rgba(181,174,164,.06)", icon: "boxes" };

  return (
    <>
      {/* Backdrop */}
      <div onClick={handleClose} style={{
        position: "absolute", inset: 0, zIndex: 20,
        background: "rgba(6,7,12,.55)", backdropFilter: "blur(2px)",
        opacity: visible ? 1 : 0, transition: "opacity .28s",
      }} />

      {/* Panel */}
      <div style={{
        position: "absolute", top: 0, right: 0, bottom: 0, width: 420,
        zIndex: 30,
        background: "linear-gradient(160deg,rgba(14,13,20,.99),rgba(9,8,14,.99))",
        borderLeft: `1px solid ${tm.border}`,
        boxShadow: `-20px 0 60px rgba(0,0,0,.7), inset 1px 0 0 ${tm.color}0a`,
        display: "flex", flexDirection: "column",
        transform: visible ? "translateX(0)" : "translateX(100%)",
        transition: "transform .28s cubic-bezier(.2,.65,.3,.9)",
      }}>
        <div style={{ height: 3, background: `linear-gradient(90deg, ${tm.color}, transparent)`, flexShrink: 0 }} />

        {/* Header */}
        <div style={{ padding: "16px 18px 12px", borderBottom: "1px solid rgba(255,255,255,.07)", flexShrink: 0, background: `linear-gradient(135deg, ${tm.color}10, transparent 60%)` }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
            <div>
              <div style={{ fontFamily: "var(--font-d)", fontSize: 17, fontWeight: 700, color: "#f4efe7", letterSpacing: "0.02em", lineHeight: 1.1, marginBottom: 6 }}>{event.title}</div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                <TypeBadgeM type={event.type} />
                <ImpactBadge level={event.impact} />
                <span style={{ fontFamily: "var(--font-m)", fontSize: 9, color: "rgba(255,255,255,.35)", padding: "2px 7px", borderRadius: 7, border: "1px solid rgba(255,255,255,.08)", background: "rgba(255,255,255,.02)" }}>
                  Sessão {event.session} · {event.date}
                </span>
              </div>
            </div>
            <button onClick={handleClose}
              style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 8, padding: 6, cursor: "pointer", color: "rgba(255,255,255,.5)", display: "flex", flexShrink: 0, transition: "all .15s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.12)"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.06)"; e.currentTarget.style.color = "rgba(255,255,255,.5)"; }}>
              <LucideIcon name="x" size={13} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px" }}>

          {/* Summary */}
          <div style={{ marginBottom: 20 }}>
            <SectionLabelM>O que aconteceu</SectionLabelM>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,.65)", lineHeight: 1.65 }}>{event.summary}</p>
          </div>

          {/* Consequences */}
          {event.consequences?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <SectionLabelM>Consequências</SectionLabelM>
              {event.consequences.map((c, i) => (
                <ConsequenceRow key={i} text={c} done={resolved.includes(i)} onToggle={() => toggleConsequence(i)} />
              ))}
              <div style={{ marginTop: 6, fontSize: 9, color: "rgba(255,255,255,.25)" }}>{resolved.length}/{event.consequences.length} resolvidas</div>
            </div>
          )}

          {/* World change */}
          {event.worldChange && (
            <div style={{ marginBottom: 20 }}>
              <SectionLabelM>Mudança no mundo</SectionLabelM>
              <div style={{ padding: "10px 12px", borderRadius: 10, border: `1px solid ${tm.border}`, background: tm.color + "0c" }}>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,.6)", lineHeight: 1.6 }}>{event.worldChange}</p>
              </div>
            </div>
          )}

          {/* Entities */}
          {event.entities?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <SectionLabelM>Entidades envolvidas</SectionLabelM>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {event.entities.map(e => (
                  <span key={e} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 8, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.09)", color: "rgba(255,255,255,.6)" }}>{e}</span>
                ))}
              </div>
            </div>
          )}

          {/* GM Note */}
          {event.gmNote && (
            <div style={{ marginBottom: 8 }}>
              <SectionLabelM>Nota do mestre</SectionLabelM>
              <div style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(213,162,64,.2)", background: "rgba(213,162,64,.05)" }}>
                <p style={{ fontSize: 12, color: "rgba(213,162,64,.8)", lineHeight: 1.6, fontStyle: "italic" }}>{event.gmNote}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

Object.assign(window, { MemoriaDetail });
