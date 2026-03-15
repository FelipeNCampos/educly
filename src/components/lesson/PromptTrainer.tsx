import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useQuizSounds } from "@/hooks/useQuizSounds";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Bot, Send, Sparkles, Check, RefreshCw, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import mascoteEducy from "@/assets/mascote-educy.png";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/iacademy-chat`;

interface PromptTrainerProps {
  title: string;
  challenge: string;
  hints?: string[];
  successCriteria?: string[];
  examplePrompt?: string;
  topic: string;
  onComplete: () => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const PromptTrainer = ({
  title,
  challenge,
  hints = [],
  successCriteria = [],
  examplePrompt,
  topic,
  onComplete,
}: PromptTrainerProps) => {
  const { t, i18n } = useTranslation();
  const { playCorrect } = useQuizSounds();

  const [userPrompt, setUserPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const [completed, setCompleted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async () => {
    if (!userPrompt.trim() || isLoading) return;

    const newUserMessage: Message = { role: "user", content: userPrompt };
    setMessages((prev) => [...prev, newUserMessage]);
    setUserPrompt("");
    setIsLoading(true);
    setAttempts((prev) => prev + 1);

    try {
      // Refresh token as fallback for long sessions
      const { refreshSession } = await import("@/hooks/useRefreshSession");
      const freshToken = await refreshSession();
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session?.access_token && !freshToken) {
        throw new Error("Sessão expirada. Faça login novamente.");
      }

      // Na PRIMEIRA mensagem, adiciona contexto do exercício
      const isFirstMessage = messages.length === 0;
      
      let userContent: string;
      if (isFirstMessage) {
        // Primeira mensagem: inclui contexto do exercício para a IA saber o que avaliar
        userContent = `[CONTEXTO DO EXERCÍCIO DE PROMPTS]
Desafio: ${challenge}
Critérios de sucesso: ${successCriteria.join(', ')}

[PROMPT DO ALUNO PARA AVALIAR]
${userPrompt}`;
      } else {
        // Mensagens subsequentes: envia mensagem original diretamente
        userContent = userPrompt;
      }

      // Build API messages array com histórico + nova mensagem
      const apiMessages = [
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: "user" as const, content: userContent }
      ];

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify({
          messages: apiMessages,
          language: i18n.language,
          aiToolContext: 'Treino de Prompts'
        }),
      });

      if (resp.status === 429) {
        throw new Error(t("lesson.promptTrainer.errors.tooManyRequests"));
      }
      
      if (resp.status === 402) {
        throw new Error(t("lesson.promptTrainer.errors.creditsExhausted"));
      }

      if (resp.status === 401 || resp.status === 403) {
        throw new Error(t("lesson.promptTrainer.errors.unauthorized"));
      }

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || `${t("lesson.promptTrainer.errors.serverError")} (${resp.status})`);
      }

      if (!resp.body) {
        throw new Error(t("lesson.promptTrainer.errors.unknown"));
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullContent = "";
      let streamTimeout: ReturnType<typeof setTimeout> | null = null;

      // Set a timeout for the stream - if nothing comes in 30s, abort
      const streamPromise = new Promise<string>((resolve, reject) => {
        streamTimeout = setTimeout(() => {
          reject(new Error(t("lesson.promptTrainer.errors.timeout")));
        }, 30000);

        (async () => {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });

              let index;
              while ((index = buffer.indexOf("\n")) !== -1) {
                let line = buffer.slice(0, index);
                buffer = buffer.slice(index + 1);
                
                // Handle CRLF
                if (line.endsWith("\r")) {
                  line = line.slice(0, -1);
                }
                
                line = line.trim();

                // Skip empty lines and comments
                if (!line || line.startsWith(":")) continue;
                if (!line.startsWith("data:")) continue;

                const json = line.slice(5).trim();
                if (json === "[DONE]") {
                  resolve(fullContent);
                  return;
                }

                try {
                  const parsed = JSON.parse(json);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) fullContent += content;
                } catch {
                  // Partial JSON, try to recover on next chunk
                }
              }
            }
            resolve(fullContent);
          } catch (err) {
            reject(err);
          }
        })();
      });

      try {
        fullContent = await streamPromise;
      } finally {
        if (streamTimeout) clearTimeout(streamTimeout);
      }

      // Validate we got actual content
      if (!fullContent || fullContent.trim().length < 10) {
        throw new Error(t("lesson.promptTrainer.errors.emptyResponse"));
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: fullContent,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Check if prompt was approved
      if (fullContent.includes("PROMPT APROVADO") || fullContent.includes("APPROVED")) {
        playCorrect();
        setCompleted(true);
      }
    } catch (error) {
      console.error("PromptTrainer Error:", error);
      
      // Remove the user message that failed
      setMessages((prev) => prev.slice(0, -1));
      setAttempts((prev) => Math.max(0, prev - 1));
      
      const errorText = error instanceof Error ? error.message : t("lesson.promptTrainer.errors.unknown");
      const errorMessage: Message = {
        role: "assistant",
        content: `⚠️ ${errorText}\n\n${t("lesson.promptTrainer.errors.errorHint")}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const currentHint = hints[Math.min(attempts, hints.length - 1)];

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/20 to-primary/5 p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/20 overflow-hidden">
            <img src={mascoteEducy} alt="Educy" className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              {title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("lesson.promptTrainer.subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Challenge */}
      <div className="p-4 bg-muted/30 border-b border-border">
        <p className="text-sm font-medium text-primary mb-1">{t("lesson.promptTrainer.challenge", "🎯 Desafio:")}</p>
        <p className="text-foreground">{challenge}</p>

        {successCriteria.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-muted-foreground mb-1">
              {t("lesson.promptTrainer.criteria", "Critérios de sucesso:")}
            </p>
            <ul className="text-xs text-muted-foreground space-y-0.5">
              {successCriteria.map((criteria, i) => (
                <li key={i} className="flex items-start gap-1">
                  <span className="text-primary">✓</span>
                  {criteria}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="h-64 overflow-y-auto p-4 space-y-4 bg-background">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            <Bot className="w-5 h-5 mr-2 opacity-50" />
            {t("lesson.promptTrainer.startMessage", "Escreva seu prompt para começar!")}
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-2 text-sm",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted text-foreground rounded-bl-md",
                )}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:my-1 [&>ul]:my-1 [&>ol]:my-1 [&>h1]:text-base [&>h2]:text-sm [&>h3]:text-sm [&>h4]:text-sm">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                )}
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:0.1s]" />
                <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:0.2s]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Hints */}
      {!completed && attempts > 0 && currentHint && (
        <div className="px-4 pb-2">
          <button
            onClick={() => setShowHint(!showHint)}
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            <Lightbulb className="w-3 h-3" />
            {showHint ? t("lesson.promptTrainer.hideHint", "Esconder dica") : t("lesson.promptTrainer.showHint", "Ver dica")}
          </button>
          {showHint && <p className="text-xs text-muted-foreground mt-1 p-2 bg-primary/5 rounded">💡 {currentHint}</p>}
        </div>
      )}

      {/* Example */}
      {!completed && examplePrompt && attempts >= 2 && (
        <div className="px-4 pb-2">
          <button
            onClick={() => setShowExample(!showExample)}
            className="text-xs text-amber-600 hover:underline flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            {showExample ? t("lesson.promptTrainer.hideExample", "Esconder exemplo") : t("lesson.promptTrainer.showExample", "Ver exemplo de prompt")}
          </button>
          {showExample && (
            <p className="text-xs text-muted-foreground mt-1 p-2 bg-amber-500/10 rounded font-mono">{examplePrompt}</p>
          )}
        </div>
      )}

      {/* Input or Complete */}
      {completed ? (
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-2 text-success mb-3">
            <Check className="w-5 h-5" />
            <span className="font-medium">{t("lesson.promptTrainer.completed", "Prompt aprovado! Parabéns! 🎉")}</span>
          </div>
          <Button onClick={onComplete} className="w-full h-12">
            <Check className="w-4 h-4 mr-2" />
            {t("common.continue")}
          </Button>
        </div>
      ) : (
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder={t("lesson.promptTrainer.placeholder", "Digite seu prompt aqui...")}
              className="flex-1 min-h-[60px] max-h-[120px] resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <Button
              onClick={handleSubmit}
              disabled={!userPrompt.trim() || isLoading}
              size="icon"
              className="h-[60px] w-[60px]"
            >
              {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {t("lesson.promptTrainer.attempts", "Tentativas")}: {attempts}
          </p>
        </div>
      )}
    </div>
  );
};
