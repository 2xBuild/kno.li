"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import type { ProfileLinkItem } from "@/lib/types";
import type { TemplateProps } from "@/templates";

const PAGE_STYLE: CSSProperties = {
  maxWidth: "32rem",
  margin: "0 auto",
  padding: "3rem 1.25rem 4rem",
  fontFamily: "serif",
  lineHeight: 1.6,
};

const PARAGRAPH_STYLE: CSSProperties = {
  marginTop: "1rem",
};

const MINI_HEADING_STYLE: CSSProperties = {
  fontSize: "1rem",
  fontWeight: 600,
};

const LINKS_ROW_STYLE: CSSProperties = {
  marginTop: "2rem",
};

const BACK_LINK_WRAPPER_STYLE: CSSProperties = {
  marginBottom: "1rem",
};

const LINK_STYLE: CSSProperties = {
  color: "var(--linkfolio-3-link-color)",
  textDecorationLine: "underline",
};

const LINKS_COLUMN_STYLE: CSSProperties = {
  margin: 0,
  padding: 0,
};

const LINK_LINE_STYLE: CSSProperties = {
  display: "block",
};

function toSectionId(label: string, index: number) {
  const slug = label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || `section-${index + 1}`;
}

function getLinkItems(profile: TemplateProps["profile"]): Array<
  ProfileLinkItem & { sectionId: string }
> {
  const source =
    profile.link_items && profile.link_items.length > 0
      ? profile.link_items
      : profile.social_links.map((link) => ({
          kind: "external" as const,
          label: link.label,
          href: link.href,
          content: "",
        }));

  return source.map((item, index) => ({
    ...item,
    sectionId: toSectionId(item.label, index),
  }));
}

function splitParagraphs(content: string) {
  return content
    .split(/\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function opensInNewTab(href: string) {
  return href.startsWith("http://") || href.startsWith("https://");
}

function renderLink(
  item: ProfileLinkItem & { sectionId: string },
  index: number,
) {
  if (item.kind === "internal") {
    return (
      <a href={`#${item.sectionId}`} style={LINK_STYLE} data-link-id={item.label}>
        {item.label}
      </a>
    );
  }

  if (item.href) {
    return (
      <a
        href={item.href}
        style={LINK_STYLE}
        target={opensInNewTab(item.href) ? "_blank" : undefined}
        rel={opensInNewTab(item.href) ? "noopener noreferrer" : undefined}
        data-link-id={item.label}
      >
        {item.label}
      </a>
    );
  }

  return <span key={`${item.label}-${index}`}>{item.label}</span>;
}

export default function SinglePageLinksTemplate({ profile }: TemplateProps) {
  const [activeSectionId, setActiveSectionId] = useState("");
  const linkItems = getLinkItems(profile);

  useEffect(() => {
    const syncFromHash = () => {
      setActiveSectionId(window.location.hash.replace(/^#/, ""));
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);

    return () => {
      window.removeEventListener("hashchange", syncFromHash);
    };
  }, []);

  const activeItem = linkItems.find(
    (item) => item.kind === "internal" && item.sectionId === activeSectionId,
  );

  if (activeItem) {
    const paragraphs = splitParagraphs(activeItem.content ?? "");

    return (
      <main style={PAGE_STYLE}>
        <p style={BACK_LINK_WRAPPER_STYLE}>
          <a
            href="#"
            style={LINK_STYLE}
            onClick={(event) => {
              event.preventDefault();
              window.history.pushState(
                null,
                "",
                window.location.pathname + window.location.search,
              );
              setActiveSectionId("");
            }}
          >
            Back
          </a>
        </p>

        <p style={{ ...MINI_HEADING_STYLE, marginTop: 0 }}>{activeItem.label}</p>

        {paragraphs.length > 0
          ? paragraphs.map((paragraph, index) => (
              <p key={`${activeItem.sectionId}-${index}`} style={PARAGRAPH_STYLE}>
                {paragraph}
              </p>
            ))
          : null}
      </main>
    );
  }

  return (
    <main style={PAGE_STYLE}>
      {profile.desc_1 ? <p>{profile.desc_1}</p> : null}

      {linkItems.length > 0 ? (
        <section>
          <div style={LINKS_ROW_STYLE}>
            {profile.heading_bold ? (
              <p style={{ ...MINI_HEADING_STYLE, margin: 0 }}>{profile.heading_bold}</p>
            ) : null}
            <div style={LINKS_COLUMN_STYLE}>
              {linkItems.map((item, index) => (
                <span key={`${item.label}-${index}`} style={LINK_LINE_STYLE}>
                  {renderLink(item, index)}
                </span>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
