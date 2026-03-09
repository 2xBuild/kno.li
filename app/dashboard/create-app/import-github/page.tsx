"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, CirclePlus, Github } from "lucide-react";
import type { Profile } from "@/lib/types";
import { templates } from "@/templates";
import { Loader } from "@/components/ui/loader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Availability {
  available: boolean;
  message?: string;
}

interface ImportRepo {
  name: string;
  description: string;
  url: string;
  liveUrl: string;
  language: string;
  stars: number;
  previewImage: string;
}

interface ImportResponse {
  username: string;
  profile: {
    name: string;
    bio: string;
    avatarUrl: string;
    profileUrl: string;
    company: string;
    location: string;
    publicRepoCount: number;
    followers: number;
    following: number;
  };
  stats: {
    fetchedRepoCount: number;
    totalStars: number;
  };
  readme: {
    exists: boolean;
    excerpt: string;
  };
  repos: ImportRepo[];
  suggestedSlug: string;
  content: Profile;
}

// Keep in sync with SLUG_RE in lib/validators/app-schema.ts
const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,37}[a-z0-9])$/;

export default function ImportGithubPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [githubUsername, setGithubUsername] = useState("");
  const [imported, setImported] = useState<ImportResponse | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const [templateId, setTemplateId] = useState("portfolio-1");
  const [slug, setSlug] = useState("");
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acceptUsernamePolicy, setAcceptUsernamePolicy] = useState(false);

  const minSlugLength = session?.user?.planTier === "free" ? 4 : 2;
  const normalizedSlug = useMemo(
    () => slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, ""),
    [slug],
  );
  const portfolioTemplates = useMemo(
    () => templates.filter((template) => template.meta.category === "portfolio"),
    [],
  );
  const slugTooShortMessage =
    normalizedSlug.length > 0 && normalizedSlug.length < minSlugLength
      ? `App name must be at least ${minSlugLength} characters.`
      : null;

  useEffect(() => {
    if (portfolioTemplates.some((template) => template.meta.id === templateId)) return;
    setTemplateId(portfolioTemplates[0]?.meta.id ?? "portfolio-1");
  }, [portfolioTemplates, templateId]);

  const checkAvailability = useCallback(
    async (slugToCheck: string) => {
      setError(null);

      if (!SLUG_RE.test(slugToCheck)) {
        setAvailability({
          available: false,
          message:
            "Use lowercase letters, numbers, and hyphens (2-39 chars, no leading/trailing hyphen).",
        });
        return;
      }

      if (slugToCheck.length < minSlugLength) {
        setAvailability(null);
        return;
      }

      setIsChecking(true);
      try {
        const res = await fetch(`/api/apps?slug=${encodeURIComponent(slugToCheck)}`, {
          cache: "no-store",
        });

        if (res.status === 404) {
          setAvailability({ available: true, message: "App name is available." });
        } else if (res.ok) {
          setAvailability({ available: false, message: "App name is already taken." });
        } else {
          const data = (await res.json()) as { error?: string };
          setAvailability({
            available: false,
            message: data.error ?? "Invalid app name.",
          });
        }
      } catch {
        setAvailability({ available: false, message: "Failed to check app name." });
      } finally {
        setIsChecking(false);
      }
    },
    [minSlugLength],
  );

  useEffect(() => {
    if (!normalizedSlug) {
      setAvailability(null);
      return;
    }
    if (normalizedSlug.length < minSlugLength) {
      setAvailability(null);
      return;
    }

    const handle = setTimeout(() => {
      void checkAvailability(normalizedSlug);
    }, 500);

    return () => {
      clearTimeout(handle);
    };
  }, [normalizedSlug, minSlugLength, checkAvailability]);

  const handleImport = async () => {
    const normalizedUsername = githubUsername.trim().replace(/^@+/, "");
    if (!normalizedUsername) {
      setImportError("Enter a GitHub username.");
      return;
    }

    setIsImporting(true);
    setImportError(null);
    setError(null);

    try {
      const res = await fetch(
        `/api/github/import?username=${encodeURIComponent(normalizedUsername)}`,
        { cache: "no-store" },
      );
      const data = (await res.json()) as ImportResponse & { error?: string };
      if (!res.ok) {
        setImportError(data.error ?? "Failed to import from GitHub.");
        setImported(null);
        return;
      }

      setImported(data);
      setTemplateId("portfolio-1");
      setSlug(data.suggestedSlug);
      setAvailability(null);
    } catch {
      setImportError("Failed to import from GitHub.");
      setImported(null);
    } finally {
      setIsImporting(false);
    }
  };

  const buildContentForTemplate = useCallback(
    (data: ImportResponse): Profile => {
      const next = { ...data.content };

      return {
        ...next,
        template: templateId,
        banner_image: next.banner_image?.trim() || next.img,
        heading_light: next.heading_light?.trim() || `@${data.username}`,
      };
    },
    [templateId],
  );

  const handleCreate = async () => {
    setError(null);

    if (!session?.user?.id) {
      setError("Sign in required.");
      return;
    }
    if (!imported) {
      setError("Import GitHub data first.");
      return;
    }
    if (!availability?.available) {
      setError("Please pick an available app name.");
      return;
    }

    setIsCreating(true);
    try {
      const content = buildContentForTemplate(imported);
      const res = await fetch("/api/apps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: normalizedSlug,
          type: "portfolio",
          templateId,
          status: "draft",
          isPublic: true,
          content,
          acceptUsernamePolicy,
        }),
      });

      const data = (await res.json()) as { appId?: string; error?: string; code?: string };
      if (!res.ok || !data.appId) {
        const message =
          res.status === 403 && data.code === "plan_limit"
            ? (data.error ?? "App limit reached.") + " Upgrade your plan to create more apps."
            : data.error ?? "Failed to create app.";
        setError(message);
        return;
      }

      router.push(`/dashboard/manage-apps/${data.appId}/edit`);
    } catch {
      setError("Failed to create app.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-4 sm:gap-6 sm:p-8">
      <header className="space-y-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard/create-app")}
          className="-ml-2 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to create app
        </Button>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Import portfolio from GitHub
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Enter a GitHub username, import original profile content, then choose a template.
        </p>
      </header>

      <Card className="gap-4 py-4 sm:gap-6 sm:py-6">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-sm sm:text-base">Step 1: GitHub username</CardTitle>
          <CardDescription>
            We fetch profile details, README, and public repositories directly from GitHub.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 px-4 sm:px-6">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={githubUsername}
              onChange={(event) => setGithubUsername(event.target.value)}
              placeholder="e.g. torvalds"
              className="sm:flex-1"
            />
            <Button type="button" onClick={() => void handleImport()} disabled={isImporting}>
              {isImporting ? <Loader size="sm" /> : <Github className="h-4 w-4" />}
              Import from GitHub
            </Button>
          </div>

          {importError && <p className="text-xs text-destructive">{importError}</p>}
        </CardContent>
      </Card>

      {imported ? (
        <>
          <Card className="gap-4 py-4 sm:gap-6 sm:py-6">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-sm sm:text-base">Step 2: Imported GitHub data</CardTitle>
              <CardDescription>
                Original content from profile bio, README, and repositories.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 px-4 sm:px-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Image
                  src={imported.profile.avatarUrl}
                  alt={`${imported.profile.name} avatar`}
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-full border border-border object-cover"
                />
                <div className="space-y-1">
                  <p className="text-base font-semibold">{imported.profile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    @{imported.username} · {imported.profile.publicRepoCount} repos ·{" "}
                    {imported.stats.totalStars} stars
                  </p>
                  <a
                    href={imported.profile.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs underline underline-offset-2"
                  >
                    Open GitHub profile
                  </a>
                </div>
              </div>

              {imported.profile.bio ? (
                <div className="space-y-1 rounded-xl border border-border p-3">
                  <p className="text-xs font-medium text-muted-foreground">Profile bio</p>
                  <p className="text-sm text-muted-foreground">{imported.profile.bio}</p>
                </div>
              ) : null}

              {imported.readme.exists && imported.readme.excerpt ? (
                <div className="space-y-1 rounded-xl border border-border p-3">
                  <p className="text-xs font-medium text-muted-foreground">README excerpt</p>
                  <p className="text-sm text-muted-foreground">{imported.readme.excerpt}</p>
                </div>
              ) : null}

              {imported.repos.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    All repositories (fetched {imported.stats.fetchedRepoCount})
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {imported.repos.map((repo) => (
                      <div key={repo.url} className="space-y-2 rounded-lg border border-border p-3">
                        {repo.previewImage ? (
                          <div className="h-24 w-full overflow-hidden rounded border border-border bg-muted">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={repo.previewImage}
                              alt={`${repo.name} preview`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : null}
                        <p className="text-sm font-medium">{repo.name}</p>
                        <p className="line-clamp-2 text-xs text-muted-foreground">
                          {repo.description || "No description"}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {repo.language || "Code"} · {repo.stars} stars
                        </p>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <a
                            href={repo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline underline-offset-2"
                          >
                            Repository
                          </a>
                          {repo.liveUrl ? (
                            <a
                              href={repo.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline underline-offset-2"
                            >
                              Live demo
                            </a>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="gap-4 py-4 sm:gap-6 sm:py-6">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-sm sm:text-base">Step 3: Template and app name</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-4 sm:px-6">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="template" className="text-xs sm:text-sm">
                  Template{" "}
                  <Link href="/templates" className="underline underline-offset-2">
                    Learn more
                  </Link>
                </Label>
                <Select value={templateId} onValueChange={setTemplateId}>
                  <SelectTrigger id="template" className="w-full">
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    {portfolioTemplates.map((template) => (
                      <SelectItem key={template.meta.id} value={template.meta.id}>
                        {`${template.meta.id} · ${template.meta.name}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="slug" className="text-xs sm:text-sm">App name</Label>
                <div className="flex gap-2">
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(event) => {
                      setSlug(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                      setAvailability(null);
                    }}
                    placeholder="your-name"
                    className="transition-none focus-visible:border-input focus-visible:ring-0"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void checkAvailability(normalizedSlug)}
                    disabled={isChecking}
                    className="h-10"
                  >
                    {isChecking ? <Loader size="sm" /> : "Check"}
                  </Button>
                </div>
                {slugTooShortMessage ? (
                  <p className="text-xs text-destructive">{slugTooShortMessage}</p>
                ) : availability ? (
                  <p
                    className={`text-xs ${
                      availability.available ? "text-emerald-600" : "text-destructive"
                    }`}
                  >
                    {availability.message}
                  </p>
                ) : null}
              </div>

              <label className="flex items-start gap-2 text-xs sm:text-sm">
                <input
                  type="checkbox"
                  checked={acceptUsernamePolicy}
                  onChange={(event) => setAcceptUsernamePolicy(event.target.checked)}
                  className="mt-1 h-4 w-4"
                />
                <span>
                  I agree to the{" "}
                  <Link href="/tnc" className="underline underline-offset-2">
                    Terms and Conditions.
                  </Link>
                </span>
              </label>
            </CardContent>
          </Card>

          {error ? (
            <div className="space-y-2">
              <p className="text-sm text-destructive">{error}</p>
              {error.includes("Upgrade") ? (
                <Link href="/dashboard/plan">
                  <Button variant="outline" size="sm">
                    Upgrade plan
                  </Button>
                </Link>
              ) : null}
            </div>
          ) : null}

          <Button
            onClick={() => void handleCreate()}
            disabled={!availability?.available || !acceptUsernamePolicy || isCreating}
            className="gap-2"
          >
            {isCreating ? <Loader size="sm" /> : <CirclePlus className="h-4 w-4" />}
            Create pre-filled app
          </Button>
        </>
      ) : null}
    </div>
  );
}
