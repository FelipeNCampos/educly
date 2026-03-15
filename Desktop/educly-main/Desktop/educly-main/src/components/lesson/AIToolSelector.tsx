import { cn } from "@/lib/utils";

// Import AI tool logos
import chatgptLogo from "@/assets/ai-logos/chatgpt.png";
import claudeLogo from "@/assets/ai-logos/claude.png";
import deepseekLogo from "@/assets/ai-logos/deepseek.png";
import geminiLogo from "@/assets/ai-logos/gemini.png";
import nanobananaLogo from "@/assets/ai-logos/nanobanana.png";
import lovableLogo from "@/assets/ai-logos/lovable.png";
import captionsLogo from "@/assets/ai-logos/captions.png";
import elevenlabsLogo from "@/assets/ai-logos/elevenlabs.png";

export const aiToolsConfig: Record<string, { logo: string; color: string; name: string }> = {
  'chatgpt': { logo: chatgptLogo, color: '#10a37f', name: 'ChatGPT' },
  'claude': { logo: claudeLogo, color: '#8b5cf6', name: 'Claude' },
  'deepseek': { logo: deepseekLogo, color: '#1e3a8a', name: 'DeepSeek' },
  'gemini': { logo: geminiLogo, color: '#4285f4', name: 'Gemini' },
  'nanobanana': { logo: nanobananaLogo, color: '#f59e0b', name: 'NanoBanana' },
  'lovable': { logo: lovableLogo, color: '#6366f1', name: 'Lovable' },
  'captions-ai': { logo: captionsLogo, color: '#ec4899', name: 'Captions' },
  'elevenlabs': { logo: elevenlabsLogo, color: '#f97316', name: 'ElevenLabs' },
};

interface AITool {
  slug: string;
  name: string;
  progress: number;
}

interface AIToolSelectorProps {
  tools: AITool[];
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
}

export const AIToolSelector = ({ tools, selectedSlug, onSelect }: AIToolSelectorProps) => {
  return (
    <div className="relative">
      {/* Gradient fades */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      
      {/* Scrollable container */}
      <div className="flex gap-3 overflow-x-auto pb-2 px-2 scrollbar-hide">
        {tools.map((tool) => {
          const config = aiToolsConfig[tool.slug] || aiToolsConfig['chatgpt'];
          const isSelected = selectedSlug === tool.slug;
          
          return (
            <button
              key={tool.slug}
              onClick={() => onSelect(tool.slug)}
              className={cn(
                "flex flex-col items-center gap-1 p-3 rounded-xl min-w-[80px] transition-all",
                isSelected 
                  ? "bg-primary/10 border-2 border-primary" 
                  : "bg-card border-2 border-transparent hover:border-primary/30"
              )}
            >
              {/* Logo */}
              <div 
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center",
                  isSelected ? "ring-2 ring-primary ring-offset-2" : ""
                )}
                style={{ backgroundColor: `${config.color}20` }}
              >
                <img 
                  src={config.logo} 
                  alt={tool.name}
                  className="w-8 h-8 object-contain"
                />
              </div>
              
              {/* Name */}
              <span className={cn(
                "text-xs font-medium truncate max-w-[70px]",
                isSelected ? "text-primary" : "text-foreground"
              )}>
                {tool.name}
              </span>
              
              {/* Progress */}
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all"
                  style={{ 
                    width: `${tool.progress}%`,
                    backgroundColor: config.color
                  }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">{tool.progress}%</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
