import express from "express";
import { getUsers, updateUser, deleteUser } from "../../controllers/admin/adminUsers.js";
import { getGroups, updateGroup, deleteGroup } from "../../controllers/admin/adminGroups.js";

const router = express.Router();

router.get("/manage-users", getUsers);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

router.get("/groups", getGroups);
router.put("/groups/:id", updateGroup);
router.delete("/groups/:id", deleteGroup);

export default router;
