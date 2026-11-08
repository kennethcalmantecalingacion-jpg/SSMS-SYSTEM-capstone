const roleViews = {
  Teacher: ["overview", "students", "attendance", "academics", "alerts", "interventions", "announcements", "reports"],
  Adviser: ["overview", "students", "attendance", "academics", "alerts", "interventions", "announcements", "reports"],
  "Guidance Counselor": ["overview", "alerts", "interventions", "announcements"],
  "Designated System Administrator": ["overview", "settings"],
  "Parent/Guardian": [],
};

const roleLabels = Object.keys(roleViews);

export function getAllowedViews(role) {
  return [...(roleViews[role] || [])];
}

export function canAccessView(role, view) {
  return getAllowedViews(role).includes(view);
}

export function getRoleLabel(role) {
  return roleLabels.includes(role) ? role : "Unknown role";
}
