// cockpit-map.jsx — Fog of War map panel
// Depends on: cockpit-icons.jsx

// Pre-revealed cells: row-col keys (10 cols × 8 rows)
const COLS = 10, ROWS = 8;
const PRE_REVEALED = new Set([
  "7-0","7-1","7-2","7-3",
  "6-0","6-1","6-2","6-3","6-4",
  "5-0","5-1","5-2","5-3","5-4","5-5",
  "4-2","4-3","4-4","4-5",
  "3-4","3-5","3-6",
  "2-5","2-6","2-7",
  "1-7","1-8",
  "0-8","0-9",
]);

const SCENE_MARKERS = [
  { row: 6, col: 2, label: "Porto", active: true },
  { row: 3, col: 5, label: "Beco" },
  { row: 1, col: 8, label: "Saída" },
];

function MapPanel({ revealedCells, setRevealedCells }) {
  const [hoveredCell, setHoveredCell] = React.useState(null);
  const [revealMode, setRevealMode] = React.useState(true);

  function toggleCell(key) {
    setRevealedCells(prev => {
      const next = new Set(prev);
      if (revealMode) {
        next.has(key) ? next.delete(key) : next.add(key);
      } else {
        next.has(key) ? next.delete(key) : next.add(key);
      }
      return next;
    });
  }

  function revealAll() { const s = new Set(); for (let r=0;r<ROWS;r++) for (let c=0;c<COLS;c++) s.add(`${r}-${c}`); setRevealedCells(s); }
  function hideAll()   { setRevealedCells(new Set()); }
  function resetFog()  { setRevealedCells(new Set(PRE_REVEALED)); }

  const revealCount = revealedCells.size;
  const totalCells  = ROWS * COLS;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid rgba(255,255,255,.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(245,221,177,0.72)", marginBottom: 2 }}>Cena Ativa</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#f4efe7" }}>Porto de Valkaria — Setor 3</div>
        </div>
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,.3)" }}>{revealCount}/{totalCells}</span>
          <button onClick={revealAll} title="Revelar tudo" style={{ background: "rgba(75,159,145,.1)", border: "1px solid rgba(75,159,145,.25)", color: "rgba(75,159,145,.8)", borderRadius: 7, padding: "4px 7px", cursor: "pointer", fontSize: 9, fontWeight: 600, fontFamily: "inherit" }}>Revelar</button>
          <button onClick={resetFog} title="Restaurar névoa" style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.45)", borderRadius: 7, padding: "4px 7px", cursor: "pointer", fontSize: 9, fontFamily: "inherit" }}>Reset</button>
          <button onClick={hideAll} title="Ocultar tudo" style={{ background: "rgba(188,74,63,.08)", border: "1px solid rgba(188,74,63,.2)", color: "rgba(188,74,63,.7)", borderRadius: 7, padding: "4px 7px", cursor: "pointer", fontSize: 9, fontFamily: "inherit" }}>Ocultar</button>
        </div>
      </div>

      {/* Map area */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden", margin: "10px 12px 12px", borderRadius: 14, border: "1px solid rgba(255,255,255,.08)" }}>
        {/* Map background */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "url('assets/arton-map.jpg')",
          backgroundSize: "cover", backgroundPosition: "center",
          filter: "saturate(0.7) contrast(1.1) brightness(0.55)",
        }} />
        {/* Ambient tint */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 30% 70%, rgba(188,74,63,.18), transparent 55%), radial-gradient(ellipse at 70% 30%, rgba(58,40,8,.3), transparent 50%)" }} />

        {/* Fog grid */}
        <div style={{
          position: "absolute", inset: 0,
          display: "grid",
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gridTemplateRows: `repeat(${ROWS}, 1fr)`,
        }}>
          {Array.from({ length: ROWS }, (_, row) =>
            Array.from({ length: COLS }, (_, col) => {
              const key = `${row}-${col}`;
              const isRevealed = revealedCells.has(key);
              const isHovered = hoveredCell === key;
              const marker = SCENE_MARKERS.find(m => m.row === row && m.col === col);

              return (
                <div key={key}
                  onClick={() => toggleCell(key)}
                  onMouseEnter={() => setHoveredCell(key)}
                  onMouseLeave={() => setHoveredCell(null)}
                  style={{
                    position: "relative", cursor: "pointer",
                    background: isRevealed
                      ? "transparent"
                      : isHovered
                        ? "rgba(6,7,12,0.65)"
                        : "rgba(6,7,12,0.88)",
                    transition: "background 0.3s",
                    borderRight: "1px solid rgba(255,255,255,.03)",
                    borderBottom: "1px solid rgba(255,255,255,.03)",
                  }}>
                  {/* Fog shimmer */}
                  {!isRevealed && (
                    <div style={{
                      position: "absolute", inset: 0,
                      background: "linear-gradient(135deg, rgba(255,255,255,0.015) 0%, transparent 50%, rgba(255,255,255,0.01) 100%)",
                      animation: `fogShimmer ${3 + (row * col % 4)}s ease-in-out infinite alternate`,
                    }} />
                  )}
                  {/* Reveal hint on hover */}
                  {!isRevealed && isHovered && (
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <LucideIcon name="eye" size={12} color="rgba(255,255,255,.3)" />
                    </div>
                  )}
                  {/* Scene marker */}
                  {marker && isRevealed && (
                    <div style={{
                      position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                      pointerEvents: "none",
                    }}>
                      <div style={{
                        width: marker.active ? 10 : 8, height: marker.active ? 10 : 8,
                        borderRadius: "50%",
                        background: marker.active ? "#bc4a3f" : "#d5a240",
                        boxShadow: marker.active ? "0 0 10px #bc4a3f, 0 0 20px rgba(188,74,63,.5)" : "0 0 6px #d5a240",
                        animation: marker.active ? "markerPulse 2s ease-in-out infinite" : "none",
                      }} />
                      <div style={{
                        fontSize: 8, fontWeight: 700, color: marker.active ? "#f4efe7" : "rgba(213,162,64,.9)",
                        textShadow: "0 1px 4px rgba(0,0,0,.9)", letterSpacing: "0.06em",
                        whiteSpace: "nowrap", textTransform: "uppercase",
                      }}>{marker.label}</div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Compass rose */}
        <div style={{ position: "absolute", bottom: 10, right: 10, opacity: 0.35, pointerEvents: "none" }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="14" stroke="rgba(255,255,255,.4)" strokeWidth="0.5"/>
            <polygon points="16,4 18,14 16,12 14,14" fill="rgba(188,74,63,.8)"/>
            <polygon points="16,28 18,18 16,20 14,18" fill="rgba(255,255,255,.4)"/>
            <polygon points="4,16 14,14 12,16 14,18" fill="rgba(255,255,255,.4)"/>
            <polygon points="28,16 18,14 20,16 18,18" fill="rgba(255,255,255,.4)"/>
            <circle cx="16" cy="16" r="2" fill="rgba(255,255,255,.5)"/>
            <text x="16" y="3" textAnchor="middle" fill="rgba(188,74,63,.9)" fontSize="5" fontWeight="bold">N</text>
          </svg>
        </div>

        {/* Scale legend */}
        <div style={{ position: "absolute", bottom: 10, left: 10, display: "flex", alignItems: "center", gap: 5, opacity: 0.45, pointerEvents: "none" }}>
          <div style={{ width: 24, height: 1, background: "rgba(255,255,255,.6)" }} />
          <span style={{ fontSize: 7, color: "rgba(255,255,255,.7)", fontFamily: "var(--font-m)", letterSpacing: "0.06em" }}>30m</span>
        </div>
      </div>

      {/* Bottom hint */}
      <div style={{ padding: "0 16px 10px", display: "flex", alignItems: "center", gap: 6 }}>
        <LucideIcon name="eye" size={11} color="rgba(255,255,255,.25)" />
        <span style={{ fontSize: 10, color: "rgba(255,255,255,.25)" }}>Clique nas células para revelar ou ocultar névoa</span>
      </div>
    </div>
  );
}

Object.assign(window, { MapPanel });
