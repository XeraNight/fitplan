import * as exerciseAbl from "../abl/exerciseAbl.js";

export async function list(req, res) {
  res.json(await exerciseAbl.list({ category: req.query.category, q: req.query.q }));
}

export async function get(req, res) {
  res.json(await exerciseAbl.get(req.params.id));
}
