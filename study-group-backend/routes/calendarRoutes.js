import express from "express";
import { getGroupSchedules, createGroupSchedule } from "../controllers/calendarController.js";

const router = express.Router();

router.get("/group/:groupId", getGroupSchedules);
router.post("/group/:groupId", createGroupSchedule);

export default router;
