// cockpit-right.jsx — Right panel: Rolls, Notes, Atmosphere
// Depends on: cockpit-icons.jsx

const ROLL_TYPES = [
  { label: "Ataque", mod: 4, dice: "d20" },
  { label: "Dano", mod: 2, dice: "d8" },
  { label: "Percepção", mod: 1, dice: "d20" },
  { label: "Fortitude", mod: 3, dice: "d20" },
  { label: "Iniciativa", mod: 2, dice: "d20" },
];

const INITIAL_ROLLS = [
  { id: 1, char: "Serafina",     type: "Ataque",     dice: "d20", raw: 18, mod: 4, total: 22, crit: false },
  { id: 2, char: "Cap. Sombrio", type: "Dano",       dice: "d8",  raw: 6,  mod: 2, total: 8,  crit: false },
  { id: 3, char: "Trog",         type: "Percepção",  dice: "d20", raw: 20, mod: 1, total: 21, crit: true },
  { id: 4, char: "Kulthar",      type: "Fortitude",  dice: "d20", raw: 4,  mod: 3, total: 7,  crit: false },
];

const DICE_FACES = { "d4": 4, "d6": 6, "d8": 8, "d10": 10, "d12": 12, "d20": 20 };

function RollCard({ roll }) {
  const isCrit = roll.crit;
  const isFail = roll.raw === 1;
  const totalColor = isCrit ? "#d5a240" : isFail ? "#bc4a3f" : roll.total >= 15 ? "#4b9f91" : "rgba(255,255,255,.75)";
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
      borderRadius: 10, border: `1px solid ${isCrit ? "rgba(213,162,64,.25)" : "rgba(255,255,255,.06)"}`,
      background: isCrit ? "rgba(213,162,64,.05)" : "rgba(255,255,255,.02)",
      marginBottom: 5,
    }}>
      {/* Dice value */}
      <div style={{
        width: 36, height: 36, flexShrink: 0,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        borderRadius: 8,
        background: isCrit ? "rgba(213,162,64,.15)" : isFail ? "rgba(188,74,63,.12)" : "rgba(255,255,255,.05)",
        border: `1px solid ${isCrit ? "rgba(213,162,64,.3)" : isFail ? "rgba(188,74,63,.25)" : "rgba(255,255,255,.1)"}`,
      }}>
        <span style={{ fontFamily: "var(--font-m)", fontSize: 15, fontWeight: 700, color: totalColor, lineHeight: 1 }}>{roll.total}</span>
        <span style={{ fontSize: 8, color: "rgba(255,255,255,.3)", letterSpacing: "0.06em" }}>{roll.dice}</span>
      </div>
      {/* Roll info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#f4efe7", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{roll.char}</span>
          {isCrit && <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", color: "#d5a240", flexShrink: 0 }}>CRÍTICO</span>}
          {isFail && <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", color: "#bc4a3f", flexShrink: 0 }}>FALHA</span>}
        </div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)", marginTop: 1 }}>
          {roll.type} · {roll.raw}{roll.mod >= 0 ? `+${roll.mod}` : roll.mod}
        </div>
      </div>
    </div>
  );
}

function DiceButton({ dice, onRoll }) {
  const [spinning, setSpinning] = React.useState(false);
  function handleRoll() {
    if (spinning) return;
    setSpinning(true);
    setTimeout(() => setSpinning(false), 400);
    onRoll(dice);
  }
  return (
    <button onClick={handleRoll} style={{
      flex: 1, padding: "6px 0",
      borderRadius: 8, border: "1px solid rgba(255,255,255,.1)",
      background: spinning ? "rgba(188,74,63,.15)" : "rgba(255,255,255,.04)",
      color: spinning ? "#e06155" : "rgba(255,255,255,.55)",
      fontSize: 10, fontWeight: 600, fontFamily: "var(--font-m)",
      cursor: "pointer", transition: "all .15s",
      transform: spinning ? "scale(0.93)" : "scale(1)",
    }}>{dice}</button>
  );
}

function RightPanel({ rolls, setRolls, notes, setNotes }) {
  const [quickChar, setQuickChar] = React.useState("Mestre");
  const [quickType, setQuickType] = React.useState("Ataque");
  const [lastRollAnim, setLastRollAnim] = React.useState(false);

  function rollDice(diceStr) {
    const sides = DICE_FACES[diceStr] || 20;
    const raw = Math.floor(Math.random() * sides) + 1;
    const rt = ROLL_TYPES.find(r => r.label === quickType) || ROLL_TYPES[0];
    const mod = rt.mod;
    const newRoll = {
      id: Date.now(), char: quickChar, type: quickType,
      dice: diceStr, raw, mod, total: raw + mod,
      crit: raw === sides && sides >= 8,
    };
    setRolls(prev => [newRoll, ...prev.slice(0, 6)]);
    setLastRollAnim(true);
    setTimeout(() => setLastRollAnim(false), 500);
  }

  const scenes = ["Porto em Chamas", "Beco das Sombras", "Cais Abandonado", "Torre do Vigia"];
  const [sceneIdx, setSceneIdx] = React.useState(0);
  const [tension, setTension] = React.useState(78); // %

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 0, overflowY: "auto" }}>

      {/* ── SECTION: Rolagens ── */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,.06)" }}>
        <div style={{ padding: "14px 14px 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(245,221,177,.72)" }}>Rolagens</div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <select value={quickChar} onChange={e => setQuickChar(e.target.value)}
              style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 6, color: "rgba(255,255,255,.6)", fontSize: 9, padding: "2px 5px", fontFamily: "inherit", cursor: "pointer", outline: "none" }}>
              {["Serafina","Trog","Kulthar","Cap. Sombrio","Guarda","Mestre"].map(n => <option key={n} style={{ background: "#0b0b12" }}>{n}</option>)}
            </select>
            <select value={quickType} onChange={e => setQuickType(e.target.value)}
              style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 6, color: "rgba(255,255,255,.6)", fontSize: 9, padding: "2px 5px", fontFamily: "inherit", cursor: "pointer", outline: "none" }}>
              {ROLL_TYPES.map(r => <option key={r.label} style={{ background: "#0b0b12" }}>{r.label}</option>)}
            </select>
          </div>
        </div>

        {/* Dice buttons */}
        <div style={{ display: "flex", gap: 4, padding: "0 14px 10px" }}>
          {["d4","d6","d8","d10","d12","d20"].map(d => (
            <DiceButton key={d} dice={d} onRoll={rollDice} />
          ))}
        </div>

        {/* Roll history */}
        <div style={{ padding: "0 10px 10px" }}>
          {rolls.slice(0, 5).map((roll, i) => (
            <div key={roll.id} style={{
              transition: "opacity .3s, transform .3s",
              opacity: i === 0 && lastRollAnim ? 0.4 : 1,
              transform: i === 0 && lastRollAnim ? "translateY(-4px)" : "none",
            }}>
              <RollCard roll={roll} />
            </div>
          ))}
        </div>
      </div>

      {/* ── SECTION: Notas rápidas ── */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,.06)" }}>
        <div style={{ padding: "12px 14px 6px", fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(245,221,177,.72)" }}>Notas rápidas</div>
        <div style={{ padding: "0 10px 10px" }}>
          <textarea
            value={notes} onChange={e => setNotes(e.target.value)}
            rows={5}
            style={{
              width: "100%", boxSizing: "border-box",
              background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)",
              borderRadius: 10, color: "#f4efe7", fontFamily: "var(--font-m)",
              fontSize: 11, lineHeight: 1.65, padding: "10px 12px",
              resize: "none", outline: "none",
            }}
          />
        </div>
      </div>

      {/* ── SECTION: Ambiente ── */}
      <div>
        <div style={{ padding: "12px 14px 8px", fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(245,221,177,.72)" }}>Ambiente</div>
        <div style={{ padding: "0 12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>

          {/* Scene selector */}
          <div style={{ borderRadius: 10, border: "1px solid rgba(255,255,255,.07)", background: "rgba(255,255,255,.025)", padding: "9px 12px" }}>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 5 }}>Cena</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#f4efe7" }}>{scenes[sceneIdx]}</span>
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={() => setSceneIdx(i => (i - 1 + scenes.length) % scenes.length)}
                  style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.5)", borderRadius: 5, padding: "3px 6px", cursor: "pointer" }}>
                  <LucideIcon name="chevron-left" size={11} />
                </button>
                <button onClick={() => setSceneIdx(i => (i + 1) % scenes.length)}
                  style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.5)", borderRadius: 5, padding: "3px 6px", cursor: "pointer" }}>
                  <LucideIcon name="chevron-right" size={11} />
                </button>
              </div>
            </div>
          </div>

          {/* Weather + time */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            <div style={{ borderRadius: 10, border: "1px solid rgba(255,255,255,.07)", background: "rgba(255,255,255,.025)", padding: "9px 12px" }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Clima</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <LucideIcon name="wind" size={13} color="rgba(120,180,255,.7)" />
                <span style={{ fontSize: 11, color: "#f4efe7" }}>Tempestade</span>
              </div>
            </div>
            <div style={{ borderRadius: 10, border: "1px solid rgba(255,255,255,.07)", background: "rgba(255,255,255,.025)", padding: "9px 12px" }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Hora</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <LucideIcon name="clock" size={13} color="rgba(213,162,64,.7)" />
                <span style={{ fontSize: 11, color: "#f4efe7" }}>23:00</span>
              </div>
            </div>
          </div>

          {/* Tension */}
          <div style={{ borderRadius: 10, border: "1px solid rgba(188,74,63,.2)", background: "rgba(188,74,63,.05)", padding: "9px 12px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <LucideIcon name="activity" size={12} color="rgba(224,97,85,.8)" />
                <span style={{ fontSize: 9, color: "rgba(255,255,255,.45)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Tensão</span>
              </div>
              <span style={{ fontFamily: "var(--font-m)", fontSize: 11, color: tension > 70 ? "#e06155" : "#d5a240", fontWeight: 700 }}>{tension}%</span>
            </div>
            <div style={{ height: 5, background: "rgba(255,255,255,.08)", borderRadius: 9999, overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${tension}%`, borderRadius: 9999,
                background: tension > 70 ? "linear-gradient(90deg,#bc4a3f,#e24545)" : "linear-gradient(90deg,#d5a240,#f6ae2d)",
                boxShadow: `0 0 8px ${tension > 70 ? "rgba(188,74,63,.6)" : "rgba(213,162,64,.5)"}`,
                transition: "width .5s",
              }} />
            </div>
            <input type="range" min={0} max={100} value={tension} onChange={e => setTension(Number(e.target.value))}
              style={{ width: "100%", marginTop: 6, accentColor: "#bc4a3f", cursor: "pointer" }} />
          </div>
        </div>
      </div>

    </div>
  );
}

Object.assign(window, { RightPanel, INITIAL_ROLLS });
