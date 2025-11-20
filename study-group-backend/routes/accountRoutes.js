import express from "express";
import { checkAccountType } from "../controllers/accountTypeController.js";

const router = express.Router();

router.post("/check-account-type", checkAccountType);

export default router;
