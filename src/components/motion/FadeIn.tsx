"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

type FadeInProps = {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  /** Play once on mount instead of waiting for scroll — use for above-the-fold content. */
  onMount?: boolean;
};

/**
 * Elegant fade + slide-up reveal, either on mount or the first time the
 * element scrolls into view. The scroll-triggered path also force-reveals
 * after a short timeout: some in-app browsers (e.g. LINE's) don't reliably
 * fire the viewport IntersectionObserver, which would otherwise leave the
 * content permanently invisible.
 *
 * Uses a plain visible/hidden boolean rather than useAnimation() + imperative
 * .start() — the imperative controls API was unreliable here (the returned
 * promise never settled and the element stayed stuck at opacity 0).
 */
export default function FadeIn({ children, delay = 0, y = 24, className, onMount = false }: FadeInProps) {
  const shouldReduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const revealedRef = useRef(false);

  const variants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : y },
    visible: { opacity: 1, y: 0 },
  };

  function reveal() {
    if (revealedRef.current) return;
    revealedRef.current = true;
    setVisible(true);
  }

  useEffect(() => {
    if (onMount) {
      reveal();
      return;
    }
    const timeout = setTimeout(reveal, 1000);
    return () => clearTimeout(timeout);
  }, [onMount]);

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate={visible ? "visible" : "hidden"}
      viewport={onMount ? undefined : { once: true, margin: "-80px" }}
      onViewportEnter={onMount ? undefined : reveal}
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
