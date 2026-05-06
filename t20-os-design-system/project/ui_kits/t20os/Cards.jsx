// Cards.jsx — T20 OS Card primitives
// Exported to window

function ChromePanel({ children, style = {} }) {
  return (
    <div style={{
      position: "relative", overflow: "hidden",
      border: "1px solid rgba(255,255,255,.08)",
      borderRadius: 24, padding: 20,
      background: "linear-gradient(160deg,rgba(255,250,244,.045),rgba(255,255,255,.02) 40%,rgba(188,74,63,.06) 100%),linear-gradient(145deg,rgba(188,74,63,.08),transparent 42%,rgba(192,149,71,.1) 100%)",
      boxShadow: "0 20px 80px rgba(0,0,0,.55)",
      backdropFilter: "blur(20px)",
      ...style
    }}>{children}</div>
  );
}

function CinematicFrame({ children, style = {} }) {
  return (
    <div style={{
      position: "relative", overflow: "hidden",
      border: "1px solid rgba(255,255,255,.08)",
      borderRadius: 16,
      background: "linear-gradient(180deg,rgba(15,14,20,.9),rgba(10,10,16,.86)), radial-gradient(circle at top left,rgba(188,74,63,.12),transparent 36%)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,.05), 0 18px 70px rgba(0,0,0,.42)",
      padding: 20,
      ...style
    }}>{children}</div>
  );
}

function WorldHero({ children, style = {} }) {
  return (
    <div style={{
      position: "relative", overflow: "hidden",
      border: "1px solid rgba(255,255,255,.08)",
      borderRadius: 20,
      background: "linear-gradient(120deg,rgba(8,8,13,.9),rgba(12,10,13,.78)), radial-gradient(circle at top left,rgba(188,74,63,.34),transparent 30%), radial-gradient(circle at 78% 0%,rgba(213,162,64,.22),transparent 28%)",
      boxShadow: "0 28px 90px rgba(0,0,0,.48), inset 0 1px 0 rgba(255,255,255,.05)",
      padding: 28,
      ...style
    }}>{children}</div>
  );
}

function Eyebrow({ children, style = {} }) {
  return <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(245,221,177,.78)", ...style }}>{children}</div>;
}

function EntityCard({ name, type, description, accentFrom = "#4f7cff", accentTo = "#78d4ff" }) {
  return (
    <CinematicFrame style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ height: 4, background: `linear-gradient(90deg, ${accentFrom}, ${accentTo})` }} />
      <div style={{ padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${accentFrom}33, ${accentTo}22)`, border: `1px solid ${accentFrom}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: accentFrom, fontWeight: 700 }}>{name[0]}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#f4efe7" }}>{name}</div>
            <div style={{ fontSize: 10, color: "#b5aea4", letterSpacing: "0.06em", textTransform: "uppercase" }}>{type}</div>
          </div>
        </div>
        <div style={{ fontSize: 12, color: "#b5aea4", lineHeight: 1.5 }}>{description}</div>
      </div>
    </CinematicFrame>
  );
}

function SessionCard({ title, status, campaignName, playerCount, date }) {
  const statusColors = { "Ativa": "#4b9f91", "Preparação": "#d5a240", "Encerrada": "#b5aea4" };
  const c = statusColors[status] || "#b5aea4";
  return (
    <CinematicFrame>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <Eyebrow style={{ marginBottom: 6 }}>{campaignName}</Eyebrow>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#f4efe7", letterSpacing: "0.01em" }}>{title}</div>
          <div style={{ marginTop: 8, fontSize: 12, color: "#b5aea4", display: "flex", gap: 12 }}>
            <span>{playerCount} jogadores</span>
            <span>·</span>
            <span>{date}</span>
          </div>
        </div>
        <div style={{ display: "inline-flex", border: `1px solid ${c}44`, background: `${c}15`, borderRadius: 9999, padding: "3px 10px", fontSize: 10, fontWeight: 600, color: c, whiteSpace: "nowrap" }}>{status}</div>
      </div>
    </CinematicFrame>
  );
}

Object.assign(window, { ChromePanel, CinematicFrame, WorldHero, Eyebrow, EntityCard, SessionCard });
