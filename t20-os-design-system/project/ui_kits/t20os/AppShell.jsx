// AppShell.jsx — Cockpit module views
// Depends on: Sidebar.jsx, Cards.jsx

const FAKE_ENTITIES = [
  { name: "Serafina Valdris", type: "Personagem", description: "Paladina de Khalmyr, filha do General Valdris. Lidera o grupo em missões de purificação.", accentFrom: "#4f7cff", accentTo: "#78d4ff" },
  { name: "Ordem da Chama", type: "Facção", description: "Irmandade secreta que venera o dragão Tenebra. Atua nas sombras de Valkaria.", accentFrom: "#bc4a3f", accentTo: "#f97316" },
  { name: "Valkaria", type: "Local", description: "Capital do Reinado. Centro político, mágico e comercial do mundo de Arton.", accentFrom: "#4b9f91", accentTo: "#67e8b8" },
  { name: "Batalha do Porto", type: "Evento", description: "Confronto que destruiu metade do porto de Valkaria e desapareceu com o Arcebispo.", accentFrom: "#d5a240", accentTo: "#fde047" },
  { name: "Trog Irontooth", type: "NPC", description: "Negociante anão com conexões duvidosas. Informante da guilda dos ladrões.", accentFrom: "#7b536d", accentTo: "#c084fc" },
  { name: "Grimório da Sombra", type: "Item", description: "Tomo mágico encontrado nas ruínas de Yuden. Conteúdo ainda não decifrado.", accentFrom: "#15b79e", accentTo: "#5eead4" },
];

const FAKE_SESSIONS = [
  { title: "A Noite das Lâminas", status: "Ativa", campaignName: "Crônicas de Arton", playerCount: 4, date: "Hoje" },
  { title: "O Porto em Chamas", status: "Encerrada", campaignName: "Crônicas de Arton", playerCount: 4, date: "15/04" },
  { title: "Conselho dos Arcanistas", status: "Preparação", campaignName: "Crônicas de Arton", playerCount: 4, date: "Em prep" },
];

const FAKE_COMBATANTS = [
  { name: "Serafina Valdris", type: "PJ", hp: 34, maxHp: 42, initiative: 18, ac: 18, status: "ativa" },
  { name: "Trog Irontooth", type: "PJ", hp: 28, maxHp: 36, initiative: 14, ac: 15, status: "ativa" },
  { name: "Kulthar Rex", type: "PJ", hp: 12, maxHp: 38, initiative: 11, ac: 16, status: "ferido" },
  { name: "Guarda Corrupto", type: "Inimigo", hp: 0, maxHp: 20, initiative: 9, ac: 13, status: "morto" },
  { name: "Guarda Corrupto 2", type: "Inimigo", hp: 8, maxHp: 20, initiative: 6, ac: 13, status: "ativa" },
  { name: "Capitão Sombrio", type: "Inimigo", hp: 40, maxHp: 55, initiative: 20, ac: 17, status: "ativa" },
];

function StatBadge({ label, value, color = "#b5aea4" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 10, padding: "8px 14px", minWidth: 60 }}>
      <div style={{ fontSize: 16, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 9, color: "#b5aea4", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 2 }}>{label}</div>
    </div>
  );
}

function HPBar({ current, max, color }) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100));
  const c = pct > 60 ? "#4b9f91" : pct > 25 ? "#d5a240" : "#bc4a3f";
  return (
    <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,.08)", borderRadius: 9999, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: c, borderRadius: 9999, transition: "width .3s" }} />
    </div>
  );
}

// ─── COCKPIT VIEW ─────────────────────────────────────────────────────────────
function CockpitView({ worldName }) {
  return (
    <div>
      <WorldHero style={{ marginBottom: 24 }}>
        <Eyebrow style={{ marginBottom: 10 }}>Cockpit do Mestre</Eyebrow>
        <h1 style={{ fontFamily: "'Cinzel',serif", fontSize: 36, fontWeight: 700, color: "#f4efe7", letterSpacing: "0.01em", marginBottom: 8 }}>{worldName}</h1>
        <p style={{ fontSize: 13, color: "rgba(244,239,231,.65)", lineHeight: 1.5, maxWidth: 480 }}>Mundo ativo com 3 campanhas, 14 entidades e 1 sessão em progresso. Último evento: A Noite das Lâminas.</p>
        <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
          <StatBadge label="Entidades" value={14} color="#d5a240" />
          <StatBadge label="Campanhas" value={3} color="#4b9f91" />
          <StatBadge label="Sessões" value={12} color="#b5aea4" />
          <StatBadge label="Eventos" value={38} color="#bc4a3f" />
        </div>
      </WorldHero>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {FAKE_SESSIONS.map((s, i) => <SessionCard key={i} {...s} />)}
        <CinematicFrame>
          <Eyebrow style={{ marginBottom: 8 }}>Acesso rápido</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {["Codex do Mundo", "Forja de Sessão", "Mesa ao Vivo"].map(m => (
              <div key={m} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#f4efe7", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#bc4a3f", flexShrink: 0 }} />
                {m}
              </div>
            ))}
          </div>
        </CinematicFrame>
      </div>
    </div>
  );
}

// ─── CODEX VIEW ───────────────────────────────────────────────────────────────
function CodexView() {
  const [search, setSearch] = React.useState("");
  const filtered = FAKE_ENTITIES.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.type.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Eyebrow style={{ marginBottom: 6 }}>Entidades conectadas</Eyebrow>
        <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: 28, fontWeight: 700, color: "#f4efe7", letterSpacing: "0.02em", textTransform: "uppercase", marginBottom: 16 }}>Codex do Mundo</h2>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar entidades…"
          style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 12, color: "#f4efe7", fontFamily: "inherit", fontSize: 13, padding: "10px 14px", width: "100%", outline: "none", boxSizing: "border-box" }}
        />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        {filtered.map((e, i) => <EntityCard key={i} {...e} />)}
      </div>
    </div>
  );
}

// ─── FORGE VIEW ───────────────────────────────────────────────────────────────
function ForgeView() {
  const [step, setStep] = React.useState(0);
  const stages = ["Faísca", "Estrutura", "Cenas", "Reveals", "Finalizar"];
  return (
    <div>
      <Eyebrow style={{ marginBottom: 6 }}>Prep orientado a mesa</Eyebrow>
      <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: 28, fontWeight: 700, color: "#f4efe7", letterSpacing: "0.02em", textTransform: "uppercase", marginBottom: 20 }}>Forja de Sessão</h2>
      <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
        {stages.map((s, i) => (
          <button key={s} onClick={() => setStep(i)} style={{ flex: 1, padding: "8px 0", borderRadius: 10, border: `1px solid ${i === step ? "rgba(188,74,63,.4)" : "rgba(255,255,255,.08)"}`, background: i === step ? "rgba(188,74,63,.15)" : "rgba(255,255,255,.03)", color: i === step ? "#bc4a3f" : "#b5aea4", fontSize: 12, fontWeight: i === step ? 600 : 400, cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}>{s}</button>
        ))}
      </div>
      <ChromePanel>
        {step === 0 && (
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#f4efe7", marginBottom: 12 }}>Faísca da sessão</div>
            <div style={{ fontSize: 13, color: "#b5aea4", marginBottom: 16 }}>Capture a ideia central. Qual é o arco emocional da sessão? Qual é o objetivo oculto?</div>
            <textarea rows={4} placeholder="O grupo descobre que o capitão da guarda é membro da Ordem da Chama…" style={{ width: "100%", background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, color: "#f4efe7", fontFamily: "inherit", fontSize: 13, padding: 12, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
            <button onClick={() => setStep(1)} style={{ marginTop: 12, padding: "9px 20px", borderRadius: 10, background: "#bc4a3f", border: "none", color: "#fff9f2", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Continuar →</button>
          </div>
        )}
        {step === 1 && (
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#f4efe7", marginBottom: 12 }}>Estrutura da sessão</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {["Abertura: O porto em alerta", "Escalada: Interrogatório do informante", "Clímax: Confronto com o Capitão Sombrio", "Resolução: Fuga pelo portal mágico"].map((b, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 10 }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(188,74,63,.2)", border: "1px solid rgba(188,74,63,.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#bc4a3f", fontWeight: 700, flexShrink: 0 }}>{i+1}</div>
                  <span style={{ fontSize: 13, color: "#f4efe7" }}>{b}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {step >= 2 && (
          <div style={{ textAlign: "center", padding: 32 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚒</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#f4efe7", marginBottom: 8 }}>Etapa "{stages[step]}"</div>
            <div style={{ fontSize: 13, color: "#b5aea4" }}>Esta etapa estará disponível na próxima atualização.</div>
          </div>
        )}
      </ChromePanel>
    </div>
  );
}

// ─── LIVE TABLE VIEW ──────────────────────────────────────────────────────────
function LiveView() {
  const [turn, setTurn] = React.useState(0);
  const sorted = [...FAKE_COMBATANTS].sort((a, b) => b.initiative - a.initiative);
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <Eyebrow style={{ marginBottom: 6 }}>Cockpit em tempo real</Eyebrow>
          <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: 28, fontWeight: 700, color: "#f4efe7", letterSpacing: "0.02em", textTransform: "uppercase" }}>Mesa ao Vivo</h2>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ display: "inline-flex", border: "1px solid rgba(75,159,145,.3)", background: "rgba(75,159,145,.1)", borderRadius: 9999, padding: "4px 12px", fontSize: 11, fontWeight: 600, color: "rgba(75,159,145,.9)", alignItems: "center", gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4b9f91", animation: "pulse 1.5s infinite" }} />
            Sessão ativa
          </div>
          <div style={{ display: "inline-flex", border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.05)", borderRadius: 9999, padding: "4px 12px", fontSize: 11, color: "#b5aea4", alignItems: "center" }}>
            Rodada 3
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 360px" }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(245,221,177,.78)", marginBottom: 10 }}>Iniciativa</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {sorted.map((c, i) => {
              const isActive = i === (turn % sorted.length);
              const isDead = c.status === "morto";
              const hpPct = c.hp / c.maxHp;
              return (
                <div key={c.name} onClick={() => !isDead && setTurn(i)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 14, border: `1px solid ${isActive ? "rgba(188,74,63,.35)" : "rgba(255,255,255,.07)"}`, background: isActive ? "rgba(188,74,63,.1)" : "rgba(255,255,255,.025)", opacity: isDead ? 0.4 : 1, cursor: isDead ? "default" : "pointer", transition: "all .15s", boxShadow: isActive ? "0 0 18px rgba(188,74,63,.15)" : "none" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: c.type === "PJ" ? "rgba(79,124,255,.2)" : "rgba(188,74,63,.2)", border: `1px solid ${c.type === "PJ" ? "rgba(79,124,255,.4)" : "rgba(188,74,63,.4)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: c.type === "PJ" ? "#78d4ff" : "#bc4a3f", flexShrink: 0 }}>{c.initiative}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: isDead ? "#b5aea4" : "#f4efe7", textDecoration: isDead ? "line-through" : "none" }}>{c.name}</span>
                      <span style={{ fontSize: 10, color: "#b5aea4" }}>{c.type}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                      <HPBar current={c.hp} max={c.maxHp} />
                      <span style={{ fontSize: 10, color: "#b5aea4", whiteSpace: "nowrap" }}>{c.hp}/{c.maxHp}</span>
                      <span style={{ fontSize: 10, color: "#b5aea4", marginLeft: 4 }}>CA {c.ac}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <button onClick={() => setTurn(t => t + 1)} style={{ marginTop: 14, width: "100%", padding: "10px 0", borderRadius: 12, background: "rgba(188,74,63,.15)", border: "1px solid rgba(188,74,63,.3)", color: "#bc4a3f", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Próximo turno →</button>
        </div>
        <div style={{ flex: "0 0 240px" }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(245,221,177,.78)", marginBottom: 10 }}>Scratchpad</div>
          <CinematicFrame style={{ padding: 14 }}>
            <textarea rows={8} defaultValue={"- Capitão tem chave do cofre\n- Serafina está envenenada (3 turnos)\n- Portal se fecha em 5 rodadas\n- NPC Trog escondido no beco"} style={{ width: "100%", background: "transparent", border: "none", color: "#f4efe7", fontFamily: "inherit", fontSize: 12, lineHeight: 1.6, outline: "none", resize: "none", boxSizing: "border-box" }} />
          </CinematicFrame>
        </div>
      </div>
    </div>
  );
}

// ─── MEMORY VIEW ──────────────────────────────────────────────────────────────
function MemoryView() {
  const events = [
    { date: "23 Abr", session: "Sessão 12", title: "Batalha do Porto — desfecho", desc: "O grupo derrotou o Capitão Sombrio. Porto parcialmente destruído. Trog desapareceu.", type: "Combate" },
    { date: "15 Abr", session: "Sessão 11", title: "Informação sobre a Ordem", desc: "Serafina descobriu que a Ordem da Chama controla metade da guarda de Valkaria.", type: "Narrativa" },
    { date: "02 Abr", session: "Sessão 10", title: "Chegada a Valkaria", desc: "Grupo chegou à capital. Primeira reunião com o Conselho dos Arcanistas.", type: "Exploração" },
    { date: "18 Mar", session: "Sessão 9", title: "O Grimório encontrado", desc: "Ruínas de Yuden revelaram o Grimório da Sombra. Origem ainda desconhecida.", type: "Descoberta" },
  ];
  const typeColors = { "Combate": "#bc4a3f", "Narrativa": "#4b9f91", "Exploração": "#d5a240", "Descoberta": "#9b7f56" };
  return (
    <div>
      <Eyebrow style={{ marginBottom: 6 }}>Continuidade narrativa</Eyebrow>
      <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: 28, fontWeight: 700, color: "#f4efe7", letterSpacing: "0.02em", textTransform: "uppercase", marginBottom: 24 }}>Memória do Mundo</h2>
      <div style={{ position: "relative", paddingLeft: 24 }}>
        <div style={{ position: "absolute", left: 6, top: 0, bottom: 0, width: 1, background: "linear-gradient(180deg,rgba(188,74,63,.5),rgba(188,74,63,.1))" }} />
        {events.map((e, i) => (
          <div key={i} style={{ position: "relative", marginBottom: 20, paddingLeft: 16 }}>
            <div style={{ position: "absolute", left: -22, top: 4, width: 10, height: 10, borderRadius: "50%", background: typeColors[e.type] || "#bc4a3f", border: "2px solid #06070c" }} />
            <CinematicFrame style={{ padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 10, color: "#b5aea4" }}>{e.date}</span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,.2)" }}>·</span>
                <span style={{ fontSize: 10, color: "#b5aea4" }}>{e.session}</span>
                <div style={{ marginLeft: "auto", display: "inline-flex", border: `1px solid ${typeColors[e.type]}44`, background: `${typeColors[e.type]}15`, borderRadius: 9999, padding: "1px 8px", fontSize: 9, fontWeight: 600, color: typeColors[e.type], letterSpacing: "0.06em", textTransform: "uppercase" }}>{e.type}</div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#f4efe7", marginBottom: 4 }}>{e.title}</div>
              <div style={{ fontSize: 12, color: "#b5aea4", lineHeight: 1.5 }}>{e.desc}</div>
            </CinematicFrame>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { CockpitView, CodexView, ForgeView, LiveView, MemoryView });
