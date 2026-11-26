import dayjs from "dayjs";

/**
 * BRD 9.2 — all user-facing dates render as MM/DD/YYYY.
 * Accepts Date, ISO string, dayjs object, or timestamp.
 * Returns "" for null/invalid so it never renders "Invalid Date".
 */
export const formatDate = (value) => {
  if (value === null || value === undefined || value === "") return "";
  const d = dayjs(value);
  return d.isValid() ? d.format("MM/DD/YYYY") : "";
};

/**
 * Optional — date + time (still MM/DD/YYYY base).
 * e.g. "11/21/2026 · 2:30 PM"
 */
export const formatDateTime = (value) => {
  if (!value) return "";
  const d = dayjs(value);
  if (!d.isValid()) return "";
  return `${d.format("MM/DD/YYYY")} · ${d.format("h:mm A")}`;
};

/**
 * Optional — short month label for tight UI (chips, badges).
 * Still unambiguous; use only where MM/DD/YYYY won't fit.
 */
export const formatDateShort = (value) => {
  if (!value) return "";
  const d = dayjs(value);
  return d.isValid() ? d.format("MM/DD/YYYY") : "";
};