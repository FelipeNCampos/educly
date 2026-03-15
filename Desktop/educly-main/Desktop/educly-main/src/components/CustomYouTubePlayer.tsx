import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { Button } from "./ui/button";

interface CustomYouTubePlayerProps {
  videoUrl: string;
}

// Extrair ID do vídeo do YouTube (suporta múltiplos formatos)
const extractVideoId = (url: string): string | null => {
  // Formato: https://www.youtube.com/watch?v=VIDEO_ID
  let match = url.match(/[?&]v=([^&]+)/);
  if (match) return match[1];
  
  // Formato: https://youtu.be/VIDEO_ID
  match = url.match(/youtu\.be\/([^?]+)/);
  if (match) return match[1];
  
  // Formato: https://www.youtube.com/embed/VIDEO_ID
  match = url.match(/\/embed\/([^?]+)/);
  if (match) return match[1];
  
  return null;
};

export const CustomYouTubePlayer = ({ videoUrl }: CustomYouTubePlayerProps) => {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const videoId = extractVideoId(videoUrl);

  useEffect(() => {
    if (!videoId) {
      console.error("Video ID not found in URL:", videoUrl);
      return;
    }

    console.log("Loading video with ID:", videoId);

    const initializePlayer = () => {
      if (!(window as any).YT) {
        console.log("YouTube API not loaded yet");
        return;
      }

      console.log("Creating YouTube player");
      playerRef.current = new (window as any).YT.Player(containerRef.current, {
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          fs: 0,
          disablekb: 1,
          playsinline: 1,
          iv_load_policy: 3,
        },
        events: {
          onReady: (event: any) => {
            console.log("Player ready");
            setIsReady(true);
            event.target.playVideo();
            setIsPlaying(true);
          },
          onStateChange: (event: any) => {
            setIsPlaying(event.data === 1);
          },
          onError: (event: any) => {
            console.error("Player error:", event.data);
          },
        },
      });
    };

    // Check if API is already loaded
    if ((window as any).YT && (window as any).YT.Player) {
      console.log("YouTube API already loaded");
      initializePlayer();
    } else {
      // Load YouTube API only if it doesn't exist
      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        console.log("Loading YouTube API");
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }

      // Criar player quando API estiver pronta
      (window as any).onYouTubeIframeAPIReady = initializePlayer;
    }

    // Atualizar progresso
    const interval = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const current = playerRef.current.getCurrentTime();
        const duration = playerRef.current.getDuration();
        if (duration > 0) {
          setProgress((current / duration) * 100);
        }
      }
    }, 100);

    return () => {
      clearInterval(interval);
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
    };
  }, [videoId, videoUrl]);

  const togglePlay = () => {
    if (!playerRef.current) return;

    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const duration = playerRef.current.getDuration();
    playerRef.current.seekTo(duration * percentage);
  };

  if (!videoId) {
    return (
      <div className="glass neon-border rounded-lg p-8 text-center">
        <p className="text-muted-foreground">URL de vídeo inválido</p>
      </div>
    );
  }

  return (
    <div className="relative rounded-lg overflow-hidden neon-border bg-black">
      {/* Player do YouTube */}
      <div
        ref={containerRef}
        className="aspect-video w-full"
        style={{ pointerEvents: "none" }}
      />

      {/* Overlay com controles customizados */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
        <Button
          size="lg"
          variant="secondary"
          onClick={togglePlay}
          className="rounded-full w-16 h-16 bg-black/70 hover:bg-black/90 backdrop-blur-sm border-2 border-primary/50"
        >
          {isPlaying ? (
            <Pause className="w-8 h-8 text-primary" />
          ) : (
            <Play className="w-8 h-8 text-primary ml-1" />
          )}
        </Button>
      </div>

      {/* Barra de progresso customizada */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
        <div
          className="w-full h-1.5 bg-muted/30 rounded-full overflow-hidden cursor-pointer hover:h-2 transition-all"
          onClick={handleProgressClick}
        >
          <div
            className="h-full bg-primary transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
