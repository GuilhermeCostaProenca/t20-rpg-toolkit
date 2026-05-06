// forja-stages.jsx — All 5 stage views for Forja de Sessão
// Depends on: cockpit-icons.jsx, forja-data.jsx

/* ── Shared primitives ───────────────────────────────────────── */

function FieldLabel({ children }) {
  return <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(245,221,177,.7)", marginBottom: 6 }}>{children}</div>;
}

function ForjaTextarea({ value, onChange, placeholder, rows = 4, mono }) {
  return (
    <textarea
      value={value} onChange={e => onChange(e.target.value)}
      rows={rows} placeholder={placeholder}
      style={{
        width: "100%", boxSizing: "border-box",
        background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.09)",
        borderRadius: 12, color: "#f4efe7",
        fontFamily: mono ? "var(--font-m)" : "var(--font-b)",
        fontSize: 13, lineHeight: 1.65, padding: "12px 14px",
        resize: "vertical", outline: "none", transition: "border-color .2s",
      }}
      onFocus={e => e.target.style.borderColor = "rgba(188,74,63,.45)"}
      onBlur={e => e.target.style.borderColor = "rgba(255,255,255,.09)"}
    />
  );
}

function ForjaInput({ value, onChange, placeholder }) {
  return (
    <input
      value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%", boxSizing: "border-box",
        background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.09)",
        borderRadius: 10, color: "#f4efe7", fontFamily: "var(--font-b)",
        fontSize: 13, padding: "10px 13px", outline: "none", transition: "border-color .2s",
      }}
      onFocus={e => e.target.style.borderColor = "rgba(188,74,63,.45)"}
      onBlur={e => e.target.style.borderColor = "rgba(255,255,255,.09)"}
    />
  );
}

function SectionDivider({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0 18px" }}>
      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.07)" }} />
      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(245,221,177,.55)", whiteSpace: "nowrap" }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.07)" }} />
    </div>
  );
}

/* ── STAGE 1: Faísca ─────────────────────────────────────────── */
function StageSparkView({ spark, setSpark }) {
  function patch(key, val) { setSpark(s => ({ ...s, [key]: val })); }

  return (
    <div style={{ maxWidth: 720, display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Core idea */}
      <div>
        <FieldLabel>A Faísca — ideia central da sessão</FieldLabel>
        <ForjaTextarea
          value={spark.idea} onChange={v => patch("idea", v)}
          placeholder="O que acontece nessa sessão? Qual é o arco emocional central?"
          rows={4}
        />
      </div>

      {/* Tone */}
      <div>
        <FieldLabel>Tom da sessão</FieldLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {TONE_OPTIONS.map(t => {
            const active = spark.tone === t.id;
            return (
              <button key={t.id} onClick={() => patch("tone", t.id)}
                style={{
                  padding: "11px 14px", borderRadius: 12, cursor: "pointer", fontFamily: "inherit",
                  border: `1px solid ${active ? t.color + "66" : "rgba(255,255,255,.08)"}`,
                  background: active ? t.color + "18" : "rgba(255,255,255,.03)",
                  textAlign: "left", transition: "all .15s",
                  boxShadow: active ? `0 0 16px ${t.color}22` : "none",
                }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: active ? t.color : "rgba(255,255,255,.65)", marginBottom: 2 }}>{t.label}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)" }}>{t.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Arc */}
      <div>
        <FieldLabel>Arco emocional do grupo</FieldLabel>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {ARC_OPTIONS.map(a => {
            const active = spark.arc === a.id;
            return (
              <button key={a.id} onClick={() => patch("arc", a.id)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 7,
                  padding: "8px 14px", borderRadius: 10, cursor: "pointer", fontFamily: "inherit",
                  border: `1px solid ${active ? "rgba(188,74,63,.45)" : "rgba(255,255,255,.08)"}`,
                  background: active ? "rgba(188,74,63,.14)" : "rgba(255,255,255,.03)",
                  color: active ? "#e06155" : "rgba(255,255,255,.5)", fontSize: 12, fontWeight: active ? 700 : 400,
                  transition: "all .15s",
                }}>
                <LucideIcon name={a.icon} size={12} color={active ? "#e06155" : "rgba(255,255,255,.4)"} />
                {a.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stakes + Secret */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <FieldLabel>O que está em jogo</FieldLabel>
          <ForjaTextarea value={spark.stakes} onChange={v => patch("stakes", v)} rows={3}
            placeholder="Se o grupo falhar, o que acontece?" />
        </div>
        <div>
          <FieldLabel>Segredo do mestre</FieldLabel>
          <ForjaTextarea value={spark.secret} onChange={v => patch("secret", v)} rows={3}
            placeholder="O que o grupo ainda não sabe mas vai descobrir..." />
        </div>
      </div>
    </div>
  );
}

/* ── STAGE 2: Estrutura ──────────────────────────────────────── */
function StageStructureView({ beats, setBeats }) {
  const [dragging, setDragging]   = React.useState(null);
  const [dragOver, setDragOver]   = React.useState(null);
  const [expandedId, setExpanded] = React.useState(null);

  const BEAT_TYPES = ["Abertura", "Escalada", "Clímax", "Resolução", "Gancho"];
  const TYPE_COLORS = {
    Abertura:  "#4b9f91", Escalada: "#d5a240",
    Clímax:    "#bc4a3f", Resolução:"#9b5de5",
    Gancho:    "#4f7cff",
  };

  function handleDragStart(e, id) {
    setDragging(id);
    e.dataTransfer.effectAllowed = "move";
  }
  function handleDragOver(e, id) {
    e.preventDefault();
    setDragOver(id);
  }
  function handleDrop(e, targetId) {
    e.preventDefault();
    if (!dragging || dragging === targetId) { setDragging(null); setDragOver(null); return; }
    setBeats(prev => {
      const arr = [...prev];
      const fi = arr.findIndex(b => b.id === dragging);
      const ti = arr.findIndex(b => b.id === targetId);
      const [item] = arr.splice(fi, 1);
      arr.splice(ti, 0, item);
      return arr;
    });
    setDragging(null); setDragOver(null);
  }
  function handleDragEnd() { setDragging(null); setDragOver(null); }

  function patchBeat(id, key, val) {
    setBeats(prev => prev.map(b => b.id === id ? { ...b, [key]: val } : b));
  }
  function addBeat() {
    setBeats(prev => [...prev, { id: `b${Date.now()}`, type: "Escalada", label: "Novo beat", detail: "", color: "#d5a240", icon: "activity" }]);
  }
  function removeBeat(id) {
    setBeats(prev => prev.filter(b => b.id !== id));
  }

  return (
    <div style={{ maxWidth: 680, display: "flex", flexDirection: "column", gap: 6 }}>

      {/* Beat types legend */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
        {BEAT_TYPES.map(t => (
          <span key={t} style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "3px 10px", borderRadius: 9999, fontSize: 10, fontWeight: 600,
            background: TYPE_COLORS[t] + "18", border: `1px solid ${TYPE_COLORS[t]}44`,
            color: TYPE_COLORS[t],
          }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: TYPE_COLORS[t], display: "inline-block" }} />
            {t}
          </span>
        ))}
      </div>

      {/* Beats */}
      {beats.map((beat, idx) => {
        const isExpanded = expandedId === beat.id;
        const isDraggingThis = dragging === beat.id;
        const isDragTarget  = dragOver  === beat.id;
        const c = TYPE_COLORS[beat.type] || "#b5aea4";

        return (
          <div key={beat.id}
            draggable
            onDragStart={e => handleDragStart(e, beat.id)}
            onDragOver={e => handleDragOver(e, beat.id)}
            onDrop={e => handleDrop(e, beat.id)}
            onDragEnd={handleDragEnd}
            style={{
              borderRadius: 13, border: `1px solid ${isDragTarget ? c + "66" : "rgba(255,255,255,.08)"}`,
              background: isDraggingThis ? "rgba(255,255,255,.02)" : `linear-gradient(135deg, ${c}10, rgba(8,7,12,.97))`,
              opacity: isDraggingThis ? 0.4 : 1,
              transition: "all .15s",
              boxShadow: isDragTarget ? `0 0 0 1px ${c}55, 0 8px 30px ${c}18` : "none",
              overflow: "hidden",
            }}>
            {/* Left accent */}
            <div style={{ display: "flex" }}>
              <div style={{ width: 3, background: c, borderRadius: "12px 0 0 12px", flexShrink: 0 }} />
              <div style={{ flex: 1, padding: "11px 14px" }}>
                {/* Header row */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {/* Drag handle */}
                  <div style={{ cursor: "grab", color: "rgba(255,255,255,.2)", display: "flex", gap: 2, flexDirection: "column" }}>
                    {[0,1,2].map(i => <div key={i} style={{ width: 12, height: 1.5, background: "currentColor", borderRadius: 1 }} />)}
                  </div>

                  {/* Step number */}
                  <div style={{
                    width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                    background: c + "20", border: `1px solid ${c}44`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--font-m)", fontSize: 10, fontWeight: 700, color: c,
                  }}>{idx + 1}</div>

                  {/* Type selector */}
                  <select
                    value={beat.type}
                    onChange={e => patchBeat(beat.id, "type", e.target.value)}
                    style={{
                      background: "transparent", border: "none", color: c,
                      fontSize: 10, fontWeight: 700, fontFamily: "inherit",
                      cursor: "pointer", outline: "none", letterSpacing: "0.06em",
                    }}>
                    {BEAT_TYPES.map(t => <option key={t} style={{ background: "#0b0b12", color: "#f4efe7" }}>{t}</option>)}
                  </select>

                  {/* Label */}
                  <input
                    value={beat.label}
                    onChange={e => patchBeat(beat.id, "label", e.target.value)}
                    style={{
                      flex: 1, background: "transparent", border: "none",
                      color: "#f4efe7", fontFamily: "var(--font-b)",
                      fontSize: 13, fontWeight: 600, outline: "none",
                    }}
                  />

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                    <button onClick={() => setExpanded(isExpanded ? null : beat.id)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,.3)", padding: 3, transition: "color .15s" }}
                      onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                      onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,.3)"}>
                      <LucideIcon name={isExpanded ? "minus" : "plus"} size={13} />
                    </button>
                    <button onClick={() => removeBeat(beat.id)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,.2)", padding: 3, transition: "color .15s" }}
                      onMouseEnter={e => e.currentTarget.style.color = "#bc4a3f"}
                      onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,.2)"}>
                      <LucideIcon name="x" size={13} />
                    </button>
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,.06)" }}>
                    <ForjaTextarea
                      value={beat.detail}
                      onChange={v => patchBeat(beat.id, "detail", v)}
                      placeholder="Detalhe o que acontece neste beat — gatilhos, consequências, possibilidades..."
                      rows={2}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Add beat */}
      <button onClick={addBeat}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          padding: "10px", borderRadius: 13,
          border: "1px dashed rgba(255,255,255,.15)", background: "transparent",
          color: "rgba(255,255,255,.35)", fontSize: 12, cursor: "pointer",
          fontFamily: "inherit", transition: "all .15s",
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(188,74,63,.4)"; e.currentTarget.style.color = "#e06155"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,.15)"; e.currentTarget.style.color = "rgba(255,255,255,.35)"; }}>
        <LucideIcon name="plus" size={14} />
        Adicionar beat
      </button>
    </div>
  );
}

/* ── STAGE 3: Cenas ──────────────────────────────────────────── */
function StageScenesView({ scenes, setScenes, beats }) {
  const [expandedId, setExpanded] = React.useState("s1");

  function patchScene(id, key, val) {
    setScenes(prev => prev.map(s => s.id === id ? { ...s, [key]: val } : s));
  }
  function addScene() {
    const newId = `s${Date.now()}`;
    setScenes(prev => [...prev, {
      id: newId, beatId: beats[0]?.id || "", title: "Nova cena",
      mood: "", duration: "15min",
      hook: "", npcs: [], notes: "",
    }]);
    setExpanded(newId);
  }

  return (
    <div style={{ maxWidth: 720, display: "flex", flexDirection: "column", gap: 10 }}>
      {scenes.map((scene, idx) => {
        const beat = beats.find(b => b.id === scene.beatId);
        const c = beat ? (beat.color || "#bc4a3f") : "#bc4a3f";
        const isOpen = expandedId === scene.id;

        return (
          <div key={scene.id} style={{
            borderRadius: 16, overflow: "hidden",
            border: `1px solid ${isOpen ? c + "44" : "rgba(255,255,255,.07)"}`,
            background: `linear-gradient(145deg, ${c}0a, rgba(10,9,15,.97))`,
            boxShadow: isOpen ? `inset 0 1px 0 rgba(255,255,255,.04), 0 0 0 1px ${c}22` : "none",
            transition: "all .2s",
          }}>
            {/* Header */}
            <div
              onClick={() => setExpanded(isOpen ? null : scene.id)}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", cursor: "pointer" }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                background: c + "22", border: `1px solid ${c}44`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-m)", fontSize: 11, fontWeight: 700, color: c,
              }}>{idx + 1}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#f4efe7" }}>{scene.title}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)", marginTop: 1 }}>
                  {beat?.type || "Sem beat"} · {scene.duration}
                  {scene.mood && ` · ${scene.mood}`}
                </div>
              </div>
              <LucideIcon name={isOpen ? "minus" : "chevron-right"} size={14} color="rgba(255,255,255,.3)" />
            </div>

            {/* Expanded */}
            {isOpen && (
              <div style={{ padding: "0 16px 16px", borderTop: "1px solid rgba(255,255,255,.06)", paddingTop: 14, display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 10 }}>
                  <div>
                    <FieldLabel>Título</FieldLabel>
                    <ForjaInput value={scene.title} onChange={v => patchScene(scene.id, "title", v)} placeholder="Nome da cena" />
                  </div>
                  <div>
                    <FieldLabel>Duração est.</FieldLabel>
                    <ForjaInput value={scene.duration} onChange={v => patchScene(scene.id, "duration", v)} placeholder="20min" />
                  </div>
                  <div>
                    <FieldLabel>Beat</FieldLabel>
                    <select value={scene.beatId} onChange={e => patchScene(scene.id, "beatId", e.target.value)}
                      style={{ width: "100%", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.09)", borderRadius: 10, color: "#f4efe7", fontFamily: "inherit", fontSize: 12, padding: "9px 10px", outline: "none" }}>
                      {beats.map(b => <option key={b.id} value={b.id} style={{ background: "#0b0b12" }}>{b.label}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <FieldLabel>Mood / atmosfera</FieldLabel>
                  <ForjaInput value={scene.mood} onChange={v => patchScene(scene.id, "mood", v)} placeholder="Tensão crescente, horror subtil, alívio cômico..." />
                </div>
                <div>
                  <FieldLabel>Gancho / complicação</FieldLabel>
                  <ForjaTextarea value={scene.hook} onChange={v => patchScene(scene.id, "hook", v)} rows={2}
                    placeholder="O que torna esta cena inesquecível? Qual é a virada?" />
                </div>
                <div>
                  <FieldLabel>NPCs presentes</FieldLabel>
                  <ForjaInput
                    value={scene.npcs.join(", ")}
                    onChange={v => patchScene(scene.id, "npcs", v.split(",").map(s => s.trim()).filter(Boolean))}
                    placeholder="Nomes separados por vírgula"
                  />
                </div>
                <div>
                  <FieldLabel>Notas do mestre</FieldLabel>
                  <ForjaTextarea value={scene.notes} onChange={v => patchScene(scene.id, "notes", v)} rows={2} mono
                    placeholder="Dicas de operação, referências de mapa, gatilhos secretos..." />
                </div>
              </div>
            )}
          </div>
        );
      })}

      <button onClick={addScene}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px",
          borderRadius: 14, border: "1px dashed rgba(255,255,255,.15)", background: "transparent",
          color: "rgba(255,255,255,.35)", fontSize: 12, cursor: "pointer", fontFamily: "inherit", transition: "all .15s",
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(188,74,63,.4)"; e.currentTarget.style.color = "#e06155"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,.15)"; e.currentTarget.style.color = "rgba(255,255,255,.35)"; }}>
        <LucideIcon name="plus" size={14} /> Nova cena
      </button>
    </div>
  );
}

/* ── STAGE 4: Reveals ────────────────────────────────────────── */
const IMPACT_META = {
  "Crítico": { color: "#bc4a3f", border: "rgba(188,74,63,.4)", bg: "rgba(188,74,63,.1)" },
  "Alto":    { color: "#d5a240", border: "rgba(213,162,64,.35)", bg: "rgba(213,162,64,.08)" },
  "Médio":   { color: "#4b9f91", border: "rgba(75,159,145,.3)",  bg: "rgba(75,159,145,.08)" },
  "Baixo":   { color: "#b5aea4", border: "rgba(181,174,164,.2)", bg: "rgba(181,174,164,.06)" },
};

function StageRevealsView({ reveals, setReveals }) {
  const [expandedId, setExpanded] = React.useState("r1");

  function patchReveal(id, key, val) {
    setReveals(prev => prev.map(r => r.id === id ? { ...r, [key]: val } : r));
  }
  function addReveal() {
    const id = `r${Date.now()}`;
    setReveals(prev => [...prev, { id, title: "Nova revelação", timing: "", impact: "Médio", desc: "" }]);
    setExpanded(id);
  }
  function removeReveal(id) { setReveals(prev => prev.filter(r => r.id !== id)); }

  return (
    <div style={{ maxWidth: 680, display: "flex", flexDirection: "column", gap: 10 }}>
      {reveals.map((rev, idx) => {
        const m = IMPACT_META[rev.impact] || IMPACT_META["Médio"];
        const isOpen = expandedId === rev.id;
        return (
          <div key={rev.id} style={{
            borderRadius: 16, overflow: "hidden",
            border: `1px solid ${isOpen ? m.border : "rgba(255,255,255,.07)"}`,
            background: isOpen ? m.bg : "rgba(255,255,255,.025)",
            transition: "all .2s",
          }}>
            <div onClick={() => setExpanded(isOpen ? null : rev.id)}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", cursor: "pointer" }}>
              <div style={{
                width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                background: m.bg, border: `1px solid ${m.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <LucideIcon name="sparkles" size={14} color={m.color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#f4efe7" }}>{rev.title}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)", marginTop: 1 }}>
                  {rev.timing || "Momento não definido"}
                </div>
              </div>
              <span style={{
                fontSize: 9, fontWeight: 700, padding: "3px 10px", borderRadius: 9999,
                background: m.bg, border: `1px solid ${m.border}`, color: m.color,
                letterSpacing: "0.06em", flexShrink: 0,
              }}>{rev.impact}</span>
              <button onClick={e => { e.stopPropagation(); removeReveal(rev.id); }}
                style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,.2)", padding: 4 }}
                onMouseEnter={e => e.currentTarget.style.color = "#bc4a3f"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,.2)"}>
                <LucideIcon name="x" size={13} />
              </button>
            </div>

            {isOpen && (
              <div style={{ padding: "0 16px 16px", borderTop: "1px solid rgba(255,255,255,.06)", paddingTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10 }}>
                  <div>
                    <FieldLabel>Título da revelação</FieldLabel>
                    <ForjaInput value={rev.title} onChange={v => patchReveal(rev.id, "title", v)} placeholder="O que é revelado?" />
                  </div>
                  <div>
                    <FieldLabel>Impacto</FieldLabel>
                    <select value={rev.impact} onChange={e => patchReveal(rev.id, "impact", e.target.value)}
                      style={{ width: "100%", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.09)", borderRadius: 10, color: "#f4efe7", fontFamily: "inherit", fontSize: 12, padding: "9px 10px", outline: "none" }}>
                      {Object.keys(IMPACT_META).map(k => <option key={k} style={{ background: "#0b0b12" }}>{k}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <FieldLabel>Momento / gatilho</FieldLabel>
                  <ForjaInput value={rev.timing} onChange={v => patchReveal(rev.id, "timing", v)} placeholder="Quando e como isso é revelado?" />
                </div>
                <div>
                  <FieldLabel>Descrição completa</FieldLabel>
                  <ForjaTextarea value={rev.desc} onChange={v => patchReveal(rev.id, "desc", v)} rows={3}
                    placeholder="O que o grupo descobre? Como isso muda o jogo?" />
                </div>
              </div>
            )}
          </div>
        );
      })}

      <button onClick={addReveal}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px",
          borderRadius: 14, border: "1px dashed rgba(255,255,255,.15)", background: "transparent",
          color: "rgba(255,255,255,.35)", fontSize: 12, cursor: "pointer", fontFamily: "inherit", transition: "all .15s",
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(213,162,64,.4)"; e.currentTarget.style.color = "#d5a240"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,.15)"; e.currentTarget.style.color = "rgba(255,255,255,.35)"; }}>
        <LucideIcon name="plus" size={14} /> Nova revelação
      </button>
    </div>
  );
}

/* ── STAGE 5: Finalizar ──────────────────────────────────────── */
function StageFinalizeView({ spark, beats, scenes, reveals, onLaunch }) {
  const tone   = TONE_OPTIONS.find(t => t.id === spark.tone);
  const arc    = ARC_OPTIONS.find(a => a.id === spark.arc);
  const totalMin = scenes.reduce((sum, s) => {
    const n = parseInt(s.duration) || 0; return sum + n;
  }, 0);

  const checks = [
    { label: "Faísca definida",       done: spark.idea.length > 20 },
    { label: "Tom escolhido",         done: !!spark.tone },
    { label: "Arco emocional",        done: !!spark.arc },
    { label: "Beats estruturados",    done: beats.length >= 3 },
    { label: "Cenas detalhadas",      done: scenes.some(s => s.hook.length > 10) },
    { label: "Ao menos 1 reveal",     done: reveals.length > 0 },
  ];
  const readiness = Math.round((checks.filter(c => c.done).length / checks.length) * 100);

  return (
    <div style={{ maxWidth: 720, display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Readiness */}
      <div style={{
        padding: "20px 24px", borderRadius: 16,
        border: `1px solid ${readiness === 100 ? "rgba(75,159,145,.4)" : "rgba(255,255,255,.08)"}`,
        background: readiness === 100 ? "rgba(75,159,145,.08)" : "rgba(255,255,255,.025)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#f4efe7" }}>Prontidão da sessão</div>
          <div style={{ fontFamily: "var(--font-m)", fontSize: 22, fontWeight: 700, color: readiness === 100 ? "#4b9f91" : "#d5a240" }}>{readiness}%</div>
        </div>
        <div style={{ height: 6, background: "rgba(255,255,255,.08)", borderRadius: 9999, overflow: "hidden", marginBottom: 14 }}>
          <div style={{
            height: "100%", width: `${readiness}%`, borderRadius: 9999, transition: "width .5s",
            background: readiness === 100 ? "linear-gradient(90deg,#4b9f91,#67e8b8)" : "linear-gradient(90deg,#bc4a3f,#d5a240)",
            boxShadow: `0 0 10px ${readiness === 100 ? "rgba(75,159,145,.5)" : "rgba(213,162,64,.4)"}`,
          }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
          {checks.map(c => (
            <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11 }}>
              <LucideIcon name={c.done ? "check" : "minus"} size={12} color={c.done ? "#4b9f91" : "rgba(255,255,255,.2)"} />
              <span style={{ color: c.done ? "rgba(255,255,255,.65)" : "rgba(255,255,255,.3)" }}>{c.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ padding: "16px 18px", borderRadius: 14, border: "1px solid rgba(255,255,255,.07)", background: "rgba(255,255,255,.025)" }}>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,.35)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 8 }}>Tom · Arco</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: tone?.color || "#f4efe7", marginBottom: 4 }}>{tone?.label || "—"}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,.5)", fontSize: 12 }}>
            {arc && <LucideIcon name={arc.icon} size={12} color="rgba(255,255,255,.4)" />}
            {arc?.label || "—"}
          </div>
        </div>
        <div style={{ padding: "16px 18px", borderRadius: 14, border: "1px solid rgba(255,255,255,.07)", background: "rgba(255,255,255,.025)" }}>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,.35)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 8 }}>Estrutura</div>
          <div style={{ fontFamily: "var(--font-m)", fontSize: 20, fontWeight: 700, color: "#f4efe7" }}>{beats.length} <span style={{ fontSize: 13, color: "rgba(255,255,255,.4)" }}>beats</span></div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", marginTop: 2 }}>{scenes.length} cenas · ~{totalMin}min estimados</div>
        </div>
        <div style={{ padding: "16px 18px", borderRadius: 14, border: "1px solid rgba(255,255,255,.07)", background: "rgba(255,255,255,.025)" }}>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,.35)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 8 }}>Reveals</div>
          <div style={{ fontFamily: "var(--font-m)", fontSize: 20, fontWeight: 700, color: "#d5a240" }}>{reveals.length}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", marginTop: 2 }}>
            {reveals.filter(r => r.impact === "Crítico").length} críticos · {reveals.filter(r => r.impact === "Alto").length} altos
          </div>
        </div>
        <div style={{ padding: "16px 18px", borderRadius: 14, border: "1px solid rgba(255,255,255,.07)", background: "rgba(255,255,255,.025)" }}>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,.35)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 8 }}>O que está em jogo</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.6)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{spark.stakes || "Não definido"}</div>
        </div>
      </div>

      {/* Launch */}
      <button onClick={onLaunch}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          padding: "15px 32px", borderRadius: 14, cursor: "pointer", fontFamily: "inherit",
          background: "linear-gradient(135deg, #bc4a3f, #6b1220)",
          border: "1px solid rgba(188,74,63,.5)",
          color: "#fff9f2", fontSize: 14, fontWeight: 700, letterSpacing: "0.04em",
          boxShadow: "0 8px 30px rgba(188,74,63,.35), inset 0 1px 0 rgba(255,255,255,.08)",
          transition: "all .2s",
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 14px 40px rgba(188,74,63,.5), inset 0 1px 0 rgba(255,255,255,.1)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 8px 30px rgba(188,74,63,.35), inset 0 1px 0 rgba(255,255,255,.08)"; }}>
        <LucideIcon name="swords" size={18} color="#fff9f2" />
        Abrir no Cockpit ao Vivo
      </button>
    </div>
  );
}

Object.assign(window, { StageSparkView, StageStructureView, StageScenesView, StageRevealsView, StageFinalizeView });
