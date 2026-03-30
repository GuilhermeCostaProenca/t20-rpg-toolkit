"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function LandingMission() {
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const opacityA = useTransform(scrollYProgress, [0.1, 0.35], [0.2, 1]);
  const opacityB = useTransform(scrollYProgress, [0.3, 0.6], [0.2, 1]);
  const opacityC = useTransform(scrollYProgress, [0.52, 0.84], [0.2, 1]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-black py-24">
      <div className="mx-auto flex w-[min(1120px,calc(100vw-1.75rem))] flex-col gap-8 text-balance text-3xl leading-tight text-white sm:text-5xl">
        <motion.p style={{ opacity: opacityA }}>
          O mestre nao precisa escolher entre{" "}
          <span className="border-b border-sky-300/85 text-sky-200">criatividade</span> e{" "}
          <span className="border-b border-emerald-300/85 text-emerald-200">operacao</span>.
        </motion.p>
        <motion.p style={{ opacity: opacityB }}>
          O T20 OS conecta preparacao, mesa ao vivo e memoria em um{" "}
          <span className="border-b border-violet-300/85 text-violet-200">fluxo continuo</span>.
        </motion.p>
        <motion.p style={{ opacity: opacityC }}>
          Menos troca de tela.{" "}
          <span className="border-b border-amber-300/85 text-amber-200">Mais controle dramatico</span>.
        </motion.p>
      </div>
    </section>
  );
}
