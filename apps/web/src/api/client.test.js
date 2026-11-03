import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MAX_WAKE_UP_MS, RETRY_DELAY_MS, request } from "./client.js";

const json = (status, body) =>
  Promise.resolve(
    new Response(body ? JSON.stringify(body) : "<html>Bad Gateway</html>", { status }),
  );

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("client.request while a Render service wakes up", () => {
  it("GET: retries a 502 without our JSON and returns the data when the server is up", async () => {
    fetch.mockReturnValueOnce(json(502)).mockReturnValueOnce(json(200, [{ name: "Push Day" }]));
    const result = request("GET", "/routines");
    await vi.advanceTimersByTimeAsync(RETRY_DELAY_MS);
    await expect(result).resolves.toEqual([{ name: "Push Day" }]);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("GET: gives up after the wake-up limit with SERVICE_UNAVAILABLE", async () => {
    fetch.mockImplementation(() => json(504));
    const result = request("GET", "/routines");
    const check = expect(result).rejects.toMatchObject({ code: "SERVICE_UNAVAILABLE" });
    await vi.advanceTimersByTimeAsync(MAX_WAKE_UP_MS + RETRY_DELAY_MS);
    await check;
  });

  it("POST is never repeated (it could create the routine twice)", async () => {
    fetch.mockReturnValueOnce(json(502));
    await expect(request("POST", "/routines", { name: "Push Day" })).rejects.toMatchObject({
      status: 502,
      code: "SERVICE_UNAVAILABLE",
    });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("our own error codes are kept and not retried", async () => {
    fetch.mockReturnValueOnce(
      json(400, { error: { code: "ROUTINE_EXERCISE_COUNT_INVALID", message: "1-15" } }),
    );
    await expect(request("GET", "/routines")).rejects.toMatchObject({
      code: "ROUTINE_EXERCISE_COUNT_INVALID",
    });
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
