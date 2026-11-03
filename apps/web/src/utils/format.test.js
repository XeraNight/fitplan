import { describe, expect, it } from "vitest";
import { formatDate, formatDuration, formatKg, formatRest } from "./format.js";

describe("format", () => {
  it("formatDuration", () => {
    expect(formatDuration(58 * 60)).toBe("58 min");
    expect(formatDuration(64 * 60)).toBe("1 h 04 min");
  });

  it("formatRest", () => {
    expect(formatRest(90)).toBe("1:30");
    expect(formatRest(150)).toBe("2:30");
    expect(formatRest(0)).toBe("0:00");
  });

  it("formatKg", () => {
    expect(formatKg(6240)).toBe("6 240 kg");
    expect(formatKg(85)).toBe("85 kg");
  });

  it("formatDate", () => {
    expect(formatDate("2026-11-02T07:12:00")).toBe("Mon 2 Nov");
  });
});
