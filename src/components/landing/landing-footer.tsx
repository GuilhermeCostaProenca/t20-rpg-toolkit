import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#04070d]">
      <div className="mx-auto flex w-[min(1320px,calc(100vw-1.75rem))] flex-wrap items-center justify-between gap-4 py-6 text-xs text-white/60">
        <p>T20 OS · World-first toolkit para mestres Tormenta 20</p>
        <div className="flex items-center gap-4">
          <Link href="/app" className="transition-colors hover:text-white">
            Abrir app
          </Link>
          <a href="#toolkit" className="transition-colors hover:text-white">
            Plataforma
          </a>
          <a href="#cta" className="transition-colors hover:text-white">
            Comecar
          </a>
        </div>
      </div>
    </footer>
  );
}
