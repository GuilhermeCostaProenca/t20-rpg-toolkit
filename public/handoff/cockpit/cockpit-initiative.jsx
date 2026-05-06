// cockpit-initiative.jsx — Initiative tracker panel
// Depends on: cockpit-icons.jsx

const INIT_COMBATANTS = [
  { id: 1, name: "Capitão Sombrio",    type: "Inimigo", hp: 40, maxHp: 55, init: 20, ac: 17, status: "ativa",   color: "#bc4a3f" },
  { id: 2, name: "Serafina Valdris",   type: "PJ",      hp: 34, maxHp: 42, init: 18, ac: 18, status: "ativa",   color: "#4f7cff" },
  { id: 3, name: "Trog Irontooth",     type: "PJ",      hp: 28, maxHp: 36, init: 14, ac: 15, status: "ativa",   color: "#4f7cff" },
  { id: 4, name: "Kulthar Rex",        type: "PJ",      hp: 12, maxHp: 38, init: 11, ac: 16, status: "crítico", color: "#4f7cff" },
  { id: 5, name: "Guarda Corrupto",    type: "Inimigo", hp: 8,  maxHp: 20, init: 9,  ac: 13, status: "ativa",   color: "#bc4a3f" },
  { id: 6, name: "Guarda Corrupto II", type: "Inimigo", hp: 0,  maxHp: 20, init: 6,  ac: 13, status: "morto",   color: "#bc4a3f" },
];

function HPBar({ hp, maxHp }) {
  const pct = Math.max(0, Math.min(100, (hp / maxHp) * 100));
  const barColor = pct > 60 ? "#4b9f91" : pct > 25 ? "#d5a240" : "#bc4a3f";
  return (
    <div style={{ flex: 1, height: 5, background: "rgba(255,255,255,.08)", borderRadius: 9999, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: barColor, borderRadius: 9999, transition: "width .4s cubic-bezier(.2,.65,.3,.9)", boxShadow: `0 0 6px ${barColor}88` }} />
    </div>
  );
}

function StatusPip({ status }) {
  const map = {
    ativa:   { color: "#4b9f91", label: "Ativa" },
    crítico: { color: "#d5a240", label: "Crítico" },
    morto:   { color: "#555",    label: "Morto" },
  };
  const s = map[status] || map.ativa;
  return (
    <div style={{ width: 7, height: 7, borderRadius: "50%", background: s.color, boxShadow: status !== "morto" ? `0 0 6px ${s.color}` : "none", flexShrink: 0 }} title={s.label} />
  );
}

function InitiativePanel({ combatants, setCombatants, currentTurn, setCurrentTurn, round, setRound }) {
  const [editingId, setEditingId] = React.useState(null);
  const [editVal, setEditVal] = React.useState("");

  // Sort descending by initiative
  const sorted = [...combatants].sort((a, b) => b.init - a.init);
  const activeIdx = currentTurn % sorted.filter(c => c.status !== "morto").length;
  const liveList = sorted.filter(c => c.status !== "morto");
  const activeId = liveList[activeIdx]?.id;

  function nextTurn() {
    const liveCount = combatants.filter(c => c.status !== "morto").length;
    if (liveCount === 0) return;
    const nextIdx = (currentTurn + 1) % liveCount;
    setCurrentTurn(nextIdx);
    if (nextIdx === 0) setRound(r => r + 1);
  }

  function startEditHp(c) {
    setEditingId(c.id);
    setEditVal(String(c.hp));
  }

  function commitHp(c) {
    const val = parseInt(editVal);
    if (!isNaN(val)) {
      const newHp = Math.max(0, Math.min(c.maxHp, val));
      const newStatus = newHp === 0 ? "morto" : newHp / c.maxHp < 0.25 ? "crítico" : "ativa";
      setCombatants(prev => prev.map(p => p.id === c.id ? { ...p, hp: newHp, status: newStatus } : p));
    }
    setEditingId(null);
  }

  function adjustHp(c, delta) {
    const newHp = Math.max(0, Math.min(c.maxHp, c.hp + delta));
    const newStatus = newHp === 0 ? "morto" : newHp / c.maxHp < 0.25 ? "crítico" : "ativa";
    setCombatants(prev => prev.map(p => p.id === c.id ? { ...p, hp: newHp, status: newStatus } : p));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 0 }}>
      {/* Header */}
      <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(245,221,177,0.72)" }}>Iniciativa</div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,.35)", fontFamily: "var(--font-m)" }}>RODADA</span>
            <span style={{ fontFamily: "var(--font-m)", fontSize: 13, fontWeight: 700, color: "#f4efe7" }}>{round}</span>
          </div>
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)" }}>
          {liveList.length} combatentes · {combatants.filter(c => c.status === "morto").length} abatidos
        </div>
      </div>

      {/* Combatant list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 10px" }}>
        {sorted.map((c) => {
          const isActive = c.id === activeId;
          const isDead = c.status === "morto";
          const isPJ = c.type === "PJ";
          const isEditing = editingId === c.id;

          return (
            <div key={c.id}
              style={{
                position: "relative", overflow: "hidden",
                marginBottom: 6, borderRadius: 12,
                border: `1px solid ${isActive ? "rgba(188,74,63,.45)" : isDead ? "rgba(255,255,255,.04)" : "rgba(255,255,255,.07)"}`,
                background: isActive
                  ? "linear-gradient(135deg,rgba(188,74,63,.14),rgba(107,18,32,.08))"
                  : isDead ? "rgba(255,255,255,.01)" : "rgba(255,255,255,.025)",
                boxShadow: isActive ? "0 0 20px rgba(188,74,63,.18), inset 0 1px 0 rgba(255,255,255,.04)" : "none",
                opacity: isDead ? 0.4 : 1,
                transition: "all .2s",
              }}>

              {/* Active bar */}
              {isActive && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: "linear-gradient(180deg,#e06155,#bc4a3f)", borderRadius: "12px 0 0 12px" }} />}

              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 10px 9px 14px" }}>
                {/* Initiative badge */}
                <div style={{
                  width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                  background: isPJ ? "rgba(79,124,255,.15)" : "rgba(188,74,63,.15)",
                  border: `1px solid ${isPJ ? "rgba(79,124,255,.35)" : "rgba(188,74,63,.35)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-m)", fontSize: 11, fontWeight: 700,
                  color: isPJ ? "#78d4ff" : "#e06155",
                }}>
                  {isDead ? <LucideIcon name="skull" size={12} color="rgba(255,255,255,.4)" /> : c.init}
                </div>

                {/* Name + HP */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <StatusPip status={c.status} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: isDead ? "rgba(255,255,255,.3)" : "#f4efe7", textDecoration: isDead ? "line-through" : "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1 }}>
                      {c.name}
                    </span>
                    <span style={{ fontSize: 9, color: isPJ ? "rgba(120,212,255,.7)" : "rgba(224,97,85,.7)", letterSpacing: "0.1em", flexShrink: 0 }}>{c.type}</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <HPBar hp={c.hp} maxHp={c.maxHp} />
                    {/* HP editor */}
                    <div style={{ display: "flex", alignItems: "center", gap: 3, flexShrink: 0 }}>
                      {!isDead && (
                        <button onClick={() => adjustHp(c, -1)} style={{ width: 16, height: 16, borderRadius: 4, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", color: "#b5aea4", fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1, padding: 0 }}>
                          <LucideIcon name="minus" size={8} />
                        </button>
                      )}
                      {isEditing ? (
                        <input
                          value={editVal}
                          onChange={e => setEditVal(e.target.value)}
                          onBlur={() => commitHp(c)}
                          onKeyDown={e => { if (e.key === "Enter") commitHp(c); if (e.key === "Escape") setEditingId(null); }}
                          autoFocus
                          style={{ width: 36, background: "rgba(255,255,255,.08)", border: "1px solid rgba(188,74,63,.4)", borderRadius: 5, color: "#f4efe7", fontFamily: "var(--font-m)", fontSize: 10, padding: "1px 3px", textAlign: "center", outline: "none" }}
                        />
                      ) : (
                        <span
                          onClick={() => !isDead && startEditHp(c)}
                          style={{ fontFamily: "var(--font-m)", fontSize: 10, color: "rgba(255,255,255,.5)", cursor: isDead ? "default" : "pointer", minWidth: 32, textAlign: "center" }}
                          title="Clique para editar HP"
                        >{c.hp}/{c.maxHp}</span>
                      )}
                      {!isDead && (
                        <button onClick={() => adjustHp(c, 1)} style={{ width: 16, height: 16, borderRadius: 4, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", color: "#b5aea4", fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
                          <LucideIcon name="plus" size={8} />
                        </button>
                      )}
                    </div>
                    <span style={{ fontSize: 9, color: "rgba(255,255,255,.28)", fontFamily: "var(--font-m)", flexShrink: 0 }}>CA {c.ac}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Next turn button */}
      <div style={{ padding: "10px 10px 12px", borderTop: "1px solid rgba(255,255,255,.06)" }}>
        <button onClick={nextTurn}
          style={{
            width: "100%", padding: "11px 0",
            borderRadius: 12, border: "1px solid rgba(188,74,63,.4)",
            background: "linear-gradient(135deg,rgba(188,74,63,.2),rgba(107,18,32,.15))",
            color: "#e06155", fontSize: 12, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.06em",
            boxShadow: "0 4px 20px rgba(188,74,63,.15)",
            transition: "all .15s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
          onMouseEnter={e => e.currentTarget.style.background = "linear-gradient(135deg,rgba(188,74,63,.3),rgba(107,18,32,.22))"}
          onMouseLeave={e => e.currentTarget.style.background = "linear-gradient(135deg,rgba(188,74,63,.2),rgba(107,18,32,.15))"}
        >
          Próximo turno
          <LucideIcon name="chevron-right" size={14} color="#e06155" />
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { InitiativePanel, INIT_COMBATANTS });
