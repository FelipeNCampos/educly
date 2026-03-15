import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, RotateCcw, GraduationCap, Wand2, Target, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatPremiumGate } from "@/components/chat/ChatPremiumGate";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const AI_CONFIG: Record<string, { icon: any; gradient: { from: string; to: string }; color: string }> = {
  specialist: { icon: GraduationCap, gradient: { from: "#3b82f6", to: "#1d4ed8" }, color: "#3b82f6" },
  "prompt-creator": { icon: Wand2, gradient: { from: "#8b5cf6", to: "#7c3aed" }, color: "#8b5cf6" },
  planner: { icon: Target, gradient: { from: "#10b981", to: "#059669" }, color: "#10b981" },
  creative: { icon: Palette, gradient: { from: "#ec4899", to: "#db2777" }, color: "#ec4899" },
};

const AI_NAME_KEYS: Record<string, string> = {
  specialist: "assistants.specialist.name",
  "prompt-creator": "assistants.promptCreator.name",
  planner: "assistants.planner.name",
  creative: "assistants.creative.name",
};

const AssistantChat = () => {
  const { aiType } = useParams<{ aiType: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const { isPremium, isLoading: premiumLoading, checkoutUrl } = usePremiumAccess();

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const config = AI_CONFIG[aiType || "specialist"] || AI_CONFIG.specialist;
  const Icon = config.icon;
  const nameKey = AI_NAME_KEYS[aiType || "specialist"] || AI_NAME_KEYS.specialist;

  // Check auth
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
      }
    };
    checkAuth();
  }, [navigate]);

  // Initial greeting
  useEffect(() => {
    if (isPremium && aiType) {
      const greetingKey = `assistants.${aiType === "prompt-creator" ? "promptCreator" : aiType}.greeting`;
      const greeting = t(greetingKey);
      setMessages([{
        id: "greeting",
        role: "assistant",
        content: greeting,
      }]);
    }
  }, [isPremium, aiType, t, i18n.language]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (input: string) => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: t("chat.error.notLoggedIn"), variant: "destructive" });
        return;
      }

      // Prepare messages for API (exclude greeting)
      const apiMessages = messages
        .filter(m => m.id !== "greeting")
        .concat(userMessage)
        .map(m => ({ role: m.role, content: m.content }));

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/assistentes-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            messages: apiMessages,
            aiType,
            language: i18n.language,
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          toast({ title: t("chat.error.rateLimit") || "Rate limit exceeded", variant: "destructive" });
        } else if (response.status === 402) {
          toast({ title: t("chat.error.credits") || "Insufficient credits", variant: "destructive" });
        } else {
          toast({ title: t("chat.error.sendError"), variant: "destructive" });
        }
        setIsLoading(false);
        return;
      }

      // Check if this is a creative response (JSON with image)
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        const data = await response.json();
        
        // Handle creative AI response with image
        if (data.type === "creative") {
          const content = data.imageUrl 
            ? `${data.text}\n\n[IMAGE:${data.imageUrl}]`
            : data.text;
          
          setMessages(prev => [...prev, {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content,
          }]);
          setIsLoading(false);
          return;
        }
      }

      // Stream response for other AI types
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages(prev => [...prev, {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: "",
      }]);

      if (reader) {
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
            let line = buffer.slice(0, newlineIndex);
            buffer = buffer.slice(newlineIndex + 1);

            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (line.startsWith(":") || line.trim() === "") continue;
            if (!line.startsWith("data: ")) continue;

            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") break;

            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content as string | undefined;
              if (content) {
                assistantContent += content;
                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage?.role === "assistant") {
                    lastMessage.content = assistantContent;
                  }
                  return newMessages;
                });
              }
            } catch {
              buffer = line + "\n" + buffer;
              break;
            }
          }
        }
      }

      // Save message to database
      const { data: { user } } = await supabase.auth.getUser();
      if (user && assistantContent) {
        await supabase.from("chat_messages").insert([
          { user_id: user.id, role: "user", content: userMessage.content, ai_assistant_type: aiType },
          { user_id: user.id, role: "assistant", content: assistantContent, ai_assistant_type: aiType },
        ]);
      }

    } catch (error) {
      console.error("Chat error:", error);
      toast({ title: t("chat.error.sendError"), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    const greetingKey = `assistants.${aiType === "prompt-creator" ? "promptCreator" : aiType}.greeting`;
    setMessages([{
      id: "greeting",
      role: "assistant",
      content: t(greetingKey),
    }]);
  };

  if (premiumLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-background safe-area-inset">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <Button variant="ghost" size="sm" onClick={() => navigate("/assistentes")} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("common.back")}
          </Button>
          <ChatPremiumGate checkoutUrl={checkoutUrl} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col safe-area-inset">
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-4 py-3 border-b border-border"
        style={{
          background: `linear-gradient(135deg, ${config.gradient.from}15 0%, ${config.gradient.to}15 100%)`,
        }}
      >
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/assistentes")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${config.color}20` }}
            >
              <Icon className="w-5 h-5" style={{ color: config.color }} />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">{t(nameKey)}</h1>
              <p className="text-xs text-muted-foreground">{t("assistants.online")}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={clearChat}>
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map(message => (
            <ChatMessage key={message.id} role={message.role} content={message.content} />
          ))}
          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${config.color}20` }}
              >
                <Icon className="w-4 h-4" style={{ color: config.color }} />
              </div>
              <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="sticky bottom-0 border-t border-border bg-background px-4 py-3 pb-safe">
        <div className="max-w-3xl mx-auto">
          <ChatInput
            onSend={sendMessage}
            isLoading={isLoading}
            placeholder={t("assistants.inputPlaceholder")}
          />
        </div>
      </div>
    </div>
  );
};

export default AssistantChat;
