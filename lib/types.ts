export interface ProfileSocialLink {
  type: string;
  label: string;
  href: string;
}

export interface ProfileLinkItem {
  kind: "external" | "internal";
  label: string;
  href?: string;
  content?: string;
}

export interface ProfileCta {
  /** "primary" = filled, "secondary" = outline */
  type: "primary" | "secondary";
  label: string;
  href: string;
  /** Optional icon: "PACK IconName" (e.g. "LU FileText", "SI Github", "FA6 FilePdf") */
  icon?: string;
}

/** Tech with icon spec + display name. Legacy: plain string = same value for both. */
export interface ProfileTech {
  /** Icon spec: "PACK IconName" (e.g. "SI Typescript", "LU Code", "TB BrandGithub") */
  iconName: string;
  /** Label shown in the UI */
  visibleName: string;
}

export interface ProfileExperience {
  company: string;
  role: string;
  period: string;
  location?: string;
  tech?: string[];
  bullets?: string[];
}

export interface ProfileProject {
  title: string;
  description: string;
  /** Optional project thumbnail/image URL */
  image?: string;
  href?: string;
  tech?: string[];
}

export interface ProfileBlog {
  title: string;
  description: string;
  href: string;
  date?: string;
  tags?: string[];
}

export interface ProfileThemeColors {
  /** Portfolio background color */
  bg?: string;
  /** Main text color */
  text?: string;
  /** Secondary/muted text color */
  muted?: string;
  /** Accent color (buttons, focus, highlights) */
  accent?: string;
  /** Border/outline color */
  border?: string;
}

export interface ProfileThemeFonts {
  /** Default text font family */
  body?: string;
  /** Heading font family */
  heading?: string;
}

export interface ProfileTheme {
  colors?: ProfileThemeColors;
  fonts?: ProfileThemeFonts;
}

export interface Profile {
  /** Template id — defaults to "1" (minimal) when omitted */
  template?: string;
  /** Optional hero/banner image for template variants that support it */
  banner_image?: string;
  img: string;
  img_alt: string;
  heading_bold: string;
  /** Legacy secondary heading; for newer templates, prefer `title` below. */
  heading_light: string;
  /** Optional widget corner style for templates that support it ("rounded" | "flat"). */
  card_corner_style?: string;
  /** Title/role shown under the main name heading (e.g. "Frontend Developer"). */
  title?: string;
  desc_1: string;
  tech_stack: (string | ProfileTech)[];
  desc_2: string;
  desc_3: string;
  cta_buttons: ProfileCta[];
  social_links: ProfileSocialLink[];
  /** Optional: used by section-based linkfolio templates */
  link_items?: ProfileLinkItem[];
  /** Optional: for templates that show experience section */
  experience?: ProfileExperience[];
  /** Optional: for templates that show projects section */
  projects?: ProfileProject[];
  /** Optional: for templates that show blogs section */
  blogs?: ProfileBlog[];
  /** Optional: "Book a call" / meeting link */
  meeting_link?: { label: string; href: string };
  /** Optional: quote section at bottom */
  quote?: { text: string; author?: string };
  /** Optional: custom color combo + fonts for portfolio styling */
  theme?: ProfileTheme;
}

export type ProfileSource = "kno-li";

export type FetchProfileResult =
  | {
      status: "ok";
      profile: Profile;
      source: ProfileSource;
      appId?: string;
      slug?: string;
    }
  | { status: "not_found" }
  | { status: "invalid_config" };
