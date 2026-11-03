import { request } from "./client.js";

export const loginWithGoogle = (credential) => request("POST", "/auth/google", { credential });
export const getMe = () => request("GET", "/auth/me");
// wakes the free Render servers (they sleep after 15 min without traffic)
export const wakeUpServices = () => request("GET", "/health/services");
