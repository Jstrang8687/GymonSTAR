// Shared by the report form (client) and the moderation code (server), so
// the options a person sees are exactly the ones the server accepts.
export const REPORT_REASONS = [
  { value: "HARASSMENT", label: "Harassment or threats" },
  { value: "OFFENSIVE_NAME", label: "Offensive or misleading name" },
  { value: "CHEATING", label: "Cheating or fake workouts" },
  { value: "SPAM", label: "Spam" },
  { value: "OTHER", label: "Something else" },
] as const;

export type ReportReasonValue = (typeof REPORT_REASONS)[number]["value"];

export const REPORT_REASON_LABEL: Record<ReportReasonValue, string> = Object.fromEntries(
  REPORT_REASONS.map((r) => [r.value, r.label])
) as Record<ReportReasonValue, string>;
