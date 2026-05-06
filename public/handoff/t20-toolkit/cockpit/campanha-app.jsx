// campanha-app.jsx — Cockpit de Campanha

const { useState } = React;

function CampanhaHeader() {
  return (
    <div style={{
      padding:"22px 28px 20px", borderBottom:"1px solid var(--border)",
      background:"linear-gradient(180deg,rgba(188,74,63,.06),transparent 70%)",
      display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap:24,
    }}>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
          <span style={{ fontSize:9, letterSpacing:".24em", textTransform:"uppercase", color:"var(--gold)", fontWeight:700 }}>Cockpit de Campanha</span>
          <span style={{ fontSize:9, color:"rgba(255,255,255,.3)" }}>·</span>
          <span style={{ fontSize:10, color:"var(--muted)" }}>{CAMPANHA.mundo}</span>
        </div>
        <h1 style={{ fontFamily:"var(--font-d)", fontWeight:900, fontSize:32, color:"var(--fg)", letterSpacing:"-.01em", marginBottom:6 }}>{CAMPANHA.nome}</h1>
        <div style={{ display:"flex", alignItems:"center", gap:14, fontSize:11, color:"var(--muted)" }}>
          <span style={{ display:"inline-flex", alignItems:"center", gap:5 }}>
            <LucideIcon name="bookmark" size={11} color="var(--gold)" />
            {CAMPANHA.arco}
          </span>
          <span>·</span>
          <span>Sessão {CAMPANHA.sessoesRealizadas} de {CAMPANHA.sessoesPlanejadas}</span>
          <span>·</span>
          <span style={{ display:"inline-flex", alignItems:"center", gap:5, color:"#7fb3a3" }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:"#4b9f91", boxShadow:"0 0 6px #4b9f91" }}/>
            {CAMPANHA.status}
          </span>
        </div>
      </div>
      <div style={{ display:"flex", gap:10 }}>
        <button style={btnGhost}>
          <LucideIcon name="book-marked" size={13}/> Memória
        </button>
        <button style={btnPrimary}>
          <LucideIcon name="presentation" size={13}/> Iniciar Sessão {PROXIMA_SESSAO.numero}
        </button>
      </div>
    </div>
  );
}

function ElencoCard({ pj }) {
  const hpPct = Math.round((pj.hp[0]/pj.hp[1])*100);
  const statusColor = pj.status==="saudável" ? "#7fb3a3" : pj.status==="ferida" ? "#e8b04f" : "#bc4a3f";
  return (
    <div style={{
      padding:"14px 14px 12px", borderRadius:12, border:"1px solid var(--border)",
      background:"rgba(255,255,255,.02)", display:"flex", flexDirection:"column", gap:10,
      transition:"all .15s", cursor:"pointer",
    }}
    onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(213,162,64,.3)"; e.currentTarget.style.background="rgba(213,162,64,.04)"}}
    onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)"; e.currentTarget.style.background="rgba(255,255,255,.02)"}}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8 }}>
        <div style={{ minWidth:0, flex:1 }}>
          <div style={{ fontSize:13, fontWeight:700, color:"var(--fg)", marginBottom:2 }}>{pj.nome}</div>
          <div style={{ fontSize:10, color:"var(--muted)" }}>{pj.classe} · Nv {pj.nivel} · {pj.jogador}</div>
        </div>
        <span style={{ fontSize:9, padding:"2px 7px", borderRadius:9999, background:"rgba(255,255,255,.04)", border:`1px solid ${statusColor}33`, color:statusColor, textTransform:"capitalize", whiteSpace:"nowrap" }}>{pj.status}</span>
      </div>
      <div>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"var(--muted)", marginBottom:4 }}>
          <span>HP {pj.hp[0]}/{pj.hp[1]}</span>
          <span>CA {pj.ca}</span>
        </div>
        <div style={{ height:4, borderRadius:2, background:"rgba(255,255,255,.05)", overflow:"hidden" }}>
          <div style={{ width:`${hpPct}%`, height:"100%", background:`linear-gradient(90deg, ${hpPct>60?"#4b9f91":hpPct>30?"#e8b04f":"#bc4a3f"}, ${hpPct>60?"#7fb3a3":hpPct>30?"#d5a240":"#e06155"})` }}/>
        </div>
      </div>
      <div style={{ fontSize:10, color:"rgba(245,221,177,.65)", fontStyle:"italic" }}>{pj.destaque}</div>
    </div>
  );
}

function ProximaSessaoBlock() {
  const s = PROXIMA_SESSAO;
  const tipoColor = { narrativa:"#a87fc4", combate:"#bc4a3f", exploração:"#e8b04f" };
  return (
    <div style={panelStyle}>
      <div style={panelHeader}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <LucideIcon name="calendar-days" size={14} color="var(--gold)"/>
          <span style={panelTitle}>Próxima Sessão</span>
        </div>
        <span style={{ fontSize:10, color:"var(--muted)" }}>{CAMPANHA.proximaSessaoData}</span>
      </div>

      <div style={{ padding:"14px 18px 6px" }}>
        <div style={{ fontSize:11, color:"var(--gold)", fontWeight:600, letterSpacing:".06em", marginBottom:3 }}>SESSÃO {s.numero}</div>
        <div style={{ fontSize:18, fontFamily:"var(--font-d)", fontWeight:700, color:"var(--fg)", marginBottom:10 }}>{s.titulo}</div>
        <div style={{ display:"flex", gap:18, fontSize:11, color:"var(--muted)" }}>
          <span><b style={{ color:"var(--fg)" }}>{s.cenas}</b> cenas</span>
          <span><b style={{ color:"var(--fg)" }}>{s.reveals}</b> reveals</span>
          <span><b style={{ color:"var(--fg)" }}>{s.encontrosPrep}</b> encontros</span>
        </div>
      </div>

      <div style={{ padding:"14px 18px 12px", borderTop:"1px solid var(--border)" }}>
        <div style={{ fontSize:9, fontWeight:700, letterSpacing:".18em", color:"rgba(245,221,177,.55)", textTransform:"uppercase", marginBottom:8 }}>Beats da sessão</div>
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {s.beats.map((b,i)=>(
            <div key={b.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"7px 10px", borderRadius:8, background:"rgba(255,255,255,.02)", border:"1px solid rgba(255,255,255,.04)" }}>
              <span style={{ fontSize:9, color:"rgba(255,255,255,.3)", fontFamily:"var(--font-m)", width:14 }}>{i+1}</span>
              <span style={{ width:6, height:6, borderRadius:"50%", background:tipoColor[b.tipo] }}/>
              <span style={{ flex:1, fontSize:12, color:"var(--fg)" }}>{b.titulo}</span>
              <span style={{ fontSize:10, color:"var(--muted)", fontFamily:"var(--font-m)" }}>{b.duracao}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding:"12px 18px 16px", borderTop:"1px solid var(--border)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
          <span style={{ fontSize:9, fontWeight:700, letterSpacing:".18em", color:"rgba(245,221,177,.55)", textTransform:"uppercase" }}>Prontidão</span>
          <span style={{ fontSize:11, color:s.prontidao>=80?"#7fb3a3":"#e8b04f", fontWeight:700, fontFamily:"var(--font-m)" }}>{s.prontidao}%</span>
        </div>
        <div style={{ height:5, borderRadius:3, background:"rgba(255,255,255,.05)", overflow:"hidden", marginBottom:10 }}>
          <div style={{ width:`${s.prontidao}%`, height:"100%", background:`linear-gradient(90deg, ${s.prontidao>=80?"#4b9f91":"#e8b04f"}, ${s.prontidao>=80?"#7fb3a3":"#d5a240"})` }}/>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
          {s.checklist.map(c=>(
            <div key={c.id} style={{ display:"flex", alignItems:"center", gap:8, fontSize:11, color:c.feito?"var(--muted)":"var(--fg)" }}>
              <LucideIcon name={c.feito?"check-circle":"circle"} size={11} color={c.feito?"#4b9f91":"rgba(255,255,255,.3)"}/>
              <span style={{ textDecoration:c.feito?"line-through":"none" }}>{c.label}</span>
            </div>
          ))}
        </div>
        <button style={{ ...btnPrimary, width:"100%", marginTop:14, justifyContent:"center" }}>
          <LucideIcon name="play" size={12}/> Abrir Forja de Sessão
        </button>
      </div>
    </div>
  );
}

function EncontrosBlock() {
  const riscoColor = { alto:"#bc4a3f", médio:"#e8b04f", baixo:"#7fb3a3" };
  return (
    <div style={panelStyle}>
      <div style={panelHeader}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <LucideIcon name="swords" size={14} color="var(--red)"/>
          <span style={panelTitle}>Encontros Preparados</span>
        </div>
        <button style={miniBtn}>+ Novo</button>
      </div>
      <div style={{ padding:"10px 12px 14px", display:"flex", flexDirection:"column", gap:6 }}>
        {ENCONTROS_PREP.map(e=>(
          <div key={e.id} style={{
            padding:"10px 12px", borderRadius:10, border:"1px solid var(--border)",
            background:"rgba(255,255,255,.02)", display:"flex", alignItems:"center", gap:10,
          }}>
            <div style={{ width:3, height:36, borderRadius:2, background:riscoColor[e.risco] }}/>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:12, fontWeight:600, color:"var(--fg)" }}>{e.titulo}</div>
              <div style={{ fontSize:10, color:"var(--muted)", marginTop:2 }}>
                {e.cr} · {e.ameacas} ameaças{e.suporte>0?` · ${e.suporte} apoio`:""}
              </div>
            </div>
            {e.pronto ? (
              <span style={{ fontSize:9, padding:"2px 7px", borderRadius:9999, background:"rgba(75,159,145,.1)", border:"1px solid rgba(75,159,145,.3)", color:"#7fb3a3" }}>pronto</span>
            ) : (
              <span style={{ fontSize:9, padding:"2px 7px", borderRadius:9999, background:"rgba(232,176,79,.08)", border:"1px solid rgba(232,176,79,.25)", color:"#e8b04f" }}>rascunho</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function MemoriaBlock() {
  const tipoColor = { narrativa:"#a87fc4", combate:"#bc4a3f", política:"#5b8fc4", descoberta:"#e8b04f" };
  return (
    <div style={panelStyle}>
      <div style={panelHeader}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <LucideIcon name="book-marked" size={14} color="#5b8fc4"/>
          <span style={panelTitle}>Memória da Campanha</span>
        </div>
        <button style={miniBtn}>Ver tudo</button>
      </div>
      <div style={{ padding:"4px 14px 14px" }}>
        {MEMORIA_RECENTE.map((m,i)=>(
          <div key={m.id} style={{
            display:"flex", gap:10, padding:"9px 0",
            borderBottom: i<MEMORIA_RECENTE.length-1 ? "1px solid rgba(255,255,255,.04)" : "none",
          }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
              <span style={{ fontSize:9, color:"var(--muted)", fontFamily:"var(--font-m)" }}>S{m.sessao}</span>
              <span style={{ width:6, height:6, borderRadius:"50%", background:tipoColor[m.tipo] }}/>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:12, color:"var(--fg)", marginBottom:2 }}>{m.evento}</div>
              <div style={{ fontSize:10, color:"var(--muted)", textTransform:"capitalize" }}>
                {m.tipo} · impacto {m.impacto}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BalancoBlock() {
  return (
    <div style={panelStyle}>
      <div style={panelHeader}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <LucideIcon name="scale" size={14} color="#e8b04f"/>
          <span style={panelTitle}>Balanceamento</span>
        </div>
        <span style={{ fontSize:9, padding:"2px 8px", borderRadius:9999, background:"rgba(232,176,79,.08)", border:"1px solid rgba(232,176,79,.25)", color:"#e8b04f", textTransform:"capitalize" }}>{BALANCO.riscoSessao}</span>
      </div>
      <div style={{ padding:"14px 18px 16px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
          <Gauge label="Pressão" value={BALANCO.pressaoAtual} color="#bc4a3f"/>
          <Gauge label="Recursos" value={BALANCO.recursosGrupo} color="#4b9f91"/>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {BALANCO.alertas.map((a,i)=>(
            <div key={i} style={{
              padding:"8px 10px", borderRadius:8,
              background: a.tipo==="warn" ? "rgba(232,176,79,.06)" : "rgba(91,143,196,.06)",
              border: `1px solid ${a.tipo==="warn" ? "rgba(232,176,79,.18)" : "rgba(91,143,196,.18)"}`,
              fontSize:11, color:"var(--muted)", display:"flex", alignItems:"center", gap:8,
            }}>
              <LucideIcon name={a.tipo==="warn"?"alert-triangle":"info"} size={11} color={a.tipo==="warn"?"#e8b04f":"#5b8fc4"}/>
              <span>{a.txt}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Gauge({ label, value, color }) {
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:4 }}>
        <span style={{ fontSize:9, fontWeight:700, letterSpacing:".18em", color:"rgba(245,221,177,.55)", textTransform:"uppercase" }}>{label}</span>
        <span style={{ fontSize:14, fontFamily:"var(--font-m)", fontWeight:700, color:"var(--fg)" }}>{value}</span>
      </div>
      <div style={{ height:5, borderRadius:3, background:"rgba(255,255,255,.05)", overflow:"hidden" }}>
        <div style={{ width:`${value}%`, height:"100%", background:`linear-gradient(90deg, ${color}, ${color}aa)` }}/>
      </div>
    </div>
  );
}

function ResumoArco() {
  return (
    <div style={{
      padding:"14px 18px", borderRadius:12, border:"1px solid var(--border)",
      background:"linear-gradient(145deg,rgba(213,162,64,.04),transparent 70%)",
      display:"flex", alignItems:"flex-start", gap:12,
    }}>
      <LucideIcon name="bookmark" size={14} color="var(--gold)"/>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:9, fontWeight:700, letterSpacing:".2em", color:"var(--gold)", textTransform:"uppercase", marginBottom:4 }}>Arco atual</div>
        <p style={{ fontSize:12, lineHeight:1.55, color:"rgba(244,239,231,.85)", textWrap:"pretty" }}>{CAMPANHA.resumoArco}</p>
      </div>
    </div>
  );
}

// ─── styles ───────────────────────────────────────
const panelStyle = {
  borderRadius:14, border:"1px solid var(--border)",
  background:"linear-gradient(180deg,rgba(255,255,255,.02),rgba(255,255,255,.005))",
  display:"flex", flexDirection:"column", overflow:"hidden",
};
const panelHeader = {
  display:"flex", alignItems:"center", justifyContent:"space-between",
  padding:"12px 16px", borderBottom:"1px solid var(--border)",
};
const panelTitle = {
  fontSize:11, fontWeight:700, letterSpacing:".14em", textTransform:"uppercase", color:"var(--fg)",
};
const btnGhost = {
  display:"inline-flex", alignItems:"center", gap:6, padding:"8px 14px",
  borderRadius:9, border:"1px solid var(--border)", background:"transparent",
  color:"var(--muted)", fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"inherit",
};
const btnPrimary = {
  display:"inline-flex", alignItems:"center", gap:6, padding:"8px 14px",
  borderRadius:9, border:"1px solid rgba(188,74,63,.4)",
  background:"linear-gradient(135deg,rgba(188,74,63,.85),#6b1220)",
  color:"#fff9f2", fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
  boxShadow:"0 4px 14px rgba(188,74,63,.25)",
};
const miniBtn = {
  padding:"4px 10px", borderRadius:6, border:"1px solid var(--border)",
  background:"transparent", color:"var(--muted)", fontSize:10, fontWeight:600,
  cursor:"pointer", fontFamily:"inherit",
};

// ─── App ──────────────────────────────────────────
function CampanhaApp() {
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState("campaigns");

  return (
    <div style={{ display:"flex", height:"100vh", background:"var(--bg)" }}>
      <CockpitSidebar
        activeModule={active}
        onNavigate={setActive}
        collapsed={collapsed}
        onToggle={()=>setCollapsed(!collapsed)}
      />
      <main style={{ flex:1, overflowY:"auto", overflowX:"hidden" }}>
        <CampanhaHeader/>
        <div style={{ padding:"22px 28px", display:"flex", flexDirection:"column", gap:18 }}>
          <ResumoArco/>

          {/* Elenco row */}
          <div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <LucideIcon name="users" size={14} color="var(--gold)"/>
                <span style={panelTitle}>Elenco · {ELENCO.length} personagens</span>
              </div>
              <button style={miniBtn}>Ver fichas completas</button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))", gap:10 }}>
              {ELENCO.map(pj=> <ElencoCard key={pj.id} pj={pj}/>)}
            </div>
          </div>

          {/* 2-col: próxima sessão + lateral */}
          <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr", gap:18 }}>
            <ProximaSessaoBlock/>
            <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
              <EncontrosBlock/>
              <BalancoBlock/>
            </div>
          </div>

          {/* Memória full-width */}
          <MemoriaBlock/>
        </div>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<CampanhaApp/>);
