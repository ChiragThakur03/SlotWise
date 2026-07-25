"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { _subscribeToast } from "@/lib/toast";

interface ToastItem {
  id: string;
  message: string;
  type: "success" | "error";
}

let _counter = 0;

export function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  useEffect(() => {
    return _subscribeToast(({ message, type, key }) => {
      const id = key ?? String(++_counter);

      const existing = timers.current.get(id);
      if (existing) clearTimeout(existing);

      setToasts((prev) => {
        const exists = prev.some((t) => t.id === id);
        if (exists) return prev.map((t) => (t.id === id ? { ...t, message, type } : t));
        return [...prev, { id, message, type }];
      });

      const timer = setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        timers.current.delete(id);
      }, 3000);
      timers.current.set(id, timer);
    });
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "animate-in slide-in-from-bottom-2 fade-in pointer-events-auto flex items-center gap-2.5 rounded-card border-[0.5px] px-4 py-3 text-sm shadow-card duration-200",
            t.type === "success"
              ? "border-teal/30 bg-white text-navy"
              : "border-destructive/30 bg-white text-destructive"
          )}
        >
          {t.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-teal" />
          ) : (
            <XCircle className="h-4 w-4 shrink-0 text-destructive" />
          )}
          {t.message}
        </div>
      ))}
    </div>
  );
}
