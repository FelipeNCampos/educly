import { useEffect, useState } from "react";

const PRESERVED_KEYS = [
  "has_seen_dashboard_tutorial_v12",
  "tutorial_dashboard",
];

const ResetCache = () => {
  const [status, setStatus] = useState("Limpando cache...");

  useEffect(() => {
    const run = async () => {
      try {
        // 1. Preserve tutorial keys
        const preserved = new Map<string, string>();
        [...PRESERVED_KEYS, ...Object.keys(localStorage).filter(k => k.startsWith("tutorial_dashboard_"))].forEach(key => {
          const v = localStorage.getItem(key);
          if (v !== null) preserved.set(key, v);
        });

        // 2. Unregister all Service Workers
        if ("serviceWorker" in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations();
          await Promise.all(regs.map(r => r.unregister()));
        }

        // 3. Clear Cache Storage
        if ("caches" in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map(k => caches.delete(k)));
        }

        // 4. Clear storage
        localStorage.clear();
        sessionStorage.clear();

        // 5. Restore preserved keys
        preserved.forEach((v, k) => localStorage.setItem(k, v));

        setStatus("Cache limpo! Redirecionando...");
      } catch {
        setStatus("Erro ao limpar. Redirecionando...");
      }

      // Redirect after brief delay (hard navigation for clean load)
      setTimeout(() => {
        window.location.href = "/auth";
      }, 1500);
    };

    run();
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "#0f172a",
      color: "#e2e8f0",
      fontFamily: "system-ui, sans-serif",
      gap: "16px",
    }}>
      <div style={{
        width: "40px",
        height: "40px",
        border: "3px solid rgba(99,102,241,0.3)",
        borderTopColor: "#6366f1",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <p style={{ fontSize: "18px" }}>{status}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default ResetCache;
