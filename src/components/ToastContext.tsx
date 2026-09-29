"use client";
import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type Toast = { id: number; msg: string; type?: "success" | "info" | "error" };
const Ctx = createContext<{ toast: (msg: string, type?: Toast["type"]) => void } | null>(null);

let nextId = 1;

export function ToasterProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toast = useCallback((msg: string, type: Toast["type"] = "info") => {
    const id = nextId++;
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);
  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 min-w-[280px] animate-[slideIn_.3s_ease] ${
              t.type === "success"
                ? "bg-[#336668] text-white"
                : t.type === "error"
                ? "bg-[#ba1a1a] text-white"
                : "bg-[#1c1b1a] text-white"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {t.type === "success" ? "check_circle" : t.type === "error" ? "error" : "info"}
            </span>
            {t.msg}
          </div>
        ))}
      </div>
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(8px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>
    </Ctx.Provider>
  );
}

export function useToast() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useToast outside provider");
  return v;
}
