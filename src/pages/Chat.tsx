import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatPremiumGate } from "@/components/chat/ChatPremiumGate";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ediMascote from "@/assets/edi-mascote.png";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/iacademy-chat`;

const Chat = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const { isPremium, isLoading: isPremiumLoading, checkoutUrl } = usePremiumAccess();

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const aiToolContext = searchParams.get("tool") || undefined;
  const currentLanguage = i18n.language;

  // Check auth
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
      }
    };
    checkAuth();
  }, [navigate]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initial greeting - Updated to react to language changes
  useEffect(() => {
    if (isPremium) {
      const greeting = aiToolContext
        ? t("chat.greeting.withTool", { tool: aiToolContext })
        : t("chat.greeting.default");

      setMessages((prev) => {
        // If no messages exist yet, set initial greeting
        if (prev.length === 0) {
          return [
            {
              id: "greeting",
              role: "assistant",
              content: greeting,
            },
          ];
        }

        // If first message is greeting, update it with new language
        if (prev[0]?.id === "greeting") {
          return [{ ...prev[0], content: greeting }, ...prev.slice(1)];
        }

        return prev;
      });
    }
  }, [isPremium, aiToolContext, t, currentLanguage]);

  const sendMessage = async (input: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Create placeholder for assistant message
    const assistantId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      {
        id: assistantId,
        role: "assistant",
        content: "",
      },
    ]);

    try {
      // Get user's access token (not anon key)
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error(t("chat.error.notLoggedIn"));
      }

      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          messages: messages
            .filter((m) => m.id !== "greeting")
            .concat(userMessage)
            .map((m) => ({
              role: m.role,
              content: m.content,
            })),
          aiToolContext,
          language: currentLanguage,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || t("chat.error.sendError"));
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        // Process line-by-line
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: assistantContent } : m)));
            }
          } catch {
            // Incomplete JSON, put back and wait
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Save messages to database
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("chat_messages").insert([
          { user_id: user.id, role: "user", content: input, ai_tool_context: aiToolContext },
          { user_id: user.id, role: "assistant", content: assistantContent, ai_tool_context: aiToolContext },
        ]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        variant: "destructive",
        title: t("chat.error.title"),
        description: error instanceof Error ? error.message : t("chat.error.sendError"),
      });
      // Remove empty assistant message on error
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    const greeting = aiToolContext
      ? t("chat.greeting.restart", { tool: aiToolContext })
      : t("chat.greeting.restartDefault");

    setMessages([
      {
        id: "greeting",
        role: "assistant",
        content: greeting,
      },
    ]);
  };

  if (isPremiumLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">{t("chat.loading")}</div>
      </div>
    );
  }

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center">
                <img src={ediMascote} alt="EDI" className="w-8 h-8 object-contain" />
              </div>
              <span className="font-semibold text-foreground">EDI</span>
            </div>
          </div>
        </header>
        <ChatPremiumGate checkoutUrl={checkoutUrl} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col safe-area-inset">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border pt-safe">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 rounded-full hover:bg-muted transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                <img src={ediMascote} alt="EDI" className="w-8 h-8 object-contain" />
              </div>
              <div className="min-w-0">
                <span className="font-semibold text-foreground text-sm sm:text-base">EDI</span>
                {aiToolContext && (
                  <p className="text-xs text-muted-foreground truncate">
                    {t("chat.practicing")}: {aiToolContext}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Button variant="ghost" size="icon" onClick={clearChat} className="text-muted-foreground flex-shrink-0">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-3 sm:space-y-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              role={message.role}
              content={message.content}
              isStreaming={isLoading && message.role === "assistant" && message === messages[messages.length - 1]}
              avatarUrl={message.role === "assistant" ? ediMascote : undefined}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur border-t border-border pb-safe">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <ChatInput
            onSend={sendMessage}
            isLoading={isLoading}
            placeholder={
              aiToolContext ? t("chat.input.placeholderWithTool", { tool: aiToolContext }) : t("chat.input.placeholder")
            }
          />
        </div>
      </div>
    </div>
  );
};

export default Chat;
