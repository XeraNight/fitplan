import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import SuccessMessage from "./SuccessMessage.jsx";

describe("SuccessMessage", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("shows the text and closes itself after 4 s", () => {
    const onClose = vi.fn();
    render(<SuccessMessage message="Routine created" onClose={onClose} />);
    expect(screen.getByRole("status")).toHaveTextContent("Routine created");

    vi.advanceTimersByTime(3999);
    expect(onClose).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("shows nothing without a text", () => {
    render(<SuccessMessage message={null} onClose={vi.fn()} />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
