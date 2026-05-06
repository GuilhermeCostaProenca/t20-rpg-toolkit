// grafo-graph.jsx — Force-directed entity relationship graph
// Depends on: cockpit-icons.jsx, codex-data.jsx

const NODE_RADIUS = 36;
const LABEL_OFFSET = 52;

/* ── Build graph data from ENTITIES ─────────────────────────── */
function buildGraph() {
  const nodes = ENTITIES.map((e, i) => ({
    id: e.id,
    name: e.name,
    type: e.type,
    tagline: e.tagline,
    status: e.status,
    // initial position — spread in circle
    x: 0, y: 0,
    vx: 0, vy: 0,
    pinned: false,
  }));

  // Build edge list from relations (deduplicated)
  const edgeSet = new Set();
  const edges = [];
  for (const entity of ENTITIES) {
    if (!entity.relations) continue;
    for (const rel of entity.relations) {
      const target = ENTITIES.find(e => e.name === rel.name);
      if (!target) continue;
      const key = [Math.min(entity.id, target.id), Math.max(entity.id, target.id)].join("-");
      if (!edgeSet.has(key)) {
        edgeSet.add(key);
        edges.push({ source: entity.id, target: target.id, label: rel.rel });
      }
    }
  }
  return { nodes, edges };
}

/* ── Force simulation hook ───────────────────────────────────── */
function useForceSimulation(width, height) {
  const { nodes: initNodes, edges } = React.useMemo(buildGraph, []);

  const [nodes, setNodes] = React.useState(() => {
    // Place nodes in a nice initial circle
    const cx = width / 2, cy = height / 2;
    const r  = Math.min(width, height) * 0.32;
    return initNodes.map((n, i) => {
      const angle = (i / initNodes.length) * Math.PI * 2 - Math.PI / 2;
      return { ...n, x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
    });
  });

  const nodesRef  = React.useRef(nodes);
  const rafRef    = React.useRef(null);
  const runningRef= React.useRef(true);

  React.useEffect(() => { nodesRef.current = nodes; }, [nodes]);

  // Kick off simulation
  React.useEffect(() => {
    let iter = 0;
    const MAX_ITER = 300;

    function tick() {
      if (!runningRef.current) return;
      iter++;
      const alpha = Math.max(0.001, 0.6 * Math.pow(0.97, iter));
      const ns = nodesRef.current.map(n => ({ ...n }));
      const cx = width / 2, cy = height / 2;

      // Repulsion (all pairs)
      for (let i = 0; i < ns.length; i++) {
        for (let j = i + 1; j < ns.length; j++) {
          const dx = ns[j].x - ns[i].x;
          const dy = ns[j].y - ns[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const strength = (10000 / (dist * dist)) * alpha;
          const fx = (dx / dist) * strength;
          const fy = (dy / dist) * strength;
          if (!ns[i].pinned) { ns[i].vx -= fx; ns[i].vy -= fy; }
          if (!ns[j].pinned) { ns[j].vx += fx; ns[j].vy += fy; }
        }
      }

      // Attraction along edges
      for (const edge of edges) {
        const a = ns.find(n => n.id === edge.source);
        const b = ns.find(n => n.id === edge.target);
        if (!a || !b) continue;
        const dx = b.x - a.x, dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const ideal = 180;
        const force = (dist - ideal) * 0.04 * alpha;
        const fx = (dx / dist) * force, fy = (dy / dist) * force;
        if (!a.pinned) { a.vx += fx; a.vy += fy; }
        if (!b.pinned) { b.vx -= fx; b.vy -= fy; }
      }

      // Center gravity
      for (const n of ns) {
        if (n.pinned) continue;
        n.vx += (cx - n.x) * 0.015 * alpha;
        n.vy += (cy - n.y) * 0.015 * alpha;
      }

      // Damping + integrate
      for (const n of ns) {
        if (n.pinned) continue;
        n.vx *= 0.75; n.vy *= 0.75;
        n.x += n.vx;  n.y += n.vy;
        // Clamp within canvas
        const pad = NODE_RADIUS + 10;
        n.x = Math.max(pad, Math.min(width  - pad, n.x));
        n.y = Math.max(pad, Math.min(height - pad, n.y));
      }

      nodesRef.current = ns;
      setNodes([...ns]);

      if (iter < MAX_ITER) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(rafRef.current); runningRef.current = false; };
  }, [width, height]);

  function pinNode(id, x, y) {
    nodesRef.current = nodesRef.current.map(n =>
      n.id === id ? { ...n, x, y, vx: 0, vy: 0, pinned: true } : n
    );
    setNodes([...nodesRef.current]);
  }
  function unpinNode(id) {
    nodesRef.current = nodesRef.current.map(n =>
      n.id === id ? { ...n, pinned: false } : n
    );
    setNodes([...nodesRef.current]);
  }
  function reheat() {
    nodesRef.current = nodesRef.current.map(n => ({ ...n, pinned: false, vx: (Math.random()-0.5)*10, vy: (Math.random()-0.5)*10 }));
    setNodes([...nodesRef.current]);
  }

  return { nodes, edges, pinNode, unpinNode, reheat };
}

/* ── Node hexagon shape ──────────────────────────────────────── */
function hexPoints(cx, cy, r) {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (i * Math.PI) / 3 - Math.PI / 6;
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
  }).join(" ");
}

/* ── Edge component ──────────────────────────────────────────── */
function GraphEdge({ edge, nodes, hoveredEdge, onHover }) {
  const a = nodes.find(n => n.id === edge.source);
  const b = nodes.find(n => n.id === edge.target);
  if (!a || !b) return null;

  const ma = TYPE_META[a.type] || { color: "#b5aea4" };
  const isHovered = hoveredEdge === `${edge.source}-${edge.target}`;

  // Midpoint with slight curve
  const mx = (a.x + b.x) / 2 + (b.y - a.y) * 0.12;
  const my = (a.y + b.y) / 2 - (b.x - a.x) * 0.12;

  const dx = b.x - a.x, dy = b.y - a.y;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  // Start/end offset from node center
  const startX = a.x + (dx / dist) * NODE_RADIUS;
  const startY = a.y + (dy / dist) * NODE_RADIUS;
  const endX   = b.x - (dx / dist) * NODE_RADIUS;
  const endY   = b.y - (dy / dist) * NODE_RADIUS;

  const pathD = `M ${startX} ${startY} Q ${mx} ${my} ${endX} ${endY}`;

  return (
    <g>
      {/* Wide invisible hit area */}
      <path d={pathD} fill="none" stroke="transparent" strokeWidth={16}
        style={{ cursor: "pointer" }}
        onMouseEnter={() => onHover(`${edge.source}-${edge.target}`)}
        onMouseLeave={() => onHover(null)}
      />
      {/* Visible edge */}
      <path
        d={pathD} fill="none"
        stroke={isHovered ? ma.color : "rgba(255,255,255,.12)"}
        strokeWidth={isHovered ? 2 : 1}
        strokeDasharray={isHovered ? "none" : "4 4"}
        style={{ transition: "stroke .2s, stroke-width .2s", pointerEvents: "none" }}
      />
      {/* Arrow at end */}
      {isHovered && (() => {
        const tx = endX - (dx / dist) * 14;
        const ty = endY - (dy / dist) * 14;
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        return (
          <polygon
            points="0,-4 10,0 0,4"
            fill={ma.color}
            transform={`translate(${tx + (dx/dist)*7},${ty + (dy/dist)*7}) rotate(${angle})`}
            style={{ pointerEvents: "none" }}
          />
        );
      })()}
      {/* Edge label on hover */}
      {isHovered && (
        <g style={{ pointerEvents: "none" }}>
          <rect
            x={mx - 50} y={my - 11} width={100} height={18}
            rx={5} fill="rgba(6,7,12,.92)" stroke={ma.color + "55"} strokeWidth={1}
          />
          <text x={mx} y={my + 3} textAnchor="middle"
            fill="rgba(255,255,255,.7)" fontSize={9} fontFamily="var(--font-b)" fontWeight={600}
          >{edge.label}</text>
        </g>
      )}
    </g>
  );
}

/* ── Node component ──────────────────────────────────────────── */
function GraphNode({ node, selected, hovered, onSelect, onDragStart, onMouseEnter, onMouseLeave }) {
  const m = TYPE_META[node.type] || { color: "#b5aea4", dim: "rgba(181,174,164,.1)", border: "rgba(181,174,164,.3)", icon: "boxes" };
  const isActive = selected || hovered;
  const r = NODE_RADIUS;

  return (
    <g
      transform={`translate(${node.x},${node.y})`}
      style={{ cursor: "pointer" }}
      onClick={() => onSelect(node.id)}
      onMouseDown={e => onDragStart(e, node.id)}
      onMouseEnter={() => onMouseEnter(node.id)}
      onMouseLeave={onMouseLeave}
    >
      {/* Glow */}
      {isActive && (
        <circle r={r + 12} fill={m.color + "18"}
          style={{ filter: `blur(8px)` }} />
      )}

      {/* Hex background */}
      <polygon
        points={hexPoints(0, 0, r)}
        fill={isActive ? m.color + "22" : m.dim}
        stroke={isActive ? m.color : "rgba(255,255,255,.12)"}
        strokeWidth={isActive ? 2 : 1}
        style={{ transition: "fill .2s, stroke .2s" }}
      />

      {/* Type icon — render as Unicode fallback shape */}
      <circle r={14} fill={m.color + "30"} stroke={m.color + "55"} strokeWidth={1} />

      {/* Type initial */}
      <text
        textAnchor="middle" dominantBaseline="central"
        fill={m.color} fontSize={10} fontWeight={700}
        fontFamily="var(--font-b)"
      >
        {node.type.slice(0, 3).toUpperCase()}
      </text>

      {/* Pinned indicator */}
      {node.pinned && (
        <circle r={4} cx={r - 6} cy={-(r - 6)} fill="#d5a240" stroke="#06070c" strokeWidth={1} />
      )}

      {/* Name label */}
      <text
        y={LABEL_OFFSET - NODE_RADIUS}
        textAnchor="middle" dominantBaseline="hanging"
        fill={isActive ? "#f4efe7" : "rgba(255,255,255,.6)"}
        fontSize={11} fontWeight={isActive ? 700 : 500}
        fontFamily="var(--font-b)"
        style={{ transition: "fill .2s", pointerEvents: "none" }}
      >
        {node.name.length > 16 ? node.name.slice(0, 15) + "…" : node.name}
      </text>

      {/* Type label */}
      <text
        y={LABEL_OFFSET - NODE_RADIUS + 14}
        textAnchor="middle" dominantBaseline="hanging"
        fill={m.color} fontSize={8} fontWeight={600}
        fontFamily="var(--font-b)" opacity={0.7}
        style={{ pointerEvents: "none", letterSpacing: "0.08em" }}
      >
        {node.type.toUpperCase()}
      </text>
    </g>
  );
}

/* ── Main graph canvas ───────────────────────────────────────── */
function GraphCanvas({ selectedId, onSelect, filterType }) {
  const containerRef = React.useRef(null);
  const [dims, setDims] = React.useState({ w: 800, h: 600 });

  React.useEffect(() => {
    const obs = new ResizeObserver(([entry]) => {
      setDims({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const { nodes, edges, pinNode, unpinNode, reheat } = useForceSimulation(dims.w, dims.h);

  // Pan + zoom
  const [transform, setTransform] = React.useState({ x: 0, y: 0, scale: 1 });
  const panRef = React.useRef(null);

  // Drag state
  const [draggingId, setDraggingId] = React.useState(null);
  const dragOffRef = React.useRef({ x: 0, y: 0 });

  // Hover
  const [hoveredNodeId, setHoveredNodeId]   = React.useState(null);
  const [hoveredEdgeKey, setHoveredEdgeKey] = React.useState(null);

  function svgPoint(e) {
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - transform.x) / transform.scale,
      y: (e.clientY - rect.top  - transform.y) / transform.scale,
    };
  }

  function handleNodeDragStart(e, id) {
    e.stopPropagation();
    const pt = svgPoint(e);
    const node = nodes.find(n => n.id === id);
    dragOffRef.current = { x: pt.x - node.x, y: pt.y - node.y };
    setDraggingId(id);
  }

  function handleMouseMove(e) {
    if (draggingId !== null) {
      const pt = svgPoint(e);
      pinNode(draggingId, pt.x - dragOffRef.current.x, pt.y - dragOffRef.current.y);
    } else if (panRef.current) {
      const dx = e.clientX - panRef.current.x;
      const dy = e.clientY - panRef.current.y;
      setTransform(t => ({ ...t, x: t.x + dx, y: t.y + dy }));
      panRef.current = { x: e.clientX, y: e.clientY };
    }
  }

  function handleMouseUp(e) {
    if (draggingId !== null) {
      // Leave pinned after drag
      setDraggingId(null);
    }
    panRef.current = null;
  }

  function handleBgMouseDown(e) {
    if (e.target === e.currentTarget || e.target.tagName === "svg") {
      panRef.current = { x: e.clientX, y: e.clientY };
    }
  }

  function handleWheel(e) {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.91;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = e.clientX - rect.left, cy = e.clientY - rect.top;
    setTransform(t => {
      const newScale = Math.max(0.25, Math.min(3, t.scale * factor));
      return {
        scale: newScale,
        x: cx - (cx - t.x) * (newScale / t.scale),
        y: cy - (cy - t.y) * (newScale / t.scale),
      };
    });
  }

  const visibleNodes = filterType === "Todos"
    ? nodes
    : nodes.filter(n => n.type === filterType);
  const visibleIds = new Set(visibleNodes.map(n => n.id));
  const visibleEdges = edges.filter(e => visibleIds.has(e.source) && visibleIds.has(e.target));

  return (
    <div ref={containerRef} style={{ flex: 1, position: "relative", overflow: "hidden", cursor: draggingId ? "grabbing" : "default" }}>
      <svg
        width="100%" height="100%"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseDown={handleBgMouseDown}
        onWheel={handleWheel}
        style={{ display: "block", userSelect: "none" }}
      >
        {/* Background grid */}
        <defs>
          <pattern id="grid" width={40} height={40} patternUnits="userSpaceOnUse"
            patternTransform={`translate(${transform.x % 40},${transform.y % 40}) scale(${transform.scale})`}>
            <circle cx={0} cy={0} r={0.8} fill="rgba(255,255,255,.06)" />
          </pattern>
          <radialGradient id="bgGrad" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="rgba(188,74,63,.05)" />
            <stop offset="100%" stopColor="rgba(6,7,12,0)" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#bgGrad)" />
        <rect width="100%" height="100%" fill="url(#grid)" />

        <g transform={`translate(${transform.x},${transform.y}) scale(${transform.scale})`}>
          {/* Edges */}
          {visibleEdges.map(edge => (
            <GraphEdge
              key={`${edge.source}-${edge.target}`}
              edge={edge} nodes={visibleNodes}
              hoveredEdge={hoveredEdgeKey}
              onHover={setHoveredEdgeKey}
            />
          ))}

          {/* Nodes */}
          {visibleNodes.map(node => (
            <GraphNode
              key={node.id}
              node={node}
              selected={selectedId === node.id}
              hovered={hoveredNodeId === node.id}
              onSelect={id => {
                const entity = ENTITIES.find(e => e.id === id);
                onSelect(entity || null);
              }}
              onDragStart={handleNodeDragStart}
              onMouseEnter={setHoveredNodeId}
              onMouseLeave={() => setHoveredNodeId(null)}
            />
          ))}
        </g>
      </svg>

      {/* Controls */}
      <div style={{ position: "absolute", bottom: 16, right: 16, display: "flex", flexDirection: "column", gap: 6 }}>
        {[
          { label: "+", action: () => setTransform(t => ({ ...t, scale: Math.min(3, t.scale * 1.2) })) },
          { label: "−", action: () => setTransform(t => ({ ...t, scale: Math.max(0.25, t.scale / 1.2) })) },
          { label: "⌖", action: () => setTransform({ x: 0, y: 0, scale: 1 }) },
        ].map(btn => (
          <button key={btn.label} onClick={btn.action}
            style={{
              width: 32, height: 32, borderRadius: 9,
              background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)",
              color: "rgba(255,255,255,.6)", fontSize: 16, cursor: "pointer", fontFamily: "inherit",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all .15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.12)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.06)"; e.currentTarget.style.color = "rgba(255,255,255,.6)"; }}>
            {btn.label}
          </button>
        ))}
        <button onClick={reheat}
          title="Reembaralhar layout"
          style={{
            width: 32, height: 32, borderRadius: 9,
            background: "rgba(188,74,63,.1)", border: "1px solid rgba(188,74,63,.3)",
            color: "#e06155", fontSize: 14, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all .15s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(188,74,63,.2)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(188,74,63,.1)"}>
          <LucideIcon name="refresh-cw" size={13} color="#e06155" />
        </button>
      </div>

      {/* Scale indicator */}
      <div style={{ position: "absolute", bottom: 16, left: 16, fontSize: 10, color: "rgba(255,255,255,.25)", fontFamily: "var(--font-m)" }}>
        {Math.round(transform.scale * 100)}% · Arrastar para mover · Scroll para zoom
      </div>
    </div>
  );
}

Object.assign(window, { GraphCanvas });
