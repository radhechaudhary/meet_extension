import { Router } from "express";
import { startMeeting, endMeeting, pauseMeeting, resumeMeeting } from "../controllers/meeting.controller.js";
const router = Router();
import { verifyToken } from "../middlewares/verifyToken.middleware.js";

router.post("/start-meeting", verifyToken, startMeeting);
router.post("/end-meeting", verifyToken, endMeeting);
router.post("/pause-meeting", verifyToken, pauseMeeting);
router.post("/resume-meeting", verifyToken, resumeMeeting);

export default router;