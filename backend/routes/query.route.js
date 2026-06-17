import { Router } from "express";
import { query } from "../controllers/query.controller.js";
import { verifyToken } from "../middlewares/verifyToken.middleware.js";
import { verifySession } from "../middlewares/verifySession.middleware.js";

const router = Router();

router.post("/query", verifyToken, query);

router.post("/current-query", verifySession, query);

export default router;
