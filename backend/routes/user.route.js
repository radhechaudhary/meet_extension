import { Router } from "express";
import { register, login } from "../controllers/user.controller.js";
import { auth } from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", register);

router.post("/login", login)

router.get("/auth", auth);

export default router;