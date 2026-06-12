# Tasks Module Documentation

## Module Overview

The Tasks module manages task configuration for the MuLearn dashboard. It provides CRUD operations for tasks, bulk import via Excel, and integrates with reference data (levels, interest groups, organizations, channels, types, skills).

**Pages:**
- `Tasks` - Task list with search, pagination, sort, and inline edit/delete
- `TaskCreate` - Standalone create page
- `TaskEdit` - Edit page (also supports modal edit from Tasks list)
- `TaskBulkImport` - Bulk import tasks via Excel upload

---

## File Structure

```
src/modules/Dashboard/modules/Tasks/
├── TaskInterface.d.ts      # Type definitions
├── TaskApis.ts             # API service layer
├── TaskForm.tsx            # Shared create/edit form (modal)
├── TaskEditUtils.ts        # Edit-mode formik schema + hook
├── Tasks.tsx               # Task list page
├── TaskCreate.tsx          # Create page
├── TaskEdit.tsx            # Edit page
└── TASKS_DOCUMENTATION.md # This file
```

---

## API Endpoints

### Base URL
All endpoints are prefixed with `VITE_BACKEND_URL` (from `import.meta.env.VITE_BACKEND_URL`).

### Task CRUD

| Operation | Method | Endpoint | Description |
|-----------|--------|----------|-------------|
| List tasks | GET | `/api/v1/dashboard/task/` | Paginated task list with search/sort |
| Get task detail | GET | `/api/v1/dashboard/task/{id}/` | Single task by ID |
| Create task | POST | `/api/v1/dashboard/task/` | Create new task |
| Update task | PUT | `/api/v1/dashboard/task/{id}/` | Update existing task |
| Delete task | DELETE | `/api/v1/dashboard/task/{id}/` | Delete task |
| Export CSV | GET | `/api/v1/dashboard/task/csv/` | Download tasks as CSV |

### Reference Data (UUID Lookups)

| Operation | Method | Endpoint | Description |
|-----------|--------|----------|-------------|
| Levels | GET | `/api/v1/dashboard/task/level/` | Task levels dropdown |
| Interest Groups | GET | `/api/v1/dashboard/task/ig/` | IG dropdown |
| Organizations | GET | `/api/v1/dashboard/task/organization/` | Organization dropdown |
| Channels | GET | `/api/v1/dashboard/task/channel/` | Channel dropdown |
| Task Types | GET | `/api/v1/dashboard/task/task-types/` | Task type dropdown |
| Skills | GET | `/api/v1/dashboard/skill/dropdown/` | Skills dropdown |

### Bulk Import

| Operation | Method | Endpoint | Description |
|-----------|--------|----------|-------------|
| Bulk import | POST | `/api/v1/dashboard/task/import/` | Upload Excel for bulk import |
| Download template | GET | `/api/v1/dashboard/task/base-template/` | Get Excel template |

---

## Schemas

### Task Object

```typescript
interface Task {
    id: string | number;
    hashtag: string;
    title: string;
    karma: number;
    usage_count: number;
    active: boolean;
    variable_karma: boolean;
    description: string;
    channel: string;        // UUID mapped to name
    type: string;           // UUID mapped to title
    level: string;          // UUID mapped to name
    ig: string;             // UUID mapped to name (Interest Group)
    org: string;            // UUID mapped to title (Organization)
    discord_link: string | null;
    event: string | null;
    bonus_time: string | null;   // ISO datetime
    bonus_karma: number;
    skill_ids: string[];         // Array of skill UUIDs
    created_by: string;
    updated_by: string;
    created_at: string;          // ISO datetime
    updated_at: string;          // ISO datetime
}
```

### Task Edit Interface (TaskInterface.d.ts)

```typescript
interface TaskEditInterface {
    hashtag?: string;
    title?: string;
    karma?: string;
    active?: string;           // "true" | "false" (string in edit interface)
    variable_karma?: string;   // "true" | "false"
    usage_count?: string;
    description?: string;
    channel?: string;
    type?: string;
    level?: string;
    org?: string;
    ig?: string;
    updated_at?: Date;
    updated_by?: string;
    created_by?: string;
    created_at?: Date;
}
```

### UUID Reference Types

```typescript
type uuidType = {
    level: { id: string; name: string }[];
    ig: { id: string; name: string }[];
    organization: { id: string; title: string }[];
    channel: { id: string; name: string }[];
    type: { id: string; title: string }[];
    skill: { id: string; name: string }[];
};
```

### Create/Update Request Body

```typescript
interface TaskCreateRequest {
    hashtag: string;
    title: string;
    karma: number;              // parseInt from string
    usage_count: number;        // parseInt from string
    active: boolean;
    variable_karma: boolean;
    description: string | null; // empty string -> null
    channel: string;            // channel_id from form
    type: string;               // type_id from form
    level: string | null;       // level_id, empty -> null
    ig: string | null;          // ig_id, empty -> null
    org: string | null;         // organization_id, empty -> null
    discord_link: string | null;
    event: string | null;       // empty -> null
    bonus_time: string | null;  // ISO format from date input
    bonus_karma: number;        // parseInt, default 0
    skill_ids: string[];        // Array of skill UUIDs
}
```

### Bulk Import Response

```typescript
interface BulkImportResponse {
    response: {
        Success: Array<{  // Successfully imported tasks
            [key: string]: any;
        }>;
        Failed: Array<{   // Failed imports with error info
            row: number;
            errors: string[];
            data: any;
        }>;
    };
}
```

---

## Validation Schemas

### TaskCreate Validation (TaskCreate.tsx)

```typescript
const taskEditSchema = Yup.object().shape({
    hashtag: Yup.string()
        .required("Required")
        .min(2, "Too Short!")
        .max(30, "Too Long!"),
    title: Yup.string()
        .min(2, "Too Short!")
        .max(50, "Too Long!")
        .required("Required"),
    karma: Yup.number()
        .positive("Karma should be a positive value")
        .min(10, "Needs to be at least 2 digits.")
        .max(9999, "Should not exceed 4 digits")
        .truncate(),
    usage_count: Yup.number()
        .truncate()
        .required("Mention the number of uses"),
    active: Yup.boolean().required("Select an option"),
    variable_karma: Yup.boolean().required("Select an option"),
    description: Yup.string()
        .max(100, "Too Long!")
        .required("A description is required"),
    channel_id: Yup.string(),
    type_id: Yup.string().required("Select a Type"),
    level_id: Yup.string().nullable(),
    ig_id: Yup.string().nullable(),
    organization_id: Yup.string().nullable(),
    discord_link: Yup.string().nullable()
});
```

### TaskEdit Validation (TaskEditUtils.ts)

```typescript
const taskEditSchema = Yup.object().shape({
    hashtag: Yup.string()
        .required("Required")
        .min(2, "Too Short!")
        .max(30, "Too Long!"),
    title: Yup.string()
        .min(2, "Too Short!")
        .max(50, "Too Long!")
        .required("Required"),
    karma: Yup.number()
        .positive("Karma should be a positive value")
        .min(10, "Needs to be at least 2 digits.")
        .max(9999, "Should not exceed 4 digits")
        .truncate(),
    usage_count: Yup.number().truncate().required("Mention the number of uses"),
    active: Yup.boolean().required("Select an option"),
    variable_karma: Yup.boolean().required("Select an option"),
    description: Yup.string()
        .max(100, "Too Long!")
        .required("A description is required"),
    channel_id: Yup.string().required("Select a Channel"),
    type_id: Yup.string().required("Select a Type"),
    level_id: Yup.string().nullable(),
    ig_id: Yup.string().nullable(),
    organization_id: Yup.string().nullable(),
    discord_link: Yup.string().nullable()
});
```

---

## Form Fields

### TaskForm (Shared Create/Edit)

| Field | Type | Component | Required | Notes |
|-------|------|-----------|----------|-------|
| hashtag | text | input | Yes | Auto-prepends # if missing |
| title | text | input | Yes | Max 50 chars |
| karma | number | input | Yes | Min 10, max 9999 |
| usage_count | number | input | Yes | Number of uses |
| discord_link | text | input | No | Discord invite link |
| description | text | MDEditor | Yes | Markdown supported, max 100 chars (Yup) |
| channel_id | select | react-select | Yes | From UUID lookup |
| type_id | select | react-select | Yes | From UUID lookup |
| level_id | select | react-select | No | From UUID lookup |
| ig_id | select | react-select | No | Interest Group |
| organization_id | select | react-select | No | From UUID lookup |
| skill_ids | multi-select | react-select | No | Skills for achievements |
| event | text | input | No | Event name |
| active | checkbox | toggle | Yes | Task active status |
| variable_karma | checkbox | toggle | Yes | Variable karma flag |
| bonus_time | date | input | Conditional | Shown when "bonus karma" checked |
| bonus_karma | number | input | Conditional | Shown when "bonus karma" checked |

---

## Key Utilities & Helpers

### uuidToString (TaskApis.ts)
Converts UUID IDs in task data to human-readable names using `uuidMapper`.

```typescript
// Maps task UUIDs to display names:
task.level = Mapper.level[task.level];
task.ig = Mapper.ig[task.ig];
task.org = Mapper.organization[task.org];
task.type = Mapper.type[task.type];
task.channel = Mapper.channel[task.channel];
```

### uuidMapper (TaskApis.ts)
Creates a lookup map from UUID array. Uses `title` for type/organization, `name` for others.

### getUUID (TaskApis.ts)
Fetches all reference data (level, ig, organization, channel, type, skill) in parallel. Skills endpoint failure is silently handled (returns empty array).

### Date Utilities
- `convertDateToYYYYMMDD` - Converts ISO date to YYYY-MM-DD for date inputs
- `encodeUnicodeForStorage` - Encodes description before API send
- `decodeUnicodeFromStorage` - Decodes description after API fetch

---

## Routing

```typescript
// App.tsx routes
{ path: "tasks", element: <AuthChecker roles={[roles.ADMIN]} children={<Tasks />} /> },
{ path: "tasks/create", element: <TaskCreate /> },
{ path: "tasks/edit/:id", element: <TaskEdit /> },
{ path: "tasks/bulk-import", element: <TaskBulkImport /> },
```

---

## Current Architecture Notes

### State Management
- No global state management (Redux/Zustand)
- Local component state via `useState`
- Manual data fetching in `useEffect` hooks

### Data Fetching
- Direct Axios calls via `privateGateway` (authenticated)
- No TanStack Query / React Query
- `getTasks` uses callback pattern: `getTasks(setData, page, perPage, setIsLoading, setTotalPages, search, sort)`

### Form Management
- **TaskCreate**: Custom form state with manual validation
- **TaskEdit**: Formik with `useFormikData` hook
- **TaskForm (modal)**: Custom form state with imperative handle for modal submit
- Validation: Yup schemas (not fully enforced in all forms)

### UI Components
- Chakra UI for layout/styling
- Custom components: `PowerfulButton`, `SingleButton`, `MuModal`, `Table`, `Pagination`
- `react-select` for dropdowns with `customReactSelectStyles`
- `@uiw/react-md-editor` for markdown description
- `react-router-dom` v6 for navigation

### Known Issues
1. `TaskEditUtils.ts` `submitHandler` passes `values.desc` instead of `values.description`
2. `TaskEditUtils.ts` `submitHandler` missing `bonus_time`, `bonus_karma`, `skill_ids` parameters
3. `getTaskDetails` in TaskApis uses `dashboardRoutes.getTasksData + id` (correct) but `TaskEditUtils` has similar pattern
4. `TaskCreate.tsx` has hardcoded `""` for `event` and `bonus_time` in `createTask` call
5. Tasks list `useEffect` depends on `data` causing potential infinite loop (line 90: `}, [data])`)
6. `taskEditSchema` in TaskForm.tsx is commented out (line 53-84)
7. UUID mapping is computed but not applied in `getTasks` (commented out lines 62-63)

---

## Next.js 14+ Migration Guide

### Target Structure

```
features/tasks/
├── app/
│   └── dashboard/
│       └── tasks/
│           ├── page.tsx                    # Tasks list (Server Component)
│           ├── create/
│           │   └── page.tsx                # TaskCreate
│           ├── edit/
│           │   └── [id]/
│           │       └── page.tsx            # TaskEdit
│           └── bulk-import/
│               └── page.tsx                # TaskBulkImport
├── components/
│   ├── TaskTable.tsx                       # Server component for table
│   ├── TaskFormModal.tsx                   # Create/Edit form (client)
│   ├── TaskBulkImportUpload.tsx            # Bulk import component
│   ├── TaskFilters.tsx                     # Search, sort, pagination
│   └── types.ts
├── hooks/
│   ├── useTasks.ts                         # TanStack Query hooks
│   ├── useTaskUUIDs.ts                     # Reference data hook
│   └── useTaskForm.ts                      # Form management
├── lib/
│   ├── api.ts                              # Axios instance + routes
│   ├── schemas.ts                          # Zod validation schemas
│   └── utils.ts                            # uuidToString, date utils
├── types/
│   └── index.ts
└── docs/
    └── TASKS_DOCUMENTATION.md
```

### Migration Checklist

#### 1. API Layer
- [ ] Create `lib/api.ts` with authenticated Axios instance
- [ ] Define all task endpoints as constants
- [ ] Create typed API functions with proper error handling
- [ ] Add request/response types with Zod or TypeScript interfaces

#### 2. Data Fetching
- [ ] Replace `useEffect` + `useState` with TanStack Query
- [ ] Create `useTasks` hook with `useQuery` for list
- [ ] Create `useTask(id)` hook for detail
- [ ] Create `useTaskUUIDs()` hook for reference data
- [ ] Implement infinite scroll or cursor-based pagination (optional)

#### 3. Forms
- [ ] Create Zod schemas for create/edit validation
- [ ] Build `TaskForm` as client component (`"use client"`)
- [ ] Use React Hook Form + Zod for form state
- [ ] Replace `react-select` with native `<select>` or headless UI
- [ ] Replace `MDEditor` with server-safe markdown or keep as client component
- [ ] Handle unicode encoding/decoding in form submission

#### 4. Pages (Server Components)
- [ ] `page.tsx` - Server component fetching initial data
- [ ] `create/page.tsx` - Client form wrapped in Suspense
- [ ] `edit/[id]/page.tsx` - Server component loading task, then client form
- [ ] `bulk-import/page.tsx` - Client upload component

#### 5. Bulk Import
- [ ] Create `app/api/tasks/import/route.ts` for proxy (if needed)
- [ ] Keep `BulkImport` as client component
- [ ] Add progress indicator during upload
- [ ] Implement proper error handling and retry

#### 6. Authentication
- [ ] Replace `AuthChecker` with Next.js middleware
- [ ] Use `cookies()` or `headers()` for token extraction
- [ ] Implement role-based access in `app/dashboard/layout.tsx`

#### 7. CSV Export
- [ ] Create `/api/tasks/export/route.ts` for CSV generation
- [ ] Use server-side CSV generation (e.g., `csv-stringify`)

#### 8. Styling
- [ ] Replace Chakra UI with Tailwind CSS components
- [ ] Create `components/ui/` for shared primitives
- [ ] Port custom CSS from `module.css` files to Tailwind classes

### Migration Priorities

1. **High Priority**: API layer + types, data fetching with TanStack Query
2. **Medium Priority**: Forms with proper validation, bulk import
3. **Low Priority**: CSV export, styling modernization, bonus karma toggle
