"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Globe,
  Link2,
  Briefcase,
  BarChart3,
  Sparkles,
  DollarSign
} from "lucide-react";
import { templates } from "@/templates";

interface Fact {
  icon: React.ComponentType<{ className?: string }>;
  value: number | string;
  label?: string;
  detail: string;
  color: string;
}

const FIRST_PARTY_DOMAIN_COUNT = 4;

function buildFacts(): Fact[] {
  const portfolioCount = templates.filter(
    (t) => t.meta.category === "portfolio"
  ).length;
  const linkOrgCount = templates.filter(
    (t) => t.meta.category === "linkfolio"
  ).length;

  return [
    {
      icon: Globe,
      value: FIRST_PARTY_DOMAIN_COUNT,
      label: "Domains",
      detail: "4 Free domains : kno.li, about.ec, it-iz.me, wanna-hire.me",
      color: "text-blue-500",
    },
    {
      icon: Briefcase,
      value: portfolioCount,
      label: "Portfolio templates",
      detail: "Full-page portfolio designs with experience, projects & more",
      color: "text-violet-500",
    },
    {
      icon: Link2,
      value: linkOrgCount,
      label: "Linkfolio templates",
      detail: "Organise links beautifully with templates",
      color: "text-emerald-500",
    },
  


    {
      icon: BarChart3,
      value: "Analytics",
      detail: "Page views, visitors, referrers & geo data tracked out of the box",
      color: "text-rose-500",
    },
    {
      icon: Sparkles,
      value: "Custom domains",
      detail: "Connect any domain you own — yourname.dev, studio.me, anything",
      color: "text-pink-500",
    },
    {
      icon: DollarSign,
      value: "Freemium",
  
      detail: "All templates are free, premium features available for premium users",
      color: "text-amber-500",
    }
  ];
}

function FactItem({ fact, index }: { fact: Fact; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-4 shadow-sm transition-colors hover:border-border hover:bg-muted/40"
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/80 ${fact.color} transition-colors group-hover:bg-muted`}
      >
        <fact.icon className="size-4" />
      </div>

      <div className="min-w-0">
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-bold tracking-tight text-foreground">
            {fact.value}
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            {fact.label}
          </span>
        </div>
      </div>

      {/* Popover on hover */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute left-1/2 top-full z-20 mt-2 w-56 -translate-x-1/2 rounded-xl border border-border bg-popover px-3.5 py-2.5 text-xs leading-relaxed text-popover-foreground shadow-lg"
          >
            <div className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-l border-t border-border bg-popover" />
            <p>{fact.detail}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FactsSection() {
  const facts = buildFacts();

  return (
    <section className="border-y border-border/60 px-4 py-12 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <motion.h2
          className="text-center text-2xl font-bold tracking-tight text-foreground sm:text-4xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.45 }}
        >
          Everything you get
        </motion.h2>


        <div className="mt-6 grid grid-cols-1 gap-2.5 min-[400px]:grid-cols-2 sm:mt-10 sm:grid-cols-3 sm:gap-3">
          {facts.map((fact, i) => (
            <FactItem key={fact.label ?? fact.detail} fact={fact} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
