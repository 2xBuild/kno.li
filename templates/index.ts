import type { ComponentType } from "react";
import type { StaticImageData } from "next/image";
import type { Profile } from "@/lib/types";
import type { FieldRequirement } from "@/templates/types";

import linkfolio1Banner from "@/templates/linkfolio/1/banner.png";
import linkfolio2Banner from "@/templates/linkfolio/2/banner.png";
import linkfolio3Banner from "@/templates/linkfolio/3/banner.png";
import portfolio1Banner from "@/templates/portfolio/1/banner.png";
import portfolio2Banner from "@/templates/portfolio/2/banner.png";
import portfolio3Banner from "@/templates/portfolio/3/banner.png";

export type { FieldRequirement } from "@/templates/types";

/* ------------------------------------------------------------------ */
/*  Shared props every template component receives                     */
/* ------------------------------------------------------------------ */

export interface TemplateProps {
  profile: Profile;
}

/* ------------------------------------------------------------------ */
/*  Metadata shown on the landing page preview cards                   */
/* ------------------------------------------------------------------ */

export type TemplateCategory = "linkfolio" | "portfolio";

export interface TemplateMeta {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  fonts: { heading: string; body: string };
  animation: string;
  radius: string;
  previewImage: StaticImageData;
}

/* ------------------------------------------------------------------ */
/*  A registered template = metadata + lazy loaders                    */
/* ------------------------------------------------------------------ */

export interface TemplateEntry {
  meta: TemplateMeta;
  load: () => Promise<{ default: ComponentType<TemplateProps> }>;
  loadDummy: () => Promise<Profile>;
  loadReq: () => Promise<FieldRequirement[]>;
}

/* ------------------------------------------------------------------ */
/*  Registry                                                           */
/* ------------------------------------------------------------------ */

export const DEFAULT_TEMPLATE_ID = "linkfolio-1";

export const templates: TemplateEntry[] = [
  // ── Linkfolio ──────────────────────────────────────────────────────
  {
    meta: {
      id: "linkfolio-1",
      name: "Minimal Intro",
      description: "Clean intro page with minimalistic design",
      category: "linkfolio",
      fonts: { heading: "system-ui, sans-serif", body: "system-ui, sans-serif" },
      animation: "fade",
      radius: "0px",
      previewImage: linkfolio1Banner,
    },
    load: () => import("@/templates/linkfolio/1"),
    loadDummy: () => import("@/templates/linkfolio/1/dummy.json").then((m) => m.default as Profile),
    loadReq: () => import("@/templates/linkfolio/1/req").then((m) => m.fields),
  },
  {
    meta: {
      id: "linkfolio-2",
      name: "Just Links",
      description: "Avatar, name, bio & full-width platform link buttons",
      category: "linkfolio",
      fonts: { heading: "DM Sans, sans-serif", body: "DM Sans, sans-serif" },
      animation: "fade",
      radius: "12px",
      previewImage: linkfolio2Banner,
    },
    load: () => import("@/templates/linkfolio/2"),
    loadDummy: () => import("@/templates/linkfolio/2/dummy.json").then((m) => m.default as Profile),
    loadReq: () => import("@/templates/linkfolio/2/req").then((m) => m.fields),
  },
  {
    meta: {
      id: "linkfolio-3",
      name: "Single Page Links",
      description: "Plain HTML link page with external links and internal same-page sections",
      category: "linkfolio",
      fonts: { heading: "serif", body: "serif" },
      animation: "none",
      radius: "0px",
      previewImage: linkfolio3Banner,
    },
    load: () => import("@/templates/linkfolio/3"),
    loadDummy: () => import("@/templates/linkfolio/3/dummy.json").then((m) => m.default as Profile),
    loadReq: () => import("@/templates/linkfolio/3/req").then((m) => m.fields),
  },

  // ── Portfolio ──────────────────────────────────────────────────────
  {
    meta: {
      id: "portfolio-1",
      name: "Classic",
      description: "Timeless single-column portfolio with clean, structured sections",
      category: "portfolio",
      fonts: { heading: "Space Grotesk, sans-serif", body: "IBM Plex Sans, sans-serif" },
      animation: "fade",
      radius: "0px",
      previewImage: portfolio1Banner,
    },
    load: () => import("@/templates/portfolio/1"),
    loadDummy: () => import("@/templates/portfolio/1/dummy.json").then((m) => m.default as Profile),
    loadReq: () => import("@/templates/portfolio/1/req").then((m) => m.fields),
  },
  {
    meta: {
      id: "portfolio-2",
      name: "Sharp Edges",
      description: "Bold portfolio layout with crisp borders, banner-led hero, and project-first storytelling",
      category: "portfolio",
      fonts: { heading: "Space Grotesk, sans-serif", body: "Inter, sans-serif" },
      animation: "fade",
      radius: "0px",
      previewImage: portfolio2Banner,
    },
    load: () => import("@/templates/portfolio/2"),
    loadDummy: () => import("@/templates/portfolio/2/dummy.json").then((m) => m.default as Profile),
    loadReq: () => import("@/templates/portfolio/2/req").then((m) => m.fields),
  },
  {
    meta: {
      id: "portfolio-3",
      name: "Ramxfolio",
      description: "Modern portfolio inspired by sleek-portfolio: dashed skill tags, clean sections, rounded cards",
      category: "portfolio",
      fonts: { heading: "system-ui, sans-serif", body: "system-ui, sans-serif" },
      animation: "fade",
      radius: "10px",
      previewImage: portfolio3Banner,
    },
    load: () => import("@/templates/portfolio/3"),
    loadDummy: () => import("@/templates/portfolio/3/dummy.json").then((m) => m.default as Profile),
    loadReq: () => import("@/templates/portfolio/3/req").then((m) => m.fields),
  },
];

/* ------------------------------------------------------------------ */
/*  Legacy ID map — old numeric IDs → new category-prefixed IDs        */
/* ------------------------------------------------------------------ */

const LEGACY_ID_MAP: Record<string, string> = {
  "1": "linkfolio-1",
  "2": "portfolio-1",
  "3": "portfolio-3",
  "4": "portfolio-1",
  "5": "linkfolio-2",
};

function resolveTemplateId(id: string): string {
  return LEGACY_ID_MAP[id] ?? id;
}

/* ------------------------------------------------------------------ */
/*  DB app-type ↔ template category mapping                            */
/*  DB enum stays "link-organiser"; template category is "linkfolio".  */
/* ------------------------------------------------------------------ */

export function appTypeToCategory(dbType: string): TemplateCategory {
  if (dbType === "link-organiser") return "linkfolio";
  return dbType as TemplateCategory;
}

export function categoryToAppType(category: TemplateCategory): string {
  if (category === "linkfolio") return "link-organiser";
  return category;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

export function getTemplateEntry(id: string): TemplateEntry {
  const resolved = resolveTemplateId(id);
  return (
    templates.find((t) => t.meta.id === resolved) ??
    templates.find((t) => t.meta.id === DEFAULT_TEMPLATE_ID)!
  );
}

export function getTemplateMeta(id: string): TemplateMeta {
  return getTemplateEntry(id).meta;
}
