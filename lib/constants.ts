/** App logo path for favicon, headers, and branding. */
export const APP_LOGO_PATH = "/logo.png";

/**
 * Custom header set by middleware with the actual host from the request URL.
 * Used for custom domain routing because Next.js rewrites can overwrite
 * x-forwarded-host in production.
 */
export const X_REQUEST_HOST = "x-request-host";

export const FIRST_PARTY_HOSTS = new Set([
  "cutefol.io",
  "www.cutefol.io",
  "kno.li",
  "www.kno.li",
  "about.ec",
  "www.about.ec",
  "it-iz.me",
  "www.it-iz.me",
  "wanna-hire.me",
  "www.wanna-hire.me",
  "localhost",
  "127.0.0.1",
  
]);

/** Non-www, non-local domains shown to users (e.g. in default-domains badges). */
export const DISPLAY_DOMAINS = [...FIRST_PARTY_HOSTS].filter(
  (h) => !h.startsWith("www.") && h !== "localhost" && h !== "127.0.0.1",
);

/** Domains not yet active; show "Coming soon" and mute in UI. */
export const COMING_SOON_DOMAINS = ["kno.li", "about.ec"];

export function isFirstPartyHost(host: string): boolean {
  return FIRST_PARTY_HOSTS.has(host.split(":")[0]?.toLowerCase() ?? "");
}

export function normalizeHost(rawHost: string | null | undefined): string | null {
  if (!rawHost) return null;
  const host = rawHost.split(":")[0]?.trim().toLowerCase();
  return host || null;
}

export type FontSource = "system" | "google";

export interface FontOption {
  id: string;
  label: string;
  value: string;
  source: FontSource;
}

export const PROFILE_FONT_OPTIONS: FontOption[] = [
  {
    id: "inter",
    label: "Inter",
    value: '"Inter", "Segoe UI", Roboto, Arial, sans-serif',
    source: "google",
  },
  {
    id: "space-grotesk",
    label: "Space Grotesk",
    value: '"Space Grotesk", "Segoe UI", Arial, sans-serif',
    source: "google",
  },
  {
    id: "ibm-plex-sans",
    label: "IBM Plex Sans",
    value: '"IBM Plex Sans", "Segoe UI", Arial, sans-serif',
    source: "google",
  },
  {
    id: "dm-sans",
    label: "DM Sans",
    value: '"DM Sans", "Segoe UI", Arial, sans-serif',
    source: "google",
  },
  {
    id: "manrope",
    label: "Manrope",
    value: '"Manrope", "Segoe UI", Arial, sans-serif',
    source: "google",
  },
  {
    id: "plus-jakarta-sans",
    label: "Plus Jakarta Sans",
    value: '"Plus Jakarta Sans", "Segoe UI", Arial, sans-serif',
    source: "google",
  },
  {
    id: "poppins",
    label: "Poppins",
    value: '"Poppins", "Segoe UI", Arial, sans-serif',
    source: "google",
  },
  {
    id: "outfit",
    label: "Outfit",
    value: '"Outfit", "Segoe UI", Arial, sans-serif',
    source: "google",
  },
  {
    id: "nunito",
    label: "Nunito",
    value: '"Nunito", "Segoe UI", Arial, sans-serif',
    source: "google",
  },
  {
    id: "public-sans",
    label: "Public Sans",
    value: '"Public Sans", "Segoe UI", Arial, sans-serif',
    source: "google",
  },
  {
    id: "system-ui",
    label: "System UI",
    value: 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
    source: "system",
  },
  {
    id: "georgia",
    label: "Georgia",
    value: "Georgia, Cambria, serif",
    source: "system",
  },
  {
    id: "times-new-roman",
    label: "Times New Roman",
    value: '"Times New Roman", Times, serif',
    source: "system",
  },
  {
    id: "trebuchet-ms",
    label: "Trebuchet MS",
    value: '"Trebuchet MS", "Lucida Sans Unicode", sans-serif',
    source: "system",
  },
];

export const PROFILE_FONT_VALUES = new Set(
  PROFILE_FONT_OPTIONS.map((font) => font.value),
);

const LEGACY_PROFILE_FONT_VALUES = [
  '"Inter", sans-serif',
  '"Space Grotesk", sans-serif',
  '"IBM Plex Sans", sans-serif',
  '"DM Sans", sans-serif',
  "DM Sans, sans-serif",
  "system-ui, sans-serif",
];

for (const font of LEGACY_PROFILE_FONT_VALUES) {
  PROFILE_FONT_VALUES.add(font);
}
