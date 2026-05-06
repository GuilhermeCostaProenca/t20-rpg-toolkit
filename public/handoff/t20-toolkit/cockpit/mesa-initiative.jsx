// mesa-initiative.jsx — Full combat tracker with timer, conditions, damage
// Depends on: cockpit-icons.jsx, mesa-data.jsx

function ConditionPip({ cid, onRemove }) {
  const c = CONDITIONS.find(x => x.id === cid);
  if (!c) return null;
  return (
    <div title={c.label}
      onClick={e => { e.stopPropagation(); onRemove(cid); }}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: 18, height: 18, borderRadius: 5, cursor: "pointer",
        background: c.color + "22", border: `1px solid ${c.color}55`,
        transition: "all .15s",
      }}
      onMouseEnter={e => e.currentTarget.style.background = c.color + "44"}
      onMouseLeave={e => e.currentTarget.style.background = c.color + "22"}>
      <LucideIcon name={c.icon} size={9} color={c.color} />
    </div>
  );
}

function ConditionPicker({ combatantId, current, onAdd }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ position: "relative" }}>
      <button onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
        style={{
          width: 18, height: 18, borderRadius: 5, cursor: "pointer",
          background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "rgba(255,255,255,.4)",
        }}>
        <LucideIcon name="plus" size={9} />
      </button>
      {open && (
        <div style={{
          position: "absolute", top: 22, left: 0, zIndex: 50,
          background: "rgba(12,11,18,.98)", border: "1px solid rgba(255,255,255,.12)",
          borderRadius: 10, padding: 8, display: "flex", flexWrap: "wrap", gap: 5, width: 180,
          boxShadow: "0 12px 40px rgba(0,0,0,.7)",
        }}
        onMouseLeave={() => setOpen(false)}>
          {CONDITIONS.filter(c => !current.includes(c.id)).map(c => (
            <button key={c.id}
              onClick={e => { e.stopPropagation(); onAdd(c.id); setOpen(false); }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "4px 8px", borderRadius: 7, cursor: "pointer", fontFamily: "inherit",
                background: c.color + "15", border: `1px solid ${c.color}44`,
                color: c.color, fontSize: 9, fontWeight: 600, whiteSpace: "nowrap",
              }}>
              <LucideIcon name={c.icon} size={9} color={c.color} />
              {c.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DamageInput({ combatant, onApply }) {
  const [val, setVal] = React.useState("");
  const [mode, setMode] = React.useState("dmg"); // dmg | heal

  function apply() {
    const n = parseInt(val);
    if (isNaN(n) || n <= 0) return;
    onApply(combatant.id, mode === "dmg" ? -n : n);
    setVal("");
  }

  return (
    <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
      <button onClick={() => setMode(m => m === "dmg" ? "heal" : "dmg")}
        style={{
          width: 20, height: 20, borderRadius: 5, cursor: "pointer",
          background: mode === "dmg" ? "rgba(188,74,63,.2)" : "rgba(75,159,145,.2)",
          border: `1px solid ${mode === "dmg" ? "rgba(188,74,63,.4)" : "rgba(75,159,145,.4)"}`,
          color: mode === "dmg" ? "#e06155" : "#4b9f91",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
        <LucideIcon name={mode === "dmg" ? "minus" : "plus"} size={9} color={mode === "dmg" ? "#e06155" : "#4b9f91"} />
      </button>
      <input
        value={val}
        onChange={e => setVal(e.target.value.replace(/\D/g, ""))}
        onKeyDown={e => e.key === "Enter" && apply()}
        placeholder="0"
        style={{
          width: 32, background: "rgba(255,255,255,.06)",
          border: "1px solid rgba(255,255,255,.12)", borderRadius: 5,
          color: "#f4efe7", fontFamily: "var(--font-m)", fontSize: 10,
          padding: "2px 4px", textAlign: "center", outline: "none",
        }}
      />
      <button onClick={apply}
        style={{
          width: 20, height: 20, borderRadius: 5, cursor: "pointer",
          background: mode === "dmg" ? "rgba(188,74,63,.15)" : "rgba(75,159,145,.15)",
          border: "1px solid rgba(255,255,255,.1)",
          color: "rgba(255,255,255,.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
        <LucideIcon name="check" size={9} />
      </button>
    </div>
  );
}

function TurnTimer({ active, paused, seconds, onToggle, onReset }) {
  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  const isUrgent = seconds <= 10 && seconds > 0;
  const isOut    = seconds === 0;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
      borderRadius: 10, border: `1px solid ${isUrgent ? "rgba(188,74,63,.5)" : isOut ? "rgba(188,74,63,.7)" : "rgba(255,255,255,.08)"}`,
      background: isUrgent ? "rgba(188,74,63,.1)" : isOut ? "rgba(188,74,63,.15)" : "rgba(255,255,255,.03)",
      animation: isOut ? "urgentPulse 1s ease-in-out infinite" : "none",
    }}>
      <LucideIcon name="clock" size={13} color={isUrgent || isOut ? "#e06155" : "rgba(255,255,255,.4)"} />
      <span style={{
        fontFamily: "var(--font-m)", fontSize: 18, fontWeight: 700,
        color: isUrgent || isOut ? "#e06155" : "#f4efe7", letterSpacing: "0.06em",
        minWidth: 48,
      }}>{mins}:{secs}</span>
      <button onClick={onToggle}
        style={{
          width: 22, height: 22, borderRadius: 6, cursor: "pointer",
          background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)",
          color: "rgba(255,255,255,.6)", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
        <LucideIcon name={paused ? "zap" : "minus"} size={11} />
      </button>
      <button onClick={onReset}
        style={{
          width: 22, height: 22, borderRadius: 6, cursor: "pointer",
          background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)",
          color: "rgba(255,255,255,.4)", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
        <LucideIcon name="refresh-cw" size={10} />
      </button>
    </div>
  );
}

function MesaInitiative({ combatants, setCombatants, currentTurn, setCurrentTurn, round, setRound }) {
  const TURN_SECONDS = 60;
  const [timerSecs, setTimerSecs]   = React.useState(TURN_SECONDS);
  const [timerPaused, setTimerPaused] = React.useState(false);
  const [expandedId, setExpandedId]   = React.useState(null);
  const [dmgLog, setDmgLog]           = React.useState([]);

  // Timer countdown
  React.useEffect(() => {
    if (timerPaused) return;
    const t = setInterval(() => {
      setTimerSecs(s => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [timerPaused]);

  const sorted = [...combatants].sort((a, b) => b.init - a.init);
  const liveList = sorted.filter(c => c.status !== "morto");
  const activeId = liveList[currentTurn % Math.max(1, liveList.length)]?.id;

  function nextTurn() {
    const live = liveList.length;
    if (!live) return;
    const next = (currentTurn + 1) % live;
    setCurrentTurn(next);
    if (next === 0) setRound(r => r + 1);
    setTimerSecs(TURN_SECONDS);
  }

  function applyDelta(id, delta) {
    setCombatants(prev => prev.map(c => {
      if (c.id !== id) return c;
      const newHp  = Math.max(0, Math.min(c.maxHp, c.hp + delta));
      const status = newHp === 0 ? "morto" : newHp / c.maxHp < 0.25 ? "crítico" : "ativa";
      const entry  = { id: Date.now(), who: c.name, delta, result: newHp };
      setDmgLog(l => [entry, ...l.slice(0, 8)]);
      return { ...c, hp: newHp, status };
    }));
  }

  function addCondition(id, cond) {
    setCombatants(prev => prev.map(c =>
      c.id === id ? { ...c, conditions: [...(c.conditions||[]), cond] } : c
    ));
  }
  function removeCondition(id, cond) {
    setCombatants(prev => prev.map(c =>
      c.id === id ? { ...c, conditions: (c.conditions||[]).filter(x => x !== cond) } : c
    ));
  }
  function editHp(id, val) {
    const n = parseInt(val);
    if (isNaN(n)) return;
    setCombatants(prev => prev.map(c => {
      if (c.id !== id) return c;
      const newHp  = Math.max(0, Math.min(c.maxHp, n));
      const status = newHp === 0 ? "morto" : newHp / c.maxHp < 0.25 ? "crítico" : "ativa";
      return { ...c, hp: newHp, status };
    }));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "12px 14px 10px", borderBottom: "1px solid rgba(255,255,255,.06)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(245,221,177,.72)" }}>Iniciativa</div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ fontFamily: "var(--font-m)", fontSize: 10, color: "rgba(255,255,255,.3)" }}>R</span>
            <span style={{ fontFamily: "var(--font-m)", fontSize: 16, fontWeight: 700, color: "#f4efe7" }}>{round}</span>
          </div>
        </div>
        <TurnTimer
          active={true}
          paused={timerPaused}
          seconds={timerSecs}
          onToggle={() => setTimerPaused(p => !p)}
          onReset={() => setTimerSecs(TURN_SECONDS)}
        />
      </div>

      {/* Combatant list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "6px 8px" }}>
        {sorted.map(c => {
          const isActive   = c.id === activeId;
          const isDead     = c.status === "morto";
          const isCritical = c.status === "crítico";
          const hpPct      = c.hp / c.maxHp;
          const barColor   = hpPct > 0.6 ? "#4b9f91" : hpPct > 0.25 ? "#d5a240" : "#bc4a3f";
          const isExpanded = expandedId === c.id;
          const isPJ       = c.type === "PJ";

          return (
            <div key={c.id}
              style={{
                marginBottom: 6, borderRadius: 12, overflow: "hidden",
                border: `1px solid ${isActive ? "rgba(188,74,63,.5)" : isDead ? "rgba(255,255,255,.04)" : "rgba(255,255,255,.08)"}`,
                background: isActive
                  ? "linear-gradient(135deg,rgba(188,74,63,.16),rgba(107,18,32,.1))"
                  : isDead ? "rgba(255,255,255,.01)" : "rgba(255,255,255,.025)",
                boxShadow: isActive ? "0 0 18px rgba(188,74,63,.2), inset 0 1px 0 rgba(255,255,255,.04)" : "none",
                opacity: isDead ? 0.38 : 1,
                transition: "all .18s",
              }}>
              {/* Active indicator strip */}
              {isActive && <div style={{ height: 2, background: "linear-gradient(90deg,#e06155,rgba(188,74,63,0))" }} />}

              {/* Main row */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : c.id)}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", cursor: "pointer" }}>
                {/* Init badge */}
                <div style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: isPJ ? "rgba(79,124,255,.15)" : "rgba(188,74,63,.15)",
                  border: `1px solid ${isPJ ? "rgba(79,124,255,.4)" : "rgba(188,74,63,.4)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-m)", fontSize: 12, fontWeight: 700,
                  color: isPJ ? "#78d4ff" : "#e06155",
                }}>
                  {isDead ? <LucideIcon name="skull" size={12} color="rgba(255,255,255,.3)" /> : c.init}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Name row */}
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                      background: isDead ? "#555" : isCritical ? "#bc4a3f" : "#4b9f91",
                      boxShadow: isDead ? "none" : `0 0 5px ${isCritical ? "#bc4a3f" : "#4b9f91"}`,
                    }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: isDead ? "rgba(255,255,255,.3)" : "#f4efe7", textDecoration: isDead ? "line-through" : "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                      {c.name}
                    </span>
                    <span style={{ fontSize: 9, color: "rgba(255,255,255,.3)", flexShrink: 0 }}>CA{c.ac}</span>
                    <LucideIcon name={isExpanded ? "minus" : "chevron-right"} size={11} color="rgba(255,255,255,.25)" />
                  </div>

                  {/* HP bar */}
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,.08)", borderRadius: 9999, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${Math.max(0,hpPct*100)}%`, background: barColor, borderRadius: 9999, transition: "width .4s", boxShadow: `0 0 5px ${barColor}88` }} />
                    </div>
                    <span style={{ fontFamily: "var(--font-m)", fontSize: 9, color: "rgba(255,255,255,.45)", whiteSpace: "nowrap" }}>{c.hp}/{c.maxHp}</span>
                  </div>

                  {/* Conditions */}
                  {(c.conditions||[]).length > 0 && (
                    <div style={{ display: "flex", gap: 3, marginTop: 4, flexWrap: "wrap" }}>
                      {(c.conditions||[]).map(cid => (
                        <ConditionPip key={cid} cid={cid} onRemove={cond => removeCondition(c.id, cond)} />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Expanded panel */}
              {isExpanded && !isDead && (
                <div style={{ padding: "0 10px 10px", borderTop: "1px solid rgba(255,255,255,.06)", paddingTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
                  {/* HP edit + damage input */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", align: "center", gap: 5 }}>
                      <span style={{ fontSize: 9, color: "rgba(255,255,255,.35)", alignSelf: "center" }}>HP</span>
                      <input
                        defaultValue={c.hp}
                        onBlur={e => editHp(c.id, e.target.value)}
                        onKeyDown={e => e.key === "Enter" && editHp(c.id, e.target.value)}
                        style={{
                          width: 38, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.14)",
                          borderRadius: 6, color: "#f4efe7", fontFamily: "var(--font-m)", fontSize: 11,
                          padding: "3px 5px", textAlign: "center", outline: "none",
                        }}
                      />
                      <span style={{ fontSize: 9, color: "rgba(255,255,255,.25)", alignSelf: "center" }}>/ {c.maxHp}</span>
                    </div>
                    <DamageInput combatant={c} onApply={applyDelta} />
                  </div>

                  {/* Mana bar */}
                  {c.maxMana > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ fontSize: 9, color: "rgba(75,159,145,.7)", minWidth: 26 }}>Mana</span>
                      <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,.08)", borderRadius: 9999, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${(c.mana/c.maxMana)*100}%`, background: "#4b9f91", borderRadius: 9999 }} />
                      </div>
                      <span style={{ fontFamily: "var(--font-m)", fontSize: 9, color: "rgba(255,255,255,.35)" }}>{c.mana}/{c.maxMana}</span>
                    </div>
                  )}

                  {/* Conditions adder */}
                  <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 9, color: "rgba(255,255,255,.3)" }}>Condições:</span>
                    {(c.conditions||[]).map(cid => <ConditionPip key={cid} cid={cid} onRemove={cond => removeCondition(c.id, cond)} />)}
                    <ConditionPicker combatantId={c.id} current={c.conditions||[]} onAdd={cond => addCondition(c.id, cond)} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Damage log */}
      {dmgLog.length > 0 && (
        <div style={{ borderTop: "1px solid rgba(255,255,255,.06)", padding: "6px 10px", flexShrink: 0, maxHeight: 80, overflowY: "auto" }}>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,.3)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>Últimos danos</div>
          {dmgLog.slice(0, 4).map(l => (
            <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,.5)" }}>{l.who}</span>
              <span style={{ fontFamily: "var(--font-m)", fontSize: 10, fontWeight: 700, color: l.delta < 0 ? "#bc4a3f" : "#4b9f91" }}>
                {l.delta > 0 ? "+" : ""}{l.delta}
              </span>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,.3)" }}>→ {l.result} PV</span>
            </div>
          ))}
        </div>
      )}

      {/* Next turn button */}
      <div style={{ padding: "8px 10px 10px", borderTop: "1px solid rgba(255,255,255,.06)", flexShrink: 0 }}>
        <button onClick={nextTurn}
          style={{
            width: "100%", padding: "11px 0",
            borderRadius: 12, border: "1px solid rgba(188,74,63,.45)",
            background: "linear-gradient(135deg,rgba(188,74,63,.22),rgba(107,18,32,.18))",
            color: "#e06155", fontSize: 12, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.06em",
            boxShadow: "0 4px 16px rgba(188,74,63,.2)",
            transition: "all .15s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
          onMouseEnter={e => e.currentTarget.style.background = "linear-gradient(135deg,rgba(188,74,63,.32),rgba(107,18,32,.26))"}
          onMouseLeave={e => e.currentTarget.style.background = "linear-gradient(135deg,rgba(188,74,63,.22),rgba(107,18,32,.18))"}>
          Próximo turno
          <LucideIcon name="chevron-right" size={14} color="#e06155" />
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { MesaInitiative });
