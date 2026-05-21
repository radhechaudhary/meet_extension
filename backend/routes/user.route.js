import { Router } from "express";
import { register, login } from "../controllers/user.controller.js";

const router = Router();

router.post("/register", register);

export default router;