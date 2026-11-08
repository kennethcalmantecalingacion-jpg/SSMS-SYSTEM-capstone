const demoSessionKey = "student-monitoring-system.demo-session.v1";
const demoSessionMigrationKey = "student-monitoring-system.demo-session-migration.v1";
// Read-only compatibility source; keep it so the prior session remains recoverable.
const legacyDemoSessionKey = "lnhs-smart-student-monitoring.demo-session.v1";
const demoSessionVersion = 1;

const demoAccounts = [
  {
    accountId: "demo-teacher",
    displayName: "Demo Teacher",
    role: "Teacher",
    assignmentLabel: "Grade 7-A · English",
    description: "Explore the teacher workspace with a sample teaching assignment.",
    available: true,
  },
  {
    accountId: "demo-adviser",
    displayName: "Demo Adviser",
    role: "Adviser",
    assignmentLabel: "Grade 8-A",
    description: "Explore the adviser workspace with a sample advisory assignment.",
    available: true,
  },
  {
    accountId: "demo-guidance-counselor",
    displayName: "Demo Guidance Counselor",
    role: "Guidance Counselor",
    assignmentLabel: "Assigned demo referral scope",
    description: "Explore the guidance demonstration navigation.",
    available: true,
  },
  {
    accountId: "demo-system-administrator",
    displayName: "Demo System Administrator",
    role: "Designated System Administrator",
    assignmentLabel: "Technical and account administration",
    description: "Explore technical and account administration navigation.",
    available: true,
  },
  {
    accountId: "demo-parent-guardian",
    displayName: "Parent/Guardian",
    role: "Parent/Guardian",
    assignmentLabel: "Unavailable",
    description: "Activation is unavailable until configured for a deployment.",
    available: false,
  },
];

let memorySession = null;

function createSession(account, persistence = "tab") {
  return {
    accountId: account.accountId,
    displayName: account.displayName,
    role: account.role,
    assignmentLabel: account.assignmentLabel,
    persistence,
  };
}

function getAccount(accountId) {
  return demoAccounts.find((account) => account.accountId === accountId && account.available);
}

export function getDemoAccounts() {
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

    memorySession = createSession(account);
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

  memorySession = createSession(account);
  try {
    sessionStorage.setItem(demoSessionKey, JSON.stringify({
      version: demoSessionVersion,
      accountId: account.accountId,
    }));
  } catch {
    memorySession = createSession(account, "memory");
  }
  return memorySession;
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
