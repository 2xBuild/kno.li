import type { FieldRequirement } from "@/templates/types";

export const fields: FieldRequirement[] = [
  { field: "img", type: "image_url", required: true, description: "Avatar image URL" },
  { field: "img_alt", type: "text", required: true, description: "Alt text for the avatar image" },
  { field: "heading_bold", type: "text", required: true, description: "Display name shown in the hero card" },
  { field: "heading_light", type: "text", required: false, description: "Optional subtitle shown below the name" },
  { field: "desc_1", type: "textarea", required: true, description: "Short intro shown above the widget grid" },
  { field: "social_links", type: "social_links", required: true, description: "Platform widgets with icon, handle, and action button" },
  { field: "card_corner_style", type: "text", required: false, description: "Card corner style: use `rounded` (default) or `flat`" },
  { field: "theme", type: "theme", required: false, description: "Optional profile theme fonts/colors" },
];
