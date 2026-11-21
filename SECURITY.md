# Security policy

## Reporting a vulnerability

**Report security problems privately, never in a public issue, pull request, discussion or chat.** That includes anything that looks like it could expose another user's data, let someone act as another user, or reach a page or action their roles shouldn't allow.

1. Open the repository's **Security** tab and choose **Report a vulnerability** ([direct link](https://github.com/gtech-mulearn/mulearn-dashboard/security/advisories/new)). Only the maintainers can read the report.
2. Say what you found, where (the page, the request, or the file), how to reproduce it, and what an attacker could do with it.
3. Don't test against other people's accounts or data, and don't run anything against production that you wouldn't run as an ordinary user.

If the problem is in the backend API rather than in the dashboard, report it in [mulearnbackend](https://github.com/gtech-mulearn/mulearnbackend/security/advisories/new) the same way. If you're not sure which repository it belongs to, either is fine.

## What happens next

- A maintainer acknowledges the report, normally within 5 working days, and may ask you questions in the private advisory.
- The fix is prepared privately and released before the advisory is published. You're credited in the advisory unless you ask not to be.

## Supported versions

Only the current production release, the `master` branch deployed at https://app.mulearn.org, receives security fixes.
