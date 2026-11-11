const statuses = [
  ["", "Not marked"],
  ["present", "Present"],
  ["late", "Late"],
  ["absent", "Absent"],
  ["excused", "Excused"],
];

const state = {
  client: null,
  userId: "",
  workspaces: [],
  workspaceId: "",
  schoolYears: [],
  sections: [],
  gradeLevels: [],
  directoryLearners: [],
  activeEnrollments: new Map(),
  canManage: false,
  activeSchoolYear: null,
  directoryPage: 0,
  directoryPageSize: 50,
  directoryTotal: 0,
  directorySearchTimer: null,
  roster: [],
  entries: new Map(),
  originalEntries: new Map(),
  attendanceSessionId: "",
  rosterMismatch: false,
  requestId: 0,
  directoryRequestId: 0,
};

let eventsBound = false;

function setMessage(message) {
  const element = document.querySelector("#connected-attendance-message");
  if (element) {
    element.textContent = message;
  }
}

function setWorkspaceMessage(message) {
  const element = document.querySelector("#production-workspace-message");
  if (element) {
    element.textContent = message;
  }
}

function setDirectoryMessage(message) {
  const element = document.querySelector("#production-directory-message");
  if (element) {
    element.textContent = message;
  }
}

function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function renderWorkspaceList() {
  const list = document.querySelector("#production-workspace-list");
  if (!list) {
    return;
  }
  const buttons = state.workspaces.map((workspace) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "production-workspace-choice";
    button.textContent = workspace.name;
    button.setAttribute("aria-pressed", String(workspace.id === state.workspaceId));
    button.addEventListener("click", () => {
      if (state.workspaceId === workspace.id) {
        return;
      }
      state.workspaceId = workspace.id;
      state.schoolYears = [];
      state.sections = [];
      state.roster = [];
      state.entries.clear();
      state.originalEntries.clear();
      state.attendanceSessionId = "";
      clearProductionDirectory();
      renderWorkspaceList();
      void loadWorkspaceSetup();
      void loadProductionDirectory();
    });
    return button;
  });
  list.replaceChildren(...buttons);
}

function clearProductionDirectory() {
  state.directoryRequestId += 1;
  state.schoolYears = [];
  state.sections = [];
  state.gradeLevels = [];
  state.directoryLearners = [];
  state.activeEnrollments.clear();
  state.canManage = false;
  state.activeSchoolYear = null;
  const panel = document.querySelector("#production-directory-panel");
  if (panel) panel.hidden = true;
  document.querySelector("#production-directory-body")?.replaceChildren();
  document.querySelector("#production-directory-empty")?.setAttribute("hidden", "");
  const pageInfo = document.querySelector("#production-directory-page");
  if (pageInfo) pageInfo.textContent = "0 learners";
  const searchInput = document.querySelector("#production-directory-search");
  if (searchInput) searchInput.value = "";
  state.directoryPage = 0;
  state.directoryTotal = 0;
  if (state.directorySearchTimer) clearTimeout(state.directorySearchTimer);
  state.directorySearchTimer = null;
  document.querySelector("#production-learner-form")?.reset();
  document.querySelector("#production-edit-learner-form")?.reset();
  document.querySelector("#production-transfer-form")?.reset();
  document.querySelector("#production-learner-form")?.setAttribute("hidden", "");
  const editForm = document.querySelector("#production-edit-learner-form");
  editForm?.setAttribute("hidden", "");
  if (editForm) delete editForm.dataset.learnerId;
  const transferForm = document.querySelector("#production-transfer-form");
  transferForm?.setAttribute("hidden", "");
  if (transferForm) {
    delete transferForm.dataset.learnerId;
    delete transferForm.dataset.currentEnrollmentId;
  }
  document.querySelector("#production-structure-panel")?.setAttribute("hidden", "");
  setDirectoryMessage("");
}

function setOptions(select, rows, labelForRow) {
  select.replaceChildren();
  rows.forEach((row) => {
    const option = document.createElement("option");
    option.value = row.id;
    option.textContent = labelForRow(row);
    select.appendChild(option);
  });
}

function populateDirectoryForms() {
  const activeYears = state.schoolYears;
  const sections = state.sections;
  const sectionLabel = (section) => {
    const grade = state.gradeLevels.find((row) => row.id === section.grade_level_id);
    return grade ? `${grade.label} · ${section.label}` : section.label;
  };
  [
    "#production-learner-year",
    "#production-transfer-year",
  ].forEach((selector) => {
    const select = document.querySelector(selector);
    if (select) setOptions(select, activeYears, (year) => year.name);
  });
  ["#production-learner-section", "#production-transfer-section"].forEach((selector) => {
    const select = document.querySelector(selector);
    if (select) setOptions(select, sections, sectionLabel);
  });
  const gradeSelect = document.querySelector("#production-section-grade");
  if (gradeSelect) setOptions(gradeSelect, state.gradeLevels, (grade) => grade.label);
}

function renderProductionDirectory() {
  const panel = document.querySelector("#production-directory-panel");
  const body = document.querySelector("#production-directory-body");
  const empty = document.querySelector("#production-directory-empty");
  const search = String(document.querySelector("#production-directory-search")?.value || "")
    .trim()
    .toLowerCase();
  if (!panel || !body || !empty) return;

  const sectionsById = new Map(state.sections.map((section) => [section.id, section]));
  const rows = state.directoryLearners.map((learner) => {
    const row = document.createElement("tr");
    const identity = document.createElement("td");
    identity.textContent = `${learner.display_name} · ${learner.learner_identifier}`;
    const enrollmentCell = document.createElement("td");
    const enrollment = state.activeEnrollments.get(learner.id);
    const section = enrollment ? sectionsById.get(enrollment.section_id) : null;
    const grade = section
      ? state.gradeLevels.find((item) => item.id === section.grade_level_id)
      : null;
    enrollmentCell.textContent = section
      ? `${grade ? `${grade.label} · ` : ""}${section.label}`
      : "Not currently enrolled";

    const action = document.createElement("td");
    if (state.canManage) {
      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.className = "button button-outline production-transfer-button";
      editButton.textContent = "Edit";
      editButton.addEventListener("click", () => openLearnerEditForm(learner));
      action.appendChild(editButton);
    }
    if (state.canManage && state.activeSchoolYear && enrollment) {
      const transferButton = document.createElement("button");
      transferButton.type = "button";
      transferButton.className = "button button-outline production-transfer-button";
      transferButton.textContent = "Transfer";
      transferButton.addEventListener("click", () => openTransferForm(learner, enrollment));
      action.appendChild(transferButton);
    }

    const rowText = `${identity.textContent} ${enrollmentCell.textContent}`.toLowerCase();
    row.hidden = Boolean(search && !rowText.includes(search));
    row.append(identity, enrollmentCell, action);
    return row;
  });
  body.replaceChildren(...rows);
  const visibleCount = rows.filter((row) => !row.hidden).length;
  empty.hidden = visibleCount > 0;
  empty.textContent = rows.length
    ? "No learners match this search."
    : "No learners are available in this account's authorized scope.";
  const pageInfo = document.querySelector("#production-directory-page");
  const previous = document.querySelector("#production-directory-previous");
  const next = document.querySelector("#production-directory-next");
  const firstItem = state.directoryTotal ? state.directoryPage * state.directoryPageSize + 1 : 0;
  const lastItem = Math.min((state.directoryPage + 1) * state.directoryPageSize, state.directoryTotal);
  if (pageInfo) pageInfo.textContent = `Showing ${firstItem}–${lastItem} of ${state.directoryTotal}`;
  if (previous) previous.disabled = state.directoryPage === 0;
  if (next) next.disabled = lastItem >= state.directoryTotal;
  panel.hidden = !state.workspaceId;

  const learnerForm = document.querySelector("#production-learner-form");
  const editForm = document.querySelector("#production-edit-learner-form");
  const structurePanel = document.querySelector("#production-structure-panel");
  if (learnerForm) {
    learnerForm.hidden = !state.canManage || !state.activeSchoolYear || !state.sections.length;
  }
  if (editForm && !state.canManage) editForm.hidden = true;
  if (structurePanel) structurePanel.hidden = !state.canManage;
  populateDirectoryForms();
}

function openLearnerEditForm(learner) {
  const form = document.querySelector("#production-edit-learner-form");
  if (!form || !state.canManage) return;
  form.dataset.learnerId = learner.id;
  form.elements.namedItem("learnerIdentifier").value = learner.learner_identifier;
  form.elements.namedItem("displayName").value = learner.display_name;
  form.elements.namedItem("reason").value = "";
  form.hidden = false;
  form.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function openTransferForm(learner, enrollment) {
  const form = document.querySelector("#production-transfer-form");
  const title = document.querySelector("#production-transfer-title");
  if (!form || !state.canManage || !state.activeSchoolYear) return;

  form.dataset.learnerId = learner.id;
  form.dataset.currentEnrollmentId = enrollment.id;
  if (title) title.textContent = `Transfer ${learner.display_name}`;
  populateDirectoryForms();
  const yearSelect = document.querySelector("#production-transfer-year");
  const startsOn = document.querySelector("#production-transfer-starts-on");
  if (yearSelect) yearSelect.value = state.activeSchoolYear.id;
  if (startsOn) {
    startsOn.min = state.activeSchoolYear.starts_on;
    startsOn.max = state.activeSchoolYear.ends_on;
    startsOn.value = localDateString();
    if (startsOn.value < startsOn.min || startsOn.value > startsOn.max) {
      startsOn.value = startsOn.min;
    }
  }
  form.hidden = false;
  form.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function renderCounts() {
  const counts = { present: 0, late: 0, absent: 0, excused: 0, unmarked: 0 };
  state.roster.forEach((learner) => {
    const status = state.entries.get(learner.id)?.status || "";
    counts[status || "unmarked"] += 1;
  });
  Object.entries(counts).forEach(([status, count]) => {
    const element = document.querySelector(`#connected-count-${status}`);
    if (element) {
      element.textContent = String(count);
    }
  });
}

function renderRoster() {
  const body = document.querySelector("#connected-roster-body");
  const empty = document.querySelector("#connected-roster-empty");
  const filter = String(document.querySelector("#connected-roster-search")?.value || "")
    .trim()
    .toLowerCase();
  if (!body || !empty) {
    return;
  }

  const rows = state.roster.map((learner) => {
    const row = document.createElement("tr");
    row.dataset.learnerId = learner.id;
    const identity = document.createElement("td");
    identity.textContent = `${learner.display_name} · ${learner.learner_identifier}`;
    if (filter && !identity.textContent.toLowerCase().includes(filter)) {
      row.hidden = true;
    }
    const statusCell = document.createElement("td");
    const select = document.createElement("select");
    select.className = "connected-attendance-status";
    select.setAttribute("aria-label", `Attendance for ${learner.display_name}`);
    statuses.forEach(([value, label]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      select.appendChild(option);
    });
    select.value = state.entries.get(learner.id)?.status || "";
    select.addEventListener("change", () => {
      const current = state.entries.get(learner.id) || {};
      state.entries.set(learner.id, { ...current, status: select.value });
      renderCounts();
    });
    statusCell.appendChild(select);
    row.append(identity, statusCell);
    return row;
  });
  body.replaceChildren(...rows);
  empty.hidden = rows.length > 0;
  empty.textContent = rows.length ? "" : "No active enrollments were returned for this section and date.";
  renderCounts();
}

async function loadAttendanceSelection() {
  const sectionId = document.querySelector("#connected-section")?.value;
  const schoolYearId = document.querySelector("#connected-school-year")?.value;
  const attendanceDate = document.querySelector("#connected-attendance-date")?.value;
  const sessionKey = String(document.querySelector("#connected-session-key")?.value || "").trim();
  const empty = document.querySelector("#connected-roster-empty");
  const body = document.querySelector("#connected-roster-body");
  const reasonField = document.querySelector("#connected-correction-reason-field");
  const saveButton = document.querySelector("#connected-attendance-save");
  if (saveButton) saveButton.disabled = true;
  const reasonInput = document.querySelector("#connected-correction-reason");
  if (reasonInput) reasonInput.value = "";

  const requestId = ++state.requestId;
  state.roster = [];
  state.entries = new Map();
  state.originalEntries = new Map();
  state.attendanceSessionId = "";
  state.rosterMismatch = false;
  setMessage("");
  renderCounts();
  if (body) body.replaceChildren();
  if (empty) {
    empty.hidden = false;
    empty.textContent = "Choose an authorized school year, section, date, and session identifier.";
  }
  if (reasonField) reasonField.hidden = true;
  if (saveButton) saveButton.textContent = "Save attendance";
  if (!sectionId || !schoolYearId || !attendanceDate || !sessionKey) {
    return;
  }

  const year = state.schoolYears.find((row) => row.id === schoolYearId);
  if (!year || attendanceDate < year.starts_on || attendanceDate > year.ends_on) {
    setMessage("The selected date must fall within the selected active school year.");
    return;
  }
  setMessage("Loading the authorized roster and any saved session…");

  const { data: enrollments, error: enrollmentError } = await state.client
    .from("enrollments")
    .select("id, learner_id")
    .eq("workspace_id", state.workspaceId)
    .eq("section_id", sectionId)
    .eq("school_year_id", schoolYearId)
    .lte("starts_on", attendanceDate)
    .or(`ends_on.is.null,ends_on.gte.${attendanceDate}`);
  if (requestId !== state.requestId) {
    return;
  }
  if (enrollmentError) {
    setMessage(`The roster could not be loaded: ${enrollmentError.message}`);
    return;
  }

  const learnerIds = [...new Set((enrollments || []).map((row) => row.learner_id))];
  if (learnerIds.length) {
    const { data: learners, error: learnerError } = await state.client
      .from("learner_profiles")
      .select("id, learner_identifier, display_name")
      .eq("workspace_id", state.workspaceId)
      .in("id", learnerIds)
      .order("display_name", { ascending: true });
    if (requestId !== state.requestId) {
      return;
    }
    if (learnerError) {
      setMessage(`Authorized learner details could not be loaded: ${learnerError.message}`);
      return;
    }
    state.roster = learners || [];
    if (state.roster.length !== learnerIds.length) {
      setMessage("Some enrolled learner details are unavailable in this account's authorized scope. Attendance was not loaded.");
      return;
    }
  }

  const { data: session, error: sessionError } = await state.client
    .from("attendance_sessions")
    .select("id")
    .eq("workspace_id", state.workspaceId)
    .eq("section_id", sectionId)
    .eq("school_year_id", schoolYearId)
    .eq("attendance_date", attendanceDate)
    .eq("session_key", sessionKey)
    .maybeSingle();
  if (requestId !== state.requestId) {
    return;
  }
  if (sessionError) {
    setMessage(`Saved attendance could not be checked: ${sessionError.message}`);
    return;
  }

  if (session) {
    state.attendanceSessionId = session.id;
    const { data: entries, error: entriesError } = await state.client
      .from("attendance_entries")
      .select("id, learner_id, status")
      .eq("workspace_id", state.workspaceId)
      .eq("attendance_session_id", session.id);
    if (requestId !== state.requestId) {
      return;
    }
    if (entriesError) {
      setMessage(`Saved attendance entries could not be loaded: ${entriesError.message}`);
      return;
    }
    (entries || []).forEach((entry) => {
      state.entries.set(entry.learner_id, { id: entry.id, status: entry.status });
    });
    state.originalEntries = new Map(
      [...state.entries].map(([learnerId, entry]) => [learnerId, { ...entry }]),
    );
    state.rosterMismatch = state.roster.length !== (entries || []).length
      || state.roster.some((learner) => !state.entries.has(learner.id));
    if (reasonField) reasonField.hidden = false;
    if (saveButton) saveButton.textContent = "Save corrections";
  }

  renderRoster();
  if (state.rosterMismatch) {
    setMessage("The saved roster no longer matches the enrollment history for this date. Corrections are disabled; review the enrollment history before changing this session.");
    if (saveButton) saveButton.disabled = true;
    return;
  }
  if (saveButton) saveButton.disabled = state.roster.length === 0;
  setMessage(session
    ? "Saved session loaded. Any changes require a correction reason and will be recorded in the change history."
    : state.roster.length
      ? "Roster loaded. Save will validate and record every enrolled learner in one transaction."
      : "No active enrollments were returned. Confirm the roster and assigned section before recording attendance.");
}

async function loadWorkspaceSetup() {
  const setupRequestId = ++state.requestId;
  const panel = document.querySelector("#production-attendance-panel");
  const schoolYearSelect = document.querySelector("#connected-school-year");
  const sectionSelect = document.querySelector("#connected-section");
  if (!state.client || !state.workspaceId || !panel || !schoolYearSelect || !sectionSelect) {
    return;
  }
  panel.hidden = false;
  setWorkspaceMessage("Loading workspace configuration and assigned sections…");
  setMessage("");

  const { data: schoolYears, error: schoolYearError } = await state.client
    .from("school_years")
    .select("id, name, starts_on, ends_on")
    .eq("workspace_id", state.workspaceId)
    .eq("status", "active")
    .order("starts_on", { ascending: false });
  if (setupRequestId !== state.requestId) {
    return;
  }
  if (schoolYearError) {
    setWorkspaceMessage(`Active school years could not be loaded: ${schoolYearError.message}`);
    panel.hidden = true;
    return;
  }

  const { data: sections, error: sectionError } = await state.client
    .from("sections")
    .select("id, label, grade_level_id")
    .eq("workspace_id", state.workspaceId)
    .order("label", { ascending: true });
  if (setupRequestId !== state.requestId) {
    return;
  }
  if (sectionError) {
    setWorkspaceMessage(`Authorized sections could not be loaded: ${sectionError.message}`);
    panel.hidden = true;
    return;
  }

  state.schoolYears = schoolYears || [];
  state.sections = sections || [];
  setOptions(schoolYearSelect, state.schoolYears, (row) => row.name);
  setOptions(sectionSelect, state.sections, (row) => row.label);
  if (!state.schoolYears.length) {
    setWorkspaceMessage("No active school year is configured for this workspace.");
    panel.hidden = true;
    return;
  }
  if (!state.sections.length) {
    setWorkspaceMessage("No sections are available within this account's authorized scope.");
    panel.hidden = true;
    return;
  }

  const dateInput = document.querySelector("#connected-attendance-date");
  const selectedYear = state.schoolYears[0];
  schoolYearSelect.value = selectedYear.id;
  if (dateInput) {
    dateInput.min = selectedYear.starts_on;
    dateInput.max = selectedYear.ends_on;
    const today = localDateString();
    dateInput.value = today >= selectedYear.starts_on && today <= selectedYear.ends_on
      ? today
      : selectedYear.starts_on;
  }
  setWorkspaceMessage("Select a session identifier to load its assigned roster or saved attendance.");
  await loadAttendanceSelection();
}

async function loadProductionDirectory() {
  if (!state.client || !state.workspaceId) return;
  const requestId = ++state.directoryRequestId;
  const panel = document.querySelector("#production-directory-panel");
  if (panel) panel.hidden = false;
  setDirectoryMessage("Loading authorized directory and workspace structure…");

  const search = String(document.querySelector("#production-directory-search")?.value || "")
    .trim()
    .slice(0, 120);
  const today = localDateString();
  let results;
  try {
    results = await Promise.all([
      state.client
        .from("workspace_member_roles")
        .select("role_key")
        .eq("workspace_id", state.workspaceId)
        .eq("user_id", state.userId),
      state.client
        .from("school_years")
        .select("id, name, starts_on, ends_on")
        .eq("workspace_id", state.workspaceId)
        .eq("status", "active")
        .order("starts_on", { ascending: false }),
      state.client
        .from("grade_levels")
        .select("id, label")
        .eq("workspace_id", state.workspaceId)
        .order("sort_order", { ascending: true })
        .order("label", { ascending: true }),
      state.client
        .from("sections")
        .select("id, label, grade_level_id")
        .eq("workspace_id", state.workspaceId)
        .order("label", { ascending: true }),
      state.client.rpc("search_workspace_learners", {
        p_workspace_id: state.workspaceId,
        p_search: search || null,
        p_page_size: state.directoryPageSize,
        p_page_offset: state.directoryPage * state.directoryPageSize,
      }),
    ]);
  } catch (error) {
    if (requestId === state.directoryRequestId) {
      state.canManage = false;
      state.directoryLearners = [];
      state.directoryTotal = 0;
      state.activeEnrollments.clear();
      renderProductionDirectory();
      setDirectoryMessage(`The workspace directory could not be loaded: ${error instanceof Error ? error.message : "Unexpected network error."}`);
    }
    return;
  }

  if (requestId !== state.directoryRequestId) return;
  const [rolesResult, yearResult, gradeResult, sectionResult, learnerResult] = results;
  const errors = [
    rolesResult.error && `Membership roles: ${rolesResult.error.message}`,
    yearResult.error && `Active school years: ${yearResult.error.message}`,
    gradeResult.error && `Grade levels: ${gradeResult.error.message}`,
    sectionResult.error && `Sections: ${sectionResult.error.message}`,
    learnerResult.error && `Learners: ${learnerResult.error.message}`,
  ].filter(Boolean);
  if (errors.length) {
    state.canManage = false;
    state.directoryLearners = [];
    state.directoryTotal = 0;
    state.activeEnrollments.clear();
    renderProductionDirectory();
    setDirectoryMessage(`The workspace directory could not be fully loaded. ${errors.join(" ")}`);
    return;
  }

  state.canManage = (rolesResult.data || []).some((role) =>
    role.role_key === "workspace_owner" || role.role_key === "workspace_administrator");
  state.schoolYears = yearResult.data || [];
  state.activeSchoolYear = state.schoolYears[0] || null;
  state.gradeLevels = gradeResult.data || [];
  state.sections = sectionResult.data || [];
  const learners = learnerResult.data || [];
  if (!learners.length && state.directoryPage > 0) {
    state.directoryPage = 0;
    await loadProductionDirectory();
    return;
  }
  state.directoryLearners = learners;
  state.directoryTotal = Number(learners[0]?.total_count || 0);
  state.activeEnrollments = new Map();
  const learnerIds = learners.map((learner) => learner.id);
  let enrollments = [];
  if (learnerIds.length) {
    try {
      const { data, error } = await state.client
        .from("enrollments")
        .select("id, learner_id, section_id, school_year_id, starts_on, ends_on")
        .eq("workspace_id", state.workspaceId)
        .in("learner_id", learnerIds)
        .lte("starts_on", localDateString())
        .or(`ends_on.is.null,ends_on.gte.${localDateString()}`)
        .order("starts_on", { ascending: false });
      if (requestId !== state.directoryRequestId) return;
      if (error) {
        state.canManage = false;
        state.directoryLearners = [];
        state.directoryTotal = 0;
        state.activeEnrollments.clear();
        renderProductionDirectory();
        setDirectoryMessage(`Current enrollment details could not be loaded: ${error.message}`);
        return;
      }
      enrollments = data || [];
    } catch (error) {
      if (requestId === state.directoryRequestId) {
        state.canManage = false;
        state.directoryLearners = [];
        state.directoryTotal = 0;
        state.activeEnrollments.clear();
        renderProductionDirectory();
        setDirectoryMessage(`Current enrollment details could not be loaded: ${error instanceof Error ? error.message : "Unexpected network error."}`);
      }
      return;
    }
  }
  enrollments.forEach((enrollment) => {
    if (!state.activeEnrollments.has(enrollment.learner_id)) {
      state.activeEnrollments.set(enrollment.learner_id, enrollment);
    }
  });

  renderProductionDirectory();
  const learnerStart = document.querySelector("#production-learner-starts-on");
  if (learnerStart && state.activeSchoolYear) {
    learnerStart.min = state.activeSchoolYear.starts_on;
    learnerStart.max = state.activeSchoolYear.ends_on;
    learnerStart.value = today >= state.activeSchoolYear.starts_on && today <= state.activeSchoolYear.ends_on
      ? today
      : state.activeSchoolYear.starts_on;
  }
  setDirectoryMessage(state.canManage
    ? "Workspace Owners and Administrators can add learners, manage grade/section setup, and preserve enrollment history during transfers."
    : "Directory visibility follows your active workspace membership and assigned sections. Editing is limited to workspace managers.");
}

async function refreshWorkspaceList(preferredWorkspaceId = "") {
  const requestId = ++state.requestId;
  setWorkspaceMessage("Loading active workspace memberships…");
  const { data, error } = await state.client
    .from("workspaces")
    .select("id, name")
    .order("created_at", { ascending: true });
  if (requestId !== state.requestId) {
    return;
  }
  if (error) {
    state.workspaces = [];
    state.workspaceId = "";
    clearProductionDirectory();
    renderWorkspaceList();
    const panel = document.querySelector("#production-attendance-panel");
    if (panel) panel.hidden = true;
    setWorkspaceMessage(`Workspace membership could not be loaded: ${error.message}`);
    return;
  }

  state.workspaces = data || [];
  const previousWorkspaceId = state.workspaceId;
  state.workspaceId = state.workspaces.some((workspace) => workspace.id === preferredWorkspaceId)
    ? preferredWorkspaceId
    : state.workspaces[0]?.id || "";
  if (previousWorkspaceId !== state.workspaceId) {
    clearProductionDirectory();
  }
  renderWorkspaceList();
  if (!state.workspaceId) {
    clearProductionDirectory();
    const panel = document.querySelector("#production-attendance-panel");
    if (panel) panel.hidden = true;
    setWorkspaceMessage("No active workspace membership is available for this account.");
    return;
  }
  await Promise.all([loadWorkspaceSetup(), loadProductionDirectory()]);
}

async function saveConnectedAttendance(event) {
  event.preventDefault();
  const saveButton = document.querySelector("#connected-attendance-save");
  const form = document.querySelector("#connected-attendance-form");
  const date = document.querySelector("#connected-attendance-date")?.value;
  const sessionKey = String(document.querySelector("#connected-session-key")?.value || "").trim();
  if (!state.workspaceId || state.rosterMismatch || !state.roster.length) {
    setMessage("An authorized, complete roster is required before saving.");
    return;
  }
  if (!date || !sessionKey || sessionKey.length > 80) {
    setMessage("Choose the date and provide a session identifier.");
    return;
  }
  const rows = state.roster.map((learner) => ({
    learnerId: learner.id,
    status: state.entries.get(learner.id)?.status || "",
  }));
  if (rows.some((entry) => !entry.status)) {
    setMessage("Mark every learner in the full section roster before saving.");
    return;
  }

  if (saveButton) saveButton.disabled = true;
  if (form) form.setAttribute("aria-busy", "true");
  try {
    if (state.attendanceSessionId) {
      const reason = String(document.querySelector("#connected-correction-reason")?.value || "").trim();
      const changed = rows
        .map((entry) => ({
          learnerId: entry.learnerId,
          entryId: state.entries.get(entry.learnerId)?.id,
          status: entry.status,
        }))
        .filter((entry) => entry.entryId && state.originalEntries.get(entry.learnerId)?.status !== entry.status)
        .map(({ learnerId, ...entry }) => entry);
      if (!changed.length) {
        setMessage("There are no attendance changes to save.");
        return;
      }
      if (reason.length < 3 || reason.length > 500) {
        setMessage("Enter a correction reason between 3 and 500 characters.");
        return;
      }
      const { data, error } = await state.client.rpc("correct_attendance_session", {
        p_workspace_id: state.workspaceId,
        p_session_id: state.attendanceSessionId,
        p_corrections: changed,
        p_reason: reason,
      });
      if (error) {
        setMessage(`Corrections were not saved: ${error.message}`);
        return;
      }
      await loadAttendanceSelection();
      setMessage(`${data} attendance correction${data === 1 ? "" : "s"} saved with an audit history.`);
      return;
    }

    const sectionId = document.querySelector("#connected-section")?.value;
    const schoolYearId = document.querySelector("#connected-school-year")?.value;
    const { error } = await state.client.rpc("save_attendance_session", {
      p_workspace_id: state.workspaceId,
      p_section_id: sectionId,
      p_school_year_id: schoolYearId,
      p_attendance_date: date,
      p_session_key: sessionKey,
      p_entries: rows,
    });
    if (error) {
      setMessage(`Attendance was not saved: ${error.message}`);
      return;
    }
    await loadAttendanceSelection();
    setMessage("Attendance session saved and verified against the complete date-specific enrollment roster.");
  } catch (error) {
    setMessage(`Attendance save failed: ${error instanceof Error ? error.message : "Unexpected error."}`);
  } finally {
    if (form) form.setAttribute("aria-busy", "false");
    if (saveButton) saveButton.disabled = state.rosterMismatch || state.roster.length === 0;
  }
}

async function submitLearnerForm(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const schoolYearId = String(formData.get("schoolYearId") || "");
  const startsOn = String(formData.get("startsOn") || "");
  const year = state.schoolYears.find((row) => row.id === schoolYearId);
  if (!state.canManage || !state.workspaceId || !year || !startsOn
    || startsOn < year.starts_on || startsOn > year.ends_on) {
    setDirectoryMessage("Choose an active school year and an enrollment date within that year.");
    return;
  }

  const button = form.querySelector('button[type="submit"]');
  if (button) button.disabled = true;
  form.setAttribute("aria-busy", "true");
  setDirectoryMessage("Creating the learner and initial enrollment…");
  try {
    const { error } = await state.client.rpc("create_learner_with_enrollment", {
      p_workspace_id: state.workspaceId,
      p_learner_identifier: String(formData.get("learnerIdentifier") || "").trim(),
      p_display_name: String(formData.get("displayName") || "").trim(),
      p_section_id: String(formData.get("sectionId") || ""),
      p_school_year_id: schoolYearId,
      p_starts_on: startsOn,
    });
    if (error) {
      setDirectoryMessage(`Learner was not added: ${error.message}`);
      return;
    }
    form.reset();
    await Promise.all([loadProductionDirectory(), loadWorkspaceSetup()]);
    setDirectoryMessage("Learner and initial enrollment were saved atomically.");
  } catch (error) {
    setDirectoryMessage(`Learner could not be added: ${error instanceof Error ? error.message : "Unexpected error."}`);
  } finally {
    form.setAttribute("aria-busy", "false");
    if (button) button.disabled = false;
  }
}

async function submitTransferForm(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const startsOn = String(formData.get("startsOn") || "");
  const yearId = String(formData.get("schoolYearId") || "");
  const year = state.schoolYears.find((row) => row.id === yearId);
  if (!state.canManage || !form.dataset.learnerId || !form.dataset.currentEnrollmentId
    || !year || !startsOn || startsOn < year.starts_on || startsOn > year.ends_on) {
    setDirectoryMessage("Choose a destination section, active school year, and valid transfer date.");
    return;
  }

  const button = form.querySelector('button[type="submit"]');
  if (button) button.disabled = true;
  form.setAttribute("aria-busy", "true");
  setDirectoryMessage("Saving enrollment transfer and preserving the previous enrollment…");
  try {
    const { error } = await state.client.rpc("transfer_learner_enrollment", {
      p_workspace_id: state.workspaceId,
      p_learner_id: form.dataset.learnerId,
      p_current_enrollment_id: form.dataset.currentEnrollmentId,
      p_new_section_id: String(formData.get("sectionId") || ""),
      p_new_school_year_id: yearId,
      p_starts_on: startsOn,
    });
    if (error) {
      setDirectoryMessage(`Transfer was not saved: ${error.message}`);
      return;
    }
    form.hidden = true;
    delete form.dataset.learnerId;
    delete form.dataset.currentEnrollmentId;
    form.reset();
    await Promise.all([loadProductionDirectory(), loadWorkspaceSetup()]);
    setDirectoryMessage("Transfer saved. The previous enrollment was closed and preserved in history.");
  } catch (error) {
    setDirectoryMessage(`Transfer could not be saved: ${error instanceof Error ? error.message : "Unexpected error."}`);
  } finally {
    form.setAttribute("aria-busy", "false");
    if (button) button.disabled = false;
  }
}

async function submitLearnerEditForm(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const learnerIdentifier = String(formData.get("learnerIdentifier") || "").trim();
  const displayName = String(formData.get("displayName") || "").trim();
  const reason = String(formData.get("reason") || "").trim();
  if (!state.canManage || !state.workspaceId || !form.dataset.learnerId
    || !learnerIdentifier || !displayName || reason.length < 3) {
    setDirectoryMessage("Provide a learner identifier, display name, and a reason of at least 3 characters.");
    return;
  }

  const button = form.querySelector('button[type="submit"]');
  if (button) button.disabled = true;
  form.setAttribute("aria-busy", "true");
  setDirectoryMessage("Saving learner profile and recording the correction…");
  try {
    const { error } = await state.client.rpc("update_learner_profile", {
      p_workspace_id: state.workspaceId,
      p_learner_id: form.dataset.learnerId,
      p_learner_identifier: learnerIdentifier,
      p_display_name: displayName,
      p_reason: reason,
    });
    if (error) {
      setDirectoryMessage(`Learner profile was not updated: ${error.message}`);
      return;
    }
    form.hidden = true;
    delete form.dataset.learnerId;
    form.reset();
    await loadProductionDirectory();
    setDirectoryMessage("Learner profile updated. The reason and previous values are retained in the restricted change history.");
  } catch (error) {
    setDirectoryMessage(`Learner profile could not be updated: ${error instanceof Error ? error.message : "Unexpected error."}`);
  } finally {
    form.setAttribute("aria-busy", "false");
    if (button) button.disabled = false;
  }
}

async function submitWorkspaceStructure(event, tableName, values) {
  event.preventDefault();
  const form = event.currentTarget;
  if (!state.canManage || !state.workspaceId) {
    setDirectoryMessage("Workspace structure changes require an Owner or Administrator membership.");
    return;
  }
  const button = form.querySelector('button[type="submit"]');
  if (button) button.disabled = true;
  form.setAttribute("aria-busy", "true");
  setDirectoryMessage("Saving workspace structure…");
  try {
    const { error } = await state.client.from(tableName).insert({
      workspace_id: state.workspaceId,
      ...values(new FormData(form)),
      created_by: state.userId,
    });
    if (error) {
      setDirectoryMessage(`Workspace structure was not saved: ${error.message}`);
      return;
    }
    form.reset();
    await Promise.all([loadProductionDirectory(), loadWorkspaceSetup()]);
    setDirectoryMessage("Workspace structure saved.");
  } catch (error) {
    setDirectoryMessage(`Workspace structure could not be saved: ${error instanceof Error ? error.message : "Unexpected error."}`);
  } finally {
    form.setAttribute("aria-busy", "false");
    if (button) button.disabled = false;
  }
}

function bindEvents() {
  if (eventsBound) {
    return;
  }
  eventsBound = true;
  document.querySelector("#connected-attendance-form")?.addEventListener(
    "submit",
    saveConnectedAttendance,
  );
  document.querySelector("#connected-school-year")?.addEventListener("change", (event) => {
    const year = state.schoolYears.find((row) => row.id === event.target.value);
    const dateInput = document.querySelector("#connected-attendance-date");
    if (dateInput && year) {
      dateInput.min = year.starts_on;
      dateInput.max = year.ends_on;
      if (dateInput.value < year.starts_on || dateInput.value > year.ends_on) {
        dateInput.value = year.starts_on;
      }
    }
    void loadAttendanceSelection();
  });
  ["#connected-section", "#connected-attendance-date", "#connected-session-key"]
    .forEach((selector) => document.querySelector(selector)?.addEventListener(
      "change",
      () => void loadAttendanceSelection(),
    ));
  document.querySelector("#connected-roster-search")?.addEventListener("input", renderRoster);
  document.querySelector("#production-directory-search")?.addEventListener(
    "input",
    () => {
      state.directoryPage = 0;
      if (state.directorySearchTimer) clearTimeout(state.directorySearchTimer);
      state.directorySearchTimer = setTimeout(() => {
        state.directorySearchTimer = null;
        void loadProductionDirectory();
      }, 180);
    },
  );
  document.querySelector("#production-directory-previous")?.addEventListener("click", () => {
    if (state.directoryPage === 0) return;
    state.directoryPage -= 1;
    void loadProductionDirectory();
  });
  document.querySelector("#production-directory-next")?.addEventListener("click", () => {
    if ((state.directoryPage + 1) * state.directoryPageSize >= state.directoryTotal) return;
    state.directoryPage += 1;
    void loadProductionDirectory();
  });
  document.querySelector("#production-learner-form")?.addEventListener("submit", submitLearnerForm);
  document.querySelector("#production-edit-learner-form")?.addEventListener("submit", submitLearnerEditForm);
  document.querySelector("#production-transfer-form")?.addEventListener("submit", submitTransferForm);
  document.querySelector("#production-edit-learner-cancel")?.addEventListener("click", () => {
    const form = document.querySelector("#production-edit-learner-form");
    if (form) {
      form.hidden = true;
      delete form.dataset.learnerId;
      form.reset();
    }
  });
  document.querySelector("#production-transfer-cancel")?.addEventListener("click", () => {
    const form = document.querySelector("#production-transfer-form");
    if (form) {
      form.hidden = true;
      delete form.dataset.learnerId;
      delete form.dataset.currentEnrollmentId;
      form.reset();
    }
  });
  document.querySelector("#production-school-year-form")?.addEventListener("submit", (event) => {
    const formData = new FormData(event.currentTarget);
    const start = String(formData.get("startsOn") || "");
    const end = String(formData.get("endsOn") || "");
    if (!start || !end || end < start) {
      event.preventDefault();
      setDirectoryMessage("Choose a school-year end date on or after its start date.");
      return;
    }
    void submitWorkspaceStructure(event, "school_years", () => ({
      name: String(formData.get("name") || "").trim(),
      starts_on: start,
      ends_on: end,
      status: String(formData.get("status") || "draft"),
    }));
  });
  document.querySelector("#production-grade-form")?.addEventListener("submit", (event) => {
    const label = String(new FormData(event.currentTarget).get("label") || "").trim();
    void submitWorkspaceStructure(event, "grade_levels", () => ({ label, sort_order: state.gradeLevels.length }));
  });
  document.querySelector("#production-section-form")?.addEventListener("submit", (event) => {
    const formData = new FormData(event.currentTarget);
    void submitWorkspaceStructure(event, "sections", () => ({
      grade_level_id: String(formData.get("gradeLevelId") || ""),
      label: String(formData.get("label") || "").trim(),
    }));
  });
}

export async function initializeProductionWorkspace(client, user) {
  if (!client || !user?.id) {
    return;
  }
  if (state.userId && state.userId !== user.id) {
    resetProductionWorkspace();
  }
  state.client = client;
  state.userId = user.id;
  bindEvents();
  await refreshWorkspaceList(state.workspaceId);
}

export async function refreshProductionWorkspaces(preferredWorkspaceId = "") {
  if (!state.client) {
    return;
  }
  await refreshWorkspaceList(preferredWorkspaceId);
}

export function resetProductionWorkspace() {
  state.client = null;
  state.userId = "";
  state.workspaces = [];
  state.workspaceId = "";
  state.schoolYears = [];
  state.sections = [];
  state.gradeLevels = [];
  state.directoryLearners = [];
  state.activeEnrollments.clear();
  state.canManage = false;
  state.activeSchoolYear = null;
  state.directoryPage = 0;
  state.directoryTotal = 0;
  state.roster = [];
  state.entries.clear();
  state.originalEntries.clear();
  state.attendanceSessionId = "";
  state.rosterMismatch = false;
  state.requestId += 1;
  state.directoryRequestId += 1;
  const panel = document.querySelector("#production-attendance-panel");
  if (panel) panel.hidden = true;
  const list = document.querySelector("#production-workspace-list");
  if (list) list.replaceChildren();
  clearProductionDirectory();
  document.querySelector("#connected-roster-body")?.replaceChildren();
  document.querySelector("#connected-attendance-form")?.reset();
  document.querySelector("#connected-roster-empty")?.setAttribute("hidden", "");
  const saveButton = document.querySelector("#connected-attendance-save");
  if (saveButton) {
    saveButton.disabled = true;
    saveButton.textContent = "Save attendance";
  }
  document.querySelectorAll("[id^='connected-count-']").forEach((element) => {
    element.textContent = "0";
  });
  setWorkspaceMessage("");
  setMessage("");
}
