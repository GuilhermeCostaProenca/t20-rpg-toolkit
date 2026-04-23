"use client";

import { motion } from "framer-motion";

import { LANDING_STAGES } from "@/components/landing/landing-data";

export function LandingFlow() {
  return (
    <section
      id="flow"
      className="relative overflow-hidden py-20 sm:py-24"
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#060910_0%,#08101c_50%,#060910_100%)]" />

      <div className="relative mx-auto w-[min(1320px,calc(100vw-1.75rem))]">
        <div className="mb-12 text-center">
          <p className="text-xs uppercase tracking-[0.22em] text-amber-200/72">
            Ciclo completo de jogo
          </p>
          <h2
            className="mt-3 text-3xl text-white sm:text-4xl"
            style={{ fontFamily: "ui-serif, Georgia, Cambria, serif" }}
          >
            Do começo ao fim. E de volta.
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {LANDING_STAGES.map((stage, index) => (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="relative overflow-hidden rounded-[20px] border border-white/7 p-7"
              style={{
                background:
                  "linear-gradient(145deg, rgba(8,8,13,0.9), rgba(12,10,13,0.8)), radial-gradient(circle at top left, rgba(188,74,63,0.1), transparent 40%)",
              }}
            >
              <div
                className="mb-4 font-serif text-4xl font-black"
                style={{
                  fontFamily: "ui-serif, Georgia, Cambria, serif",
                  color: "rgba(188,74,63,0.25)",
                  letterSpacing: "0.04em",
                }}
              >
                {String(index + 1).padStart(2, "0")}
              </div>
              <h3 className="mb-3 text-base font-bold tracking-[0.01em] text-foreground">
                {stage.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {stage.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
