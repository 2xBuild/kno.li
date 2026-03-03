"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { SiX } from "react-icons/si";
import { FiArrowRight, FiArrowUpRight } from "react-icons/fi";
import { APP_LOGO_PATH } from "@/lib/constants";

export function SiteFooter() {
  return (
    <motion.footer
      className="border-t border-border/60 px-4 py-10 sm:py-16"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
    >
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-12 sm:flex-row sm:items-center">
        {/* Left side: Logo + name */}
        <div className="flex flex-col items-center sm:items-start">
          <Link
            href="/"
            className="flex items-center gap-4 sm:gap-5 transition-opacity hover:opacity-90"
            aria-label="Home"
          >
            <Image
              src={APP_LOGO_PATH}
              alt=""
              width={56}
              height={56}
              className="h-10 w-10 sm:h-16 sm:w-16 shrink-0 rounded-full object-contain"
            />
            <span className="text-2xl sm:text-5xl font-bold tracking-tight text-foreground">
              kno.li
            </span>
          </Link>
        </div>

        {/* Right side: Links and CTA Stack */}
        <div className="flex flex-col items-center gap-6 sm:items-end sm:gap-4">
          {/* Top: Mini Links */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-medium text-muted-foreground/80 sm:justify-end">
            <Link href="/faq" className="transition-colors hover:text-foreground">
              FAQ
            </Link>
            <Link href="/compare" className="transition-colors hover:text-foreground">
              Compare Plans
            </Link>
            <Link href="/tnc" className="transition-colors hover:text-foreground">
              Privacy &amp; Terms
            </Link>
          </div>

          {/* Differentiator line */}
          <div className="h-px w-full max-w-[200px] bg-border/40 sm:max-w-none" />

          {/* Bottom: Action and Social */}
          <div className="flex items-center gap-5">
            <a
              href="https://x.com/izzHanu"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Twitter)"
              className="text-muted-foreground/60 transition-colors hover:text-foreground"
            >
              <SiX className="h-4 w-4" />
            </a>
            <Link
              href="/login"
              className="landing-cta-button group inline-flex items-center gap-1.5 rounded-full bg-foreground px-5 py-2 text-xs font-bold text-background transition-all hover:bg-foreground/90 active:scale-95"
            >
              <span>Start now</span>
              <span className="relative ml-1 inline-flex h-4 w-4 items-center justify-center overflow-hidden">
                <FiArrowUpRight className="h-4 w-4 -translate-y-px transition-all duration-200 group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:opacity-0" />
                <FiArrowRight className="h-4 w-4 absolute translate-x-1 translate-y-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
