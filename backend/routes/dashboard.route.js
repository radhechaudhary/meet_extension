import { Router } from "express";
import { fetchDashBoardInfo, editCurrentMeetingName, editMeetingName } from "../controllers/dashboard.controller.js";
import { verifyToken } from "../middlewares/verifyToken.middleware.js";

const router = Router();

router.get("/fetch", verifyToken, fetchDashBoardInfo);
router.post("/edit-current-meeting-name", verifyToken, editCurrentMeetingName);
router.post("/edit-meeting-name", verifyToken, editMeetingName);

export default router;