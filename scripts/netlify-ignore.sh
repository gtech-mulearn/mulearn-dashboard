#!/usr/bin/env bash
# Netlify build guard — referenced by `ignore` in netlify.toml.
# Netlify convention is inverted: exit 0 CANCELS the build, non-zero PROCEEDS.
#
# Known limit: build-hook-triggered builds bypass this entirely
# (do not create build hooks for these sites).

# Our own GitHub-Actions-driven deploys are already gated by CI upstream.
if [ "$CI_DEPLOY" = "true" ]; then
  echo "CI-driven deploy — proceeding"
  exit 1
fi

# master is the production branch; it may build on Netlify's builders (backstop path).
if [ "$BRANCH" = "master" ]; then
  echo "Production branch — proceeding"
  exit 1
fi

echo "Branch '$BRANCH' is not deployable — cancelling build"
exit 0
