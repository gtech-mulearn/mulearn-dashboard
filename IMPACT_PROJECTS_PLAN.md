# Impact Projects — Implementation Plan

Backend done. Base path: `/api/v1/dashboard/ig/<ig_id>/impact-projects/`
Build in `src/features/manage-ig/` (existing feature, reuse conventions). GET reused in public IG detail page too.

## 1. API layer — `src/features/manage-ig/api/impact-projects.api.ts`

Functions, all via `apiClient` (JSON) except image upload (multipart):

```ts
getImpactProjects(igId): GET .../impact-projects/            -> ImpactProject[]
createImpactProject(igId, payload): POST .../impact-projects/
updateImpactProject(igId, projectId, payload): PATCH .../impact-projects/{id}/
deleteImpactProject(igId, projectId): DELETE .../impact-projects/{id}/
uploadImpactProjectImage(igId, projectId, file): POST .../impact-projects/{id}/image/ (multipart)
```

- Add endpoint constants to `src/api/endpoints.ts` under IG namespace: `impactProjects: { list, detail, image }` (path builders taking `igId`/`projectId`), matching existing JSDoc style.
- List/create/update responses validated with zod envelope schema (`{ hasError, statusCode, message, response }`), unwrap `.response`.
- Image upload: mirror `projects/api/projects.api.ts` `buildProjectFormData` + `authedFetch` pattern (or `apiClient.post(endpoint, formData, schema, { isFormData: true })` — pick `apiClient` route since it's less code, formData-only single file field `image`).
- Error surface: rely on `apiClient`'s existing error throw, handled at mutation layer via `getApiResponseError`.

## 2. Schemas — `src/features/manage-ig/schemas/impact-projects.schema.ts`

```ts
TeamMemberSchema        { muid, name, is_lead }
TeamMemberInputSchema   { muid, is_lead }   // for create/update payload
LinkSchema              { label: string, url: string }
ImpactProjectSchema     { id, ig_id, title, image: string|null, description, team: TeamMemberSchema[], links: LinkSchema[], created_by, updated_by, created_at, updated_at }
ImpactProjectCreateSchema  { title, description, team: TeamMemberInputSchema[].optional, links: LinkSchema[].optional }
ImpactProjectUpdateSchema  ImpactProjectCreateSchema.partial()
ImpactProjectsListResponseSchema / ImpactProjectResponseSchema / ImageUploadResponseSchema
```

Client-side validation to mirror backend: exactly one `is_lead: true` when team non-empty, `url` must be valid URL (zod `.url()`), `title`/`description` required non-empty.

Types via `z.infer<>`, export from `schemas/index.ts`.

## 3. Query keys + hooks

`hooks/impact-projects-query-keys.ts`:
```ts
export const impactProjectsKeys = {
  all: ["impact-projects"] as const,
  byIg: (igId: string) => [...impactProjectsKeys.all, igId] as const,
};
```

`hooks/use-impact-projects.ts` — query:
```ts
useImpactProjects(igId) // useQuery(impactProjectsKeys.byIg(igId), () => getImpactProjects(igId), { enabled: !!igId })
```
This is the hook reused verbatim in both admin (`ig-detail.tsx`) and public (`interest-group-detail-client.tsx`) pages — no duplication.

`hooks/use-impact-project-mutations.ts` — mutations, each with shared `onMutationError`:
```ts
useCreateImpactProject(igId)
useUpdateImpactProject(igId)
useDeleteImpactProject(igId)
useUploadImpactProjectImage(igId)
```
All invalidate `impactProjectsKeys.byIg(igId)` on success + toast.success/toast.error (match `manage-ig` hook style, not `projects` style — stay consistent with feature's existing convention).

Permission check client-side: reuse existing `_can_manage_ig`-equivalent — check `hasIgLeadRole(igCode)` / admin role (already used in `interest-group-detail-client.tsx` for the Edit button) to conditionally show create/edit/delete affordances. List is always visible to any authenticated user.

## 4. Components — `src/features/manage-ig/components/impact-projects/`

```
impact-projects-section.tsx   — card container (list + "Add Project" button), styled to match the
                                 "Join Requests" card it replaces: rounded-3xl border, header w/ title,
                                 scrollable body: `max-h-[420px] overflow-y-auto` (inside scroll, per request)
impact-project-card.tsx        — compact row/card: image thumb, title, lead name, edit/delete icon buttons
                                 (edit/delete only rendered if canManage)
impact-project-dialog.tsx      — create/edit dialog, click-to-open, same UI for admin edit-ig page
                                 and stepper reuse (see §5)
impact-project-team-picker.tsx — wraps MuidSearchInput (multi-select mode) + per-chip "make lead"
                                 radio/star affordance; enforces exactly one lead
impact-project-links-editor.tsx — dynamic add/remove rows: label + url text inputs (open label, any text ok)
impact-project-detail-dialog.tsx (optional) — read-only view if card click should open bigger dialog;
                                 otherwise card click = open edit dialog directly (simpler, admins only
                                 anyway can click-edit; non-admins just view card list, no dialog needed
                                 unless "click for details" required — confirm: plan assumes click opens
                                 edit dialog for managers, and a lightweight read-only dialog for viewers)
```

**Dialog form fields** (`impact-project-dialog.tsx`):
- Title (text input)
- Description (textarea)
- Image (file input, drag/drop optional — mirror `achievement-form-dialog.tsx` simpler version: preview via `URL.createObjectURL`, validate type/size client-side before upload, upload as separate call after create succeeds — i.e. create project first without image, then call `uploadImpactProjectImage` with returned `id` if a file was picked; on edit, image upload fires immediately as its own mutation)
- Team (impact-project-team-picker)
- Links (impact-project-links-editor)

Submit flow (non-wizard, single step — task is small enough, no need for multi-step):
1. RHF + `zodResolver(ImpactProjectCreateSchema)` validates title/description/team/links.
2. On submit: `create.mutateAsync(values)` or `update.mutateAsync({id, values})`.
3. If image file staged: follow with `uploadImage.mutateAsync({id, file})`.
4. Close dialog, list auto-refreshes via query invalidation.

Delete: `ConfirmDialog` (reuse `@/components/ui/confirm-dialog`) before calling `deleteImpactProject`.

## 5. Wiring into pages

**a. Public IG detail page** — `src/features/interest-groups/components/interest-group-detail-client.tsx` lines 484–506:
Replace the static "Join Requests — coming soon" block with `<ImpactProjectsSection igId={group.id} canManage={isIGLeadOrAdmin} />` (import from `@/features/manage-ig`). Confirm with stakeholder whether "Join Requests" stub should be dropped entirely or kept elsewhere — plan assumes replace, per instructions ("keep this instead of the join request section").

**b. Admin IG detail page** — `src/features/manage-ig/components/ig-detail.tsx`:
Add same `<ImpactProjectsSection igId={group.id} canManage />` to the sidebar column (admin always canManage, or still gate by role check for consistency).

**c. Edit-IG page**: same as (b) since `ig-detail.tsx` IS the edit-ig page (`/dashboard/edit-ig/[id]`) — no separate work needed, just adding the section there covers "edit ig page" requirement.

**d. Stepper (`ig-form-dialog.tsx`)**: Impact Projects are independent DB rows (not IG fields), so they don't belong inside the "collect everything, submit once" IG wizard. Instead: add a 5th step "Impact Projects" (or fold into existing step) that's only enabled in **edit mode** (`initialData` present, i.e. IG already has an id) — shows the same `ImpactProjectsSection` (list + inline add/edit dialog) since projects need a real `ig_id` to attach to, which doesn't exist yet during IG creation. In create mode, show a disabled/"available after saving" notice instead.

## 6. Reused pieces (no new code needed)

- `MuidSearchInput` for team member search/select.
- `ConfirmDialog` for delete confirmation.
- `getApiResponseError` for error toasts.
- Django envelope zod pattern already established in `manage-ig.schema.ts`.
- `authedFetch` / `apiClient` `isFormData` option for image upload — pick `apiClient` since it already handles envelope + zod validation consistently with rest of feature.

## 7. Task order

1. `endpoints.ts` — add impact-projects paths.
2. Schemas.
3. API functions.
4. Query keys + hooks (query + mutations).
5. `impact-project-team-picker.tsx` + `impact-project-links-editor.tsx` (small reusable pieces).
6. `impact-project-card.tsx`.
7. `impact-project-dialog.tsx` (create/edit form).
8. `impact-projects-section.tsx` (list container, scrollable, wires dialog + delete confirm).
9. Wire into `interest-group-detail-client.tsx` (replace Join Requests stub).
10. Wire into `ig-detail.tsx` (admin/edit-ig page).
11. Add step to `ig-form-dialog.tsx` stepper (edit-mode only).
12. Export everything from `manage-ig/index.ts`.
13. Manual test pass using the API test guide (list/create/update/delete/image, permission errors, lead-count validation, bad URL).

## Open questions for user before/while building

- Should "Join Requests" stub be deleted entirely, or moved elsewhere and Impact Projects added as a new card (task said "keep this instead of" → assumed full replace)?
- Should non-managers get a read-only detail dialog on card click, or is list-only view sufficient for them?
