"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, CirclePlus } from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { templates, appTypeToCategory } from "@/templates";

type AppType = "portfolio" | "link-organiser";

interface Availability {
  available: boolean;
  message?: string;
}

// Keep in sync with SLUG_RE in lib/validators/app-schema.ts
const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,37}[a-z0-9])$/;

export default function CreateAppPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [slug, setSlug] = useState("");
  const [appType, setAppType] = useState<AppType>("portfolio");
  const [templateId, setTemplateId] = useState("portfolio-1");
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acceptUsernamePolicy, setAcceptUsernamePolicy] = useState(false);

  const minSlugLength = session?.user?.planTier === "free" ? 4 : 2;

  const normalizedSlug = useMemo(
    () => slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, ""),
    [slug]
  );
  const filteredTemplates = useMemo(
    () => templates.filter((template) => template.meta.category === appTypeToCategory(appType)),
    [appType]
  );
  const slugTooShortMessage =
    normalizedSlug.length > 0 && normalizedSlug.length < minSlugLength
      ? `App name must be at least ${minSlugLength} characters.`
      : null;

  useEffect(() => {
    if (filteredTemplates.some((template) => template.meta.id === templateId)) return;
    setTemplateId(filteredTemplates[0]?.meta.id ?? "");
  }, [filteredTemplates, templateId]);

  const checkAvailability = useCallback(
    async (slugToCheck: string) => {
      setError(null);

      if (!SLUG_RE.test(slugToCheck)) {
        setAvailability({
          available: false,
          message: "Use lowercase letters, numbers, and hyphens (2-39 chars, no leading/trailing hyphen).",
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
    [minSlugLength]
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

  const createInitialContent = () => {
    const firstName = session?.user?.name?.split(" ")[0] ?? "you";
    return {
      template: templateId,
      img: session?.user?.image ?? "",
      img_alt: `${firstName}'s profile`,
      heading_bold: `hi, i'm ${firstName.toLowerCase()}`,
      heading_light:
        appType === "portfolio" ? ": a developer." : ": links worth opening.",
      desc_1:
        appType === "portfolio"
          ? "I build products at the intersection of design and engineering."
          : "Curated links, updates, and ways to reach me.",
      desc_2: "",
      desc_3: "",
      tech_stack: [],
      cta_buttons: [],
      social_links: [],
      link_items: [],
    };
  };

  const handleCreate = async () => {
    setError(null);

    if (!session?.user?.id) {
      setError("Sign in required.");
      return;
    }
    if (!availability?.available) {
      setError("Please pick an available app name.");
      return;
    }

    setIsCreating(true);
    try {
      const res = await fetch("/api/apps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: normalizedSlug,
          type: appType,
          templateId,
          status: "draft",
          isPublic: true,
          content: createInitialContent(),
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
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4 sm:gap-6 sm:p-8">
      <header className="space-y-1 sm:space-y-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="-ml-2 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Create app</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Create one hosted app, choose a template, then publish your profile.
        </p>
      </header>

      <Card className="gap-4 py-4 sm:gap-6 sm:py-6">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-sm sm:text-base">App type and template</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-4 sm:space-y-4 sm:px-6">
          <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setAppType("link-organiser")}
              className={`rounded-xl border p-3 text-left transition sm:p-4 ${
                appType === "link-organiser"
                  ? "border-primary/40 bg-primary/10"
                  : "border-border hover:border-foreground/30"
              }`}
            >
              <p className="text-sm font-semibold sm:text-base">Linkfolio</p>
              <p className="text-[11px] text-muted-foreground sm:text-xs">Bio-page or links tree/organizer.</p>
            </button>
            <button
              type="button"
              onClick={() => setAppType("portfolio")}
              className={`rounded-xl border p-3 text-left transition sm:p-4 ${
                appType === "portfolio"
                  ? "border-primary/40 bg-primary/10"
                  : "border-border hover:border-foreground/30"
              }`}
            >
              <p className="text-sm font-semibold sm:text-base">Portfolio</p>
              <p className="text-[11px] text-muted-foreground sm:text-xs">Full portfolio layout.</p>
            </button>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="template" className="text-xs sm:text-sm">
              Template{" "}
              <Link href="/templates" className="underline underline-offset-2">
                Learn more
              </Link>
            </Label>

            <Select value={templateId} onValueChange={setTemplateId}>
              <SelectTrigger id="template" className="w-full">
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {filteredTemplates.map((template) => (
                  <SelectItem key={template.meta.id} value={template.meta.id}>
                    {`${template.meta.id} · ${template.meta.name}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="gap-4 py-4 sm:gap-6 sm:py-6">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-sm sm:text-base">App name and domains</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-4 sm:space-y-4 sm:px-6">
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
                onClick={() => checkAvailability(normalizedSlug)}
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
              </Link>{" "}
              
              
            </span>
          </label>

   
        </CardContent>
      </Card>

      {error && (
        <div className="space-y-2">
          <p className="text-sm text-destructive">{error}</p>
          {error.includes("Upgrade") && (
            <Link href="/dashboard/plan">
              <Button variant="outline" size="sm">
                Upgrade plan
              </Button>
            </Link>
          )}
        </div>
      )}

      <Button onClick={handleCreate} disabled={!availability?.available || !acceptUsernamePolicy || isCreating} className="gap-2">
        {isCreating ? (
          <Loader size="sm" />
        ) : (
          <CirclePlus className="h-4 w-4" />
        )}
        Create app
      </Button>
    </div>
  );
}
