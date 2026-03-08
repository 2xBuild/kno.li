import type { FieldRequirement } from "@/templates/types";

export const fields: FieldRequirement[] = [
  { field: "heading_bold", type: "text", required: true, description: "Title shown at the top" },
  { field: "desc_1", type: "textarea", required: true, description: "Description shown in the centered layout" },
  { field: "link_items", type: "link_items", required: true, description: "List of links. External links open a URL; internal links open same-page content with a back button." },
];
