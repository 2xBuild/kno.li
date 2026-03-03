import type { Metadata } from "next";
import { PricingSection } from "@/components/landing/pricing-section";
import { GitHubPill } from "@/components/landing/github-pill";
import { HeroSection } from "@/components/landing/hero-section";
import { ThemeToggle } from "@/components/landing/theme-toggle";
import { FactsSection } from "@/components/landing/facts-section";
import { SiteFooter } from "@/components/landing/site-footer";
import { headers } from "next/headers";
import { after } from "next/server";
import { fetchProfileFromCustomDomain, resolveProfileImgUrl } from "@/lib/profile";
import { getProfileThemeStyle } from "@/lib/profile-theme";
import { getTemplateEntry, DEFAULT_TEMPLATE_ID } from "@/templates";
import { InvalidConfig, NotFound } from "@/components/errors";
import { trackPageViewForRequest } from "@/lib/services/analytics-service";
import { ProfileLinkTracker } from "@/components/analytics/profile-link-tracker";
import { FIRST_PARTY_HOSTS, X_REQUEST_HOST } from "@/lib/constants";

const DEFAULT_METADATA: Metadata = {
  title: "kno.li | Host your portfolio",
  description:
    "Host your portfolio at kno.li with beautiful templates and built-in analytics.",
};

export async function generateMetadata(): Promise<Metadata> {
  const requestHeadersList = await headers();
  const hostHeader =
    requestHeadersList.get(X_REQUEST_HOST) ??
    requestHeadersList.get("x-forwarded-host") ??
    requestHeadersList.get("host") ??
    "";
  const host = hostHeader.split(":")[0]?.toLowerCase();

  if (!host || FIRST_PARTY_HOSTS.has(host)) {
    return DEFAULT_METADATA;
  }

  const result = await fetchProfileFromCustomDomain(host);
  if (result.status !== "ok") return DEFAULT_METADATA;

  const { profile, slug } = result;
  const displayName = profile.heading_bold || slug || host;
  const description = profile.desc_2 || profile.desc_3 || profile.desc_1;
  const imgUrl = resolveProfileImgUrl(slug ?? host, profile.img, "kno-li");
  const protocol =
    requestHeadersList.get("x-forwarded-proto") ??
    (host.includes("localhost") ? "http" : "https");
  const ogImageUrl = `${protocol}://${host}/opengraph-image`;

  return {
    title: `${displayName} | kno.li`,
    description,
    icons: {
      icon: imgUrl,
      apple: imgUrl,
    },
    openGraph: {
      title: `${displayName} | kno.li`,
      description,
      type: "profile",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${displayName} profile preview`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${displayName} | kno.li`,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function Home() {
  const requestHeadersList = await headers();
  const hostHeader =
    requestHeadersList.get(X_REQUEST_HOST) ??
    requestHeadersList.get("x-forwarded-host") ??
    requestHeadersList.get("host") ??
    "";
  const host = hostHeader.split(":")[0]?.toLowerCase();

  if (host && !FIRST_PARTY_HOSTS.has(host)) {
    const result = await fetchProfileFromCustomDomain(host);
    if (result.status === "invalid_config") {
      console.error("[routing] Invalid config for custom domain", { host });
      return <InvalidConfig />;
    }
    if (result.status === "not_found") {
      console.error("[routing] Profile not found for custom domain", { host });
      return <NotFound />;
    }

    const analyticsAppId = result.source === "kno-li" ? result.appId : undefined;
    if (analyticsAppId) {
      const requestHeaders = new Headers();
      requestHeadersList.forEach((value, key) => {
        requestHeaders.set(key, value);
      });

      after(async () => {
        try {
          await trackPageViewForRequest({
            appId: analyticsAppId,
            path: "/",
            headers: requestHeaders,
          });
        } catch {
          // non-blocking analytics
        }
      });
    }

    const entry = getTemplateEntry(result.profile.template ?? DEFAULT_TEMPLATE_ID);
    const { default: Template } = await entry.load();

    return (
      <div
        className="flex min-h-screen items-center justify-center bg-background"
        style={getProfileThemeStyle(result.profile)}
      >
        <Template profile={result.profile} />
        {result.appId ? <ProfileLinkTracker appId={result.appId} /> : null}
      </div>
    );
  }

  return (
    <div className="bg-background font-landing">
      <HeroSection
        githubPill={
          <div className="flex items-center justify-center gap-3">
            <GitHubPill />
            <ThemeToggle />
          </div>
        }
      />
      <FactsSection />
      <PricingSection />
      <SiteFooter />
    </div>
  );
}
