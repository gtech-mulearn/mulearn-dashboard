# Build and deployment

How the dashboard is built, configured and promoted. Facts describe `dev` at 6d6cb30b; the environments were checked against GitHub's deployment records, environments and settings on 23 Nov 2026 (issue 0041). The decision is [ADR-013](adr/ADR-013-build-and-deploy.md); the hands-on guide for maintainers is `docs/DEPLOYMENT.md`.

## Environments

| Environment | Branch | Where | How it deploys at 6d6cb30b |
|---|---|---|---|
| Development | `dev` | Vercel project `mulearn-dashboard` (scope `awindsrs-projects`), `https://mulearn-dashboard.vercel.app` | Vercel's Git integration, not a workflow. Every push to `dev` is a deployment Vercel labels **Production** (GitHub shows them under the `Production` environment). Other branches and pull requests get **Preview** deployments |
| Staging | `staging` | Netlify site `staging-mulearn`, `https://staging-mulearn.netlify.app` (`staging.app.mulearn.org` has no DNS record) | `.github/workflows/staging-deploy.yml`: lint, typecheck, then deploy from the Actions runner |
| Production | `master` | Netlify, `app.mulearn.org` (it answers with `Server: Netlify`) | **Not visible from GitHub.** `production-deploy.yml` deployed `master` from Actions from 19 Jul 2026. All 8 of its runs failed, and it was deleted on 21 Jul (137b32b1). No first-parent `master` commit since has a Netlify status. `netlify.toml` and `scripts/netlify-ignore.sh` would let Netlify's own builders build `master`; whether they do is under "Still to confirm" |

Promotion goes `dev` → `staging` → `master`, each step through a pull request. `release.yml` versions and tags `master` with changesets, and `changeset-check.yml` requires a changeset on pull requests to `dev` and `staging`.

```mermaid
flowchart LR
  PR["pull request"] -->|"CI: lint, typecheck, build"| DEV["dev"]
  DEV -->|"pull request"| STG["staging"]
  STG -->|"staging-deploy.yml"| NS["Netlify staging"]
  STG -->|"pull request"| MAS["master"]
  MAS -->|"release.yml: version + tag"| TAG["release tag"]
  MAS -.->|"to confirm: Netlify builds master?"| NP["Netlify production"]
  DEV -->|"Vercel Git integration"| VD["Vercel: mulearn-dashboard.vercel.app"]
```

## Configuration

- **Build-time variables** are every `NEXT_PUBLIC_*` value, checked by `config/env.ts`. They are baked into the build, so changing one means rebuilding that environment.
  - **Staging** reads them from the `staging` GitHub environment, but only the ones `staging-deploy.yml` forwards in its build step's `env:` block: today `NEXT_PUBLIC_DJANGO_API_URL` and `NEXT_PUBLIC_DISCORD_AUTH_URL`. A new variable must be added there too. A value set only in Netlify's UI is missing from that build.
  - **Production:** if Netlify's builders build `master` (to confirm, below), the build reads them from the **production Netlify site's environment variables**. The GitHub `Production` environment was set up for the deleted `production-deploy.yml`, and no build reads it now.
  - **Development:** the Vercel project's environment variables, in its **Production** scope (that is `dev`'s deployment). Pull request previews read the **Preview** scope.
  - **Pull request CI** (`ci.yml`: lint, typecheck, the tests against their baseline, the feature-import, query-key and cycle checks, and the build with its bundle budgets) reads the repository-level variables `NEXT_PUBLIC_DJANGO_API_URL` and `NEXT_PUBLIC_DISCORD_AUTH_URL` for its build.
- **Runtime variables** come from the Netlify site, and are read by server code on each request: `BACKEND_URL`, the backend address for server-side calls.
- **Today's variables** (`config/env.ts`) are `NEXT_PUBLIC_DJANGO_API_URL` (the API host the browser calls), `NEXT_PUBLIC_DISCORD_AUTH_URL`, and the optional `BACKEND_URL`.
- **`next.config.ts` adds** `NEXT_PUBLIC_APP_VERSION` (from `package.json`) and `NEXT_PUBLIC_BUILD_SHA` (from the build's commit).
- **Feature flags for new sends** are build-time variables named `NEXT_PUBLIC_FEATURE_<NAME>`. Each is added to `config/env.ts` as an optional boolean that is off unless set, and is turned on per environment by a maintainer: set in that environment and, for staging, forwarded in `staging-deploy.yml` ([ADR-011](adr/ADR-011-flags-for-new-sends.md)).

## Releases and the backend

The dashboard and the backend deploy separately, so a release must never turn on something the backend in that environment doesn't support:
1. **Every flag that is on** in an environment has its backend capability deployed there.
2. **The maintainer turning a flag on** records the backend change and the environment in the rollout issue.
3. **Reading new optional fields needs nothing** ([06-backend-contract.md](06-backend-contract.md)).

## Where a new build-time variable goes

A new `NEXT_PUBLIC_*` value is baked in at build time, so it must be set wherever each environment builds, and that environment rebuilt:

| Environment | Set it in | Notes |
|---|---|---|
| Development (`dev`) | the Vercel project `mulearn-dashboard` → Settings → Environment Variables, **Production** scope; **Preview** too for pull request previews | Vercel rebuilds on the next push to `dev`. |
| Pull request CI | repository variables (Settings → Secrets and variables → Actions → Variables), and the `env:` of `ci.yml`'s build step | Only needed when the build fails without it. |
| Staging | the `staging` GitHub environment's variables, **and** the `env:` block of the deploy step in `staging-deploy.yml` | The workflow forwards only the values it names. |
| Production | the production Netlify site → Site configuration → Environment variables, if Netlify builds `master` (to confirm). And the GitHub `Production` environment, once a deploy workflow uses it again | No build reads the GitHub `Production` environment today. |

Runtime-only values such as `BACKEND_URL` go in each Netlify site's environment variables, and in the Vercel project for `dev`. A GitHub environment can't pass them to the deployed server.

## What was checked (issue 0041, 23 Nov 2026)

- **Deployment records.** Nearly all GitHub deployments are from `vercel[bot]`: `Preview`, and `Production` for `dev` commits such as 9e50816c and 6d6cb30b. The latest 100 are 76 `Preview`, 18 `Production` and 6 `staging`. The `staging` ones come from the staging workflow. The only production ones are 7 `Production` deployments of `master` from July 2026, made by the deleted `production-deploy.yml`, all failed.
- **GitHub environments** and what they hold (names only):

  | Environment | Secrets | Variables | Used by |
  |---|---|---|---|
  | `staging` | `NETLIFY_STAGING_SITE_ID` | `NEXT_PUBLIC_DJANGO_API_URL`, `NEXT_PUBLIC_DISCORD_AUTH_URL`, `NEXT_PUBLIC_CDN_URL`, `BACKEND_URL` | `staging-deploy.yml`, which forwards only the first two |
  | `Production` | `NETLIFY_PRODUCTION_SITE_ID` | `NEXT_PUBLIC_DJANGO_API_URL`, `NEXT_PUBLIC_DISCORD_AUTH_URL`, `BACKEND_URL` | no workflow since `production-deploy.yml`, which it was created for on 19 Jul 2026, was deleted on 21 Jul. Vercel also records `dev`'s deployments under this name |
  | `Preview` | none | none | Vercel's pull request previews |
  | `Production – mulearn-dashboard`, `Production – mulearn-dashboard-pq2w`, and their `Preview –` pairs | none | none | older Vercel projects; the last deployment was in February 2026 |
  | `copilot` | none | none | GitHub Copilot's agent |

- **Repository level:**
  - secrets `NETLIFY_AUTH_TOKEN`, `DOCS_REPO_TOKEN` and `ADD_TO_PROJECT_TOKEN`;
  - variables `NEXT_PUBLIC_DJANGO_API_URL` and `NEXT_PUBLIC_DISCORD_AUTH_URL`;
  - the organisation secrets `GIT_ACCESS_TOKEN`, `GIT_PAT` and `PERSONAL_TOKEN` are visible too, and no workflow uses them.
- **Differences from `docs/DEPLOYMENT.md`:**
  - it expects Actions-driven production deploys; that workflow was deleted in July after every run failed;
  - its staging domain, `staging.app.mulearn.org`, has no DNS record. The staging site is `https://staging-mulearn.netlify.app`;
  - `NEXT_PUBLIC_CDN_URL` is set for staging but read nowhere in the code;
  - `BACKEND_URL` in the GitHub environments has no effect, because it is read at runtime from the Netlify site.
- **`release.yml` failed** on `master` on 11 Nov 2026. It cloned the changelog repository into `docs/`, which this repository already has. Fixed alongside this page: it now clones into `$RUNNER_TEMP`.

## Still to confirm

Only the Netlify and Vercel dashboards can show these, and the repository can't. Owner: @awindsr, who has access to both.
- **How production deploys today.** Two possibilities, and the dashboards show which:
  - Netlify's builders build `master`. `netlify.toml` allows it, but no `master` commit since 21 Jul has a Netlify status. If so, with only `master` building, and branch deploys and build hooks off (`docs/DEPLOYMENT.md`, Step 2);
  - deploys are made some other way.

  The repository is linked to a Netlify site named `mulearn-dashboard-new`, which posts deploy-preview statuses.
- **Whether `staging.app.mulearn.org` should point at the staging site.** It has no DNS record today.
- That the Vercel project's **Production** branch is `dev`.
- Whether the older Vercel projects (`mulearn-dashboard-pq2w` and the earlier `mulearn-dashboard` environments) can be removed.
