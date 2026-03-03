import { getCurrentUser } from "@/lib/current-user";
import { jsonNoStore, rateLimitResponse } from "@/lib/api/response";
import { verifyCustomDomain } from "@/lib/services/domains-service";
import { getRateLimitKey, rateLimit } from "@/lib/rate-limit";
import { getDatabaseErrorHint } from "@/lib/db-errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ appId: string; domainId: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonNoStore({ error: "Unauthorized." }, { status: 401 });

    const limit = rateLimit({
      key: `${getRateLimitKey(request, "domains_verify")}:${user.id}`,
      max: 40,
      windowMs: 60_000,
    });
    if (!limit.allowed) {
      return rateLimitResponse(limit);
    }

    const { appId, domainId } = await context.params;
    const result = await verifyCustomDomain({
      ownerId: user.id,
      appId,
      domainId,
    });

    if (!result.ok) {
      if (result.code === "verification_failed") {
        return jsonNoStore(
          {
            error: result.message,
            code: result.code,
            instructions: result.instructions,
            domain: result.domain,
            vercelVerification: "vercelVerification" in result ? result.vercelVerification : undefined,
          },
          { status: 409 }
        );
      }
      return jsonNoStore({ error: "Domain not found." }, { status: 404 });
    }

    return jsonNoStore(result);
  } catch (error) {
    console.error("Failed to verify domain", error);
    return jsonNoStore({ error: getDatabaseErrorHint(error) }, { status: 500 });
  }
}
