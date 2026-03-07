import { fetchProfile, resolveProfileImgUrl } from "@/lib/profile";
import { getProfileThemeStyle } from "@/lib/profile-theme";
import { InvalidConfig, NotFound } from "@/components/errors";
import { getTemplateEntry, DEFAULT_TEMPLATE_ID } from "@/templates";
import { headers } from "next/headers";
import { after } from "next/server";
import { ProfileLinkTracker } from "@/components/analytics/profile-link-tracker";
import { trackPageViewForRequest } from "@/lib/services/analytics-service";

interface PageProps {
  params: Promise<{ username: string }>;
}

export const dynamic = "force-dynamic";

export default async function UserPage({ params }: PageProps) {
  const { username } = await params;
  const requestHeadersList = await headers();
  const host =
    requestHeadersList.get("x-forwarded-host") ??
    requestHeadersList.get("host") ??
    undefined;

  const result = await fetchProfile(username, { host });

  if (result.status === "not_found") {
    console.error("[routing] Profile not found", { username, host });
    return (
      <div data-page-sfx-scope="portfolio">
        <NotFound />
      </div>
    );
  }
  if (result.status === "invalid_config") {
    console.error("[routing] Invalid config for profile", { username, host });
    return (
      <div data-page-sfx-scope="portfolio">
        <InvalidConfig />
      </div>
    );
  }

  if (result.appId) {
    const requestHeaders = new Headers();
    requestHeadersList.forEach((value, key) => {
      requestHeaders.set(key, value);
    });

    after(async () => {
      try {
        await trackPageViewForRequest({
          appId: result.appId!,
          path: `/${username}`,
          headers: requestHeaders,
        });
      } catch {
        // non-blocking analytics
      }
    });
  }

  const { profile } = result;
  const entry = getTemplateEntry(profile.template ?? DEFAULT_TEMPLATE_ID);
  const { default: Template } = await entry.load();

  return (
    <div
      data-page-sfx-scope="portfolio"
      className="flex min-h-screen items-center justify-center bg-background"
      style={getProfileThemeStyle(profile)}
    >
      <Template profile={profile} />
      {result.appId ? <ProfileLinkTracker appId={result.appId} /> : null}
    </div>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { username } = await params;
  const requestHeadersList = await headers();
  const host =
    requestHeadersList.get("x-forwarded-host") ??
    requestHeadersList.get("host") ??
    undefined;
  const protocol =
    requestHeadersList.get("x-forwarded-proto") ??
    (host?.includes("localhost") ? "http" : "https");
  const result = await fetchProfile(username, { host });
  if (result.status !== "ok") return { title: "Not found" };

  const { profile, source } = result;
  const imgUrl = resolveProfileImgUrl(username, profile.img, source);
  const displayName = profile.heading_bold || username;
  const normalizedHost = host?.split(":")[0]?.toLowerCase();
  const ogImageUrl = normalizedHost
    ? `${protocol}://${normalizedHost}/${username}/opengraph-image`
    : `${process.env.SITE_URL ?? "https://cutefolio"}/${username}/opengraph-image`;
  const description = profile.desc_2 || profile.desc_3 || profile.desc_1;

  return {
    title: `${displayName} | cutefolio`,
    description,
    icons: {
      icon: imgUrl,
    },
    openGraph: {
      title: `${displayName} | cutefolio`,
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
      title: `${displayName} | cutefolio`,
      description,
      images: [ogImageUrl],
    },
  };
}
