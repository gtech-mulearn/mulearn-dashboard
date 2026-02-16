/*
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
    /** GET - Public user activity log */
    publicLog: (muid: string) => `/api/v1/dashboard/profile/user-log/${muid}/`,
    /** GET - User levels */
    levels: "/api/v1/dashboard/profile/get-user-levels/",
    /** GET - Public user levels */
    publicLevels: (muid: string) =>
      `/api/v1/dashboard/profile/get-user-levels/${muid}/`,
    /** PUT - Toggle profile public/private */
    shareProfile: "/api/v1/dashboard/profile/share-user-profile/",
    /** GET - User socials */
    socials: "/api/v1/dashboard/profile/socials/",
    /** PUT - Update user socials */
    socialsEdit: "/api/v1/dashboard/profile/socials/edit/",
    /** PATCH - Update user's interest groups */
    interestGroups: "/api/v1/dashboard/profile/ig-edit/",
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
    /** GET - Events (OpenSheet or dashboard events) */
    events:
      "https://opensheet.elk.sh/19Os47FI_fAgpMk7lnhFWz9aRwyd72cB-4PKz7W8rF9g/1",
  },

  // ============================================
  // Campus Endpoints
  // ============================================
  campus: {
    /** GET - Currrent campus info */
    info: (campusId: string) => `/api/v1/dashboard/campus/${campusId}/`,
    /** GET - Campus weekly karma */
    weeklykarma: (campusId: string) =>
      `/api/v1/dashboard/campus/weekly-karma/${campusId}/`,
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
    /** GET - Wadhwani college leaderboard */
    wadhwaniCollege: "/api/v1/leaderboard/wadhwani-college/",
    /** GET - Wadhwani zonal leaderboard */
    wadhwaniZonal: "/api/v1/leaderboard/wadhwani-zonal/",
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

  // ============================================
  // College Endpoints
  // ============================================
  college: {
    /** GET - List all colleges (paginated) */
    list: "/api/v1/dashboard/college/",
  },

  // ============================================
  // Achievements Endpoints
  // ============================================
  achievements: {
    /** GET - List user achievements */
    userAchievements: (muid: string) =>
      `/api/v1/dashboard/achievement/list/user/${muid}/`,
    /** POST - Issue VC and save URL */
    issueVC: "/api/v1/dashboard/achievement/issue-vc/",
  },

  // ============================================
  // QSeverse Integration Endpoints
  // ============================================
  qseverse: {
    /** POST - Issue Verifiable Credential */
    issueVC: "/api/v1/integrations/qseverse/issue-vc/",
    /** GET - Get connected DIDs for user */
    connectedUsers: (muid: string) =>
      `/api/v1/integrations/qseverse/connected-users/search?key=muid&value=${muid}`,
  },

  // ============================================
  // Learning Circle Endpoints
  // ============================================
  learningCircle: {
    // Circle Management
    /** GET - List all learning circles */
    list: "/api/v1/dashboard/learningcircle/list/",
    /** GET - Get circle details */
    info: (id: string) => `/api/v1/dashboard/learningcircle/info/${id}/`,
    /** POST - Create learning circle */
    create: "/api/v1/dashboard/learningcircle/create/",
    /** PUT - Edit learning circle */
    edit: (id: string) => `/api/v1/dashboard/learningcircle/edit/${id}/`,
    /** DELETE - Delete learning circle */
    delete: (id: string) => `/api/v1/dashboard/learningcircle/delete/${id}/`,
    /** GET - Get circle members */
    members: (id: string) => `/api/v1/dashboard/learningcircle/members/${id}/`,

    // Meeting Management
    /** POST - Create meeting for circle */
    meetingCreate: (circleId: string) =>
      `/api/v1/dashboard/learningcircle/meeting/create/${circleId}/`,
    /** GET - List meetings for circle */
    meetingList: (circleId: string) =>
      `/api/v1/dashboard/learningcircle/meeting/list/${circleId}/`,
    /** GET - List all public meetings */
    meetingListPublic: "/api/v1/dashboard/learningcircle/meeting/list-public/",
    /** GET - List user's meetings */
    meetingListUser: "/api/v1/dashboard/learningcircle/meeting/list/",
    /** GET - Get meeting details */
    meetingInfo: (id: string) =>
      `/api/v1/dashboard/learningcircle/meeting/info/${id}/`,
    /** PUT - Edit meeting */
    meetingEdit: (id: string) =>
      `/api/v1/dashboard/learningcircle/meeting/edit/${id}/`,
    /** DELETE - Delete meeting */
    meetingDelete: (id: string) =>
      `/api/v1/dashboard/learningcircle/meeting/delete/${id}/`,

    // Meeting Participation
    /** POST - RSVP to meeting */
    meetingRsvp: (id: string) =>
      `/api/v1/dashboard/learningcircle/meeting/rsvp/${id}/`,
    /** POST - Join meeting with code */
    meetingJoin: (id: string) =>
      `/api/v1/dashboard/learningcircle/meeting/join/${id}/`,
    /** DELETE - Leave meeting */
    meetingLeave: (id: string) =>
      `/api/v1/dashboard/learningcircle/meeting/leave/${id}/`,

    // Meeting Reports
    /** POST/GET/DELETE - Attendee report */
    attendeeReport: (id: string) =>
      `/api/v1/dashboard/learningcircle/meeting/attendee-report/${id}/`,
    /** POST/GET/DELETE - Meeting report (organizer) */
    meetingReport: (id: string) =>
      `/api/v1/dashboard/learningcircle/meeting/report/${id}/`,
  },

  // ============================================
  // Integrations - Courses (Wadhwani + OpenGrad)
  // ============================================
  integrations: {
    wadhwani: {
      /** POST - Get client token */
      token: "/api/v1/integrations/wadhwani/auth-token/",
      /** POST - Get course list */
      courses: "/api/v1/integrations/wadhwani/course-details/",
      /** POST - Enroll/Login to course */
      enroll: "/api/v1/integrations/wadhwani/user-login/",
    },
    openGrad: {
      /** POST - Get client token */
      token: "/api/v1/integrations/OpenGrad/auth-token/",
      /** POST - Get course list */
      courses: "/api/v1/integrations/OpenGrad/course-details/",
      /** POST - Enroll/Login to course */
      enroll: "/api/v1/integrations/OpenGrad/user-login/",
    },
  },

  // ============================================
  // Search Endpoints
  // ============================================
  search: {
    students: "/api/v1/dashboard/user/search/",
    mentors: "/api/v1/dashboard/user/search/",
    colleges: "/api/v1/dashboard/organisation/institutes/college/",
    schools: "/api/v1/dashboard/organisation/institutes/school/",
  },
  // ============================================
  // URL Shortener Endpoints
  // ============================================
  urlShortener: {
    /** GET - List all short URLs */
    list: "/api/v1/url-shortener/list/",
    /** POST - Create new short URL */
    create: "/api/v1/url-shortener/create/",
    /** PUT - Edit short URL */
    edit: (id: string) => `/api/v1/url-shortener/edit/${id}/`,
    /** DELETE - Delete short URL */
    delete: (id: string) => `/api/v1/url-shortener/delete/${id}/`,
    /** GET - Get analytics for short URL */
    analytics: (id: string) => `/api/v1/url-shortener/get-analytics/${id}/`,
  },
} as const;

// Type for type-safe endpoint access
export type Endpoints = typeof endpoints;
