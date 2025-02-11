import express from "express";
import {
  loginUser,
  registerUser,
  userLogout,
  getUser,
  updateUser,
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

// 8169107362;

export default router;
