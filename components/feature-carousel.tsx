"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Pizza04Icon,
  CommandFreeIcons,
  GlobalSearchIcon,
  AiCloudIcon,
  SmartPhone01Icon,
  CheckmarkCircle01Icon,
  DashboardSquare01Icon,
  MagicWandIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Public types                                                       */
/* ------------------------------------------------------------------ */

export interface CarouselItem {
  id: string;
  label: string;
  image: string | StaticImageData;
  description?: string;
  href?: string;
}

/* ------------------------------------------------------------------ */
/*  Default feature set (used when no items prop is provided)          */
/* ------------------------------------------------------------------ */

interface InternalFeature extends CarouselItem {
  icon: typeof Pizza04Icon;
}

const DEFAULT_FEATURES: InternalFeature[] = [
  {
    id: "sustainable",
    label: "Sustainable Sourcing",
    icon: Pizza04Icon,
    image:
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1200",
    description: "Ethically sourced ingredients from local farmers.",
  },
  {
    id: "community",
    label: "Community Focused",
    icon: CommandFreeIcons,
    image:
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1200",
    description: "Building stronger bonds through shared experiences.",
  },
  {
    id: "global",
    label: "Global Reach",
    icon: GlobalSearchIcon,
    image:
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=1200",
    description: "Connecting visionaries across all continents.",
  },
  {
    id: "award",
    label: "Award Winning",
    icon: CheckmarkCircle01Icon,
    image:
      "https://images.unsplash.com/photo-1578574577315-3fbeb0cecdc2?q=80&w=1200",
    description: "Recognized excellence in design and innovation.",
  },
  {
    id: "cloud",
    label: "Cloud Ready",
    icon: AiCloudIcon,
    image:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200",
    description: "Scale your infrastructure with seamless ease.",
  },
  {
    id: "mobile",
    label: "Mobile First",
    icon: SmartPhone01Icon,
    image:
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=1200",
    description: "A world-class experience on every single device.",
  },
  {
    id: "analytics",
    label: "Real-time Analytics",
    icon: DashboardSquare01Icon,
    image:
      "https://images.unsplash.com/photo-1551288049-bbda38a10ad5?q=80&w=1200",
    description: "Insights at your fingertips, updated in real-time.",
  },
  {
    id: "security",
    label: "Enterprise Security",
    icon: CheckmarkCircle01Icon,
    image:
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1200",
    description: "Bank-grade security protocols for your data.",
  },
  {
    id: "magic",
    label: "Magic Automations",
    icon: MagicWandIcon,
    image:
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1200",
    description: "Let AI handle the repetitive tasks for you.",
  },
  {
    id: "local",
    label: "Locally Owned",
    icon: CheckmarkCircle01Icon,
    image:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=1200",
    description: "Supporting local businesses and creators.",
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const ITEM_HEIGHT = 65;

const wrap = (min: number, max: number, v: number) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface FeatureCarouselProps {
  items?: CarouselItem[];
  galleryOnly?: boolean;
  autoPlayInterval?: number;
  className?: string;
}

export default function FeatureCarousel({
  items,
  galleryOnly = false,
  autoPlayInterval = 3000,
  className,
}: FeatureCarouselProps) {
  const allItems: CarouselItem[] = items ?? DEFAULT_FEATURES;
  const [step, setStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const currentIndex =
    ((step % allItems.length) + allItems.length) % allItems.length;

  const nextStep = useCallback(() => {
    setStep((prev) => prev + 1);
  }, []);

  const handleChipClick = (index: number) => {
    const diff = (index - currentIndex + allItems.length) % allItems.length;
    if (diff > 0) setStep((s) => s + diff);
  };

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextStep, autoPlayInterval);
    return () => clearInterval(interval);
  }, [nextStep, isPaused, autoPlayInterval]);

  const getCardStatus = (index: number) => {
    const diff = index - currentIndex;
    const len = allItems.length;

    let normalizedDiff = diff;
    if (diff > len / 2) normalizedDiff -= len;
    if (diff < -len / 2) normalizedDiff += len;

    if (normalizedDiff === 0) return "active";
    if (normalizedDiff === -1) return "prev";
    if (normalizedDiff === 1) return "next";
    return "hidden";
  };

  /* ── Gallery-only mode ─────────────────────────────────────────── */

  if (galleryOnly) {
    return (
      <div
        className={cn("w-full", className)}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="relative mx-auto aspect-[4/3] w-[240px] sm:w-[340px]">
          {allItems.map((item, index) => {
            const status = getCardStatus(index);
            const isActive = status === "active";
            const isPrev = status === "prev";
            const isNext = status === "next";
            const isVisible = isActive || isPrev || isNext;

            return (
              <motion.div
                key={item.id}
                initial={false}
                animate={{
                  x: isActive ? "0%" : isPrev ? "-30%" : isNext ? "30%" : "0%",
                  scale: isActive ? 1 : isVisible ? 0.88 : 0.75,
                  opacity: isActive ? 1 : isVisible ? 0.5 : 0,
                  rotate: isPrev ? -4 : isNext ? 4 : 0,
                  zIndex: isActive ? 20 : isVisible ? 10 : 0,
                }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 25,
                  mass: 0.8,
                }}
                className={cn(
                  "absolute inset-0 overflow-hidden rounded-2xl border-4 border-background bg-muted shadow-xl origin-center",
                  !isActive && isVisible && "cursor-pointer",
                )}
                onClick={() => {
                  if (isPrev) setStep((s) => s - 1);
                  else if (isNext) setStep((s) => s + 1);
                }}
                style={{ pointerEvents: isVisible ? "auto" : "none" }}
              >
                <Image
                  src={item.image}
                  alt={item.label}
                  fill
                  priority={index < 2}
                  loading={index < 3 ? "eager" : undefined}
                  className={cn(
                    "object-cover transition-all duration-700",
                    isActive
                      ? "grayscale-0 blur-0"
                      : "grayscale blur-[2px] brightness-75",
                  )}
                  sizes="(max-width: 640px) 240px, 340px"
                />

                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-14"
                    >
                      <span className="inline-block rounded-full border border-border/40 bg-background/90 px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-foreground backdrop-blur-sm">
                        {item.label}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {isActive && item.href && (
                  <Link
                    href={item.href}
                    className="absolute inset-0 z-30"
                    aria-label={`Preview ${item.label}`}
                  />
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="mt-5 flex justify-center gap-1.5">
          {allItems.map((item, i) => (
            <button
              key={item.id}
              aria-label={`Go to ${item.label}`}
              onClick={() => {
                const diff =
                  (i - currentIndex + allItems.length) % allItems.length;
                const backDiff = allItems.length - diff;
                if (diff === 0) return;
                if (diff <= backDiff) setStep((s) => s + diff);
                else setStep((s) => s - backDiff);
              }}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === currentIndex
                  ? "w-5 bg-foreground"
                  : "w-1.5 bg-foreground/20 hover:bg-foreground/40",
              )}
            />
          ))}
        </div>
      </div>
    );
  }

  /* ── Full mode with sidebar ────────────────────────────────────── */

  const features = allItems as InternalFeature[];

  return (
    <div className={cn("w-full max-w-7xl mx-auto md:p-8", className)}>
      <div className="relative overflow-hidden rounded-[2.5rem] lg:rounded-[4rem] flex flex-col lg:flex-row min-h-[600px] lg:aspect-video border border-border/40">
        <div className="w-full lg:w-[40%] min-h-[350px] md:min-h-[450px] lg:h-full relative z-30 flex flex-col items-start justify-center overflow-hidden px-8 md:px-16 lg:pl-16 bg-[#62B2FE] ">
          <div className="absolute inset-x-0 top-0 h-12 md:h-20 lg:h-16 bg-gradient-to-b from-[#62B2FE] via-[#62B2FE]/80 to-transparent z-40" />
          <div className="absolute inset-x-0 bottom-0 h-12 md:h-20 lg:h-16 bg-gradient-to-t from-[#62B2FE] via-[#62B2FE]/80 to-transparent z-40" />
          <div className="relative w-full h-full flex items-center justify-center lg:justify-start z-20">
            {features.map((feature, index) => {
              const isActive = index === currentIndex;
              const distance = index - currentIndex;
              const wrappedDistance = wrap(
                -(features.length / 2),
                features.length / 2,
                distance,
              );

              return (
                <motion.div
                  key={feature.id}
                  style={{
                    height: ITEM_HEIGHT,
                    width: "fit-content",
                  }}
                  animate={{
                    y: wrappedDistance * ITEM_HEIGHT,
                    opacity: 1 - Math.abs(wrappedDistance) * 0.25,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 90,
                    damping: 22,
                    mass: 1,
                  }}
                  className="absolute flex items-center justify-start"
                >
                  <button
                    onClick={() => handleChipClick(index)}
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    className={cn(
                      "relative flex items-center gap-4 px-6 md:px-10 lg:px-8 py-3.5 md:py-5 lg:py-4 rounded-full transition-all duration-700 text-left group border",
                      isActive
                        ? "bg-white text-[#62B2FE] border-white z-10"
                        : "bg-transparent text-white/60 border-white/20 hover:border-white/40 hover:text-white",
                    )}
                  >
                    {feature.icon && (
                      <div
                        className={cn(
                          "flex items-center justify-center transition-colors duration-500",
                          isActive ? "text-[#62B2FE]" : "text-white/40",
                        )}
                      >
                        <HugeiconsIcon
                          icon={feature.icon}
                          size={18}
                          strokeWidth={2}
                        />
                      </div>
                    )}

                    <span className="font-normal text-sm md:text-[15px] tracking-tight whitespace-nowrap uppercase">
                      {feature.label}
                    </span>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="flex-1 min-h-[500px] md:min-h-[600px] lg:h-full relative bg-secondary/30 flex items-center justify-center py-16 md:py-24 lg:py-16 px-6 md:px-12 lg:px-10 overflow-hidden border-t lg:border-t-0 lg:border-l border-border/20">
          <div className="relative w-full max-w-[420px] aspect-[4/5] flex items-center justify-center">
            {allItems.map((item, index) => {
              const status = getCardStatus(index);
              const isActive = status === "active";
              const isPrev = status === "prev";
              const isNext = status === "next";

              return (
                <motion.div
                  key={item.id}
                  initial={false}
                  animate={{
                    x: isActive ? 0 : isPrev ? -100 : isNext ? 100 : 0,
                    scale: isActive ? 1 : isPrev || isNext ? 0.85 : 0.7,
                    opacity: isActive ? 1 : isPrev || isNext ? 0.4 : 0,
                    rotate: isPrev ? -3 : isNext ? 3 : 0,
                    zIndex: isActive ? 20 : isPrev || isNext ? 10 : 0,
                    pointerEvents: isActive ? "auto" : "none",
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 25,
                    mass: 0.8,
                  }}
                  className="absolute inset-0 rounded-[2rem] md:rounded-[2.8rem] overflow-hidden border-4 md:border-8 border-background bg-background origin-center"
                >
                  <img
                    src={
                      typeof item.image === "string"
                        ? item.image
                        : item.image.src
                    }
                    alt={item.label}
                    className={cn(
                      "w-full h-full object-cover transition-all duration-700",
                      isActive
                        ? "grayscale-0 blur-0"
                        : "grayscale blur-[2px] brightness-75",
                    )}
                  />

                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute inset-x-0 bottom-0 p-10 pt-32 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end pointer-events-none"
                      >
                        <div className="bg-background text-foreground px-4 py-1.5 rounded-full text-[11px] font-normal uppercase tracking-[0.2em] w-fit shadow-lg mb-3 border border-border/50">
                          {index + 1} &bull; {item.label}
                        </div>
                        {item.description && (
                          <p className="text-white font-normal text-xl md:text-2xl leading-tight drop-shadow-md tracking-tight">
                            {item.description}
                          </p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div
                    className={cn(
                      "absolute top-8 left-8 flex items-center gap-3 transition-opacity duration-300",
                      isActive ? "opacity-100" : "opacity-0",
                    )}
                  >
                    <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_10px_white]" />
                    <span className="text-white/80 text-[10px] font-normal uppercase tracking-[0.3em] font-mono">
                      Live Session
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
