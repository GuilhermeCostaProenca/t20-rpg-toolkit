// visual-gallery.jsx — Masonry grid + placeholder art + lightbox
// Depends on: cockpit-icons.jsx, visual-data.jsx

/* ── SVG Placeholder Art ─────────────────────────────────────── */
function PlaceholderArt({ asset, width, height, compact }) {
  const [g1, g2, g3] = asset.gradient;
  const id = `grad-${asset.id}`;
  const rid = `radial-${asset.id}`;
  const label = asset.label || asset.category.toUpperCase();

  // Generate deterministic "particle" positions from id hash
  const particles = React.useMemo(() => {
    const seed = asset.id.charCodeAt(1) || 7;
    return Array.from({ length: 18 }, (_, i) => ({
      x: ((seed * (i + 1) * 137.5) % 100),
      y: ((seed * (i + 2) * 97.3)  % 100),
      r: 0.4 + ((seed * i * 53) % 100) / 300,
      o: 0.2 + ((seed * i * 73) % 100) / 400,
    }));
  }, [asset.id]);

  // Horizon line
  const horizonY = 35 + (asset.id.charCodeAt(1) % 30);

  return (
    <svg
      width={width || "100%"} height={height || "100%"}
      viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"
      style={{ display: "block", width: "100%", height: "100%" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={g1} />
          <stop offset="55%" stopColor={g2} />
          <stop offset="100%" stopColor={g3} />
        </linearGradient>
        <radialGradient id={rid} cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor={asset.accent} stopOpacity="0.18" />
          <stop offset="100%" stopColor={asset.accent} stopOpacity="0" />
        </radialGradient>
        <filter id={`blur-${asset.id}`}>
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      {/* Base gradient */}
      <rect width="100" height="100" fill={`url(#${id})`} />

      {/* Horizon glow */}
      <ellipse cx="50" cy={horizonY} rx="55" ry="12"
        fill={asset.accent} opacity="0.08"
        filter={`url(#blur-${asset.id})`} />

      {/* Radial atmosphere */}
      <rect width="100" height="100" fill={`url(#${rid})`} />

      {/* Stars / particles */}
      {particles.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={p.r}
          fill={asset.accent} opacity={p.o} />
      ))}

      {/* Horizon line */}
      <line x1="10" y1={horizonY} x2="90" y2={horizonY}
        stroke={asset.accent} strokeWidth="0.3" opacity="0.25" />

      {/* Atmospheric silhouette — different shapes per category */}
      {asset.category === "Mapas" && (
        <>
          <path d="M0,80 Q15,55 30,60 Q45,65 50,55 Q60,45 70,58 Q80,70 100,60 L100,100 L0,100 Z"
            fill={asset.accent} opacity="0.04" />
          <path d="M0,85 Q20,72 40,78 Q60,84 80,74 Q90,70 100,76 L100,100 L0,100 Z"
            fill={asset.accent} opacity="0.06" />
          {/* Grid lines */}
          {[20,40,60,80].map(x => (
            <line key={x} x1={x} y1="0" x2={x} y2="100"
              stroke={asset.accent} strokeWidth="0.15" opacity="0.08" strokeDasharray="1 3" />
          ))}
          {[20,40,60,80].map(y => (
            <line key={y} x1="0" y1={y} x2="100" y2={y}
              stroke={asset.accent} strokeWidth="0.15" opacity="0.08" strokeDasharray="1 3" />
          ))}
        </>
      )}

      {asset.category === "Personagens" && (
        <>
          {/* Silhouette body */}
          <ellipse cx="50" cy="72" rx="12" ry="16" fill={asset.accent} opacity="0.07" />
          <ellipse cx="50" cy="50" rx="8" ry="10" fill={asset.accent} opacity="0.09" />
          {/* Halo / aura */}
          <circle cx="50" cy="50" r="22" fill="none"
            stroke={asset.accent} strokeWidth="0.3" opacity="0.15" strokeDasharray="2 4" />
        </>
      )}

      {asset.category === "Criaturas" && (
        <>
          <path d="M30,85 Q40,60 50,55 Q60,60 70,85" fill={asset.accent} opacity="0.06" />
          <path d="M20,90 Q35,50 50,40 Q65,50 80,90" fill="none"
            stroke={asset.accent} strokeWidth="0.4" opacity="0.12" />
          {/* Eyes */}
          <circle cx="43" cy="48" r="2.5" fill={asset.accent} opacity="0.3" />
          <circle cx="57" cy="48" r="2.5" fill={asset.accent} opacity="0.3" />
          <circle cx="43" cy="48" r="1" fill={asset.accent} opacity="0.7" />
          <circle cx="57" cy="48" r="1" fill={asset.accent} opacity="0.7" />
        </>
      )}

      {asset.category === "Locais" && (
        <>
          {/* Architectural silhouette */}
          <path d="M10,90 L10,55 L20,50 L25,35 L30,50 L45,45 L50,30 L55,45 L70,50 L75,35 L80,50 L90,55 L90,90 Z"
            fill={asset.accent} opacity="0.05" />
          <path d="M10,90 L10,55 L20,50 L25,35 L30,50 L45,45 L50,30 L55,45 L70,50 L75,35 L80,50 L90,55 L90,90 Z"
            fill="none" stroke={asset.accent} strokeWidth="0.3" opacity="0.15" />
        </>
      )}

      {asset.category === "Cenas" && (
        <>
          {/* Action lines */}
          {[0,15,30,45,60,75,90].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            return (
              <line key={i}
                x1={50} y1={50}
                x2={50 + Math.cos(rad) * 55}
                y2={50 + Math.sin(rad) * 55}
                stroke={asset.accent} strokeWidth="0.2" opacity="0.08"
              />
            );
          })}
          <circle cx="50" cy="50" r="8" fill={asset.accent} opacity="0.1" />
          <circle cx="50" cy="50" r="4" fill={asset.accent} opacity="0.15" />
        </>
      )}

      {asset.category === "Itens" && (
        <>
          {/* Item glow orb */}
          <circle cx="50" cy="48" r="18" fill={asset.accent} opacity="0.06"
            filter={`url(#blur-${asset.id})`} />
          <circle cx="50" cy="48" r="10" fill="none"
            stroke={asset.accent} strokeWidth="0.4" opacity="0.2" />
          <circle cx="50" cy="48" r="5" fill={asset.accent} opacity="0.15" />
          {/* Runes */}
          {[0,60,120,180,240,300].map((a, i) => {
            const rad = (a * Math.PI) / 180;
            const rx = 50 + Math.cos(rad) * 14;
            const ry = 48 + Math.sin(rad) * 14;
            return <circle key={i} cx={rx} cy={ry} r="0.8" fill={asset.accent} opacity="0.4" />;
          })}
        </>
      )}

      {/* Category label top-left */}
      {!compact && (
        <>
          <rect x="4" y="4" width={label.length * 4.2 + 8} height="10" rx="2"
            fill="rgba(0,0,0,.55)" />
          <text x="8" y="11" fill={asset.accent}
            fontSize="5.5" fontFamily="monospace" fontWeight="bold"
            letterSpacing="0.5">{label}</text>
        </>
      )}

      {/* Vignette */}
      <rect width="100" height="100"
        fill="url(#vign)" opacity="0.7" />
      <defs>
        <radialGradient id="vign" cx="50%" cy="50%" r="70%">
          <stop offset="40%" stopColor="transparent" />
          <stop offset="100%" stopColor="rgba(6,7,12,.85)" />
        </radialGradient>
      </defs>
    </svg>
  );
}

/* ── Lightbox ────────────────────────────────────────────────── */
function Lightbox({ asset, onClose, onPrev, onNext, entities }) {
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => { const t = setTimeout(() => setVisible(true), 10); return () => clearTimeout(t); }, []);

  function handleClose() { setVisible(false); setTimeout(onClose, 220); }

  React.useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const catMeta = CATEGORY_META[asset.category] || {};
  const linkedEntity = asset.entityName
    ? (window.ENTITIES || []).find(e => e.name === asset.entityName)
    : null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: `rgba(6,7,12,${visible ? ".92" : "0"})`,
      backdropFilter: "blur(12px)",
      transition: "background .22s",
    }} onClick={handleClose}>

      <div
        onClick={e => e.stopPropagation()}
        style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          gap: 16, maxWidth: "90vw",
          opacity: visible ? 1 : 0, transform: visible ? "scale(1)" : "scale(0.96)",
          transition: "opacity .22s, transform .22s",
        }}>

        {/* Image */}
        <div style={{
          position: "relative", borderRadius: 18, overflow: "hidden",
          border: `1px solid ${asset.accent}44`,
          boxShadow: `0 0 0 1px ${asset.accent}22, 0 30px 80px rgba(0,0,0,.7), 0 0 60px ${asset.accent}18`,
          maxHeight: "65vh",
          aspectRatio: String(asset.aspect),
          width: Math.min(900, window.innerWidth * 0.85) + "px",
        }}>
          {asset.realImage
            ? <img src={asset.realImage} alt={asset.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            : <PlaceholderArt asset={asset} />
          }

          {/* Nav arrows */}
          {[
            { dir: "left",  label: "‹", action: onPrev },
            { dir: "right", label: "›", action: onNext },
          ].map(btn => (
            <button key={btn.dir} onClick={btn.action}
              style={{
                position: "absolute", top: "50%", [btn.dir]: 12, transform: "translateY(-50%)",
                width: 40, height: 40, borderRadius: "50%",
                background: "rgba(6,7,12,.7)", border: "1px solid rgba(255,255,255,.15)",
                color: "#fff", fontSize: 22, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all .15s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(188,74,63,.4)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(6,7,12,.7)"}>
              {btn.label}
            </button>
          ))}
        </div>

        {/* Info bar */}
        <div style={{
          display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", justifyContent: "center",
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-d)", fontSize: 18, fontWeight: 700, color: "#f4efe7", letterSpacing: "0.04em" }}>{asset.title}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.45)", marginTop: 3 }}>{asset.mood}</div>
          </div>
          <div style={{ width: 1, height: 24, background: "rgba(255,255,255,.12)" }} />
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            border: `1px solid ${catMeta.color}44`, background: catMeta.color + "14",
            borderRadius: 9999, padding: "4px 12px",
            fontSize: 10, fontWeight: 700, color: catMeta.color, letterSpacing: "0.08em",
          }}>
            {asset.category}
          </span>
          {linkedEntity && (
            <span style={{ fontSize: 11, color: "rgba(255,255,255,.4)" }}>→ {asset.entityName}</span>
          )}
          <div style={{ fontSize: 10, color: "rgba(255,255,255,.25)", fontFamily: "var(--font-m)" }}>
            ← → para navegar · ESC para fechar
          </div>
        </div>
      </div>

      {/* Close */}
      <button onClick={handleClose}
        style={{
          position: "fixed", top: 20, right: 20,
          width: 36, height: 36, borderRadius: "50%",
          background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.15)",
          color: "rgba(255,255,255,.6)", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all .15s",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(188,74,63,.3)"; e.currentTarget.style.color = "#fff"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.07)"; e.currentTarget.style.color = "rgba(255,255,255,.6)"; }}>
        <LucideIcon name="x" size={15} />
      </button>
    </div>
  );
}

/* ── Gallery Card ────────────────────────────────────────────── */
function GalleryCard({ asset, onClick }) {
  const [hovered, setHovered] = React.useState(false);
  const catMeta = CATEGORY_META[asset.category] || {};
  const paddingTop = (1 / asset.aspect) * 100;

  return (
    <div
      onClick={() => onClick(asset)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative", borderRadius: 14, overflow: "hidden", cursor: "pointer",
        border: `1px solid ${hovered ? asset.accent + "55" : "rgba(255,255,255,.07)"}`,
        boxShadow: hovered
          ? `0 0 0 1px ${asset.accent}22, 0 16px 40px rgba(0,0,0,.6), 0 0 30px ${asset.accent}14`
          : "0 4px 20px rgba(0,0,0,.4)",
        transform: hovered ? "translateY(-3px) scale(1.01)" : "none",
        transition: "all .22s cubic-bezier(.2,.65,.3,.9)",
      }}>

      {/* Aspect ratio box */}
      <div style={{ position: "relative", paddingTop: `${paddingTop}%` }}>
        <div style={{ position: "absolute", inset: 0 }}>
          {asset.realImage
            ? <img src={asset.realImage} alt={asset.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: "saturate(0.75) contrast(1.1) brightness(0.65)" }} />
            : <PlaceholderArt asset={asset} />
          }
        </div>

        {/* Featured badge */}
        {asset.featured && (
          <div style={{
            position: "absolute", top: 10, left: 10,
            background: "rgba(213,162,64,.15)", border: "1px solid rgba(213,162,64,.4)",
            borderRadius: 9999, padding: "3px 10px",
            fontSize: 9, fontWeight: 700, color: "#d5a240", letterSpacing: "0.12em",
          }}>DESTAQUE</div>
        )}

        {/* Hover overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(180deg, transparent 40%, rgba(6,7,12,.85) 100%)`,
          opacity: hovered ? 1 : 0.5,
          transition: "opacity .2s",
          display: "flex", flexDirection: "column", justifyContent: "flex-end",
          padding: "12px 14px",
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#f4efe7", lineHeight: 1.2, marginBottom: 4 }}>
            {asset.title}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              fontSize: 9, fontWeight: 700, color: catMeta.color, letterSpacing: "0.1em",
            }}>
              <LucideIcon name={catMeta.icon || "images"} size={9} color={catMeta.color} />
              {asset.category}
            </span>
            {asset.entityName && (
              <span style={{ fontSize: 9, color: "rgba(255,255,255,.35)" }}>→ {asset.entityName}</span>
            )}
          </div>
        </div>

        {/* Expand icon on hover */}
        {hovered && (
          <div style={{
            position: "absolute", top: 10, right: 10,
            width: 28, height: 28, borderRadius: 8,
            background: "rgba(6,7,12,.7)", border: "1px solid rgba(255,255,255,.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <LucideIcon name="eye" size={12} color="rgba(255,255,255,.7)" />
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Category filter bar ─────────────────────────────────────── */
function CategoryFilter({ active, onChange }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {VISUAL_CATEGORIES.map(cat => {
        const m = CATEGORY_META[cat];
        const count = cat === "Todos"
          ? VISUAL_ASSETS.length
          : VISUAL_ASSETS.filter(a => a.category === cat).length;
        const isActive = active === cat;
        return (
          <button key={cat} onClick={() => onChange(cat)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "7px 14px", borderRadius: 10, cursor: "pointer", fontFamily: "inherit",
              border: `1px solid ${isActive ? (m?.color + "55" || "rgba(255,255,255,.25)") : "rgba(255,255,255,.08)"}`,
              background: isActive ? (m?.color + "14" || "rgba(255,255,255,.06)") : "rgba(255,255,255,.03)",
              color: isActive ? (m?.color || "#f4efe7") : "rgba(255,255,255,.45)",
              fontSize: 11, fontWeight: isActive ? 700 : 400, transition: "all .15s",
              boxShadow: isActive ? `0 0 12px ${m?.color}22` : "none",
            }}>
            {m && <LucideIcon name={m.icon} size={11} color={isActive ? m.color : "rgba(255,255,255,.3)"} />}
            {cat}
            <span style={{ fontFamily: "var(--font-m)", fontSize: 9, opacity: 0.55 }}>{count}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ── Masonry grid ────────────────────────────────────────────── */
function MasonryGrid({ assets, onCardClick }) {
  // 3-column masonry using CSS columns
  return (
    <div style={{
      columns: "3 280px", columnGap: 12,
      padding: "16px 20px 24px",
    }}>
      {assets.map(asset => (
        <div key={asset.id} style={{ breakInside: "avoid", marginBottom: 12 }}>
          <GalleryCard asset={asset} onClick={onCardClick} />
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { MasonryGrid, Lightbox, CategoryFilter, PlaceholderArt });
