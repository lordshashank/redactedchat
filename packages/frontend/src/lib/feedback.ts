import type { FeedbackStatus } from "./types";

export const FEEDBACK_TYPE_ICON: Record<string, string> = {
  feature: "lightbulb",
  bug: "bug_report",
  improvement: "auto_awesome",
  question: "help",
};

export const FEEDBACK_STATUS_LABEL: Record<FeedbackStatus, string> = {
  open: "Open",
  under_review: "Reviewing",
  planned: "Planned",
  in_progress: "In Progress",
  done: "Done",
  rejected: "Rejected",
  duplicate: "Duplicate",
};

export const FEEDBACK_STATUS_COLOR: Record<FeedbackStatus, string> = {
  open: "text-on-surface-variant border-outline",
  under_review: "text-yellow-400 border-yellow-400/40",
  planned: "text-blue-400 border-blue-400/40",
  in_progress: "text-primary border-primary/40",
  done: "text-green-400 border-green-400/40",
  rejected: "text-red-400 border-red-400/40",
  duplicate: "text-on-surface-variant/50 border-outline/50",
};
