"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function LandingHero() {
  return (
    <section className="relative min-h-screen overflow-hidden pt-28">
      <div className="absolute inset-0">
        <video
          className="h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          poster="/arton-map.jpg"
        >
          <source
            src="https://cdn.marketing.vvd.sh/website/VVDAnimation2Vignette.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(129,170,255,0.28),transparent_36%),linear-gradient(180deg,rgba(2,3,8,0.18)_0%,rgba(2,4,12,0.86)_74%,rgba(1,1,3,0.98)_100%)]" />
      </div>

      <div className="relative mx-auto flex w-[min(1320px,calc(100vw-1.75rem))] flex-col items-center justify-center py-20 text-center sm:py-28">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-200/40 bg-cyan-200/12 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-cyan-100/90"
        >
          Novo
          <span className="text-white/75">Landing em rework premium</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="max-w-5xl text-4xl leading-[0.95] text-white sm:text-6xl lg:text-7xl"
          style={{ fontFamily: "ui-serif, Georgia, Cambria, serif" }}
        >
          Um cockpit de fantasia para mestres que levam o mundo a serio
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 max-w-2xl text-sm text-white/72 sm:text-base"
        >
          Crie, prepare e opere campanhas Tormenta 20 em um fluxo unico: do worldbuilding ate a mesa ao vivo.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.32 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            href="/app"
            className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black transition-transform duration-200 hover:-translate-y-0.5"
          >
            Entrar no cockpit
          </Link>
          <a
            href="#toolkit"
            className="rounded-xl border border-white/28 bg-white/8 px-5 py-2.5 text-sm font-semibold text-white/90 transition-colors hover:bg-white/14"
          >
            Explorar plataforma
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.44 }}
          className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-3 py-1.5 text-xs text-white/68"
        >
          <span className="inline-flex -space-x-2">
            <span className="h-5 w-5 rounded-full border border-black/50 bg-cyan-300/90" />
            <span className="h-5 w-5 rounded-full border border-black/50 bg-emerald-300/90" />
            <span className="h-5 w-5 rounded-full border border-black/50 bg-amber-300/90" />
          </span>
          Operacao testada para campanhas longas e mesa intensa
        </motion.div>
      </div>
    </section>
  );
}
