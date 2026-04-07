import Link from "next/link";

export default function AppEntryPage() {
  return (
    <main className="min-h-screen bg-[#04060b] px-4 py-14 text-white sm:px-8">
      <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-8">
        <p className="text-[11px] uppercase tracking-[0.18em] text-white/55">World OS Rebuild</p>
        <h1 className="mt-3 text-3xl font-semibold">Bootstrap inicial do workspace</h1>
        <p className="mt-3 text-sm leading-6 text-white/75">
          Use uma rota world-scoped para validar o shell. Exemplo:
        </p>
        <code className="mt-4 block rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white/90">
          /app/worlds/&lt;worldId&gt;/codex
        </code>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium transition hover:bg-white/15"
          >
            Voltar para landing
          </Link>
        </div>
      </div>
    </main>
  );
}

