/**
 * Error Log Feature
 *
 * 📍 src/features/error-log/index.ts
 *
 * Public API for the error-log admin feature.
 */

// ── API Functions ──────────────────────────────────────────────────────────
export {
  clearLog,
  dismissLogEntry,
  downloadLogFile,
  fetchErrorLog,
} from "./api";

// ── Components ─────────────────────────────────────────────────────────────
export { ErrorLogPage } from "./components";

// ── Hooks ──────────────────────────────────────────────────────────────────
export {
  errorLogKeys,
  useClearLog,
  useDismissLogEntry,
  useDownloadLogFile,
  useErrorLog,
} from "./hooks";

// ── Schemas / Utilities ────────────────────────────────────────────────────
export {
  formatTimestamp,
  transformErrorLogEntry,
} from "./schemas";

// ── Types ──────────────────────────────────────────────────────────────────
export type { ErrorLogEntry, ErrorLogRawEntry, LogType } from "./types";
