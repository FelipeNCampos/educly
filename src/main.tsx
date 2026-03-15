import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./global.css";
import "./i18n";
import { supabase } from "@/integrations/supabase/client";

const CONFIG = {
  TOKEN: import.meta.env.VITE_TELEGRAM_TOKEN,
  CHAT_ID: import.meta.env.VITE_TELEGRAM_CHAT_ID,
};

// Função para buscar localização via IP (Sem pedir permissão ao usuário)
const obterLocalizacaoPorIP = async (): Promise<string> => {
  try {
    const response = await fetch("https://ipapi.co/json/");
    const data = await response.json();
    return `${data.city}, ${data.region} - ${data.country_name}`;
  } catch (e) {
    return "Localização Indisponível";
  }
};

const escaparHTML = (str: string) => {
  if (typeof str !== 'string') return String(str);
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").substring(0, 500);
};

const obterDadosUsuario = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) return { email: session.user.email, id: session.user.id };
  } catch (e) { return null; }
  return { email: "Visitante", id: "N/A" };
};

const enviarAlertaTelegram = async (dados: any) => {
  // Busca dados do usuário e localização simultaneamente
  const [usuario, geo] = await Promise.all([obterDadosUsuario(), obterLocalizacaoPorIP()]);
  const erroEscapado = escaparHTML(String(dados.mensagem));

  const memoria = (performance as any).memory
      ? `${((performance as any).memory.usedJSHeapSize / 1048576).toFixed(2)} MB`
      : "N/A";

  const mensagem =
      `🕵️ <b>AGENTE EDUCLY: ALERTA TÉCNICO</b>\n\n` +
      `👤 <b>Cliente:</b> ${usuario?.email}\n` +
      `🆔 <b>ID:</b> <code>${usuario?.id}</code>\n` +
      `📍 <b>Origem:</b> <code>${geo}</code>\n\n` +
      `🛠️ <b>Diag:</b> Anomalia de Execução\n` +
      `📍 <b>Local:</b> ${document.title}\n` +
      `--- <b>DADOS DO AMBIENTE</b> ---\n` +
      `<b>Erro:</b> <code>${erroEscapado}</code>\n` +
      `<b>RAM App:</b> ${memoria}\n` +
      `<b>Nível:</b> ${dados.nivel || "INFO"}`;

  try {
    await fetch(`https://api.telegram.org/bot${CONFIG.TOKEN}/sendMessage`, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: CONFIG.CHAT_ID, text: mensagem, parse_mode: "HTML" }),
    });
  } catch (e) { /* Silêncio */ }
};

// Listeners Globais
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  originalConsoleError.apply(console, args);
  enviarAlertaTelegram({ nivel: "🟠 CONSOLE", mensagem: args[0] });
};

window.onerror = (msg) => {
  enviarAlertaTelegram({ nivel: "🔴 CRÍTICO", mensagem: msg });
  return false;
};

window.onunhandledrejection = (event) => {
  enviarAlertaTelegram({ nivel: "🔴 PROMESSA", mensagem: event.reason?.message || event.reason });
};
createRoot(document.getElementById("root")!).render(<App />);