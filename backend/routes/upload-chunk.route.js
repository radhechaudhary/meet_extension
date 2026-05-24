import { Router } from "express";
import { uploadChunk } from "../controllers/upload-chunk.controller.js";
import { verifyToken } from "../middlewares/verifyToken.middleware.js";

const router = Router();

router.post("/upload-chunk", verifyToken, uploadChunk);

export default router;
