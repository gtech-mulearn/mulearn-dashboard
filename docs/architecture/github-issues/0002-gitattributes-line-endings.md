# Add a .gitattributes so text files use LF everywhere

| | |
|---|---|
| ID | 0002 |
| Phase / milestone | Phase 0: Stabilise and secure |
| Module | platform |
| Size | S |
| Labels | arch, phase:0, module:platform, type:chore, size:S, good first issue |
| Depends on | none |
| Backend | none |
| Blocks | none |
| Repos | mulearn-dashboard |

## Why

There is no `.gitattributes`, so a checkout on Windows can get CRLF line endings, and `bun run lint` then reports errors that don't appear on other systems ([12-testing-and-quality-gates.md](../12-testing-and-quality-gates.md)).

## Before you start

- Read the `formatter` settings in `biome.json`.
- Run `git ls-files --eol` to see how files are stored today.

## What to do

1. Create `.gitattributes` with:
   - `* text=auto eol=lf`;
   - `binary` for images and fonts (`*.png`, `*.jpg`, `*.jpeg`, `*.gif`, `*.webp`, `*.avif`, `*.ico`, `*.woff`, `*.woff2`, `*.ttf`, `*.otf`) and for `*.pdf` and `*.zip`.
2. Run `git ls-files --eol`. If any file is stored with CRLF (`i/crlf`), run `git add --renormalize .` and include the result in this pull request.
3. Say in the pull request that existing Windows clones need a fresh checkout after this merges (for example, a new clone), and remove the `core.autocrlf` note from the issues README's setup section in a follow-up.
4. Add one line to `CONTRIBUTING.md` saying line endings are LF everywhere, set by `.gitattributes`.

## Acceptance criteria

- [ ] `git ls-files --eol` shows no `i/crlf` entry.
- [ ] On a fresh clone on Windows, `bun run lint` reports no line-ending errors.

## How to test

```sh
git ls-files --eol | grep -c "i/crlf"
bun run lint
bun run typecheck
```

The first command prints `0`.

## Out of scope

- Changing any formatter setting in `biome.json`.

## Notes for reviewers

If renormalising touches many files, check the diff is line endings only (`git diff --ignore-all-space --stat` is empty).
