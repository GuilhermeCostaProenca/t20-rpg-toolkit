"use client";

import { motion } from "framer-motion";

import { LANDING_GENRES } from "@/components/landing/landing-data";

const HEIGHTS = ["h-60", "h-72", "h-64", "h-80", "h-64", "h-72"];
const SHADES = [
  "from-sky-400/40 to-indigo-500/30",
  "from-amber-300/40 to-orange-500/35",
  "from-emerald-300/40 to-cyan-500/30",
  "from-violet-300/40 to-fuchsia-500/30",
  "from-rose-300/40 to-red-500/35",
  "from-lime-300/40 to-teal-500/35",
];

export function LandingGenres() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-20">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#060910_0%,#111e33_50%,#060910_100%)]" />
      <div className="relative mx-auto w-[min(1320px,calc(100vw-1.75rem))]">
        <p className="text-xs uppercase tracking-[0.2em] text-white/60">Generos e tons</p>
        <h2
          className="mt-2 text-3xl text-white sm:text-5xl"
          style={{ fontFamily: "ui-serif, Georgia, Cambria, serif" }}
        >
          Feito para mundos radicalmente diferentes
        </h2>
        <div className="mt-7 flex snap-x gap-4 overflow-x-auto pb-3">
          {LANDING_GENRES.map((genre, index) => (
            <motion.article
              key={genre.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.38, delay: index * 0.06 }}
              className={`snap-start shrink-0 overflow-hidden rounded-3xl border border-white/14 bg-gradient-to-br ${SHADES[index % SHADES.length]} ${HEIGHTS[index % HEIGHTS.length]} w-56 p-4`}
            >
              <div className="flex h-full flex-col justify-between rounded-2xl border border-white/22 bg-black/42 p-4 backdrop-blur-md">
                <p className="text-[10px] uppercase tracking-[0.15em] text-white/68">Template narrativo</p>
                <h3 className="text-lg font-semibold text-white">{genre.label}</h3>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
