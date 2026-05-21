import { Router } from "express";
import { uploadChunk } from "../controllers/upload-chunk.controller.js";

const router = Router();

router.post("/upload-chunk", uploadChunk);

export default router;
