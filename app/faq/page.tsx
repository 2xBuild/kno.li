import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ChevronDown, CircleHelp } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "FAQ · kno.li",
  description:
    "Frequently asked questions about kno.li: portfolios, linkfolios, custom domains, analytics, pricing, and more.",
};

const FAQ_ITEMS = [
  {
    q: "What is kno.li?",
    a: "kno.li is a platform to host portfolios and linkfolios (link-in-bio pages) for yourself, your brand, or your SaaS. You get beautiful templates, optional custom domains, and built-in analytics—all on our infrastructure.",
  },
  {
    q: "How do I get started?",
    a: "Sign in with Google, then create your first app from the dashboard. Pick a template, customize your content, and publish. Your profile will be live at kno.li/yourusername or on a custom domain if you're on Pro or Ultra.",
  },
  {
    q: "What's the difference between Free, Pro, and Ultra?",
    a: "Free: 1 app, access to all templates, and in-house domains (kno.li, about.ec, it-iz.me, wanna-hire.me). Pro: up to 3 apps, full analytics (unique visitors, click tracking, country-wise traffic), and custom domain support. Ultra: up to 15 apps, full analytics, custom domains for all apps, dedicated support, and early access to new features.",
  },
  {
    q: "Can I use my own domain?",
    a: "Yes. Custom domains are available on Pro and Ultra plans. Add your domain in the dashboard, create the TXT and CNAME records we provide, and verify. Once DNS propagates, your portfolio will be served from your domain.",
  },
  {
    q: "How does analytics work?",
    a: "We collect analytics in-house via kno.li APIs—no third-party tracking pixels. For Pro and Ultra plans, you get page views, unique visitors, link clicks, referrers, and country-wise traffic. Data uses hashed identifiers; we don't store raw personal identifiers.",
  },
  {
    q: "What templates are available?",
    a: "We offer portfolio templates (full-page layouts with experience, projects, and more) and linkfolio templates (link-in-bio style). All templates are included on every plan. Browse them from the Templates page or when creating an app.",
  },
  {
    q: "Is there a link-in-bio option?",
    a: "Yes. Our linkfolio templates are designed for link-in-bio use. Add your social links, projects, and CTAs in a clean, customizable layout.",
  },
  {
    q: "How do I customize my profile?",
    a: "From the dashboard, open your app and use the editor to change text, images, colors, fonts, and layout. Each template has different customization options. Pro and Ultra users can also connect custom domains.",
  },
];

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-background font-landing">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="-ml-2 mb-6 text-muted-foreground hover:text-foreground"
        >
          <Link href="/" className="inline-flex items-center gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </Button>

        <header className="mb-10">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Frequently asked questions
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Common questions and answers about kno.li.
          </p>
        </header>

        <div className="space-y-2">
          {FAQ_ITEMS.map((item) => (
            <details
              key={item.q}
              className="group rounded-xl border border-border/60 bg-card shadow-sm transition-colors hover:border-border [&[open]]:border-border [&[open]]:bg-muted/30"
            >
              <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3.5 text-left text-sm font-medium text-foreground marker:hidden [&::-webkit-details-marker]:hidden">
                <CircleHelp className="size-4 shrink-0 text-muted-foreground" />
                <span className="flex-1">{item.q}</span>
                <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <div className="border-t border-border/60 px-4 py-3 pl-11">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </p>
              </div>
            </details>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          Still have questions?{" "}
          <Link
            href="/tnc"
            className="underline underline-offset-2 text-foreground hover:text-muted-foreground"
          >
            Privacy &amp; Terms
          </Link>
          {" · "}
          <Link
            href="/compare"
            className="underline underline-offset-2 text-foreground hover:text-muted-foreground"
          >
            Compare plans
          </Link>
        </p>
      </div>
    </div>
  );
}
