"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useRef } from "react";

type ParallaxImageProps = {
  src: string;
  alt?: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
  /** How far the image travels (px) as it scrolls through the viewport. */
  strength?: number;
};

/**
 * A background image that drifts slightly as the page scrolls (classic
 * parallax). The wrapper is sized larger than the visible area and clipped
 * with `overflow: hidden`, so the vertical drift never exposes empty edges.
 */
export default function ParallaxImage({
  src,
  alt = "",
  priority,
  sizes = "100vw",
  className,
  strength = 60,
}: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [0, 0] : [-strength, strength]);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      <motion.div className="absolute inset-x-0" style={{ top: -strength, bottom: -strength, y }}>
        <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className={className} />
      </motion.div>
    </div>
  );
}
