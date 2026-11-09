import { request } from "./client.js";

export const loginWithGoogle = (credential) => request("POST", "/auth/google", { credential });
export const getMe = () => request("GET", "/auth/me");
// starts the gateway and the services in parallel before the first real request
export const wakeUpServices = () => request("GET", "/health/services");
