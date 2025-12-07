"use client";

import React, { useCallback, useEffect, useMemo, useRef, forwardRef } from "react";
import type { ReactNode } from "react";
import clsx from "clsx";
import "./ScrollStack.css";

export interface ScrollStackItemProps {
  itemClassName?: string;
  children: ReactNode;
}

export const ScrollStackItem = forwardRef<HTMLElement, ScrollStackItemProps>(
  ({ children, itemClassName = "" }, ref) => (
    <article ref={ref as React.Ref<HTMLDivElement>} className={clsx("scroll-stack-card", itemClassName)}>
      {children}
    </article>
  ),
);
ScrollStackItem.displayName = "ScrollStackItem";

interface ScrollStackProps {
  className?: string;
  children: ReactNode;
  itemDistance?: number;
  itemStackDistance?: number;
  itemScale?: number;
  baseScale?: number;
  topOffset?: number;
}

/**
 * Lightweight scroll-stack inspired by React Bits. Cards translate and scale as you
 * scroll through the section, stacking upward instead of just hovering.
 */
const ScrollStack: React.FC<ScrollStackProps> = ({
  children,
  className = "",
  itemDistance = 180,
  itemStackDistance = 90,
  itemScale = 0.025,
  baseScale = 0.9,
  topOffset = 160,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<HTMLElement[]>([]);
  const rafRef = useRef<number | null>(null);

  const cards = useMemo(
    () => React.Children.toArray(children).filter(Boolean) as React.ReactElement[],
    [children],
  );

  const update = useCallback(() => {
    const container = containerRef.current;
    if (!container || cardsRef.current.length === 0) return;

    const { top, height } = container.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const containerTop = window.scrollY + top;
    const start = containerTop - topOffset;
    const end = containerTop + height - viewportHeight + topOffset;
    const rawProgress = (window.scrollY - start) / Math.max(1, end - start);
    const progress = Math.min(1, Math.max(0, rawProgress));

    cardsRef.current.forEach((card, index) => {
      const stackedOffset = index * itemStackDistance;
      const translateY = Math.max(0, progress * itemDistance + stackedOffset);
      const scale = Math.max(
        0.5,
        1 - progress * (1 - (baseScale - index * itemScale)),
      );

      card.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale})`;
    });
  }, [baseScale, itemDistance, itemScale, itemStackDistance, topOffset]);

  const onScroll = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(update);
  }, [update]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    cardsRef.current = Array.from(
      container.querySelectorAll<HTMLElement>(".scroll-stack-card"),
    );

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      cardsRef.current = [];
    };
  }, [onScroll, update, cards.length]);

  return (
    <div ref={containerRef} className={clsx("scroll-stack-scroller", className)}>
      <div className="scroll-stack-inner">
        {cards.map((child, idx) =>
          React.cloneElement(child, {
            key: idx,
            ref: (node: HTMLElement) => {
              cardsRef.current[idx] = node;
            },
          }),
        )}
        <div className="scroll-stack-end" aria-hidden />
      </div>
    </div>
  );
};

export default ScrollStack;

