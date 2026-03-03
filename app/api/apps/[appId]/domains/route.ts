import { getCurrentUser } from "@/lib/current-user";
import { jsonNoStore, rateLimitResponse, parseJsonBody } from "@/lib/api/response";
import {
  addCustomDomain,
  getAppDomains,
} from "@/lib/services/domains-service";
import { parseAddDomainInput } from "@/lib/validators/domain-schema";
import { getRateLimitKey, rateLimit } from "@/lib/rate-limit";
import { getDatabaseErrorHint } from "@/lib/db-errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ appId: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonNoStore({ error: "Unauthorized." }, { status: 401 });

    const { appId } = await context.params;
    const result = await getAppDomains({ ownerId: user.id, appId });
    if (!result.ok) {
      return jsonNoStore({ error: "App not found." }, { status: 404 });
    }

    return jsonNoStore({
      appId,
      domains: result.domains,
    });
  } catch (error) {
    console.error("Failed to load domains", error);
    return jsonNoStore({ error: getDatabaseErrorHint(error) }, { status: 500 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonNoStore({ error: "Unauthorized." }, { status: 401 });

    const limit = rateLimit({
      key: `${getRateLimitKey(request, "domains_create")}:${user.id}`,
      max: 20,
      windowMs: 60_000,
    });
    if (!limit.allowed) {
      return rateLimitResponse(limit);
    }

    const body = await parseJsonBody(request);
    if (!body.ok) return body.response;

    const parsed = parseAddDomainInput(body.data);
    if (!parsed.ok) {
      return jsonNoStore({ error: parsed.error }, { status: 400 });
    }

    const { appId } = await context.params;
    const result = await addCustomDomain({
      ownerId: user.id,
      planTier: user.planTier,
      appId,
      domain: parsed.data.domain,
      isPrimary: parsed.data.isPrimary ?? false,
    });

    if (!result.ok) {
      if (result.code === "premium_required") {
        return jsonNoStore({ error: result.message, code: result.code }, { status: 403 });
      }
      if (result.code === "not_found") {
        return jsonNoStore({ error: result.message }, { status: 404 });
      }
      if (result.code === "vercel_error") {
        return jsonNoStore({ error: result.message, code: result.code }, { status: 502 });
      }
      return jsonNoStore({ error: result.message }, { status: 400 });
    }

    return jsonNoStore(result, { status: 201 });
  } catch (error) {
    console.error("Failed to create domain", error);
    return jsonNoStore({ error: getDatabaseErrorHint(error) }, { status: 500 });
  }
}
