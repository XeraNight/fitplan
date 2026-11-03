import { Router } from "express";
import * as routineController from "../controllers/routineController.js";

const router = Router();
router.get("/routines", routineController.list);
router.post("/routines", routineController.create);
router.get("/routines/:id", routineController.get);
router.put("/routines/:id", routineController.update);
router.delete("/routines/:id", routineController.remove);

export default router;
