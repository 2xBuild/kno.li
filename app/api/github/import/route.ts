import { jsonNoStore } from "@/lib/api/response";
import { getCurrentUser } from "@/lib/current-user";
import { importPortfolioFromGithub } from "@/lib/services/github-import-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return jsonNoStore({ error: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username") ?? "";

  const result = await importPortfolioFromGithub(username);
  if (!result.ok) {
    return jsonNoStore(
      {
        error: result.message,
        code: result.code,
      },
      { status: result.status },
    );
  }

  return jsonNoStore(result.data);
}
