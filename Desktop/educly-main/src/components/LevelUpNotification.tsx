import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Sparkles } from "lucide-react";
import { LEVEL_TITLES } from "@/hooks/useUserLevel";

interface LevelUpNotificationProps {
  level: number;
  isVisible: boolean;
  onClose: () => void;
}

export const LevelUpNotification = ({ level, isVisible, onClose }: LevelUpNotificationProps) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: -100 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: -100 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none"
        >
          <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 p-1 rounded-2xl shadow-2xl">
            <div className="bg-background rounded-xl px-8 py-6 text-center relative overflow-hidden">
              {/* Sparkles animation */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 opacity-20"
              >
                <Sparkles className="absolute top-2 left-4 w-6 h-6 text-amber-500" />
                <Sparkles className="absolute top-4 right-6 w-4 h-4 text-yellow-500" />
                <Sparkles className="absolute bottom-3 left-8 w-5 h-5 text-amber-400" />
                <Sparkles className="absolute bottom-2 right-4 w-6 h-6 text-yellow-400" />
              </motion.div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="relative z-10"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                  <span className="text-sm font-bold text-amber-600 uppercase tracking-wider">
                    Level Up!
                  </span>
                  <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                </div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 150 }}
                  className="text-5xl font-black bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 bg-clip-text text-transparent"
                >
                  {level}
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-lg font-bold text-foreground mt-2"
                >
                  {LEVEL_TITLES[level]}
                </motion.p>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-sm text-muted-foreground mt-1"
                >
                  Continue aprendendo para subir ainda mais!
                </motion.p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
