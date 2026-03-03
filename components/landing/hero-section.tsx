"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, LayoutTemplate } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import FeatureCarousel from "@/components/feature-carousel";
import { Button } from "@/components/ui/button";
import { templates } from "@/templates";

const SWIPE_WORDS = ["you", "your brand", "your SaaS"];
const SWIPE_MS = 2500;

function SwipeText() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % SWIPE_WORDS.length);
    }, SWIPE_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="relative inline-flex h-[1.2em] w-[10ch] items-end justify-center overflow-hidden align-bottom">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={index}
          initial={{ y: "110%" }}
          animate={{ y: "0%" }}
          exit={{ y: "-110%" }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block whitespace-nowrap rounded-md bg-yellow-200/60 px-2 text-foreground dark:bg-yellow-400/20"
        >
          {SWIPE_WORDS[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function HeroSection({ githubPill }: { githubPill: ReactNode }) {
  const carouselItems = templates.map(({ meta }) => ({
    id: meta.id,
    label: meta.name,
    image: meta.previewImage,
    description: meta.description,
    href: `/preview?template=${meta.id}`,
  }));

  return (
    <section className="px-4 pb-12 pt-10 sm:pb-20 sm:pt-20">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
        <FeatureCarousel items={carouselItems} galleryOnly className="mt-1" />

        <div className="mt-6 sm:mt-10">{githubPill}</div>

        <div className="mt-4 flex min-h-[4.5rem] items-center sm:mt-6 sm:min-h-[7.5rem]">
          <h1 className="w-full text-3xl font-light tracking-tight text-foreground sm:text-5xl md:text-6xl">
            <span className="dark:text-muted-foreground">
              Let the world{" "}
              <span className="font-bold text-foreground">kno</span>w{" "}
              <SwipeText /> better.
            </span>
          </h1>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 sm:mt-8 sm:gap-3">
          <Button
            asChild
            className="landing-cta-button group h-9 px-4 text-xs font-semibold sm:h-11 sm:min-w-[11.5rem] sm:px-6 sm:text-sm"
          >
            <Link href="/dashboard/create-app">
              <span>Create app</span>
              <span className="relative ml-1.5 inline-flex h-4 w-4 items-center justify-center overflow-hidden">
                <ArrowUpRight className="size-4 -translate-y-px transition-all duration-200 group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:opacity-0" />
                <ArrowRight className="size-4 absolute translate-x-1 translate-y-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />
              </span>
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="landing-cta-button h-9 px-4 text-xs font-semibold sm:h-11 sm:min-w-[11.5rem] sm:px-6 sm:text-sm"
          >
            <Link href="/templates">
              <span>Templates</span>
              <LayoutTemplate className="ml-1.5 size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
