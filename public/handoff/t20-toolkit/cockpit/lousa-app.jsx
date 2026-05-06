// lousa-app.jsx — Modo Lousa: canvas livre + biblioteca arrastável + inspector

const { useState, useMemo } = React;

function LibraryPanel({ onAdd }) {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const filtered = LOUSA_LIBRARY.filter(l =>
    (filter==="all" || l.tipo===filter) &&
    (query==="" || l.nome.toLowerCase().includes(query.toLowerCase()) || l.subt.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <aside style={{
      width:260, flexShrink:0, height:"100%",
      borderRight:"1px solid var(--border)",
      background:"linear-gradient(180deg,rgba(11,10,15,.98),rgba(7,7,12,.99))",
      display:"flex", flexDirection:"column",
    }}>
      <div style={{ padding:"14px 14px 10px", borderBottom:"1px solid var(--border)" }}>
        <div style={{ fontSize:9, fontWeight:700, letterSpacing:".22em", color:"var(--gold)", textTransform:"uppercase", marginBottom:8 }}>Biblioteca</div>
        <div style={{ position:"relative" }}>
          <LucideIcon name="search" size={12} color="rgba(255,255,255,.3)"
            style={{ position:"absolute", left:9, top:"50%", transform:"translateY(-50%)" }}/>
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar entidade…"
            style={{
              width:"100%", padding:"6px 8px 6px 26px", borderRadius:7,
              border:"1px solid var(--border)", background:"rgba(255,255,255,.02)",
              color:"var(--fg)", fontSize:11, outline:"none",
            }}/>
        </div>
      </div>

      <div style={{ padding:"8px 10px", borderBottom:"1px solid var(--border)", display:"flex", flexWrap:"wrap", gap:4 }}>
        {LIB_TYPES.map(t=>(
          <button key={t.id} onClick={()=>setFilter(t.id)} style={{
            display:"inline-flex", alignItems:"center", gap:5, padding:"4px 8px", borderRadius:6,
            border: filter===t.id ? "1px solid rgba(213,162,64,.35)" : "1px solid var(--border)",
            background: filter===t.id ? "rgba(213,162,64,.1)" : "transparent",
            color: filter===t.id ? "#f5ddb1" : "var(--muted)",
            fontSize:10, fontWeight:600, cursor:"pointer", fontFamily:"inherit",
          }}>
            <LucideIcon name={t.icon} size={10}/>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"8px 10px" }}>
        {filtered.map(l=>(
          <div key={l.id}
            draggable
            onDragStart={e=>e.dataTransfer.setData("text/plain", l.id)}
            onDoubleClick={()=>onAdd(l.id, 400 + Math.random()*100, 300 + Math.random()*100)}
            style={{
              display:"flex", alignItems:"center", gap:10,
              padding:"8px 10px", marginBottom:4, borderRadius:9,
              border:"1px solid rgba(255,255,255,.04)", background:"rgba(255,255,255,.015)",
              cursor:"grab", transition:"all .14s",
            }}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor=`${l.cor}55`; e.currentTarget.style.background=`${l.cor}0d`; }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor="rgba(255,255,255,.04)"; e.currentTarget.style.background="rgba(255,255,255,.015)"; }}>
            <span style={{ width:5, height:30, borderRadius:3, background:l.cor, flexShrink:0 }}/>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:11, fontWeight:600, color:"var(--fg)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{l.nome}</div>
              <div style={{ fontSize:9, color:"var(--muted)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{l.subt}</div>
            </div>
            <LucideIcon name="grip-vertical" size={11} color="rgba(255,255,255,.2)"/>
          </div>
        ))}
        {filtered.length===0 && (
          <div style={{ textAlign:"center", padding:"20px 10px", fontSize:10, color:"rgba(255,255,255,.3)" }}>
            Nenhuma entidade
          </div>
        )}
      </div>
    </aside>
  );
}

function InspectorPanel({ nodeId, nodes, edges, onClose, onDelete }) {
  if (!nodeId) {
    return (
      <aside style={inspectorBase}>
        <div style={{ padding:"40px 20px", textAlign:"center" }}>
          <LucideIcon name="sparkles" size={20} color="rgba(213,162,64,.4)"/>
          <div style={{ fontSize:11, color:"rgba(255,255,255,.4)", marginTop:8, lineHeight:1.5 }}>
            Selecione um nó para inspecionar.
            <br/>Arraste da biblioteca para criar.
          </div>
        </div>
      </aside>
    );
  }
  const node = nodes.find(n=>n.id===nodeId);
  const r = node && LOUSA_LIBRARY.find(l=>l.id===node.refId);
  if (!r) return null;
  const conns = edges.filter(e=>e.from===nodeId || e.to===nodeId);

  return (
    <aside style={inspectorBase}>
      <div style={{ padding:"16px 18px 14px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8 }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
            <span style={{ width:7, height:7, borderRadius:"50%", background:r.cor, boxShadow:`0 0 8px ${r.cor}` }}/>
            <span style={{ fontSize:9, fontWeight:700, letterSpacing:".18em", color:r.cor, textTransform:"uppercase" }}>{TYPE_LABEL[r.tipo]}</span>
          </div>
          <div style={{ fontSize:17, fontFamily:"var(--font-d)", fontWeight:700, color:"var(--fg)", marginBottom:3 }}>{r.nome}</div>
          <div style={{ fontSize:11, color:"var(--muted)" }}>{r.subt}</div>
        </div>
        <button onClick={onClose} style={iconBtn}>
          <LucideIcon name="x" size={12}/>
        </button>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"12px 18px" }}>
        <div style={{ fontSize:9, fontWeight:700, letterSpacing:".18em", color:"rgba(245,221,177,.55)", textTransform:"uppercase", marginBottom:8 }}>
          Conexões · {conns.length}
        </div>
        {conns.length===0 ? (
          <div style={{ fontSize:11, color:"rgba(255,255,255,.3)", padding:"8px 0" }}>Nenhuma relação ainda</div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
            {conns.map(c=>{
              const otherId = c.from===nodeId ? c.to : c.from;
              const other = nodes.find(n=>n.id===otherId);
              const otherRef = other && LOUSA_LIBRARY.find(l=>l.id===other.refId);
              if (!otherRef) return null;
              const dir = c.from===nodeId ? "→" : "←";
              return (
                <div key={c.id} style={{
                  padding:"7px 10px", borderRadius:8,
                  border:"1px solid var(--border)", background:"rgba(255,255,255,.015)",
                  display:"flex", alignItems:"center", gap:8,
                }}>
                  <span style={{ fontSize:10, color:"var(--gold)", fontFamily:"var(--font-m)", minWidth:14 }}>{dir}</span>
                  <span style={{ flex:1, fontSize:11, color:"var(--fg)" }}>{otherRef.nome}</span>
                  <span style={{ fontSize:9, color:"var(--muted)", fontStyle:"italic" }}>{c.label}</span>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginTop:18, padding:"10px 12px", borderRadius:9, border:"1px dashed rgba(213,162,64,.2)", background:"rgba(213,162,64,.04)" }}>
          <div style={{ fontSize:10, color:"#d5a240", fontWeight:600, marginBottom:4 }}>💡 Próxima ação</div>
          <div style={{ fontSize:11, color:"rgba(244,239,231,.75)", lineHeight:1.5 }}>
            Promover esboço para o Codex como entidade formal, ou conectar a outra entidade arrastando.
          </div>
        </div>
      </div>

      <div style={{ padding:"12px 18px", borderTop:"1px solid var(--border)", display:"flex", gap:6 }}>
        <button style={{ ...inspectBtn, flex:1 }}>
          <LucideIcon name="external-link" size={11}/> Abrir no Codex
        </button>
        <button onClick={()=>onDelete(nodeId)} style={{
          ...inspectBtn, padding:"7px 10px",
          borderColor:"rgba(188,74,63,.25)", color:"#e06155",
        }}>
          <LucideIcon name="trash" size={11}/>
        </button>
      </div>
    </aside>
  );
}

const inspectorBase = {
  width:280, flexShrink:0, height:"100%",
  borderLeft:"1px solid var(--border)",
  background:"linear-gradient(180deg,rgba(11,10,15,.98),rgba(7,7,12,.99))",
  display:"flex", flexDirection:"column",
};
const iconBtn = {
  width:24, height:24, borderRadius:6, border:"1px solid var(--border)",
  background:"transparent", color:"var(--muted)", cursor:"pointer",
  display:"inline-flex", alignItems:"center", justifyContent:"center",
};
const inspectBtn = {
  display:"inline-flex", alignItems:"center", justifyContent:"center", gap:5,
  padding:"7px 12px", borderRadius:8,
  border:"1px solid var(--border)", background:"rgba(255,255,255,.02)",
  color:"var(--fg)", fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"inherit",
};

function LousaToolbar({ nodeCount, edgeCount, onAddBlank }) {
  return (
    <div style={{
      display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"12px 22px", borderBottom:"1px solid var(--border)",
      background:"linear-gradient(180deg,rgba(213,162,64,.04),transparent 80%)",
    }}>
      <div>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:2 }}>
          <LucideIcon name="sparkles" size={13} color="var(--gold)"/>
          <span style={{ fontSize:9, letterSpacing:".24em", textTransform:"uppercase", color:"var(--gold)", fontWeight:700 }}>Modo Lousa</span>
          <span style={{ fontSize:9, color:"rgba(255,255,255,.3)" }}>·</span>
          <span style={{ fontSize:10, color:"var(--muted)" }}>Arton</span>
        </div>
        <h1 style={{ fontFamily:"var(--font-d)", fontWeight:900, fontSize:20, color:"var(--fg)", letterSpacing:"-.005em" }}>
          Canvas de Ideação
        </h1>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:14 }}>
        <div style={{ display:"flex", gap:14, fontSize:10, color:"var(--muted)" }}>
          <span><b style={{ color:"var(--fg)", fontFamily:"var(--font-m)" }}>{nodeCount}</b> nós</span>
          <span><b style={{ color:"var(--fg)", fontFamily:"var(--font-m)" }}>{edgeCount}</b> relações</span>
        </div>
        <button onClick={onAddBlank} style={lousaBtnGhost}>
          <LucideIcon name="plus" size={12}/> Esboço livre
        </button>
        <button style={lousaBtnPrimary}>
          <LucideIcon name="upload" size={12}/> Promover ao Codex
        </button>
      </div>
    </div>
  );
}

const lousaBtnGhost = {
  display:"inline-flex", alignItems:"center", gap:6, padding:"7px 12px",
  borderRadius:8, border:"1px solid var(--border)", background:"transparent",
  color:"var(--muted)", fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"inherit",
};
const lousaBtnPrimary = {
  display:"inline-flex", alignItems:"center", gap:6, padding:"7px 14px",
  borderRadius:8, border:"1px solid rgba(213,162,64,.35)",
  background:"linear-gradient(135deg,rgba(213,162,64,.18),rgba(213,162,64,.06))",
  color:"#f5ddb1", fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
};

function LousaApp() {
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState("cockpit");
  const [mode, setMode] = useState("lousa");
  const [nodes, setNodes] = useState(INITIAL_NODES);
  const [edges, setEdges] = useState(INITIAL_EDGES);
  const [selected, setSelected] = useState(null);

  function addNodeFromLib(refId, x, y) {
    const id = `n${Date.now()}`;
    setNodes(ns => [...ns, { id, refId, x, y }]);
    setSelected(id);
  }
  function deleteNode(id) {
    setNodes(ns => ns.filter(n=>n.id!==id));
    setEdges(es => es.filter(e=>e.from!==id && e.to!==id));
    setSelected(null);
  }

  return (
    <div style={{ display:"flex", height:"100vh", background:"var(--bg)" }}>
      <CockpitSidebar
        activeModule={active}
        onNavigate={setActive}
        collapsed={collapsed}
        onToggle={()=>setCollapsed(!collapsed)}
        mode={mode}
        onModeChange={setMode}
      />
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
        <LousaToolbar
          nodeCount={nodes.length}
          edgeCount={edges.length}
          onAddBlank={()=>addNodeFromLib("lib-c1", 500, 300)}
        />
        <div style={{ flex:1, display:"flex", minHeight:0 }}>
          <LibraryPanel onAdd={addNodeFromLib}/>
          <LousaCanvas
            nodes={nodes} edges={edges} setNodes={setNodes}
            selected={selected} setSelected={setSelected}
            onDrop={addNodeFromLib}
          />
          <InspectorPanel
            nodeId={selected} nodes={nodes} edges={edges}
            onClose={()=>setSelected(null)} onDelete={deleteNode}
          />
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<LousaApp/>);
