"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { LANDING_FEATURES } from "@/components/landing/landing-data";

const TAB_DURATION_MS = 4800;

export function LandingToolkit() {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
    const start = Date.now();

    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const value = Math.min((elapsed / TAB_DURATION_MS) * 100, 100);
      setProgress(value);
    }, 40);

    timeoutRef.current = setTimeout(() => {
      setActive((prev) => (prev + 1) % LANDING_FEATURES.length);
    }, TAB_DURATION_MS);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [active]);

  const activeFeature = LANDING_FEATURES[active];

  return (
    <section id="toolkit" className="relative overflow-hidden py-20 sm:py-24">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#070b14_0%,#0a111f_38%,#122238_58%,#0d1828_82%,#060910_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_35%,rgba(92,162,255,0.24),transparent_44%)]" />

      <div className="relative mx-auto w-[min(1320px,calc(100vw-1.75rem))]">
        <div className="mb-8 max-w-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/72">Plataforma</p>
          <h2
            className="mt-2 text-3xl text-white sm:text-5xl"
            style={{ fontFamily: "ui-serif, Georgia, Cambria, serif" }}
          >
            Tudo para criar, operar e lembrar seu mundo
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-[360px_1fr] lg:items-start">
          <div className="space-y-3">
            {LANDING_FEATURES.map((feature, index) => {
              const isActive = index === active;
              return (
                <button
                  key={feature.id}
                  type="button"
                  onClick={() => setActive(index)}
                  className="relative w-full overflow-hidden rounded-2xl border border-white/15 bg-white/6 px-4 py-3 text-left backdrop-blur-md transition-opacity duration-300 hover:opacity-100"
                  style={{ opacity: isActive ? 1 : 0.58 }}
                >
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/62">{feature.eyebrow}</p>
                  <p className="mt-1 text-sm font-semibold text-white">{feature.title}</p>
                  <AnimatePresence initial={false}>
                    {isActive ? (
                      <motion.p
                        key="desc"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="mt-2 overflow-hidden text-xs leading-relaxed text-white/68"
                      >
                        {feature.description}
                      </motion.p>
                    ) : null}
                  </AnimatePresence>
                  {isActive ? (
                    <div className="absolute inset-x-0 bottom-0 h-0.5 bg-white/10">
                      <div className="h-full bg-white/60 transition-none" style={{ width: `${progress}%` }} />
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeFeature.id}
              initial={{ opacity: 0.25, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0.25, y: -12 }}
              transition={{ duration: 0.35 }}
              className="relative overflow-hidden rounded-[24px] border border-white/14 bg-[#050a12] p-5 sm:p-7"
            >
              <div
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(circle at 20% 20%, ${activeFeature.accentFrom}55, transparent 45%), radial-gradient(circle at 80% 90%, ${activeFeature.accentTo}4a, transparent 42%)`,
                }}
              />
              <div className="relative grid gap-5 sm:grid-cols-2">
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/65">Visao ativa</p>
                  <h3 className="text-xl font-semibold text-white">{activeFeature.previewTitle}</h3>
                  <p className="text-sm text-white/70">{activeFeature.description}</p>
                </div>
                <div className="space-y-3 rounded-2xl border border-white/12 bg-black/38 p-4">
                  <p className="text-xs uppercase tracking-[0.15em] text-white/58">Painel</p>
                  <div className="space-y-2">
                    <div className="h-8 rounded-lg border border-white/12 bg-white/10" />
                    <div className="h-8 rounded-lg border border-white/12 bg-white/8" />
                    <div className="h-24 rounded-xl border border-white/14 bg-black/45" />
                  </div>
                  <div
                    className="h-1.5 rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${activeFeature.accentFrom}, ${activeFeature.accentTo})`,
                    }}
                  />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
