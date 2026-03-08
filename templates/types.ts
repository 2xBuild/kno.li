/**
 * Field types determine which editor widget is rendered.
 *
 * - text          → single-line Input
 * - textarea      → multi-line Textarea
 * - url           → single-line Input (URL)
 * - image_url     → single-line Input with image preview
 * - tech_stack    → array of { iconName, visibleName } with icon picker
 * - social_links  → array of { type (icon), label, href } with icon picker
 * - link_items    → array of { kind, label, href?, content? }
 * - cta_buttons   → array of { type, label, href, icon? } with icon picker
 * - experience    → array of experience objects
 * - projects      → array of project objects
 * - blogs         → array of blog objects
 * - meeting_link  → { label, href } object
 * - quote         → { text, author? } object
 * - theme         → nested theme object (colors + fonts)
 */
export type FieldType =
  | "text"
  | "textarea"
  | "url"
  | "image_url"
  | "tech_stack"
  | "social_links"
  | "link_items"
  | "cta_buttons"
  | "experience"
  | "projects"
  | "blogs"
  | "meeting_link"
  | "quote"
  | "theme";

export interface FieldRequirement {
  field: string;
  type: FieldType;
  required: boolean;
  description: string;
}
