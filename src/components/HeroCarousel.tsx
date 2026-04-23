"use client";

import Image from "next/image";
import Link from "next/link";
import {
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useState,
} from "react";

export type HeroCarouselSlide = {
  src: string;
  alt: string;
};

export type HeroCarouselCta = {
  href: string;
  label: string;
};

type HeroCarouselProps = {
  slides: HeroCarouselSlide[];
  heading: ReactNode;
  subheading: string;
  eyebrow?: string;
  primaryCta: HeroCarouselCta;
  secondaryCta?: HeroCarouselCta;
  autoplayMs?: number;
  ariaLabel?: string;
  className?: string;
};

export default function HeroCarousel({
  slides,
  heading,
  subheading,
  eyebrow,
  primaryCta,
  secondaryCta,
  autoplayMs = 4000,
  ariaLabel = "Hero image carousel",
  className = "",
}: HeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const slideCount = slides.length;

  useEffect(() => {
    if (slideCount <= 1 || isPaused) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % slideCount);
    }, autoplayMs);

    return () => {
      window.clearInterval(timer);
    };
  }, [autoplayMs, isPaused, slideCount]);

  const goToSlide = (index: number) => {
    if (slideCount === 0) {
      return;
    }

    const nextIndex = ((index % slideCount) + slideCount) % slideCount;
    setActiveIndex(nextIndex);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (slideCount <= 1) {
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToSlide(activeIndex - 1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      goToSlide(activeIndex + 1);
    }

    if (event.key === "Home") {
      event.preventDefault();
      goToSlide(0);
    }

    if (event.key === "End") {
      event.preventDefault();
      goToSlide(slideCount - 1);
    }
  };

  if (slideCount === 0) {
    return null;
  }

  return (
    <section
      className={`relative isolate mb-10 min-h-[100svh] w-full overflow-hidden sm:mb-12 lg:mb-16 ${className}`.trim()}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsPaused(false);
        }
      }}
    >
      <div className="absolute inset-0">
        {slides.map((slide, index) => {
          const isActive = index === activeIndex;

          return (
            <div
              key={`${slide.src}-${index}`}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out motion-reduce:duration-0 ${
                isActive ? "opacity-100" : "opacity-0"
              }`}
              aria-hidden={!isActive}
            >
              <Image
                src={slide.src}
                alt={isActive ? slide.alt : ""}
                fill
                priority={index === 0}
                loading={index === 0 ? "eager" : "lazy"}
                sizes="100vw"
                className="object-cover object-center"
              />
            </div>
          );
        })}
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/80 via-emerald-950/55 to-slate-950/25" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.12),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(20,184,166,0.2),_transparent_40%)]" />

      <div className="relative z-10 flex min-h-[100svh] items-end">
        <div className="mx-auto flex w-full max-w-[96rem] flex-col gap-5 px-4 pb-12 pt-28 sm:px-6 sm:pb-14 sm:pt-32 lg:px-8 lg:pb-16 lg:pt-36">
          <div className="max-w-3xl text-left text-white sm:max-w-2xl lg:max-w-3xl">
            {eyebrow ? (
              <p className="mb-3 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-50/90 backdrop-blur-sm sm:mb-4 sm:px-4 sm:text-xs sm:tracking-[0.24em]">
                {eyebrow}
              </p>
            ) : null}

            <h1 className="max-w-3xl text-[2.35rem] font-semibold leading-[0.96] tracking-tight text-white drop-shadow-[0_12px_30px_rgba(0,0,0,0.22)] sm:text-5xl md:text-6xl lg:text-7xl">
              {heading}
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-6 text-emerald-50/85 sm:mt-5 sm:max-w-2xl sm:text-lg sm:leading-7">
              {subheading}
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center">
              <Link
                href={primaryCta.href}
                className="inline-flex w-full items-center justify-center rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-950 sm:w-auto"
              >
                {primaryCta.label}
              </Link>

              {secondaryCta ? (
                <Link
                  href={secondaryCta.href}
                  className="inline-flex w-full items-center justify-center rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-white/45 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-950 sm:w-auto"
                >
                  {secondaryCta.label}
                </Link>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-50/65 sm:text-xs sm:tracking-[0.24em]">
              {slideCount} rescue moments in rotation
            </p>

            <div className="flex items-center gap-2 self-start sm:self-auto" aria-label="Carousel controls">
              <button
                type="button"
                onClick={() => goToSlide(activeIndex - 1)}
                aria-label="Previous slide"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-950 sm:h-11 sm:w-11"
              >
                <span aria-hidden="true" className="text-lg leading-none">
                  ‹
                </span>
              </button>

              <button
                type="button"
                onClick={() => goToSlide(activeIndex + 1)}
                aria-label="Next slide"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-950 sm:h-11 sm:w-11"
              >
                <span aria-hidden="true" className="text-lg leading-none">
                  ›
                </span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {slides.map((slide, index) => {
              const isActive = index === activeIndex;

              return (
                <button
                  key={`${slide.src}-dot-${index}`}
                  type="button"
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={isActive ? "true" : undefined}
                  className={`h-2 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-950 sm:h-2.5 ${
                    isActive ? "w-9 bg-white sm:w-10" : "w-2 bg-white/45 hover:bg-white/70 sm:w-2.5"
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}