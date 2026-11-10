/**
 * Who a user is to "their" company, and what that lets them do.
 *
 * Release 1.91 lets three kinds of user act for a company, but only the
 * registering owner holds the platform `Company` role:
 *   - owner          — holds the `Company` role
 *   - co_admin       — accepted CompanyAdminLink delegate (can list admin links)
 *   - company_mentor — active COMPANY_MENTOR grant (can read company/profile/)
 * The capability matrix mirrors the backend's checks
 * (is_company_owner_or_admin / get_verified_company_for_mentor / owner-only
 * views), so the UI never offers an action the backend refuses.
 */

export type CompanyAccessRole = "owner" | "co_admin" | "company_mentor";

export interface CompanyAccessInput {
  /** The JWT carries the `Company` role (only the registering owner). */
  hasCompanyRole: boolean;
  /** GET company/admin-link/list/ succeeded (owner or accepted co-admin). */
  canListAdminLinks: boolean;
  /** GET company/profile/ succeeded (owner, co-admin or company mentor). */
  hasCompanyProfile: boolean;
}

export function resolveCompanyAccess(
  input: CompanyAccessInput,
): CompanyAccessRole | null {
  if (input.hasCompanyRole) return "owner";
  if (!input.hasCompanyProfile) return null;
  return input.canListAdminLinks ? "co_admin" : "company_mentor";
}

export interface CompanyCapabilities {
  editProfile: boolean;
  manageAdmins: boolean;
  leaveAsAdmin: boolean;
  deactivateCompany: boolean;
  createJobs: boolean;
  approveJobs: boolean;
  editTasks: boolean;
  createTasks: boolean;
  manageCollaborations: boolean;
  manageTemplates: boolean;
  publishImpact: boolean;
  nominateMentors: boolean;
  sponsorIg: boolean;
  viewAnalytics: boolean;
  viewFeedback: boolean;
  viewTalentPool: boolean;
  manageProblemStatements: boolean;
}

const NONE: CompanyCapabilities = {
  editProfile: false,
  manageAdmins: false,
  leaveAsAdmin: false,
  deactivateCompany: false,
  createJobs: false,
  approveJobs: false,
  editTasks: false,
  createTasks: false,
  manageCollaborations: false,
  manageTemplates: false,
  publishImpact: false,
  nominateMentors: false,
  sponsorIg: false,
  viewAnalytics: false,
  viewFeedback: false,
  viewTalentPool: false,
  manageProblemStatements: false,
};

const OWNER: CompanyCapabilities = {
  ...(Object.fromEntries(
    Object.keys(NONE).map((key) => [key, true]),
  ) as unknown as CompanyCapabilities),
  leaveAsAdmin: false,
};

export const COMPANY_CAPABILITIES: Record<
  CompanyAccessRole,
  CompanyCapabilities
> = {
  owner: OWNER,
  co_admin: {
    ...OWNER,
    // Owner-only on the backend: profile PATCH, delegate invite/revoke,
    // self-deactivation, and problem statements (role_required Company).
    editProfile: false,
    manageAdmins: false,
    deactivateCompany: false,
    manageProblemStatements: false,
    leaveAsAdmin: true,
  },
  company_mentor: {
    ...NONE,
    // Mentor-created jobs go to Pending Approval; tasks may be created but
    // only the owner/co-admins edit or delete them.
    createJobs: true,
    createTasks: true,
    viewAnalytics: true,
    viewFeedback: true,
    viewTalentPool: true,
  },
};

export const NO_COMPANY_CAPABILITIES = NONE;

export type CompanyCapability = keyof CompanyCapabilities;

type CompanyPageRule = (
  can: CompanyCapabilities,
  role: CompanyAccessRole,
) => boolean;

/**
 * What each section under /dashboard/company needs. The sidebar and
 * CompanyAccessGate both read this table, so a link is never shown for a page
 * that would refuse the user.
 */
const COMPANY_PAGE_RULES: Record<string, CompanyPageRule> = {
  "/dashboard/company/jobs": (can) => can.createJobs,
  "/dashboard/company/tasks": (can) => can.createTasks,
  "/dashboard/company/mentors": (can) => can.nominateMentors,
  "/dashboard/company/analytics": (can) => can.viewAnalytics,
  "/dashboard/company/admin": (can) => can.manageAdmins || can.leaveAsAdmin,
  "/dashboard/company/feedback": (can) => can.viewFeedback,
  "/dashboard/company/collaborations": (can) => can.manageCollaborations,
  "/dashboard/company/ig-sponsorship": (can) => can.sponsorIg,
  "/dashboard/company/event-templates": (can) => can.manageTemplates,
  "/dashboard/company/profile/edit": (can) => can.editProfile,
  // Requesting a new interest group is an owner action (Company role).
  "/dashboard/company/ig-requests": (_, role) => role === "owner",
};

/**
 * Whether a user with this company role may open a /dashboard/company page.
 * Sections match on whole path segments (longest first); the overview and
 * anything without a rule are open to every company member.
 */
export function canOpenCompanyPage(
  pathname: string,
  role: CompanyAccessRole | null,
): boolean {
  if (!role) return false;
  const section = Object.keys(COMPANY_PAGE_RULES)
    .filter(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
    .sort((a, b) => b.length - a.length)[0];
  if (!section) return true;
  return COMPANY_PAGE_RULES[section](COMPANY_CAPABILITIES[role], role);
}
