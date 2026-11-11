import {
  getAdminClient,
  getAuthenticatedUser,
  isPostOrOptions,
  jsonResponse,
  preflightResponse,
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
    return jsonResponse(request, { error: "Sign in before creating a workspace." }, 401);
  }

  const body = await readJsonObject(request);
  const workspaceName = typeof body?.workspaceName === "string"
    ? body.workspaceName.trim()
    : "";
  const grantCode = typeof body?.grantCode === "string" ? body.grantCode.trim() : "";
  if (workspaceName.length < 2 || workspaceName.length > 100
    || grantCode.length < 16 || grantCode.length > 256) {
    return jsonResponse(request, { error: "Enter a workspace name and valid creation grant." }, 400);
  }

  try {
    const admin = getAdminClient();
    const { data, error } = await admin.rpc("create_workspace_with_grant", {
      p_user_id: user.id,
      p_workspace_name: workspaceName,
      p_code_hash: await sha256(grantCode),
    });
    if (error || !Array.isArray(data) || typeof data[0]?.workspace_id !== "string") {
      return jsonResponse(request, {
        error: "The workspace could not be created. Check the grant or contact the platform operator.",
      }, 400);
    }
    return jsonResponse(request, {
      workspace: { id: data[0].workspace_id, name: data[0].workspace_name },
    }, 201);
  } catch (error) {
    console.error("Workspace creation service failed.", error);
    return jsonResponse(request, { error: "Workspace creation is temporarily unavailable." }, 503);
  }
});

