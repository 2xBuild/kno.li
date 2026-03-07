"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { ArrowUpRight, Eye } from "lucide-react";
import { templates, type TemplateCategory } from "@/templates";
import { Button } from "@/components/ui/button";

const TEMPLATE_CATEGORIES: { id: TemplateCategory; label: string }[] = [
  { id: "portfolio", label: "Portfolios" },
  { id: "linkfolio", label: "Linkfolios" },
];

export default function TemplatesPage() {
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>("portfolio");

  const visibleTemplates = useMemo(
    () => templates.filter((t) => t.meta.category === activeCategory),
    [activeCategory]
  );

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-6xl flex-col px-4 py-10">
        {/* Top bar with heading on the left and switch on the right */}
        <div className="flex flex-col gap-6 border-b border-border/60 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Templates
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Browse portfolio and linkfolio templates.
            </p>
          </div>

          <div
            data-click-sfx="switch"
            className="inline-flex w-full max-w-[260px] overflow-hidden rounded-md border border-border bg-background text-xs"
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
                      layoutId="templates-page-toggle"
                      className="absolute inset-0 bg-accent"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    />
                  ) : null}
                  <span className="relative z-10">{category.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Templates grid */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleTemplates.map(({ meta: t }) => (
            <div
              key={t.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-shadow duration-200 hover:shadow-md"
            >
              <div className="relative aspect-[16/9] w-full bg-muted">
                <Image
                  src={t.previewImage}
                  alt={`${t.name} template preview`}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/45 group-focus-within:bg-black/45" />

                <div className="absolute bottom-2 right-2 z-10 flex items-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
                  <Button
                    asChild
                    size="icon"
                    className="h-8 w-8 rounded-md border border-white/30 bg-black/70 text-white hover:bg-black/90"
                  >
                    <Link href={`/preview?template=${t.id}`} aria-label={`Preview ${t.name}`}>
                      <Eye className="size-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    className="h-8 rounded-md border border-white/30 bg-black/70 px-3 text-white hover:bg-black/90"
                  >
                    <Link href={`/login?template=${t.id}`} aria-label={`Use ${t.name}`}>
                      <span>Use</span>
                      <ArrowUpRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="px-3 py-2">
                <h2 className="text-sm font-medium text-foreground">
                  {t.name} #{t.id}
                </h2>
                <p className="line-clamp-1 text-[11px] text-muted-foreground">
                  {t.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
