import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CompanyTask } from "../types/tasks.types";

// Lists the modal reads; undefined = still loading.
const lists = vi.hoisted(() => ({
  types: undefined as unknown,
  levels: undefined as unknown,
}));

vi.mock("../hooks/use-company-tasks", () => ({
  useTaskTypes: () => ({ data: lists.types }),
  useTaskLevels: () => ({ data: lists.levels }),
  useCreateCompanyTask: () => ({ mutate: vi.fn(), isPending: false }),
  useUpdateCompanyTask: () => ({ mutate: vi.fn(), isPending: false }),
}));
vi.mock("@/features/projects", () => ({
  ProjectSkillPicker: () => <div data-testid="skill-picker" />,
}));

import { CreateTaskModal } from "./create-task-modal";

const TASK = {
  id: "t1",
  title: "Original title",
  hashtag: "#acme-api",
  karma: 100,
  type: "Task",
  level: "Beginner",
  description: "Build it",
  usage_count: 1,
  skills: [],
} as unknown as CompanyTask;

const titleInput = () =>
  screen.getByLabelText(/task title|title/i, {
    selector: "input#task-title",
  }) as HTMLInputElement;

describe("CreateTaskModal", () => {
  beforeEach(() => {
    lists.types = undefined;
    lists.levels = undefined;
  });

  it("keeps what the user types while task levels are still loading", {
    timeout: 5000,
  }, () => {
    render(<CreateTaskModal open onOpenChange={vi.fn()} />);
    fireEvent.change(titleInput(), { target: { value: "Build an API" } });
    expect(titleInput().value).toBe("Build an API");
  });

  it("doesn't wipe an edit in progress when the lists finish loading", () => {
    const { rerender } = render(
      <CreateTaskModal open onOpenChange={vi.fn()} taskToEdit={TASK} />,
    );
    expect(titleInput().value).toBe("Original title");
    fireEvent.change(titleInput(), { target: { value: "Edited title" } });

    lists.types = { data: [{ id: "type-1", title: "Task" }] };
    lists.levels = [{ id: "level-1", name: "Beginner" }];
    rerender(<CreateTaskModal open onOpenChange={vi.fn()} taskToEdit={TASK} />);

    expect(titleInput().value).toBe("Edited title");
  });
});
