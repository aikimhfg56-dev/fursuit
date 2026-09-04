"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode } from "react";

type FadeInProps = {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  /** Play once on mount instead of waiting for scroll — use for above-the-fold content. */
  onMount?: boolean;
};

/** Elegant fade + slide-up reveal, either on mount or the first time the element scrolls into view. */
export default function FadeIn({ children, delay = 0, y = 24, className, onMount = false }: FadeInProps) {
  const shouldReduceMotion = useReducedMotion();

  const variants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : y },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate={onMount ? "visible" : undefined}
      whileInView={onMount ? undefined : "visible"}
      viewport={onMount ? undefined : { once: true, margin: "-80px" }}
      variants={variants}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.7,
        delay: shouldReduceMotion ? 0 : delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
