import express from "express";
import { getUsers, updateUser, deleteUser } from "../../controllers/admin/adminUsers.js";
import { getGroups, updateGroup, deleteGroup } from "../../controllers/admin/adminGroups.js";

const router = express.Router();

// Users
router.get("/manage-users", getUsers);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// Groups
router.get("/groups", getGroups);
router.put("/groups/:id", updateGroup);
router.delete("/groups/:id", deleteGroup);

export default router;
