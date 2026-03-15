import { cn } from "@/lib/utils";
import { Bot, User, Download } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  imageUrl?: string;
  avatarUrl?: string;
}

// Extract image URL from content if present
const extractImageFromContent = (content: string): { text: string; imageUrl: string | null } => {
  const imageMatch = content.match(/\[IMAGE:(data:image\/[^;]+;base64,[^\]]+)\]/);
  if (imageMatch) {
    return {
      text: content.replace(imageMatch[0], '').trim(),
      imageUrl: imageMatch[1]
    };
  }
  return { text: content, imageUrl: null };
};

export const ChatMessage = ({ role, content, isStreaming, imageUrl: propImageUrl, avatarUrl }: ChatMessageProps) => {
  const isUser = role === 'user';
  const { text, imageUrl: extractedImageUrl } = extractImageFromContent(content);
  const finalImageUrl = propImageUrl || extractedImageUrl;

  const handleDownload = () => {
    if (!finalImageUrl) return;
    const link = document.createElement('a');
    link.href = finalImageUrl;
    link.download = `iacademy-creative-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className={cn(
      "flex gap-2 sm:gap-3 animate-fade-in",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar */}
      <div className={cn(
        "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 overflow-hidden",
        isUser 
          ? "bg-primary text-primary-foreground" 
          : avatarUrl 
            ? "bg-violet-100" 
            : "bg-gradient-to-br from-violet-500 to-purple-600 text-white"
      )}>
        {isUser ? (
          <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        ) : avatarUrl ? (
          <img src={avatarUrl} alt="Assistant" className="w-full h-full object-cover" />
        ) : (
          <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        )}
      </div>
      
      {/* Message Bubble */}
      <div className={cn(
        "max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 py-2 sm:px-4 sm:py-3",
        isUser 
          ? "bg-primary text-primary-foreground rounded-br-md" 
          : "bg-muted text-foreground rounded-bl-md"
      )}>
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{content}</p>
        ) : (
          <div className="text-sm leading-relaxed prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:my-2 prose-strong:text-foreground prose-p:text-foreground">
            <ReactMarkdown>{text}</ReactMarkdown>
            {isStreaming && (
              <span className="inline-block w-1.5 h-4 ml-0.5 bg-current animate-pulse rounded" />
            )}
            
            {/* Generated Image */}
            {finalImageUrl && (
              <div className="mt-3 space-y-2">
                <img 
                  src={finalImageUrl} 
                  alt="Generated image" 
                  className="rounded-lg max-w-full h-auto border border-border"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDownload}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
