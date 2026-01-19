import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PhoneFrameProps {
  children: React.ReactNode;
  className?: string;
  showNotch?: boolean;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  children,
  className,
  showNotch = true,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotateX: 10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={cn(
        "relative mx-auto",
        "w-full max-w-[430px]",
        "bg-gradient-to-b from-card to-background",
        "rounded-[3rem] border-[8px] border-border/50",
        "shadow-2xl shadow-black/50",
        "overflow-hidden",
        className
      )}
      style={{
        perspective: "1000px",
        transformStyle: "preserve-3d",
      }}
    >
      {/* Phone screen bezel effect */}
      <div className="absolute inset-0 rounded-[2.5rem] border border-border/20" />
      
      {/* Dynamic Island / Notch */}
      {showNotch && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50">
          <motion.div
            initial={{ width: 80 }}
            whileHover={{ width: 120 }}
            className="h-7 bg-black rounded-full flex items-center justify-center gap-2 px-4"
          >
            <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
          </motion.div>
        </div>
      )}
      
      {/* Phone content */}
      <div className="relative min-h-[600px] max-h-[85vh] overflow-y-auto overflow-x-hidden scrollbar-hide">
        {children}
      </div>
      
      {/* Home indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
        <div className="w-32 h-1 bg-foreground/30 rounded-full" />
      </div>
    </motion.div>
  );
};

export const PhoneScreen: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return (
    <div className={cn("pt-12 pb-8 px-4", className)}>
      {children}
    </div>
  );
};
