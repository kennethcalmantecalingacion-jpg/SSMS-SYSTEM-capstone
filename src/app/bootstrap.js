import "../legacy/legacy-app.js";
import { initializeAuthShell } from "./auth-shell.js";
import { initializePwaSupport } from "./pwa.js";

initializePwaSupport();
initializeAuthShell();
