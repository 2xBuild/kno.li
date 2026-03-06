"use client";

import { useState } from "react";
import { Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import NumberFlow from "@number-flow/react";
import type { PricingPlan } from "@/components/pricing-card";
import PricingCard from "@/components/pricing-card";
import { Button } from "@/components/ui/button";

const LANDING_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    description:
      "Ideal for trying cutefolio with one app.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      "1 hosted app on cutefolio",
      "3 in-house domains (cutefolio, it-iz.me, wanna-hire.me); kno.li & about.ec coming soon",
      "Access to all templates",
    ],
    cta: { label: "Start free", href: "/dashboard/create-app" },
  },
  {
    id: "premium",
    name: "Pro",
    description:
      "Ideal for active builders with multiple apps.",
    monthlyPrice: 2.99,
    yearlyPrice: 30,
    features: [
      "Up to 3 hosted apps",
      "Full analytics (unique visitors, click tracker, and country wise traffic)",
      "Custom domain support",
      "Priority support",
    ],
    cta: { label: "Get Pro", href: "/login?callbackUrl=/dashboard/plan" },
  },
  {
    id: "ultra",
    name: "Ultra",
    description:
      "Ideal for teams and power users.",
    monthlyPrice: 20,
    yearlyPrice: 200,
    features: [
      "Up to 15 hosted apps",
      "Full analytics",
      "Custom domains for all hosted apps",
      "Dedicated support",
      "Early access to new features",
    ],
    cta: { label: "Get Ultra", href: "/login?callbackUrl=/dashboard/plan" },
  },
];

export function PricingSection() {
  const [activePlanId, setActivePlanId] = useState("premium");
  const [activeCycle, setActiveCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );

  const activePlan =
    LANDING_PLANS.find((p) => p.id === activePlanId) ?? LANDING_PLANS[1];
  const activePrice =
    (activeCycle === "monthly"
      ? activePlan.monthlyPrice
      : activePlan.yearlyPrice) ?? 0;

  return (
    <motion.section
      className="px-4 pb-14 pt-6 sm:pb-24 sm:pt-8"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
    >
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.1fr)] md:items-start">
          {/* Left – selected plan details, desktop only */}
          <div className="hidden md:flex md:flex-col md:justify-start md:pt-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePlan.id}
                className="flex flex-col gap-5"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <div>
                  <h2 className="text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
                    {activePlan.name}
                  </h2>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-3xl font-semibold text-foreground lg:text-4xl">
                      <NumberFlow
                        value={activePrice}
                        format={{ style: "currency", currency: "USD" }}
                      />
                    </span>
                    <span className="text-sm text-muted-foreground">
                      / {activeCycle === "monthly" ? "month" : "year"}
                    </span>
                  </div>
                </div>

                <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                  {activePlan.description}
                </p>

                <div className="flex flex-col gap-3">
                  {activePlan.features.map((feature, idx) => (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04, duration: 0.3 }}
                      key={idx}
                      className="flex items-center gap-3 text-sm text-foreground/80"
                    >
                      <HugeiconsIcon
                        icon={Tick02Icon}
                        size={16}
                        className="text-primary shrink-0"
                      />
                      {feature}
                    </motion.div>
                  ))}
                </div>

                {activePlan.cta && (
                  <div className="pt-2">
                    <Button
                      asChild
                      className="landing-cta-button h-11 min-w-[11.5rem] px-6 text-sm font-semibold"
                    >
                      <Link href={activePlan.cta.href}>
                        {activePlan.cta.label}
                      </Link>
                    </Button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: pricing card (full-width on mobile) */}
          <div className="flex justify-center md:justify-end">
            <PricingCard
              title="Pricing"
              plans={LANDING_PLANS}
              defaultSelected="premium"
              compactOnDesktop
              onSelectionChange={(planId, cycle) => {
                setActivePlanId(planId);
                setActiveCycle(cycle);
              }}
            />
          </div>
        </div>
      </div>
    </motion.section>
  );
}
