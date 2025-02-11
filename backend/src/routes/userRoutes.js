import express from "express";
import {
  loginUser,
  registerUser,
  userLogout,
  getUser,
  updateUser,
} from "../controllers/auth/userController.js";
import { adminMiddleware, protect } from "../middleware/authMiddleware.js";
import { deleteUser } from "../controllers/auth/adminController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", userLogout);
router.get("/user", protect, getUser);
router.patch("/update", protect, updateUser);

//admin route

router.delete("/admin/users/:id", protect, adminMiddleware, deleteUser);

export default router;
