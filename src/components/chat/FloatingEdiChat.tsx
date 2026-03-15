import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { toast } from "sonner";
import mascoteEducy from "@/assets/edi-mascote.png";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/iacademy-chat`;

export const FloatingEdiChat = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener("open-edi-chat", handleOpenChat);
    return () => window.removeEventListener("open-edi-chat", handleOpenChat);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && !hasGreeted) {
      const greeting =
        "Olá! 👋 Eu sou o assistente da Educy. Estou aqui para te ajudar a praticar o uso de ferramentas de IA. Como posso te ajudar hoje?";
      setMessages([{ role: "assistant", content: greeting }]);
      setHasGreeted(true);
    }
  }, [isOpen, hasGreeted]);

  const handleSend = async (message: string) => {
    const userMessage: Message = { role: "user", content: message };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Add typing indicator with delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    let assistantContent = "";

    const upsertAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && prev.length > 1 && prev[prev.length - 2]?.role === "user") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantContent } : m));
        }
        return [...prev, { role: "assistant", content: assistantContent }];
      });
    };

    try {
      const conversationMessages = [...messages.filter((m, i) => !(i === 0 && m.role === "assistant")), userMessage];

      // Refresh token as fallback for long sessions
      const { refreshSession } = await import("@/hooks/useRefreshSession");
      await refreshSession();
      const { supabase } = await import("@/integrations/supabase/client");
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: t("supportChat.loginRequired") || "Você precisa estar logado para usar o chat. Faça login e tente novamente! 🔐" },
        ]);
        setIsLoading(false);
        return;
      }

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          messages: conversationMessages,
          language: i18n.language,
        }),
      });

      if (!resp.ok || !resp.body) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to connect");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let index;
        while ((index = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, index).trim();
          buffer = buffer.slice(index + 1);

          if (!line.startsWith("data:")) continue;

          const json = line.replace("data:", "").trim();
          if (json === "[DONE]") return;

          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) upsertAssistant(content);
          } catch {
            /* ignore */
          }
        }
      }
    } catch (error) {
      console.error("EDI chat error:", error);
      toast.error(t("supportChat.error") || "Error sending message");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button - FIXED / STATIC VERSION */}
      <button
        onClick={() => setIsOpen(true)}
        // O segredo está aqui: style mata qualquer animação teimosa
        style={{ transform: "none", transition: "none", animation: "none" }}
        className={cn(
          "fixed bottom-6 right-6 z-50",
          "w-14 h-14 rounded-full",
          "bg-white",
          "shadow-lg shadow-primary/30",
          "flex items-center justify-center",
          // Removido: hover:scale-110, animate-bounce-slow
          "hover:shadow-xl hover:shadow-primary/40",
          "overflow-hidden",
          isOpen && "hidden",
        )}
        aria-label="Open Educy chat"
      >
        <img src={mascoteEducy} alt="Educy" className="w-full h-full object-cover" />
        {/* Removido: animate-pulse da bolinha verde */}
        <span
          style={{ animation: "none" }}
          className="absolute top-0.5 right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white"
        />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className={cn(
            "fixed z-50 animate-fade-in",
            "bottom-6 right-6 w-[380px] h-[520px] rounded-2xl",
            "max-md:inset-0 max-md:w-full max-md:h-full max-md:rounded-none",
          )}
        >
          <div className="flex flex-col h-full bg-background border border-border rounded-2xl max-md:rounded-none shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary to-accent text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white overflow-hidden flex items-center justify-center">
                  <img src={mascoteEducy} alt="Educy" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">EDI</h3>
                  <div className="flex items-center gap-1.5">
                    {/* Removido: animate-pulse */}
                    <span className="w-2 h-2 bg-green-400 rounded-full" />
                    <span className="text-xs text-white/80">{t("supportChat.online")}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
              {messages.map((msg, index) => (
                <ChatMessage
                  key={index}
                  role={msg.role}
                  content={msg.content}
                  isStreaming={isLoading && index === messages.length - 1 && msg.role === "assistant"}
                  avatarUrl={msg.role === "assistant" ? mascoteEducy : undefined}
                />
              ))}
              {/* Typing Indicator - 3 dots animation */}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex gap-2 sm:gap-3 flex-row animate-fade-in">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 overflow-hidden bg-white">
                    <img src={mascoteEducy} alt="EDI" className="w-full h-full object-cover" />
                  </div>
                  <div className="bg-muted text-foreground rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span 
                        className="w-2.5 h-2.5 bg-muted-foreground/60 rounded-full"
                        style={{ 
                          animation: "typing-dot 1.4s infinite ease-in-out both",
                          animationDelay: "0ms"
                        }} 
                      />
                      <span 
                        className="w-2.5 h-2.5 bg-muted-foreground/60 rounded-full"
                        style={{ 
                          animation: "typing-dot 1.4s infinite ease-in-out both",
                          animationDelay: "200ms"
                        }} 
                      />
                      <span 
                        className="w-2.5 h-2.5 bg-muted-foreground/60 rounded-full"
                        style={{ 
                          animation: "typing-dot 1.4s infinite ease-in-out both",
                          animationDelay: "400ms"
                        }} 
                      />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border bg-background">
              <ChatInput onSend={handleSend} isLoading={isLoading} placeholder={t("supportChat.placeholder")} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
