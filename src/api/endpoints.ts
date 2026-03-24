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
    /** POST - Create new company */
    createCompany: "/api/v1/register/company/create/",
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
    /** PATCH - Update user's profile fields */
    updateProfile: "/api/v1/dashboard/profile/",
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
    /** GET - Calendar events for dashboard */
    calendarEvents: "/api/v1/dashboard/events/calendar/",
  },

  // ============================================
  // Events Endpoints
  // ============================================

  events: {
    /** GET - List all events (paginated) */
    list: `/api/v1/dashboard/events/`,
    /** GET - Event details by ID */
    detail: (eventId: string) => `/api/v1/dashboard/events/${eventId}/`,
    /** POST - Create new event */
    create: "/api/v1/dashboard/events/",
    /** PUT - Edit event (full update) */
    edit: (eventId: string) => `/api/v1/dashboard/events/${eventId}/`,
    /** PATCH - Update event (partial update) */
    patch: (eventId: string) => `/api/v1/dashboard/events/${eventId}/`,
    /** DELETE - Delete event */
    delete: (eventId: string) => `/api/v1/dashboard/events/${eventId}/`,
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
  // Campus Manage Endpoints
  // ============================================
  campusManage: {
    // --- Campus Details ---
    /** GET - Authenticated Campus Lead/Enabler's campus details */
    details: "/api/v1/dashboard/campus/campus-details/",
    /** GET - Public campus details for a specific org */
    publicCampusDetail: (orgId: string) => `/api/v1/dashboard/campus/${orgId}/`,

    // --- Students & Leaderboard ---
    /** GET - Count of students in each MuLearn level */
    studentLevel: "/api/v1/dashboard/campus/student-level/",
    /** GET - Student levels for a specific org (public) */
    studentLevelByOrg: (orgId: string) =>
      `/api/v1/dashboard/campus/student-level/${orgId}/`,
    /** GET - Paginated student details (supports is_alumni filter) */
    studentDetails: "/api/v1/dashboard/campus/student-details/",
    /** GET - Download student details as CSV */
    studentDetailsCsv: "/api/v1/dashboard/campus/student-details/csv/",
    /** GET - Paginated student leaderboard for a specific campus */
    leaderboard: (orgId: string) =>
      `/api/v1/dashboard/campus/${orgId}/leaderboard/`,

    // --- Karma & Insights ---
    /** GET - Weekly karma insights for the authenticated campus */
    weeklyKarma: "/api/v1/dashboard/campus/weekly-karma/",
    /** GET - Weekly karma for a specific org (public) */
    weeklyKarmaByOrg: (orgId: string) =>
      `/api/v1/dashboard/campus/weekly-karma/${orgId}/`,
    /** GET - Karma distribution by cluster for a specific campus */
    karmaByCluster: (orgId: string) =>
      `/api/v1/dashboard/campus/${orgId}/karma-by-cluster/`,

    // --- Role Management & Execom ---
    /** GET - List Execom members | POST - Appoint a member to an Execom role */
    execom: "/api/v1/dashboard/campus/execom/",
    /** DELETE - Remove an Execom role from a member by role link ID */
    execomDelete: (memberId: string) =>
      `/api/v1/dashboard/campus/execom/${memberId}/`,
    /** POST - Transfer the Campus Lead role to another user by MUID */
    transferLeadRole: "/api/v1/dashboard/campus/transfer-lead-role/",
    /** POST - Transfer the Lead Enabler role to another user */
    transferEnablerRole: "/api/v1/dashboard/campus/transfer-enabler-role/",
    /** GET - List active IG codes | POST - Appoint a new IG Lead */
    transferIgRole: "/api/v1/dashboard/campus/transfer-ig-role/",

    // --- Event Management ---
    /** GET - Paginated campus events (supports status, scope, type, date filters) */
    events: "/api/v1/dashboard/campus/events/",
    /** GET - Ranked tag distribution across all campus events */
    eventsDistribution: "/api/v1/dashboard/campus/events/distribution/",

    // --- Other Utilities ---
    /** PATCH - Update a student's type/status within the campus org */
    changeStudentType: (memberId: string) =>
      `/api/v1/dashboard/campus/change-student-type/${memberId}/`,
    /** GET/POST - Campus IG chapters (authenticated user's campus) */
    igChapters: "/api/v1/dashboard/campus/ig-chapters/",
    /** PATCH/DELETE - Specific IG chapter management */
    igChapterDetail: (chapterId: string) =>
      `/api/v1/dashboard/campus/ig-chapters/${chapterId}/`,
    /** GET - Campus social links */
    socialLinks: (orgId: string) =>
      `/api/v1/dashboard/campus/${orgId}/social-links/`,
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
    /** GET - List all interest groups (optional: order_by field name) */
    list: (orderBy?: string) =>
      orderBy
        ? `/api/v1/dashboard/ig/list/?order_by=${encodeURIComponent(orderBy)}`
        : "/api/v1/dashboard/ig/list/",
    /** GET - Interest group details by ID */
    detail: (id: string) => `/api/v1/dashboard/ig/get/${id}/`,
  },

  // ============================================
  // College Endpoints
  // ============================================
  college: {
    /** GET - List all colleges (paginated) */
    list: "/api/v1/dashboard/college/",
    /** PATCH - Edit college */
    edit: "/api/v1/dashboard/college/change-college/",
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

    /** GET - List all achievements */
    list: "/api/v1/dashboard/achievement/list/",
    /** POST - Create new achievement */
    create: "/api/v1/dashboard/achievement/create/",
    /** PUT - Update achievement */
    update: (id: string) => `/api/v1/dashboard/achievement/update/${id}/`,
    /** DELETE - Delete achievement */
    delete: (id: string) => `/api/v1/dashboard/achievement/delete/${id}/`,

    /** GET - Rules Engine */
    rules: "/api/v1/dashboard/achievement/rules/",
    createRule: "/api/v1/dashboard/achievement/rules/create/",
    deactivateRule: (ruleId: string) =>
      `/api/v1/dashboard/achievement/rules/${ruleId}/deactivate/`,

    /** Simulation */
    simulate: (muid: string) =>
      `/api/v1/dashboard/achievement/simulate/${muid}/`,
    debug: (muid: string, achievementId: string) =>
      `/api/v1/dashboard/achievement/debug/${muid}/${achievementId}/`,

    /** Manual Issue / Revoke */
    manualIssue: "/api/v1/dashboard/achievement/manual-issue/",
    revoke: "/api/v1/dashboard/achievement/revoke/",

    /** Audit & Logs */
    auditLogs: (muid: string) => `/api/v1/dashboard/achievement/audit/${muid}/`,
    bulkIssue: "/api/v1/dashboard/achievement/bulk-issue/",
    bulkIssueTemplate: "/api/v1/dashboard/achievement/bulk-issue/template/",
    issuedLog: "/api/v1/dashboard/achievement/issued-log/",
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
    /** POST - Accept/reject pending member */
    membersAdd: (id: string) =>
      `/api/v1/dashboard/learningcircle/members/add/${id}/`,
    /** POST - Transfer lead role to a member */
    transferLead: (id: string) =>
      `/api/v1/dashboard/learningcircle/transfer-lead/${id}/`,
    /** POST - Request to join a circle */
    join: (id: string) => `/api/v1/dashboard/learningcircle/join/${id}/`,
    /** GET - User's own circles */
    userCircles: "/api/v1/dashboard/learningcircle/user-circles/",

    // Invite Management
    /** POST - Send an invite to a circle */
    invite: (id: string) => `/api/v1/dashboard/learningcircle/invite/${id}/`,
    /** GET - List sent invites for a circle */
    inviteSent: (id: string) =>
      `/api/v1/dashboard/learningcircle/invite/sent/${id}/`,
    /** GET/POST - Current user's pending invites */
    inviteStatus: "/api/v1/dashboard/learningcircle/invite/status/",
    /** GET/POST - Invite by link_id */
    inviteStatusByLink: (linkId: string) =>
      `/api/v1/dashboard/learningcircle/invite/status/${linkId}/`,

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
      /** GET - Wadhwani Sheet URL */
      sheet:
        "https://opensheet.elk.sh/1LEvZozIVVquXjSvtptQcjiU0_WFaxVuEYBCYyCdsCtY/sheet",
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
  // MuJourney Endpoints
  // ============================================
  mujourney: {
    /** GET - Get user levels with tasks and progress (logged-in) */
    getUserLevels: "/api/v1/dashboard/profile/get-user-levels/",
    /** GET - Get public levels list (no auth required) */
    publicListLevels: "/api/v1/public/list/levels/",
    /** GET - Get interest group tasks (params: ig_id, perPage) */
    taskList: "/api/v1/register/area-of-interest/list/",
    /** GET - Get public user journey by MUID */
    getPublicUserLevels: (muid: string) =>
      `/api/v1/dashboard/profile/get-user-levels/${muid}/`,
    /** GET - Get user level feed/history */
    userLevelFeed: "/api/v1/dashboard/profile/user-level-feed/",
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

  // ============================================
  // Admin Endpoints
  // ============================================
  admin: {
    errorLog: {
      /** GET - List all error log entries */
      list: "/api/v1/dashboard/error-log/",
      /** GET - Download log file by type (error, root, request), returns Blob */
      download: (type: string) => `/api/v1/dashboard/error-log/${type}/`,
      /** POST - Clear all logs of a given type */
      clear: (type: string) => `/api/v1/dashboard/error-log/clear/${type}/`,
      /** PATCH - Dismiss / delete a single log entry */
      dismiss: (id: string) => `/api/v1/dashboard/error-log/patch/${id}`,
    },
    dynamicType: {
      /** GET - List available roles for select dropdown */
      roles: "/api/v1/dashboard/dynamic-management/roles/",
      /** GET - List available types for select dropdown */
      types: "/api/v1/dashboard/dynamic-management/types/",

      // Dynamic Role-Type CRUD
      /** GET - List dynamic role-type mappings */
      dynamicRoles: "/api/v1/dashboard/dynamic-management/dynamic-role/",
      /** POST - Create a role-type mapping */
      createDynamicRole:
        "/api/v1/dashboard/dynamic-management/dynamic-role/create/",
      /** PATCH - Update a role-type mapping */
      updateDynamicRole: (id: string) =>
        `/api/v1/dashboard/dynamic-management/dynamic-role/update/${id}/`,
      /** DELETE - Delete a role-type mapping */
      deleteDynamicRole: (id: string) =>
        `/api/v1/dashboard/dynamic-management/dynamic-role/delete/${id}/`,

      // Dynamic User-Type CRUD
      /** GET - List dynamic user-type mappings */
      dynamicUsers: "/api/v1/dashboard/dynamic-management/dynamic-user/",
      /** POST - Create a user-type mapping */
      createDynamicUser:
        "/api/v1/dashboard/dynamic-management/dynamic-user/create/",
      /** PATCH - Update a user-type mapping */
      updateDynamicUser: (id: string) =>
        `/api/v1/dashboard/dynamic-management/dynamic-user/update/${id}/`,
      /** DELETE - Delete a user-type mapping */
      deleteDynamicUser: (id: string) =>
        `/api/v1/dashboard/dynamic-management/dynamic-user/delete/${id}/`,
    },
    karmaVoucher: {
      /** GET - List karma vouchers (paginated, sortable, searchable) */
      list: "/api/v1/dashboard/karma-voucher/",
      /** DELETE - Delete a karma voucher */
      delete: (id: string) => `/api/v1/dashboard/karma-voucher/delete/${id}/`,
      /** GET - Export voucher log as CSV */
      exportCSV: "/api/v1/dashboard/karma-voucher/export/",
      /** POST - Bulk import vouchers via XLSX */
      import: "/api/v1/dashboard/karma-voucher/import/",
      /** GET - Download XLSX import template */
      template: "/api/v1/dashboard/karma-voucher/base-template/",
    },
    roleVerification: {
      /** GET - List unverified user-role links (paginated) */
      list: "/api/v1/dashboard/user/verification/",
      /** PATCH - Update verification status */
      update: (linkId: string) =>
        `/api/v1/dashboard/user/verification/${linkId}/`,
      /** DELETE - Delete a user-role link */
      delete: (linkId: string) =>
        `/api/v1/dashboard/user/verification/${linkId}/`,
      /** GET - Download CSV of unverified links */
      csv: "/api/v1/dashboard/user/verification/csv/",
    },
  },

  // ============================================
  // Manage Users Endpoints
  // ============================================
  manageUsers: {
    /** GET - List users (query: perPage, pageIndex, search, sortBy) */
    list: "/api/v1/dashboard/user/",
    /** GET - Export users CSV */
    csv: "/api/v1/dashboard/user/csv/",

    /** GET - Get user details by ID */
    detail: (id: string) => `/api/v1/dashboard/user/${id}/`,
    /** PATCH - Update user by ID */
    update: (id: string) => `/api/v1/dashboard/user/${id}/`,
    /** DELETE - Delete user by ID */
    delete: (id: string) => `/api/v1/dashboard/user/${id}/`,

    /** GET - List communities */
    communities: "/api/v1/register/community/list/",
    /** GET - List roles */
    roles: "/api/v1/register/role/list/",
    /** GET - List area of interest / interest groups */
    areasOfInterest: "/api/v1/register/area-of-interest/list/",
    /** POST - List colleges by district */
    collegesByDistrict: "/api/v1/register/college/list/",
    /** POST - List schools by district */
    schoolsByDistrict: "/api/v1/register/schools/list/",
    /** GET - Search locations */
    locationSearch: (param: string) =>
      `/api/v1/register/location/?q=${param || "india"}`,
  },

  // ============================================
  // Manage Roles Endpoints
  // ============================================
  manageRoles: {
    /** GET - List all roles (paginated) | POST - Create a new role */
    list: "/api/v1/dashboard/roles/",
    /**POST-Create a new role */
    create: "/api/v1/dashboard/roles/",
    /** PATCH - Update a role */
    update: (roleId: string) => `/api/v1/dashboard/roles/${roleId}/`,
    /** DELETE - Delete a role */
    delete: (roleId: string) => `/api/v1/dashboard/roles/${roleId}/`,
    /** GET - Download roles CSV */
    csv: "/api/v1/dashboard/roles/csv/",
    /** GET - Search users with a specific role */
    userRoleSearch: (roleId: string) =>
      `/api/v1/dashboard/roles/user-role/${roleId}/`,
    /** POST - Assign role to single user | DELETE - Remove role from single user */
    userRole: "/api/v1/dashboard/roles/user-role/",
    /** GET - List users with role | PUT - List users without role | POST - Bulk assign | PATCH - Bulk remove */
    bulkAssign: (roleId: string) =>
      `/api/v1/dashboard/roles/bulk-assign/${roleId}/`,
    /** GET - Download Excel template */
    baseTemplate: "/api/v1/dashboard/roles/base-template/",
    /** POST - Bulk assign from Excel upload */
    bulkAssignExcel: "/api/v1/dashboard/roles/bulk-assign-excel/",
  },
} as const;

// Type for type-safe endpoint access
export type Endpoints = typeof endpoints;
