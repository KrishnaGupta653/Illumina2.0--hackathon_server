import express from "express";
import { saveProfile, checkProfile, getUserEmail } from "./fillProfileController.js";

const router = express.Router();

// ✅ Get email from `login` table
router.get("/get-email/:email", getUserEmail);

// ✅ Check if profile exists
router.get("/profile/:email", checkProfile);

// ✅ Save profile
router.post("/profile", saveProfile);

export default router;
