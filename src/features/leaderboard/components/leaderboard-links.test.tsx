import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Capture the props next/link receives: `prefetch` never reaches the DOM.
const linkProps = vi.hoisted(() => [] as Array<Record<string, unknown>>);

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    prefetch,
    ...rest
  }: {
    children: ReactNode;
    href: string;
    prefetch?: boolean | null;
  }) => {
    linkProps.push({ href, prefetch });
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  },
}));

import { LeaderboardCard } from "./leaderboard-card";
import { Podium } from "./podium";

const entry = (rank: number) => ({
  id: `user-${rank}`,
  rank,
  name: `Learner ${rank}`,
  karma: 1000 - rank,
  link: `/profile/user-${rank}@mulearn`,
});

describe("leaderboard profile links", () => {
  beforeEach(() => {
    linkProps.length = 0;
  });

  // Every visible row is a profile link; letting Next prefetch them fires one
  // RSC request per learner on load and again on every tab/timeframe switch.
  it("does not prefetch profiles from leaderboard rows", () => {
    render(<LeaderboardCard entry={entry(4)} />);
    expect(linkProps).toEqual([
      { href: "/profile/user-4@mulearn", prefetch: false },
    ]);
  });

  it("does not prefetch profiles from the podium", () => {
    render(<Podium entries={[entry(1), entry(2), entry(3)]} />);
    expect(linkProps).toHaveLength(3);
    for (const props of linkProps) {
      expect(props.prefetch).toBe(false);
    }
  });
});
