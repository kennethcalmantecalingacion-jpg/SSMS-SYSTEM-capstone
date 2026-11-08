import {
  createWorkspaceGrant,
  getCurrentSession,
  getDemoAccounts,
  getWorkspaceOptions,
  registerAccount,
  signInDemo,
  signInWithCredentials,
  signOutDemo,
  switchWorkspace,
} from "../core/auth/demo-auth.js";
import { canAccessView, getAllowedViews, getRoleLabel } from "../core/access/role-access.js";

function setLoginMessage(message) {
  const loginMessage = document.querySelector("#login-message");
  if (loginMessage) {
    loginMessage.textContent = message;
  }
}

function renderAccounts() {
  const list = document.querySelector("#demo-account-list");
  if (!list) {
    return;
  }
  list.replaceChildren(...getDemoAccounts().map((account) => {
    const card = document.createElement("article");
    card.className = `demo-account${account.available ? "" : " demo-account-disabled"}`;

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
    action.textContent = account.available ? "Continue" : "Unavailable";
    action.setAttribute("aria-label", account.available
      ? `Continue as ${account.displayName}`
      : `${account.displayName} unavailable`);
    action.disabled = !account.available;
    if (account.available) {
      action.dataset.demoAccount = account.accountId;
    } else {
      action.setAttribute("aria-describedby", "login-message");
    }
    card.append(action);
    return card;
  }));
}

function ensureAuthForms() {
  const card = document.querySelector(".login-card");
  if (!card || card.querySelector("#auth-form-panel")) {
    return;
  }

  const panel = document.createElement("div");
  panel.id = "auth-form-panel";
  panel.className = "auth-form-panel";
  panel.innerHTML = `
    <div class="auth-tabs" aria-label="Authentication options">
      <button class="auth-tab active" type="button" data-auth-tab="signin">Sign in</button>
      <button class="auth-tab" type="button" data-auth-tab="register">Create account</button>
      <button class="auth-tab" type="button" data-auth-tab="grant">Workspace grant</button>
    </div>
    <form id="sign-in-form" class="auth-form">
      <div class="auth-field-row">
        <label class="auth-field">
          <span>Email</span>
          <input id="sign-in-email" name="email" type="email" placeholder="you@workspace.example" autocomplete="email" required>
        </label>
      </div>
      <div class="auth-field-row">
        <label class="auth-field">
          <span>Password</span>
          <input id="sign-in-password" name="password" type="password" placeholder="Enter password" autocomplete="current-password" required>
        </label>
      </div>
      <button class="button button-primary auth-submit" type="submit">Sign in</button>
    </form>
    <form id="register-form" class="auth-form" hidden>
      <div class="auth-field-row">
        <label class="auth-field">
          <span>Username</span>
          <input id="register-username" name="username" type="text" placeholder="janedoe" maxlength="36" required>
        </label>
      </div>
      <div class="auth-field-row">
        <label class="auth-field">
          <span>Email</span>
          <input id="register-email" name="email" type="email" placeholder="you@workspace.example" autocomplete="email" required>
        </label>
      </div>
      <div class="auth-field-row">
        <label class="auth-field">
          <span>Registration invitation code</span>
          <input id="register-code" name="invitationCode" type="text" placeholder="DEMO-INVITE-2024" required>
        </label>
      </div>
      <div class="auth-field-row">
        <label class="auth-field">
          <span>Password</span>
          <input id="register-password" name="password" type="password" placeholder="Create a password" autocomplete="new-password" required>
        </label>
      </div>
      <button class="button button-primary auth-submit" type="submit">Create account</button>
    </form>
    <form id="workspace-grant-form" class="auth-form" hidden>
      <div class="auth-field-row">
        <label class="auth-field">
          <span>Workspace name</span>
          <input id="workspace-name" name="workspaceName" type="text" placeholder="Example Workspace" maxlength="80" required>
        </label>
      </div>
      <div class="auth-field-row">
        <label class="auth-field">
          <span>Workspace creation grant</span>
          <input id="workspace-grant-code" name="grantCode" type="text" placeholder="DEMO-WORKSPACE-GRANT-2024" required>
        </label>
      </div>
      <button class="button button-primary auth-submit" type="submit">Create workspace</button>
    </form>
    <div id="workspace-switcher" class="workspace-switcher" hidden></div>
  `;
  card.append(panel);

  panel.querySelectorAll(".auth-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      const selected = tab.dataset.authTab;
      panel.querySelectorAll(".auth-tab").forEach((item) => item.classList.toggle("active", item === tab));
      panel.querySelectorAll(".auth-form").forEach((form) => {
        const expectedForm = selected === "signin"
          ? "sign-in-form"
          : selected === "register"
            ? "register-form"
            : "workspace-grant-form";
        form.hidden = form.id !== expectedForm;
      });
    });
  });

  panel.querySelector("#sign-in-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "").trim();
    const session = signInWithCredentials(email, password);
    if (!session) {
      setLoginMessage("Sign-in failed. Check the email and password for the account or try one of the seeded demo accounts.");
      return;
    }
    renderSession(session);
  });

  panel.querySelector("#register-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const result = registerAccount({
      username: formData.get("username"),
      email: formData.get("email"),
      invitationCode: formData.get("invitationCode"),
      password: formData.get("password"),
    });
    if (!result.success) {
      setLoginMessage(result.message);
      return;
    }
    setLoginMessage(result.message);
    event.currentTarget.reset();
  });

  panel.querySelector("#workspace-grant-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const currentSession = getCurrentSession();
    if (!currentSession) {
      setLoginMessage("You must sign in before creating a workspace.");
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

function renderWorkspaceSwitcher(session) {
  const container = document.querySelector("#workspace-switcher");
  if (!container) {
    return;
  }
  if (!session) {
    container.hidden = true;
    container.innerHTML = "";
    return;
  }

  const options = getWorkspaceOptions(session.accountId);
  if (!options.length) {
    container.hidden = true;
    container.innerHTML = "";
    return;
  }

  container.hidden = false;
  container.innerHTML = `
    <div class="workspace-switcher-title">Workspace access</div>
    <div class="workspace-switch-list">${options.map((workspace) => `
      <button class="workspace-switch-button${workspace.id === session.workspaceId ? " active" : ""}" type="button" data-workspace-id="${workspace.id}">
        ${workspace.name}
      </button>
    `).join("")}</div>
  `;

  container.querySelectorAll("[data-workspace-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextSession = switchWorkspace(session.accountId, button.dataset.workspaceId);
      if (nextSession) {
        renderSession(nextSession);
      }
    });
  });
}

function renderSession(session) {
  ensureAuthForms();
  const loginView = document.querySelector("#login-view");
  const appShell = document.querySelector("#app-shell");
  const workspaceNameStrong = document.querySelector(".workspace-name strong");
  const workspaceNameSmall = document.querySelector(".workspace-name small");

  if (!session) {
    appShell.hidden = true;
    loginView.hidden = false;
    if (workspaceNameStrong) {
      workspaceNameStrong.textContent = "DEMO WORKSPACE";
    }
    if (workspaceNameSmall) {
      workspaceNameSmall.textContent = "Student Monitoring System";
    }
    document.title = "Sign in · Student Monitoring System";
    renderWorkspaceSwitcher(null);
    return;
  }

  if (workspaceNameStrong) {
    workspaceNameStrong.textContent = session.workspaceName || "Boter School";
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
  document.querySelector("#notification-button").hidden = !canAccessView(role, "announcements");
  document.querySelectorAll("[data-action='attendance']").forEach((shortcut) => {
    shortcut.hidden = !canAccessView(role, "attendance");
  });

  document.querySelector("#profile-name").textContent = session.displayName;
  document.querySelector("#profile-role").textContent = role;
  document.querySelector("#profile-assignment").textContent = session.assignmentLabel;
  document.querySelector("#demo-access-notice").textContent = session.persistence === "memory"
    ? "This demo sign-in lasts only until this page is refreshed. Navigation presets are provisional; assignment-level and server-side permissions are not active."
    : `Workspace ${session.workspaceName || "Boter School"} is running in local demo mode. Navigation presets remain provisional and not approved for an operational deployment.`;
  document.querySelector("#profile-avatar").textContent = session.displayName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  loginView.hidden = true;
  appShell.hidden = false;
  renderWorkspaceSwitcher(session);
  setLoginMessage("Demo sign-ins and local workspace records are limited to the browser and remain provisional. Registration and workspace grant flows are demo-only and not connected to a live backend.");
  const firstView = getAllowedViews(role)[0];
  const firstViewTitle = firstView === "settings"
    ? "System Administration"
    : firstView === "alerts"
      ? "Early Warnings"
      : firstView.charAt(0).toUpperCase() + firstView.slice(1);
  document.title = `${firstViewTitle} · Student Monitoring System`;
  document.querySelector(`.nav-link[data-view="${firstView}"]`).click();
}

export function initializeAuthShell() {
  renderAccounts();
  ensureAuthForms();
  renderSession(getCurrentSession());

  document.querySelector("#demo-account-list").addEventListener("click", (event) => {
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

  document.querySelector("#sign-out-button").addEventListener("click", () => {
    const cleared = signOutDemo();
    renderSession(null);
    setLoginMessage(cleared
      ? "You have signed out of this demo session."
      : "You have left this demo session, but this tab could not clear its saved session.");
  });
}
