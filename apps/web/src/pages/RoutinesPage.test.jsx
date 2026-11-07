import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import * as routinesApi from "../api/routinesApi.js";
import RoutineEditorPage from "./RoutineEditorPage.jsx";
import RoutinesPage from "./RoutinesPage.jsx";

vi.mock("../api/routinesApi.js");
vi.mock("../context/AuthContext.jsx", () => ({ useAuth: () => ({ user: null, logout: vi.fn() }) }));
vi.mock("../components/routines/RoutineBuilder.jsx", () => ({
  default: ({ onSave }) => (
    <button type="button" onClick={() => onSave({ name: "Push Day", exercises: [] })}>
      Save routine
    </button>
  ),
}));

const pushDay = { _id: "r1", name: "Push Day", exercises: [] };

function LocationState() {
  return <span data-testid="history-state">{JSON.stringify(useLocation().state)}</span>;
}

const renderAt = (url) =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/routines" element={<RoutinesPage />} />
        <Route path="/routines/new" element={<RoutineEditorPage />} />
        <Route path="/routines/:id/edit" element={<RoutineEditorPage />} />
      </Routes>
      <LocationState />
    </MemoryRouter>,
  );

describe("confirmation after a routine change (US1)", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    routinesApi.listRoutines.mockResolvedValue([pushDay]);
    routinesApi.getRoutine.mockResolvedValue(pushDay);
  });

  it("creating a routine confirms it on the list", async () => {
    routinesApi.createRoutine.mockResolvedValue(pushDay);
    renderAt("/routines/new");
    await userEvent.click(await screen.findByRole("button", { name: "Save routine" }));
    expect(await screen.findByRole("status")).toHaveTextContent('Routine "Push Day" created');
  });

  it("editing a routine confirms it on the list", async () => {
    routinesApi.updateRoutine.mockResolvedValue(pushDay);
    renderAt("/routines/r1/edit");
    await userEvent.click(await screen.findByRole("button", { name: "Save routine" }));
    expect(await screen.findByRole("status")).toHaveTextContent('Routine "Push Day" updated');
  });

  it("the confirmation is removed from the history, so a reload does not repeat it", async () => {
    routinesApi.createRoutine.mockResolvedValue(pushDay);
    renderAt("/routines/new");
    await userEvent.click(await screen.findByRole("button", { name: "Save routine" }));
    await screen.findByRole("status");
    expect(screen.getByTestId("history-state")).toHaveTextContent("null");
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("deleting a routine confirms it after the red question", async () => {
    routinesApi.deleteRoutine.mockResolvedValue();
    renderAt("/routines");
    await userEvent.click(await screen.findByRole("button", { name: "Delete" }));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Delete Push Day" }));
    expect(await screen.findByRole("status")).toHaveTextContent('Routine "Push Day" deleted');
  });

  it("the deleted routine leaves the list at once, even if the reload is slow", async () => {
    routinesApi.deleteRoutine.mockResolvedValue();
    routinesApi.listRoutines
      .mockResolvedValueOnce([pushDay])
      .mockReturnValue(new Promise(() => {}));
    renderAt("/routines");
    await userEvent.click(await screen.findByRole("button", { name: "Delete" }));
    await userEvent.click(screen.getByRole("button", { name: "Delete Push Day" }));
    await screen.findByRole("status");
    expect(screen.queryByRole("heading", { name: "Push Day" })).not.toBeInTheDocument();
  });

  it("a failed delete shows the error and no confirmation", async () => {
    routinesApi.deleteRoutine.mockRejectedValue(new Error("offline"));
    renderAt("/routines");
    await userEvent.click(await screen.findByRole("button", { name: "Delete" }));
    await userEvent.click(screen.getByRole("button", { name: "Delete Push Day" }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
