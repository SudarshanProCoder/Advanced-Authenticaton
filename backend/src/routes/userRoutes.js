import express from "express";
import {
  loginUser,
  registerUser,
  userLogout,
  getUser,
  updateUser,
  getUserLoginStatus,
  verifyEmail,
  verifyUser,
  forgetPassword,
  resetPassword,
  chnagePassword,
} from "../controllers/auth/userController.js";
import {
  adminMiddleware,
  creatorMiddleware,
  protect,
} from "../middleware/authMiddleware.js";
import { deleteUser, getAlluser } from "../controllers/auth/adminController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", userLogout);
router.get("/user", protect, getUser);
router.patch("/update", protect, updateUser);
//admin route
router.delete("/admin/users/:id", protect, adminMiddleware, deleteUser);
//get all users
router.get("/admin/users", protect, creatorMiddleware, getAlluser);
//user login-status
router.get("/login-status", getUserLoginStatus);
// email verification
router.post("/verify-email", protect, verifyEmail);
// verify user --> email verification
router.post("/verify-user/:verificationToken", verifyUser);
//forget password
router.post("/forget-password", forgetPassword);
//reset password
router.post("/reset-password/:resetPasswordToken", resetPassword);
//change password
router.patch("/change-password", protect, chnagePassword);
export default router;
