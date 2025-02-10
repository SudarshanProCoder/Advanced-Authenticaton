import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/auth/user.model";

export const protect = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      res.status(404).json({ message: "Not authorized, please login!" });
    }
  } catch (error) {}

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id).select("-password");

  if (!user) {
    res.status(404).json({ message: "User Not Found" });
  }

  req.user = user;

  next();
});
