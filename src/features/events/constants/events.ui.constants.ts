export const FEATURED_SLIDE_INTERVAL = 5000;

export const EVENT_CREATE_WIZARD_STEPS = [
  "Basic Info",
  "Organiser & Scope",
  "Date & Venue",
  "Media",
  "Registration & Settings",
  "Review",
] as const;

export const MANAGE_PANEL_SECTIONS = [
  {
    value: "publishing",
    label: "Publishing",
  },
  {
    value: "co-owners",
    label: "Co-owners",
  },
  {
    value: "collaborators",
    label: "Collaborators",
  },
  {
    value: "history",
    label: "History",
  },
] as const;

export type ManagePanelSectionValue =
  (typeof MANAGE_PANEL_SECTIONS)[number]["value"];
