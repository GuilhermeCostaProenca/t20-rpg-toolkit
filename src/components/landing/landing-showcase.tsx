"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

import { LANDING_STAGES } from "@/components/landing/landing-data";

export function LandingShowcase() {
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const translate = useTransform(scrollYProgress, [0, 1], [0, -90]);

  return (
    <section id="showcase" ref={ref} className="relative bg-[#04070d] py-20">
      <div className="mx-auto w-[min(1320px,calc(100vw-1.75rem))]">
        <p className="text-xs uppercase tracking-[0.2em] text-white/58">Fluxo de produto</p>
        <h2
          className="mt-2 max-w-3xl text-3xl text-white sm:text-5xl"
          style={{ fontFamily: "ui-serif, Georgia, Cambria, serif" }}
        >
          Um unico eixo operacional do rascunho ate o legado
        </h2>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {LANDING_STAGES.map((stage, index) => (
            <article key={stage.id} className="rounded-3xl border border-white/12 bg-white/6 p-4 backdrop-blur-md sm:p-5">
              <p className="text-[10px] uppercase tracking-[0.16em] text-white/62">Etapa {index + 1}</p>
              <h3 className="mt-2 text-xl font-semibold text-white">{stage.title}</h3>
              <p className="mt-2 text-sm text-white/70">{stage.text}</p>
              <motion.div
                style={{ y: translate }}
                className="mt-4 overflow-hidden rounded-2xl border border-white/12 bg-black/45 p-3"
              >
                <div className="space-y-2">
                  <div className="h-7 rounded-lg border border-white/12 bg-white/10" />
                  <div className="h-7 rounded-lg border border-white/12 bg-white/8" />
                  <div className="h-24 rounded-xl border border-white/14 bg-[radial-gradient(circle_at_30%_25%,rgba(117,178,255,0.38),transparent_45%),linear-gradient(160deg,rgba(8,16,28,0.88),rgba(2,6,14,0.92))]" />
                </div>
              </motion.div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
