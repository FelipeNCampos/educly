import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { toast } from "sonner";
import mascoteEducy from "@/assets/mascote-educy.png";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/landing-support-chat`;

export const FloatingSupportChat = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener("open-support-chat", handleOpenChat);
    return () => window.removeEventListener("open-support-chat", handleOpenChat);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && !hasGreeted) {
      const greeting = t("supportChat.greeting");
      setMessages([{ role: "assistant", content: greeting }]);
      setHasGreeted(true);
    }
  }, [isOpen, hasGreeted, t]);

  const handleSend = async (message: string) => {
    const userMessage: Message = { role: "user", content: message };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

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

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: conversationMessages,
          locale: i18n.language,
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
      console.error("Support chat error:", error);
      toast.error(t("supportChat.error") || "Error sending message");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button - VERSÃO TOTALMENTE ESTÁTICA */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50",
          "w-20 h-20 rounded-full",
          "bg-white",
          "shadow-lg shadow-primary/30",
          "flex items-center justify-center",
          // Removi hover effects e transitions para garantir que não se mova
          "overflow-hidden",
          isOpen && "hidden",
        )}
        aria-label="Open support chat"
      >
        <img src={mascoteEducy} alt="Educy" className="w-full h-full object-cover" />
        {/* Removi animate-pulse daqui também */}
        <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className={cn(
            // Removi animação de entrada da janela também para garantir
            "fixed z-50",
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
                    {/* Removi animate-pulse do indicador de status interno */}
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
