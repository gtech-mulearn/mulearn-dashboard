/**
 * Tabs of the unified Role Verification page.
 *
 * 📍 src/features/role-verification/lib/tabs.ts
 *
 * The active tab lives only in the URL (?tab=), so hub cards and the
 * redirects from the retired pages can deep-link to a queue.
 */

export const VERIFICATION_TABS = [
  "mentor",
  "enabler",
  "college",
  "company",
] as const;

export type VerificationTab = (typeof VERIFICATION_TABS)[number];

export const VERIFICATION_TAB_LABELS: Record<VerificationTab, string> = {
  mentor: "Mentor",
  enabler: "Enabler",
  college: "College",
  company: "Company",
};

const DEFAULT_TAB: VerificationTab = "mentor";
const ROLE_VERIFICATION_PATH = "/dashboard/management/role-verification";

export function parseVerificationTab(
  value: string | null | undefined,
): VerificationTab {
  const normalized = (value ?? "").toLowerCase();
  return (VERIFICATION_TABS as readonly string[]).includes(normalized)
    ? (normalized as VerificationTab)
    : DEFAULT_TAB;
}

export function verificationTabHref(tab: VerificationTab): string {
  return `${ROLE_VERIFICATION_PATH}?tab=${tab}`;
}
