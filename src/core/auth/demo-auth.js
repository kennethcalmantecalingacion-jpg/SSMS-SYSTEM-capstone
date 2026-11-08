const demoSessionKey = "student-monitoring-system.demo-session.v1";
const demoSessionMigrationKey = "student-monitoring-system.demo-session-migration.v1";
// Read-only compatibility source; keep it so the prior session remains recoverable.
const legacyDemoSessionKey = "lnhs-smart-student-monitoring.demo-session.v1";
const demoSessionVersion = 1;
const accountRegistryKey = "student-monitoring-system.accounts.v1";
const workspaceRegistryKey = "student-monitoring-system.workspaces.v1";
const invitationRegistryKey = "student-monitoring-system.registration-invites.v1";
const workspaceGrantRegistryKey = "student-monitoring-system.workspace-grants.v1";

const demoWorkspaceId = "workspace-boter-school";
const platformDefaultInviteCode = "DEMO-INVITE-2024";
const platformDefaultGrantCode = "DEMO-WORKSPACE-GRANT-2024";

function hashValue(value) {
  const text = String(value || "").trim().toLowerCase();
  if (!text) {
    return "";
  }

  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

function readLocalJSON(key, fallbackValue) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) {
      return fallbackValue;
    }
    return JSON.parse(raw);
  } catch {
    return fallbackValue;
  }
}

function writeLocalJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeUsername(value) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, 36);
}

const demoAccounts = [
  {
    accountId: "demo-teacher",
    displayName: "Demo Teacher",
    username: "demo-teacher",
    email: "teacher@boter.local",
    passwordHash: hashValue("password"),
    role: "Teacher",
    assignmentLabel: "Grade 7-A · English",
    description: "Explore the teacher workspace with a sample teaching assignment.",
    available: true,
    accountType: "demo",
  },
  {
    accountId: "demo-adviser",
    displayName: "Demo Adviser",
    username: "demo-adviser",
    email: "adviser@boter.local",
    passwordHash: hashValue("password"),
    role: "Adviser",
    assignmentLabel: "Grade 8-A",
    description: "Explore the adviser workspace with a sample advisory assignment.",
    available: true,
    accountType: "demo",
  },
  {
    accountId: "demo-guidance-counselor",
    displayName: "Demo Guidance Counselor",
    username: "demo-guidance-counselor",
    email: "counselor@boter.local",
    passwordHash: hashValue("password"),
    role: "Guidance Counselor",
    assignmentLabel: "Assigned demo referral scope",
    description: "Explore the guidance demonstration navigation.",
    available: true,
    accountType: "demo",
  },
  {
    accountId: "demo-system-administrator",
    displayName: "Demo System Administrator",
    username: "demo-system-admin",
    email: "admin@boter.local",
    passwordHash: hashValue("password"),
    role: "Designated System Administrator",
    assignmentLabel: "Technical and account administration",
    description: "Explore technical and account administration navigation.",
    available: true,
    accountType: "demo",
  },
  {
    accountId: "demo-parent-guardian",
    displayName: "Parent/Guardian",
    username: "demo-parent-guardian",
    email: "parent@boter.local",
    passwordHash: hashValue("password"),
    role: "Parent/Guardian",
    assignmentLabel: "Unavailable",
    description: "Activation is unavailable until configured for a deployment.",
    available: false,
    accountType: "demo",
  },
];

let memorySession = null;

function getRegisteredAccounts() {
  return readLocalJSON(accountRegistryKey, []);
}

function setRegisteredAccounts(accounts) {
  writeLocalJSON(accountRegistryKey, accounts);
}

function getWorkspaces() {
  return readLocalJSON(workspaceRegistryKey, []);
}

function setWorkspaces(workspaces) {
  writeLocalJSON(workspaceRegistryKey, workspaces);
}

function getInvitationCodes() {
  return readLocalJSON(invitationRegistryKey, []);
}

function setInvitationCodes(codes) {
  writeLocalJSON(invitationRegistryKey, codes);
}

function getWorkspaceGrants() {
  return readLocalJSON(workspaceGrantRegistryKey, []);
}

function setWorkspaceGrants(grants) {
  writeLocalJSON(workspaceGrantRegistryKey, grants);
}

function seedWorkspaceData() {
  const workspaces = getWorkspaces();
  if (workspaces.length === 0) {
    setWorkspaces([
      {
        id: demoWorkspaceId,
        name: "Boter School",
        ownerId: "demo-admin",
        createdAt: Date.now(),
        members: [
          { accountId: "demo-teacher", role: "Teacher", assignmentLabel: "Grade 7-A · English", status: "active" },
          { accountId: "demo-adviser", role: "Adviser", assignmentLabel: "Grade 8-A", status: "active" },
          { accountId: "demo-guidance-counselor", role: "Guidance Counselor", assignmentLabel: "Assigned demo referral scope", status: "active" },
          { accountId: "demo-system-administrator", role: "Designated System Administrator", assignmentLabel: "Technical and account administration", status: "active" },
        ],
      },
    ]);
  }

  const invites = getInvitationCodes();
  if (!invites.some((entry) => entry.code === platformDefaultInviteCode)) {
    invites.push({
      code: platformDefaultInviteCode,
      status: "active",
      createdAt: Date.now(),
      expiresAt: null,
      usageLimit: 50,
      redemptionCount: 0,
      emailRestricted: null,
    });
    setInvitationCodes(invites);
  }

  const grants = getWorkspaceGrants();
  if (!grants.some((entry) => entry.code === platformDefaultGrantCode)) {
    grants.push({
      code: platformDefaultGrantCode,
      status: "active",
      createdAt: Date.now(),
      expiresAt: null,
      singleUse: true,
      usedBy: null,
    });
    setWorkspaceGrants(grants);
  }
}

function getWorkspaceMembership(accountId) {
  const memberships = getWorkspaces().flatMap((workspace) => workspace.members
    .filter((member) => member.accountId === accountId)
    .map((member) => ({ ...member, workspaceId: workspace.id, workspaceName: workspace.name })));
  return memberships[0] || null;
}

function getAccount(accountId) {
  return [...demoAccounts, ...getRegisteredAccounts()].find((account) => account.accountId === accountId && account.available !== false);
}

function createSession(account, persistence = "tab", workspaceMembership = null) {
  const role = workspaceMembership?.role || account.role || "Teacher";
  const assignmentLabel = workspaceMembership?.assignmentLabel || account.assignmentLabel || "Workspace member";
  const workspaceName = workspaceMembership?.workspaceName || "Boter School";
  const workspaceId = workspaceMembership?.workspaceId || demoWorkspaceId;
  return {
    accountId: account.accountId,
    displayName: account.displayName,
    role,
    assignmentLabel,
    workspaceId,
    workspaceName,
    persistence,
    accountType: account.accountType || "registered",
  };
}

export function getDemoAccounts() {
  seedWorkspaceData();
  return demoAccounts.map((account) => ({ ...account }));
}

export function getCurrentSession() {
  try {
    let storedValue = sessionStorage.getItem(demoSessionKey);
    const migrateLegacySession = storedValue === null;
    if (migrateLegacySession && sessionStorage.getItem(demoSessionMigrationKey) !== "1") {
      storedValue = sessionStorage.getItem(legacyDemoSessionKey);
    }
    if (storedValue === null) {
      return memorySession;
    }

    const stored = JSON.parse(storedValue);
    if (!stored || typeof stored !== "object"
      || stored.version !== demoSessionVersion
      || typeof stored.accountId !== "string") {
      sessionStorage.removeItem(demoSessionKey);
      memorySession = null;
      return null;
    }

    const account = getAccount(stored.accountId);
    if (!account) {
      sessionStorage.removeItem(demoSessionKey);
      memorySession = null;
      return null;
    }

    memorySession = createSession(account, "tab", getWorkspaceMembership(stored.accountId));
    if (migrateLegacySession) {
      sessionStorage.setItem(demoSessionKey, JSON.stringify({
        version: demoSessionVersion,
        accountId: account.accountId,
      }));
      sessionStorage.setItem(demoSessionMigrationKey, "1");
    }
    return memorySession;
  } catch {
    return memorySession;
  }
}

export function signInDemo(accountId) {
  const account = getAccount(accountId);
  if (!account) {
    return null;
  }

  const workspaceMembership = getWorkspaceMembership(account.accountId);
  memorySession = createSession(account, "tab", workspaceMembership);
  try {
    sessionStorage.setItem(demoSessionKey, JSON.stringify({
      version: demoSessionVersion,
      accountId: account.accountId,
    }));
  } catch {
    memorySession = createSession(account, "memory", workspaceMembership);
  }
  return memorySession;
}

export function signInWithCredentials(email, password) {
  const normalizedEmail = normalizeEmail(email);
  const allAccounts = [...demoAccounts, ...getRegisteredAccounts()];
  const account = allAccounts.find((entry) => normalizeEmail(entry.email) === normalizedEmail && entry.available !== false);
  if (!account) {
    return null;
  }

  const submittedHash = hashValue(typeof password === "string" ? password : "");
  if ((account.passwordHash || "") !== submittedHash) {
    return null;
  }

  const workspaceMembership = getWorkspaceMembership(account.accountId);
  const session = createSession(account, "tab", workspaceMembership);
  memorySession = session;
  try {
    sessionStorage.setItem(demoSessionKey, JSON.stringify({
      version: demoSessionVersion,
      accountId: account.accountId,
    }));
  } catch {
    memorySession = createSession(account, "memory", workspaceMembership);
  }
  return memorySession;
}

export function registerAccount({ username, email, invitationCode, password }) {
  const trimmedUsername = normalizeUsername(username);
  const trimmedEmail = normalizeEmail(email);
  const trimmedCode = String(invitationCode || "").trim();
  const trimmedPassword = String(password || "").trim();

  if (!trimmedUsername || !trimmedEmail || !trimmedCode || !trimmedPassword) {
    return { success: false, message: "Username, email, invitation code, and password are required." };
  }

  const allAccounts = [...demoAccounts, ...getRegisteredAccounts()];
  if (allAccounts.some((account) => normalizeEmail(account.email) === trimmedEmail)) {
    return { success: false, message: "That email is already in use." };
  }

  if (allAccounts.some((account) => normalizeUsername(account.username || account.displayName) === trimmedUsername)) {
    return { success: false, message: "That username is already in use." };
  }

  const codeMatches = getInvitationCodes().find((entry) => entry.code === trimmedCode && entry.status === "active");
  if (!codeMatches) {
    return { success: false, message: "The registration invitation code is invalid or no longer active." };
  }

  if (codeMatches.emailRestricted && codeMatches.emailRestricted !== trimmedEmail) {
    return { success: false, message: "This invitation code is restricted to a different email address." };
  }

  if (codeMatches.usageLimit && codeMatches.redemptionCount >= codeMatches.usageLimit) {
    return { success: false, message: "This invitation code has reached its usage limit." };
  }

  if (codeMatches.expiresAt && Number(codeMatches.expiresAt) < Date.now()) {
    return { success: false, message: "This invitation code has expired." };
  }

  const account = {
    accountId: `user-${Date.now().toString(36)}`,
    displayName: trimmedUsername,
    username: trimmedUsername,
    email: trimmedEmail,
    passwordHash: hashValue(trimmedPassword),
    role: "Teacher",
    assignmentLabel: "Workspace member",
    description: "Account created through the registration flow.",
    available: true,
    accountType: "registered",
    createdAt: Date.now(),
    profileComplete: false,
  };

  const registeredAccounts = getRegisteredAccounts();
  registeredAccounts.push(account);
  setRegisteredAccounts(registeredAccounts);

  codeMatches.redemptionCount = (codeMatches.redemptionCount || 0) + 1;
  setInvitationCodes(getInvitationCodes().map((entry) => entry.code === trimmedCode ? codeMatches : entry));

  return {
    success: true,
    account,
    message: "Account created. You can now sign in to access your workspaces.",
  };
}

export function getWorkspaceMembers(workspaceId) {
  const workspace = getWorkspaces().find((entry) => entry.id === workspaceId);
  return workspace ? workspace.members : [];
}

export function getWorkspaceOptions(accountId) {
  seedWorkspaceData();
  const userWorkspaces = getWorkspaces().filter((workspace) => workspace.members.some((member) => member.accountId === accountId));
  return userWorkspaces.map((workspace) => ({
    id: workspace.id,
    name: workspace.name,
    ownerId: workspace.ownerId,
    members: workspace.members,
  }));
}

export function switchWorkspace(accountId, workspaceId) {
  const account = getAccount(accountId);
  if (!account) {
    return null;
  }
  const workspace = getWorkspaces().find((entry) => entry.id === workspaceId);
  const membership = workspace?.members.find((member) => member.accountId === accountId) || null;
  const session = createSession(account, "tab", membership ? {
    ...membership,
    workspaceId: workspace.id,
    workspaceName: workspace.name,
  } : getWorkspaceMembership(accountId));
  memorySession = session;
  try {
    sessionStorage.setItem(demoSessionKey, JSON.stringify({
      version: demoSessionVersion,
      accountId: account.accountId,
    }));
  } catch {
    return session;
  }
  return session;
}

export function createWorkspaceGrant({ accountId, workspaceName, grantCode }) {
  const account = getAccount(accountId);
  if (!account) {
    return { success: false, message: "You must be signed in before creating a workspace." };
  }

  const normalizedName = String(workspaceName || "").trim();
  const trimmedGrant = String(grantCode || "").trim();
  if (!normalizedName || !trimmedGrant) {
    return { success: false, message: "Workspace name and workspace creation grant are required." };
  }

  const availableGrant = getWorkspaceGrants().find((entry) => entry.code === trimmedGrant && entry.status === "active");
  if (!availableGrant) {
    return { success: false, message: "That workspace creation grant is invalid or no longer active." };
  }

  if (availableGrant.singleUse && availableGrant.usedBy) {
    return { success: false, message: "That workspace creation grant has already been used." };
  }

  const newWorkspace = {
    id: `workspace-${Date.now().toString(36)}`,
    name: normalizedName,
    ownerId: account.accountId,
    createdAt: Date.now(),
    members: [
      { accountId: account.accountId, role: "Workspace Owner", assignmentLabel: "Workspace owner", status: "active" },
    ],
  };

  const workspaces = getWorkspaces();
  workspaces.push(newWorkspace);
  setWorkspaces(workspaces);

  availableGrant.usedBy = account.accountId;
  availableGrant.status = "consumed";
  setWorkspaceGrants(getWorkspaceGrants().map((grant) => grant.code === trimmedGrant ? availableGrant : grant));

  return {
    success: true,
    workspace: newWorkspace,
    message: `Workspace “${normalizedName}” was created successfully.`,
  };
}

export function getWorkspaceGrantStatus() {
  return getWorkspaceGrants().map((grant) => ({
    code: grant.code,
    status: grant.status,
    usedBy: grant.usedBy,
    singleUse: grant.singleUse,
  }));
}

export function signOutDemo() {
  memorySession = null;
  try {
    sessionStorage.removeItem(demoSessionKey);
    sessionStorage.setItem(demoSessionMigrationKey, "1");
    return true;
  } catch {
    return false;
  }
}
