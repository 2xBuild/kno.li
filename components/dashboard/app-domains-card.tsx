"use client";

import { useState } from "react";
import { ExternalLink, Info, ShieldCheck, Trash2 } from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CopyableValue } from "@/components/ui/copyable-value";

interface DomainRecord {
  id: string;
  domain: string;
  status: string;
  verificationToken: string;
  dnsTarget: string;
  isPrimary: boolean;
}

interface VercelVerification {
  type: string;
  domain: string;
  value: string;
  reason: string;
}

interface DnsInstructions {
  type: string;
  name: string;
  value: string;
  cnameTarget: string;
}

interface AppDomainsCardProps {
  appId: string;
  appSlug: string;
  firstPartyDomains: string[];
  initialDomains: DomainRecord[];
  canConnectCustomDomain: boolean;
}

function DnsInstructionsPanel({
  domain,
  instructions,
  vercelVerification,
}: {
  domain: string;
  instructions: DnsInstructions;
  vercelVerification?: VercelVerification[];
}) {
  const isVercelTarget = instructions.cnameTarget === "cname.vercel-dns.com";
  const isApexDomain = !domain.includes(".") || domain.split(".").length === 2;

  return (
    <div className="space-y-4 rounded-lg bg-muted/20 p-4">
      <div className="flex items-start gap-2">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <p className="text-sm font-medium">
          Add these DNS records at your domain registrar for <span className="font-semibold">{domain}</span>
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Step 1 — {isVercelTarget && isApexDomain ? "A Record" : "CNAME Record"} <span className="font-normal">(routes traffic to us)</span>
        </p>
        <div className="overflow-hidden rounded-md bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground/90">
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Name / Host</th>
                <th className="px-3 py-2">Value / Points to</th>
              </tr>
            </thead>
            <tbody>
              {isVercelTarget && isApexDomain ? (
                <tr>
                  <td className="px-3 py-2.5">
                    <CopyableValue value="A" label="type" mono />
                  </td>
                  <td className="px-3 py-2.5">
                    <CopyableValue value="@" label="host" mono />
                  </td>
                  <td className="px-3 py-2.5">
                    <CopyableValue value="76.76.21.21" label="A record value" mono />
                  </td>
                </tr>
              ) : (
                <tr>
                  <td className="px-3 py-2.5">
                    <CopyableValue value="CNAME" label="type" mono />
                  </td>
                  <td className="px-3 py-2.5">
                    <CopyableValue value={isApexDomain ? "@" : domain.split(".")[0] ?? "@"} label="host" mono />
                    {isApexDomain && <span className="ml-1.5 text-xs text-muted-foreground">or leave empty</span>}
                  </td>
                  <td className="px-3 py-2.5">
                    <CopyableValue value={instructions.cnameTarget} label="CNAME target" mono />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {isVercelTarget && isApexDomain ? (
          <p className="text-xs text-muted-foreground">
            For apex/root domains, use an <strong>A record</strong> pointing to Vercel&apos;s IP. SSL is provisioned automatically once DNS propagates.
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Some providers (like GoDaddy or Namecheap) don&apos;t support CNAME on root domains. If that&apos;s the case, use a subdomain like <code className="rounded bg-muted px-1 font-mono">www</code> instead, or look for a &quot;CNAME flattening&quot; / &quot;ALIAS&quot; option.
          </p>
        )}
      </div>

      {vercelVerification && vercelVerification.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Step 2 — Verification Record <span className="font-normal">(required by hosting provider)</span>
          </p>
          <div className="overflow-hidden rounded-md bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground/90">
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Name / Host</th>
                  <th className="px-3 py-2">Value / Content</th>
                </tr>
              </thead>
              <tbody>
                {vercelVerification.map((v) => (
                  <tr key={v.domain + v.value}>
                    <td className="px-3 py-2.5">
                      <CopyableValue value={v.type} label="type" mono />
                    </td>
                    <td className="px-3 py-2.5">
                      <CopyableValue value={v.domain} label="host" mono />
                    </td>
                    <td className="px-3 py-2.5">
                      <CopyableValue value={v.value} label="verification value" mono />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground">
            This record proves domain ownership. DNS changes can take up to 24–48 hours to propagate.
          </p>
        </div>
      )}

      {(!vercelVerification || vercelVerification.length === 0) && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Step 2 — TXT Record <span className="font-normal">(proves you own the domain)</span>
          </p>
          <div className="overflow-hidden rounded-md bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground/90">
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Name / Host</th>
                  <th className="px-3 py-2">Value / Content</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-3 py-2.5">
                    <CopyableValue value="TXT" label="type" mono />
                  </td>
                  <td className="px-3 py-2.5">
                    <CopyableValue value="@" label="TXT host" mono />
                    <span className="ml-1.5 text-xs text-muted-foreground">or leave empty</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <CopyableValue value={instructions.value} label="TXT value" mono />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground">
            DNS changes can take up to 24–48 hours to propagate. After adding both records, click <strong>Verify</strong> below.
          </p>
        </div>
      )}
    </div>
  );
}

function DomainRow({
  domain,
  isMutating,
  vercelVerification,
  onVerify,
  onDelete,
}: {
  domain: DomainRecord;
  isMutating: boolean;
  vercelVerification?: VercelVerification[];
  onVerify: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(domain.status !== "active");

  const instructions: DnsInstructions = {
    type: "TXT",
    name: domain.domain,
    value: domain.verificationToken,
    cnameTarget: domain.dnsTarget,
  };

  return (
    <div className="space-y-3 border-b border-border py-4 first:pt-0 last:border-b-0 last:pb-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <p className="font-medium">{domain.domain}</p>
          <Badge variant={domain.status === "active" ? "success" : "warning"}>
            {domain.status === "active" ? "Active" : domain.status === "pending_verification" ? "Pending" : domain.status}
          </Badge>
          {domain.status === "active" && (
            <a
              href={`https://${domain.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
        <div className="flex gap-2">
          {domain.status !== "active" && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setExpanded((v) => !v)}
              >
                {expanded ? "Hide" : "Show"} DNS setup
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1"
                disabled={isMutating}
                onClick={() => onVerify(domain.id)}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Verify
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant="outline"
            className="gap-1"
            disabled={isMutating}
            onClick={() => onDelete(domain.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove
          </Button>
        </div>
      </div>

      {expanded && domain.status !== "active" && (
        <DnsInstructionsPanel
          domain={domain.domain}
          instructions={instructions}
          vercelVerification={vercelVerification}
        />
      )}
    </div>
  );
}

export function AppDomainsCard({
  appId,
  appSlug,
  firstPartyDomains,
  initialDomains,
  canConnectCustomDomain,
}: AppDomainsCardProps) {
  const [domains, setDomains] = useState<DomainRecord[]>(initialDomains);
  const [domainInput, setDomainInput] = useState("");
  const [isLoadingDomains, setIsLoadingDomains] = useState(false);
  const [isMutatingDomain, setIsMutatingDomain] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [vercelVerificationMap, setVercelVerificationMap] = useState<Record<string, VercelVerification[]>>({});

  const loadDomains = async () => {
    setIsLoadingDomains(true);
    setError(null);
    try {
      const res = await fetch(`/api/apps/${appId}/domains`, { cache: "no-store" });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to load domains.");
      }
      const data = (await res.json()) as { domains?: DomainRecord[] };
      setDomains(data.domains ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load domains.");
      setDomains([]);
    } finally {
      setIsLoadingDomains(false);
    }
  };

  const handleAddDomain = async () => {
    const domainValue = domainInput.trim().toLowerCase();
    setIsMutatingDomain(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/apps/${appId}/domains`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: domainValue, isPrimary: false }),
      });
      const data = (await res.json()) as {
        error?: string;
        code?: string;
      };
      if (!res.ok) {
        const msg =
          res.status === 403 && data.code === "premium_required"
            ? (data.error ?? "Custom domains require Premium or Ultra.") + " Upgrade plan first."
            : data.error ?? "Failed to add domain.";
        throw new Error(msg);
      }

      setDomainInput("");
      await loadDomains();
      setMessage("Domain added! Configure the DNS records shown below, then click Verify.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add domain.");
    } finally {
      setIsMutatingDomain(false);
    }
  };

  const handleVerify = async (domainId: string) => {
    setIsMutatingDomain(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/apps/${appId}/domains/${domainId}/verify`, {
        method: "POST",
      });
      const data = (await res.json()) as {
        error?: string;
        vercelVerification?: VercelVerification[];
        domain?: DomainRecord;
      };
      if (!res.ok) {
        if (data.vercelVerification?.length) {
          const targetDomain = data.domain?.domain ?? domainId;
          setVercelVerificationMap((prev) => ({
            ...prev,
            [targetDomain]: data.vercelVerification!,
          }));
        }
        throw new Error(data.error ?? "Failed to verify domain.");
      }
      await loadDomains();
      setMessage("Domain verified and activated! SSL certificate will be provisioned automatically.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify domain.");
    } finally {
      setIsMutatingDomain(false);
    }
  };

  const handleDelete = async (domainId: string) => {
    setIsMutatingDomain(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/apps/${appId}/domains/${domainId}`, {
        method: "DELETE",
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to remove domain.");
      await loadDomains();
      setMessage("Domain removed.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove domain.");
    } finally {
      setIsMutatingDomain(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Domains</CardTitle>
        <CardDescription>
          Connect custom domains to <strong>{appSlug}</strong>. Your site will be served from any active domain.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Default domains</p>
          <div className="flex flex-wrap gap-2">
            {firstPartyDomains.map((domain) => (
              <Badge key={domain} variant="warning">
                {domain}/{appSlug}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Custom domains</p>
          {!canConnectCustomDomain && (
            <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
              Custom domains require Premium or Ultra. Upgrade your plan to continue.
            </p>
          )}

          <div className="flex gap-2">
            <Input
              placeholder="example.com"
              value={domainInput}
              onChange={(event) => setDomainInput(event.target.value)}
              disabled={!canConnectCustomDomain || isMutatingDomain}
              onKeyDown={(e) => {
                if (e.key === "Enter" && domainInput.trim() && canConnectCustomDomain && !isMutatingDomain) {
                  handleAddDomain();
                }
              }}
            />
            <Button
              onClick={handleAddDomain}
              disabled={!canConnectCustomDomain || !domainInput.trim() || isMutatingDomain}
            >
              Add domain
            </Button>
          </div>

          {isLoadingDomains ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader size="sm" />
              Loading domains...
            </div>
          ) : domains.length === 0 ? (
            <p className="text-sm text-muted-foreground">No custom domains configured.</p>
          ) : (
            <div>
              {domains.map((domain) => (
                <DomainRow
                  key={domain.id}
                  domain={domain}
                  isMutating={isMutatingDomain}
                  vercelVerification={vercelVerificationMap[domain.domain]}
                  onVerify={handleVerify}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>

        {message && <p className="text-sm text-emerald-600 dark:text-emerald-400">{message}</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
