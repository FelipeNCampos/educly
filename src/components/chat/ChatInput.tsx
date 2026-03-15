import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export const ChatInput = ({ onSend, isLoading, placeholder }: ChatInputProps) => {
  const { t } = useTranslation();
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end">
      <div className="flex-1 relative">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || t('chat.input.placeholder')}
          disabled={isLoading}
          rows={1}
          className={cn(
            "w-full resize-none rounded-xl border border-input bg-background px-4 py-3 pr-12",
            "text-sm placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "min-h-[48px] max-h-[120px]"
          )}
          style={{
            height: 'auto',
            minHeight: '48px'
          }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = Math.min(target.scrollHeight, 120) + 'px';
          }}
        />
      </div>
      
      <Button
        type="submit"
        size="icon"
        disabled={!input.trim() || isLoading}
        className={cn(
          "h-12 w-12 rounded-xl shrink-0",
          "bg-gradient-to-r from-violet-500 to-purple-600",
          "hover:from-violet-600 hover:to-purple-700",
          "disabled:opacity-50"
        )}
      >
        <Send className={cn(
          "w-5 h-5",
          isLoading && "animate-pulse"
        )} />
      </Button>
    </form>
  );
};
