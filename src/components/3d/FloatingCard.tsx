import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FloatingCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  depth?: number;
}

export const FloatingCard: React.FC<FloatingCardProps> = ({
  children,
  className,
  delay = 0,
  depth = 10,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateX: 15 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{
        y: -depth,
        rotateX: -5,
        rotateY: 5,
        scale: 1.02,
        transition: { duration: 0.3 },
      }}
      className={cn(
        "relative glass-card-hover cursor-pointer",
        className
      )}
      style={{
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
    >
      {/* 3D shadow effect */}
      <motion.div
        className="absolute -inset-2 bg-primary/5 rounded-3xl blur-xl -z-10"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      {children}
    </motion.div>
  );
};

export const Float3D: React.FC<FloatingCardProps> = ({
  children,
  className,
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.6,
        delay,
        ease: "easeOut",
      }}
      animate={{
        y: [0, -15, 0],
        rotateZ: [0, 2, -2, 0],
      }}
      // @ts-ignore - framer-motion type issue
      transition2={{
        y: {
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        },
        rotateZ: {
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        },
      }}
      className={cn("", className)}
      style={{
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </motion.div>
  );
};

export const ParallaxCard: React.FC<FloatingCardProps> = ({
  children,
  className,
}) => {
  const [rotateX, setRotateX] = React.useState(0);
  const [rotateY, setRotateY] = React.useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const posX = e.clientX - centerX;
    const posY = e.clientY - centerY;

    setRotateY(posX / 20);
    setRotateX(-posY / 20);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX, rotateY }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn("", className)}
      style={{
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
    >
      {children}
    </motion.div>
  );
};
