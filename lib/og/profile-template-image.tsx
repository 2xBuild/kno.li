import { ImageResponse } from "next/og";
import { resolveProfileImgUrl } from "@/lib/profile";
import type { Profile, ProfileSource } from "@/lib/types";
import {
  OG_IMAGE_SIZE,
  fetchImageAsDataUrl,
  loadGeistPixelFont,
  readPublicImageAsDataUrl,
  truncateText,
} from "@/lib/og/shared";
import type {
  PreparedOgProfile,
  TemplateFamily,
} from "@/lib/og/profile-template-visuals";
import { renderLinkfolioOgImage } from "@/templates/linkfolio/og-image";
import { renderPortfolioOgImage } from "@/templates/portfolio/og-image";

const DEFAULT_TEMPLATE_ID = "linkfolio-1";

const LEGACY_TEMPLATE_MAP: Record<string, string> = {
  "1": "linkfolio-1",
  "2": "portfolio-1",
  "3": "portfolio-2",
  "4": "portfolio-1",
  "5": "linkfolio-2",
};

const HEX_COLOR_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

function resolveTemplateId(template: string | undefined): string {
  if (!template) return DEFAULT_TEMPLATE_ID;
  return LEGACY_TEMPLATE_MAP[template] ?? template;
}

function resolveTemplateFamily(templateId: string): TemplateFamily {
  return templateId.startsWith("portfolio") ? "portfolio" : "linkfolio";
}

function resolveDisplayName(profile: Profile, username: string): string {
  const bold = profile.heading_bold?.trim() ?? "";
  const light = profile.heading_light?.trim() ?? "";
  const full = `${bold} ${light}`.trim();
  if (full) return truncateText(full, 56);
  return truncateText(username, 56);
}

function resolveAccent(profile: Profile, family: TemplateFamily): string {
  const fallback = family === "portfolio" ? "#22d3ee" : "#38bdf8";
  const custom = profile.theme?.colors?.accent?.trim();
  if (!custom) return fallback;
  return HEX_COLOR_RE.test(custom) ? custom : fallback;
}

function getLinkLabels(profile: Profile): string[] {
  const linkItems = Array.isArray(profile.link_items) && profile.link_items.length > 0
    ? profile.link_items
    : Array.isArray(profile.social_links)
      ? profile.social_links
      : [];
  const ctaButtons = Array.isArray(profile.cta_buttons)
    ? profile.cta_buttons
    : [];

  const labels = [
    ...linkItems.map((item) => item.label.trim()),
    ...ctaButtons.map((item) => item.label.trim()),
  ].filter(Boolean);

  return [...new Set(labels)].slice(0, 5).map((label) => truncateText(label, 24));
}

function getTechLabels(profile: Profile): string[] {
  const techStack = Array.isArray(profile.tech_stack) ? profile.tech_stack : [];

  return techStack
    .map((item) => (typeof item === "string" ? item : item.visibleName))
    .map((label) => label.trim())
    .filter(Boolean)
    .slice(0, 6)
    .map((label) => truncateText(label, 22));
}

function buildStats(
  profile: Profile,
  family: TemplateFamily
): Array<{ label: string; value: string }> {
  const linkItems = Array.isArray(profile.link_items) && profile.link_items.length > 0
    ? profile.link_items
    : Array.isArray(profile.social_links)
      ? profile.social_links
      : [];
  const ctaButtons = Array.isArray(profile.cta_buttons)
    ? profile.cta_buttons
    : [];
  const techStack = Array.isArray(profile.tech_stack) ? profile.tech_stack : [];

  if (family === "portfolio") {
    return [
      { label: "Projects", value: String(profile.projects?.length ?? 0) },
      { label: "Experience", value: String(profile.experience?.length ?? 0) },
      { label: "Blogs", value: String(profile.blogs?.length ?? 0) },
    ];
  }

  return [
    { label: "Links", value: String(linkItems.length) },
    { label: "CTA", value: String(ctaButtons.length) },
    { label: "Tech", value: String(techStack.length) },
  ];
}

function renderByTemplate(data: PreparedOgProfile) {
  return data.family === "portfolio"
    ? renderPortfolioOgImage(data)
    : renderLinkfolioOgImage(data);
}

export async function buildTemplateProfileOgImage(
  profile: Profile,
  username: string,
  source: ProfileSource = "kno-li"
): Promise<Response> {
  const templateId = resolveTemplateId(profile.template);
  const family = resolveTemplateFamily(templateId);
  const displayName = resolveDisplayName(profile, username);
  const headline = truncateText(
    profile.desc_1?.trim() ||
      profile.desc_2?.trim() ||
      `${displayName} on cutefolio`,
    150
  );
  const description = truncateText(
    profile.desc_2?.trim() ||
      profile.desc_3?.trim() ||
      "Explore links, projects, and contact details.",
    180
  );
  const accent = resolveAccent(profile, family);

  const avatarUrl = resolveProfileImgUrl(username, profile.img ?? "", source);
  const [avatarSrc, bannerSrc, brandLogoSrc] = await Promise.all([
    fetchImageAsDataUrl(avatarUrl),
    fetchImageAsDataUrl(profile.banner_image),
    readPublicImageAsDataUrl("/flat_logo.png"),
  ]);
  const fonts = await loadGeistPixelFont();

  const data: PreparedOgProfile = {
    templateId,
    family,
    displayName,
    headline,
    description,
    accent,
    avatarSrc,
    bannerSrc,
    brandLogoSrc,
    username: truncateText(username, 24),
    linkLabels: getLinkLabels(profile),
    techLabels: getTechLabels(profile),
    stats: buildStats(profile, family),
  };

  return new ImageResponse(renderByTemplate(data), {
    ...OG_IMAGE_SIZE,
    fonts,
    headers: {
      "Cache-Control": "public, max-age=1800",
    },
  });
}

export function buildProfileOgNotFound(): Response {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(120deg, #020617 0%, #0f172a 48%, #1e293b 100%)",
          color: "#f8fafc",
          fontSize: 48,
          fontWeight: 600,
          letterSpacing: "-0.03em",
        }}
      >
        Profile not found
      </div>
    ),
    { ...OG_IMAGE_SIZE }
  );
}
