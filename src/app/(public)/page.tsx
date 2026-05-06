import Link from "next/link";

export default function LandingPage() {
  return (
    <main style={{ width: "100vw", minHeight: "100vh", overflow: "hidden", background: "#06070c", position: "relative" }}>
      <Link
        href="/mestre"
        style={{
          position: "fixed",
          right: 24,
          top: 24,
          zIndex: 20,
          border: "1px solid rgba(255,255,255,.16)",
          borderRadius: 14,
          background: "rgba(6,7,12,.72)",
          backdropFilter: "blur(18px)",
          color: "#f4efe7",
          fontFamily: "DM Sans, sans-serif",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: ".08em",
          padding: "10px 16px",
          textDecoration: "none",
          textTransform: "uppercase",
        }}
      >
        Entrar no hub
      </Link>
      <iframe
        src="/handoff/t20-toolkit/Landing%20Page.html"
        title="T20 OS Landing"
        style={{ width: "100%", height: "100vh", border: "none", display: "block" }}
      />
    </main>
  );
}
