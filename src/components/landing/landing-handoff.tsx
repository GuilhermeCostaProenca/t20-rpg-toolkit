"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";

import styles from "./landing-handoff.module.css";

const ACCENT_COLORS = ["#bc4a3f", "#4b9f91", "#d5a240", "#7b5ea7"] as const;
type Accent = (typeof ACCENT_COLORS)[number];

export function LandingHandoff() {
  const [accent, setAccent] = useState<Accent>("#bc4a3f");
  const [showSheet, setShowSheet] = useState(true);
  const [mistLevel, setMistLevel] = useState(2);

  const cssVars = useMemo(
    () =>
      ({
        "--accent": accent,
      }) as CSSProperties,
    [accent]
  );

  return (
    <main className={styles.landing} style={cssVars}>
      <header className={styles.nav}>
        <div className={styles.navPill}>
          <span className={styles.brand}>T20 OS</span>
          <nav className={styles.navLinks}>
            <a href="#demo">Demo</a>
            <a href="#install">Instalar</a>
          </nav>
          <a
            className={styles.navCta}
            href="https://github.com/GuilhermeCostaProenca/t20-rpg-toolkit"
            target="_blank"
            rel="noreferrer"
          >
            GitHub →
          </a>
        </div>
      </header>

      <section className={styles.hero} id="hero">
        <div className={styles.map} />
        <div
          className={styles.ambient}
          style={{ opacity: mistLevel === 0 ? 0.6 : mistLevel === 1 ? 0.85 : 1 }}
        />

        <div className={styles.heroInner}>
          <div className={styles.d20Wrap}>
            <div className={styles.d20Glow} />
            <svg
              width="100"
              height="100"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <polygon
                points="50,4 94,28 94,72 50,96 6,72 6,28"
                fill="rgba(24,20,30,0.95)"
                stroke="rgba(188,74,63,0.7)"
                strokeWidth="1.5"
              />
              <polygon points="50,18 82,62 18,62" fill="none" stroke="rgba(188,74,63,0.32)" strokeWidth="1" />
              <text
                x="50"
                y="48"
                textAnchor="middle"
                dominantBaseline="middle"
                fontFamily="var(--font-display)"
                fontSize="22"
                fontWeight="900"
                fill="#f4efe7"
              >
                20
              </text>
            </svg>
          </div>

          <p className={styles.eyebrow}>Sistema operacional para mestres Tormenta 20</p>
          <h1 className={styles.title}>
            Construa <em>mundos.</em>
            <br />
            Comande histórias.
          </h1>
          <p className={styles.sub}>
            Do worldbuilding à mesa ao vivo — um cockpit contínuo para mestres que levam a campanha a sério.
          </p>
          <div className={styles.actions}>
            <a className={styles.btnPrimary} href="/mestre">
              Entrar no cockpit do mestre
            </a>
            <a className={styles.btnGhost} href="/app">
              Abrir painel atual
            </a>
          </div>
        </div>
      </section>

      <aside className={styles.tweakCard}>
        <h2 className={styles.tweakTitle}>Tweaks</h2>

        <div className={styles.tweakGroup}>
          <p className={styles.tweakLabel}>Cor de destaque</p>
          <div className={styles.swatches}>
            {ACCENT_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                aria-label={`Cor ${color}`}
                className={`${styles.swatch} ${accent === color ? styles.swatchActive : ""}`}
                style={{ background: color }}
                onClick={() => setAccent(color)}
              />
            ))}
          </div>
        </div>

        <div className={styles.toggleRow}>
          <span>Mostrar ficha</span>
          <button
            type="button"
            className={`${styles.toggle} ${showSheet ? "" : styles.toggleOff}`}
            onClick={() => setShowSheet((v) => !v)}
            aria-label="Mostrar ficha"
          >
            <span className={styles.toggleKnob} />
          </button>
        </div>

        <div className={styles.tweakGroup}>
          <p className={styles.tweakLabel}>Névoa: {mistLevel === 0 ? "Nenhuma" : mistLevel === 1 ? "Média" : "Alta"}</p>
          <input
            className={styles.slider}
            type="range"
            min={0}
            max={2}
            step={1}
            value={mistLevel}
            onChange={(event) => setMistLevel(Number(event.target.value))}
          />
        </div>
      </aside>
    </main>
  );
}
