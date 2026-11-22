# Contributing to MuLearn Dashboard

> **Security problems are never reported in a public issue or pull request.** See [SECURITY.md](SECURITY.md).

## Getting Started

```bash
# Install dependencies
bun install

# Start the dev server
bun dev
```

Ensure you have [Bun](https://bun.sh) installed. Use Bun, not npm or yarn. Full setup: [Development setup](#development-setup).

## Development setup

Everything a fresh clone needs before its first pull request.

1. **Install Node 22 or later and Bun 1.3**, the versions the builds use (`netlify.toml`). Use Bun to install and run scripts; npm and yarn aren't supported. Node is still needed: Next.js and the typecheck script run on it.
2. **Clone the repository.** Line endings are LF everywhere, set by `.gitattributes`. On Windows, a clone made before `.gitattributes` existed needs a fresh checkout: with nothing uncommitted, run `git rm -r --cached . && git reset --hard`.
3. **Install dependencies:**

   ```bash
   bun install
   ```

4. **Create `.env.local`** from `.env.example`:

   ```bash
   cp .env.example .env.local
   ```

   `config/env.ts` validates these variables. The two `NEXT_PUBLIC_` ones are required: without them the app won't start or build. Never use production credentials.

   | Variable | What it is | A value that works locally |
   |---|---|---|
   | `NEXT_PUBLIC_DJANGO_API_URL` | Required. The backend API the browser calls. It is built into the client bundle. | `http://localhost:8000` for a backend running locally, or a development API you're allowed to use |
   | `NEXT_PUBLIC_DISCORD_AUTH_URL` | Required. The Discord sign-in URL that the Connect Discord page sends users to. | any valid URL, for example `http://localhost:3000`, unless you're working on Discord linking |
   | `BACKEND_URL` | Optional, server only. The backend address that server-side code uses, when it differs from the one the browser uses. If unset, the server uses `NEXT_PUBLIC_DJANGO_API_URL`. | leave it commented out, as in `.env.example`: an empty value fails validation |

5. **Run the app:**

   ```bash
   bun dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

6. **Before opening a pull request,** run the checks CI runs:

   ```bash
   bun run lint
   bun run typecheck
   bun run test            # the whole suite; or: bun run test <paths>
   ```

   Some tests fail on `dev` today. They are listed in `scripts/allowlists/test-baseline.txt`, and CI fails only on a new failure or on a listed test that now passes (see that file's header).
7. **Add a changeset to every pull request** (see [Changesets](#changesets-versioning--changelog)).

The architecture these pull requests follow, with issues anyone can pick up, is in [docs/architecture/README.md](docs/architecture/README.md).

## Branching

Long-lived branches and where they go:

| Branch | Role | Deploys to |
|---|---|---|
| `dev` | Integration — all PRs target this | — |
| `staging` | Pre-production verification | staging.app.mulearn.org |
| `master` | Production | app.mulearn.org |

Promotion flows `dev` → `staging` → `master`, each hop via pull request opened by a
maintainer. **Never target `staging` or `master` from a feature branch.**

Branch off from `dev` for all contributions. Use descriptive names:

| Type | Pattern | Example |
|---|---|---|
| Feature | `feat/<short-description>` | `feat/karma-leaderboard` |
| Bug fix | `fix/<short-description>` | `fix/profile-image-upload` |
| Refactor | `refactor/<short-description>` | `refactor/auth-middleware` |
| Chore | `chore/<short-description>` | `chore/update-deps` |

All PRs must target `dev` — never `staging` or `master` directly.

## Commit Messages

This project uses [Conventional Commits](https://www.conventionalcommits.org). The format is:

```
<type>: <description>

[optional body]
```

**Allowed types:**

| Type | When to use |
|---|---|
| `feat` | A new feature visible to users |
| `fix` | A bug fix |
| `refactor` | Code change with no behavior change |
| `chore` | Tooling, deps, config — no production code |
| `docs` | Documentation only |
| `style` | Formatting, whitespace — no logic change |
| `test` | Adding or updating tests |
| `perf` | Performance improvement |
| `ci` | CI/CD pipeline changes |

Examples:
```
feat: add karma leaderboard to dashboard
fix: resolve token expiry not clearing session
chore: upgrade tanstack-query to v5
```

Commitlint enforces this on every commit via the pre-commit hook.

## Pre-commit Hooks

Husky runs the following automatically on every commit — do not skip with `--no-verify`:

1. **Biome format** — auto-formats all staged files
2. **Biome lint** — auto-fixes lint issues
3. **TypeScript typecheck** — `tsc --noEmit` must pass
4. **Forbidden pattern scan** — blocks `console.log`, `localStorage.setItem`, `sessionStorage.setItem`, `@ts-ignore`, and `@ts-expect-error`

Fix any failures before pushing. Every pull request runs `ci.yml` (lint, typecheck, and a
production build) — all three checks must pass before merge.

## Changesets (Versioning & Changelog)

This project uses [Changesets](https://github.com/changesets/changesets) to manage versioning and generate the changelog. **Every pull request to `dev` or `staging` needs a changeset**: CI checks for one with `changeset status`.

### Which changeset to add

- **A change to the shipped product** (`feat`, `fix`, `perf`, or a breaking change): run `bunx changeset` and choose the bump.
- **Anything else** (`chore`, `refactor`, `docs`, `ci`, `style`, `test`): add an empty one with `bunx changeset --empty`. It bumps nothing and adds nothing to the changelog, but satisfies the check.

Existing changesets add an `author: @<your GitHub handle>` line under the front matter; do the same.

### How to add a changeset

```bash
bunx changeset
```

The CLI will ask two things:

1. **Bump type** — choose based on [Semantic Versioning](#semantic-versioning) below
2. **Summary** — one line describing what changed from the user's perspective

This creates a markdown file in `.changeset/`. Commit it alongside your changes.

### What happens next

When your PR is merged into `dev`, a bot automatically opens a "Version Packages" PR that:
- Bumps `package.json` version
- Aggregates all pending changeset summaries into `CHANGELOG.md`

When that PR is merged, the changelog is published to the [GitBook docs repo](https://github.com/gtech-mulearn/changelog-gitbooks).

## Semantic Versioning

This project follows [semver](https://semver.org): `MAJOR.MINOR.PATCH`

| Bump | When | Example |
|---|---|---|
| `patch` | Bug fix, small improvement — no new API or feature | `0.1.0` → `0.1.1` |
| `minor` | New feature, backward-compatible | `0.1.0` → `0.2.0` |
| `major` | Breaking change — removes or renames something users depend on | `0.1.0` → `1.0.0` |

When in doubt, use `patch` for fixes and `minor` for features.

## Pull Request Checklist

Before opening a PR:

- [ ] Branch is off `dev`, targets `dev`
- [ ] Pre-commit hooks pass locally
- [ ] A changeset is included (an empty one, `bunx changeset --empty`, for chores and docs)
- [ ] No `console.log`, hardcoded tokens, or secrets
- [ ] UI changes tested in browser (not just type-checked)

## Code Style

- Formatter and linter: [Biome](https://biomejs.dev) — runs automatically on commit
- Line endings are LF everywhere, set by `.gitattributes`, so lint behaves the same on Windows
- No comments unless the *why* is non-obvious
- No unused imports (Biome will flag them)
- Prefer `const` and explicit types; avoid `any`
