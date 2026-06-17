import { Router } from "express";
import { fetchDashBoardInfo, editCurrentMeetingName, editMeetingName, fetchMeetingInfo, delete_meeting } from "../controllers/dashboard.controller.js";
import { verifyToken } from "../middlewares/verifyToken.middleware.js";

const router = Router();

router.get("/fetch", verifyToken, fetchDashBoardInfo);
router.post("/edit-current-meeting-name", verifyToken, editCurrentMeetingName);
router.post("/edit-meeting-name", verifyToken, editMeetingName);
router.get("/fetch-meeting/:meeting_id", verifyToken, fetchMeetingInfo)
router.delete("/delete-meeting/:meeting_id", verifyToken, delete_meeting)

export default router;