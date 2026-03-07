"use client";

import { useState } from "react";
import { Crown, ExternalLink, ArrowRight } from "lucide-react";
import { Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion } from "motion/react";
import NumberFlow from "@number-flow/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type BillingCycle = "monthly" | "yearly";

interface Plan {
  id: "free" | "premium" | "ultra";
  name: string;
  tagline: string;
  monthlyPrice: number;
  yearlyPrice: number;
  monthlyProductId: string | undefined;
  yearlyProductId: string | undefined;
  features: string[];
}

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Get started",
    monthlyPrice: 0,
    yearlyPrice: 0,
    monthlyProductId: undefined,
    yearlyProductId: undefined,
    features: [
      "1 hosted app",
      "No analytics",
      "Default domains (cutefolio, etc.)",
    ],
  },
  {
    id: "premium",
    name: "Pro",
    tagline: "For creators",
    monthlyPrice: 2.99,
    yearlyPrice: 30,
    monthlyProductId: process.env.NEXT_PUBLIC_POLAR_PRODUCT_PRO_MONTHLY,
    yearlyProductId: process.env.NEXT_PUBLIC_POLAR_PRODUCT_PRO_YEARLY,
    features: [
      "Up to 3 hosted apps",
      "Full analytics (90 days)",
      "Custom domain support",
      "Priority support",
    ],
  },
  {
    id: "ultra",
    name: "Ultra",
    tagline: "For teams & power users",
    monthlyPrice: 20,
    yearlyPrice: 200,
    monthlyProductId: process.env.NEXT_PUBLIC_POLAR_PRODUCT_ULTRA_MONTHLY,
    yearlyProductId: process.env.NEXT_PUBLIC_POLAR_PRODUCT_ULTRA_YEARLY,
    features: [
      "Up to 15 hosted apps",
      "Full analytics (90 days)",
      "Custom domains for every app",
      "Dedicated support",
      "Early access to new features",
    ],
  },
];

const PLAN_DISPLAY: Record<string, string> = {
  free: "Free",
  premium: "Pro",
  ultra: "Ultra",
};

const TRANSITION = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
  mass: 0.8,
};

interface PlanClientProps {
  userId: string;
  userEmail: string | null;
  planTier: "free" | "premium" | "ultra";
  subscription: {
    status: string;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  } | null;
}

export function PlanClient({
  userId,
  userEmail,
  planTier,
  subscription,
}: PlanClientProps) {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");

  const isActive =
    subscription?.status === "active" || subscription?.status === "trialing";
  const displayName = PLAN_DISPLAY[planTier] ?? planTier;
  const currentPlanIdx = PLANS.findIndex((p) => p.id === planTier);

  const buildCheckoutUrl = (plan: Plan) => {
    const productId =
      cycle === "monthly" ? plan.monthlyProductId : plan.yearlyProductId;
    if (!productId) return null;
    const params = new URLSearchParams({
      products: productId,
      customerExternalId: userId,
    });
    if (userEmail) params.set("customerEmail", userEmail);
    return `/api/polar/checkout?${params.toString()}`;
  };

  return (
    <div className="flex flex-col gap-8 p-6 sm:p-8 max-w-4xl">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Plan</h1>
        <p className="text-muted-foreground mt-1">
          Manage your subscription and explore available plans.
        </p>
      </header>

      {/* Current plan card */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Crown className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current plan</p>
              <p className="text-lg font-semibold text-foreground">
                {displayName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {subscription && (
              <p className="text-sm text-muted-foreground">
                {isActive ? "Active" : subscription.status}
                {subscription.currentPeriodEnd
                  ? ` · renews ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                  : ""}
                {subscription.cancelAtPeriodEnd
                  ? " · cancels at period end"
                  : ""}
              </p>
            )}
            {!subscription && planTier === "free" && (
              <p className="text-sm text-muted-foreground">
                No active subscription
              </p>
            )}
            {isActive && (
              <Button asChild variant="outline" size="sm" className="gap-1.5">
                <a href="/api/polar/portal">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Manage
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Billing toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">
          {planTier === "ultra" ? "All plans" : "Choose a plan"}
        </h2>
        <div
          data-click-sfx="switch"
          className="inline-flex items-center bg-muted p-1 rounded-xl ring-1 ring-border"
        >
          <button
            onClick={() => {
              setCycle("monthly");
            }}
            className={`relative px-4 py-1.5 rounded-lg text-sm font-medium transition-colors duration-300 ${
              cycle === "monthly"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {cycle === "monthly" && (
              <motion.div
                layoutId="plan-billing-toggle"
                className="absolute inset-0 bg-background rounded-lg shadow-sm ring-1 ring-border"
                transition={TRANSITION}
              />
            )}
            <span className="relative z-10">Monthly</span>
          </button>
          <button
            onClick={() => {
              setCycle("yearly");
            }}
            className={`relative px-4 py-1.5 rounded-lg text-sm font-medium transition-colors duration-300 flex items-center gap-1.5 ${
              cycle === "yearly"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {cycle === "yearly" && (
              <motion.div
                layoutId="plan-billing-toggle"
                className="absolute inset-0 bg-background rounded-lg shadow-sm ring-1 ring-border"
                transition={TRANSITION}
              />
            )}
            <span className="relative z-10">Yearly</span>
            <span className="relative z-10 bg-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase text-primary-foreground tracking-tight">
              -20%
            </span>
          </button>
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {PLANS.map((plan, idx) => {
          const isCurrent = plan.id === planTier;
          const isUpgrade = idx > currentPlanIdx;
          const isDowngrade = idx < currentPlanIdx;
          const price =
            cycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
          const perMonth =
            cycle === "yearly" && plan.yearlyPrice > 0
              ? plan.yearlyPrice / 12
              : null;
          const checkoutUrl = buildCheckoutUrl(plan);

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.06 }}
              className={`relative flex flex-col rounded-2xl border bg-card p-5 transition-shadow duration-300 ${
                isCurrent
                  ? "border-primary ring-2 ring-primary/20 shadow-md"
                  : "border-border shadow-sm"
              }`}
            >
              {isCurrent && (
                <div className="absolute -top-2.5 left-4">
                  <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                    Current
                  </span>
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-base font-semibold text-foreground">
                  {plan.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {plan.tagline}
                </p>
              </div>

              <div className="mb-5">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-foreground">
                    <NumberFlow
                      value={price}
                      format={{ style: "currency", currency: "USD" }}
                    />
                  </span>
                  <span className="text-xs text-muted-foreground">
                    /{cycle === "monthly" ? "mo" : "yr"}
                  </span>
                </div>
                <AnimatePresence mode="wait">
                  {perMonth !== null && (
                    <motion.p
                      key="per-month"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-[11px] text-muted-foreground mt-0.5"
                    >
                      <NumberFlow
                        value={perMonth}
                        format={{
                          style: "currency",
                          currency: "USD",
                          maximumFractionDigits: 2,
                        }}
                      />
                      /mo billed yearly
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex flex-col gap-2.5 mb-5 flex-1">
                {plan.features.map((feature, fIdx) => (
                  <div
                    key={fIdx}
                    className="flex items-start gap-2 text-xs text-foreground/80"
                  >
                    <HugeiconsIcon
                      icon={Tick02Icon}
                      size={14}
                      className="text-primary mt-0.5 shrink-0"
                    />
                    {feature}
                  </div>
                ))}
              </div>

              <div className="mt-auto">
                {isCurrent ? (
                  <Button
                    disabled
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Current plan
                  </Button>
                ) : isUpgrade && checkoutUrl ? (
                  <Button asChild size="sm" className="w-full">
                    <a href={checkoutUrl}>
                      Upgrade to {plan.name}
                    </a>
                  </Button>
                ) : isDowngrade && isActive ? (
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <a href="/api/polar/portal">Manage subscription</a>
                  </Button>
                ) : plan.id === "free" ? (
                  <Button
                    disabled
                    variant="ghost"
                    size="sm"
                    className="w-full"
                  >
                    Default
                  </Button>
                ) : checkoutUrl ? (
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <a href={checkoutUrl}>
                      Upgrade to {plan.name}
                    </a>
                  </Button>
                ) : (
                  <Button disabled variant="ghost" size="sm" className="w-full">
                    Unavailable
                  </Button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Compare link */}
      <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">
            Not sure which plan is right for you?
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Compare all features side by side to find the best fit.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="gap-1.5 w-fit">
          <Link href="/compare">
            Compare plans
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
