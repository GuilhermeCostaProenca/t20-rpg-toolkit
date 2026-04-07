"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.2, 0.65, 0.3, 0.9] }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div className="mx-auto mt-4 flex w-[min(1320px,calc(100vw-1.75rem))] items-center justify-between rounded-2xl border border-white/10 px-4 py-3 backdrop-blur-xl transition-colors duration-300 sm:px-6">
        <div
          className="absolute inset-0 -z-10 rounded-2xl"
          style={{
            background: scrolled
              ? "linear-gradient(140deg, rgba(7, 10, 18, 0.88), rgba(9, 15, 30, 0.76))"
              : "linear-gradient(140deg, rgba(7, 10, 18, 0.55), rgba(9, 15, 30, 0.4))",
          }}
        />
        <Link href="/" className="text-sm font-semibold tracking-[0.18em] text-white">
          T20 OS
        </Link>
        <div className="hidden items-center gap-6 text-xs text-white/72 md:flex">
          <a href="#toolkit" className="transition-colors hover:text-white">
            Plataforma
          </a>
          <a href="#showcase" className="transition-colors hover:text-white">
            Fluxo
          </a>
          <a href="#cta" className="transition-colors hover:text-white">
            Testar
          </a>
        </div>
        <Link
          href="#toolkit"
          className="rounded-xl border border-white/25 bg-white px-3 py-1.5 text-xs font-semibold text-black transition-transform duration-200 hover:-translate-y-0.5"
        >
          Ver plataforma
        </Link>
      </div>
    </motion.nav>
  );
}
