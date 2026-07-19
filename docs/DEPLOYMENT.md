# Deployment Guide

Complete setup for deploying μLearn Dashboard to Netlify.

Everything in the repository is already done. This guide covers the infrastructure and
GitHub/Netlify configuration that must be done by hand — **the pipeline will not work until
these steps are complete.**

| Environment | Branch | Netlify site | URL |
|---|---|---|---|
| Staging | `staging` | staging site | https://staging.app.mulearn.org |
| Production | `master` | production site | https://app.mulearn.org |

Promotion flows `dev` → `staging` → `master`, each hop via pull request.

---

## How it works

Both deploy workflows run `netlify deploy --build` **on the GitHub Actions runner**, not on
Netlify's builders. This matters more than anything else in this guide:

- **Build-time** variables (anything `NEXT_PUBLIC_*`, plus `config/env.ts` validation) come from
  the **GitHub Environment**. A variable set only in Netlify's UI will be missing at build time.
- **Runtime** variables (read per-request by deployed server code, e.g. `BACKEND_URL`) come from
  the **Netlify site's environment settings**. The Actions shell does not persist into the
  deployed runtime.

Several variables therefore need to be set in **both** places. This is not redundancy — they are
read at different times by different processes.

`config/env.ts` uses `skipValidation: false`, so a missing **required** variable fails the build
immediately with the variable named. Optional ones fail silently.

---

## Step 1 — Branches

The `production` branch is named **`master`**. `main` is being retired.

```bash
# Order matters: GitHub refuses to delete the current default branch.
# 1. Settings → Branches → change default branch to `dev`
# 2. Then delete main:
git push origin --delete main
```

Making `dev` the default also makes new PRs target it automatically, which is what
CONTRIBUTING.md tells contributors to do.

> There is also a stray typo branch `stagin` (missing "g") on the remote. Delete it:
> `git push origin --delete stagin`

## Step 2 — Netlify sites

Create **two separate sites** from the same repository:

1. **Production site** → attach domain `app.mulearn.org`
2. **Staging site** → attach domain `staging.app.mulearn.org`

Point DNS at Netlify per their instructions for each domain.

In **each** site's settings:

- **Build & deploy → Continuous deployment → Branch deploys: disable automatic deploys.**
  GitHub Actions drives deployment; Netlify auto-building branches would produce duplicate and
  unreviewed deploys. `scripts/netlify-ignore.sh` is a repo-side backstop, not a substitute.
- **Do not create build hooks.** Netlify's ignore command cannot cancel a hook-triggered build,
  so a build hook bypasses the guard entirely.

Note each site's **Site ID** (Site settings → General → Site details) — needed in Step 4.

## Step 3 — Netlify site environment variables

In **each** Netlify site (Site settings → Environment variables), set:

| Variable | Why |
|---|---|
| `BACKEND_URL` | **Runtime.** Read per-request by `src/api/server.ts`. Set only here — the workflow cannot provide it to the deployed runtime. |
| `NEXT_PUBLIC_DJANGO_API_URL` | Backstop, if a build ever runs on Netlify's builders |
| `NEXT_PUBLIC_DISCORD_AUTH_URL` | Backstop |
| `NEXT_PUBLIC_CDN_URL` | Backstop (optional) |

Use each environment's own values — the staging site points at the staging backend.

## Step 4 — GitHub Environments

Create two environments (Settings → Environments): **`staging`** and **`production`**.

In **each**, add these **variables**:

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_DJANGO_API_URL` | yes | Build fails without it |
| `NEXT_PUBLIC_DISCORD_AUTH_URL` | yes | Build fails without it |
| `NEXT_PUBLIC_CDN_URL` | no | Silently absent if unset |

And these **secrets**:

| Secret | Environment |
|---|---|
| `NETLIFY_STAGING_SITE_ID` | `staging` |
| `NETLIFY_PRODUCTION_SITE_ID` | `production` |

Optionally enable **required reviewers** on the `production` environment to gate deploys behind
a human approval.

## Step 5 — Repository-level secrets and variables

**Secret** (Settings → Secrets and variables → Actions → Secrets):

| Secret | Notes |
|---|---|
| `NETLIFY_AUTH_TOKEN` | Personal access token from Netlify → User settings → Applications |

**Variables** (same page → Variables tab) — used by `ci.yml` for PR builds, which only need to
verify the app compiles. Dev-backend values are fine:

| Variable |
|---|
| `NEXT_PUBLIC_DJANGO_API_URL` |
| `NEXT_PUBLIC_DISCORD_AUTH_URL` |

## Step 6 — Branch protection

Protect **`staging`** and **`master`** (Settings → Branches → Add rule):

- Require a pull request before merging
- Require status checks to pass, selecting: **`Lint`**, **`Typecheck`**, **`Build`**

  These names come from `ci.yml` job display names. They only appear in the list after `ci.yml`
  has run at least once — open a throwaway PR first if the list is empty.
- Do not allow force pushes

---

## First deploy

Deploy staging first. It exercises the whole pipeline against a site that is not user-facing.

```bash
git checkout staging
git merge dev
git push origin staging
```

Watch **Actions → Staging - Deploy**. Jobs run `Lint` and `Typecheck` in parallel, then `Deploy`.

Once staging is verified:

```bash
git checkout master
git merge staging
git push origin master
```

## Verifying a deploy

1. **Workflow** — all jobs green in the Actions tab
2. **Site loads** at the expected domain, and login works (confirms
   `NEXT_PUBLIC_DJANGO_API_URL` resolved correctly)
3. **Build attribution** — the version badge in the UI shows a 7-character commit SHA, not
   `dev`. If it shows `dev`, `COMMIT_REF` is not reaching the build.
4. **Guard works** — push any commit to `dev` and confirm no Netlify deploy is triggered

---

## Troubleshooting

**Build fails: `Invalid environment variables`**
A required variable is missing from the GitHub **Environment** (not the Netlify UI — see
"How it works"). The error names the variable.

**Version badge reads `dev` in a deployed build**
`COMMIT_REF` is not set. Both deploy workflows pass `COMMIT_REF: ${{ github.sha }}`; check it
was not removed from the deploy step's `env:` block.

**Deploy job is skipped or errors on the environment**
The GitHub Environment (`staging` / `production`) does not exist, or its name does not match the
`environment:` key in the workflow.

**A push to `dev` triggered a Netlify build**
Netlify's Git integration is auto-deploying branches. Disable branch deploys in the site UI
(Step 2). `scripts/netlify-ignore.sh` should cancel it, but it cannot cancel builds started by a
build hook.

**Images return 400**
The host is not in `images.remotePatterns` in `next.config.ts`. Both deployment domains are
already listed; add any new image host there.

**Uploads fail with 413**
nginx's `client_max_body_size` on the API host. The client-side limit lives in
`src/lib/constants/upload.ts` (`MAX_IMAGE_UPLOAD_MB`) and assumes nginx's 1 MB default. If ops
raises the server limit, raise this constant to match.

---

## Reference

- Pipeline design and rationale: `docs/superpowers/specs/2026-07-19-netlify-cicd-design.md`
- Branch topology and PR rules: `CONTRIBUTING.md`
