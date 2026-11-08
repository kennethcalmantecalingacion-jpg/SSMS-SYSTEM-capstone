"use strict";

const periodData = {
  today: {
    labels: ["8 AM", "10 AM", "12 PM", "2 PM", "4 PM"],
    rates: [92.8, 95.3, 93.7, 94.6, 94.6],
    present: 1176,
    late: 8,
    absent: 54,
    excused: 10,
  },
  week: {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    rates: [93, 94, 95, 94, 95],
    present: 5878,
    late: 50,
    absent: 260,
    excused: 52,
  },
  month: {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"],
    rates: [91, 93, 94, 95, 95],
    present: 23363,
    late: 150,
    absent: 1100,
    excused: 347,
  },
};

const sectionRosters = {
  "7-A": ["L-0701", "L-0702", "L-0703", "L-0704", "L-0705", "L-0706", "L-0707", "L-0708"],
  "8-A": ["L-0801", "L-0802", "L-0803", "L-0804", "L-0805", "L-0806", "L-0807", "L-0808"],
  "8-B": ["L-0811", "L-0812", "L-0813", "L-0814", "L-0815", "L-0816", "L-0817", "L-0818"],
};
const gradeLevels = ["7", "8"];
const sectionLabels = {
  "7-A": "Grade 7 · Section A",
  "8-A": "Grade 8 · Section A",
  "8-B": "Grade 8 · Section B",
};
const learnerProfiles = new Map(
  Object.values(sectionRosters).flatMap((roster) => roster.map((learnerId, index) => [
    learnerId,
    { name: `Learner ${learnerId}`, gender: index % 2 === 0 ? "boy" : "girl" },
  ])),
);

const attendanceDrafts = new Map();
const savedAttendance = new Map();
const attendanceHistory = [];
const attendanceStorageKey = "lnhs-smart-student-monitoring.attendance.v1";
const attendanceStatuses = [
  ["present", "Present"],
  ["late", "Late"],
  ["absent", "Absent"],
  ["excused", "Excused"],
];
const validAttendanceStatuses = new Set(attendanceStatuses.map(([status]) => status));
let attendancePersistenceMessage = "";
const academicActivities = {
  english: [{ id: "english-reading-check", title: "Reading check", maxScore: 20 }],
  mathematics: [{ id: "mathematics-fractions-quiz", title: "Fractions quiz", maxScore: 20 }],
  science: [{ id: "science-matter-check", title: "Matter check", maxScore: 20 }],
};

const toast = document.querySelector("#toast");
const supportStorageKey = "lnhs-smart-student-monitoring.support.v1";
const warningRecords = [
  { id: "warning-0801", learnerId: "L-0801", category: "Attendance", priority: "high", details: "Repeated absences are ready for a staff check-in.", source: "Attendance: repeated absences", recency: "Review prompt" },
  { id: "warning-0811", learnerId: "L-0811", category: "Academic", priority: "medium", details: "Recent results may benefit from a supportive check-in.", source: "Academic: recent results", recency: "Review prompt" },
  { id: "warning-0701", learnerId: "L-0701", category: "Attendance", priority: "medium", details: "An attendance pattern is flagged for verification.", source: "Attendance: pattern for verification", recency: "Review prompt" },
  { id: "warning-0802", learnerId: "L-0802", category: "Follow-up", priority: "low", details: "A scheduled check-in is due.", source: "Follow-up: scheduled check-in", recency: "Review prompt" },
].map((warning) => ({ ...warning, isReviewed: false }));
let toastTimeout;
let currentAttendanceKey = "";
const academicDrafts = new Map();
const savedAcademicScores = new Map();
const academicStorageKey = "lnhs-smart-student-monitoring.academics.v1";
let academicPersistenceMessage = "";
let currentAcademicKey = "";
let academicActivitySequence = 0;
const interventionRecords = [];
const announcementRecords = [];
let announcementSequence = 0;
const interventionStatuses = {
  planned: "Planned",
  "in-progress": "In progress",
  "follow-up": "Follow-up",
  completed: "Completed",
};
let interventionSequence = 0;
let supportPersistenceMessage = "";
let interventionDialogMode = "create";
let editingInterventionId = "";
let studentDialogMode = "add";
let editingLearnerId = "";

function showToast(text) {
  toast.textContent = text;
  toast.classList.add("visible");
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => {
    toast.classList.remove("visible");
  }, 2800);
}

function formatNumber(value) {
  return new Intl.NumberFormat().format(value);
}

function updateDateAndGreeting() {
  const now = new Date();
  const dateElement = document.querySelector("#today-date");
  const greetingElement = document.querySelector("#greeting");

  dateElement.textContent = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(now);

  const hour = now.getHours();
  greetingElement.textContent = hour < 12 ? "GOOD MORNING" : hour < 18 ? "GOOD AFTERNOON" : "GOOD EVENING";
}

function updateAttendanceChart(period) {
  const data = periodData[period];
  if (!data) {
    return;
  }

  const average = data.rates.reduce((sum, rate) => sum + rate, 0) / data.rates.length;
  const averageText = `${average.toFixed(1)}%`;
  const chartLine = document.querySelector("#chart-line");
  const chartArea = document.querySelector("#chart-area");
  const chart = document.querySelector("#attendance-chart");
  const chartLabels = document.querySelector("#chart-x-labels");

  const points = data.rates.map((rate, index) => {
    const x = (620 * index) / (data.rates.length - 1);
    const y = ((100 - rate) / 15) * 180;
    return { x, y };
  });
  const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point.y}`).join(" ");

  chartLine.setAttribute("d", linePath);
  chartArea.setAttribute("d", `${linePath} L620 180 L0 180Z`);
  chart.setAttribute("aria-label", `Attendance rate trend: ${data.labels.join(", ")}`);

  chart.querySelectorAll("circle").forEach((circle, index) => {
    const point = points[index];
    if (point) {
      circle.setAttribute("cx", String(point.x));
      circle.setAttribute("cy", String(point.y));
      circle.style.display = "";
    } else {
      circle.style.display = "none";
    }
  });

  chartLabels.replaceChildren(...data.labels.map((label) => {
    const item = document.createElement("span");
    item.textContent = label;
    return item;
  }));
  document.querySelector("#chart-average").textContent = averageText;
  document.querySelector("#attendance-metric").innerHTML = `${average.toFixed(1)}<span class="metric-unit">%</span>`;
  document.querySelector("#present-count").textContent = formatNumber(data.present);
  document.querySelector("#late-count").textContent = formatNumber(data.late);
  document.querySelector("#absent-count").textContent = formatNumber(data.absent);
  document.querySelector("#excused-count").textContent = formatNumber(data.excused);
}

function closeMobileNavigation() {
  const sidebar = document.querySelector("#sidebar");
  const menuButton = document.querySelector("#mobile-menu");
  const backdrop = document.querySelector("#sidebar-backdrop");

  sidebar.classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open navigation");
  backdrop.hidden = true;
  if (window.innerWidth <= 700) {
    menuButton.focus();
  }
}

function getLocalDateValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getAttendanceKey() {
  return `${document.querySelector("#attendance-section").value}|${document.querySelector("#attendance-date").value}`;
}

function createBlankAttendance() {
  return Object.fromEntries(sectionRosters[document.querySelector("#attendance-section").value].map((learnerId) => [learnerId, ""]));
}

function getCurrentDraft() {
  const draft = attendanceDrafts.get(currentAttendanceKey) || createBlankAttendance();
  const section = document.querySelector("#attendance-section").value;
  sectionRosters[section].forEach((learnerId) => {
    if (!(learnerId in draft)) {
      draft[learnerId] = "";
    }
  });
  attendanceDrafts.set(currentAttendanceKey, draft);
  return draft;
}

function updateAttendanceSummary() {
  const totals = { present: 0, late: 0, absent: 0, excused: 0, unmarked: 0 };
  Object.values(getCurrentDraft()).forEach((status) => {
    if (status in totals && status !== "unmarked") {
      totals[status] += 1;
    } else {
      totals.unmarked += 1;
    }
  });

  Object.entries(totals).forEach(([status, count]) => {
    document.querySelector(`#summary-${status}`).textContent = String(count);
  });
}

function setAttendanceMessage(text = "", type = "") {
  const message = document.querySelector("#attendance-message");
  message.textContent = [text, attendancePersistenceMessage].filter(Boolean).join(" ");
  message.classList.toggle("error", type === "error" || Boolean(attendancePersistenceMessage));
  message.classList.toggle("success", type === "success" && !attendancePersistenceMessage);
}

function updateAttendanceDraftMessage() {
  const draft = getCurrentDraft();
  const saved = savedAttendance.get(currentAttendanceKey)?.statuses || createBlankAttendance();
  const hasChanges = Object.keys(draft).some((learnerId) => draft[learnerId] !== saved[learnerId]);
  setAttendanceMessage(hasChanges ? "Unsaved changes — save attendance to apply." : "");
}

function renderRoster() {
  const sectionSelect = document.querySelector("#attendance-section");
  const section = sectionSelect.value;
  const search = document.querySelector("#roster-search").value.trim().toLowerCase();
  const selectedGender = document.querySelector("#attendance-gender-filter").value;
  const roster = sectionRosters[section];
  const draft = getCurrentDraft();
  const tableBody = document.querySelector("#roster-body");
  const fragment = document.createDocumentFragment();
  let visibleCount = 0;

  document.querySelector("#roster-title").textContent = getSectionLabel(section);
  roster.forEach((learnerId) => {
    const profile = learnerProfiles.get(learnerId);
    const matchesSearch = !search
      || learnerId.toLowerCase().includes(search)
      || profile?.name?.toLowerCase().includes(search);
    const matchesGender = selectedGender === "all" || profile?.gender === selectedGender;
    if (!matchesSearch || !matchesGender) {
      return;
    }

    visibleCount += 1;
    const row = document.createElement("tr");
    const learnerCell = document.createElement("td");
    learnerCell.className = "learner-id-cell";
    const avatar = document.createElement("span");
    avatar.className = "learner-avatar";
    avatar.setAttribute("aria-hidden", "true");
    avatar.textContent = "ID";
    const idText = document.createElement("span");
    idText.textContent = profile?.name ? `${profile.name} · ${learnerId}` : learnerId;
    learnerCell.append(avatar, idText);

    const statusCell = document.createElement("td");
    const select = document.createElement("select");
    select.className = "attendance-status-select";
    select.setAttribute("aria-label", `Attendance status for learner ${learnerId}`);

    const emptyOption = document.createElement("option");
    emptyOption.value = "";
    emptyOption.textContent = "Select status";
    select.append(emptyOption);
    attendanceStatuses.forEach(([value, label]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      select.append(option);
    });

    select.value = draft[learnerId] || "";
    select.classList.toggle(`status-${select.value}`, Boolean(select.value));
    select.addEventListener("change", () => {
      draft[learnerId] = select.value;
      attendanceDrafts.set(currentAttendanceKey, draft);
      select.classList.remove("status-present", "status-late", "status-absent", "status-excused");
      if (select.value) {
        select.classList.add(`status-${select.value}`);
      }
      updateAttendanceSummary();
      updateAttendanceDraftMessage();
    });

    statusCell.append(select);
    row.append(learnerCell, statusCell);
    fragment.append(row);
  });

  tableBody.replaceChildren(fragment);
  document.querySelector("#roster-count").textContent = `${visibleCount} of ${roster.length} learners`;
  document.querySelector("#roster-empty").hidden = visibleCount > 0;
  updateAttendanceSummary();
}

function getAcademicKey() {
  return `${document.querySelector("#academic-section").value}|${document.querySelector("#academic-subject").value}|${document.querySelector("#academic-activity").value}`;
}

function getSectionLabel(section) {
  if (sectionLabels[section]) {
    return sectionLabels[section];
  }
  const [grade, ...nameParts] = section.split("-");
  return `${getGradeLabel(grade)} · Section ${nameParts.join("-")}`;
}

function getGradeLabel(grade) {
  return /^grade\s/i.test(grade) ? grade : `Grade ${grade}`;
}

function populateStructureControls() {
  const sections = Object.keys(sectionRosters);
  const sectionSelects = ["#attendance-section", "#academic-section", "#new-student-section", "#announcement-section", "#report-section"];
  sectionSelects.forEach((selector) => {
    const select = document.querySelector(selector);
    const currentValue = select.value;
    select.replaceChildren(...sections.map((section) => {
      const option = document.createElement("option");
      option.value = section;
      option.textContent = getSectionLabel(section);
      return option;
    }));
    select.value = sections.includes(currentValue) ? currentValue : sections[0];
  });

  const gradeFilter = document.querySelector("#student-grade-filter");
  const selectedGrade = gradeFilter.value;
  gradeFilter.replaceChildren(new Option("All grades", "all"), ...gradeLevels.map((grade) => new Option(getGradeLabel(grade), grade)));
  gradeFilter.value = gradeLevels.includes(selectedGrade) ? selectedGrade : "all";

  const sectionFilter = document.querySelector("#student-section-filter");
  const selectedSection = sectionFilter.value;
  sectionFilter.replaceChildren(new Option("All sections", "all"), ...sections.map((section) => new Option(getSectionLabel(section), section)));
  sectionFilter.value = sections.includes(selectedSection) ? selectedSection : "all";

  const setupGrade = document.querySelector("#setup-section-grade");
  const setupGradeValue = setupGrade.value;
  setupGrade.replaceChildren(...gradeLevels.map((grade) => new Option(getGradeLabel(grade), grade)));
  setupGrade.value = gradeLevels.includes(setupGradeValue) ? setupGradeValue : gradeLevels[0];
}

function renderClassSetup() {
  const gradeList = document.querySelector("#grade-level-list");
  gradeList.replaceChildren(...gradeLevels.map((grade) => {
    const item = document.createElement("li");
    item.textContent = getGradeLabel(grade);
    return item;
  }));
  const sectionList = document.querySelector("#section-list");
  sectionList.replaceChildren(...Object.keys(sectionRosters).map((section) => {
    const item = document.createElement("li");
    item.textContent = `${getSectionLabel(section)} · ${sectionRosters[section].length} learners`;
    return item;
  }));
}

function addGradeLevel() {
  const input = document.querySelector("#new-grade-level");
  const error = document.querySelector("#class-setup-error");
  const match = input.value.trim().match(/^(?:grade\s*)?([a-z0-9]+)$/i);
  error.textContent = "";
  if (!match) {
    error.textContent = "Enter a grade label, such as Grade 9.";
    input.focus();
    return;
  }
  const grade = match[1].toUpperCase();
  if (gradeLevels.some((item) => item.toUpperCase() === grade)) {
    error.textContent = "That grade level is already listed.";
    input.focus();
    return;
  }
  gradeLevels.push(grade);
  gradeLevels.sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));
  input.value = "";
  populateStructureControls();
  renderClassSetup();
  renderStudentDirectory();
  showToast(`${getGradeLabel(grade)} added.`);
}

function addSection() {
  const grade = document.querySelector("#setup-section-grade").value;
  const input = document.querySelector("#new-section-name");
  const error = document.querySelector("#class-setup-error");
  const match = input.value.trim().match(/^(?:section\s*)?([a-z0-9]+)$/i);
  error.textContent = "";
  if (!match || !grade) {
    error.textContent = "Enter a section name, such as Section C.";
    input.focus();
    return;
  }
  const name = match[1].toUpperCase();
  const code = `${grade}-${name}`;
  if (sectionRosters[code]) {
    error.textContent = "That section already exists in this grade.";
    input.focus();
    return;
  }
  sectionRosters[code] = [];
  sectionLabels[code] = `${getGradeLabel(grade)} · Section ${name}`;
  input.value = "";
  populateStructureControls();
  renderClassSetup();
  renderStudentDirectory();
  showToast(`${getSectionLabel(code)} added.`);
}

function getAcademicAssessment() {
  const subject = document.querySelector("#academic-subject").value;
  return academicActivities[subject].find((activity) => activity.id === document.querySelector("#academic-activity").value);
}

function createBlankAcademicScores() {
  return Object.fromEntries(sectionRosters[document.querySelector("#academic-section").value].map((learnerId) => [learnerId, ""]));
}

function getCurrentAcademicDraft() {
  const draft = academicDrafts.get(currentAcademicKey) || createBlankAcademicScores();
  const section = document.querySelector("#academic-section").value;
  sectionRosters[section].forEach((learnerId) => {
    if (!(learnerId in draft)) {
      draft[learnerId] = "";
    }
  });
  academicDrafts.set(currentAcademicKey, draft);
  return draft;
}

function isValidAcademicScore(value, maxScore) {
  const score = Number(value);
  return value !== "" && Number.isFinite(score) && score >= 0 && score <= maxScore;
}

function getAcademicActivityIds() {
  return new Set(Object.values(academicActivities).flat().map((activity) => activity.id));
}

function createAcademicActivityId() {
  const existingIds = getAcademicActivityIds();
  let activityId;
  do {
    activityId = `activity-${++academicActivitySequence}`;
  } while (existingIds.has(activityId));
  return activityId;
}

function restoreAcademicData() {
  let storedValue;
  try {
    storedValue = localStorage.getItem(academicStorageKey);
  } catch {
    academicPersistenceMessage = "Browser storage is unavailable. Academic changes can be saved for this session only.";
    return;
  }

  if (storedValue === null) {
    return;
  }

  let stored;
  try {
    stored = JSON.parse(storedValue);
  } catch {
    academicPersistenceMessage = "Saved academic data could not be read and was skipped.";
    return;
  }

  if (!stored || typeof stored !== "object" || stored.version !== 1) {
    academicPersistenceMessage = "Saved academic data had an invalid format and was skipped.";
    return;
  }

  let skippedRecord = false;
  const customActivities = Array.isArray(stored.customActivities) ? stored.customActivities : [];
  const savedScores = Array.isArray(stored.savedScores) ? stored.savedScores : [];
  if (!Array.isArray(stored.customActivities) || !Array.isArray(stored.savedScores)) {
    skippedRecord = true;
  }

  const activityIds = getAcademicActivityIds();
  customActivities.forEach((activity) => {
    const sequence = typeof activity?.id === "string" && /^activity-[1-9]\d*$/.test(activity.id)
      ? Number(activity.id.slice("activity-".length))
      : NaN;
    if (!activity || typeof activity !== "object" || Array.isArray(activity)
        || !Object.hasOwn(academicActivities, activity.subject)
        || !Number.isSafeInteger(sequence)
        || activityIds.has(activity.id)
        || typeof activity.title !== "string" || !activity.title.trim()
        || typeof activity.maxScore !== "number" || !Number.isFinite(activity.maxScore)
        || activity.maxScore <= 0) {
      skippedRecord = true;
      return;
    }

    academicActivities[activity.subject].push({
      id: activity.id,
      title: activity.title.trim(),
      maxScore: activity.maxScore,
    });
    activityIds.add(activity.id);
    academicActivitySequence = Math.max(academicActivitySequence, sequence);
  });

  savedScores.forEach((entry) => {
    if (!Array.isArray(entry) || entry.length !== 2 || typeof entry[0] !== "string"
        || savedAcademicScores.has(entry[0])) {
      skippedRecord = true;
      return;
    }

    const [key, scores] = entry;
    const [section, subject, activityId, ...extraKeyParts] = key.split("|");
    const roster = sectionRosters[section];
    const activity = Object.hasOwn(academicActivities, subject)
      ? academicActivities[subject].find((item) => item.id === activityId)
      : null;
    if (extraKeyParts.length || !roster || !activity || !scores
        || typeof scores !== "object" || Array.isArray(scores)) {
      skippedRecord = true;
      return;
    }

    const scoreEntries = Object.entries(scores);
    if (scoreEntries.length === 0 || scoreEntries.some(([learnerId, score]) =>
      !roster.includes(learnerId) || typeof score !== "number"
      || !Number.isFinite(score) || score < 0 || score > activity.maxScore)) {
      skippedRecord = true;
      return;
    }

    savedAcademicScores.set(key, Object.fromEntries(
      scoreEntries.map(([learnerId, score]) => [learnerId, String(score)]),
    ));
  });

  if (skippedRecord) {
    academicPersistenceMessage = "Some saved academic records were invalid or duplicated and have been skipped.";
  }
}

function persistAcademicData() {
  const customActivities = Object.entries(academicActivities).flatMap(([subject, activities]) =>
    activities
      .filter((activity) => /^activity-\d+$/.test(activity.id))
      .map((activity) => ({
        subject,
        id: activity.id,
        title: activity.title,
        maxScore: activity.maxScore,
      })),
  );
  const stored = {
    version: 1,
    customActivities,
    savedScores: [...savedAcademicScores.entries()].map(([key, scores]) => [
      key,
      Object.fromEntries(Object.entries(scores).map(([learnerId, score]) => [learnerId, Number(score)])),
    ]),
  };

  try {
    localStorage.setItem(academicStorageKey, JSON.stringify(stored));
    academicPersistenceMessage = "";
    return true;
  } catch {
    academicPersistenceMessage = "Browser storage failed. Academic changes are available for this session only and may be lost on refresh.";
    return false;
  }
}

function updateSupportPersistenceNotice() {
  const warningNote = document.querySelector(".warning-prototype-note");
  const interventionNote = document.querySelector(".intervention-prototype-note");
  if (warningNote) {
    warningNote.textContent = `Sample warnings only. Their categories and priority labels are not approved thresholds and do not determine a learner's status.${supportPersistenceMessage ? ` ${supportPersistenceMessage}` : ""}`;
  }
  if (interventionNote) {
    interventionNote.textContent = `Plans and follow-up notes stay in this browser. Keep notes brief and avoid sensitive personal details.${supportPersistenceMessage ? ` ${supportPersistenceMessage}` : ""}`;
  }
}

function restoreSupportData() {
  let storedValue;
  try {
    storedValue = localStorage.getItem(supportStorageKey);
  } catch {
    supportPersistenceMessage = "Browser storage is unavailable. Warning and support changes can be saved for this session only.";
    return;
  }

  if (storedValue === null) {
    return;
  }

  let stored;
  try {
    stored = JSON.parse(storedValue);
  } catch {
    supportPersistenceMessage = "Saved warning and support data could not be read and was skipped.";
    return;
  }

  if (!stored || typeof stored !== "object" || stored.version !== 1) {
    supportPersistenceMessage = "Saved warning and support data had an unsupported format and was skipped.";
    return;
  }

  let skippedRecord = false;
  const warningIds = new Set(warningRecords.map((warning) => warning.id));
  const reviewedIds = new Set();
  const reviewedWarningIds = Array.isArray(stored.reviewedWarningIds) ? stored.reviewedWarningIds : [];
  const savedRecords = Array.isArray(stored.supportRecords) ? stored.supportRecords : [];
  if (!Array.isArray(stored.reviewedWarningIds) || !Array.isArray(stored.supportRecords)) {
    skippedRecord = true;
  }

  reviewedWarningIds.forEach((warningId) => {
    if (typeof warningId !== "string" || !warningIds.has(warningId) || reviewedIds.has(warningId)) {
      skippedRecord = true;
      return;
    }
    reviewedIds.add(warningId);
  });
  warningRecords.forEach((warning) => {
    warning.isReviewed = reviewedIds.has(warning.id);
  });

  const supportIds = new Set();
  savedRecords.forEach((record) => {
    if (!record || typeof record !== "object" || Array.isArray(record)
        || typeof record.id !== "string" || !/^support-[1-9]\d*$/.test(record.id)
        || !Number.isSafeInteger(Number(record.id.slice("support-".length)))
        || supportIds.has(record.id)
        || typeof record.learnerId !== "string" || !/^[A-Za-z0-9_-]{1,64}$/.test(record.learnerId)
        || typeof record.source !== "string" || !record.source.trim()
        || typeof record.action !== "string" || !record.action.trim()
        || typeof record.assignedTo !== "string" || !record.assignedTo.trim()
        || !isValidAttendanceDate(record.dueDate)
        || !Object.hasOwn(interventionStatuses, record.status)
        || !Array.isArray(record.updates)) {
      skippedRecord = true;
      return;
    }

    const updates = record.updates.flatMap((update) => {
      if (!update || typeof update !== "object" || Array.isArray(update)
          || typeof update.note !== "string" || !update.note.trim()
          || !Object.hasOwn(interventionStatuses, update.status)
          || !isValidTimestamp(update.timestamp)) {
        skippedRecord = true;
        return [];
      }
      return [{
        note: update.note,
        status: update.status,
        timestamp: new Date(update.timestamp),
      }];
    });

    const sourceWarningId = record.sourceWarningId === null
      || warningIds.has(record.sourceWarningId)
      ? record.sourceWarningId
      : null;
    if (sourceWarningId !== record.sourceWarningId) {
      skippedRecord = true;
    }

    interventionRecords.push({
      id: record.id,
      learnerId: record.learnerId,
      sourceWarningId,
      source: record.source.trim(),
      action: record.action.trim(),
      assignedTo: record.assignedTo.trim(),
      dueDate: record.dueDate,
      status: record.status,
      updates,
    });
    supportIds.add(record.id);
    interventionSequence = Math.max(
      interventionSequence,
      Number(record.id.slice("support-".length)),
    );
  });

  if (skippedRecord) {
    supportPersistenceMessage = "Some saved warning or support records were invalid, duplicated, or linked to an unknown warning and were skipped or safely unlinked.";
  }
}

function persistSupportData() {
  const stored = {
    version: 1,
    reviewedWarningIds: warningRecords
      .filter((warning) => warning.isReviewed)
      .map((warning) => warning.id),
    supportRecords: interventionRecords.map((record) => ({
      id: record.id,
      learnerId: record.learnerId,
      sourceWarningId: record.sourceWarningId,
      source: record.source,
      action: record.action,
      assignedTo: record.assignedTo,
      dueDate: record.dueDate,
      status: record.status,
      updates: record.updates.map((update) => ({
        note: update.note,
        status: update.status,
        timestamp: update.timestamp.toISOString(),
      })),
    })),
  };

  try {
    localStorage.setItem(supportStorageKey, JSON.stringify(stored));
    supportPersistenceMessage = "";
    updateSupportPersistenceNotice();
    return true;
  } catch {
    supportPersistenceMessage = "Browser storage failed. Warning and support changes are available for this session only and may be lost on refresh.";
    updateSupportPersistenceNotice();
    return false;
  }
}

function setAcademicMessage(text = "", type = "") {
  const message = document.querySelector("#academic-message");
  message.textContent = [text, academicPersistenceMessage].filter(Boolean).join(" ");
  message.classList.toggle("error", type === "error" || Boolean(academicPersistenceMessage));
  message.classList.toggle("success", type === "success" && !academicPersistenceMessage);
}

function updateAcademicSummary() {
  const draft = getCurrentAcademicDraft();
  const assessment = getAcademicAssessment();
  const allScores = Object.values(draft);
  const scores = allScores.filter((score) => isValidAcademicScore(score, assessment.maxScore)).map(Number);
  document.querySelector("#academic-learner-count").textContent = String(allScores.length);
  document.querySelector("#academic-scores-entered").textContent = `${scores.length} / ${allScores.length}`;
  document.querySelector("#academic-average").textContent = scores.length
    ? `${((scores.reduce((total, score) => total + score, 0) / scores.length / assessment.maxScore) * 100).toFixed(1)}%`
    : "—";
  document.querySelector("#academic-average-scale").textContent = scores.length
    ? "Average of entered scores"
    : "Enter scores to see the average";
}

function updateAcademicDraftMessage() {
  const draft = getCurrentAcademicDraft();
  const saved = savedAcademicScores.get(currentAcademicKey) || createBlankAcademicScores();
  const hasChanges = Object.keys(draft).some((learnerId) => draft[learnerId] !== saved[learnerId]);
  setAcademicMessage(hasChanges ? "You have unsaved score changes." : "");
}

function renderAcademicRoster() {
  const sectionSelect = document.querySelector("#academic-section");
  const subject = document.querySelector("#academic-subject");
  const activities = academicActivities[subject.value];
  const activitySelect = document.querySelector("#academic-activity");
  const selectedActivityId = activitySelect.value;
  if (!activities.some((activity) => activity.id === selectedActivityId)) {
    activitySelect.replaceChildren(...activities.map((activity) => {
      const option = document.createElement("option");
      option.value = activity.id;
      option.textContent = activity.title;
      return option;
    }));
  }
  const assessment = getAcademicAssessment();
  const search = document.querySelector("#academic-search").value.trim().toLowerCase();
  const roster = sectionRosters[sectionSelect.value];
  const draft = getCurrentAcademicDraft();
  const tableBody = document.querySelector("#academic-roster-body");
  const fragment = document.createDocumentFragment();
  let visibleCount = 0;

  document.querySelector("#academic-max-score").textContent = String(assessment.maxScore);
  document.querySelector("#academic-roster-count").textContent = `${roster.length} learners · ${subject.selectedOptions[0].textContent}`;

  roster.forEach((learnerId) => {
    const name = learnerProfiles.get(learnerId)?.name || "";
    if (search && !learnerId.toLowerCase().includes(search) && !name.toLowerCase().includes(search)) {
      return;
    }

    visibleCount += 1;
    const row = document.createElement("tr");
    const learnerCell = document.createElement("td");
    learnerCell.textContent = learnerId;
    const scoreCell = document.createElement("td");
    const scoreField = document.createElement("div");
    scoreField.className = "academic-score-field";
    const input = document.createElement("input");
    input.className = "academic-score-input";
    input.type = "number";
    input.min = "0";
    input.max = String(assessment.maxScore);
    input.step = "any";
    input.inputMode = "decimal";
    input.required = true;
    input.value = draft[learnerId];
    input.dataset.learnerId = learnerId;
    input.setAttribute("aria-label", `Score for learner ${learnerId}`);
    const scale = document.createElement("span");
    scale.textContent = `/ ${assessment.maxScore}`;

    input.addEventListener("input", () => {
      draft[learnerId] = input.value;
      input.setCustomValidity(input.value && !isValidAcademicScore(input.value, assessment.maxScore)
        ? `Enter a score from 0 to ${assessment.maxScore}.`
        : "");
      updateAcademicSummary();
      updateAcademicDraftMessage();
    });

    scoreField.append(input, scale);
    scoreCell.append(scoreField);
    row.append(learnerCell, scoreCell);
    fragment.append(row);
  });

  tableBody.replaceChildren(fragment);
  document.querySelector("#academic-empty").hidden = visibleCount > 0;
  updateAcademicSummary();
}

function loadAcademicSelection() {
  const activities = academicActivities[document.querySelector("#academic-subject").value];
  const activitySelect = document.querySelector("#academic-activity");
  const selectedActivityId = activitySelect.value;
  activitySelect.replaceChildren(...activities.map((activity) => {
    const option = document.createElement("option");
    option.value = activity.id;
    option.textContent = activity.title;
    return option;
  }));
  if (activities.some((activity) => activity.id === selectedActivityId)) {
    activitySelect.value = selectedActivityId;
  }
  currentAcademicKey = getAcademicKey();
  if (!academicDrafts.has(currentAcademicKey)) {
    const saved = savedAcademicScores.get(currentAcademicKey);
    academicDrafts.set(currentAcademicKey, saved ? { ...saved } : createBlankAcademicScores());
  }
  setAcademicMessage();
  renderAcademicRoster();
}

function formatAttendanceDate(dateValue) {
  const [year, month, day] = dateValue.split("-").map(Number);
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

function renderAttendanceHistory() {
  const historyList = document.querySelector("#attendance-history");
  const emptyState = document.querySelector("#history-empty");
  historyList.replaceChildren(emptyState);
  emptyState.hidden = attendanceHistory.length > 0;

  attendanceHistory.forEach((entry) => {
    const item = document.createElement("article");
    item.className = "history-entry";
    const icon = document.createElement("span");
    icon.className = "history-entry-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "✓";
    const copy = document.createElement("div");
    copy.className = "history-entry-copy";
    const title = document.createElement("strong");
    title.textContent = entry.title;
    const detail = document.createElement("span");
    detail.textContent = `${entry.section} · ${formatAttendanceDate(entry.date)} · School staff`;
    const time = document.createElement("time");
    time.dateTime = entry.timestamp.toISOString();
    time.textContent = new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }).format(entry.timestamp);
    copy.append(title, detail);
    item.append(icon, copy, time);
    historyList.append(item);
  });
}

function isValidAttendanceDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function isValidTimestamp(value) {
  return typeof value === "string" && Number.isFinite(new Date(value).getTime());
}

function restoreAttendanceData() {
  let storedValue;
  try {
    storedValue = localStorage.getItem(attendanceStorageKey);
  } catch {
    attendancePersistenceMessage = "Browser storage is unavailable. Attendance can be saved for this session only.";
    return;
  }

  if (storedValue === null) {
    return;
  }

  let stored;
  try {
    stored = JSON.parse(storedValue);
  } catch {
    attendancePersistenceMessage = "Saved attendance data could not be read and was skipped.";
    return;
  }

  if (!stored || typeof stored !== "object" || stored.version !== 1
      || !Array.isArray(stored.savedAttendance) || !Array.isArray(stored.attendanceHistory)) {
    attendancePersistenceMessage = "Saved attendance data had an invalid format and was skipped.";
    return;
  }

  let skippedRecord = false;
  stored.savedAttendance.forEach((entry) => {
    if (!Array.isArray(entry) || entry.length !== 2) {
      skippedRecord = true;
      return;
    }

    const [key, record] = entry;
    const keyParts = typeof key === "string" ? key.split("|") : [];
    if (keyParts.length !== 2 || !keyParts[0] || !isValidAttendanceDate(keyParts[1])
        || savedAttendance.has(key) || !record || typeof record !== "object"
        || Array.isArray(record) || !record.statuses || typeof record.statuses !== "object"
        || Array.isArray(record.statuses) || !isValidTimestamp(record.savedAt)) {
      skippedRecord = true;
      return;
    }

    const statuses = Object.entries(record.statuses);
    if (statuses.length === 0 || statuses.some(([learnerId, status]) =>
      !/^[A-Za-z0-9_-]{1,64}$/.test(learnerId) || !validAttendanceStatuses.has(status))) {
      skippedRecord = true;
      return;
    }

    savedAttendance.set(key, {
      statuses: { ...record.statuses },
      savedAt: new Date(record.savedAt),
    });
  });

  stored.attendanceHistory.forEach((entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)
        || typeof entry.title !== "string" || !entry.title
        || typeof entry.section !== "string" || !entry.section
        || !isValidAttendanceDate(entry.date) || !isValidTimestamp(entry.timestamp)) {
      skippedRecord = true;
      return;
    }

    attendanceHistory.push({
      title: entry.title,
      section: entry.section,
      date: entry.date,
      timestamp: new Date(entry.timestamp),
    });
  });

  attendanceHistory.splice(12);
  if (skippedRecord) {
    attendancePersistenceMessage = "Some saved attendance records were invalid and have been skipped.";
  }
}

function persistAttendanceData() {
  const stored = {
    version: 1,
    savedAttendance: [...savedAttendance.entries()].map(([key, record]) => [
      key,
      {
        statuses: record.statuses,
        savedAt: record.savedAt.toISOString(),
      },
    ]),
    attendanceHistory: attendanceHistory.map((entry) => ({
      title: entry.title,
      section: entry.section,
      date: entry.date,
      timestamp: entry.timestamp.toISOString(),
    })),
  };

  try {
    localStorage.setItem(attendanceStorageKey, JSON.stringify(stored));
    attendancePersistenceMessage = "";
    return true;
  } catch {
    attendancePersistenceMessage = "Browser storage failed. This attendance is available for this session only and may be lost on refresh.";
    return false;
  }
}

function getInterventionLearnerLabel(learnerId) {
  const record = getStudentRecords().find((item) => item.learnerId === learnerId);
  if (!record) {
    return learnerId;
  }
  const identity = record.name === `Learner ${record.learnerId}`
    ? record.learnerId
    : `${record.name} · ${record.learnerId}`;
  return `${identity} · ${getSectionLabel(record.section)}`;
}

function renderInterventionSources() {
  const sourceSelect = document.querySelector("#intervention-source");
  const selectedSource = sourceSelect.value;
  const options = [
    { value: "general", label: "General follow-up" },
    ...warningRecords.map((warning) => ({
      value: warning.id,
      label: warning.source,
    })),
  ];
  sourceSelect.replaceChildren(...options.map(({ value, label }) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    return option;
  }));
  if (options.some((option) => option.value === selectedSource)) {
    sourceSelect.value = selectedSource;
  }
}

function renderInterventionLearners() {
  const learnerSelect = document.querySelector("#intervention-learner");
  const selectedLearner = learnerSelect.value;
  learnerSelect.replaceChildren(...getStudentRecords().map((record) => {
    const option = document.createElement("option");
    option.value = record.learnerId;
    option.textContent = `${record.name} · ${record.learnerId} · ${getSectionLabel(record.section)}`;
    return option;
  }));
  if (getStudentRecords().some((record) => record.learnerId === selectedLearner)) {
    learnerSelect.value = selectedLearner;
  } else if (learnerSelect.options.length) {
    learnerSelect.selectedIndex = -1;
  }
}

function formatInterventionDate(date) {
  if (!date) {
    return "No date set";
  }
  return formatAttendanceDate(date);
}

function createInterventionRow(record, compact = false) {
  const row = document.createElement("article");
  row.className = compact ? "intervention-row" : "intervention-record-card";
  const copy = document.createElement("div");
  copy.className = "intervention-copy";
  const title = document.createElement("strong");
  title.textContent = record.action;
  const detail = document.createElement("small");
  detail.textContent = `${getInterventionLearnerLabel(record.learnerId)} · ${record.assignedTo}`;
  copy.append(title, detail);

  const status = document.createElement("span");
  status.className = `status-pill intervention-status-${record.status}`;
  status.textContent = interventionStatuses[record.status];

  if (compact) {
    const date = document.createElement("span");
    date.className = "intervention-date";
    date.textContent = formatInterventionDate(record.dueDate);
    row.append(copy, status, date);
    return row;
  }

  const source = document.createElement("p");
  source.className = "intervention-record-source";
  source.textContent = record.source;
  const footer = document.createElement("div");
  footer.className = "intervention-record-footer";
  const nextCheckIn = document.createElement("span");
  nextCheckIn.textContent = `Next check-in: ${formatInterventionDate(record.dueDate)}`;
  const lastUpdate = document.createElement("span");
  const latestUpdate = record.updates[record.updates.length - 1];
  lastUpdate.textContent = latestUpdate
    ? `Updated ${new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(latestUpdate.timestamp)}`
    : "Plan created";

  const updateButton = document.createElement("button");
  updateButton.className = "button button-outline intervention-update-button";
  updateButton.type = "button";
  updateButton.textContent = "Update";
  updateButton.setAttribute("aria-label", `Update support plan for ${getInterventionLearnerLabel(record.learnerId)}`);
  updateButton.addEventListener("click", () => openInterventionUpdate(record.id));

  footer.append(nextCheckIn, lastUpdate, updateButton);
  row.append(copy, status, source, footer);
  return row;
}

function renderDashboardInterventions() {
  const container = document.querySelector("#dashboard-intervention-list");
  const openRecords = interventionRecords.filter((record) => record.status !== "completed").slice(0, 3);
  if (!openRecords.length) {
    const empty = document.createElement("p");
    empty.className = "dashboard-intervention-empty";
    empty.textContent = "No support plans in progress. Start one from an early warning.";
    container.replaceChildren(empty);
    return;
  }
  container.replaceChildren(...openRecords.map((record) => createInterventionRow(record, true)));
}

function renderInterventions() {
  const selectedStatus = document.querySelector("#intervention-status-filter").value;
  const filtered = interventionRecords.filter((record) => selectedStatus === "all" || record.status === selectedStatus);
  const container = document.querySelector("#intervention-record-list");
  container.replaceChildren(...filtered.map((record) => createInterventionRow(record)));
  document.querySelector("#intervention-record-count").textContent = `${filtered.length} ${filtered.length === 1 ? "plan" : "plans"}`;
  const empty = document.querySelector("#intervention-empty");
  empty.hidden = filtered.length > 0;
  empty.textContent = interventionRecords.length
    ? "No support plans match this status."
    : "No support plans yet. Start one from an early warning or create a new plan.";
  document.querySelector("#intervention-open-count").textContent = String(
    interventionRecords.filter((record) => record.status !== "completed").length,
  );
  document.querySelector("#intervention-followup-count").textContent = String(
    interventionRecords.filter((record) => record.status === "follow-up").length,
  );
  document.querySelector("#intervention-completed-count").textContent = String(
    interventionRecords.filter((record) => record.status === "completed").length,
  );
  renderDashboardInterventions();
}

function getAnnouncementAudience(record) {
  return record.audience === "section" ? getSectionLabel(record.section) : "All staff workspace";
}

function createAnnouncementCard(record, compact = false) {
  const item = document.createElement("article");
  item.className = compact ? "announcement-item" : "announcement-board-item";
  if (!record.isRead) {
    item.classList.add("announcement-unread");
  }

  const icon = document.createElement("span");
  icon.className = "announcement-icon calendar-icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = "i";

  const content = document.createElement("div");
  const title = document.createElement("strong");
  title.textContent = record.title;
  const message = document.createElement("p");
  message.textContent = record.message;
  const metadata = document.createElement("small");
  const timestamp = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(record.createdAt);
  metadata.textContent = `${getAnnouncementAudience(record)} · ${timestamp}`;
  content.append(title, message, metadata);
  item.append(icon, content);

  if (!compact) {
    const state = document.createElement("span");
    state.className = `announcement-read-state${record.isRead ? " is-read" : ""}`;
    state.textContent = record.isRead ? "Read this session" : "Unread";
    item.append(state);
    if (!record.isRead) {
      const readButton = document.createElement("button");
      readButton.className = "button button-outline announcement-read-button";
      readButton.type = "button";
      readButton.textContent = "Mark read";
      readButton.setAttribute("aria-label", `Mark announcement as read: ${record.title}`);
      readButton.addEventListener("click", () => {
        record.isRead = true;
        renderAnnouncements();
      });
      item.append(readButton);
    }
  }
  return item;
}

function renderAnnouncementList(container, records, emptyMessage, compact = false) {
  if (!records.length) {
    const empty = document.createElement("p");
    empty.className = compact ? "announcement-list-empty" : "announcement-empty";
    empty.textContent = emptyMessage;
    container.replaceChildren(empty);
    return;
  }
  container.replaceChildren(...records.map((record) => createAnnouncementCard(record, compact)));
}

function renderAnnouncements() {
  const unreadCount = announcementRecords.filter((record) => !record.isRead).length;
  const unreadBadge = document.querySelector("#announcement-unread-count");
  unreadBadge.textContent = String(unreadCount);
  unreadBadge.hidden = unreadCount === 0;
  document.querySelector("#announcement-notification-dot").hidden = unreadCount === 0;
  document.querySelector("#notification-button").setAttribute(
    "aria-label",
    unreadCount ? `Open announcements, ${unreadCount} unread` : "Open announcements",
  );

  const selectedStatus = document.querySelector("#announcement-status-filter").value;
  const filtered = announcementRecords.filter((record) => {
    if (selectedStatus === "unread") {
      return !record.isRead;
    }
    if (selectedStatus === "read") {
      return record.isRead;
    }
    return true;
  });
  renderAnnouncementList(
    document.querySelector("#announcement-feed"),
    filtered,
    announcementRecords.length ? "No announcements match this filter." : "No announcements yet. Post an update to this workspace.",
  );
  document.querySelector("#announcement-result-count").textContent = `${filtered.length} ${filtered.length === 1 ? "announcement" : "announcements"}`;
  renderAnnouncementList(
    document.querySelector("#dashboard-announcement-list"),
    announcementRecords.slice(0, 2),
    "No announcements posted in this session.",
    true,
  );
}

function openAnnouncementDialog() {
  const form = document.querySelector("#announcement-form");
  form.reset();
  document.querySelector("#announcement-status-filter").value = "all";
  renderAnnouncements();
  document.querySelector("#announcement-error").textContent = "";
  document.querySelector("#announcement-section-field").hidden = true;
  document.querySelector("#announcement-section").required = false;
  document.querySelector("#announcement-dialog").showModal();
  document.querySelector("#announcement-title").focus();
}

function saveAnnouncement(event) {
  event.preventDefault();
  const title = document.querySelector("#announcement-title");
  const message = document.querySelector("#announcement-body");
  const audience = document.querySelector("#announcement-audience");
  const section = document.querySelector("#announcement-section");
  const error = document.querySelector("#announcement-error");
  error.textContent = "";
  title.setCustomValidity(title.value.trim() ? "" : "Enter an announcement title.");
  message.setCustomValidity(message.value.trim() ? "" : "Enter an announcement message.");
  const requiredFields = audience.value === "section" ? [title, message, audience, section] : [title, message, audience];
  if (!requiredFields.every((field) => field.reportValidity())) {
    return;
  }

  announcementRecords.unshift({
    id: `announcement-${++announcementSequence}`,
    title: title.value.trim(),
    message: message.value.trim(),
    audience: audience.value,
    section: audience.value === "section" ? section.value : "",
    createdAt: new Date(),
    isRead: false,
  });
  document.querySelector("#announcement-dialog").close();
  renderAnnouncements();
  showToast("Announcement posted to this workspace.");
}

function updateReportControls() {
  const type = document.querySelector("#report-type").value;
  document.querySelector("#reports-view .page-subtitle").textContent =
    "Create a printable summary from saved browser-local attendance or academic records and current-session data.";
  document.querySelector("#reports-view .report-builder-heading p").textContent =
    "Saved browser-local attendance and academic records and current-session records are included for the selected report.";
  document.querySelector("#reports-view .report-prototype-note").textContent =
    "Reports use browser-local attendance and academic data plus current-session support and synthetic roster records. No official grading, risk thresholds, or legal compliance determinations are included.";
  document.querySelector(".report-section-field").hidden = type === "interventions" || type === "roster";
  document.querySelector(".report-date-field").hidden = type !== "attendance";
  document.querySelector(".report-subject-field").hidden = type !== "academic";
  document.querySelector(".report-activity-field").hidden = type !== "academic";
  if (type === "academic") {
    const subject = document.querySelector("#report-subject").value;
    const activities = academicActivities[subject];
    const activitySelect = document.querySelector("#report-activity");
    const selected = activitySelect.value;
    activitySelect.replaceChildren(...activities.map((activity) => {
      const option = document.createElement("option");
      option.value = activity.id;
      option.textContent = activity.title;
      return option;
    }));
    if (activities.some((activity) => activity.id === selected)) {
      activitySelect.value = selected;
    }
  }
}

function createReportTable(headers, rows) {
  const table = document.createElement("table");
  table.className = "report-data-table";
  const head = document.createElement("thead");
  const headerRow = document.createElement("tr");
  headers.forEach((label) => {
    const cell = document.createElement("th");
    cell.scope = "col";
    cell.textContent = label;
    headerRow.append(cell);
  });
  head.append(headerRow);
  const body = document.createElement("tbody");
  rows.forEach((values) => {
    const row = document.createElement("tr");
    values.forEach((value) => {
      const cell = document.createElement("td");
      cell.textContent = String(value);
      row.append(cell);
    });
    body.append(row);
  });
  table.append(head, body);
  return table;
}

function createReportSummary(items) {
  const summary = document.createElement("div");
  summary.className = "report-summary-grid";
  items.forEach(([label, value]) => {
    const card = document.createElement("article");
    card.className = "report-summary-card";
    const title = document.createElement("span");
    title.textContent = label;
    const count = document.createElement("strong");
    count.textContent = String(value);
    card.append(title, count);
    summary.append(card);
  });
  return summary;
}

function renderReport(title, subtitle, headers, rows, summaryItems = []) {
  const output = document.querySelector("#report-output");
  const heading = document.createElement("div");
  heading.className = "report-output-heading";
  const titleElement = document.createElement("h2");
  titleElement.id = "report-output-title";
  titleElement.textContent = title;
  const subtitleElement = document.createElement("p");
  subtitleElement.textContent = subtitle;
  heading.append(titleElement, subtitleElement);

  const generated = document.createElement("p");
  generated.className = "report-generated-at";
  generated.textContent = `Generated ${new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date())} · Prototype data summary`;

  const contents = [heading, generated];
  if (summaryItems.length) {
    contents.push(createReportSummary(summaryItems));
  }
  if (rows.length) {
    contents.push(createReportTable(headers, rows));
  } else {
    const empty = document.createElement("p");
    empty.className = "report-no-records";
    empty.textContent = "No saved records match this report yet.";
    contents.push(empty);
  }
  output.replaceChildren(...contents);
  document.querySelector("#print-report").disabled = false;
}

function generateAttendanceReport(section, date) {
  const saved = savedAttendance.get(`${section}|${date}`);
  const statuses = saved?.statuses || {};
  const roster = sectionRosters[section] || [];
  const counts = { present: 0, late: 0, absent: 0, excused: 0, unmarked: 0 };
  const rows = roster.map((learnerId) => {
    const status = statuses[learnerId] || "unmarked";
    counts[status] = (counts[status] || 0) + 1;
    const profile = learnerProfiles.get(learnerId);
    return [profile?.name || learnerId, learnerId, attendanceStatuses.find(([value]) => value === status)?.[1] || "Not marked"];
  });
  const dateLabel = formatAttendanceDate(date);
  renderReport(
    `Attendance · ${getSectionLabel(section)}`,
    `${dateLabel} · Saved section attendance`,
    ["Learner", "Learner ID", "Status"],
    saved ? rows : [],
    saved ? [
      ["Present", counts.present],
      ["Late", counts.late],
      ["Absent", counts.absent],
      ["Excused", counts.excused],
      ["Not marked", counts.unmarked],
    ] : [],
  );
}

function generateAcademicReport(section, subject, activityId) {
  const activity = academicActivities[subject].find((item) => item.id === activityId);
  if (!activity) {
    throw new Error(`Unknown report activity: ${activityId}`);
  }
  const key = `${section}|${subject}|${activityId}`;
  const scores = savedAcademicScores.get(key);
  const learnerIds = sectionRosters[section] || [];
  const scoredLearners = learnerIds
    .filter((learnerId) => scores && scores[learnerId] !== undefined)
    .map((learnerId) => ({ learnerId, score: Number(scores[learnerId]) }));
  const values = scoredLearners.map(({ score }) => score);
  const average = values.length
    ? `${((values.reduce((sum, score) => sum + score, 0) / values.length / activity.maxScore) * 100).toFixed(1)}%`
    : "—";
  const rows = scoredLearners.map(({ learnerId, score }) => {
    return [learnerProfiles.get(learnerId)?.name || learnerId, learnerId, `${score} / ${activity.maxScore}`];
  });
  renderReport(
    `Activity scores · ${getSectionLabel(section)}`,
    `${document.querySelector("#report-subject").selectedOptions[0].textContent} · ${activity.title}`,
    ["Learner", "Learner ID", "Score"],
    scores ? rows : [],
    scores ? [["Learners", rows.length], ["Possible points", activity.maxScore], ["Average", average]] : [],
  );
}

function generateInterventionReport() {
  const rows = interventionRecords.map((record) => [
    getInterventionLearnerLabel(record.learnerId),
    record.source,
    record.action,
    record.assignedTo,
    interventionStatuses[record.status],
    formatInterventionDate(record.dueDate),
  ]);
  renderReport(
    "Support plan status",
    "Session support plans and next check-in dates",
    ["Learner", "Warning or reason", "Planned support", "Assigned staff", "Status", "Next check-in"],
    rows,
    [
      ["Open plans", interventionRecords.filter((record) => record.status !== "completed").length],
      ["Follow-up", interventionRecords.filter((record) => record.status === "follow-up").length],
      ["Completed", interventionRecords.filter((record) => record.status === "completed").length],
    ],
  );
}

function generateRosterReport() {
  const rows = Object.entries(sectionRosters).map(([section, learners]) => {
    const boys = learners.filter((learnerId) => learnerProfiles.get(learnerId)?.gender === "boy").length;
    const girls = learners.filter((learnerId) => learnerProfiles.get(learnerId)?.gender === "girl").length;
    return [getSectionLabel(section), learners.length, boys, girls];
  });
  const learners = getStudentRecords();
  renderReport(
    "Learner roster summary",
    "Current synthetic roster by grade and section",
    ["Section", "Learners", "Boys*", "Girls*"],
    rows,
    [
      ["Learners", learners.length],
      ["Grade levels", new Set(learners.map((record) => record.grade)).size],
      ["Sections", Object.keys(sectionRosters).length],
    ],
  );
  const note = document.createElement("p");
  note.className = "report-gender-note";
  note.textContent = "* Gender grouping uses synthetic sample categories; its terminology and reporting purpose need school confirmation.";
  document.querySelector("#report-output").append(note);
}

function generateSelectedReport() {
  const type = document.querySelector("#report-type").value;
  if (type === "attendance") {
    const date = document.querySelector("#report-date").value;
    if (!date) {
      document.querySelector("#report-date").reportValidity();
      return;
    }
    generateAttendanceReport(document.querySelector("#report-section").value, date);
  } else if (type === "academic") {
    generateAcademicReport(
      document.querySelector("#report-section").value,
      document.querySelector("#report-subject").value,
      document.querySelector("#report-activity").value,
    );
  } else if (type === "interventions") {
    generateInterventionReport();
  } else {
    generateRosterReport();
  }
}

function openInterventionCreate(warningId = "general", learnerId = "") {
  interventionDialogMode = "create";
  editingInterventionId = "";
  const form = document.querySelector("#intervention-form");
  form.reset();
  document.querySelector("#intervention-dialog-title").textContent = "New support plan";
  document.querySelector("#intervention-dialog-description").textContent = "Choose a learner and record a practical next step.";
  document.querySelector("#intervention-create-fields").hidden = false;
  document.querySelector("#intervention-update-fields").hidden = true;
  document.querySelector("#save-intervention").textContent = "Create plan";
  document.querySelector("#intervention-error").textContent = "";
  renderInterventionLearners();
  renderInterventionSources();
  document.querySelector("#intervention-source").value = warningId;
  if (learnerId && [...document.querySelector("#intervention-learner").options].some((option) => option.value === learnerId)) {
    document.querySelector("#intervention-learner").value = learnerId;
  }
  document.querySelector("#intervention-due-date").value = getLocalDateValue();
  document.querySelector("#intervention-dialog").showModal();
  document.querySelector("#intervention-learner").focus();
}

function openInterventionUpdate(interventionId) {
  const record = interventionRecords.find((item) => item.id === interventionId);
  if (!record) {
    return;
  }
  interventionDialogMode = "update";
  editingInterventionId = interventionId;
  document.querySelector("#intervention-form").reset();
  document.querySelector("#intervention-dialog-title").textContent = "Update support plan";
  document.querySelector("#intervention-dialog-description").textContent = "Record progress and the next step.";
  document.querySelector("#intervention-create-fields").hidden = true;
  document.querySelector("#intervention-update-fields").hidden = false;
  document.querySelector("#save-intervention").textContent = "Save update";
  document.querySelector("#intervention-error").textContent = "";
  document.querySelector("#intervention-status").value = record.status;
  document.querySelector("#intervention-update").value = "";

  const detailList = document.querySelector("#intervention-detail-list");
  const details = [
    ["Learner", getInterventionLearnerLabel(record.learnerId)],
    ["Warning or reason", record.source],
    ["Planned support", record.action],
    ["Assigned staff", record.assignedTo],
    ["Next check-in", formatInterventionDate(record.dueDate)],
  ];
  detailList.replaceChildren(...details.map(([label, value]) => {
    const item = document.createElement("div");
    const term = document.createElement("dt");
    term.textContent = label;
    const description = document.createElement("dd");
    description.textContent = value;
    item.append(term, description);
    return item;
  }));

  const history = document.querySelector("#intervention-update-history");
  history.replaceChildren();
  record.updates.forEach((update) => {
    const item = document.createElement("article");
    const note = document.createElement("p");
    note.textContent = update.note;
    const meta = document.createElement("small");
    meta.textContent = `${interventionStatuses[update.status]} · ${new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(update.timestamp)}`;
    item.append(note, meta);
    history.append(item);
  });
  document.querySelector("#intervention-dialog").showModal();
  document.querySelector("#intervention-status").focus();
}

function saveIntervention(event) {
  event.preventDefault();
  const error = document.querySelector("#intervention-error");

  if (interventionDialogMode === "create") {
    const learner = document.querySelector("#intervention-learner");
    const source = document.querySelector("#intervention-source");
    const action = document.querySelector("#intervention-action");
    const assignee = document.querySelector("#intervention-assignee");
    const dueDate = document.querySelector("#intervention-due-date");
    action.setCustomValidity(action.value.trim() ? "" : "Enter a planned support action.");
    assignee.setCustomValidity(assignee.value.trim() ? "" : "Enter an assigned staff label.");
    if (![learner, source, action, assignee, dueDate].every((field) => field.reportValidity())) {
      return;
    }

    const sourceWarningId = source.value === "general" ? null : source.value;
    interventionRecords.unshift({
      id: `support-${++interventionSequence}`,
      learnerId: learner.value,
      sourceWarningId,
      source: source.selectedOptions[0].textContent,
      action: action.value.trim(),
      assignedTo: assignee.value.trim(),
      dueDate: dueDate.value,
      status: "planned",
      updates: [{
        note: "Plan created.",
        status: "planned",
        timestamp: new Date(),
      }],
    });
    const persisted = persistSupportData();
    document.querySelector("#intervention-dialog").close();
    renderInterventions();
    showToast(persisted ? "Support plan created." : "Support plan created for this session only.");
    return;
  }

  const record = interventionRecords.find((item) => item.id === editingInterventionId);
  const status = document.querySelector("#intervention-status");
  const note = document.querySelector("#intervention-update").value.trim();
  if (!record || !status.reportValidity()) {
    return;
  }
  if (record.status === status.value && !note) {
    error.textContent = "Add a follow-up update or change the progress status.";
    return;
  }

  record.status = status.value;
  record.updates.push({
    note: note || `Progress changed to ${interventionStatuses[status.value]}.`,
    status: status.value,
    timestamp: new Date(),
  });
  const persisted = persistSupportData();
  document.querySelector("#intervention-dialog").close();
  renderInterventions();
  showToast(persisted ? "Support plan updated." : "Support plan updated for this session only.");
}

function getStudentRecords() {
  return Object.entries(sectionRosters).flatMap(([section, learners]) => learners.map((learnerId) => ({
    learnerId,
    section,
    grade: section.split("-")[0],
    name: learnerProfiles.get(learnerId)?.name || "",
    gender: learnerProfiles.get(learnerId)?.gender || "boy",
  })));
}

function renderStudentDirectory() {
  const search = document.querySelector("#student-search").value.trim().toLowerCase();
  const selectedGrade = document.querySelector("#student-grade-filter").value;
  const selectedSection = document.querySelector("#student-section-filter").value;
  const selectedGender = document.querySelector("#student-gender-filter").value;
  const records = getStudentRecords();
  const filteredRecords = records.filter((record) => {
    const matchesSearch = !search || record.learnerId.toLowerCase().includes(search) || record.name.toLowerCase().includes(search);
    const matchesGrade = selectedGrade === "all" || record.grade === selectedGrade;
    const matchesSection = selectedSection === "all" || record.section === selectedSection;
    const matchesGender = selectedGender === "all" || record.gender === selectedGender;
    return matchesSearch && matchesGrade && matchesSection && matchesGender;
  });
  const tbody = document.querySelector("#student-list-body");
  const fragment = document.createDocumentFragment();

  filteredRecords.forEach((record) => {
    const row = document.createElement("tr");
    const learnerCell = document.createElement("td");
    const learner = document.createElement("div");
    learner.className = "student-id";
    const avatar = document.createElement("span");
    avatar.className = "student-id-avatar";
    avatar.setAttribute("aria-hidden", "true");
    avatar.textContent = "ID";
    const idCopy = document.createElement("span");
    idCopy.className = "student-id-copy";
    const name = document.createElement("strong");
    name.textContent = record.name || record.learnerId;
    const id = document.createElement("small");
    id.textContent = record.learnerId;
    idCopy.append(name, id);
    learner.append(avatar, idCopy);
    learnerCell.append(learner);

    const sectionCell = document.createElement("td");
    sectionCell.textContent = getSectionLabel(record.section);
    const genderCell = document.createElement("td");
    genderCell.textContent = record.gender === "boy" ? "Boy" : "Girl";
    const enrollmentCell = document.createElement("td");
    const enrollment = document.createElement("span");
    enrollment.className = "enrollment-badge";
    enrollment.textContent = "Enrolled";
    enrollmentCell.append(enrollment);

    const actionCell = document.createElement("td");
    const viewButton = document.createElement("button");
    viewButton.className = "student-view-button";
    viewButton.type = "button";
    viewButton.textContent = "Edit";
    viewButton.setAttribute("aria-label", `Edit learner ${record.learnerId}`);
    viewButton.addEventListener("click", () => openStudentDialog(record));
    actionCell.append(viewButton);

    row.append(learnerCell, sectionCell, genderCell, enrollmentCell, actionCell);
    fragment.append(row);
  });

  tbody.replaceChildren(fragment);
  document.querySelector("#student-total").textContent = String(records.length);
  document.querySelector("#student-grade-total").textContent = String(new Set(records.map((record) => record.grade)).size);
  document.querySelector("#student-section-total").textContent = String(new Set(records.map((record) => record.section)).size);
  document.querySelector("#student-record-count").textContent = `${filteredRecords.length} of ${records.length} records`;
  document.querySelector("#student-results-label").textContent = `Showing ${filteredRecords.length} ${filteredRecords.length === 1 ? "learner" : "learners"}`;
  document.querySelector("#student-empty").hidden = filteredRecords.length > 0;
}

function setStudentDialogMode(mode, record = null) {
  const dialog = document.querySelector("#student-dialog");
  const saveButton = document.querySelector("#save-student-button");
  const title = document.querySelector("#student-dialog-title");
  const description = document.querySelector("#student-dialog-description");
  const eyebrow = document.querySelector("#student-dialog-eyebrow");
  const idInput = document.querySelector("#new-student-id");
  const nameInput = document.querySelector("#new-student-name");
  const sectionSelect = document.querySelector("#new-student-section");
  const genderSelect = document.querySelector("#new-student-gender");

  studentDialogMode = mode;
  editingLearnerId = mode === "edit" && record ? record.learnerId : "";
  title.textContent = mode === "edit" ? "Edit learner" : "Add learner";
  eyebrow.textContent = "LEARNER DIRECTORY";
  description.textContent = mode === "edit"
    ? "Update this learner's section or gender."
    : "Choose an ID, section, and gender.";
  saveButton.textContent = mode === "edit" ? "Save changes" : "Add to roster";
  idInput.readOnly = mode === "edit";
  idInput.value = record?.learnerId || "";
  nameInput.value = record?.name || "";
  sectionSelect.value = record?.section || Object.keys(sectionRosters)[0];
  genderSelect.value = record?.gender || "boy";
  document.querySelector("#student-dialog-error").textContent = "";
  idInput.setCustomValidity("");

  if (!dialog.open) {
    dialog.showModal();
  }
  (mode === "edit" ? nameInput : nameInput).focus();
}

function openStudentDialog(record) {
  setStudentDialogMode("edit", record);
}

function moveLearnerRecords(map, oldSection, newSection, learnerId, nestedKey = "") {
  for (const [key, record] of map) {
    if (!key.startsWith(`${oldSection}|`)) {
      continue;
    }

    const source = nestedKey ? record[nestedKey] : record;
    if (!(learnerId in source)) {
      continue;
    }

    const nextKey = `${newSection}${key.slice(oldSection.length)}`;
    const destinationRecord = map.get(nextKey) || (nestedKey ? { ...record, [nestedKey]: {} } : {});
    const destination = nestedKey ? destinationRecord[nestedKey] : destinationRecord;
    destination[learnerId] = source[learnerId];
    delete source[learnerId];
    map.set(nextKey, destinationRecord);
  }
}

function moveLearnerToSection(learnerId, oldSection, newSection) {
  if (oldSection === newSection) {
    return;
  }
  sectionRosters[oldSection] = sectionRosters[oldSection].filter((id) => id !== learnerId);
  sectionRosters[newSection].push(learnerId);
  moveLearnerRecords(attendanceDrafts, oldSection, newSection, learnerId);
  moveLearnerRecords(savedAttendance, oldSection, newSection, learnerId, "statuses");
  moveLearnerRecords(academicDrafts, oldSection, newSection, learnerId);
  moveLearnerRecords(savedAcademicScores, oldSection, newSection, learnerId);
}

function addStudent(event) {
  event.preventDefault();
  const idInput = document.querySelector("#new-student-id");
  const nameInput = document.querySelector("#new-student-name");
  const sectionSelect = document.querySelector("#new-student-section");
  const genderSelect = document.querySelector("#new-student-gender");
  const error = document.querySelector("#student-dialog-error");
  const learnerId = idInput.value.trim().toUpperCase();
  const learnerName = nameInput.value.trim();
  idInput.value = learnerId;
  idInput.setCustomValidity("");
  nameInput.setCustomValidity(learnerName ? "" : "Enter a learner name.");
  error.textContent = "";

  if (studentDialogMode === "edit") {
    const record = getStudentRecords().find((item) => item.learnerId === editingLearnerId);
    if (!record || !nameInput.reportValidity() || !sectionSelect.reportValidity() || !genderSelect.reportValidity()) {
      return;
    }
    moveLearnerToSection(editingLearnerId, record.section, sectionSelect.value);
    learnerProfiles.set(editingLearnerId, { name: learnerName, gender: genderSelect.value });
    document.querySelector("#student-dialog").close();
    renderStudentDirectory();
    renderRoster();
    renderAcademicRoster();
    populateStructureControls();
    showToast("Learner profile updated.");
    return;
  }

  if (!nameInput.reportValidity() || !idInput.reportValidity() || !sectionSelect.reportValidity() || !genderSelect.reportValidity()) {
    return;
  }
  if (getStudentRecords().some((record) => record.learnerId === learnerId)) {
    idInput.setCustomValidity("This learner ID already exists.");
    error.textContent = "That learner ID is already in this roster.";
    idInput.reportValidity();
    return;
  }

  const section = sectionSelect.value;
  sectionRosters[section].push(learnerId);
  learnerProfiles.set(learnerId, { name: learnerName, gender: genderSelect.value });
  for (const [key, draft] of attendanceDrafts) {
    if (key.startsWith(`${section}|`)) {
      draft[learnerId] = "";
    }
  }
  for (const [key, record] of savedAttendance) {
    if (key.startsWith(`${section}|`)) {
      record.statuses[learnerId] = "";
    }
  }
  for (const [key, scores] of academicDrafts) {
    if (key.startsWith(`${section}|`)) {
      scores[learnerId] = "";
    }
  }
  for (const [key, scores] of savedAcademicScores) {
    if (key.startsWith(`${section}|`)) {
      scores[learnerId] = "";
    }
  }

  document.querySelector("#student-dialog").close();
  document.querySelector("#student-dialog-form").reset();
  populateStructureControls();
  renderStudentDirectory();
  renderRoster();
  renderAcademicRoster();
  showToast("Learner added to the section.");
}

function loadAttendanceSelection() {
  currentAttendanceKey = getAttendanceKey();
  if (!attendanceDrafts.has(currentAttendanceKey)) {
    const saved = savedAttendance.get(currentAttendanceKey);
    attendanceDrafts.set(currentAttendanceKey, saved ? { ...saved.statuses } : createBlankAttendance());
  }
  setAttendanceMessage();
  renderRoster();
}

function setCurrentView(view) {
  const isAttendance = view === "attendance";
  const isStudents = view === "students";
  const isAcademics = view === "academics";
  const isAlerts = view === "alerts";
  const isInterventions = view === "interventions";
  const isAnnouncements = view === "announcements";
  const isReports = view === "reports";
  document.querySelector("#overview-view").hidden = isAttendance || isStudents || isAcademics || isAlerts || isInterventions || isAnnouncements || isReports;
  document.querySelector("#attendance-view").hidden = !isAttendance;
  document.querySelector("#students-view").hidden = !isStudents;
  document.querySelector("#academics-view").hidden = !isAcademics;
  document.querySelector("#alerts-view").hidden = !isAlerts;
  document.querySelector("#interventions-view").hidden = !isInterventions;
  document.querySelector("#announcements-view").hidden = !isAnnouncements;
  document.querySelector("#reports-view").hidden = !isReports;
  const title = isAttendance ? "Attendance" : isStudents ? "Student records" : isAcademics ? "Academics" : isAlerts ? "Early warnings" : isInterventions ? "Interventions" : isAnnouncements ? "Announcements" : isReports ? "Reports" : "Overview";
  document.querySelector("#breadcrumb-current").textContent = title;
  document.title = `${title} · LNHS Monitoring System`;
  document.querySelectorAll(".nav-link[data-view]").forEach((navLink) => {
    const isActive = navLink.dataset.view === view;
    navLink.classList.toggle("active", isActive);
    if (isActive) {
      navLink.setAttribute("aria-current", "page");
    } else {
      navLink.removeAttribute("aria-current");
    }
  });
  closeMobileNavigation();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function saveAttendance(event) {
  event.preventDefault();
  const dateInput = document.querySelector("#attendance-date");
  if (!dateInput.value || !dateInput.reportValidity()) {
    setAttendanceMessage("Choose a valid attendance date.", "error");
    dateInput.focus();
    return;
  }

  const draft = getCurrentDraft();
  const unmarkedLearners = Object.keys(draft).filter((learnerId) => !draft[learnerId]);
  if (unmarkedLearners.length > 0) {
    setAttendanceMessage(`Select a status for all learners. ${unmarkedLearners.length} still unmarked.`, "error");
    document.querySelector(`[aria-label="Attendance status for learner ${unmarkedLearners[0]}"]`)?.focus();
    return;
  }

  const previous = savedAttendance.get(currentAttendanceKey)?.statuses;
  const changes = previous
    ? Object.keys(draft).filter((learnerId) => draft[learnerId] !== previous[learnerId]).length
    : Object.keys(draft).length;

  if (changes === 0) {
    setAttendanceMessage("There are no new changes to save.", "success");
    return;
  }

  const date = dateInput.value;
  const section = document.querySelector("#attendance-section").selectedOptions[0].textContent;
  const title = previous
    ? `Updated ${changes} attendance ${changes === 1 ? "record" : "records"}`
    : `Recorded attendance for ${changes} learners`;
  const savedAt = new Date();
  savedAttendance.set(currentAttendanceKey, {
    statuses: { ...draft },
    savedAt,
  });
  attendanceHistory.unshift({
    title,
    section,
    date,
    timestamp: savedAt,
  });
  if (attendanceHistory.length > 12) {
    attendanceHistory.pop();
  }

  const persisted = persistAttendanceData();
  renderAttendanceHistory();
  if (persisted) {
    setAttendanceMessage(`${title} for ${formatAttendanceDate(date)}.`, "success");
    showToast("Attendance saved.");
  } else {
    setAttendanceMessage(`${title} for ${formatAttendanceDate(date)}.`, "error");
    showToast("Attendance saved for this session only.");
  }
}

function saveAcademicScores(event) {
  event.preventDefault();
  const draft = getCurrentAcademicDraft();
  const assessment = getAcademicAssessment();
  const learnerIds = Object.keys(draft);
  const incompleteLearner = learnerIds.find((learnerId) => !isValidAcademicScore(draft[learnerId], assessment.maxScore));

  if (incompleteLearner) {
    setAcademicMessage(`Enter a score from 0 to ${assessment.maxScore} for every learner.`, "error");
    const search = document.querySelector("#academic-search");
    if (search.value) {
      search.value = "";
      renderAcademicRoster();
    }
    const input = document.querySelector(`.academic-score-input[data-learner-id="${incompleteLearner}"]`);
    input?.focus();
    input?.reportValidity();
    return;
  }

  const previous = savedAcademicScores.get(currentAcademicKey);
  const changes = previous
    ? learnerIds.filter((learnerId) => draft[learnerId] !== previous[learnerId]).length
    : learnerIds.length;

  if (changes === 0) {
    setAcademicMessage("There are no new changes to save.", "success");
    return;
  }

  savedAcademicScores.set(currentAcademicKey, { ...draft });
  const section = document.querySelector("#academic-section").selectedOptions[0].textContent;
  if (persistAcademicData()) {
    setAcademicMessage(`Saved ${assessment.title} scores for ${section}.`, "success");
    showToast("Activity scores saved.");
  } else {
    setAcademicMessage(`Scores updated for ${assessment.title} in ${section}.`, "error");
    showToast("Scores saved for this session only.");
  }
}

function createAcademicActivity(event) {
  event.preventDefault();
  const nameInput = document.querySelector("#academic-activity-name");
  const pointsInput = document.querySelector("#academic-activity-points");
  const error = document.querySelector("#academic-activity-error");
  const title = nameInput.value.trim();
  const maxScore = Number(pointsInput.value);
  error.textContent = "";

  if (!title) {
    nameInput.setCustomValidity("Enter an activity name.");
    nameInput.reportValidity();
    return;
  }
  nameInput.setCustomValidity("");
  if (!pointsInput.reportValidity() || !Number.isFinite(maxScore) || maxScore <= 0) {
    return;
  }

  const subject = document.querySelector("#academic-subject").value;
  const activity = {
    id: createAcademicActivityId(),
    title,
    maxScore,
  };
  academicActivities[subject].push(activity);
  const persisted = persistAcademicData();
  document.querySelector("#academic-activity-dialog").close();
  document.querySelector("#academic-activity-form").reset();
  document.querySelector("#academic-activity-points").value = "20";
  loadAcademicSelection();
  document.querySelector("#academic-activity").value = activity.id;
  loadAcademicSelection();
  if (persisted) {
    showToast(`${title} added.`);
  } else {
    setAcademicMessage(`${title} added for this session only.`, "error");
    showToast("Activity added for this session only.");
  }
}

restoreAttendanceData();
restoreAcademicData();
restoreSupportData();
updateDateAndGreeting();
updateAttendanceChart(document.querySelector("#period-select").value);
populateStructureControls();
renderClassSetup();
renderStudentDirectory();
loadAcademicSelection();
renderInterventions();
renderAnnouncements();
updateReportControls();
updateSupportPersistenceNotice();
const attendanceDate = document.querySelector("#attendance-date");
attendanceDate.value = getLocalDateValue();
attendanceDate.max = getLocalDateValue();
loadAttendanceSelection();
renderAttendanceHistory();
document.querySelector("#report-date").value = getLocalDateValue();

document.querySelector("#period-select").addEventListener("change", (event) => {
  updateAttendanceChart(event.currentTarget.value);
});

document.querySelector("#attendance-section").addEventListener("change", loadAttendanceSelection);
document.querySelector("#attendance-gender-filter").addEventListener("change", renderRoster);
attendanceDate.addEventListener("change", loadAttendanceSelection);
document.querySelector("#roster-search").addEventListener("input", renderRoster);
document.querySelector("#attendance-form").addEventListener("submit", saveAttendance);
document.querySelector("#academic-section").addEventListener("change", loadAcademicSelection);
document.querySelector("#academic-subject").addEventListener("change", loadAcademicSelection);
document.querySelector("#academic-activity").addEventListener("change", loadAcademicSelection);
document.querySelector("#academic-search").addEventListener("input", renderAcademicRoster);
document.querySelector("#academic-form").addEventListener("submit", saveAcademicScores);
document.querySelectorAll([
  "#new-student-name",
  "#academic-activity-name",
  "#intervention-action",
  "#intervention-assignee",
  "#announcement-title",
  "#announcement-body",
].join(", ")).forEach((input) => {
  input.addEventListener("input", () => input.setCustomValidity(""));
});
const studentIdInput = document.querySelector("#new-student-id");
studentIdInput.addEventListener("input", () => {
  studentIdInput.setCustomValidity("");
  document.querySelector("#student-dialog-error").textContent = "";
});
document.querySelector("#add-intervention-button").addEventListener("click", () => openInterventionCreate());
document.querySelector("#intervention-status-filter").addEventListener("change", renderInterventions);
document.querySelector("#intervention-form").addEventListener("submit", saveIntervention);
document.querySelector("#close-intervention-dialog").addEventListener("click", () => document.querySelector("#intervention-dialog").close());
document.querySelector("#cancel-intervention").addEventListener("click", () => document.querySelector("#intervention-dialog").close());
document.querySelector("#create-announcement-button").addEventListener("click", openAnnouncementDialog);
document.querySelector("#announcement-status-filter").addEventListener("change", renderAnnouncements);
document.querySelector("#announcement-form").addEventListener("submit", saveAnnouncement);
document.querySelector("#announcement-audience").addEventListener("change", (event) => {
  const isSection = event.currentTarget.value === "section";
  document.querySelector("#announcement-section-field").hidden = !isSection;
  document.querySelector("#announcement-section").required = isSection;
});
document.querySelector("#close-announcement-dialog").addEventListener("click", () => document.querySelector("#announcement-dialog").close());
document.querySelector("#cancel-announcement").addEventListener("click", () => document.querySelector("#announcement-dialog").close());
document.querySelector("#report-type").addEventListener("change", updateReportControls);
document.querySelector("#report-subject").addEventListener("change", updateReportControls);
document.querySelector("#generate-report").addEventListener("click", generateSelectedReport);
document.querySelector("#print-report").addEventListener("click", () => window.print());
document.querySelector("#add-academic-activity").addEventListener("click", () => {
  const nameInput = document.querySelector("#academic-activity-name");
  nameInput.setCustomValidity("");
  nameInput.value = "";
  document.querySelector("#academic-activity-error").textContent = "";
  document.querySelector("#academic-activity-dialog").showModal();
  nameInput.focus();
});
document.querySelector("#academic-activity-form").addEventListener("submit", createAcademicActivity);
document.querySelector("#close-academic-activity-dialog").addEventListener("click", () => {
  document.querySelector("#academic-activity-dialog").close();
});
document.querySelector("#cancel-academic-activity").addEventListener("click", () => {
  document.querySelector("#academic-activity-dialog").close();
});
document.querySelector("#clear-academic").addEventListener("click", () => {
  const saved = savedAcademicScores.get(currentAcademicKey);
  academicDrafts.set(currentAcademicKey, saved ? { ...saved } : createBlankAcademicScores());
  setAcademicMessage("Unsaved changes cleared.", "success");
  renderAcademicRoster();
});
document.querySelector("#back-to-overview").addEventListener("click", () => setCurrentView("overview"));
document.querySelector("#student-search").addEventListener("input", renderStudentDirectory);
document.querySelector("#student-grade-filter").addEventListener("change", renderStudentDirectory);
document.querySelector("#student-section-filter").addEventListener("change", renderStudentDirectory);
document.querySelector("#student-gender-filter").addEventListener("change", renderStudentDirectory);
document.querySelector("#add-student-button").addEventListener("click", () => {
  document.querySelector("#new-student-id").setCustomValidity("");
  document.querySelector("#student-dialog-error").textContent = "";
  document.querySelector("#student-dialog-form").reset();
  setStudentDialogMode("add");
});
document.querySelector("#student-dialog-form").addEventListener("submit", addStudent);
document.querySelector("#close-student-dialog").addEventListener("click", () => document.querySelector("#student-dialog").close());
document.querySelector("#cancel-student-dialog").addEventListener("click", () => document.querySelector("#student-dialog").close());
document.querySelector("#manage-classes-button").addEventListener("click", () => {
  document.querySelector("#class-setup-error").textContent = "";
  populateStructureControls();
  renderClassSetup();
  document.querySelector("#class-setup-dialog").showModal();
});
document.querySelector("#close-class-setup").addEventListener("click", () => document.querySelector("#class-setup-dialog").close());
document.querySelector("#done-class-setup").addEventListener("click", () => document.querySelector("#class-setup-dialog").close());
document.querySelector("#add-grade-level").addEventListener("click", addGradeLevel);
document.querySelector("#add-section").addEventListener("click", addSection);

document.querySelector("#mark-all-present").addEventListener("click", () => {
  const draft = getCurrentDraft();
  Object.keys(draft).forEach((learnerId) => {
    draft[learnerId] = "present";
  });
  attendanceDrafts.set(currentAttendanceKey, draft);
  setAttendanceMessage("All learners marked present. Save to apply the changes.");
  renderRoster();
});

document.querySelector("#clear-attendance").addEventListener("click", () => {
  const saved = savedAttendance.get(currentAttendanceKey)?.statuses;
  attendanceDrafts.set(currentAttendanceKey, saved ? { ...saved } : createBlankAttendance());
  setAttendanceMessage("Unsaved changes cleared.", "success");
  renderRoster();
});

document.querySelectorAll("[data-view]").forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    const view = button.dataset.view;

    if (view === "overview") {
      setCurrentView("overview");
      return;
    }

    if (view === "attendance") {
      setCurrentView("attendance");
      return;
    }
    if (view === "students") {
      setCurrentView("students");
      return;
    }
    if (view === "academics") {
      setCurrentView("academics");
      return;
    }
    if (view === "interventions") {
      setCurrentView("interventions");
      return;
    }
    if (view === "announcements") {
      setCurrentView("announcements");
      return;
    }
    if (view === "reports") {
      setCurrentView("reports");
      return;
    }

    if (view === "alerts") {
      setCurrentView("alerts");
      return;
    }

    const labels = {
      students: "Student records",
      attendance: "Attendance",
      academics: "Academic records",
      interventions: "Interventions",
      announcements: "Announcements",
      reports: "Reports",
      settings: "Settings",
    };
    showToast(`${labels[view] || "This section"} is next on the build list.`);
  });
});

document.querySelectorAll("[data-action='attendance']").forEach((button) => {
  button.addEventListener("click", () => {
    setCurrentView("attendance");
  });
});

const filterButton = document.querySelector("#alert-filter");
let showUnreviewedOnly = false;

function createWarningCard(warning) {
  const sectionEntry = Object.entries(sectionRosters).find(([, roster]) => roster.includes(warning.learnerId));
  const learner = learnerProfiles.get(warning.learnerId);
  const categoryClass = warning.category === "Attendance" ? "attendance-tag" : warning.category === "Academic" ? "academic-tag" : "support-tag";
  const card = document.createElement("article");
  card.className = `alert-item${warning.isReviewed ? " acknowledged" : ""}`;
  card.dataset.warningId = warning.id;
  card.dataset.warningLearner = warning.learnerId;
  card.dataset.warningSource = warning.source;
  card.dataset.warningCategory = warning.category;

  const indicator = document.createElement("span");
  indicator.className = `alert-indicator ${warning.priority}`;
  indicator.setAttribute("aria-hidden", "true");

  const copy = document.createElement("div");
  copy.className = "alert-copy";
  const heading = document.createElement("div");
  const learnerName = document.createElement("strong");
  learnerName.textContent = learner ? learner.name : warning.learnerId;
  const tag = document.createElement("span");
  tag.className = `alert-tag ${categoryClass}`;
  tag.textContent = warning.category;
  const priority = document.createElement("span");
  priority.className = `warning-priority warning-priority-${warning.priority}`;
  priority.textContent = `${warning.priority} sample priority`;
  heading.append(learnerName, tag, priority);
  const details = document.createElement("p");
  details.textContent = warning.details;
  const metadata = document.createElement("small");
  metadata.textContent = `${sectionEntry ? getSectionLabel(sectionEntry[0]) : "Section not assigned"} · ${warning.recency}`;
  copy.append(heading, details, metadata);

  const actions = document.createElement("div");
  actions.className = "warning-actions";
  const review = document.createElement("button");
  review.className = "review-button";
  review.type = "button";
  review.dataset.warningAction = "review";
  review.textContent = warning.isReviewed ? "Reviewed" : "Review";
  review.disabled = warning.isReviewed;
  if (warning.isReviewed) {
    review.setAttribute("aria-label", "Warning acknowledged");
  }
  const plan = document.createElement("button");
  plan.className = "warning-plan-button";
  plan.type = "button";
  plan.dataset.warningAction = "plan";
  plan.textContent = "Plan";
  actions.append(review, plan);
  card.append(indicator, copy, actions);
  return card;
}

function updateWarningCounts() {
  const needsReview = warningRecords.filter((warning) => !warning.isReviewed).length;
  const reviewed = warningRecords.length - needsReview;
  document.querySelector("#open-alert-total").textContent = String(needsReview);
  document.querySelector("#sidebar-alert-count").textContent = String(needsReview);
  document.querySelector("#warning-needs-review").textContent = String(needsReview);
  document.querySelector("#warning-reviewed").textContent = String(reviewed);
  document.querySelector("#warning-total").textContent = String(warningRecords.length);
  document.querySelector("#warning-reviewed").nextElementSibling.textContent = "Acknowledged in this browser";
}

function renderWarningBoard() {
  const dashboardList = document.querySelector("#alert-list");
  const boardList = document.querySelector("#warning-board-list");
  const categoryFilter = document.querySelector("#warning-category-filter").value;
  const statusFilter = document.querySelector("#warning-status-filter").value;
  const query = document.querySelector("#warning-search").value.trim().toLocaleLowerCase();
  const dashboardVisible = warningRecords.filter((warning) => !showUnreviewedOnly || !warning.isReviewed);
  const boardVisible = warningRecords.filter((warning) => {
    const matchesCategory = categoryFilter === "all" || warning.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || (statusFilter === "reviewed") === warning.isReviewed;
    const learnerName = learnerProfiles.get(warning.learnerId)?.name || warning.learnerId;
    const matchesSearch = `${learnerName} ${warning.learnerId} ${warning.category} ${warning.details}`.toLocaleLowerCase().includes(query);
    return matchesCategory && matchesStatus && matchesSearch;
  });

  dashboardList.replaceChildren(...dashboardVisible.map(createWarningCard));
  boardList.replaceChildren(...boardVisible.map(createWarningCard));
  document.querySelector("#empty-search").hidden = dashboardVisible.length > 0;
  document.querySelector("#warning-empty").hidden = boardVisible.length > 0;
  document.querySelector("#warning-result-count").textContent = `${boardVisible.length} ${boardVisible.length === 1 ? "warning" : "warnings"}`;
  filterButton.classList.toggle("selected", showUnreviewedOnly);
  filterButton.setAttribute("aria-pressed", String(showUnreviewedOnly));
  filterButton.innerHTML = showUnreviewedOnly
    ? '<svg aria-hidden="true" viewBox="0 0 20 20"><path d="M3 5h14M5.5 10h9M8 15h4"/></svg> Show all'
    : '<svg aria-hidden="true" viewBox="0 0 20 20"><path d="M3 5h14M5.5 10h9M8 15h4"/></svg> Filter';
  updateWarningCounts();
}

filterButton.setAttribute("aria-pressed", "false");
filterButton.addEventListener("click", () => {
  showUnreviewedOnly = !showUnreviewedOnly;
  renderWarningBoard();
});
document.querySelector("#warning-category-filter").addEventListener("change", renderWarningBoard);
document.querySelector("#warning-status-filter").addEventListener("change", renderWarningBoard);
document.querySelector("#warning-search").addEventListener("input", renderWarningBoard);
document.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) {
    return;
  }
  const button = event.target.closest("[data-warning-action]");
  const card = button?.closest(".alert-item");
  if (!button || !card) {
    return;
  }
  const warning = warningRecords.find((record) => record.id === card.dataset.warningId);
  if (!warning) {
    return;
  }
  if (button.dataset.warningAction === "review" && !warning.isReviewed) {
    warning.isReviewed = true;
    const persisted = persistSupportData();
    renderWarningBoard();
    showToast(persisted ? "Warning acknowledged." : "Warning acknowledged for this session only.");
  } else if (button.dataset.warningAction === "plan") {
    setCurrentView("interventions");
    openInterventionCreate(warning.id, warning.learnerId);
  }
});
renderWarningBoard();

document.querySelector("#notification-button").addEventListener("click", () => {
  setCurrentView("announcements");
});

const menuButton = document.querySelector("#mobile-menu");
const sidebar = document.querySelector("#sidebar");
const backdrop = document.querySelector("#sidebar-backdrop");
const sidebarCloseButton = document.querySelector("#sidebar-close");

menuButton.addEventListener("click", () => {
  const isOpen = sidebar.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  backdrop.hidden = !isOpen;
  if (isOpen) {
    sidebarCloseButton.focus();
  }
});

sidebarCloseButton.addEventListener("click", closeMobileNavigation);
backdrop.addEventListener("click", closeMobileNavigation);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMobileNavigation();
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 700) {
    closeMobileNavigation();
  }
});