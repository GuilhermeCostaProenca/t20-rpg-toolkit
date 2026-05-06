// LandingPage.jsx — T20 OS Marketing Landing Page

const FEATURES = [
  { id: "codex", title: "Codex vivo de mundo", eyebrow: "Entidades conectadas", desc: "Personagens, facções, lugares e eventos em um mesmo domínio com histórico navegável.", from: "#4f7cff", to: "#78d4ff" },
  { id: "forge", title: "Forja de sessão", eyebrow: "Prep orientado a mesa", desc: "Transforme ideias em cenas, subcenas, beats e reveals prontos para uso ao vivo.", from: "#15b79e", to: "#67e8b8" },
  { id: "live", title: "Mesa ao Vivo", eyebrow: "Cockpit em tempo real", desc: "Ritmo de cena, combat tracker, quick inspect e operação visual sem trocar de contexto.", from: "#e879f9", to: "#fda4af" },
  { id: "memory", title: "Memória de mundo", eyebrow: "Continuidade narrativa", desc: "Eventos, mudanças persistentes e busca transversal para manter consequência entre sessões.", from: "#f59e0b", to: "#fde047" },
  { id: "balance", title: "Balanceamento T20", eyebrow: "Sinal tático acionável", desc: "Leitura de pressão e ajuste rápido com foco em tensão dramática e segurança de mesa.", from: "#f97316", to: "#fb7185" },
];

const STAGES = [
  { n: "01", title: "Da faísca ao eixo da campanha", text: "Capture a ideia inicial, conecte entidades centrais e defina o tom sem perder velocidade." },
  { n: "02", title: "Da preparação para a mesa", text: "Consolide cenas, objetivos e reveals para operar a sessão com clareza sob pressão." },
  { n: "03", title: "Da sessão para memória durável", text: "Feche o ciclo com consequência persistente e material pronto para o próximo encontro." },
];

function LandingNav({ onEnter }) {
  return (
    <nav style={{ position: "fixed", top: 16, left: 0, right: 0, zIndex: 50, display: "flex", justifyContent: "center" }}>
      <div style={{ width: "min(1100px, calc(100vw - 28px))", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px", borderRadius: 20, border: "1px solid rgba(255,255,255,.1)", background: "linear-gradient(140deg,rgba(7,10,18,.88),rgba(9,15,30,.76))", backdropFilter: "blur(20px)" }}>
        <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.18em", color: "#ffffff" }}>T20 OS</span>
        <div style={{ display: "flex", gap: 24, fontSize: 12, color: "rgba(255,255,255,.7)" }}>
          <a href="#features" style={{ textDecoration: "none", color: "inherit" }}>Plataforma</a>
          <a href="#flow" style={{ textDecoration: "none", color: "inherit" }}>Fluxo</a>
          <a href="#cta" style={{ textDecoration: "none", color: "inherit" }}>Testar</a>
        </div>
        <button onClick={onEnter} style={{ borderRadius: 12, border: "1px solid rgba(255,255,255,.25)", background: "#ffffff", color: "#000", padding: "7px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "transform .2s" }} onMouseEnter={e => e.target.style.transform="translateY(-2px)"} onMouseLeave={e => e.target.style.transform=""}>
          Abrir cockpit
        </button>
      </div>
    </nav>
  );
}

function LandingHero({ onEnter }) {
  return (
    <section style={{ position: "relative", minHeight: "100vh", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* Map background */}
      <div style={{ position: "absolute", inset: 0 }}>
        <img src="../../assets/arton-map.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: .18, filter: "saturate(1.2) contrast(1.1) brightness(.7)" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 22% 18%,rgba(129,170,255,.2),transparent 36%),linear-gradient(180deg,rgba(2,3,8,.2) 0%,rgba(2,4,12,.9) 74%,rgba(1,1,3,.99) 100%)" }} />
      </div>
      <div style={{ position: "relative", textAlign: "center", padding: "120px 24px 80px", maxWidth: 960, margin: "0 auto" }}>
        {/* Badge */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 9999, border: "1px solid rgba(100,200,255,.4)", background: "rgba(100,200,255,.1)", padding: "4px 14px", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(165,230,255,.9)", marginBottom: 24 }}>
          <span style={{ background: "rgba(188,74,63,.9)", borderRadius: 9999, padding: "2px 8px", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em" }}>NOVO</span>
          <span style={{ color: "rgba(255,255,255,.75)" }}>Rework premium · Versão cockpit</span>
        </div>
        <h1 style={{ fontFamily: "'Cinzel',serif", fontSize: "clamp(32px,5vw,64px)", fontWeight: 700, lineHeight: .95, color: "#ffffff", marginBottom: 24 }}>
          Um cockpit de fantasia<br />para mestres que levam<br />o mundo a sério
        </h1>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,.7)", lineHeight: 1.65, maxWidth: 560, margin: "0 auto 32px" }}>
          Crie, prepare e opere campanhas Tormenta 20 em um fluxo único: do worldbuilding até a mesa ao vivo.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap", marginBottom: 28 }}>
          <button onClick={onEnter} style={{ borderRadius: 14, background: "#ffffff", border: "none", color: "#000", padding: "11px 28px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "transform .2s" }} onMouseEnter={e => e.target.style.transform="translateY(-2px)"} onMouseLeave={e => e.target.style.transform=""}>
            Entrar no cockpit
          </button>
          <a href="#features" style={{ borderRadius: 14, border: "1px solid rgba(255,255,255,.28)", background: "rgba(255,255,255,.08)", color: "rgba(255,255,255,.9)", padding: "11px 28px", fontSize: 13, fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
            Explorar plataforma
          </a>
        </div>
        {/* Social proof pill */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 9999, border: "1px solid rgba(255,255,255,.15)", background: "rgba(0,0,0,.35)", padding: "7px 16px", fontSize: 11, color: "rgba(255,255,255,.65)" }}>
          <span style={{ display: "inline-flex" }}>
            {["#4ade80","#67e8f9","#fbbf24"].map((c,i) => (
              <span key={i} style={{ width: 20, height: 20, borderRadius: "50%", background: c, border: "2px solid rgba(0,0,0,.5)", marginLeft: i ? -6 : 0, display: "inline-block" }} />
            ))}
          </span>
          <span>Operação testada para campanhas longas e mesa intensa</span>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section id="features" style={{ padding: "80px 24px", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 56 }}>
        <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(245,221,177,.78)", marginBottom: 12 }}>O sistema operacional do mestre</div>
        <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: "clamp(24px,3vw,40px)", fontWeight: 700, color: "#f4efe7", letterSpacing: "0.02em", textTransform: "uppercase" }}>Cinco frentes. Um cockpit.</h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>
        {FEATURES.map(f => (
          <div key={f.id} style={{ position: "relative", overflow: "hidden", border: "1px solid rgba(255,255,255,.07)", borderRadius: 20, background: "linear-gradient(180deg,rgba(15,14,20,.9),rgba(10,10,16,.86)),radial-gradient(circle at top left,rgba(188,74,63,.08),transparent 36%)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.04),0 18px 70px rgba(0,0,0,.4)", padding: 24, transition: "border-color .2s" }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg,${f.from}22,${f.to}15)`, border: `1px solid ${f.from}44`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <div style={{ width: 16, height: 2, borderRadius: 9999, background: `linear-gradient(90deg,${f.from},${f.to})` }} />
            </div>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: `${f.from}`, marginBottom: 8 }}>{f.eyebrow}</div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: "#f4efe7", letterSpacing: "0.01em", marginBottom: 10 }}>{f.title}</h3>
            <p style={{ fontSize: 13, color: "#b5aea4", lineHeight: 1.6 }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FlowSection() {
  return (
    <section id="flow" style={{ padding: "80px 24px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 56 }}>
        <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(245,221,177,.78)", marginBottom: 12 }}>Ciclo completo de jogo</div>
        <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: "clamp(24px,3vw,36px)", fontWeight: 700, color: "#f4efe7", letterSpacing: "0.02em", textTransform: "uppercase" }}>Do começo ao fim. E de volta.</h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 16 }}>
        {STAGES.map(s => (
          <div key={s.n} style={{ border: "1px solid rgba(255,255,255,.07)", borderRadius: 20, padding: 28, background: "linear-gradient(145deg,rgba(8,8,13,.9),rgba(12,10,13,.8)),radial-gradient(circle at top left,rgba(188,74,63,.1),transparent 40%)" }}>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 36, fontWeight: 900, color: "rgba(188,74,63,.25)", letterSpacing: "0.04em", marginBottom: 12 }}>{s.n}</div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#f4efe7", letterSpacing: "0.01em", marginBottom: 10 }}>{s.title}</h3>
            <p style={{ fontSize: 13, color: "#b5aea4", lineHeight: 1.6 }}>{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CTASection({ onEnter }) {
  return (
    <section id="cta" style={{ padding: "80px 24px 40px", maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
      <div style={{ border: "1px solid rgba(255,255,255,.08)", borderRadius: 28, background: "linear-gradient(120deg,rgba(8,8,13,.9),rgba(12,10,13,.78)),radial-gradient(circle at top left,rgba(188,74,63,.28),transparent 30%),radial-gradient(circle at 78% 0%,rgba(213,162,64,.18),transparent 28%)", boxShadow: "0 28px 90px rgba(0,0,0,.48),inset 0 1px 0 rgba(255,255,255,.05)", padding: "52px 40px" }}>
        <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(245,221,177,.78)", marginBottom: 16 }}>Comece agora</div>
        <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: "clamp(24px,3vw,36px)", fontWeight: 700, color: "#f4efe7", marginBottom: 16 }}>O cockpit está pronto.</h2>
        <p style={{ fontSize: 14, color: "#b5aea4", lineHeight: 1.65, maxWidth: 420, margin: "0 auto 32px" }}>Mestre, sua próxima campanha merece uma base de operação à altura do mundo que você está construindo.</p>
        <button onClick={onEnter} style={{ borderRadius: 14, background: "#bc4a3f", border: "none", color: "#fff9f2", padding: "13px 36px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 10px 34px rgba(188,74,63,.35)", transition: "transform .2s" }} onMouseEnter={e => e.target.style.transform="translateY(-2px)"} onMouseLeave={e => e.target.style.transform=""}>
          Entrar no cockpit →
        </button>
      </div>
    </section>
  );
}

function LandingFooter() {
  return (
    <footer style={{ borderTop: "1px solid rgba(255,255,255,.08)", background: "#04070d" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, padding: "24px", maxWidth: 1100, margin: "0 auto", fontSize: 12, color: "rgba(255,255,255,.55)" }}>
        <p>T20 OS · World-first toolkit para mestres Tormenta 20</p>
        <div style={{ display: "flex", gap: 20 }}>
          <a href="#features" style={{ color: "inherit", textDecoration: "none" }}>Plataforma</a>
          <a href="#cta" style={{ color: "inherit", textDecoration: "none" }}>Começar</a>
        </div>
      </div>
    </footer>
  );
}

function LandingPage({ onEnter }) {
  return (
    <div>
      <LandingNav onEnter={onEnter} />
      <LandingHero onEnter={onEnter} />
      <FeaturesSection />
      <FlowSection />
      <CTASection onEnter={onEnter} />
      <LandingFooter />
    </div>
  );
}

Object.assign(window, { LandingPage });
