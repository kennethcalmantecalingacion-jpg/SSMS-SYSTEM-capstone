const roleViews = {
  Teacher: ["overview", "students", "attendance", "academics", "alerts", "interventions", "announcements", "reports"],
  Adviser: ["overview", "students", "attendance", "academics", "alerts", "interventions", "announcements", "reports"],
  "Guidance Counselor": ["overview", "alerts", "interventions", "announcements"],
  "Workspace Owner": ["overview", "students", "attendance", "academics", "alerts", "interventions", "announcements", "reports", "settings"],
  "Workspace Administrator": ["overview", "students", "attendance", "academics", "alerts", "interventions", "announcements", "reports", "settings"],
  "Parent/Guardian": [],
  "Designated System Administrator": ["settings"],
};

const roleLabels = Object.keys(roleViews);

export function getAllowedViews(role) {
  if (!role) {
    return [];
  }
  const normalizedRole = roleLabels.includes(role) ? role : roleLabels.find((label) => label.toLowerCase() === String(role).trim().toLowerCase()) || "Unknown role";
  return [...(roleViews[normalizedRole] || [])];
}

export function canAccessView(role, view) {
  return getAllowedViews(role).includes(view);
}

export function getRoleLabel(role) {
  if (!role) {
    return "Unknown role";
  }
  return roleLabels.includes(role)
    ? role
    : roleLabels.find((label) => label.toLowerCase() === String(role).trim().toLowerCase()) || "Unknown role";
}
