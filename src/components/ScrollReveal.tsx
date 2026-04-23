"use client";

import {
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

type ScrollRevealProps<T extends ElementType> = {
  children: ReactNode;
  as?: T;
  className?: string;
  delayMs?: number;
  threshold?: number;
} & Omit<ComponentPropsWithoutRef<T>, "children" | "className">;

export default function ScrollReveal<T extends ElementType = "div">({
  children,
  as,
  className = "",
  delayMs = 0,
  threshold = 0.12,
  ...restProps
}: ScrollRevealProps<T>) {
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    if (!("IntersectionObserver" in window)) {
      return true;
    }

    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });
  const ref = useRef<HTMLElement | null>(null);
  const Component = (as ?? "div") as ElementType;

  useEffect(() => {
    if (isVisible) {
      return undefined;
    }

    const element = ref.current;

    if (!element) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          window.setTimeout(() => setIsVisible(true), delayMs);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin: "0px 0px -10% 0px",
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [delayMs, isVisible, threshold]);

  return (
    <Component
      ref={ref}
      className={`reveal-block ${isVisible ? "reveal-block-visible" : "reveal-block-hidden"} ${className}`.trim()}
      {...restProps}
    >
      {children}
    </Component>
  );
}