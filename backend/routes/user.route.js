import { Router } from "express";
import { register, login, logout } from "../controllers/user.controller.js";
import { auth } from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", register);

router.post("/login", login)

router.get("/auth", auth);

router.post("/logout", logout);

export default router;