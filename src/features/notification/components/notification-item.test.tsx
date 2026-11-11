import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { NotificationItem as NotificationItemData } from "../schemas";
import { NotificationItem } from "./notification-item";

const base: NotificationItemData = {
  id: "n1",
  type: "LC_JOIN_APPROVED",
  category: "LC",
  title: "You're in",
  description: "Your join request was approved.",
  entity_type: "learning_circle",
  entity_id: "c1",
  is_read: false,
  is_archived: false,
  created_at: "2026-11-01T10:00:00Z",
  read_at: null,
  source: "personal",
  redirect_url: null,
} as NotificationItemData;

describe("NotificationItem link", () => {
  it("deep-links a typed notification in the same tab", () => {
    render(<NotificationItem item={base} />);
    const link = screen.getByRole("link", { name: /view/i });
    expect(link).toHaveAttribute("href", "/dashboard/learning-circle/c1");
    expect(link).not.toHaveAttribute("target");
  });

  it("opens an external https link in a new tab", () => {
    render(
      <NotificationItem
        item={{
          ...base,
          type: "ADMIN_BROADCAST",
          entity_type: null,
          entity_id: null,
          redirect_url: "https://mulearn.org/blog",
        }}
      />,
    );
    const link = screen.getByRole("link", { name: /view/i });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("shows no link for an unknown type without a URL", () => {
    render(
      <NotificationItem
        item={{
          ...base,
          type: "SOMETHING",
          entity_type: null,
          entity_id: null,
        }}
      />,
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
