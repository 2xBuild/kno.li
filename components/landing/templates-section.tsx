"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Eye, ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { templates, type TemplateCategory } from "@/templates";

const TEMPLATE_CATEGORIES: { id: TemplateCategory; label: string }[] = [
  { id: "portfolio", label: "Portfolios" },
  { id: "linkfolio", label: "Link Folios" },
];

export function TemplatesSection() {
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>("portfolio");

  const visibleTemplates = useMemo(
    () => templates.filter((t) => t.meta.category === activeCategory),
    [activeCategory]
  );

  return (
    <section className="border-t border-border/60 px-4 py-20">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="flex flex-col items-center gap-3">
          <motion.h2
            className="text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.45 }}
          >
            Choose your template
          </motion.h2>

          <motion.p
            className="mx-auto max-w-xl text-center text-muted-foreground"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.45, delay: 0.08 }}
          >
            Browse portfolio and link folio templates.
          </motion.p>

          {/* Category toggle */}
          <motion.div
            data-click-sfx="switch"
            className="mt-5 inline-flex w-full max-w-[260px] overflow-hidden rounded-md border border-border bg-background text-xs"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.35, delay: 0.1 }}
          >
            {TEMPLATE_CATEGORIES.map((category) => {
              const isActive = activeCategory === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => {
                    if (activeCategory === category.id) return;
                    setActiveCategory(category.id);
                  }}
                  className={`relative flex-1 border-l border-border px-4 py-2 font-medium transition-colors first:border-l-0 ${
                    isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isActive ? (
                    <motion.span
                      layoutId="templates-landing-toggle"
                      className="absolute inset-0 bg-accent"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    />
                  ) : null}
                  <span className="relative z-10">{category.label}</span>
                </button>
              );
            })}
          </motion.div>
        </div>

        {/* Cards grid */}
        <div className="mt-8">
          <motion.div layout className="flex flex-wrap justify-center gap-6">
            <AnimatePresence mode="popLayout">
              {visibleTemplates.map(({ meta: t }, i) => (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="group relative flex flex-col overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm transition-all duration-300 hover:border-border hover:shadow-md w-full sm:w-[320px] lg:w-[340px]"
                >
                  {/* Preview image with overlaid buttons */}
                  <div className="relative aspect-[16/7] w-full overflow-hidden bg-muted">
                    <Image
                      src={t.previewImage}
                      alt={`${t.name} template preview`}
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/45 group-focus-within:bg-black/45" />

                    {/* Action buttons – bottom right, visible on hover */}
                    <div className="absolute bottom-2 right-2 z-10 flex items-center gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
                      <Button
                        asChild
                        size="icon"
                        className="h-8 w-8 rounded-md border border-white/30 bg-black/70 text-white backdrop-blur-sm hover:bg-black/90"
                      >
                        <Link href={`/preview?template=${t.id}`} aria-label={`Preview ${t.name}`}>
                          <Eye className="size-4" />
                        </Link>
                      </Button>
                      <Button
                        asChild
                        size="sm"
                        className="h-8 rounded-md border border-white/30 bg-black/70 px-3 text-white backdrop-blur-sm hover:bg-black/90"
                      >
                        <Link href={`/login?template=${t.id}`} aria-label={`Use ${t.name}`}>
                          <span>Use</span>
                          <ArrowUpRight className="size-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="px-3 py-2">
                    <h3 className="text-sm font-semibold leading-snug text-foreground">
                      {t.name} #{t.id}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">{t.description}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* All Templates button */}
          <motion.div
            className="mt-6 flex justify-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
          >
            <Button
              asChild
              variant="outline"
              size="sm"
              className="landing-cta-button group gap-2 px-6"
            >
              <Link href="/templates">
                <span>All templates</span>
                <span className="relative ml-1 inline-flex h-4 w-4 items-center justify-center overflow-hidden">
                  <ArrowUpRight className="size-4 -translate-y-px transition-all duration-200 group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:opacity-0" />
                  <ArrowRight className="size-4 absolute translate-x-1 translate-y-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />
                </span>
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
