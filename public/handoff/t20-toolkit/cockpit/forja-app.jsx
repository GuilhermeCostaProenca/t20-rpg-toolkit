// forja-app.jsx — Forja de Sessão root app
// Depends on: cockpit-icons.jsx, cockpit-sidebar.jsx, forja-data.jsx, forja-stages.jsx

function StageStepper({ stages, current, onSelect, completedIds }) {
  return (
    <div style={{
      width: 220, flexShrink: 0,
      borderRight: "1px solid rgba(255,255,255,.07)",
      padding: "20px 14px",
      display: "flex", flexDirection: "column", gap: 4,
      background: "linear-gradient(180deg,rgba(8,7,12,.98),rgba(12,10,16,.96))",
    }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(245,221,177,.65)", marginBottom: 12, paddingLeft: 4 }}>Etapas</div>
      {stages.map((stage, idx) => {
        const isCurrent  = current === stage.id;
        const isComplete = completedIds.has(stage.id);
        const isPast     = stages.findIndex(s => s.id === current) > idx;

        return (
          <button key={stage.id} onClick={() => onSelect(stage.id)}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", borderRadius: 12,
              border: `1px solid ${isCurrent ? "rgba(188,74,63,.4)" : "rgba(255,255,255,.06)"}`,
              background: isCurrent ? "rgba(188,74,63,.12)" : "rgba(255,255,255,.02)",
              cursor: "pointer", fontFamily: "inherit", textAlign: "left",
              boxShadow: isCurrent ? "0 0 16px rgba(188,74,63,.15), inset 0 1px 0 rgba(255,255,255,.04)" : "none",
              transition: "all .15s",
            }}>
            {/* Step dot */}
            <div style={{
              width: 26, height: 26, borderRadius: 8, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: isCurrent ? "rgba(188,74,63,.2)" : isComplete || isPast ? "rgba(75,159,145,.12)" : "rgba(255,255,255,.05)",
              border: `1px solid ${isCurrent ? "rgba(188,74,63,.5)" : isComplete || isPast ? "rgba(75,159,145,.3)" : "rgba(255,255,255,.1)"}`,
            }}>
              {isComplete || isPast
                ? <LucideIcon name="check" size={12} color="#4b9f91" />
                : <LucideIcon name={stage.icon} size={12} color={isCurrent ? "#e06155" : "rgba(255,255,255,.3)"} />
              }
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: isCurrent ? 700 : 500, color: isCurrent ? "#f4efe7" : "rgba(255,255,255,.5)", lineHeight: 1.2 }}>{stage.label}</div>
              {isCurrent && <div style={{ fontSize: 10, color: "rgba(255,255,255,.3)", marginTop: 2 }}>{stage.desc}</div>}
            </div>
          </button>
        );
      })}

      {/* Connector line */}
      <div style={{ marginTop: "auto", paddingTop: 20, borderTop: "1px solid rgba(255,255,255,.06)" }}>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,.3)", lineHeight: 1.5 }}>
          Forge a sessão etapa a etapa. Tudo é salvo automaticamente.
        </div>
      </div>
    </div>
  );
}

function SessionSummaryPanel({ spark, beats, scenes, reveals }) {
  const tone = TONE_OPTIONS.find(t => t.id === spark.tone);
  const totalMin = scenes.reduce((sum, s) => sum + (parseInt(s.duration) || 0), 0);

  return (
    <div style={{
      width: 220, flexShrink: 0,
      borderLeft: "1px solid rgba(255,255,255,.07)",
      padding: "16px 14px",
      display: "flex", flexDirection: "column", gap: 14,
      background: "linear-gradient(180deg,rgba(8,7,12,.98),rgba(12,10,16,.96))",
      overflowY: "auto",
    }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(245,221,177,.65)" }}>Sessão atual</div>

      {/* Stats */}
      {[
        { label: "Beats",   val: beats.length,   color: "#d5a240" },
        { label: "Cenas",   val: scenes.length,  color: "#4b9f91" },
        { label: "Reveals", val: reveals.length, color: "#9b5de5" },
        { label: "Duração", val: `~${totalMin}m`, color: "#b5aea4" },
      ].map(s => (
        <div key={s.label} style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "8px 10px", borderRadius: 9,
          border: "1px solid rgba(255,255,255,.06)", background: "rgba(255,255,255,.02)",
        }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,.45)" }}>{s.label}</span>
          <span style={{ fontFamily: "var(--font-m)", fontSize: 13, fontWeight: 700, color: s.color }}>{s.val}</span>
        </div>
      ))}

      {/* Tom */}
      {tone && (
        <div style={{ padding: "8px 10px", borderRadius: 9, border: `1px solid ${tone.color}33`, background: tone.color + "0d" }}>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,.3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 3 }}>Tom</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: tone.color }}>{tone.label}</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)", marginTop: 1 }}>{tone.desc}</div>
        </div>
      )}

      {/* Quick reveals */}
      {reveals.length > 0 && (
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(245,221,177,.55)", marginBottom: 6 }}>Reveals</div>
          {reveals.slice(0, 3).map(r => {
            const m = { "Crítico": "#bc4a3f", "Alto": "#d5a240", "Médio": "#4b9f91", "Baixo": "#b5aea4" };
            return (
              <div key={r.id} style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 5 }}>
                <LucideIcon name="sparkles" size={10} color={m[r.impact] || "#b5aea4"} style={{ marginTop: 2, flexShrink: 0 }} />
                <span style={{ fontSize: 10, color: "rgba(255,255,255,.5)", lineHeight: 1.4 }}>{r.title}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Stakes */}
      {spark.stakes && (
        <div style={{ padding: "10px", borderRadius: 9, border: "1px solid rgba(188,74,63,.2)", background: "rgba(188,74,63,.05)" }}>
          <div style={{ fontSize: 9, color: "rgba(188,74,63,.7)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Em jogo</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,.5)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{spark.stakes}</div>
        </div>
      )}
    </div>
  );
}

function ForjaHeader({ currentStage, onNav }) {
  return (
    <header style={{
      height: 56, flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 20px", borderBottom: "1px solid rgba(255,255,255,.07)",
      background: "linear-gradient(90deg,rgba(8,7,12,.98),rgba(12,10,16,.96))",
    }}>
      {/* Left */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: "rgba(188,74,63,.14)", border: "1px solid rgba(188,74,63,.35)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <LucideIcon name="flame" size={16} color="#e06155" />
        </div>
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(245,221,177,.65)" }}>Arton · Crônicas de Arton</div>
          <div style={{ fontFamily: "var(--font-d)", fontSize: 16, fontWeight: 700, color: "#f4efe7", letterSpacing: "0.06em" }}>FORJA DE SESSÃO</div>
        </div>
        <div style={{ width: 1, height: 24, background: "rgba(255,255,255,.1)" }} />
        <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)" }}>A Noite das Lâminas · Sessão 12</div>
      </div>

      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,.28)", fontFamily: "var(--font-m)" }}>Auto-salvo</span>
        <a href="Cockpit.html" style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)",
          color: "rgba(255,255,255,.5)", borderRadius: 10, padding: "7px 14px",
          fontSize: 11, fontWeight: 500, textDecoration: "none", transition: "all .15s",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.08)"; e.currentTarget.style.color = "#fff"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.04)"; e.currentTarget.style.color = "rgba(255,255,255,.5)"; }}>
          <LucideIcon name="chevron-left" size={13} />
          Cockpit
        </a>
      </div>
    </header>
  );
}

function ForjaApp() {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [currentStage, setCurrentStage]         = React.useState("spark");
  const [visitedStages, setVisitedStages]       = React.useState(new Set(["spark"]));

  // State
  const [spark,   setSpark]   = React.useState(INITIAL_SPARK);
  const [beats,   setBeats]   = React.useState(INITIAL_BEATS);
  const [scenes,  setScenes]  = React.useState(INITIAL_SCENES);
  const [reveals, setReveals] = React.useState(INITIAL_REVEALS);

  // Persist to localStorage
  React.useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("t20-forja") || "{}");
      if (saved.spark)   setSpark(saved.spark);
      if (saved.beats)   setBeats(saved.beats);
      if (saved.scenes)  setScenes(saved.scenes);
      if (saved.reveals) setReveals(saved.reveals);
    } catch {}
  }, []);

  React.useEffect(() => {
    try { localStorage.setItem("t20-forja", JSON.stringify({ spark, beats, scenes, reveals })); } catch {}
  }, [spark, beats, scenes, reveals]);

  function goToStage(id) {
    setCurrentStage(id);
    setVisitedStages(prev => new Set([...prev, id]));
  }

  function goNext() {
    const idx = FORJA_STAGES.findIndex(s => s.id === currentStage);
    if (idx < FORJA_STAGES.length - 1) goToStage(FORJA_STAGES[idx + 1].id);
  }

  function goPrev() {
    const idx = FORJA_STAGES.findIndex(s => s.id === currentStage);
    if (idx > 0) goToStage(FORJA_STAGES[idx - 1].id);
  }

  const currentIdx = FORJA_STAGES.findIndex(s => s.id === currentStage);
  const isFirst = currentIdx === 0;
  const isLast  = currentIdx === FORJA_STAGES.length - 1;

  const completedIds = new Set(
    FORJA_STAGES
      .slice(0, currentIdx)
      .map(s => s.id)
      .filter(id => visitedStages.has(id))
  );

  function renderStage() {
    switch (currentStage) {
      case "spark":    return <StageSparkView spark={spark} setSpark={setSpark} />;
      case "struct":   return <StageStructureView beats={beats} setBeats={setBeats} />;
      case "scenes":   return <StageScenesView scenes={scenes} setScenes={setScenes} beats={beats} />;
      case "reveals":  return <StageRevealsView reveals={reveals} setReveals={setReveals} />;
      case "finalize": return <StageFinalizeView spark={spark} beats={beats} scenes={scenes} reveals={reveals} onLaunch={() => window.location.href = "Cockpit.html"} />;
      default: return null;
    }
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg)", color: "var(--fg)", fontFamily: "var(--font-b)" }}>

      {/* Global ambient */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse 40% 50% at 15% 50%, rgba(188,74,63,.06), transparent 55%), radial-gradient(ellipse 30% 40% at 85% 30%, rgba(213,162,64,.04), transparent 55%)" }} />

      <CockpitSidebar
        activeModule="forge"
        onNavigate={navigateHandoffModule}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(c => !c)}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", zIndex: 1 }}>
        <ForjaHeader currentStage={currentStage} />

        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* Stage stepper */}
          <StageStepper
            stages={FORJA_STAGES}
            current={currentStage}
            onSelect={goToStage}
            completedIds={completedIds}
          />

          {/* Main content */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* Stage title */}
            <div style={{ padding: "18px 24px 14px", borderBottom: "1px solid rgba(255,255,255,.06)", flexShrink: 0 }}>
              {(() => {
                const stage = FORJA_STAGES.find(s => s.id === currentStage);
                return (
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 11,
                      background: "rgba(188,74,63,.12)", border: "1px solid rgba(188,74,63,.3)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <LucideIcon name={stage?.icon} size={17} color="#e06155" />
                    </div>
                    <div>
                      <div style={{ fontFamily: "var(--font-d)", fontSize: 17, fontWeight: 700, color: "#f4efe7", letterSpacing: "0.04em" }}>{stage?.label}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)" }}>{stage?.desc}</div>
                    </div>
                    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontFamily: "var(--font-m)", fontSize: 11, color: "rgba(255,255,255,.25)" }}>
                        {currentIdx + 1} / {FORJA_STAGES.length}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Stage content */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
              {renderStage()}
            </div>

            {/* Navigation footer */}
            <div style={{
              padding: "12px 24px", borderTop: "1px solid rgba(255,255,255,.07)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              flexShrink: 0, background: "rgba(8,7,12,.8)",
            }}>
              <button onClick={goPrev} disabled={isFirst}
                style={{
                  display: "flex", alignItems: "center", gap: 7, padding: "9px 18px",
                  borderRadius: 10, border: "1px solid rgba(255,255,255,.1)",
                  background: "rgba(255,255,255,.04)", color: isFirst ? "rgba(255,255,255,.2)" : "rgba(255,255,255,.6)",
                  fontSize: 12, fontWeight: 500, cursor: isFirst ? "not-allowed" : "pointer", fontFamily: "inherit", transition: "all .15s",
                }}>
                <LucideIcon name="chevron-left" size={14} />
                Anterior
              </button>

              {/* Progress dots */}
              <div style={{ display: "flex", gap: 6 }}>
                {FORJA_STAGES.map((s, i) => (
                  <div key={s.id} onClick={() => goToStage(s.id)}
                    style={{
                      width: i === currentIdx ? 20 : 6, height: 6, borderRadius: 3,
                      background: i === currentIdx ? "#bc4a3f" : i < currentIdx ? "rgba(75,159,145,.6)" : "rgba(255,255,255,.12)",
                      cursor: "pointer", transition: "all .25s",
                      boxShadow: i === currentIdx ? "0 0 8px rgba(188,74,63,.5)" : "none",
                    }} />
                ))}
              </div>

              <button onClick={isLast ? () => window.location.href = "Cockpit.html" : goNext}
                style={{
                  display: "flex", alignItems: "center", gap: 7, padding: "9px 18px",
                  borderRadius: 10,
                  border: `1px solid ${isLast ? "rgba(188,74,63,.5)" : "rgba(255,255,255,.1)"}`,
                  background: isLast ? "rgba(188,74,63,.15)" : "rgba(255,255,255,.04)",
                  color: isLast ? "#e06155" : "rgba(255,255,255,.7)",
                  fontSize: 12, fontWeight: isLast ? 700 : 500, cursor: "pointer", fontFamily: "inherit", transition: "all .15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = isLast ? "rgba(188,74,63,.25)" : "rgba(255,255,255,.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = isLast ? "rgba(188,74,63,.15)" : "rgba(255,255,255,.04)"; }}>
                {isLast ? "Abrir no Cockpit" : "Próximo"}
                <LucideIcon name="chevron-right" size={14} color={isLast ? "#e06155" : "currentColor"} />
              </button>
            </div>
          </div>

          {/* Right summary panel */}
          <SessionSummaryPanel spark={spark} beats={beats} scenes={scenes} reveals={reveals} />
        </div>
      </div>
    </div>
  );
}

const forjaRoot = ReactDOM.createRoot(document.getElementById("root"));
forjaRoot.render(<ForjaApp />);
