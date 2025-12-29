/**
 * Centralized API Endpoints
 *
 * 📍 src/api/endpoints.ts
 *
 * All Django URLs live here.
 * NO hardcoded URLs anywhere else in the app.
 */

export const endpoints = {
  // ============================================
  // Auth Endpoints
  // ============================================
  auth: {
    /** POST - Login with email/muid + password OR email/muid + OTP */
    login: "/api/v1/auth/user-authentication/",
    /** POST - Request OTP for login */
    requestOTP: "/api/v1/auth/request-otp/",
    /** POST - Get new access token using refresh token */
    refreshToken: "/api/v1/auth/get-access-token/",
    /** POST - Verify OTP token */
    verifyToken: "/api/v1/auth/token-verification/",
  },

  // ============================================
  // Password Reset Endpoints
  // ============================================
  password: {
    /** POST - Request password reset email */
    forgot: "/api/v1/dashboard/user/forgot-password/",
    /** POST - Reset password with token (token in URL) */
    reset: (token: string) => `/api/v1/dashboard/user/reset-password/${token}/`,
    /** POST - Verify reset token is valid */
    verifyResetToken: (token: string) =>
      `/api/v1/dashboard/user/reset-password/verify-token/${token}/`,
    /** POST - Change password (authenticated) */
    change: "/api/v1/dashboard/profile/change-password/",
  },

  // ============================================
  // Registration Endpoints
  // ============================================
  register: {
    /** POST - Create new user account */
    create: "/api/v1/register/",
    /** PUT - Validate registration data before submit */
    validate: "/api/v1/register/validate/",
    /** POST - Verify email doesn't exist */
    emailVerification: "/api/v1/register/email-verification/",
  },

  // ============================================
  // Onboarding - Organization Selection
  // ============================================
  onboarding: {
    /** GET - List of colleges */
    colleges: "/api/v1/register/colleges/",
    /** GET - List of departments */
    departments: "/api/v1/register/department/list/",
    /** GET - List of companies */
    companies: "/api/v1/register/company/list/",
    /** GET - List of roles */
    roles: "/api/v1/register/role/list/",
    /** GET - List of communities */
    communities: "/api/v1/register/community/list/",
    /** GET - List of areas of interest */
    areasOfInterest: "/api/v1/register/area-of-interest/list/",
    /** GET - Search locations */
    location: (query: string) => `/api/v1/register/location/?q=${query}`,
    /** POST - Select organization (college/company) after registration */
    selectOrganization: "/api/v1/dashboard/user/organization/",
    /** POST - Create new organization if not in list */
    createOrganization: "/api/v1/register/organization/create/",
    /** POST - Select learning domains/pathways */
    selectDomains: "/api/v1/register/select-domains/",
    /** POST - Select end goals */
    selectEndgoals: "/api/v1/register/select-endgoals/",
  },

  // ============================================
  // Onboarding - Location Cascading
  // ============================================
  location: {
    /** GET - List of countries */
    countries: "/api/v1/register/country/list/",
    /** POST - List of states (requires country) */
    states: "/api/v1/register/state/list/",
    /** POST - List of districts (requires state) */
    districts: "/api/v1/register/district/list/",
    /** POST - List of colleges in district */
    collegesInDistrict: "/api/v1/register/college/list/",
    /** GET - List of schools */
    schools: "/api/v1/register/schools/list/",
  },

  // ============================================
  // User Endpoints
  // ============================================
  user: {
    /** GET - Get current user info (lightweight) */
    info: "/api/v1/dashboard/user/info/",
    /** GET - Get full user profile */
    profile: "/api/v1/dashboard/profile/user-profile/",
    /** GET - Get public user profile */
    publicProfile: (muid: string) =>
      `/api/v1/dashboard/profile/user-profile/${muid}/`,
    /** GET/PUT - User preferences */
    preferences: "/api/v1/dashboard/user/preferences/",
    /** GET - User activity log */
    log: "/api/v1/dashboard/profile/user-log/",
    /** GET - User levels */
    levels: "/api/v1/dashboard/profile/get-user-levels/",
    /** PUT - Toggle profile public/private */
    shareProfile: "/api/v1/dashboard/profile/share-user-profile/",
    /** POST - Update profile image */
    updateProfileImage: "/api/v1/dashboard/user/profile/update/",
    /** DELETE - Delete user account */
    delete: "/api/v1/dashboard/user/",
  },

  // ============================================
  // Dashboard Endpoints
  // ============================================
  dashboard: {
    /** GET - Karma feed */
    karmaFeed: "/api/v1/dashboard/profile/karma-feed/",
    /** GET - Interest groups list */
    interestGroups: "/api/v1/dashboard/ig/list/",
  },

  // ============================================
  // Leaderboard Endpoints
  // ============================================
  leaderboard: {
    /** GET - Student leaderboard */
    students: "/api/v1/leaderboard/students/",
    /** GET - Monthly student leaderboard */
    studentsMonthly: "/api/v1/leaderboard/students-monthly/",
    /** GET - College leaderboard */
    college: "/api/v1/leaderboard/college/",
    /** GET - Monthly college leaderboard */
    collegeMonthly: "/api/v1/leaderboard/college-monthly/",
  },

  // ============================================
  // Interest Groups Endpoints
  // ============================================
  interestGroups: {
    /** GET - List all interest groups */
    list: "/api/v1/dashboard/ig/",
    /** GET - Interest group details */
    detail: (id: string) => `/api/v1/dashboard/ig/${id}/`,
  },
} as const;

// Type for type-safe endpoint access
export type Endpoints = typeof endpoints;
