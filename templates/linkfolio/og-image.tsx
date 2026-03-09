import type { PreparedOgProfile } from "@/lib/og/profile-template-visuals";
import { renderLinkfolioOneOgImage } from "@/templates/linkfolio/1/og-image";
import { renderLinkfolioTwoOgImage } from "@/templates/linkfolio/2/og-image";

export function renderLinkfolioOgImage(data: PreparedOgProfile) {
  switch (data.templateId) {
    case "linkfolio-4":
    case "linkfolio-2":
      return renderLinkfolioTwoOgImage(data);
    case "linkfolio-1":
    default:
      return renderLinkfolioOneOgImage(data);
  }
}
