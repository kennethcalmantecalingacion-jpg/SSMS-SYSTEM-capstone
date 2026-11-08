const demoSessionKey = "lnhs-smart-student-monitoring.demo-session.v1";
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
    description: "Activation requires LNHS approval.",
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
    const storedValue = sessionStorage.getItem(demoSessionKey);
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
    return true;
  } catch {
    return false;
  }
}
