import { Router } from "express";
import * as exerciseController from "../controllers/exerciseController.js";

const router = Router();
router.get("/exercises", exerciseController.list);
router.get("/exercises/:id", exerciseController.get);

export default router;
