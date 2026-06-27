"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const Ctx = createContext<{ start: () => void }>({ start: () => {} });
export const useProgressStart = () => useContext(Ctx).start;

export function NavigationProgressProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prevPath = useRef(pathname);
  const [width, setWidth] = useState(0);
  const [visible, setVisible] = useState(false);
  const doneTimer = useRef<ReturnType<typeof setTimeout>>();

  function start() {
    clearTimeout(doneTimer.current);
    setVisible(true);
    setWidth(0);
    requestAnimationFrame(() => requestAnimationFrame(() => setWidth(72)));
  }

  useEffect(() => {
    if (pathname === prevPath.current) return;
    prevPath.current = pathname;
    clearTimeout(doneTimer.current);
    setWidth(100);
    doneTimer.current = setTimeout(() => {
      setVisible(false);
      setWidth(0);
    }, 350);
  }, [pathname]);

  return (
    <Ctx.Provider value={{ start }}>
      {children}
      <div
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          zIndex: 9999,
          pointerEvents: "none",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.3s",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${width}%`,
            background: "#4ECDC4",
            transition: width === 0 ? "none" : width >= 100 ? "width 0.25s ease-in" : "width 0.9s ease-out",
          }}
        />
      </div>
    </Ctx.Provider>
  );
}
