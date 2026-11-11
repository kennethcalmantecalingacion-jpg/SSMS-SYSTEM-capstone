import {
  getAdminClient,
  isPostOrOptions,
  jsonResponse,
  preflightResponse,
  readJsonObject,
  registrationOrigin,
  sha256,
} from "../_shared/security.ts";

const genericResponse = {
  message: "If the invitation is valid, an email with next steps will be sent.",
};

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return preflightResponse(request);
  }
  if (!isPostOrOptions(request)) {
    return jsonResponse(request, { error: "Method not allowed." }, 405);
  }

  const body = await readJsonObject(request);
  if (!body) {
    return jsonResponse(request, { error: "Enter valid registration details." }, 400);
  }

  const username = typeof body.username === "string" ? body.username.trim().toLowerCase() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const code = typeof body.invitationCode === "string" ? body.invitationCode.trim() : "";
  if (!/^[a-z0-9][a-z0-9_.-]{2,35}$/.test(username)
    || email.length > 254
    || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    || code.length < 16
    || code.length > 256) {
    return jsonResponse(request, { error: "Check the username, email, and invitation code." }, 400);
  }

  let admin;
  let redirectOrigin;
  try {
    admin = getAdminClient();
    redirectOrigin = registrationOrigin();
  } catch (error) {
    console.error("Registration service configuration error.", error);
    return jsonResponse(request, { error: "Registration is temporarily unavailable." }, 503);
  }

  const forwarded = request.headers.get("cf-connecting-ip")
    || request.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim()
    || "unknown";
  const [emailHash, sourceHash, codeHash] = await Promise.all([
    sha256(email),
    sha256(forwarded),
    sha256(code),
  ]);

  const { data: allowed, error: rateLimitError } = await admin.rpc(
    "record_registration_attempt",
    { p_email_hash: emailHash, p_source_hash: sourceHash },
  );
  if (rateLimitError) {
    console.error("Registration rate-limit check failed.");
    return jsonResponse(request, { error: "Registration is temporarily unavailable." }, 503);
  }
  if (allowed !== true) {
    return jsonResponse(request, { error: "Too many attempts. Try again later." }, 429);
  }

  const { data: reservationId, error: reservationError } = await admin.rpc(
    "reserve_registration_invite",
    { p_code_hash: codeHash, p_email: email },
  );
  if (reservationError || typeof reservationId !== "string") {
    if (reservationError) {
      console.error("Registration invitation reservation failed.");
    }
    return jsonResponse(request, genericResponse, 202);
  }

  const { data, error: invitationError } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { username },
    redirectTo: `${redirectOrigin}/?auth=invite`,
  });
  if (invitationError || !data.user) {
    if (data?.user) {
      const { error: cleanupError } = await admin.auth.admin.deleteUser(data.user.id);
      if (cleanupError) {
        console.error("Could not clean up an incomplete Auth invitation.");
      }
    }
    await admin.rpc("release_registration_invite", {
      p_reservation_id: reservationId,
    });
    console.error("Supabase Auth could not send a registration invitation.");
    return jsonResponse(request, genericResponse, 202);
  }

  const { data: completed, error: completionError } = await admin.rpc(
    "complete_registration_invite",
    { p_reservation_id: reservationId, p_auth_user_id: data.user.id },
  );
  if (completionError || completed !== true) {
    console.error("Registration invitation completion failed.");
    const { error: deleteError } = await admin.auth.admin.deleteUser(data.user.id);
    if (deleteError) {
      console.error("Could not compensate for an incomplete account invitation.");
    }
    await admin.rpc("release_registration_invite", {
      p_reservation_id: reservationId,
    });
    return jsonResponse(request, {
      error: "The account invitation could not be completed. Contact the platform operator.",
    }, 500);
  }

  return jsonResponse(request, genericResponse, 202);
});
