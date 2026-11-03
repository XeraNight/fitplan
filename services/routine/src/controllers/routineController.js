import * as routineAbl from "../abl/routineAbl.js";

export async function list(req, res) {
  res.json(await routineAbl.list(req.userId));
}

export async function get(req, res) {
  res.json(await routineAbl.get(req.userId, req.params.id));
}

export async function create(req, res) {
  res.status(201).json(await routineAbl.create(req.userId, req.body));
}

export async function update(req, res) {
  res.json(await routineAbl.update(req.userId, req.params.id, req.body));
}

export async function remove(req, res) {
  await routineAbl.remove(req.userId, req.params.id);
  res.status(204).end();
}
