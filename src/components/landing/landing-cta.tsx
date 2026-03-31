"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const PILLS = [
  { label: "Codex", color: "bg-sky-300/20 text-sky-100 border-sky-200/35" },
  { label: "Forja", color: "bg-emerald-300/20 text-emerald-100 border-emerald-200/35" },
  { label: "Mesa", color: "bg-fuchsia-300/20 text-fuchsia-100 border-fuchsia-200/35" },
  { label: "Grafo", color: "bg-violet-300/20 text-violet-100 border-violet-200/35" },
  { label: "Memoria", color: "bg-amber-300/20 text-amber-100 border-amber-200/35" },
];

export function LandingCta() {
  return (
    <section id="cta" className="relative overflow-hidden py-20 sm:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.13)_1px,transparent_1px)] [background-size:22px_22px]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#05070c_0%,#0a1220_45%,#05070c_100%)]" />

      <div className="relative mx-auto flex w-[min(1120px,calc(100vw-1.75rem))] flex-col items-center rounded-[32px] border border-white/16 bg-black/48 px-6 py-12 text-center backdrop-blur-md sm:px-10">
        <div className="flex flex-wrap justify-center gap-2">
          {PILLS.map((pill, index) => (
            <motion.span
              key={pill.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.28, delay: index * 0.06 }}
              className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.14em] ${pill.color}`}
            >
              {pill.label}
            </motion.span>
          ))}
        </div>

        <h2
          className="mt-6 text-3xl text-white sm:text-5xl"
          style={{ fontFamily: "ui-serif, Georgia, Cambria, serif" }}
        >
          Sua proxima sessao merece uma base melhor que improviso
        </h2>
        <p className="mt-4 max-w-2xl text-sm text-white/72 sm:text-base">
          Traga seu mundo para um ambiente unico, visual e operacional. Sem painel generico. Sem perda de contexto.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/app"
            className="rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-black transition-transform duration-200 hover:-translate-y-0.5"
          >
            Entrar agora
          </Link>
          <a
            href="#toolkit"
            className="rounded-xl border border-white/28 bg-white/6 px-6 py-2.5 text-sm font-semibold text-white/90 transition-colors hover:bg-white/14"
          >
            Ver recursos
          </a>
        </div>
      </div>
    </section>
  );
}
