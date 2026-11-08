import { getCurrentSession, getDemoAccounts, signInDemo, signOutDemo } from "../core/auth/demo-auth.js";
import { canAccessView, getRoleLabel } from "../core/access/role-access.js";

function setLoginMessage(message) {
  document.querySelector("#login-message").textContent = message;
}

function renderAccounts() {
  const list = document.querySelector("#demo-account-list");
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

function renderSession(session) {
  const loginView = document.querySelector("#login-view");
  const appShell = document.querySelector("#app-shell");
  if (!session) {
    appShell.hidden = true;
    loginView.hidden = false;
    document.title = "Sign in · LNHS Monitoring System";
    return;
  }

  const role = getRoleLabel(session.role);
  document.querySelectorAll(".nav-link[data-view]").forEach((link) => {
    link.hidden = !canAccessView(role, link.dataset.view);
  });
  document.querySelectorAll("[data-navigation-group]").forEach((group) => {
    group.hidden = ![...group.querySelectorAll(".nav-link[data-view]")]
      .some((link) => !link.hidden);
  });

  document.querySelector("#profile-name").textContent = session.displayName;
  document.querySelector("#profile-role").textContent = role;
  document.querySelector("#profile-assignment").textContent = session.assignmentLabel;
  document.querySelector("#demo-access-notice").textContent = session.persistence === "memory"
    ? "This demo sign-in lasts only until this page is refreshed. Navigation presets are provisional; assignment-level and server-side permissions are not active."
    : "Demo mode uses fictional records. Navigation presets are provisional, not school-approved; assignment-level and server-side permissions are not active.";
  document.querySelector("#profile-avatar").textContent = session.displayName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  loginView.hidden = true;
  appShell.hidden = false;
  setLoginMessage("Demo accounts and records are fictional. Navigation presets are provisional, not school-approved; assignment-level isolation and server-side permissions are future work.");
  if (session.persistence === "memory") {
    setLoginMessage("This browser tab cannot retain the demo sign-in after refresh. Navigation presets are provisional; assignment-level and server-side permissions are future work.");
  }
  document.title = "Overview · LNHS Monitoring System";
  document.querySelector('.nav-link[data-view="overview"]').click();
}

export function initializeAuthShell() {
  renderAccounts();
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
