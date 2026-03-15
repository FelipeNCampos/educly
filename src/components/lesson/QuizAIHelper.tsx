import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, User, X, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";
import mascoteEducy from "@/assets/mascote-educy.png";

interface Message {
  role: "user" | "ai";
  text: string;
}

interface QuizAIHelperProps {
  question: string;
  correctAnswer: string;
  topic?: string;
  isOpen: boolean;
  onClose: () => void;
  wrongAttempts?: number;
}

export const QuizAIHelper = ({
  question,
  correctAnswer,
  topic = "quiz_help",
  isOpen,
  onClose,
  wrongAttempts = 1,
}: QuizAIHelperProps) => {
  const { t, i18n } = useTranslation();
  const { isPremium, isLoading: isPremiumLoading, checkoutUrl } = usePremiumAccess();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Generate progressive hints based on attempts
  const getProgressiveHint = (attempts: number): string => {
    const preview = `${correctAnswer.substring(0, Math.min(15, correctAnswer.length))}...`;

    if (i18n.language === "pt") {
      if (attempts === 1) {
        return `Olá! Eu sou o assistente de estudos da Educy.\n\nPergunta: ${question}\n\nDica 1: Releia a questão com calma. Qual é o conceito principal sendo testado aqui?\n\nMe diga: o que você está pensando sobre essa questão?`;
      } else if (attempts === 2) {
        return `Ainda com dificuldade? Sem problemas.\n\nDica 2: Pense no contexto da aula. A resposta está relacionada a um conceito que acabamos de estudar.\n\nO que você entendeu até agora sobre esse tema?`;
      } else {
        return `Vamos lá, eu acredito em você.\n\nDica 3: A resposta correta está conectada com: **${preview}**\n\nQuer que eu explique o conceito por trás da resposta?`;
      }
    } else if (i18n.language === "es") {
      if (attempts === 1) {
        return `Hola. Soy EDI, tu asistente de estudios.\n\nPregunta: ${question}\n\nPista 1: Lee la pregunta con calma. ¿Cuál es el concepto principal que se está evaluando?\n\nCuéntame: ¿qué piensas sobre esta pregunta?`;
      } else if (attempts === 2) {
        return `¿Todavía con dificultad? No hay problema.\n\nPista 2: Piensa en el contexto de la lección. La respuesta está relacionada con un concepto que acabamos de estudiar.`;
      } else {
        return `Vamos, confío en ti.\n\nPista 3: La respuesta correcta está conectada con: **${preview}**`;
      }
    } else if (i18n.language === "en") {
      if (attempts === 1) {
        return `Hi. I'm EDI, your study assistant.\n\nQuestion: ${question}\n\nHint 1: Read the question carefully. What is the main concept being tested here?\n\nTell me: what are you thinking about this question?`;
      } else if (attempts === 2) {
        return `Still having trouble? No problem.\n\nHint 2: Think about the lesson context. The answer is related to a concept we just studied.`;
      } else {
        return `Come on, I believe in you.\n\nHint 3: The correct answer is connected to: **${preview}**`;
      }
    } else if (i18n.language === "fr") {
      if (attempts === 1) {
        return `Bonjour. Je suis EDI, ton assistant d’étude.\n\nQuestion : ${question}\n\nIndice 1 : Relis la question calmement. Quel est le concept principal testé ici ?\n\nDis-moi ce que tu en penses.`;
      } else if (attempts === 2) {
        return `Encore des difficultés ? Aucun souci.\n\nIndice 2 : Pense au contexte du cours. La réponse est liée à un concept que nous venons d’étudier.`;
      } else {
        return `Allons-y, j’y crois.\n\nIndice 3 : La bonne réponse est liée à : **${preview}**`;
      }
    } else if (i18n.language === "de") {
      if (attempts === 1) {
        return `Hallo. Ich bin EDI, dein Lernassistent.\n\nFrage: ${question}\n\nHinweis 1: Lies die Frage in Ruhe. Welches Hauptkonzept wird hier getestet?\n\nWas denkst du bisher?`;
      } else if (attempts === 2) {
        return `Noch Schwierigkeiten? Kein Problem.\n\nHinweis 2: Denke an den Unterrichtskontext. Die Antwort hängt mit einem gerade gelernten Konzept zusammen.`;
      } else {
        return `Los geht’s, ich glaube an dich.\n\nHinweis 3: Die richtige Antwort hängt zusammen mit: **${preview}**`;
      }
    } else if (i18n.language === "it") {
      if (attempts === 1) {
        return `Ciao. Sono EDI, il tuo assistente di studio.\n\nDomanda: ${question}\n\nSuggerimento 1: Rileggi la domanda con calma. Qual è il concetto principale?\n\nDimmi cosa ne pensi.`;
      } else if (attempts === 2) {
        return `Hai ancora difficoltà? Nessun problema.\n\nSuggerimento 2: Pensa al contesto della lezione. La risposta è collegata a un concetto appena studiato.`;
      } else {
        return `Forza, credo in te.\n\nSuggerimento 3: La risposta corretta è collegata a: **${preview}**`;
      }
    } else if (i18n.language === "ru") {
      if (attempts === 1) {
        return `Привет. Я EDI, твой помощник в обучении.\n\nВопрос: ${question}\n\nПодсказка 1: Внимательно прочитай вопрос. Какое ключевое понятие здесь проверяется?\n\nЧто ты думаешь?`;
      } else if (attempts === 2) {
        return `Все еще сложно? Ничего страшного.\n\nПодсказка 2: Вспомни контекст урока. Ответ связан с темой, которую мы недавно изучали.`;
      } else {
        return `Я верю в тебя.\n\nПодсказка 3: Правильный ответ связан с: **${preview}**`;
      }
    } else if (i18n.language === "tr") {
      if (attempts === 1) {
        return `Merhaba. Ben EDI, senin öğrenme asistanınım.\n\nSoru: ${question}\n\nİpucu 1: Soruyu dikkatlice oku. Burada test edilen ana kavram nedir?\n\nNe düşünüyorsun?`;
      } else if (attempts === 2) {
        return `Hâlâ zor mu? Sorun değil.\n\nİpucu 2: Dersin bağlamını düşün. Cevap, yeni öğrendiğimiz bir kavramla bağlantılı.`;
      } else {
        return `Sana inanıyorum.\n\nİpucu 3: Doğru cevap şu kavramla bağlantılı: **${preview}**`;
      }
    } else {
      if (attempts === 1) {
        return `Hi. I'm EDI, your study assistant.\n\nQuestion: ${question}\n\nHint 1: Read the question carefully. What is the main concept being tested here?`;
      } else if (attempts === 2) {
        return `Still having trouble? No problem.\n\nHint 2: Think about the lesson context.`;
      } else {
        return `I believe in you.\n\nHint 3: The correct answer is connected to: **${preview}**`;
      }
    }
  };

  // Initialize with context message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ role: "ai", text: getProgressiveHint(wrongAttempts) }]);
    }
  }, [isOpen, question, i18n.language, wrongAttempts]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const streamChat = async (userMessages: { role: string; content: string }[]) => {
    try {
      // Refresh token as fallback for long sessions
      const { refreshSession } = await import("@/hooks/useRefreshSession");
      await refreshSession();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/iacademy-chat`;

      // Add context about the quiz to help the AI
      const contextMessage = {
        role: "system",
        content: `O usuário está tentando responder uma questão de quiz e errou. Ajude-o a entender o conceito SEM dar a resposta direta. A pergunta é: "${question}". A resposta correta é: "${correctAnswer}". Guie o aluno com perguntas e dicas para que ele chegue à resposta por conta própria. Use o método socrático.`,
      };

      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          messages: userMessages,
          aiToolContext: topic,
          language: i18n.language,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("rate_limit");
        }
        if (response.status === 402) {
          throw new Error("payment_required");
        }
        throw new Error("Failed to connect");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let textBuffer = "";
      let fullResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

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
              fullResponse += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "ai") {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, text: fullResponse } : m));
                }
                return [...prev, { role: "ai", text: fullResponse }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMsg =
        error instanceof Error && error.message === "rate_limit"
          ? "Muitas mensagens! Aguarde um momento..."
          : error instanceof Error && error.message === "payment_required"
            ? "Créditos esgotados. Entre em contato com o suporte."
            : "Erro ao conectar. Tente novamente.";

      setMessages((prev) => [...prev, { role: "ai", text: errorMsg }]);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setIsTyping(true);

    // Build message history for API
    const apiMessages = messages.map((m) => ({
      role: m.role === "ai" ? "assistant" : "user",
      content: m.text,
    }));
    apiMessages.push({ role: "user", content: userMessage });

    await streamChat(apiMessages);
    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-background border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[70vh] max-h-[600px]">
        {/* Header */}
        <div className="bg-primary p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center">
              <img src={mascoteEducy} alt="EDI" className="w-10 h-10 object-contain" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">EDI - {t("lesson.ediChat.subtitle") || "Seu Assistente de IA"}</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-xs text-white/80">{t("lesson.ediChat.online") || "Pronto para te ajudar"}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-white/10 p-1.5 rounded-lg text-white/80">
              <Sparkles size={16} />
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-white/80 hover:bg-white/10 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 bg-muted/30 p-4 space-y-4 overflow-y-auto">
          {messages.map((msg, idx) => (
            <div key={idx} className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "")}>
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1",
                  msg.role === "user" && "bg-muted text-muted-foreground",
                )}
              >
                {msg.role === "ai" ? (
                  <img src={mascoteEducy} alt="Educy" className="w-8 h-8 object-contain" />
                ) : (
                  <User size={14} />
                )}
              </div>
              <div
                className={cn(
                  "p-3.5 rounded-2xl text-sm max-w-[85%] leading-relaxed whitespace-pre-wrap",
                  msg.role === "ai"
                    ? "bg-card border border-border text-foreground rounded-tl-none"
                    : "bg-primary text-primary-foreground rounded-tr-none",
                )}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1">
                <img src={mascoteEducy} alt="Educy" className="w-8 h-8 object-contain" />
              </div>
              <div className="bg-card border border-border p-4 rounded-2xl rounded-tl-none flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input - Premium Only Chat */}
        {isPremium ? (
          <div className="p-3 bg-background border-t">
            <div className="relative flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t("chat.inputPlaceholder")}
                disabled={isTyping}
                className="w-full bg-muted/30 border border-input rounded-full py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className={cn(
                  "absolute right-2 p-2 rounded-full text-white transition-all",
                  input.trim() && !isTyping ? "bg-primary hover:bg-primary/90" : "bg-muted cursor-not-allowed",
                )}
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-background border-t">
            <a
              href={checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-primary/10 hover:bg-primary/20 text-primary rounded-full text-sm font-medium transition-colors"
            >
              <Lock size={14} />
              {i18n.language === "pt"
                ? "Desbloquear chat com Edi"
                : i18n.language === "es"
                  ? "Desbloquear chat con Edi"
                  : "Unlock chat with Edi"}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
