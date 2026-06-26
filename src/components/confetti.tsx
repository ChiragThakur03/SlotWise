"use client";

import { useMemo } from "react";

const COLORS = ["#00C2A8", "#019587", "#F5A623", "#E1F5EE", "#0D1B2A"];

export function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        left: (i * 137) % 100,
        delay: (i % 12) * 0.12,
        duration: 2.4 + (i % 5) * 0.3,
        color: COLORS[i % COLORS.length],
        rotate: (i * 53) % 360,
        size: 6 + (i % 3) * 3,
      })),
    []
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute top-[-20px] animate-confetti-fall"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.4,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}
