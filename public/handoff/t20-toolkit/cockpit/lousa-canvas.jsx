// lousa-canvas.jsx — Canvas livre infinito com pan/zoom + nodes drag + edges

const { useState, useRef, useEffect, useCallback } = React;

const TYPE_LABEL = {
  character:"Personagem", npc:"NPC", faction:"Facção",
  place:"Lugar", artifact:"Artefato", event:"Evento",
};

function LousaNode({ node, ref, selected, onMouseDown, onClick }) {
  const r = LOUSA_LIBRARY.find(l => l.id === node.refId);
  if (!r) return null;
  return (
    <div
      onMouseDown={e=>onMouseDown(e, node.id)}
      onClick={e=>{ e.stopPropagation(); onClick(node.id); }}
      style={{
        position:"absolute", left:node.x, top:node.y, transform:"translate(-50%,-50%)",
        minWidth:140, maxWidth:180, padding:"10px 12px",
        borderRadius:12, cursor:"grab", userSelect:"none",
        border:`1px solid ${selected ? r.cor : "rgba(255,255,255,.1)"}`,
        background: selected
          ? `linear-gradient(145deg, ${r.cor}22, rgba(15,15,22,.95))`
          : "linear-gradient(145deg, rgba(20,18,28,.95), rgba(11,10,15,.95))",
        boxShadow: selected
          ? `0 0 0 1px ${r.cor}55, 0 8px 32px ${r.cor}33, 0 2px 8px rgba(0,0,0,.6)`
          : "0 4px 16px rgba(0,0,0,.5), 0 1px 2px rgba(0,0,0,.4)",
        backdropFilter:"blur(8px)",
        transition:"box-shadow .14s, border-color .14s",
        zIndex: selected ? 20 : 10,
      }}>
      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
        <span style={{ width:6, height:6, borderRadius:"50%", background:r.cor, boxShadow:`0 0 6px ${r.cor}` }}/>
        <span style={{ fontSize:8, fontWeight:700, letterSpacing:".18em", color:r.cor, textTransform:"uppercase" }}>
          {TYPE_LABEL[r.tipo]}
        </span>
      </div>
      <div style={{ fontSize:13, fontWeight:700, color:"var(--fg)", marginBottom:2, lineHeight:1.2 }}>{r.nome}</div>
      <div style={{ fontSize:10, color:"var(--muted)", lineHeight:1.3 }}>{r.subt}</div>
    </div>
  );
}

function LousaEdge({ from, to, label }) {
  if (!from || !to) return null;
  const dx = to.x - from.x, dy = to.y - from.y;
  const mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2;
  const len = Math.sqrt(dx*dx + dy*dy);
  const ang = Math.atan2(dy, dx);
  const cx = mx - Math.sin(ang) * 22; // curve offset
  const cy = my + Math.cos(ang) * 22;
  return (
    <g>
      <path
        d={`M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`}
        fill="none" stroke="rgba(213,162,64,.28)" strokeWidth="1.4" strokeDasharray="3 3"
      />
      {label && (
        <g transform={`translate(${mx}, ${my})`}>
          <rect x="-32" y="-9" width="64" height="18" rx="9"
            fill="rgba(11,10,15,.92)" stroke="rgba(213,162,64,.25)" strokeWidth="0.8"/>
          <text x="0" y="3" textAnchor="middle"
            fill="#d5a240" fontSize="9" fontFamily="DM Sans, sans-serif"
            fontWeight="600" letterSpacing="0.04em">{label}</text>
        </g>
      )}
    </g>
  );
}

function LousaCanvas({ nodes, edges, setNodes, selected, setSelected, onDrop }) {
  const [view, setView] = useState({ x:0, y:0, zoom:1 });
  const [dragNode, setDragNode] = useState(null);
  const [panState, setPanState] = useState(null);
  const ref = useRef(null);

  const onWheel = useCallback((e)=>{
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.92 : 1.08;
    setView(v=>{
      const newZoom = Math.max(.4, Math.min(2.2, v.zoom * factor));
      return { ...v, zoom: newZoom };
    });
  },[]);

  useEffect(()=>{
    const el = ref.current;
    if (!el) return;
    el.addEventListener("wheel", onWheel, { passive:false });
    return ()=> el.removeEventListener("wheel", onWheel);
  },[onWheel]);

  function startNodeDrag(e, id) {
    e.stopPropagation();
    const n = nodes.find(x=>x.id===id);
    setDragNode({ id, ox: e.clientX, oy: e.clientY, nx: n.x, ny: n.y });
  }
  function startPan(e) {
    if (e.target !== e.currentTarget && !e.target.classList.contains("__lousa-bg")) return;
    setPanState({ ox:e.clientX, oy:e.clientY, vx:view.x, vy:view.y });
    setSelected(null);
  }
  useEffect(()=>{
    function move(e) {
      if (dragNode) {
        const dx = (e.clientX - dragNode.ox) / view.zoom;
        const dy = (e.clientY - dragNode.oy) / view.zoom;
        setNodes(ns => ns.map(n => n.id===dragNode.id ? { ...n, x: dragNode.nx+dx, y: dragNode.ny+dy } : n));
      } else if (panState) {
        setView(v => ({ ...v, x: panState.vx + (e.clientX-panState.ox), y: panState.vy + (e.clientY-panState.oy) }));
      }
    }
    function up() { setDragNode(null); setPanState(null); }
    if (dragNode || panState) {
      window.addEventListener("mousemove", move);
      window.addEventListener("mouseup", up);
      return ()=> { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
    }
  },[dragNode, panState, view.zoom, setNodes, setSelected]);

  function onDragOver(e){ e.preventDefault(); }
  function onDropHandler(e){
    e.preventDefault();
    const refId = e.dataTransfer.getData("text/plain");
    if (!refId) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - view.x) / view.zoom;
    const y = (e.clientY - rect.top  - view.y) / view.zoom;
    onDrop(refId, x, y);
  }

  return (
    <div ref={ref} className="__lousa-bg" onMouseDown={startPan} onDragOver={onDragOver} onDrop={onDropHandler}
      style={{
        position:"relative", flex:1, overflow:"hidden",
        background:"radial-gradient(ellipse at 50% 0%, rgba(188,74,63,.04), transparent 60%), #06070c",
        cursor: panState ? "grabbing" : "default",
      }}>
      {/* dot grid */}
      <div className="__lousa-bg" style={{
        position:"absolute", inset:0,
        backgroundImage:`radial-gradient(rgba(255,255,255,.06) 1px, transparent 1px)`,
        backgroundSize:`${24*view.zoom}px ${24*view.zoom}px`,
        backgroundPosition:`${view.x}px ${view.y}px`,
        pointerEvents:"none",
      }}/>
      {/* mist */}
      <div className="__lousa-bg" style={{
        position:"absolute", inset:0,
        background:"radial-gradient(ellipse at 30% 40%, rgba(213,162,64,.04), transparent 50%), radial-gradient(ellipse at 70% 70%, rgba(168,127,196,.04), transparent 50%)",
        pointerEvents:"none",
      }}/>

      {/* Transformed world */}
      <div style={{
        position:"absolute", left:view.x, top:view.y,
        transform:`scale(${view.zoom})`, transformOrigin:"0 0",
      }}>
        {/* SVG edges layer */}
        <svg style={{ position:"absolute", left:-2000, top:-2000, width:4000, height:4000, pointerEvents:"none" }}>
          <g transform="translate(2000,2000)">
            {edges.map(e => {
              const from = nodes.find(n=>n.id===e.from);
              const to   = nodes.find(n=>n.id===e.to);
              return <LousaEdge key={e.id} from={from} to={to} label={e.label}/>;
            })}
          </g>
        </svg>

        {/* Nodes */}
        {nodes.map(n=>(
          <LousaNode key={n.id} node={n}
            selected={selected===n.id}
            onMouseDown={startNodeDrag}
            onClick={setSelected}/>
        ))}
      </div>

      {/* Zoom HUD */}
      <div style={{
        position:"absolute", bottom:14, right:14,
        display:"flex", alignItems:"center", gap:6,
        padding:"6px 10px", borderRadius:10,
        border:"1px solid var(--border)", background:"rgba(11,10,15,.85)",
        fontSize:10, color:"var(--muted)", fontFamily:"var(--font-m)",
        backdropFilter:"blur(8px)",
      }}>
        <button style={hudBtn} onClick={()=>setView(v=>({ ...v, zoom: Math.max(.4, v.zoom*0.85) }))}>−</button>
        <span style={{ minWidth:38, textAlign:"center", color:"var(--fg)" }}>{Math.round(view.zoom*100)}%</span>
        <button style={hudBtn} onClick={()=>setView(v=>({ ...v, zoom: Math.min(2.2, v.zoom*1.15) }))}>+</button>
        <span style={{ width:1, height:14, background:"rgba(255,255,255,.1)", margin:"0 4px" }}/>
        <button style={hudBtn} onClick={()=>setView({ x:0, y:0, zoom:1 })} title="Reset">⌂</button>
      </div>

      {/* Mini hint */}
      <div style={{
        position:"absolute", bottom:14, left:14,
        padding:"6px 10px", borderRadius:8,
        border:"1px solid var(--border)", background:"rgba(11,10,15,.85)",
        fontSize:10, color:"rgba(255,255,255,.4)", fontFamily:"var(--font-m)",
        backdropFilter:"blur(8px)",
      }}>
        arraste fundo para navegar · scroll para zoom · solte da biblioteca para criar
      </div>
    </div>
  );
}

const hudBtn = {
  width:22, height:22, borderRadius:6, border:"1px solid rgba(255,255,255,.1)",
  background:"rgba(255,255,255,.04)", color:"var(--fg)",
  cursor:"pointer", fontFamily:"inherit", fontSize:11, fontWeight:700,
  display:"inline-flex", alignItems:"center", justifyContent:"center",
};

Object.assign(window, { LousaCanvas, TYPE_LABEL });
