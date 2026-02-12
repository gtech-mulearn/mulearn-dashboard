# Role-Based Access Control (RBAC)

> Developer guide for the mulearn-dashboard authorization system.

---

## Table of Contents

- [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
  - [Table of Contents](#table-of-contents)
  - [Architecture Overview](#architecture-overview)
  - [Layer 1 — Middleware (Edge)](#layer-1--middleware-edge)
    - [How route matching works](#how-route-matching-works)
    - [Why we decode but don't verify the JWT](#why-we-decode-but-dont-verify-the-jwt)
  - [Layer 2 — Server Components](#layer-2--server-components)
    - [`requireAuth()`](#requireauth)
    - [`requireRole(roles)`](#requireroleroles)
    - [`requirePermission(permission)`](#requirepermissionpermission)
    - [`getServerUser()`](#getserveruser)
  - [Layer 3 — Client Components](#layer-3--client-components)
    - [`<RoleGate>` component](#rolegate-component)
      - [Permission-based (recommended)](#permission-based-recommended)
      - [Role-based](#role-based)
      - [With fallback](#with-fallback)
    - [`<RoleExclude>` component](#roleexclude-component)
    - [`usePermissions()` hook](#usepermissions-hook)
  - [Layer 4 — Backend (Django)](#layer-4--backend-django)
  - [File Reference](#file-reference)
    - [Import paths](#import-paths)
  - [Roles](#roles)
    - [Dynamic IG Roles](#dynamic-ig-roles)
    - [Role Group Presets](#role-group-presets)
  - [Permissions](#permissions)
  - [How-To Guides](#how-to-guides)
    - [Adding a New Role](#adding-a-new-role)
    - [Adding a New Permission](#adding-a-new-permission)
    - [Protecting a New Route](#protecting-a-new-route)
    - [Protecting a Server Component Page](#protecting-a-server-component-page)
    - [Hiding a UI Element Based on Role](#hiding-a-ui-element-based-on-role)
    - [Checking Permissions in Client Logic](#checking-permissions-in-client-logic)
  - [Scalability \& Future Direction](#scalability--future-direction)
    - [Current approach: Hardcoded roles](#current-approach-hardcoded-roles)
    - [When to upgrade to backend-driven permissions](#when-to-upgrade-to-backend-driven-permissions)
    - [What stays the same regardless](#what-stays-the-same-regardless)

---

## Architecture Overview

Authorization uses a **defense-in-depth** approach with 4 layers. Each layer adds security independently — even if one layer is bypassed, the others still protect the system.

```
Request Flow:

  Browser ─► [1. Middleware] ─► [2. Server Component] ─► [3. Client UI] ─► [4. Backend API]
              (Edge)              (Node.js)               (Browser)         (Django)
              ──────              ──────────               ─────────         ────────
              Decode JWT,         Fetch user from          Show/hide UI      @role_required
              check route→role    backend, redirect        elements via      decorator rejects
              map. Blocks page    if role missing.          <RoleGate>        unauthorized API
              from loading.       Page never renders.       component.        calls.
```

> **IMPORTANT**: Layers 1–3 are for UX (preventing users from seeing pages they can't use). **Layer 4 (backend) is the only true security boundary.** Never rely solely on frontend checks.

---

## Layer 1 — Middleware (Edge)

**File**: `src/proxy.ts`

The middleware runs on every navigation request before any page component executes. It:

1. Checks if the user has a `accessToken` or `refreshToken` cookie
2. For role-protected routes, **decodes the JWT** (base64, no verification) and extracts the `roles` array
3. Matches the URL against a route→role map using **longest-prefix matching**
4. Redirects to `/dashboard?unauthorized=true` if the user's roles don't match

### How route matching works

```
URL: /dashboard/management/user-management/edit/123

Matching order:
  1. Exact: /dashboard/management/user-management/edit/123  → no match
  2. Prefix: /dashboard/management/user-management          → MATCH (ADMIN only)
  3. Prefix: /dashboard/management                          → would match but #2 is longer
  4. Prefix: /dashboard                                     → would match but #2 is longer

Winner: /dashboard/management/user-management → roles: [ADMIN]
```

### Why we decode but don't verify the JWT

The middleware runs on the **edge** (Vercel Edge Runtime / Node.js edge). We don't have the JWT secret here, and even if we did, verification would add latency to every route. Since the backend (Layer 4) always verifies the JWT on every API call, decoding here is sufficient for UX gating.

---

## Layer 2 — Server Components

**File**: `src/lib/auth/server.ts`

Use these functions in **Server Components** and **Server Actions** to enforce authorization before rendering:

### `requireAuth()`

Ensures the user is logged in. Redirects to `/login` if not.

```tsx
// src/app/(dashboard)/settings/page.tsx
import { requireAuth } from "@/lib/auth/server";

export default async function SettingsPage() {
  const user = await requireAuth();
  return <p>Welcome, {user.full_name}</p>;
}
```

### `requireRole(roles)`

Ensures the user has **at least one** of the specified roles. Redirects to `/dashboard?unauthorized=true` if not.

```tsx
// src/app/(dashboard)/admin/page.tsx
import { requireRole } from "@/lib/auth/server";
import { ROLES } from "@/lib/auth";

export default async function AdminPage() {
  const user = await requireRole([ROLES.ADMIN]);
  // This code ONLY executes for admins — the page never renders otherwise
  return <AdminDashboard />;
}
```

### `requirePermission(permission)`

Like `requireRole`, but uses the permission map instead of raw role strings.

```tsx
import { requirePermission } from "@/lib/auth/server";

export default async function UserManagementPage() {
  const user = await requirePermission("users:list");
  return <UserTable />;
}
```

### `getServerUser()`

Returns the user object or `null` without redirecting. Use this when you want to conditionally render rather than block.

```tsx
import { getServerUser } from "@/lib/auth/server";

export default async function ProfilePage() {
  const user = await getServerUser();
  return user ? <Profile user={user} /> : <PublicProfile />;
}
```

> **Note**: `getServerUser()` results are **cached for 60 seconds** by Next.js fetch cache with the `"user-info"` tag. Call `revalidateTag("user-info")` to bust the cache.

---

## Layer 3 — Client Components

### `<RoleGate>` component

**File**: `src/components/auth/role-gate.tsx`

Conditionally renders children based on user roles or permissions. Use this to **hide/show UI elements** like buttons, nav items, and panels.

#### Permission-based (recommended)

```tsx
import { RoleGate } from "@/components/auth";

<RoleGate permission="users:verify">
  <VerifyUserButton />
</RoleGate>
```

#### Role-based

```tsx
import { RoleGate } from "@/components/auth";
import { ROLES } from "@/lib/auth";

<RoleGate allowedRoles={[ROLES.ADMIN, ROLES.FELLOW]}>
  <ManagementPanel />
</RoleGate>
```

#### With fallback

```tsx
<RoleGate permission="campus:manage" fallback={<p>You don't have campus lead access.</p>}>
  <CampusDashboard />
</RoleGate>
```

### `<RoleExclude>` component

The inverse — **hides** content from specific roles. Useful for hiding "upgrade" prompts from admins.

```tsx
import { RoleExclude } from "@/components/auth";
import { ROLES } from "@/lib/auth";

<RoleExclude excludeRoles={[ROLES.ADMIN]}>
  <p>Upgrade to admin for more features!</p>
</RoleExclude>
```

### `usePermissions()` hook

**File**: `src/hooks/use-permissions.ts`

For permission checks in client-side logic (not just rendering).

```tsx
import { usePermissions } from "@/hooks/use-permissions";

function ActionBar() {
  const { can, canAny, canAll, hasRole, roles, isLoading } = usePermissions();

  if (isLoading) return <Skeleton />;

  return (
    <div>
      {can("users:verify") && <VerifyButton />}
      {canAny(["karma_voucher:manage", "achievements:issue"]) && <RewardsMenu />}
      {hasRole([ROLES.CAMPUS_LEAD]) && <TransferRoleButton />}
    </div>
  );
}
```

| Method | Description |
|--------|-------------|
| `can(permission)` | Does the user have this specific permission? |
| `canAny(permissions[])` | Does the user have **any** of these permissions? |
| `canAll(permissions[])` | Does the user have **all** of these permissions? |
| `hasRole(roles[])` | Does the user have **any** of these raw role strings? |
| `roles` | The user's role array (readonly) |
| `dynamicTypes` | The user's dynamic type array (readonly) |
| `isLoading` | Whether user data is still being fetched |
| `isAuthenticated` | Whether the user is logged in |

---

## Layer 4 — Backend (Django)

The backend uses the `@role_required` decorator on views. This is the **final authority** — even if all frontend layers are bypassed, the backend rejects unauthorized API calls.

```python
# mulearnbackend/api/dashboard/campus/campus_views.py
@role_required([RoleType.CAMPUS_LEAD.value, RoleType.LEAD_ENABLER.value])
def get(self, request):
    # Only executes if JWT contains matching role
    ...
```

**You don't need to change anything in the backend.** The frontend RBAC system is designed to work with the existing backend authorization.

---

## File Reference

```
src/
├── lib/auth/
│   ├── index.ts          # Barrel export — import from "@/lib/auth"
│   ├── roles.ts          # Role constants (mirrors backend RoleType enum)
│   ├── permissions.ts    # Permission → role mapping + utility functions
│   ├── route-access.ts   # Route → role mapping (used by middleware)
│   ├── server.ts         # Server-side auth (requireRole, requirePermission)
│   └── token-store.ts    # Cookie-based token management
├── components/auth/
│   ├── index.ts          # Barrel export — import from "@/components/auth"
│   ├── role-gate.tsx     # <RoleGate> and <RoleExclude> components
│   └── unauthorized-handler.tsx  # Handles ?unauthorized=true redirects
├── hooks/
│   └── use-permissions.ts  # usePermissions() hook
└── middleware.ts          # Edge middleware with role-based route protection
```

### Import paths

```tsx
// Roles and permissions (client-safe)
import { ROLES, PERMISSIONS, hasPermission, hasAnyRole } from "@/lib/auth";

// Server-side only (uses next/headers — NOT re-exported from index)
import { requireRole, requirePermission, getServerUser } from "@/lib/auth/server";

// Components
import { RoleGate, RoleExclude, UnauthorizedHandler } from "@/components/auth";

// Hook
import { usePermissions } from "@/hooks/use-permissions";

// Token store
import { authStore } from "@/lib/auth";
```

> ⚠️ **Do NOT import from `@/lib/auth/server` in client components** — it uses `next/headers` which is server-only.

---

## Roles

All 21 roles are defined in `src/lib/auth/roles.ts`. They exactly match the backend's `RoleType` enum (`mulearnbackend/utils/types.py`).

| Constant | JWT Value | Description |
|----------|-----------|-------------|
| `ROLES.ADMIN` | `"Admins"` | Full platform admin |
| `ROLES.FELLOW` | `"Fellow"` | Senior contributor with management access |
| `ROLES.ASSOCIATE` | `"Associate"` | Associate with limited management |
| `ROLES.CAMPUS_LEAD` | `"Campus Lead"` | Manages a single campus |
| `ROLES.LEAD_ENABLER` | `"Lead Enabler"` | Manages campus enablers |
| `ROLES.DISTRICT_CAMPUS_LEAD` | `"District Campus Lead"` | District-level campus manager |
| `ROLES.ZONAL_CAMPUS_LEAD` | `"Zonal Campus Lead"` | Zonal-level campus manager |
| `ROLES.ENABLER` | `"Enabler"` | Campus enabler |
| `ROLES.MENTOR` | `"Mentor"` | Mentor role |
| `ROLES.STUDENT` | `"Student"` | Student member |
| `ROLES.IG_LEAD` | `"IG Lead"` | Interest group lead |
| `ROLES.TECH_TEAM` | `"Tech Team"` | Platform tech team |
| `ROLES.APPRAISER` | `"Appraiser"` | Task appraiser |
| `ROLES.DISCORD_MODERATOR` | `"Discord Moderator"` | Discord moderation |
| `ROLES.CAMPUS_ACTIVATION_TEAM` | `"Campus Activation Team"` | Campus activation |
| `ROLES.INTERN` | `"Intern"` | Intern role |
| `ROLES.BOT_DEV` | `"Bot Dev"` | Bot developer |
| `ROLES.PRE_MEMBER` | `"Pre Member"` | Pre-registration |
| `ROLES.SUSPENDED` | `"Suspended"` | Suspended account |
| `ROLES.EX_OFFICIAL` | `"Ex Official"` | Former official |

### Dynamic IG Roles

Some roles are generated per-Interest Group:

```tsx
import { igCampusLeadRole, igLeadRole } from "@/lib/auth";

// "WebDev CampusLead", "AI IGLead", etc.
const webDevCampusLead = igCampusLeadRole("WebDev");
const aiIGLead = igLeadRole("AI");
```

### Role Group Presets

Commonly used role combinations:

```tsx
import {
  ADMIN_ROLES,             // [ADMIN]
  MANAGEMENT_ROLES,        // [ADMIN, FELLOW]
  CAMPUS_MANAGEMENT_ROLES, // [CAMPUS_LEAD, LEAD_ENABLER]
  ZONAL_ROLES,             // [ADMIN, FELLOW, ZONAL_CAMPUS_LEAD]
  DISTRICT_ROLES,          // [ADMIN, FELLOW, DISTRICT_CAMPUS_LEAD]
  TECH_ROLES,              // [ADMIN, TECH_TEAM]
} from "@/lib/auth";
```

---

## Permissions

Permissions use a `domain:action` pattern and are defined in `src/lib/auth/permissions.ts`.

| Permission | Roles | Description |
|------------|-------|-------------|
| `users:list` | Admin | List all users |
| `users:read` | Admin | View user details |
| `users:write` | Admin | Edit users |
| `users:delete` | Admin | Delete users |
| `users:verify` | Admin, Fellow | Verify user roles |
| `users:export_csv` | Admin | Export user data |
| `orgs:list` | Admin | List organizations |
| `orgs:manage` | Admin | Create/edit organizations |
| `orgs:verify` | Admin, Fellow | Verify organizations |
| `campus:manage` | Campus Lead, Lead Enabler | Manage campus operations |
| `campus:view_dashboard` | Campus Lead, Lead Enabler, Admin | View campus dashboard |
| `campus:transfer_role` | Campus Lead | Transfer campus lead role |
| `zonal:view` | Admin, Fellow, Zonal Campus Lead | View zonal dashboard |
| `district:view` | Admin, Fellow, District Campus Lead | View district dashboard |
| `ig:manage` | Admin | Manage interest groups |
| `tasks:manage` | Admin | Manage tasks |
| `karma_voucher:manage` | Admin, Fellow | Manage karma vouchers |
| `achievements:manage` | Admin | Manage achievements |
| `achievements:issue` | Admin, Fellow | Issue achievements |
| `events:manage` | Admin | Manage events |
| `hackathons:manage` | Admin | Manage hackathons |
| `roles:manage` | Admin | Manage roles |
| `url_shortener:manage` | Admin, Fellow, Associate | URL shortener |
| `errors:view` | Admin, Tech Team | View error logs |
| `discord:moderate` | Admin, Discord Moderator | Discord moderation |
| `launchpad:manage` | Admin | Manage launchpad |
| `lc_meetup:verify` | Admin, Fellow | Verify LC meetups |

---

## How-To Guides

### Adding a New Role

1. **Backend first**: Add the role to `RoleType` in `mulearnbackend/utils/types.py`
2. **Frontend**: Add the matching entry in `src/lib/auth/roles.ts`:

```diff
 export const ROLES = {
   // ...existing roles...
+  NEW_ROLE: "New Role",  // Must match backend RoleType value exactly
 } as const;
```

3. Add to any relevant permissions in `permissions.ts`
4. Add to any relevant routes in `middleware.ts` (the `ROLE_PROTECTED_ROUTES` map) and `route-access.ts`

### Adding a New Permission

1. Add the permission and its allowed roles in `src/lib/auth/permissions.ts`:

```diff
 export const PERMISSIONS = {
   // ...existing permissions...
+  "reports:export": [ROLES.ADMIN, ROLES.FELLOW],
 } as const;
```

2. Use it anywhere:

```tsx
<RoleGate permission="reports:export">
  <ExportButton />
</RoleGate>
```

TypeScript will autocomplete permission keys and catch typos at compile time.

### Protecting a New Route

1. Add the route to the `ROLE_PROTECTED_ROUTES` map in `src/middleware.ts`:

```diff
 const ROLE_PROTECTED_ROUTES: Record<string, RouteConfig> = {
   // ...existing routes...
+  "/dashboard/reports": { roles: [ROLE_VALUES.ADMIN, ROLE_VALUES.FELLOW] },
 };
```

2. Also add it to `src/lib/auth/route-access.ts` (this file is the canonical reference, middleware inlines a copy for edge compatibility):

```diff
 export const routeAccessMap: Record<string, RouteConfig> = {
   // ...existing routes...
+  "/dashboard/reports": { roles: [ROLES.ADMIN, ROLES.FELLOW] },
 };
```

> ⚠️ **Keep both files in sync.** The middleware inlines its own copy because edge runtime can't always import from arbitrary modules. `route-access.ts` is the source of truth for documentation and server-side checks.

### Protecting a Server Component Page

```tsx
// src/app/(dashboard)/reports/page.tsx
import { requirePermission } from "@/lib/auth/server";

export default async function ReportsPage() {
  const user = await requirePermission("reports:export");
  
  // Only renders for users with the "reports:export" permission
  const data = await fetchReports();
  return <ReportsTable data={data} currentUser={user} />;
}
```

### Hiding a UI Element Based on Role

```tsx
import { RoleGate } from "@/components/auth";

function Toolbar() {
  return (
    <div>
      <SearchBar />
      <RoleGate permission="reports:export">
        <ExportCSVButton />
      </RoleGate>
    </div>
  );
}
```

### Checking Permissions in Client Logic

```tsx
import { usePermissions } from "@/hooks/use-permissions";

function DataTable() {
  const { can } = usePermissions();

  const handleRowClick = (userId: string) => {
    if (can("users:write")) {
      openEditModal(userId);
    } else {
      openViewModal(userId);
    }
  };

  return <Table onRowClick={handleRowClick} />;
}
```

---

## Scalability & Future Direction

### Current approach: Hardcoded roles

Roles are defined as constants mirroring the backend's `RoleType` Python enum. This is **standard practice** and works well when:

- Roles are stable and change infrequently
- Role→permission mappings are decided by developers, not end-user admins
- The team is comfortable with code deploys for role changes

### When to upgrade to backend-driven permissions

If the platform evolves to need:

- **Admin-created roles** (e.g., "Marketing Lead" defined in a UI)
- **Dynamic permission assignment** (toggling which roles can access what at runtime)
- **Per-organization role customization**

Then the permission resolution should move to the backend:

```
GET /api/v1/auth/my-permissions/
→ { "users:list": true, "campus:manage": false, ... }
```

The frontend components (`<RoleGate>`, `usePermissions()`) would stay the same — only the data source changes from a local map lookup to a cached API call. The role constants in `roles.ts` would also remain since they're needed for type safety.

### What stays the same regardless

- **Middleware JWT decoding** — always needed for route-level gating
- **`<RoleGate>` and `usePermissions()`** — component API stays identical
- **Backend `@role_required`** — always the final authority
- **`roles.ts`** — always needed for TypeScript types and string matching

The architecture is designed so that the upgrade path is **additive, not a rewrite**.
