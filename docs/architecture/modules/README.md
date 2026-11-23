# Module catalogue

A **module** groups the dashboard code that works with one backend module, so a backend change points to one page ([ADR-016](../adr/ADR-016-module-docs-follow-backend-catalogue.md)). It is a documentation and labelling unit: the code stays in `src/features/<name>/`. Six more pages cover shared code. `payments` has no page: no dashboard feature calls it.

Each page lists the module's feature folders and routes, how page access is decided, the backend endpoint groups it calls, what imports it from outside, and the issues and backend changes that touch it. Facts describe `dev` at 6d6cb30b.

| Module | Kind | Feature folders (or code) | Phases with issues |
|---|---|---|---|
| [contributions](contributions.md) | Mirrors the backend module | `discord-moderation` | later (epics) |
| [gamification](gamification.md) | Mirrors the backend module | `achievements`, `leaderboard` | later (epics) |
| [identity_access](identity_access.md) | Mirrors the backend module | `manage-roles`, `role-verification` | later (epics) |
| [people](people.md) | Mirrors the backend module | `manage-users`, `profile` | 1 |
| [organizations](organizations.md) | Mirrors the backend module | `campus`, `campus-manage`, `college-levels`, `district`, `manage-locations`, `organizations`, `zonal` | 1, 2 |
| [communities](communities.md) | Mirrors the backend module | `channels`, `ig-requests`, `interest-groups`, `learning-circle`, `manage-ig` | 1 |
| [learning](learning.md) | Mirrors the backend module | `mujourney`, `tasks` | 1, 2 |
| [rewards](rewards.md) | Mirrors the backend module | `karma-voucher` | later (epics) |
| [events](events.md) | Mirrors the backend module | `events` | 1 |
| [mentorship](mentorship.md) | Mirrors the backend module | `company-mentors`, `mentor` | 1 |
| [careers](careers.md) | Mirrors the backend module | `career-labs`, `company-jobs`, `company-profile`, `company-tasks`, `manage-companies` | 1 |
| [interns](interns.md) | Mirrors the backend module | `intern` | 2 |
| [media](media.md) | Mirrors the backend module | `weekly-twitches` | later (epics) |
| [projects](projects.md) | Mirrors the backend module | `problem-statements`, `projects` | later (epics) |
| [notifications](notifications.md) | Mirrors the backend module | `notification`, `push` | 1 |
| [integrations](integrations.md) | Mirrors the backend module | `connect`, `courses` | later (epics) |
| [administration](administration.md) | Mirrors the backend module | `dynamic-type`, `grit-meter`, `url-shortener` | later (epics) |
| [app-shell](app-shell.md) | Shared | layouts, route groups, error boundaries | 1, 2 |
| [api-client](api-client.md) | Shared | `src/api` | 1, 2 |
| [auth-and-access](auth-and-access.md) | Shared | `src/lib/auth`, `src/proxy.ts`; `auth` | 1, 2 |
| [design-system](design-system.md) | Shared | `src/components/ui`; the design system | later (epics) |
| [shared-lib](shared-lib.md) | Shared | `src/lib`, `src/hooks`, `src/stores` | 2 |
| [workspace](workspace.md) | Shared | `home`, `onboarding`, `search`, `settings`, `tour` | 1 |

The rules every module follows are in [04-module-rules.md](../04-module-rules.md).
