"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Check, ExternalLink, Plus, Save, Trash2, X } from "lucide-react";
import { Loader } from "@/components/ui/loader";
import type {
  Profile,
  ProfileCta,
  ProfileLinkItem,
  ProfileSocialLink,
  ProfileTech,
  ProfileExperience,
  ProfileProject,
  ProfileBlog,
} from "@/lib/types";
import type { FieldRequirement } from "@/templates/types";
import {
  templates,
  getTemplateEntry,
  appTypeToCategory,
  type TemplateProps,
} from "@/templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconPicker } from "@/components/dashboard/icon-picker";
import { PROFILE_FONT_OPTIONS } from "@/lib/constants";
import { getProfileThemeStyle } from "@/lib/profile-theme";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface AppResponse {
  app: {
    id: string;
    slug: string;
    status: "draft" | "published";
    type: "portfolio" | "link-organiser";
    templateId: string;
  };
  currentContent: {
    content: Record<string, unknown>;
    version: number;
  } | null;
}

/* ------------------------------------------------------------------ */
/*  Coerce raw JSON → Profile                                          */
/* ------------------------------------------------------------------ */

function coerceProfile(
  content: Record<string, unknown> | undefined,
  appTemplateId: string,
): Profile {
  const next = (content ?? {}) as Partial<Profile>;
  return {
    template: typeof next.template === "string" && next.template
      ? next.template
      : appTemplateId,
    img: String(next.img ?? ""),
    img_alt: String(next.img_alt ?? "Profile image"),
    banner_image: String(next.banner_image ?? ""),
    heading_bold: String(next.heading_bold ?? ""),
    heading_light: String(next.heading_light ?? ""),
    title: String(next.title ?? ""),
    desc_1: String(next.desc_1 ?? ""),
    tech_stack: Array.isArray(next.tech_stack) ? next.tech_stack : [],
    desc_2: String(next.desc_2 ?? ""),
    desc_3: String(next.desc_3 ?? ""),
    cta_buttons: Array.isArray(next.cta_buttons) ? next.cta_buttons : [],
    social_links: Array.isArray(next.social_links) ? next.social_links : [],
    link_items: Array.isArray(next.link_items)
      ? next.link_items
          .filter((item): item is ProfileLinkItem =>
            !!item && typeof item === "object",
          )
          .map((item) => ({
            kind: item.kind === "internal" ? "internal" : "external",
            label: String(item.label ?? ""),
            href: String(item.href ?? ""),
            content: String(item.content ?? ""),
          }))
      : [],
    experience: Array.isArray(next.experience) ? next.experience : undefined,
    projects: Array.isArray(next.projects) ? next.projects : undefined,
    blogs: Array.isArray(next.blogs) ? next.blogs : undefined,
    meeting_link:
      next.meeting_link && typeof next.meeting_link === "object"
        ? (next.meeting_link as Profile["meeting_link"])
        : undefined,
    quote:
      next.quote && typeof next.quote === "object"
        ? (next.quote as Profile["quote"])
        : undefined,
    theme:
      next.theme && typeof next.theme === "object"
        ? (next.theme as Profile["theme"])
        : undefined,
  };
}

/* ------------------------------------------------------------------ */
/*  Field section label                                                */
/* ------------------------------------------------------------------ */

function fieldLabel(field: string): string {
  return field
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ------------------------------------------------------------------ */
/*  Sub-editors for complex field types                                */
/* ------------------------------------------------------------------ */

function TechStackEditor({
  value,
  onChange,
}: {
  value: (string | ProfileTech)[];
  onChange: (v: ProfileTech[]) => void;
}) {
  const items: ProfileTech[] = value.map((v) =>
    typeof v === "string" ? { iconName: v, visibleName: v } : v,
  );

  const update = (idx: number, patch: Partial<ProfileTech>) => {
    const next = [...items];
    next[idx] = { ...next[idx], ...patch };
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-40">
            <IconPicker
              value={item.iconName}
              onChange={(spec) => update(i, { iconName: spec })}
              placeholder="Icon"
            />
          </div>
          <Input
            value={item.visibleName}
            onChange={(e) => update(i, { visibleName: e.target.value })}
            placeholder="Label"
            className="flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange([...items, { iconName: "", visibleName: "" }])}
      >
        <Plus className="mr-1 size-3.5" /> Add skill
      </Button>
    </div>
  );
}

function SocialLinksEditor({
  value,
  onChange,
}: {
  value: ProfileSocialLink[];
  onChange: (v: ProfileSocialLink[]) => void;
}) {
  const update = (idx: number, patch: Partial<ProfileSocialLink>) => {
    const next = [...value];
    next[idx] = { ...next[idx], ...patch };
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {value.map((link, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-40">
            <IconPicker
              value={link.type}
              onChange={(spec) => update(i, { type: spec })}
              placeholder="Icon"
            />
          </div>
          <Input
            value={link.label}
            onChange={(e) => update(i, { label: e.target.value })}
            placeholder="Label"
            className="w-28"
          />
          <Input
            value={link.href}
            onChange={(e) => update(i, { href: e.target.value })}
            placeholder="https://…"
            className="flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => onChange(value.filter((_, j) => j !== i))}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          onChange([...value, { type: "", label: "", href: "" }])
        }
      >
        <Plus className="mr-1 size-3.5" /> Add link
      </Button>
    </div>
  );
}

function LinkItemsEditor({
  value,
  onChange,
}: {
  value: ProfileLinkItem[];
  onChange: (v: ProfileLinkItem[]) => void;
}) {
  const update = (idx: number, patch: Partial<ProfileLinkItem>) => {
    const next = [...value];
    next[idx] = { ...next[idx], ...patch };
    onChange(next);
  };

  return (
    <div className="space-y-4">
      {value.map((item, i) => (
        <div
          key={i}
          className="space-y-2 rounded-lg border border-border p-3"
        >
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={item.kind}
              onValueChange={(v) =>
                update(i, { kind: v as ProfileLinkItem["kind"] })
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="external">External</SelectItem>
                <SelectItem value="internal">Internal</SelectItem>
              </SelectContent>
            </Select>
            <Input
              value={item.label}
              onChange={(e) => update(i, { label: e.target.value })}
              placeholder="Link label"
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>

          {item.kind === "external" ? (
            <Input
              value={item.href ?? ""}
              onChange={(e) => update(i, { href: e.target.value })}
              placeholder="https://…"
            />
          ) : (
            <Textarea
              value={item.content ?? ""}
              onChange={(e) => update(i, { content: e.target.value })}
              placeholder="Content shown when this internal link is opened"
              rows={4}
            />
          )}
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          onChange([
            ...value,
            { kind: "external", label: "", href: "", content: "" },
          ])
        }
      >
        <Plus className="mr-1 size-3.5" /> Add link
      </Button>
    </div>
  );
}

function CtaButtonsEditor({
  value,
  onChange,
}: {
  value: ProfileCta[];
  onChange: (v: ProfileCta[]) => void;
}) {
  const update = (idx: number, patch: Partial<ProfileCta>) => {
    const next = [...value];
    next[idx] = { ...next[idx], ...patch };
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {value.map((cta, i) => (
        <div key={i} className="flex flex-wrap items-center gap-2">
          <Select
            value={cta.type}
            onValueChange={(v) => update(i, { type: v as "primary" | "secondary" })}
          >
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="primary">Primary</SelectItem>
              <SelectItem value="secondary">Secondary</SelectItem>
            </SelectContent>
          </Select>
          <Input
            value={cta.label}
            onChange={(e) => update(i, { label: e.target.value })}
            placeholder="Label"
            className="w-28"
          />
          <Input
            value={cta.href}
            onChange={(e) => update(i, { href: e.target.value })}
            placeholder="https://…"
            className="flex-1"
          />
          <div className="w-40">
            <IconPicker
              value={cta.icon ?? ""}
              onChange={(spec) => update(i, { icon: spec })}
              placeholder="Icon (optional)"
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => onChange(value.filter((_, j) => j !== i))}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          onChange([...value, { type: "primary", label: "", href: "" }])
        }
      >
        <Plus className="mr-1 size-3.5" /> Add button
      </Button>
    </div>
  );
}

function ExperienceEditor({
  value,
  onChange,
}: {
  value: ProfileExperience[];
  onChange: (v: ProfileExperience[]) => void;
}) {
  const update = (idx: number, patch: Partial<ProfileExperience>) => {
    const next = [...value];
    next[idx] = { ...next[idx], ...patch };
    onChange(next);
  };

  return (
    <div className="space-y-4">
      {value.map((exp, i) => (
        <div
          key={i}
          className="relative space-y-2 rounded-lg border border-border p-3"
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2"
            onClick={() => onChange(value.filter((_, j) => j !== i))}
          >
            <X className="size-3.5" />
          </Button>
          <div className="grid gap-2 sm:grid-cols-2">
            <Input
              value={exp.company}
              onChange={(e) => update(i, { company: e.target.value })}
              placeholder="Company"
            />
            <Input
              value={exp.role}
              onChange={(e) => update(i, { role: e.target.value })}
              placeholder="Role"
            />
            <Input
              value={exp.period}
              onChange={(e) => update(i, { period: e.target.value })}
              placeholder="Period (e.g. 2022 – Present)"
            />
            <Input
              value={exp.location ?? ""}
              onChange={(e) => update(i, { location: e.target.value || undefined })}
              placeholder="Location (optional)"
            />
          </div>
          <Input
            value={(exp.tech ?? []).join(", ")}
            onChange={(e) =>
              update(i, {
                tech: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
            placeholder="Tech (comma-separated)"
          />
          <Textarea
            value={(exp.bullets ?? []).join("\n")}
            onChange={(e) =>
              update(i, {
                bullets: e.target.value.split("\n").filter(Boolean),
              })
            }
            placeholder="Bullet points (one per line)"
            rows={3}
          />
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          onChange([...value, { company: "", role: "", period: "" }])
        }
      >
        <Plus className="mr-1 size-3.5" /> Add experience
      </Button>
    </div>
  );
}

function ProjectsEditor({
  value,
  onChange,
}: {
  value: ProfileProject[];
  onChange: (v: ProfileProject[]) => void;
}) {
  const update = (idx: number, patch: Partial<ProfileProject>) => {
    const next = [...value];
    next[idx] = { ...next[idx], ...patch };
    onChange(next);
  };

  return (
    <div className="space-y-4">
      {value.map((proj, i) => (
        <div
          key={i}
          className="relative space-y-2 rounded-lg border border-border p-3"
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2"
            onClick={() => onChange(value.filter((_, j) => j !== i))}
          >
            <X className="size-3.5" />
          </Button>
          <Input
            value={proj.title}
            onChange={(e) => update(i, { title: e.target.value })}
            placeholder="Title"
          />
          <Textarea
            value={proj.description}
            onChange={(e) => update(i, { description: e.target.value })}
            placeholder="Description"
            rows={2}
          />
          <Input
            value={proj.image ?? ""}
            onChange={(e) => update(i, { image: e.target.value || undefined })}
            placeholder="Image URL (optional)"
          />
          <Input
            value={proj.href ?? ""}
            onChange={(e) => update(i, { href: e.target.value || undefined })}
            placeholder="URL (optional)"
          />
          <Input
            value={(proj.tech ?? []).join(", ")}
            onChange={(e) =>
              update(i, {
                tech: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
            placeholder="Tech (comma-separated)"
          />
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          onChange([...value, { title: "", description: "" }])
        }
      >
        <Plus className="mr-1 size-3.5" /> Add project
      </Button>
    </div>
  );
}

function BlogsEditor({
  value,
  onChange,
}: {
  value: ProfileBlog[];
  onChange: (v: ProfileBlog[]) => void;
}) {
  const update = (idx: number, patch: Partial<ProfileBlog>) => {
    const next = [...value];
    next[idx] = { ...next[idx], ...patch };
    onChange(next);
  };

  return (
    <div className="space-y-4">
      {value.map((blog, i) => (
        <div
          key={i}
          className="relative space-y-2 rounded-lg border border-border p-3"
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2"
            onClick={() => onChange(value.filter((_, j) => j !== i))}
          >
            <X className="size-3.5" />
          </Button>
          <Input
            value={blog.title}
            onChange={(e) => update(i, { title: e.target.value })}
            placeholder="Title"
          />
          <Textarea
            value={blog.description}
            onChange={(e) => update(i, { description: e.target.value })}
            placeholder="Description"
            rows={2}
          />
          <div className="grid gap-2 sm:grid-cols-2">
            <Input
              value={blog.href}
              onChange={(e) => update(i, { href: e.target.value })}
              placeholder="URL"
            />
            <Input
              value={blog.date ?? ""}
              onChange={(e) => update(i, { date: e.target.value || undefined })}
              placeholder="Date (optional)"
            />
          </div>
          <Input
            value={(blog.tags ?? []).join(", ")}
            onChange={(e) =>
              update(i, {
                tags: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
            placeholder="Tags (comma-separated)"
          />
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          onChange([...value, { title: "", description: "", href: "" }])
        }
      >
        <Plus className="mr-1 size-3.5" /> Add blog
      </Button>
    </div>
  );
}

function MeetingLinkEditor({
  value,
  onChange,
}: {
  value: Profile["meeting_link"];
  onChange: (v: Profile["meeting_link"]) => void;
}) {
  const link = value ?? { label: "", href: "" };
  return (
    <div className="flex items-center gap-2">
      <Input
        value={link.label}
        onChange={(e) => onChange({ ...link, label: e.target.value })}
        placeholder="Label (e.g. Book a call)"
        className="w-48"
      />
      <Input
        value={link.href}
        onChange={(e) => onChange({ ...link, href: e.target.value })}
        placeholder="https://cal.com/you or https://calendly.com/you"
        className="flex-1"
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={() => onChange(undefined)}
        >
          <Trash2 className="size-3.5" />
        </Button>
      )}
    </div>
  );
}

function QuoteEditor({
  value,
  onChange,
}: {
  value: Profile["quote"];
  onChange: (v: Profile["quote"]) => void;
}) {
  const q = value ?? { text: "", author: "" };
  return (
    <div className="space-y-2">
      <Textarea
        value={q.text}
        onChange={(e) => onChange({ ...q, text: e.target.value })}
        placeholder="Quote text"
        rows={2}
      />
      <div className="flex items-center gap-2">
        <Input
          value={q.author ?? ""}
          onChange={(e) =>
            onChange({ ...q, author: e.target.value || undefined })
          }
          placeholder="Author (optional)"
          className="flex-1"
        />
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => onChange(undefined)}
          >
            <Trash2 className="size-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}

function ThemeEditor({
  value,
  onChange,
}: {
  value: Profile["theme"];
  onChange: (v: Profile["theme"]) => void;
}) {
  const theme = value ?? { colors: {}, fonts: {} };
  const colors = theme.colors ?? {};
  const fonts = theme.fonts ?? {};

  const setColor = (key: string, val: string) =>
    onChange({
      ...theme,
      colors: { ...colors, [key]: val || undefined },
    });

  const setFont = (key: string, val: string) =>
    onChange({
      ...theme,
      fonts: { ...fonts, [key]: !val || val === "__none__" ? undefined : val },
    });

  const colorFields = [
    { key: "bg", label: "Background" },
    { key: "text", label: "Text" },
    { key: "muted", label: "Muted" },
    { key: "accent", label: "Accent" },
    { key: "border", label: "Border" },
  ] as const;

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-muted-foreground">Colors</p>
      <div className="grid gap-2 sm:grid-cols-3">
        {colorFields.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-2">
            <input
              type="color"
              value={(colors as Record<string, string | undefined>)[key] ?? "#000000"}
              onChange={(e) => setColor(key, e.target.value)}
              className="h-8 w-8 shrink-0 cursor-pointer rounded border border-border bg-transparent"
            />
            <div className="flex-1">
              <Input
                value={(colors as Record<string, string | undefined>)[key] ?? ""}
                onChange={(e) => setColor(key, e.target.value)}
                placeholder={label}
                className="h-8 text-xs"
              />
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs font-medium text-muted-foreground">Fonts</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <Select
          value={fonts.heading ?? ""}
          onValueChange={(value) => setFont("heading", value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Heading font" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">Use body/default</SelectItem>
            <SelectGroup>
              <SelectLabel>Font catalog</SelectLabel>
              {PROFILE_FONT_OPTIONS.map((font) => (
                <SelectItem key={font.id} value={font.value}>
                  {font.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select
          value={fonts.body ?? ""}
          onValueChange={(value) => setFont("body", value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Body font" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">Use default</SelectItem>
            <SelectGroup>
              <SelectLabel>Font catalog</SelectLabel>
              {PROFILE_FONT_OPTIONS.map((font) => (
                <SelectItem key={font.id} value={font.value}>
                  {font.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Dynamic field renderer                                             */
/* ------------------------------------------------------------------ */

function FieldEditor({
  req,
  profile,
  setProfile,
}: {
  req: FieldRequirement;
  profile: Profile;
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
}) {
  const set = useCallback(
    (field: string, value: unknown) =>
      setProfile((p) => (p ? { ...p, [field]: value } : p)),
    [setProfile],
  );

  const { field, type } = req;
  const val = (profile as unknown as Record<string, unknown>)[field];

  switch (type) {
    case "text":
      return (
        <Input
          value={String(val ?? "")}
          onChange={(e) => set(field, e.target.value)}
        />
      );

    case "textarea":
      return (
        <Textarea
          value={String(val ?? "")}
          onChange={(e) => set(field, e.target.value)}
          rows={3}
        />
      );

    case "url":
      return (
        <Input
          type="url"
          value={String(val ?? "")}
          onChange={(e) => set(field, e.target.value)}
          placeholder="https://…"
        />
      );

    case "image_url": {
      const imgStr = typeof val === "string" ? val : "";
      return (
        <div className="flex items-center gap-3">
          {imgStr.length > 0 && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={imgStr}
              alt="preview"
              className="h-10 w-10 shrink-0 rounded-full border border-border object-cover"
            />
          )}
          <Input
            type="url"
            value={String(val ?? "")}
            onChange={(e) => set(field, e.target.value)}
            placeholder="https://…"
            className="flex-1"
          />
        </div>
      );
    }

    case "tech_stack":
      return (
        <TechStackEditor
          value={(val as (string | ProfileTech)[]) ?? []}
          onChange={(v) => set(field, v)}
        />
      );

    case "social_links":
      return (
        <SocialLinksEditor
          value={(val as ProfileSocialLink[]) ?? []}
          onChange={(v) => set(field, v)}
        />
      );

    case "link_items":
      return (
        <LinkItemsEditor
          value={(val as ProfileLinkItem[]) ?? []}
          onChange={(v) => set(field, v)}
        />
      );

    case "cta_buttons":
      return (
        <CtaButtonsEditor
          value={(val as ProfileCta[]) ?? []}
          onChange={(v) => set(field, v)}
        />
      );

    case "experience":
      return (
        <ExperienceEditor
          value={(val as ProfileExperience[]) ?? []}
          onChange={(v) => set(field, v.length > 0 ? v : undefined)}
        />
      );

    case "projects":
      return (
        <ProjectsEditor
          value={(val as ProfileProject[]) ?? []}
          onChange={(v) => set(field, v.length > 0 ? v : undefined)}
        />
      );

    case "blogs":
      return (
        <BlogsEditor
          value={(val as ProfileBlog[]) ?? []}
          onChange={(v) => set(field, v.length > 0 ? v : undefined)}
        />
      );

    case "meeting_link":
      return (
        <MeetingLinkEditor
          value={val as Profile["meeting_link"]}
          onChange={(v) => set(field, v)}
        />
      );

    case "quote":
      return (
        <QuoteEditor
          value={val as Profile["quote"]}
          onChange={(v) => set(field, v)}
        />
      );

    case "theme":
      return (
        <ThemeEditor
          value={val as Profile["theme"]}
          onChange={(v) => set(field, v)}
        />
      );

    default:
      return (
        <Input
          value={String(val ?? "")}
          onChange={(e) => set(field, e.target.value)}
        />
      );
  }
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function EditAppPage() {
  const params = useParams<{ appId: string }>();
  const router = useRouter();
  const appId = params.appId ?? null;

  const [app, setApp] = useState<AppResponse["app"] | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fieldReqs, setFieldReqs] = useState<FieldRequirement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">(
    "idle",
  );
  const [PreviewTemplate, setPreviewTemplate] = useState<
    React.ComponentType<TemplateProps> | null
  >(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  // Load app + content
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (!appId) throw new Error("appId is required.");
        const res = await fetch(`/api/apps/${appId}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load app.");
        const data = (await res.json()) as AppResponse;
        if (cancelled) return;

        setApp(data.app);
        const p = coerceProfile(data.currentContent?.content, data.app.templateId);

        const appCategory = appTypeToCategory(data.app.type);
        const entry = getTemplateEntry(p.template ?? data.app.templateId);
        const templateFitsApp = entry.meta.category === appCategory;

        const resolvedEntry = templateFitsApp
          ? entry
          : getTemplateEntry(
              templates.find((t) => t.meta.category === appCategory)?.meta.id ??
                data.app.templateId,
            );

        if (!templateFitsApp) {
          p.template = resolvedEntry.meta.id;
        }

        setProfile(p);

        const reqs = await resolvedEntry.loadReq();
        if (!cancelled) setFieldReqs(reqs);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to load editor.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [appId]);

  // When template changes, reload field requirements
  const handleTemplateChange = useCallback(
    async (templateId: string) => {
      setProfile((p) => (p ? { ...p, template: templateId } : p));
      try {
        const entry = getTemplateEntry(templateId);
        const reqs = await entry.loadReq();
        setFieldReqs(reqs);
      } catch {
        /* keep previous reqs */
      }
    },
    [],
  );

  const filteredTemplates = useMemo(() => {
    if (!app) return templates;
    const category = appTypeToCategory(app.type);
    return templates.filter((t) => t.meta.category === category);
  }, [app]);

  const pageTitle = useMemo(
    () => (app ? `Edit ${app.slug}` : "Edit app"),
    [app],
  );
  const previewTemplateId = profile?.template ?? app?.templateId ?? null;

  useEffect(() => {
    if (!previewTemplateId) return;

    let cancelled = false;
    setIsPreviewLoading(true);

    (async () => {
      try {
        const entry = getTemplateEntry(previewTemplateId);
        const { default: Template } = await entry.load();
        if (!cancelled) {
          setPreviewTemplate(() => Template);
        }
      } catch {
        if (!cancelled) {
          setPreviewTemplate(null);
        }
      } finally {
        if (!cancelled) {
          setIsPreviewLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [previewTemplateId]);

  const save = async () => {
    if (!appId || !app || !profile) return;
    setError(null);

    const patchApp = fetch(`/api/apps/${appId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: app.status,
        templateId: profile.template ?? app.templateId,
      }),
    });

    const patchContent = fetch(`/api/apps/${appId}/content`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schemaVersion: 1, content: profile }),
    });

    const [appRes, contentRes] = await Promise.all([patchApp, patchContent]);
    if (!appRes.ok || !contentRes.ok) {
      const appErr = appRes.ok
        ? ""
        : ((await appRes.json()) as { error?: string }).error;
      const contentErr = contentRes.ok
        ? ""
        : ((await contentRes.json()) as { error?: string }).error;
      throw new Error(appErr || contentErr || "Failed to save app.");
    }
  };

  const handleSave = async () => {
    if (saveState === "saving" || !profile) return;
    if (profile.template === "portfolio-2" && !profile.banner_image?.trim()) {
      setError("Banner image is required for template portfolio-2.");
      return;
    }
    setSaveState("saving");
    try {
      await save();
      setSaveState("saved");
      window.setTimeout(() => setSaveState("idle"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save.");
      setSaveState("idle");
    }
  };

  /* ---- loading / error states ---- */

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader size="lg" className="border-t-muted-foreground" />
      </div>
    );
  }

  if (error && (!app || !profile)) {
    return (
      <div className="mx-auto mt-10 w-full max-w-xl space-y-4 p-8 text-center">
        <p className="text-destructive">{error ?? "Could not load app."}</p>
        <Button onClick={() => router.push("/dashboard/manage-apps")}>
          Back to manage apps
        </Button>
      </div>
    );
  }

  if (!app || !profile) return null;

  /* ---- group fields by section ---- */

  const requiredFields = fieldReqs.filter((r) => r.required);
  const optionalFields = fieldReqs.filter((r) => !r.required);
  const previewStyle = getProfileThemeStyle(profile);

  return (
    <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-6 p-8">
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{pageTitle}</h1>
          <p className="text-sm text-muted-foreground">
            {app.type} &middot; status:{" "}
            <span className="ml-1 font-medium text-foreground">
              {app.status}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="flat"
            size="icon-sm"
            onClick={() => router.back()}
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="flat"
            size="icon-sm"
            onClick={() =>
              window.open(`/${app.slug}`, "_blank", "noopener,noreferrer")
            }
            aria-label={`Preview ${app.slug}`}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button
            variant="flat"
            size="sm"
            className="gap-2"
            onClick={() => void handleSave()}
            disabled={saveState === "saving"}
          >
            {saveState === "saving" ? (
              <>
                <Loader size="sm" />
                Saving
              </>
            ) : saveState === "saved" ? (
              <>
                <Check className="h-4 w-4" />
                Saved
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save
              </>
            )}
          </Button>
        </div>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.9fr)]">
        <div className="space-y-6">
          {/* Publishing card (template + status) */}
          <Card>
            <CardHeader>
              <CardTitle>Publishing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={app.status}
                    onValueChange={(v) =>
                      setApp((prev) =>
                        prev
                          ? {
                              ...prev,
                              status: v as AppResponse["app"]["status"],
                            }
                          : prev,
                      )
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Template</Label>
                  <Select
                    value={profile.template ?? ""}
                    onValueChange={(v) => void handleTemplateChange(v)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredTemplates.map((t) => (
                        <SelectItem key={t.meta.id} value={t.meta.id}>
                          {t.meta.name} ({t.meta.id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Required fields */}
          {requiredFields.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Required fields</CardTitle>
                <CardDescription>
                  These fields must be filled for the template to render correctly.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {requiredFields.map((req) => (
                  <div key={req.field} className="space-y-1.5">
                    <Label>{fieldLabel(req.field)}</Label>
                    <p className="text-xs text-muted-foreground">
                      {req.description}
                    </p>
                    <FieldEditor
                      req={req}
                      profile={profile}
                      setProfile={setProfile}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Optional fields */}
          {optionalFields.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Optional fields</CardTitle>
                <CardDescription>
                  These are hidden when empty. Fill them to unlock more sections.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {optionalFields.map((req) => (
                  <div key={req.field} className="space-y-1.5">
                    <Label>{fieldLabel(req.field)}</Label>
                    <p className="text-xs text-muted-foreground">
                      {req.description}
                    </p>
                    <FieldEditor
                      req={req}
                      profile={profile}
                      setProfile={setProfile}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <aside className="hidden lg:block">
          <Card className="sticky top-6 overflow-hidden">
            <CardHeader className="space-y-1">
              <CardTitle>Live preview</CardTitle>
              <CardDescription>
                Updates as you edit profile fields.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[calc(100vh-13rem)] overflow-y-auto border-t border-border bg-background">
                {isPreviewLoading ? (
                  <div className="flex h-full min-h-80 items-center justify-center">
                    <Loader className="border-t-muted-foreground" />
                  </div>
                ) : PreviewTemplate ? (
                  <div className="[&_.fixed]:hidden">
                    <div className="pointer-events-none" style={previewStyle}>
                      <PreviewTemplate profile={profile} />
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full min-h-80 items-center justify-center px-6 text-center text-sm text-muted-foreground">
                    Preview unavailable for this template.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
