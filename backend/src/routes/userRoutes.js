import express from "express";
import {
  loginUser,
  registerUser,
  userLogout,
  getUser,
  updateUser,
} from "../controllers/auth/user.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", userLogout);
router.get("/user", protect, getUser);
router.patch("/update", protect, updateUser);

export default router;
