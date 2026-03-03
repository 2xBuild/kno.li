const VERCEL_API_BASE = "https://api.vercel.com";

function getConfig() {
  const token = process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  if (!token || !projectId) {
    throw new Error("VERCEL_TOKEN and VERCEL_PROJECT_ID must be set for custom domain management.");
  }
  return { token, projectId, teamId: process.env.VERCEL_TEAM_ID };
}

async function vercelFetch(path: string, init?: RequestInit): Promise<Response> {
  const { token, teamId } = getConfig();
  const separator = path.includes("?") ? "&" : "?";
  const url = `${VERCEL_API_BASE}${path}${teamId ? `${separator}teamId=${encodeURIComponent(teamId)}` : ""}`;

  return fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
}

export interface VercelDomainVerification {
  type: string;
  domain: string;
  value: string;
  reason: string;
}

export interface VercelDomainResponse {
  name: string;
  apexName: string;
  projectId: string;
  verified: boolean;
  verification?: VercelDomainVerification[];
  error?: { code: string; message: string };
}

/**
 * Add a domain to the Vercel project. Vercel will automatically provision
 * an SSL certificate once DNS is pointed correctly.
 */
export async function addDomainToVercel(domain: string): Promise<{
  ok: boolean;
  domain?: VercelDomainResponse;
  error?: string;
}> {
  const { projectId } = getConfig();

  try {
    const res = await vercelFetch(`/v10/projects/${projectId}/domains`, {
      method: "POST",
      body: JSON.stringify({ name: domain }),
    });

    const data = await res.json();

    if (!res.ok) {
      const code = data?.error?.code;
      if (code === "domain_already_in_use") {
        return { ok: false, error: `Domain ${domain} is already in use by another Vercel project.` };
      }
      if (code === "domain_taken") {
        return { ok: false, error: `Domain ${domain} is taken. Verify ownership on Vercel first.` };
      }
      return { ok: false, error: data?.error?.message ?? `Failed to add domain to Vercel (${res.status}).` };
    }

    return { ok: true, domain: data as VercelDomainResponse };
  } catch (err) {
    console.error("[vercel-api] addDomainToVercel failed", err);
    return { ok: false, error: "Network error communicating with Vercel API." };
  }
}

/**
 * Remove a domain from the Vercel project.
 */
export async function removeDomainFromVercel(domain: string): Promise<{ ok: boolean; error?: string }> {
  const { projectId } = getConfig();

  try {
    const res = await vercelFetch(
      `/v9/projects/${projectId}/domains/${encodeURIComponent(domain)}`,
      { method: "DELETE" }
    );

    if (!res.ok && res.status !== 404) {
      const data = await res.json().catch(() => null);
      return { ok: false, error: data?.error?.message ?? `Failed to remove domain from Vercel (${res.status}).` };
    }

    return { ok: true };
  } catch (err) {
    console.error("[vercel-api] removeDomainFromVercel failed", err);
    return { ok: false, error: "Network error communicating with Vercel API." };
  }
}

/**
 * Verify a domain on the Vercel project. Returns the updated domain state
 * including whether verification succeeded.
 */
export async function verifyDomainOnVercel(domain: string): Promise<{
  ok: boolean;
  verified?: boolean;
  verification?: VercelDomainVerification[];
  error?: string;
}> {
  const { projectId } = getConfig();

  try {
    const res = await vercelFetch(
      `/v9/projects/${projectId}/domains/${encodeURIComponent(domain)}/verify`,
      { method: "POST" }
    );

    const data = await res.json();

    if (!res.ok) {
      return {
        ok: false,
        verified: false,
        verification: data?.verification,
        error: data?.error?.message ?? `Vercel verification failed (${res.status}).`,
      };
    }

    return {
      ok: true,
      verified: data?.verified ?? true,
      verification: data?.verification,
    };
  } catch (err) {
    console.error("[vercel-api] verifyDomainOnVercel failed", err);
    return { ok: false, error: "Network error communicating with Vercel API." };
  }
}

/**
 * Get domain configuration/status from Vercel.
 */
export async function getDomainConfigFromVercel(domain: string): Promise<{
  ok: boolean;
  verified?: boolean;
  verification?: VercelDomainVerification[];
  error?: string;
}> {
  const { projectId } = getConfig();

  try {
    const res = await vercelFetch(
      `/v9/projects/${projectId}/domains/${encodeURIComponent(domain)}`
    );

    const data = await res.json();

    if (!res.ok) {
      return { ok: false, error: data?.error?.message ?? `Failed to get domain config (${res.status}).` };
    }

    return {
      ok: true,
      verified: data?.verified,
      verification: data?.verification,
    };
  } catch (err) {
    console.error("[vercel-api] getDomainConfigFromVercel failed", err);
    return { ok: false, error: "Network error communicating with Vercel API." };
  }
}

/**
 * Check whether Vercel API integration is configured.
 */
export function isVercelApiConfigured(): boolean {
  return Boolean(process.env.VERCEL_TOKEN && process.env.VERCEL_PROJECT_ID);
}
