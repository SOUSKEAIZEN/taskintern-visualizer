import { Router } from "express";
import { runCode, submitCode } from "../controllers/compiler.controller";

const router = Router();

router.post("/run", runCode);
router.post("/submit", submitCode);

export default router;
