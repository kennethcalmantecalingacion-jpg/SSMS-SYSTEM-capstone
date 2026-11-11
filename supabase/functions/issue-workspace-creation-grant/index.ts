import {
  getAdminClient,
  getAuthenticatedUser,
  isPostOrOptions,
  jsonResponse,
  preflightResponse,
  randomInvitationCode,
  readJsonObject,
  sha256,
} from "../_shared/security.ts";

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return preflightResponse(request);
  }
  if (request.method !== "POST") {
    return jsonResponse(request, { error: "Method not allowed." }, 405);
  }

  const user = await getAuthenticatedUser(request);
  if (!user) {
    return jsonResponse(request, { error: "Sign in before issuing a creation grant." }, 401);
  }

  const body = await readJsonObject(request);
  const days = Number(body?.expiresInDays ?? 7);
  const maxRedemptions = Number(body?.maxRedemptions ?? 1);
  if (!Number.isInteger(days) || days < 1 || days > 30
    || !Number.isInteger(maxRedemptions) || maxRedemptions < 1 || maxRedemptions > 5) {
    return jsonResponse(request, { error: "Check the expiration and redemption limit." }, 400);
  }

  try {
    const admin = getAdminClient();
    const code = randomInvitationCode("WS");
    const { error } = await admin.rpc("issue_workspace_creation_grant", {
      p_actor_id: user.id,
      p_code_hash: await sha256(code),
      p_expires_at: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString(),
      p_max_redemptions: maxRedemptions,
    });
    if (error) {
      const unauthorized = error.code === "42501";
      return jsonResponse(request, {
        error: unauthorized
          ? "Only a Platform Operator can issue workspace creation grants."
          : "The workspace grant could not be issued.",
      }, unauthorized ? 403 : 400);
    }
    return jsonResponse(request, {
      code,
      message: "Copy this workspace creation grant now. It is shown only once.",
    }, 201);
  } catch (error) {
    console.error("Workspace grant issuance service failed.", error);
    return jsonResponse(request, { error: "Workspace grant issuance is temporarily unavailable." }, 503);
  }
});

