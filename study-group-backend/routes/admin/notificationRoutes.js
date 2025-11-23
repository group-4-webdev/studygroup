// study-group-backend/routes/notificationRoutes.js
import express from "express";
import {
  getNotifications,
  setRead,
  toggleStar,
  toggleArchive,
  deleteNotification
} from "../../controllers/admin/notificationsController.js";

const router = express.Router();

router.get("/:user_id", getNotifications);
router.patch("/:id/read", setRead);
router.patch("/:id/star", toggleStar);
router.patch("/:id/archive", toggleArchive);
router.delete("/:id", deleteNotification);

export default router;
