// mesa-center.jsx — Scene view, beat progress, quick entity inspect
// Depends on: cockpit-icons.jsx, mesa-data.jsx

function BeatTracker({ beats, onAdvance }) {
  const currentIdx = beats.findIndex(b => b.current);
  return (
    <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,.06)", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(245,221,177,.72)" }}>Beat da sessão</div>
        <span style={{ fontFamily: "var(--font-m)", fontSize: 10, color: "rgba(255,255,255,.3)" }}>{beats.filter(b=>b.done).length}/{beats.length}</span>
      </div>
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        {beats.map((beat, idx) => {
          const c = BEAT_COLORS[beat.type] || "#b5aea4";
          return (
            <div key={beat.id} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{
                height: 5, borderRadius: 3,
                background: beat.done ? c : beat.current ? c + "60" : "rgba(255,255,255,.08)",
                boxShadow: beat.current ? `0 0 8px ${c}66` : "none",
                transition: "all .3s",
              }} />
              <div style={{ fontSize: 8, color: beat.current ? c : beat.done ? "rgba(255,255,255,.4)" : "rgba(255,255,255,.2)", textAlign: "center", letterSpacing: "0.04em", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {beat.label.split(" ").slice(0, 2).join(" ")}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CountdownAlert({ rounds }) {
  if (rounds <= 0) return (
    <div style={{ margin: "10px 14px", padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(188,74,63,.6)", background: "rgba(188,74,63,.12)", display: "flex", alignItems: "center", gap: 8, animation: "urgentPulse 1s ease-in-out infinite" }}>
      <LucideIcon name="alert-triangle" size={16} color="#e06155" />
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#e06155" }}>Portal ativado!</div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,.5)" }}>O portal foi aberto — decisão imediata</div>
      </div>
    </div>
  );
  return (
    <div style={{ margin: "10px 14px", padding: "10px 14px", borderRadius: 10, border: `1px solid ${rounds <= 2 ? "rgba(188,74,63,.5)" : "rgba(213,162,64,.3)"}`, background: rounds <= 2 ? "rgba(188,74,63,.08)" : "rgba(213,162,64,.06)", display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ fontFamily: "var(--font-m)", fontSize: 24, fontWeight: 700, color: rounds <= 2 ? "#e06155" : "#d5a240", lineHeight: 1, minWidth: 28, textAlign: "center" }}>{rounds}</div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: rounds <= 2 ? "#e06155" : "#d5a240" }}>rodadas até o portal fechar</div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)" }}>Recuperar o Grimório ou perseguir o Capitão</div>
      </div>
    </div>
  );
}

function SceneCard({ scene, portalRounds, setPortalRounds }) {
  return (
    <div style={{ margin: "10px 14px", borderRadius: 14, border: "1px solid rgba(255,255,255,.08)", background: "linear-gradient(160deg,rgba(15,14,20,.96),rgba(10,9,14,.94))", overflow: "hidden" }}>
      {/* Scene header */}
      <div style={{ padding: "12px 14px 10px", borderBottom: "1px solid rgba(255,255,255,.06)", background: "linear-gradient(135deg,rgba(188,74,63,.1),transparent 60%)" }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(188,74,63,.8)", marginBottom: 3 }}>Cena ativa</div>
        <div style={{ fontFamily: "var(--font-d)", fontSize: 15, fontWeight: 700, color: "#f4efe7", letterSpacing: "0.02em", marginBottom: 2 }}>{scene.title}</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,.45)" }}>{scene.mood}</div>
      </div>

      {/* Hook */}
      <div style={{ padding: "10px 14px 8px" }}>
        <div style={{ fontSize: 9, color: "rgba(245,221,177,.6)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 5 }}>Gancho</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,.65)", lineHeight: 1.55 }}>{scene.hook}</div>
      </div>

      {/* NPCs */}
      <div style={{ padding: "0 14px 10px" }}>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,.3)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 5 }}>Presentes</div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {scene.npcs.map(npc => (
            <span key={npc} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 7, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.55)" }}>{npc}</span>
          ))}
        </div>
      </div>

      {/* Portal countdown control */}
      <div style={{ padding: "8px 14px 12px", borderTop: "1px solid rgba(255,255,255,.06)", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,.4)" }}>Portal em:</span>
        <button onClick={() => setPortalRounds(r => Math.max(0, r - 1))}
          style={{ width: 22, height: 22, borderRadius: 6, background: "rgba(188,74,63,.15)", border: "1px solid rgba(188,74,63,.3)", color: "#e06155", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <LucideIcon name="minus" size={10} color="#e06155" />
        </button>
        <span style={{ fontFamily: "var(--font-m)", fontSize: 16, fontWeight: 700, color: portalRounds <= 2 ? "#e06155" : "#d5a240", minWidth: 20, textAlign: "center" }}>{portalRounds}</span>
        <button onClick={() => setPortalRounds(r => r + 1)}
          style={{ width: 22, height: 22, borderRadius: 6, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)", color: "rgba(255,255,255,.5)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <LucideIcon name="plus" size={10} />
        </button>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,.3)" }}>rodadas</span>
      </div>
    </div>
  );
}

function QuickEntityPanel({ entity, onClose }) {
  if (!entity) return null;
  return (
    <div style={{
      margin: "10px 14px", borderRadius: 14, overflow: "hidden",
      border: "1px solid rgba(75,159,145,.25)", background: "linear-gradient(145deg,rgba(75,159,145,.08),rgba(10,9,14,.96))",
      boxShadow: "0 0 20px rgba(75,159,145,.1)",
    }}>
      <div style={{ padding: "10px 14px 8px", borderBottom: "1px solid rgba(255,255,255,.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#f4efe7" }}>{entity.name}</div>
          <div style={{ fontSize: 10, color: "rgba(75,159,145,.8)" }}>{entity.class || "Entidade"} · CA {entity.ac}</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,.3)", padding: 2 }}>
          <LucideIcon name="x" size={13} />
        </button>
      </div>
      <div style={{ padding: "8px 14px" }}>
        {/* Attributes */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 5, marginBottom: 8 }}>
          {Object.entries(entity.stats || {}).map(([attr, val]) => (
            <div key={attr} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,.3)", letterSpacing: "0.1em" }}>{attr}</div>
              <div style={{ fontFamily: "var(--font-m)", fontSize: 13, fontWeight: 700, color: "#f4efe7" }}>{val}</div>
            </div>
          ))}
        </div>
        {/* Attacks */}
        {entity.attacks?.length > 0 && (
          <div style={{ marginBottom: 6 }}>
            <div style={{ fontSize: 9, color: "rgba(188,74,63,.8)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 3 }}>Ataques</div>
            {entity.attacks.map(a => <div key={a} style={{ fontSize: 10, color: "rgba(255,255,255,.6)", marginBottom: 2 }}>• {a}</div>)}
          </div>
        )}
        {/* Passives */}
        {entity.passive?.length > 0 && (
          <div>
            <div style={{ fontSize: 9, color: "rgba(213,162,64,.8)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 3 }}>Habilidades</div>
            {entity.passive.map(p => <div key={p} style={{ fontSize: 10, color: "rgba(255,255,255,.5)", marginBottom: 2 }}>• {p}</div>)}
          </div>
        )}
      </div>
    </div>
  );
}

function MesaCenter({ beats, scene, portalRounds, setPortalRounds, quickEntity, setQuickEntity }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <BeatTracker beats={beats} />

      <div style={{ flex: 1, overflowY: "auto" }}>
        <CountdownAlert rounds={portalRounds} />
        <SceneCard scene={scene} portalRounds={portalRounds} setPortalRounds={setPortalRounds} />

        {/* Quick entity selector */}
        <div style={{ margin: "0 14px 10px" }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(245,221,177,.65)", marginBottom: 6 }}>Ficha rápida</div>
          <div style={{ display: "flex", gap: 6 }}>
            {QUICK_ENTITIES.map(e => (
              <button key={e.id}
                onClick={() => setQuickEntity(quickEntity?.id === e.id ? null : e)}
                style={{
                  flex: 1, padding: "7px 10px", borderRadius: 9, cursor: "pointer", fontFamily: "inherit",
                  border: `1px solid ${quickEntity?.id === e.id ? "rgba(75,159,145,.4)" : "rgba(255,255,255,.08)"}`,
                  background: quickEntity?.id === e.id ? "rgba(75,159,145,.1)" : "rgba(255,255,255,.03)",
                  color: quickEntity?.id === e.id ? "#4b9f91" : "rgba(255,255,255,.5)",
                  fontSize: 11, fontWeight: quickEntity?.id === e.id ? 700 : 400,
                  transition: "all .15s",
                }}>
                {e.name.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        <QuickEntityPanel entity={quickEntity} onClose={() => setQuickEntity(null)} />
      </div>
    </div>
  );
}

Object.assign(window, { MesaCenter });
