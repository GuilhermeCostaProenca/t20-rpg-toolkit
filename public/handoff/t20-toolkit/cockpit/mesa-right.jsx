// mesa-right.jsx — Dice roller, roll history, session notes
// Depends on: cockpit-icons.jsx, mesa-data.jsx

const DICE_SIDES = { "d4":4,"d6":6,"d8":8,"d10":10,"d12":12,"d20":20,"d%":100 };
const ROLL_CHARS = ["Serafina","Kulthar","Trog","Cap. Sombrio","Guarda","Mestre"];
const ROLL_TYPES_M = ["Ataque","Dano","Defesa","Perícia","Magia","Fortitude","Reflexo","Vontade"];

function MiniRollCard({ roll, idx }) {
  const isCrit = roll.crit;
  const isFail = roll.raw === 1;
  const tc = isCrit ? "#d5a240" : isFail ? "#bc4a3f" : roll.total >= 15 ? "#4b9f91" : "rgba(255,255,255,.7)";
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8, padding: "6px 8px",
      borderRadius: 8, marginBottom: 4,
      border: `1px solid ${isCrit ? "rgba(213,162,64,.25)" : isFail ? "rgba(188,74,63,.18)" : "rgba(255,255,255,.06)"}`,
      background: isCrit ? "rgba(213,162,64,.06)" : isFail ? "rgba(188,74,63,.06)" : "rgba(255,255,255,.02)",
      opacity: idx > 4 ? 0.5 : 1,
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 7, flexShrink: 0,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        background: isCrit ? "rgba(213,162,64,.15)" : isFail ? "rgba(188,74,63,.12)" : "rgba(255,255,255,.05)",
        border: `1px solid ${isCrit ? "rgba(213,162,64,.3)" : isFail ? "rgba(188,74,63,.25)" : "rgba(255,255,255,.09)"}`,
      }}>
        <span style={{ fontFamily: "var(--font-m)", fontSize: 14, fontWeight: 700, color: tc, lineHeight: 1 }}>{roll.total}</span>
        <span style={{ fontSize: 7, color: "rgba(255,255,255,.3)", letterSpacing: "0.04em" }}>{roll.dice}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#f4efe7", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{roll.char}</span>
          <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
            {isCrit && <span style={{ fontSize: 7, fontWeight: 700, color: "#d5a240", letterSpacing: "0.08em" }}>CRÍT</span>}
            {isFail && <span style={{ fontSize: 7, fontWeight: 700, color: "#bc4a3f", letterSpacing: "0.08em" }}>FALHA</span>}
            <span style={{ fontSize: 9, color: "rgba(255,255,255,.25)", fontFamily: "var(--font-m)" }}>{roll.ts}</span>
          </div>
        </div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,.3)" }}>
          {roll.type} · {roll.raw}{roll.mod >= 0 ? `+${roll.mod}` : roll.mod} = {roll.total}
        </div>
      </div>
    </div>
  );
}

function MesaRight({ rolls, setRolls, notes, setNotes }) {
  const [rollChar, setRollChar]   = React.useState("Mestre");
  const [rollType, setRollType]   = React.useState("Ataque");
  const [rollMod,  setRollMod]    = React.useState(0);
  const [lastAnim, setLastAnim]   = React.useState(false);
  const [spinning, setSpinning]   = React.useState(null);

  function roll(diceStr) {
    if (spinning) return;
    setSpinning(diceStr);
    setTimeout(() => setSpinning(null), 350);

    const sides = DICE_SIDES[diceStr] || 20;
    const raw   = Math.floor(Math.random() * sides) + 1;
    const mod   = parseInt(rollMod) || 0;
    const total = raw + mod;
    const now   = new Date();
    const ts    = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
    const newRoll = {
      id: Date.now(), char: rollChar, type: rollType,
      dice: diceStr, raw, mod, total,
      crit: raw === sides && sides >= 8, ts,
    };
    setRolls(prev => [newRoll, ...prev.slice(0, 14)]);
    setLastAnim(true);
    setTimeout(() => setLastAnim(false), 400);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

      {/* ── ROLLER ── */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,.06)", flexShrink: 0 }}>
        <div style={{ padding: "11px 12px 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(245,221,177,.72)" }}>Rolagem rápida</div>
        </div>

        {/* Selectors */}
        <div style={{ padding: "0 10px 8px", display: "flex", gap: 5 }}>
          <select value={rollChar} onChange={e => setRollChar(e.target.value)}
            style={{ flex: 1, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 7, color: "rgba(255,255,255,.7)", fontSize: 10, padding: "5px 7px", fontFamily: "inherit", outline: "none" }}>
            {ROLL_CHARS.map(c => <option key={c} style={{ background: "#0b0b12" }}>{c}</option>)}
          </select>
          <select value={rollType} onChange={e => setRollType(e.target.value)}
            style={{ flex: 1, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 7, color: "rgba(255,255,255,.7)", fontSize: 10, padding: "5px 7px", fontFamily: "inherit", outline: "none" }}>
            {ROLL_TYPES_M.map(t => <option key={t} style={{ background: "#0b0b12" }}>{t}</option>)}
          </select>
          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,.3)" }}>+</span>
            <input type="number" value={rollMod} onChange={e => setRollMod(e.target.value)}
              style={{ width: 34, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 7, color: "#f4efe7", fontFamily: "var(--font-m)", fontSize: 11, padding: "5px 5px", textAlign: "center", outline: "none" }} />
          </div>
        </div>

        {/* Dice buttons */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, padding: "0 10px 10px" }}>
          {Object.keys(DICE_SIDES).map(d => (
            <button key={d} onClick={() => roll(d)}
              style={{
                padding: "7px 0", borderRadius: 7, cursor: "pointer", fontFamily: "var(--font-m)",
                fontSize: d === "d20" ? 11 : 10, fontWeight: 700,
                border: `1px solid ${spinning === d ? "rgba(188,74,63,.5)" : d === "d20" ? "rgba(188,74,63,.3)" : "rgba(255,255,255,.1)"}`,
                background: spinning === d ? "rgba(188,74,63,.25)" : d === "d20" ? "rgba(188,74,63,.12)" : "rgba(255,255,255,.04)",
                color: d === "d20" ? "#e06155" : "rgba(255,255,255,.6)",
                transform: spinning === d ? "scale(0.9)" : "scale(1)",
                transition: "all .15s",
              }}>
              {d}
            </button>
          ))}
        </div>

        {/* Last roll big display */}
        {rolls[0] && (
          <div style={{
            margin: "0 10px 10px", padding: "8px 12px", borderRadius: 10,
            border: `1px solid ${rolls[0].crit ? "rgba(213,162,64,.3)" : rolls[0].raw === 1 ? "rgba(188,74,63,.3)" : "rgba(255,255,255,.08)"}`,
            background: rolls[0].crit ? "rgba(213,162,64,.07)" : rolls[0].raw === 1 ? "rgba(188,74,63,.07)" : "rgba(255,255,255,.03)",
            display: "flex", alignItems: "center", gap: 12,
            opacity: lastAnim ? 0.5 : 1, transition: "opacity .3s",
          }}>
            <div style={{
              fontFamily: "var(--font-d)", fontSize: 32, fontWeight: 900, lineHeight: 1,
              color: rolls[0].crit ? "#d5a240" : rolls[0].raw === 1 ? "#bc4a3f" : "#f4efe7",
              textShadow: `0 0 20px ${rolls[0].crit ? "rgba(213,162,64,.5)" : "rgba(255,255,255,.1)"}`,
            }}>{rolls[0].total}</div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#f4efe7" }}>{rolls[0].char} — {rolls[0].type}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,.4)", fontFamily: "var(--font-m)" }}>
                {rolls[0].dice} · {rolls[0].raw}{rolls[0].mod>=0?`+${rolls[0].mod}`:rolls[0].mod}
                {rolls[0].crit && " · CRÍTICO"}
                {rolls[0].raw === 1 && " · FALHA NATURAL"}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── ROLL LOG ── */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,.06)", flex: "0 0 auto", maxHeight: 220, overflowY: "auto" }}>
        <div style={{ padding: "9px 12px 5px", fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(245,221,177,.65)", position: "sticky", top: 0, background: "rgba(10,9,15,.98)", zIndex: 1 }}>Histórico</div>
        <div style={{ padding: "0 8px 8px" }}>
          {rolls.map((r, i) => <MiniRollCard key={r.id} roll={r} idx={i} />)}
        </div>
      </div>

      {/* ── NOTES ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "9px 12px 5px", fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(245,221,177,.65)", flexShrink: 0 }}>Notas ao vivo</div>
        <div style={{ flex: 1, padding: "0 10px 10px" }}>
          <textarea
            value={notes} onChange={e => setNotes(e.target.value)}
            style={{
              width: "100%", height: "100%", boxSizing: "border-box",
              background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)",
              borderRadius: 10, color: "#f4efe7", fontFamily: "var(--font-m)",
              fontSize: 11, lineHeight: 1.65, padding: "10px 12px",
              resize: "none", outline: "none",
            }}
          />
        </div>
      </div>

    </div>
  );
}

Object.assign(window, { MesaRight });
