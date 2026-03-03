import { randomBytes } from "node:crypto";
import { resolveTxt } from "node:dns/promises";
import { canAttachCustomDomain } from "@/lib/gating/plan-features";
import { findAppByIdForOwner } from "@/lib/repositories/apps-repo";
import {
  createAppDomain,
  getAppDomain,
  listAppDomains,
  markAppDomainFailed,
  removeAppDomain,
  verifyAppDomain,
} from "@/lib/repositories/domains-repo";
import type { PlanTier } from "@/db/schema";
import { FIRST_PARTY_HOSTS } from "@/lib/constants";
import {
  addDomainToVercel,
  removeDomainFromVercel,
  verifyDomainOnVercel,
  getDomainConfigFromVercel,
  isVercelApiConfigured,
} from "@/lib/vercel-api";

function isFirstPartyDomain(domain: string): boolean {
  const normalized = domain.split(":")[0]?.toLowerCase() ?? "";
  for (const host of FIRST_PARTY_HOSTS) {
    if (normalized === host || normalized.endsWith(`.${host}`)) return true;
  }
  return false;
}

function makeVerificationToken(): string {
  return randomBytes(24).toString("hex");
}

async function hasMatchingVerificationTxt(domain: string, token: string): Promise<boolean> {
  try {
    const records = await resolveTxt(domain);
    for (const chunks of records) {
      const value = chunks.join("").trim();
      if (value === token) return true;
    }
  } catch {
    return false;
  }

  return false;
}

const VERCEL_CNAME_TARGET = "cname.vercel-dns.com";

export async function getAppDomains(input: { ownerId: string; appId: string }) {
  const app = await findAppByIdForOwner(input.appId, input.ownerId);
  if (!app) {
    return { ok: false as const, code: "not_found" as const };
  }

  const domains = await listAppDomains(input.appId);
  return { ok: true as const, app, domains };
}

export async function addCustomDomain(input: {
  ownerId: string;
  planTier: PlanTier;
  appId: string;
  domain: string;
  isPrimary: boolean;
}) {
  const app = await findAppByIdForOwner(input.appId, input.ownerId);
  if (!app) {
    return { ok: false as const, code: "not_found" as const, message: "App not found." };
  }

  if (!canAttachCustomDomain(input.planTier)) {
    return {
      ok: false as const,
      code: "premium_required" as const,
      message: "Custom domains require a premium or ultra plan.",
    };
  }

  if (isFirstPartyDomain(input.domain)) {
    return {
      ok: false as const,
      code: "invalid_domain" as const,
      message: "First-party domains cannot be added as custom domains.",
    };
  }

  const dnsTarget = isVercelApiConfigured()
    ? VERCEL_CNAME_TARGET
    : (process.env.CUSTOM_DOMAIN_CNAME_TARGET ?? "cname.kno.li");

  if (isVercelApiConfigured()) {
    const vercelResult = await addDomainToVercel(input.domain);
    if (!vercelResult.ok) {
      return {
        ok: false as const,
        code: "vercel_error" as const,
        message: vercelResult.error ?? "Failed to register domain with hosting provider.",
      };
    }
  }

  const created = await createAppDomain({
    appId: input.appId,
    domain: input.domain,
    isPrimary: input.isPrimary,
    verificationToken: makeVerificationToken(),
    dnsTarget,
  });

  return {
    ok: true as const,
    domain: created,
    instructions: {
      type: "TXT",
      name: input.domain,
      value: created.verificationToken,
      cnameTarget: dnsTarget,
    },
  };
}

export async function verifyCustomDomain(input: {
  ownerId: string;
  appId: string;
  domainId: string;
}) {
  const app = await findAppByIdForOwner(input.appId, input.ownerId);
  if (!app) {
    return { ok: false as const, code: "not_found" as const };
  }

  const domain = await getAppDomain(input.appId, input.domainId);
  if (!domain) {
    return { ok: false as const, code: "not_found" as const };
  }

  if (isVercelApiConfigured()) {
    const vercelResult = await verifyDomainOnVercel(domain.domain);

    if (!vercelResult.ok || !vercelResult.verified) {
      const configResult = await getDomainConfigFromVercel(domain.domain);

      const failed = await markAppDomainFailed(input.appId, input.domainId);
      return {
        ok: false as const,
        code: "verification_failed" as const,
        message: "Domain not yet verified. Point your DNS to cname.vercel-dns.com and retry.",
        domain: failed ?? domain,
        vercelVerification: configResult.verification,
        instructions: {
          type: "TXT",
          name: domain.domain,
          value: domain.verificationToken,
        },
      };
    }

    const verified = await verifyAppDomain(input.appId, input.domainId);
    if (!verified) {
      return { ok: false as const, code: "not_found" as const };
    }

    return { ok: true as const, domain: verified };
  }

  const txtMatches = await hasMatchingVerificationTxt(
    domain.domain,
    domain.verificationToken
  );

  if (!txtMatches) {
    const failed = await markAppDomainFailed(input.appId, input.domainId);
    return {
      ok: false as const,
      code: "verification_failed" as const,
      message: "TXT verification token not found yet. Update DNS and retry.",
      domain: failed ?? domain,
      instructions: {
        type: "TXT",
        name: domain.domain,
        value: domain.verificationToken,
      },
    };
  }

  const verified = await verifyAppDomain(input.appId, input.domainId);
  if (!verified) {
    return { ok: false as const, code: "not_found" as const };
  }

  return { ok: true as const, domain: verified };
}

export async function deleteCustomDomain(input: {
  ownerId: string;
  appId: string;
  domainId: string;
}) {
  const app = await findAppByIdForOwner(input.appId, input.ownerId);
  if (!app) {
    return { ok: false as const, code: "not_found" as const };
  }

  const domain = await getAppDomain(input.appId, input.domainId);

  if (domain && isVercelApiConfigured()) {
    const vercelResult = await removeDomainFromVercel(domain.domain);
    if (!vercelResult.ok) {
      console.error("[domains] Failed to remove domain from Vercel:", vercelResult.error);
    }
  }

  const removed = await removeAppDomain(input.appId, input.domainId);
  return { ok: removed as boolean };
}
