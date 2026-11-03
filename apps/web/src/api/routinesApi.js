import { request } from "./client.js";

export const listRoutines = () => request("GET", "/routines");
export const getRoutine = (id) => request("GET", `/routines/${id}`);
export const createRoutine = (dto) => request("POST", "/routines", dto);
export const updateRoutine = (id, dto) => request("PUT", `/routines/${id}`, dto);
export const deleteRoutine = (id) => request("DELETE", `/routines/${id}`);
