import {
  createWorkspaceGrant,
  getCurrentSession,
  getDemoAccounts,
  getWorkspaceJoinRequests,
  getWorkspaceOptions,
  registerAccount,
  requestWorkspaceMembership,
  signInDemo,
  signInWithCredentials,
  signOutDemo,
  switchWorkspace,
} from "../core/auth/demo-auth.js";
import { canAccessView, getAllowedViews, getRoleLabel } from "../core/access/role-access.js";
import {
  getProductionAuthClient,
  getProductionAuthConfigurationError,
  isProductionAuthConfigured,
} from "../core/auth/production-auth.js";

let activeProductionUser = null;
let passwordRecoveryActive = false;

function setLoginMessage(message) {
  const loginMessage = document.querySelector("#login-message");
  if (loginMessage) {
    loginMessage.textContent = message;
  }
}

function showMainLogin(message) {
  const loginView = document.querySelector("#login-view");
  const productionSessionView = document.querySelector("#production-session-view");
  const demoPortal = document.querySelector("#demo-portal-view");
  const appShell = document.querySelector("#app-shell");

  if (loginView) {
    loginView.hidden = false;
  }
  if (demoPortal) {
    demoPortal.hidden = true;
  }
  if (productionSessionView) {
    productionSessionView.hidden = true;
  }
  if (appShell) {
    appShell.hidden = true;
  }

  document.title = "Sign in · Student Monitoring System";
  setLoginMessage(message || "Production sign-in and registration remain unconfigured. Use the Demo Mode sandbox to test local workflow behavior and synthetic data.");
}

function showDemoPortal() {
  const loginView = document.querySelector("#login-view");
  const productionSessionView = document.querySelector("#production-session-view");
  const demoPortal = document.querySelector("#demo-portal-view");
  const appShell = document.querySelector("#app-shell");

  if (loginView) {
    loginView.hidden = true;
  }
  if (demoPortal) {
    demoPortal.hidden = false;
  }
  if (productionSessionView) {
    productionSessionView.hidden = true;
  }
  if (appShell) {
    appShell.hidden = true;
  }

  document.title = "Demo Portal · Student Monitoring System";
}

function renderAccounts() {
  const list = document.querySelector("#demo-account-list");
  if (!list) {
    return;
  }

  list.replaceChildren(...getDemoAccounts()
    .filter((account) => account.available)
    .map((account) => {
      const card = document.createElement("article");
      card.className = "demo-account";

      const identity = document.createElement("div");
      identity.className = "demo-account-identity";

      const name = document.createElement("strong");
      name.textContent = account.displayName;
      const role = document.createElement("span");
      role.textContent = getRoleLabel(account.role);
      const description = document.createElement("small");
      description.textContent = `${account.description} ${account.assignmentLabel}`;

      identity.append(name, role, description);
      card.append(identity);

      const action = document.createElement("button");
      action.type = "button";
      action.className = "demo-account-action";
      action.textContent = "Continue";
      action.dataset.demoAccount = account.accountId;
      action.setAttribute("aria-label", `Continue as ${account.displayName}`);
      card.append(action);
      return card;
    }));
}

function renderPortalOnboarding(session) {
  const onboarding = document.querySelector("#portal-onboarding");
  const status = document.querySelector("#portal-account-state");
  if (!onboarding || !status) {
    return;
  }

  onboarding.hidden = !session || !session.workspaceId;
  if (!session) {
    status.textContent = "Sign in or create a demo account to begin onboarding.";
    return;
  }

  status.textContent = session.workspaceId
    ? `${session.displayName} is active in ${session.workspaceName}.`
    : `${session.displayName} is signed in, but no active workspace membership is assigned yet. Create a workspace or request access to continue.`;
}

function renderWorkspaceSwitcher(session) {
  const container = document.querySelector("#workspace-switcher");
  if (!container) {
    return;
  }

  if (!session || !session.workspaceId) {
    container.hidden = true;
    container.replaceChildren();
    return;
  }

  const options = getWorkspaceOptions(session.accountId);
  if (!options.length) {
    container.hidden = true;
    container.replaceChildren();
    return;
  }

  container.hidden = false;
  container.replaceChildren();

  const title = document.createElement("div");
  title.className = "workspace-switcher-title";
  title.textContent = "Workspace access";
  container.appendChild(title);

  const list = document.createElement("div");
  list.className = "workspace-switch-list";

  options.forEach((workspace) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "workspace-switch-button";
    if (workspace.id === session.workspaceId) {
      button.classList.add("active");
    }
    button.textContent = workspace.name;
    button.addEventListener("click", () => {
      const nextSession = switchWorkspace(session.accountId, workspace.id);
      if (nextSession) {
        renderSession(nextSession);
      }
    });
    list.appendChild(button);
  });

  container.appendChild(list);
}

function renderSession(session) {
  const loginView = document.querySelector("#login-view");
  const productionSessionView = document.querySelector("#production-session-view");
  const demoPortal = document.querySelector("#demo-portal-view");
  const appShell = document.querySelector("#app-shell");
  const workspaceNameStrong = document.querySelector(".workspace-name strong");
  const workspaceNameSmall = document.querySelector(".workspace-name small");

  if (!session) {
    if (loginView) {
      loginView.hidden = false;
    }
    if (demoPortal) {
      demoPortal.hidden = true;
    }
    if (productionSessionView) {
      productionSessionView.hidden = true;
    }
    if (appShell) {
      appShell.hidden = true;
    }
    if (workspaceNameStrong) {
      workspaceNameStrong.textContent = "DEMO WORKSPACE";
    }
    if (workspaceNameSmall) {
      workspaceNameSmall.textContent = "Student Monitoring System";
    }
    renderWorkspaceSwitcher(null);
    document.title = "Sign in · Student Monitoring System";
    return;
  }

  if (!session.workspaceId) {
    renderPortalOnboarding(session);
    showDemoPortal();
    setLoginMessage("This demo account is not yet assigned to a workspace. Complete onboarding in the Demo Portal to continue.");
    return;
  }

  if (demoPortal) {
    demoPortal.hidden = true;
  }
  if (productionSessionView) {
    productionSessionView.hidden = true;
  }
  if (loginView) {
    loginView.hidden = true;
  }
  if (appShell) {
    appShell.hidden = false;
  }

  if (workspaceNameStrong) {
    workspaceNameStrong.textContent = session.workspaceName || "Workspace";
  }
  if (workspaceNameSmall) {
    workspaceNameSmall.textContent = `${session.role} · ${session.assignmentLabel}`;
  }

  const role = getRoleLabel(session.role);
  const overviewAvailable = canAccessView(role, "overview");
  const sidebarBrand = document.querySelector(".sidebar .brand");
  if (overviewAvailable) {
    sidebarBrand.dataset.view = "overview";
    sidebarBrand.setAttribute("href", "#");
    sidebarBrand.setAttribute("aria-label", "Student Monitoring System overview");
    sidebarBrand.removeAttribute("aria-disabled");
    sidebarBrand.removeAttribute("tabindex");
  } else {
    sidebarBrand.removeAttribute("data-view");
    sidebarBrand.removeAttribute("href");
    sidebarBrand.setAttribute("aria-label", "Student Monitoring System");
    sidebarBrand.setAttribute("aria-disabled", "true");
    sidebarBrand.setAttribute("tabindex", "-1");
  }

  document.querySelectorAll(".nav-link[data-view]").forEach((link) => {
    link.hidden = !canAccessView(role, link.dataset.view);
  });
  document.querySelectorAll("[data-navigation-group]").forEach((group) => {
    group.hidden = ![...group.querySelectorAll(".nav-link[data-view]")]
      .some((link) => !link.hidden);
  });

  const notificationButton = document.querySelector("#notification-button");
  if (notificationButton) {
    notificationButton.hidden = !canAccessView(role, "announcements");
  }
  document.querySelectorAll("[data-action='attendance']").forEach((shortcut) => {
    shortcut.hidden = !canAccessView(role, "attendance");
  });

  const profileName = document.querySelector("#profile-name");
  const profileRole = document.querySelector("#profile-role");
  const profileAssignment = document.querySelector("#profile-assignment");
  const demoAccessNotice = document.querySelector("#demo-access-notice");
  const profileAvatar = document.querySelector("#profile-avatar");

  if (profileName) {
    profileName.textContent = session.displayName;
  }
  if (profileRole) {
    profileRole.textContent = role;
  }
  if (profileAssignment) {
    profileAssignment.textContent = session.assignmentLabel;
  }
  if (demoAccessNotice) {
    demoAccessNotice.textContent = session.persistence === "memory"
      ? "This demo sign-in lasts only until this page is refreshed. Navigation presets are provisional; assignment-level and server-side permissions are not active."
      : `Workspace ${session.workspaceName || "Demo workspace"} is running in local demo mode. Navigation presets remain provisional and not approved for an operational deployment.`;
  }
  if (profileAvatar) {
    profileAvatar.textContent = session.displayName
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  renderWorkspaceSwitcher(session);
  setLoginMessage("Demo sign-ins and local workspace records are limited to the browser and remain provisional. Registration and workspace grant flows are demo-only and not connected to a live backend.");

  const firstView = getAllowedViews(role)[0];
  const firstViewTitle = firstView === "settings"
    ? "System Administration"
    : firstView === "alerts"
      ? "Early Warnings"
      : firstView.charAt(0).toUpperCase() + firstView.slice(1);
  document.title = `${firstViewTitle} · Student Monitoring System`;

  const firstNav = document.querySelector(`.nav-link[data-view="${firstView}"]`);
  if (firstNav) {
    firstNav.click();
  }
}

function bindDemoPortal() {
  const demoList = document.querySelector("#demo-account-list");
  if (demoList) {
    demoList.addEventListener("click", (event) => {
      const button = event.target.closest("[data-demo-account]");
      if (!button) {
        return;
      }
      const session = signInDemo(button.dataset.demoAccount);
      if (!session) {
        setLoginMessage("That demo account is unavailable.");
        return;
      }
      renderSession(session);
    });
  }

  const demoSigninForm = document.querySelector("#demo-signin-form");
  if (demoSigninForm) {
    demoSigninForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const email = String(formData.get("email") || "").trim();
      const password = String(formData.get("password") || "").trim();
      const session = signInWithCredentials(email, password);
      if (!session) {
        setLoginMessage("Unable to sign in to that demo account. Check the email/username and password and try again.");
        return;
      }
      renderSession(session);
    });
  }

  const demoRegisterForm = document.querySelector("#demo-register-form");
  if (demoRegisterForm) {
    demoRegisterForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const result = registerAccount({
        username: formData.get("username"),
        email: formData.get("email"),
        invitationCode: formData.get("invitationCode"),
        password: formData.get("password"),
        confirmPassword: formData.get("confirmPassword"),
      });
      if (!result.success) {
        setLoginMessage(result.message);
        return;
      }
      setLoginMessage(result.message);
      const session = signInWithCredentials(formData.get("email"), formData.get("password"));
      event.currentTarget.reset();
      if (session) {
        renderSession(session);
      }
    });
  }

  const joinForm = document.querySelector("#demo-workspace-join-form");
  if (joinForm) {
    joinForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const currentSession = getCurrentSession();
      if (!currentSession) {
        setLoginMessage("Sign in to a demo account before requesting workspace access.");
        return;
      }
      const formData = new FormData(event.currentTarget);
      const workspaceId = String(formData.get("workspaceId") || "").trim();
      const inviteCode = String(formData.get("inviteCode") || "").trim();
      const result = requestWorkspaceMembership({
        accountId: currentSession.accountId,
        workspaceId: workspaceId || null,
        inviteCode: inviteCode || null,
      });
      setLoginMessage(result.message);
      event.currentTarget.reset();
    });
  }

  const createWorkspaceForm = document.querySelector("#demo-workspace-create-form");
  if (createWorkspaceForm) {
    createWorkspaceForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const currentSession = getCurrentSession();
      if (!currentSession) {
        setLoginMessage("Sign in to a demo account before creating a workspace.");
        return;
      }
      const formData = new FormData(event.currentTarget);
      const result = createWorkspaceGrant({
        accountId: currentSession.accountId,
        workspaceName: formData.get("workspaceName"),
        grantCode: formData.get("grantCode"),
      });
      if (!result.success) {
        setLoginMessage(result.message);
        return;
      }
      event.currentTarget.reset();
      setLoginMessage(result.message);
      renderSession(switchWorkspace(currentSession.accountId, result.workspace.id));
    });
  }

  const returnButton = document.querySelector("#demo-return-login");
  if (returnButton) {
    returnButton.addEventListener("click", () => {
      showMainLogin("Demo Mode is a browser-local sandbox and does not provide live authentication or backend authorization.");
    });
  }

  const signOutButton = document.querySelector("#sign-out-button");
  if (signOutButton) {
    signOutButton.addEventListener("click", () => {
      const cleared = signOutDemo();
      renderSession(null);
      showMainLogin(cleared
        ? "You have signed out of the demo session. Production sign-in remains not configured."
        : "You left the demo session, but the browser could not clear the saved demo session.");
    });
  }
}

function setFormBusy(form, busy, busyLabel) {
  const button = form.querySelector('button[type="submit"]');
  if (!button) {
    return;
  }
  if (busy) {
    button.dataset.idleLabel = button.textContent;
    button.textContent = busyLabel;
  } else {
    button.textContent = button.dataset.idleLabel || button.textContent;
    delete button.dataset.idleLabel;
  }
  button.disabled = busy;
  form.setAttribute("aria-busy", String(busy));
}

function renderProductionSession(user, message = "", passwordRecovery = false) {
  activeProductionUser = user || null;
  passwordRecoveryActive = passwordRecovery;
  const loginView = document.querySelector("#login-view");
  const productionSessionView = document.querySelector("#production-session-view");
  const demoPortal = document.querySelector("#demo-portal-view");
  const appShell = document.querySelector("#app-shell");
  const title = document.querySelector("#production-session-title");
  const email = document.querySelector("#production-account-email");
  const status = document.querySelector("#production-session-message");
  const resetForm = document.querySelector("#production-reset-password-form");

  if (loginView) loginView.hidden = true;
  if (demoPortal) demoPortal.hidden = true;
  if (appShell) appShell.hidden = true;
  if (productionSessionView) productionSessionView.hidden = false;
  if (title) title.textContent = passwordRecovery ? "Set a new password" : "Account signed in";
  if (email) email.textContent = user?.email || "";
  if (status) status.textContent = message;
  if (resetForm) resetForm.hidden = !passwordRecovery;
  document.title = `${passwordRecovery ? "Set password" : "Account"} · Student Monitoring System`;
}

function bindProductionAuth(client) {
  const loginForm = document.querySelector("#main-login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(loginForm);
      const email = String(formData.get("email") || "").trim();
      const password = String(formData.get("password") || "");
      if (!email || !password) {
        setLoginMessage("Enter your email and password.");
        return;
      }

      const demoMatch = getDemoAccounts().find((account) => account.available && (
        account.email.toLowerCase() === email.toLowerCase() || account.username.toLowerCase() === email.toLowerCase()
      ));
      if (demoMatch && demoMatch.passwordHash === awaitHashValue(password)) {
        setLoginMessage("Demo accounts are reserved for the separate Demo Portal. Use the Enter Demo Mode button to continue.");
        return;
      }

      if (!client) {
        const configurationError = getProductionAuthConfigurationError();
        setLoginMessage(configurationError
          ? `Production authentication configuration error: ${configurationError}`
          : "Production sign-in is unavailable because Supabase is not configured. Configure the public project URL and publishable key to enable authentication.");
        return;
      }

      setFormBusy(loginForm, true, "Signing in…");
      try {
        const { data, error } = await client.auth.signInWithPassword({ email, password });
        if (error) {
          setLoginMessage(`Unable to sign in: ${error.message}`);
          return;
        }
        if (!data.session) {
          setLoginMessage("Sign-in was received, but no active session was returned. Check the email confirmation settings for this deployment.");
        }
      } catch (error) {
        setLoginMessage(`Sign-in failed: ${error instanceof Error ? error.message : "Unexpected authentication error."}`);
      } finally {
        setFormBusy(loginForm, false, "Signing in…");
      }
    });
  }

  const forgotPasswordButton = document.querySelector("#forgot-password-button");
  if (forgotPasswordButton) {
    forgotPasswordButton.addEventListener("click", async () => {
      const email = String(document.querySelector("#main-login-email")?.value || "").trim();
      if (!email) {
        setLoginMessage("Enter your account email first, then choose Forgot password.");
        document.querySelector("#main-login-email")?.focus();
        return;
      }
      if (!client) {
        const configurationError = getProductionAuthConfigurationError();
        setLoginMessage(configurationError
          ? `Password recovery is unavailable: ${configurationError}`
          : "Password recovery is unavailable because Supabase is not configured.");
        return;
      }

      forgotPasswordButton.disabled = true;
      try {
        const { error } = await client.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + window.location.pathname,
        });
        if (error) {
          setLoginMessage(`Password recovery could not be started: ${error.message}`);
          return;
        }
        setLoginMessage("If an account exists for that email, a password recovery link will be sent. Complete the update from the link in this browser.");
      } catch (error) {
        setLoginMessage(`Password recovery failed: ${error instanceof Error ? error.message : "Unexpected authentication error."}`);
      } finally {
        forgotPasswordButton.disabled = false;
      }
    });
  }

  const createAccountButton = document.querySelector("#create-account-button");
  if (createAccountButton) {
    createAccountButton.addEventListener("click", () => {
      setLoginMessage("Production registration is not enabled. It requires a trusted invitation-validation backend; demo registration is available only in the separate Demo Portal.");
    });
  }

  const resetForm = document.querySelector("#production-reset-password-form");
  if (resetForm) {
    resetForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const password = String(new FormData(resetForm).get("password") || "");
      if (!password) {
        setLoginMessage("Enter a new password.");
        return;
      }
      setFormBusy(resetForm, true, "Updating…");
      try {
        const { error } = await client.auth.updateUser({ password });
        if (error) {
          renderProductionSession(activeProductionUser, `Password update failed: ${error.message}`, true);
          return;
        }
        resetForm.reset();
        renderProductionSession(activeProductionUser, "Your password was updated.", false);
      } catch (error) {
        renderProductionSession(activeProductionUser, `Password update failed: ${error instanceof Error ? error.message : "Unexpected authentication error."}`, true);
      } finally {
        setFormBusy(resetForm, false, "Updating…");
      }
    });
  }

  const signOutButton = document.querySelector("#production-sign-out-button");
  if (signOutButton) {
    signOutButton.addEventListener("click", async () => {
      signOutButton.disabled = true;
      try {
        const { error } = await client.auth.signOut();
        if (error) {
          const user = (await client.auth.getUser()).data.user;
          renderProductionSession(user, `Sign-out failed: ${error.message}`);
          return;
        }
        showMainLogin("You have signed out of the authenticated account.");
      } catch (error) {
        renderProductionSession(activeProductionUser, `Sign-out failed: ${error instanceof Error ? error.message : "Unexpected authentication error."}`);
      } finally {
        signOutButton.disabled = false;
      }
    });
  }
}

export async function initializeAuthShell() {
  renderAccounts();
  bindDemoPortal();
  renderSession(null);
  const client = getProductionAuthClient();
  bindProductionAuth(client);

  const loginIntro = document.querySelector("#production-login-intro");
  if (loginIntro) {
    const configurationError = getProductionAuthConfigurationError();
    loginIntro.textContent = configurationError
      ? `Production authentication is unavailable: ${configurationError}`
      : isProductionAuthConfigured()
      ? "Sign in with your account. Workspace membership and student-record access are not enabled until the backend authorization layer is configured."
      : "Production sign-in requires Supabase configuration. Workspace authorization and student-record access are not available yet.";
  }

  const enterDemoModeButton = document.querySelector("#enter-demo-mode");
  if (enterDemoModeButton) {
    enterDemoModeButton.addEventListener("click", () => {
      showDemoPortal();
      renderPortalOnboarding(getCurrentSession());
      setLoginMessage("This Demo Environment uses fictional accounts and local browser-only records.");
    });
  }

  const demoReturnLogin = document.querySelector("#demo-return-login");
  if (demoReturnLogin) {
    demoReturnLogin.addEventListener("click", () => {
      showMainLogin("Demo Mode is a sandbox only. Real authentication and authorization are not active.");
    });
  }

  if (!client) {
    renderSession(getCurrentSession());
    return;
  }

  client.auth.onAuthStateChange((event, session) => {
    if (session) {
      renderProductionSession(session.user, "", event === "PASSWORD_RECOVERY");
    } else if (event === "SIGNED_OUT") {
      activeProductionUser = null;
      showMainLogin("You have signed out of the authenticated account.");
    }
  });

  try {
    const { data, error } = await client.auth.getSession();
    if (error) {
      showMainLogin(`Unable to restore the authentication session: ${error.message}`);
      return;
    }
    if (data.session) {
      renderProductionSession(data.session.user, "", passwordRecoveryActive);
    } else {
      renderSession(getCurrentSession());
    }
  } catch (error) {
    showMainLogin(`Unable to initialize production authentication: ${error instanceof Error ? error.message : "Unexpected authentication error."}`);
  }
}

function awaitHashValue(value) {
  const stringValue = String(value || "").trim().toLowerCase();
  let hash = 2166136261;
  for (let index = 0; index < stringValue.length; index += 1) {
    hash ^= stringValue.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}
