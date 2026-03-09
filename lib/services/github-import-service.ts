import type {
  Profile,
  ProfileCta,
  ProfileProject,
  ProfileSocialLink,
  ProfileTech,
} from "@/lib/types";

const GITHUB_API_BASE = "https://api.github.com";
const GITHUB_REPOS_PER_PAGE = 100;
const GITHUB_USERNAME_RE = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

interface GitHubUserResponse {
  login: string;
  name: string | null;
  bio: string | null;
  avatar_url: string;
  html_url: string;
  blog: string | null;
  twitter_username: string | null;
  email: string | null;
  company: string | null;
  location: string | null;
  followers: number;
  following: number;
  public_repos: number;
}

interface GitHubRepoResponse {
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  topics?: string[];
  fork: boolean;
}

interface GitHubReadmeResponse {
  content: string;
  encoding: string;
}

export interface GithubImportRepo {
  name: string;
  description: string;
  url: string;
  liveUrl: string;
  language: string;
  stars: number;
  forks: number;
  updatedAt: string;
  topics: string[];
  isFork: boolean;
  previewImage: string;
}

export interface GithubImportPayload {
  username: string;
  profile: {
    name: string;
    bio: string;
    avatarUrl: string;
    profileUrl: string;
    company: string;
    location: string;
    blogUrl: string;
    followers: number;
    following: number;
    publicRepoCount: number;
  };
  stats: {
    fetchedRepoCount: number;
    totalStars: number;
    totalForks: number;
  };
  readme: {
    exists: boolean;
    excerpt: string;
  };
  repos: GithubImportRepo[];
  suggestedSlug: string;
  content: Profile;
}

export type GithubImportOutcome =
  | {
      ok: true;
      data: GithubImportPayload;
    }
  | {
      ok: false;
      status: number;
      code: "invalid_username" | "not_found" | "rate_limited" | "upstream";
      message: string;
    };

interface FetchOk<T> {
  ok: true;
  data: T;
}

interface FetchErr {
  ok: false;
  status: number;
  message: string;
}

function normalizeGithubUsername(raw: string): string {
  return raw.trim().replace(/^@+/, "").toLowerCase();
}

function isValidGithubUsername(username: string): boolean {
  return GITHUB_USERNAME_RE.test(username);
}

function truncate(value: string, max: number): string {
  const normalized = value.trim();
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max - 1).trimEnd()}…`;
}

function uniqueStrings(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  for (const raw of values) {
    const value = raw.trim();
    if (!value) continue;
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(value);
  }

  return out;
}

function markdownToPlain(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/[>*_~]/g, "")
    .replace(/\r/g, " ")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeUrl(value: string | null | undefined): string {
  if (!value) return "";
  const raw = value.trim();
  if (!raw) return "";

  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  try {
    const url = new URL(withProtocol);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return "";
    }
    return url.toString();
  } catch {
    return "";
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractMetaContent(html: string, attr: "property" | "name", key: string): string {
  const escaped = escapeRegExp(key);
  const patterns = [
    new RegExp(
      `<meta[^>]*${attr}\\s*=\\s*["']${escaped}["'][^>]*content\\s*=\\s*["']([^"']+)["'][^>]*>`,
      "i",
    ),
    new RegExp(
      `<meta[^>]*content\\s*=\\s*["']([^"']+)["'][^>]*${attr}\\s*=\\s*["']${escaped}["'][^>]*>`,
      "i",
    ),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return match[1].trim();
  }

  return "";
}

function resolveImageUrl(rawImageUrl: string, baseUrl: string): string {
  if (!rawImageUrl) return "";

  try {
    const resolved = new URL(rawImageUrl, baseUrl);
    if (resolved.protocol !== "http:" && resolved.protocol !== "https:") {
      return "";
    }
    return resolved.toString();
  } catch {
    return "";
  }
}

function extractPreviewImageFromHtml(html: string, baseUrl: string): string {
  const keys = [
    ["property", "og:image"],
    ["property", "og:image:url"],
    ["name", "og:image"],
    ["name", "twitter:image"],
    ["name", "twitter:image:src"],
  ] as const;

  for (const [attr, key] of keys) {
    const content = extractMetaContent(html, attr, key);
    const resolved = resolveImageUrl(content, baseUrl);
    if (resolved) return resolved;
  }

  return "";
}

function isBlockedPreviewHost(hostname: string): boolean {
  const host = hostname.toLowerCase();

  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host === "::1"
  ) {
    return true;
  }

  if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    const parts = host.split(".").map((part) => Number(part));
    if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) {
      return true;
    }

    const [a, b] = parts;
    if (a === 127 || a === 10) return true;
    if (a === 192 && b === 168) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
  }

  return false;
}

function buildGithubRepoPreviewImage(owner: string, repoName: string): string {
  return `https://opengraph.githubassets.com/1/${encodeURIComponent(owner)}/${encodeURIComponent(repoName)}`;
}

function repoSortScore(repo: GithubImportRepo): number {
  const updatedAt = Number(new Date(repo.updatedAt)) || 0;
  return repo.stars * 10_000_000 + updatedAt;
}

function computeTopLanguages(repos: GithubImportRepo[]): string[] {
  const scores = new Map<string, number>();
  for (const repo of repos) {
    if (!repo.language) continue;
    const weight = Math.max(1, repo.stars + 1);
    scores.set(repo.language, (scores.get(repo.language) ?? 0) + weight);
  }

  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([language]) => language);
}

function computeTopTopics(repos: GithubImportRepo[]): string[] {
  const scores = new Map<string, number>();
  for (const repo of repos) {
    for (const topic of repo.topics) {
      const normalized = topic.toLowerCase().trim();
      if (!normalized || normalized.length < 2) continue;
      scores.set(normalized, (scores.get(normalized) ?? 0) + 1);
    }
  }

  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([topic]) => topic);
}

function githubHeaders(): Record<string, string> {
  return {
    Accept: "application/vnd.github+json",
    "User-Agent": "cutefolio-github-import",
  };
}

async function githubFetch<T>(path: string): Promise<FetchOk<T> | FetchErr> {
  try {
    const response = await fetch(`${GITHUB_API_BASE}${path}`, {
      headers: githubHeaders(),
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { ok: false, status: 404, message: "GitHub user not found." };
      }
      if (response.status === 403 || response.status === 429) {
        return {
          ok: false,
          status: 429,
          message: "GitHub rate limit exceeded. Try again shortly.",
        };
      }
      return {
        ok: false,
        status: response.status,
        message: "Failed to fetch GitHub data.",
      };
    }

    const data = (await response.json()) as T;
    return { ok: true, data };
  } catch {
    return {
      ok: false,
      status: 502,
      message: "Could not reach GitHub.",
    };
  }
}

async function fetchAllRepos(
  username: string,
  publicRepoCount: number,
): Promise<FetchOk<GitHubRepoResponse[]> | FetchErr> {
  const repos: GitHubRepoResponse[] = [];
  const totalPages = Math.max(1, Math.ceil(publicRepoCount / GITHUB_REPOS_PER_PAGE));

  for (let page = 1; page <= totalPages; page += 1) {
    const result = await githubFetch<GitHubRepoResponse[]>(
      `/users/${encodeURIComponent(
        username,
      )}/repos?type=owner&sort=updated&per_page=${GITHUB_REPOS_PER_PAGE}&page=${page}`,
    );

    if (!result.ok) return result;

    repos.push(...result.data);
    if (result.data.length < GITHUB_REPOS_PER_PAGE) break;
  }

  return { ok: true, data: repos };
}

async function mapWithConcurrency<T, U>(
  items: T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<U>,
): Promise<U[]> {
  if (items.length === 0) return [];

  const limit = Math.max(1, Math.min(concurrency, items.length));
  const results: U[] = new Array(items.length);
  let cursor = 0;

  await Promise.all(
    Array.from({ length: limit }, async () => {
      while (true) {
        const index = cursor;
        cursor += 1;
        if (index >= items.length) break;
        results[index] = await mapper(items[index], index);
      }
    }),
  );

  return results;
}

async function fetchWebPreviewImage(url: string): Promise<string> {
  const liveUrl = normalizeUrl(url);
  if (!liveUrl) return "";

  let parsed: URL;
  try {
    parsed = new URL(liveUrl);
  } catch {
    return "";
  }

  if (isBlockedPreviewHost(parsed.hostname)) return "";

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4500);

  try {
    const response = await fetch(liveUrl, {
      method: "GET",
      headers: {
        "User-Agent": "cutefolio-github-import",
        Accept: "text/html,application/xhtml+xml",
      },
      cache: "no-store",
      redirect: "manual",
      signal: controller.signal,
    });

    if (!response.ok || (response.status >= 300 && response.status < 400)) {
      return "";
    }

    const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";

    if (contentType.startsWith("image/")) {
      return liveUrl;
    }

    if (!contentType.includes("text/html")) {
      return "";
    }

    const html = await response.text();
    return extractPreviewImageFromHtml(html, liveUrl);
  } catch {
    return "";
  } finally {
    clearTimeout(timeout);
  }
}

async function enrichRepoLivePreviews(repos: GithubImportRepo[]): Promise<GithubImportRepo[]> {
  const previewImages = await mapWithConcurrency(repos, 4, async (repo) => {
    if (!repo.liveUrl) return "";
    return fetchWebPreviewImage(repo.liveUrl);
  });

  return repos.map((repo, index) => {
    const previewImage = previewImages[index];
    if (!previewImage) return repo;
    return {
      ...repo,
      previewImage,
    };
  });
}

function mapRepos(owner: string, repos: GitHubRepoResponse[]): GithubImportRepo[] {
  return repos.map((repo) => ({
    name: repo.name,
    description: repo.description?.trim() ?? "",
    url: repo.html_url,
    liveUrl: normalizeUrl(repo.homepage),
    language: repo.language?.trim() ?? "",
    stars: repo.stargazers_count ?? 0,
    forks: repo.forks_count ?? 0,
    updatedAt: repo.updated_at,
    topics: Array.isArray(repo.topics)
      ? repo.topics.filter((topic): topic is string => typeof topic === "string")
      : [],
    isFork: repo.fork,
    previewImage: buildGithubRepoPreviewImage(owner, repo.name),
  }));
}

const SKILL_ICON_RULES: Array<{ test: RegExp; icon: string }> = [
  { test: /typescript/, icon: "SI Typescript" },
  { test: /javascript/, icon: "SI Javascript" },
  { test: /react/, icon: "SI React" },
  { test: /next(\.js|js)?/, icon: "SI Nextdotjs" },
  { test: /node(\.js|js)?/, icon: "SI Nodedotjs" },
  { test: /\bgo\b|golang/, icon: "SI Go" },
  { test: /python/, icon: "SI Python" },
  { test: /rust/, icon: "SI Rust" },
  { test: /java(?!script)/, icon: "SI Openjdk" },
  { test: /kotlin/, icon: "SI Kotlin" },
  { test: /swift/, icon: "SI Swift" },
  { test: /c\+\+/, icon: "SI Cplusplus" },
  { test: /c#|dotnet|\.net/, icon: "SI Dotnet" },
  { test: /php/, icon: "SI Php" },
  { test: /ruby/, icon: "SI Ruby" },
  { test: /postgres/, icon: "SI Postgresql" },
  { test: /mysql/, icon: "SI Mysql" },
  { test: /mongodb/, icon: "SI Mongodb" },
  { test: /docker/, icon: "SI Docker" },
  { test: /kubernetes/, icon: "SI Kubernetes" },
  { test: /aws/, icon: "SI Amazonwebservices" },
  { test: /azure/, icon: "SI Microsoftazure" },
  { test: /gcp|google cloud/, icon: "SI Googlecloud" },
  { test: /tailwind/, icon: "SI Tailwindcss" },
  { test: /html/, icon: "SI Html5" },
  { test: /css/, icon: "SI Css" },
];

function iconForSkill(skill: string): string {
  const normalized = skill.toLowerCase();
  for (const rule of SKILL_ICON_RULES) {
    if (rule.test.test(normalized)) return rule.icon;
  }
  return "LU Code";
}

function buildTechStack(skills: string[]): ProfileTech[] {
  const deduped = uniqueStrings(skills).slice(0, 10);
  const fallback = deduped.length > 0 ? deduped : ["Software Engineering"];

  return fallback.map((skill) => ({
    iconName: iconForSkill(skill),
    visibleName: skill,
  }));
}

function buildSocialLinks(user: GitHubUserResponse): ProfileSocialLink[] {
  const links: ProfileSocialLink[] = [
    {
      type: "SI Github",
      label: "GitHub",
      href: user.html_url,
    },
  ];

  if (user.twitter_username?.trim()) {
    links.push({
      type: "SI x",
      label: "X",
      href: `https://x.com/${user.twitter_username.trim()}`,
    });
  }

  const blogUrl = normalizeUrl(user.blog);
  if (blogUrl) {
    links.push({
      type: "LU Globe",
      label: "Website",
      href: blogUrl,
    });
  }

  if (user.email?.trim()) {
    links.push({
      type: "BI Envelope",
      label: "Email",
      href: `mailto:${user.email.trim()}`,
    });
  }

  const seen = new Set<string>();
  return links.filter((link) => {
    if (!link.href) return false;
    if (seen.has(link.href)) return false;
    seen.add(link.href);
    return true;
  });
}

function buildCtaButtons(
  user: GitHubUserResponse,
  repos: GithubImportRepo[],
): ProfileCta[] {
  const buttons: ProfileCta[] = [
    {
      type: "primary",
      label: "View GitHub",
      href: user.html_url,
      icon: "SI Github",
    },
  ];

  const blogUrl = normalizeUrl(user.blog);
  if (blogUrl) {
    buttons.push({
      type: "secondary",
      label: "Visit Website",
      href: blogUrl,
      icon: "LU Globe",
    });
    return buttons;
  }

  const topRepo = [...repos].sort((a, b) => repoSortScore(b) - repoSortScore(a))[0];
  if (topRepo) {
    buttons.push({
      type: "secondary",
      label: topRepo.liveUrl ? "Featured Live Project" : "Featured Repository",
      href: topRepo.liveUrl || topRepo.url,
      icon: "LU ExternalLink",
    });
  }

  return buttons;
}

function buildProjectsFromRepos(repos: GithubImportRepo[]): ProfileProject[] {
  const sortedRepos = [...repos].sort((a, b) => repoSortScore(b) - repoSortScore(a));

  return sortedRepos.map((repo) => {
    return {
      title: repo.name,
      description: repo.description,
      image: repo.previewImage,
      href: repo.liveUrl || repo.url,
      tech: uniqueStrings([repo.language, ...repo.topics]).slice(0, 6),
    };
  });
}

function buildPortfolioContent(input: {
  user: GitHubUserResponse;
  repos: GithubImportRepo[];
  readmePlain: string;
}): Profile {
  const displayName = input.user.name?.trim() || input.user.login;
  const projects = buildProjectsFromRepos(input.repos);
  const bannerImage = projects[0]?.image || input.user.avatar_url;
  const topLanguages = computeTopLanguages(input.repos);
  const topTopics = computeTopTopics(input.repos);
  const profileBio = input.user.bio?.trim() || "";
  const profileDetails = uniqueStrings([
    input.user.company?.trim() ?? "",
    input.user.location?.trim() ?? "",
  ]).join(" · ");

  return {
    template: "portfolio-1",
    banner_image: bannerImage,
    img: input.user.avatar_url,
    img_alt: `${displayName} profile photo`,
    heading_bold: displayName,
    heading_light: `@${input.user.login}`,
    title: profileBio,
    desc_1: profileBio,
    desc_2: truncate(input.readmePlain, 360),
    desc_3: profileDetails,
    tech_stack: buildTechStack(uniqueStrings([...topLanguages, ...topTopics]).slice(0, 10)),
    cta_buttons: buildCtaButtons(input.user, input.repos),
    social_links: buildSocialLinks(input.user),
    link_items: [],
    experience: [],
    projects,
    blogs: [],
  };
}

function readmeContentToPlain(readme: GitHubReadmeResponse | null): string {
  if (!readme?.content || readme.encoding !== "base64") return "";

  try {
    return markdownToPlain(
      Buffer.from(readme.content.replace(/\n/g, ""), "base64").toString("utf8"),
    );
  } catch {
    return "";
  }
}

export async function importPortfolioFromGithub(
  rawUsername: string,
): Promise<GithubImportOutcome> {
  const username = normalizeGithubUsername(rawUsername);
  if (!username || !isValidGithubUsername(username)) {
    return {
      ok: false,
      status: 400,
      code: "invalid_username",
      message: "Enter a valid GitHub username.",
    };
  }

  const userResult = await githubFetch<GitHubUserResponse>(
    `/users/${encodeURIComponent(username)}`,
  );
  if (!userResult.ok) {
    const code =
      userResult.status === 404
        ? "not_found"
        : userResult.status === 429
          ? "rate_limited"
          : "upstream";
    return {
      ok: false,
      status: userResult.status,
      code,
      message: userResult.message,
    };
  }

  const user = userResult.data;
  const [reposResult, readmeResult] = await Promise.all([
    fetchAllRepos(username, user.public_repos ?? 0),
    githubFetch<GitHubReadmeResponse>(
      `/repos/${encodeURIComponent(username)}/${encodeURIComponent(
        username,
      )}/readme`,
    ),
  ]);

  if (!reposResult.ok) {
    const code = reposResult.status === 429 ? "rate_limited" : "upstream";
    return {
      ok: false,
      status: reposResult.status,
      code,
      message: reposResult.message,
    };
  }

  const mappedRepos = mapRepos(username, reposResult.data);
  const repos = await enrichRepoLivePreviews(mappedRepos);

  const totalStars = repos.reduce((acc, repo) => acc + Math.max(0, repo.stars), 0);
  const totalForks = repos.reduce((acc, repo) => acc + Math.max(0, repo.forks), 0);

  const readmeExists = readmeResult.ok;
  const readmePlain = readmeResult.ok ? readmeContentToPlain(readmeResult.data) : "";

  const content = buildPortfolioContent({
    user,
    repos,
    readmePlain,
  });

  return {
    ok: true,
    data: {
      username,
      profile: {
        name: user.name?.trim() || user.login,
        bio: user.bio?.trim() || "",
        avatarUrl: user.avatar_url,
        profileUrl: user.html_url,
        company: user.company?.trim() || "",
        location: user.location?.trim() || "",
        blogUrl: normalizeUrl(user.blog),
        followers: user.followers ?? 0,
        following: user.following ?? 0,
        publicRepoCount: user.public_repos ?? repos.length,
      },
      stats: {
        fetchedRepoCount: repos.length,
        totalStars,
        totalForks,
      },
      readme: {
        exists: readmeExists,
        excerpt: readmePlain ? truncate(readmePlain, 420) : "",
      },
      repos,
      suggestedSlug: username,
      content,
    },
  };
}
