import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RoutineBuilder, { MAX_EXERCISES } from "./RoutineBuilder.jsx";

const item = (i) => ({
  exerciseId: `id-${i}`,
  exerciseName: `Exercise ${i}`,
  targetSets: 3,
  repMin: 8,
  repMax: 12,
  restSeconds: 90,
});

describe("RoutineBuilder (R-1 hints)", () => {
  it("save is disabled with 0 exercises", () => {
    render(<RoutineBuilder initial={{ name: "Push Day", exercises: [] }} onSave={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Save routine" })).toBeDisabled();
    expect(screen.getByText("0 / 15")).toBeInTheDocument();
  });

  it("at 15 exercises the counter stops and Add is disabled", () => {
    const exercises = Array.from({ length: MAX_EXERCISES }, (_, i) => item(i + 1));
    render(<RoutineBuilder initial={{ name: "Big Day", exercises }} onSave={vi.fn()} />);
    expect(screen.getByText("15 / 15")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Maximum 15 exercises" })).toBeDisabled();
  });

  it("saves name and exercises without the name snapshot", async () => {
    const onSave = vi.fn();
    render(<RoutineBuilder initial={{ name: "Push Day", exercises: [item(1)] }} onSave={onSave} />);
    await userEvent.click(screen.getByRole("button", { name: "Save routine" }));
    expect(onSave).toHaveBeenCalledWith({
      name: "Push Day",
      exercises: [{ exerciseId: "id-1", targetSets: 3, repMin: 8, repMax: 12, restSeconds: 90 }],
    });
  });

  it("raising minimum reps above maximum moves the maximum too", async () => {
    render(
      <RoutineBuilder
        initial={{ name: "Push Day", exercises: [{ ...item(1), repMin: 12, repMax: 12 }] }}
        onSave={vi.fn()}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Minimum reps plus 1" }));
    expect(screen.getByLabelText("Maximum reps", { selector: "input" })).toHaveValue("13");
  });
});
