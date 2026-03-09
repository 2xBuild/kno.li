"use client";

import { motion } from "motion/react";
import { ArrowUpRight, Code } from "lucide-react";
import type { CSSProperties } from "react";
import { getIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { ProfileSocialLink } from "@/lib/types";
import type { TemplateProps } from "@/templates";

const HEADING_FONT_CLASS = "[font-family:var(--profile-heading-font)]";

type PlatformKey =
  | "x"
  | "instagram"
  | "buymeacoffee"
  | "medium"
  | "youtube"
  | "github"
  | "linkedin"
  | "default";

interface PlatformTheme {
  label: string;
  accent: string;
  surfaceText: string;
}

interface WidgetCard {
  href: string;
  type: string;
  handle: string;
  theme: PlatformTheme;
  cardStyle: CSSProperties;
}

const PLATFORM_THEMES: Record<PlatformKey, PlatformTheme> = {
  x: {
    label: "X",
    accent: "#1f2937",
    surfaceText: "#f8fafc",
  },
  instagram: {
    label: "Instagram",
    accent: "#e1306c",
    surfaceText: "#fff1f8",
  },
  buymeacoffee: {
    label: "Buy Me a Coffee",
    accent: "#ffdd00",
    surfaceText: "#1f2937",
  },
  medium: {
    label: "Medium",
    accent: "#16a34a",
    surfaceText: "#f0fdf4",
  },
  youtube: {
    label: "YouTube",
    accent: "#ef4444",
    surfaceText: "#fef2f2",
  },
  github: {
    label: "GitHub",
    accent: "#334155",
    surfaceText: "#f8fafc",
  },
  linkedin: {
    label: "LinkedIn",
    accent: "#0a66c2",
    surfaceText: "#eff6ff",
  },
  default: {
    label: "Website",
    accent: "#0f766e",
    surfaceText: "#ecfeff",
  },
};

const HOST_TO_PLATFORM: Array<{ platform: PlatformKey; hosts: string[] }> = [
  { platform: "x", hosts: ["x.com", "twitter.com"] },
  { platform: "instagram", hosts: ["instagram.com"] },
  { platform: "buymeacoffee", hosts: ["buymeacoffee.com"] },
  { platform: "medium", hosts: ["medium.com"] },
  { platform: "youtube", hosts: ["youtube.com", "youtu.be"] },
  { platform: "github", hosts: ["github.com"] },
  { platform: "linkedin", hosts: ["linkedin.com"] },
];

function parseUrl(href: string): URL | null {
  try {
    return new URL(href);
  } catch {
    return null;
  }
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function toRgba(hex: string, alpha: number): string {
  const compact = hex.replace("#", "");
  if (compact.length !== 6 && compact.length !== 3) {
    return `rgba(15, 118, 110, ${alpha})`;
  }

  const normalized =
    compact.length === 3
      ? compact
          .split("")
          .map((ch) => `${ch}${ch}`)
          .join("")
      : compact;

  const num = Number.parseInt(normalized, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function detectPlatform(link: ProfileSocialLink): PlatformKey {
  const parsed = parseUrl(link.href);
  if (parsed && parsed.protocol !== "mailto:") {
    const host = parsed.hostname.toLowerCase();
    for (const rule of HOST_TO_PLATFORM) {
      const matched = rule.hosts.some((candidate) => host === candidate || host.endsWith(`.${candidate}`));
      if (matched) return rule.platform;
    }
  }

  const haystack = `${normalize(link.type)}${normalize(link.label)}${normalize(link.href)}`;
  if (haystack.includes("buymeacoffee")) return "buymeacoffee";
  if (haystack.includes("instagram")) return "instagram";
  if (haystack.includes("medium")) return "medium";
  if (haystack.includes("youtube")) return "youtube";
  if (haystack.includes("github")) return "github";
  if (haystack.includes("linkedin")) return "linkedin";
  if (haystack.includes("twitter") || haystack.includes("xcom")) return "x";
  return "default";
}

function decodePathSegment(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

function resolveHandle(link: ProfileSocialLink, platform: PlatformKey): string {
  const label = link.label.trim();
  if (label.startsWith("@")) return label;

  const parsed = parseUrl(link.href);
  if (!parsed) return label || "@profile";

  if (parsed.protocol === "mailto:") {
    const mailbox = parsed.pathname.trim();
    if (mailbox.includes("@")) {
      return `@${mailbox.split("@")[0]}`;
    }
    return "@email";
  }

  const segments = parsed.pathname
    .split("/")
    .map((segment) => decodePathSegment(segment).trim())
    .filter(Boolean);

  if (segments.length === 0) {
    return label || `@${PLATFORM_THEMES[platform].label.toLowerCase().replace(/\s+/g, "")}`;
  }

  let candidate = segments[0];

  if (platform === "linkedin" && (segments[0] === "in" || segments[0] === "company")) {
    candidate = segments[1] ?? segments[0];
  }
  if (platform === "youtube" && ["channel", "c", "user"].includes(segments[0])) {
    candidate = segments[1] ?? segments[0];
  }
  if (platform === "buymeacoffee" && ["members", "shop"].includes(segments[0])) {
    candidate = segments[1] ?? segments[0];
  }

  const cleaned = candidate.replace(/^@+/, "");
  if (!cleaned) return label || "@profile";
  return `@${cleaned}`;
}

function opensInNewTab(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

function resolveCornerStyle(value: string | undefined): "flat" | "rounded" {
  return value?.trim().toLowerCase() === "flat" ? "flat" : "rounded";
}

function buildWidget(link: ProfileSocialLink): WidgetCard {
  const platform = detectPlatform(link);
  const theme = PLATFORM_THEMES[platform];
  const handle = resolveHandle(link, platform);

  const cardStyle: CSSProperties = {
    color: theme.surfaceText,
    borderColor: toRgba(theme.surfaceText, 0.46),
    background: `linear-gradient(162deg, ${toRgba(theme.accent, 0.98)} 0%, ${toRgba(theme.accent, 0.9)} 58%, ${toRgba(theme.accent, 0.76)} 100%)`,
    boxShadow: [
      `0 16px 30px ${toRgba(theme.accent, 0.45)}`,
      `0 4px 0 ${toRgba(theme.accent, 0.88)}`,
      `inset 0 1px 0 ${toRgba("#ffffff", 0.34)}`,
      `inset 0 -14px 18px ${toRgba("#000000", 0.18)}`,
    ].join(", "),
  };

  return {
    href: link.href,
    type: link.type,
    handle,
    theme,
    cardStyle,
  };
}

/**
 * Linkfolio 4 — Bento Widgets
 *
 * Bento-style social cards with platform-tinted 3D fills.
 */
export default function BentoWidgetsTemplate({ profile }: TemplateProps) {
  const cardCornerStyle = resolveCornerStyle(
    (profile as TemplateProps["profile"] & { card_corner_style?: string }).card_corner_style,
  );
  const isFlat = cardCornerStyle === "flat";
  const panelRadiusClass = isFlat ? "rounded-none" : "rounded-[2rem]";
  const avatarRadiusClass = isFlat ? "rounded-none" : "rounded-[1.2rem]";
  const cardRadiusClass = isFlat ? "rounded-none" : "rounded-[1.4rem] sm:rounded-[1.7rem]";
  const widgets = profile.social_links.map((link) => buildWidget(link));

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative min-h-screen w-full overflow-hidden bg-background px-4 py-10 text-foreground sm:px-6 sm:py-14"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute right-[-6rem] top-1/3 h-80 w-80 rounded-full bg-rose-400/15 blur-3xl" />
        <div className="absolute bottom-[-8rem] left-1/3 h-72 w-72 rounded-full bg-emerald-400/15 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-5xl">
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, ease: "easeOut" }}
          className={cn(
            panelRadiusClass,
            "border border-border/60 bg-card/80 p-4 shadow-2xl backdrop-blur-xl sm:p-7",
          )}
        >
          <div className="flex items-center gap-4 sm:gap-5">
            <div
              className={cn(
                avatarRadiusClass,
                "relative h-16 w-16 overflow-hidden border-2 border-border/70 bg-muted sm:h-24 sm:w-24",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={profile.img}
                alt={profile.img_alt}
                width={96}
                height={96}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="min-w-0">
              <h1 className={cn("truncate text-2xl font-bold sm:text-3xl", HEADING_FONT_CLASS)}>
                {profile.heading_bold}
              </h1>
              {(profile.heading_light || profile.title) && (
                <p className="mt-1 truncate text-sm text-muted-foreground sm:text-base">
                  {profile.heading_light || profile.title}
                </p>
              )}
            </div>
          </div>

          {profile.desc_1 && (
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:mt-5 sm:text-base">
              {profile.desc_1}
            </p>
          )}
        </motion.header>

        {widgets.length > 0 ? (
          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:mt-6 sm:gap-4 lg:grid-cols-3">
            {widgets.map((widget, index) => {
              const Icon = getIcon(widget.type) ?? Code;
              return (
                <motion.a
                  key={`${widget.href}-${index}`}
                  href={widget.href}
                  target={opensInNewTab(widget.href) ? "_blank" : undefined}
                  rel={opensInNewTab(widget.href) ? "noopener noreferrer" : undefined}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.04, ease: "easeOut" }}
                  className={cn(
                    cardRadiusClass,
                    "group relative flex min-h-[132px] flex-col justify-between border p-2.5 backdrop-blur-xl transition-[filter] duration-300 hover:brightness-[1.08] hover:saturate-125 sm:min-h-[192px] sm:p-5",
                  )}
                  style={widget.cardStyle}
                >
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center p-1 sm:h-8 sm:w-8 sm:p-1.5">
                      <Icon
                        className="size-4 sm:size-5"
                        style={{ color: toRgba(widget.theme.surfaceText, 0.96) }}
                        aria-hidden
                      />
                    </span>
                    <p
                      className={cn(
                        "truncate text-base font-semibold sm:text-lg",
                        HEADING_FONT_CLASS,
                      )}
                      style={{ color: widget.theme.surfaceText }}
                    >
                      {widget.handle}
                    </p>
                  </div>

                  <div className="mt-4 flex items-end justify-between gap-2.5 sm:mt-5 sm:gap-3">
                    <p
                      className="text-[11px] font-medium uppercase tracking-[0.12em] sm:text-xs"
                      style={{ color: toRgba(widget.theme.surfaceText, 0.9) }}
                    >
                      {widget.theme.label}
                    </p>
                    <ArrowUpRight
                      className="size-4 shrink-0 sm:size-5"
                      style={{ color: toRgba(widget.theme.surfaceText, 0.92) }}
                    />
                  </div>
                </motion.a>
              );
            })}
          </div>
        ) : (
          <div
            className={cn(
              isFlat ? "rounded-none" : "rounded-3xl",
              "mt-6 border border-dashed border-border/60 bg-card/70 p-10 text-center text-sm text-muted-foreground",
            )}
          >
            Add social links to show your bento widgets.
          </div>
        )}
      </div>
    </motion.section>
  );
}
