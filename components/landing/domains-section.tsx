"use client";

import { motion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Globe02Icon,
  Shield01Icon,
  Settings02Icon,
} from "@hugeicons/core-free-icons";

const FIRST_PARTY_DOMAINS = [
  {
    name: "cutefolio",
    tagline: "Default hosted domain",
    description: "Great starter for link pages and simple intros.",
    comingSoon: false,
  },
  {
    name: "it-iz.me",
    tagline: "Personality first",
    description: "Playful domain for showing who you are.",
    comingSoon: false,
  },
  {
    name: "wanna-hire.me",
    tagline: "Job-focused",
    description: "High-intent URL for job seekers and portfolios.",
    comingSoon: false,
  },
  {
    name: "kno.li",
    tagline: "Coming soon",
    description: "Short link domain — coming soon.",
    comingSoon: true,
  },
  {
    name: "about.ec",
    tagline: "Coming soon",
    description: "Clean URL for bios and social links — coming soon.",
    comingSoon: true,
  },
];

export function DomainsSection() {
  return (
    <section className="px-4 pb-24 pt-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-10 flex flex-col items-center px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-xs font-medium text-primary"
          >
            <HugeiconsIcon icon={Shield01Icon} size={12} />
            <span>Domains & delivery</span>
          </motion.div>

          <motion.h2
            className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            One app, access these domains
          </motion.h2>

          <motion.p
            className="mt-3 max-w-xl text-base text-muted-foreground"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            Start on a first-party domain in one click, then connect your own
            custom domain whenever you are ready.
          </motion.p>
        </div>

        {/* Domains layout */}
        <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
          {/* Left: all domains in one box */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
            className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5"
          >
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Included first-party domains
            </p>
            <div className="divide-y divide-border/70">
              {FIRST_PARTY_DOMAINS.map((domain) => (
                <div
                  key={domain.name}
                  className="group relative flex items-center gap-3.5 py-2.5 first:pt-0 last:pb-0"
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                      domain.comingSoon
                        ? "bg-muted/70 text-muted-foreground/70"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <HugeiconsIcon icon={Globe02Icon} size={18} />
                  </div>
                  <div
                    className={`min-w-0 flex-1 ${
                      domain.comingSoon ? "opacity-70" : ""
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <p
                        className={
                          domain.comingSoon
                            ? "font-semibold text-muted-foreground"
                            : "font-semibold text-foreground"
                        }
                      >
                        {domain.name}
                      </p>
                      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        {domain.tagline}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {domain.description}
                    </p>
                  </div>
                  {domain.comingSoon && (
                    <span
                      className="pointer-events-none absolute right-0 top-2.5 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-800 opacity-0 transition-opacity group-hover:opacity-100 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
                      aria-hidden
                    >
                      Coming soon
                    </span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: custom domain highlight */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
            className="flex flex-col justify-between rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-5 sm:p-6"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <HugeiconsIcon icon={Settings02Icon} size={18} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  Bring your own domain
                </p>
                <p className="text-xs text-muted-foreground">
                  Connect any domain you own —{" "}
                  <span className="font-mono text-foreground">
                    yourname.dev
                  </span>
                  ,{" "}
                  <span className="font-mono text-foreground">studio.me</span>,
                  or something completely custom.
                </p>
              </div>
            </div>

            {/* Animated custom domain bar */}
            <div className="mt-6 space-y-3">
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                className="flex items-center gap-2 rounded-full border border-primary/40 bg-background/80 px-3 py-1.5 text-[11px] font-mono text-foreground shadow-sm"
              >
                <span className="text-muted-foreground/80">https://</span>
                <motion.span
                  animate={{ x: [0, 3, 0] }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: [0.25, 0.8, 0.25, 1],
                  }}
                  className="flex-1 truncate"
                >
                  yourname.dev
                </motion.span>
                <motion.span
                  className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground"
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{
                    duration: 1.6,
                    repeat: Infinity,
                    ease: [0.25, 0.8, 0.25, 1],
                  }}
                >
                  <span className="text-xs leading-none">+</span>
                  <span>Add domain</span>
                </motion.span>
              </motion.div>

              <div className="space-y-1.5 text-xs text-muted-foreground">
                <p>
                  • Automatic{" "}
                  <span className="font-medium text-foreground">SSL</span> for
                  every domain
                </p>
                <p>
                  • Served via{" "}
                  <span className="font-medium text-foreground">
                    global CDN
                  </span>{" "}
                  for fast loads
                </p>
                <p>• Works with all templates and analytics out of the box</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
