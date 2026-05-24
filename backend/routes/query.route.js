import { Router } from "express";
import { query } from "../controllers/query.controller.js";
import { verifyToken } from "../middlewares/verifyToken.middleware.js";

const router = Router();

router.post("/query", verifyToken, query);

export default router;
