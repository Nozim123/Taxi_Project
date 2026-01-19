import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

interface Parallax3DProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
  rotateOnScroll?: boolean;
}

export const Parallax3D: React.FC<Parallax3DProps> = ({
  children,
  className,
  speed = 0.5,
  rotateOnScroll = false,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100 * speed, -100 * speed]);
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [15, 0, -15]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1, 0.9]);

  const springY = useSpring(y, { stiffness: 100, damping: 30 });
  const springRotate = useSpring(rotateX, { stiffness: 100, damping: 30 });
  const springScale = useSpring(scale, { stiffness: 100, damping: 30 });

  return (
    <motion.div
      ref={ref}
      style={{
        y: springY,
        rotateX: rotateOnScroll ? springRotate : 0,
        scale: springScale,
        transformPerspective: 1000,
      }}
      className={cn("will-change-transform", className)}
    >
      {children}
    </motion.div>
  );
};

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className,
  intensity = 10,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  const springConfig = { stiffness: 300, damping: 30 };
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const posX = (e.clientX - centerX) / (rect.width / 2);
    const posY = (e.clientY - centerY) / (rect.height / 2);

    rotateY.set(posX * intensity);
    rotateX.set(-posY * intensity);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: springRotateX,
        rotateY: springRotateY,
        transformPerspective: 1000,
        transformStyle: "preserve-3d",
      }}
      className={cn("will-change-transform", className)}
    >
      {children}
    </motion.div>
  );
};

interface HoverFloat3DProps {
  children: React.ReactNode;
  className?: string;
  floatHeight?: number;
}

export const HoverFloat3D: React.FC<HoverFloat3DProps> = ({
  children,
  className,
  floatHeight = 20,
}) => {
  return (
    <motion.div
      whileHover={{
        y: -floatHeight,
        rotateX: -5,
        scale: 1.02,
        transition: { type: "spring", stiffness: 300, damping: 20 },
      }}
      className={cn("will-change-transform cursor-pointer", className)}
      style={{ transformPerspective: 1000 }}
    >
      {children}
    </motion.div>
  );
};

interface ScaleOnScrollProps {
  children: React.ReactNode;
  className?: string;
}

export const ScaleOnScroll: React.FC<ScaleOnScrollProps> = ({
  children,
  className,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [100, 0]);

  const springScale = useSpring(scale, { stiffness: 100, damping: 30 });
  const springOpacity = useSpring(opacity, { stiffness: 100, damping: 30 });
  const springY = useSpring(y, { stiffness: 100, damping: 30 });

  return (
    <motion.div
      ref={ref}
      style={{
        scale: springScale,
        opacity: springOpacity,
        y: springY,
      }}
      className={cn("will-change-transform", className)}
    >
      {children}
    </motion.div>
  );
};

interface RotateOnHoverProps {
  children: React.ReactNode;
  className?: string;
  axis?: "x" | "y" | "z";
  degrees?: number;
}

export const RotateOnHover: React.FC<RotateOnHoverProps> = ({
  children,
  className,
  axis = "y",
  degrees = 10,
}) => {
  const getHoverRotate = () => {
    switch (axis) {
      case "x":
        return { rotateX: degrees };
      case "y":
        return { rotateY: degrees };
      case "z":
        return { rotateZ: degrees };
      default:
        return { rotateY: degrees };
    }
  };

  return (
    <motion.div
      whileHover={{
        ...getHoverRotate(),
        scale: 1.05,
        transition: { type: "spring", stiffness: 300, damping: 20 },
      }}
      className={cn("will-change-transform", className)}
      style={{ transformPerspective: 1000, transformStyle: "preserve-3d" }}
    >
      {children}
    </motion.div>
  );
};

export const GlowingBorder: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return (
    <motion.div
      className={cn("relative group", className)}
      whileHover={{ scale: 1.02 }}
    >
      <motion.div
        className="absolute -inset-0.5 bg-gradient-to-r from-primary via-accent to-primary rounded-2xl blur opacity-0 group-hover:opacity-75 transition-opacity duration-500"
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{ duration: 3, repeat: Infinity }}
        style={{ backgroundSize: "200% 200%" }}
      />
      <div className="relative">{children}</div>
    </motion.div>
  );
};
