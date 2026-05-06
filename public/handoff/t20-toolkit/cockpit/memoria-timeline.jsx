// memoria-timeline.jsx — Vertical timeline, event cards, filters, world state
// Depends on: cockpit-icons.jsx, memoria-data.jsx

function ImpactBadge({ level }) {
  const m = IMPACT_LEVELS[level] || IMPACT_LEVELS["Médio"];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 8px", borderRadius: 9999, fontSize: 9, fontWeight: 700,
      background: m.color + "18", border: `1px solid ${m.color}44`,
      color: m.color, letterSpacing: "0.06em", whiteSpace: "nowrap",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: m.dot, display: "inline-block" }} />
      {level}
    </span>
  );
}

function TypeBadgeM({ type }) {
  const m = EVENT_TYPES[type] || { color: "#b5aea4", icon: "boxes", border: "rgba(181,174,164,.3)" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 8px", borderRadius: 9999, fontSize: 9, fontWeight: 700,
      background: m.color + "15", border: `1px solid ${m.border}`,
      color: m.color, letterSpacing: "0.06em",
    }}>
      <LucideIcon name={m.icon} size={9} color={m.color} />
      {type}
    </span>
  );
}

function EventCard({ event, selected, onClick }) {
  const tm = EVENT_TYPES[event.type] || { color: "#b5aea4" };
  const isActive = selected;
  const [hovered, setHovered] = React.useState(false);
  const show = isActive || hovered;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative", cursor: "pointer",
        borderRadius: 14, overflow: "hidden",
        border: `1px solid ${show ? tm.color + "55" : event.pending ? "rgba(255,255,255,.09)" : "rgba(255,255,255,.05)"}`,
        background: show
          ? `linear-gradient(145deg, ${tm.color}14, rgba(8,7,12,.97))`
          : event.pending
            ? "rgba(255,255,255,.03)"
            : "rgba(255,255,255,.015)",
        boxShadow: show ? `0 0 0 1px ${tm.color}22, 0 12px 40px rgba(0,0,0,.5)` : "none",
        transform: show ? "translateX(4px)" : "none",
        transition: "all .2s cubic-bezier(.2,.65,.3,.9)",
        opacity: event.pending ? 1 : 0.7,
      }}>

      {/* Left color strip */}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: `linear-gradient(180deg, ${tm.color}, ${tm.color}44)`, opacity: show ? 1 : 0.4, transition: "opacity .2s" }} />

      <div style={{ padding: "12px 14px 12px 18px" }}>
        {/* Top row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "var(--font-d)", fontSize: 13, fontWeight: 700, color: show ? "#f4efe7" : "rgba(255,255,255,.75)", letterSpacing: "0.02em", lineHeight: 1.2, marginBottom: 4 }}>
              {event.title}
            </div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              <TypeBadgeM type={event.type} />
              <ImpactBadge level={event.impact} />
              {event.pending && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 7px", borderRadius: 9999, fontSize: 9, fontWeight: 600, background: "rgba(213,162,64,.1)", border: "1px solid rgba(213,162,64,.25)", color: "#d5a240" }}>
                  <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#d5a240", animation: "pendingBlink 2s ease-in-out infinite", display: "inline-block" }} />
                  Pendente
                </span>
              )}
            </div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontFamily: "var(--font-m)", fontSize: 10, color: "rgba(255,255,255,.3)", marginBottom: 1 }}>S{event.session}</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,.25)" }}>{event.date}</div>
          </div>
        </div>

        {/* Summary */}
        <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)", lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: show ? 10 : 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {event.summary}
        </div>

        {/* Entities */}
        {event.entities?.length > 0 && (
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 8 }}>
            {event.entities.slice(0, 4).map(e => (
              <span key={e} style={{ fontSize: 9, padding: "2px 7px", borderRadius: 6, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", color: "rgba(255,255,255,.45)" }}>{e}</span>
            ))}
            {event.entities.length > 4 && <span style={{ fontSize: 9, color: "rgba(255,255,255,.25)" }}>+{event.entities.length - 4}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterBar({ active, onChange, counts }) {
  return (
    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
      {FILTER_EVENTS.map(type => {
        const m = EVENT_TYPES[type];
        const cnt = type === "Todos" ? Object.values(counts).reduce((a,b)=>a+b,0) : (counts[type]||0);
        const isActive = active === type;
        return (
          <button key={type} onClick={() => onChange(type)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "5px 11px", borderRadius: 9, cursor: "pointer", fontFamily: "inherit",
              border: `1px solid ${isActive ? (m?.border||"rgba(255,255,255,.2)") : "rgba(255,255,255,.08)"}`,
              background: isActive ? (m?.color+"14"||"rgba(255,255,255,.06)") : "rgba(255,255,255,.03)",
              color: isActive ? (m?.color||"#f4efe7") : "rgba(255,255,255,.4)",
              fontSize: 10, fontWeight: isActive ? 700 : 400, transition: "all .15s",
            }}>
            {m && <LucideIcon name={m.icon} size={10} color={isActive ? m.color : "rgba(255,255,255,.3)"} />}
            {type}
            <span style={{ fontFamily: "var(--font-m)", fontSize: 8, opacity: 0.55 }}>{cnt}</span>
          </button>
        );
      })}
    </div>
  );
}

function WorldStatePanel() {
  return (
    <div style={{
      flexShrink: 0,
      borderBottom: "1px solid rgba(255,255,255,.07)",
      padding: "14px 20px",
    }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(245,221,177,.7)", marginBottom: 10 }}>Estado atual do mundo</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 6 }}>
        {WORLD_STATE.map(ws => (
          <div key={ws.id} style={{
            display: "flex", alignItems: "center", gap: 8, padding: "8px 10px",
            borderRadius: 9, border: `1px solid ${ws.color}30`, background: ws.color + "0c",
          }}>
            <LucideIcon name={ws.icon} size={13} color={ws.color} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,.65)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ws.label}</div>
              <div style={{ fontSize: 9, color: ws.color, fontWeight: 600 }}>{ws.status}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MemoriaTimeline({ events, selectedId, onSelect, filter, setFilter, search, setSearch }) {
  const typeCounts = React.useMemo(() => {
    const c = {};
    events.forEach(e => { c[e.type] = (c[e.type]||0)+1; });
    return c;
  }, [events]);

  const filtered = events.filter(e => {
    const matchType = filter === "Todos" || e.type === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || e.title.toLowerCase().includes(q) || e.summary.toLowerCase().includes(q) || (e.entities||[]).some(en=>en.toLowerCase().includes(q));
    return matchType && matchSearch;
  });

  // Group by session
  const sessions = [...new Set(filtered.map(e => e.session))].sort((a,b) => b - a);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <WorldStatePanel />

      {/* Filters */}
      <div style={{ padding: "10px 20px", borderBottom: "1px solid rgba(255,255,255,.06)", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <FilterBar active={filter} onChange={setFilter} counts={typeCounts} />
        <div style={{ marginLeft: "auto", position: "relative", flexShrink: 0 }}>
          <div style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
            <LucideIcon name="crosshair" size={12} color="rgba(255,255,255,.3)" />
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar eventos…"
            style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 9, color: "#f4efe7", fontFamily: "var(--font-b)", fontSize: 11, padding: "6px 10px 6px 28px", outline: "none", width: 180, transition: "border-color .2s" }}
            onFocus={e => e.target.style.borderColor = "rgba(188,74,63,.4)"}
            onBlur={e => e.target.style.borderColor = "rgba(255,255,255,.1)"}
          />
        </div>
        <span style={{ fontFamily: "var(--font-m)", fontSize: 10, color: "rgba(255,255,255,.25)", flexShrink: 0 }}>{filtered.length}/{events.length}</span>
      </div>

      {/* Timeline */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
        {filtered.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, gap: 10, color: "rgba(255,255,255,.25)" }}>
            <LucideIcon name="scroll-text" size={32} color="rgba(255,255,255,.1)" />
            <div style={{ fontSize: 13 }}>Nenhum evento encontrado</div>
          </div>
        ) : sessions.map(sess => {
          const sessEvents = filtered.filter(e => e.session === sess);
          return (
            <div key={sess} style={{ marginBottom: 28 }}>
              {/* Session marker */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#bc4a3f", boxShadow: "0 0 8px rgba(188,74,63,.6)", flexShrink: 0 }} />
                  <div style={{ fontFamily: "var(--font-d)", fontSize: 12, fontWeight: 700, color: "rgba(188,74,63,.9)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Sessão {sess}</div>
                </div>
                <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(188,74,63,.3), transparent)" }} />
              </div>

              {/* Event cards — with timeline line */}
              <div style={{ position: "relative", paddingLeft: 20 }}>
                <div style={{ position: "absolute", left: 4, top: 0, bottom: 0, width: 1, background: "linear-gradient(180deg, rgba(188,74,63,.25), rgba(188,74,63,.05))" }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {sessEvents.map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      selected={selectedId === event.id}
                      onClick={() => onSelect(event)}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { MemoriaTimeline, TypeBadgeM, ImpactBadge });
