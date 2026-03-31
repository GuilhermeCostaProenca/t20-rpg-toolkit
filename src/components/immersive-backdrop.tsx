"use client";

import { useEffect, useState } from "react";

type OffsetState = {
  x: number;
  y: number;
};

const VIDEO_SOURCES = [
  "https://cdn.coverr.co/videos/coverr-dark-mountain-clouds-5170/1080p.mp4",
  "https://cdn.coverr.co/videos/coverr-mountain-fog-1579/1080p.mp4",
];

export function ImmersiveBackdrop() {
  const [offset, setOffset] = useState<OffsetState>({ x: 0, y: 0 });
  const [videoFailed, setVideoFailed] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;

    let raf = 0;
    const onMove = (event: MouseEvent) => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const x = (event.clientX / window.innerWidth - 0.5) * 2;
        const y = (event.clientY / window.innerHeight - 0.5) * 2;
        setOffset({
          x: Number((x * 8).toFixed(3)),
          y: Number((y * 6).toFixed(3)),
        });
      });
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
    };
  }, [reduceMotion]);

  return (
    <div className="app-immersive-backdrop" aria-hidden="true">
      {!videoFailed ? (
        <video
          className="app-immersive-video"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          onError={() => setVideoFailed(true)}
        >
          {VIDEO_SOURCES.map((source) => (
            <source key={source} src={source} type="video/mp4" />
          ))}
        </video>
      ) : null}

      <div className="app-immersive-vignette" />
      <div className="app-immersive-grain" />

      <div
        className="app-immersive-layer app-immersive-layer--near"
        style={{
          transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
        }}
      />
      <div
        className="app-immersive-layer app-immersive-layer--mid"
        style={{
          transform: `translate3d(${offset.x * -0.6}px, ${offset.y * -0.5}px, 0)`,
        }}
      />
      <div
        className="app-immersive-layer app-immersive-layer--far"
        style={{
          transform: `translate3d(${offset.x * 0.25}px, ${offset.y * 0.25}px, 0)`,
        }}
      />
    </div>
  );
}
