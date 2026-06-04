# Contributing to MuLearn Dashboard

## Getting Started

```bash
# Install dependencies
bun install

# Start the dev server
bun dev
```

Ensure you have [Bun](https://bun.sh) installed. Node/npm are not supported.

## Branching

Branch off from `dev` for all contributions. Use descriptive names:

| Type | Pattern | Example |
|---|---|---|
| Feature | `feat/<short-description>` | `feat/karma-leaderboard` |
| Bug fix | `fix/<short-description>` | `fix/profile-image-upload` |
| Refactor | `refactor/<short-description>` | `refactor/auth-middleware` |
| Chore | `chore/<short-description>` | `chore/update-deps` |

All PRs must target `dev`, not `main`.

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

Fix any failures before pushing. The CI runs the same checks.

## Changesets (Versioning & Changelog)

This project uses [Changesets](https://github.com/changesets/changesets) to manage versioning and generate the changelog. **Every PR that changes user-facing behavior must include a changeset.**

### When to add a changeset

Add a changeset if your PR includes:
- A new feature (`feat`)
- A bug fix (`fix`)
- A performance improvement (`perf`)
- A breaking change

Skip it for: `chore`, `refactor`, `docs`, `ci`, `style`, `test` — changes that don't affect the shipped product.

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
- [ ] A changeset is included (if applicable)
- [ ] No `console.log`, hardcoded tokens, or secrets
- [ ] UI changes tested in browser (not just type-checked)

## Code Style

- Formatter and linter: [Biome](https://biomejs.dev) — runs automatically on commit
- No comments unless the *why* is non-obvious
- No unused imports (Biome will flag them)
- Prefer `const` and explicit types; avoid `any`
