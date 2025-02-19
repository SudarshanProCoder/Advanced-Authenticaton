import asyncHandler from "express-async-handler";
import User from "../../models/auth/userModel.js";
import generateToken from "../../helpers/generateToken.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Token from "../../models/auth/Token.js";
import { hashToken } from "../../helpers/hashToken.js";
import { sendEmail } from "../../helpers/sendEmail.js";
//user Register Controller
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  //validation
  if (!name || !email || !password) {
    res.status(404).json({ message: "All fields are required" });
  }

  //check passsword length
  if (password.length < 6) {
    return res
      .status(404)
      .json({ message: "Password must be at least 6 characters" });
  }

  const userExists = await User.findOne({ email });
  //check user is already present or not
  if (userExists) {
    return res.status(404).json({ message: "User already exists!" });
  }

  //create new user
  const user = await User.create({
    name,
    email,
    password,
  });

  //generate token with user id

  const token = generateToken(user._id);

  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    sameSite: true,
    secure: true,
  });

  if (user) {
    const { _id, name, email, role, photo, bio, isVarified } = user;
    res.status(201).json({
      _id,
      name,
      email,
      role,
      photo,
      bio,
      isVarified,
      token,
    });
  } else {
    res.status(400).json({ message: "error" });
  }
});

//User Login Controller
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(404).json({ message: "All fields are required" });
  }

  //check if user exists

  const userExists = await User.findOne({ email });

  if (!userExists) {
    return res.status(404).json({ message: "Not User Exists!, Sign Up" });
  }

  const isMatch = await bcrypt.compare(password, userExists.password);
  // const isMatch = await User.findOne({ password });

  if (!isMatch) {
    return res.status(404).json({ message: "Invalid Email and Password" });
  }

  const token = generateToken(userExists._id);
  if (userExists && isMatch) {
    const { _id, name, email, role, photo, bio, isVarified } = userExists;

    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: true,
      secure: true,
    });

    res.status(200).json({
      _id,
      name,
      email,
      role,
      photo,
      bio,
      isVarified,
      token,
    });
  } else {
    return res.status(404).json({ message: "Invalid Email and Password" });
  }
});

//user logout controller

export const userLogout = asyncHandler(async (req, res) => {
  res.clearCookie("token");

  res.status(200).json({ message: "User Logged Out " });
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  console.log(user);
  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404).json({ message: "User Not Found" });
  }
});

//update User
export const updateUser = asyncHandler(async (req, res) => {
  //get user detail from token

  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.bio = req.body.bio || user.bio;
    user.photo = req.body.photo || user.photo;

    const updated = await user.save();

    res.status(200).json({
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      photo: updated.photo,
      bio: updated.bio,
      isVarified: updated.isVerified,
    });
  } else {
    res.status(404).json({ message: "User Not Found" });
  }
});

// getUserLoginStatus

export const getUserLoginStatus = asyncHandler(async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    res.status(404).json({ message: "Not authorized, please login!" });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (decoded) {
    res.status(200).json(true);
  } else {
    res.status(401).json(false);
  }
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(400).json({ message: "User Not Found" });
  }

  //check is user already verified

  if (user.isVerified) {
    res.status(400).jaon({ message: "User Already Verified!" });
  }

  let token = await Token.findOne({ userId: user._id });

  if (token) {
    await token.deleteOne();
  }

  //create verification token using crypto
  const verificationToken = crypto.randomBytes(64).toString("hex") + user._id;
  console.log(verificationToken);

  //hash the verification token

  const hashedToken = await hashToken(verificationToken);

  await new Token({
    userId: user._id,
    verificationToken: hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // this for 24hr expire
  }).save();

  //verification link
  const verificationLink = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

  //send email
  const subject = "Email Verification - Auth";
  const send_to = user.email;
  const reply_to = "noreply@gmail.com";
  const template = "emailVerification";
  const send_from = process.env.CLIENT_EMAIL;
  const name = user.name;
  const url = verificationLink;

  try {
    await sendEmail(subject, send_to, send_from, reply_to, template, name, url);
    res.status(200).json({ message: "Email sent " });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Email Can not sent" });
  }
});

export const verifyUser = asyncHandler(async (req, res) => {
  const { verificationToken } = req.params;

  if (!verificationToken) {
    return res.status(400).json({ message: "Invalid Verification Token" });
  }

  //hash the verication token
  const hashedToken = hashToken(verificationToken);

  //find the user with verification token

  const userToken = await Token.findOne({
    verificationToken: hashedToken,
    expiresAt: { $gt: Date.now() },
  });

  if (!userToken) {
    return res
      .status(400)
      .json({ message: "Invalid Or Expaire Verification Token" });
  }

  const user = await User.findById(userToken.userId);

  if (user.isVerified) {
    return res.status(400).json({ message: "User is already verified" });
  }
  user.isVerified = true;
  await user.save();

  res.status(200).json({ message: "User Verified" });
});

export const forgetPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ message: "Email is required" });
  }

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404).json({ message: "User Not Found" });
  }

  let token = await Token.findOne({ userId: user._id });

  if (token) {
    await token.deleteOne();
  }

  const passwordResetToken = crypto.randomBytes(64).toString("hex") + user._id;

  const hashedToken = hashToken(passwordResetToken);

  await new Token({
    userId: user._id,
    passwordResetToken: hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 60 * 60 * 1000,
  }).save();

  const resetLink = `${process.env.CLIENT_URL}/reset-password/${passwordResetToken}`;

  const subject = "Password Reset - AuthKit";
  const send_to = user.email;
  const send_from = process.env.CLIENT_EMAIL;
  const reply_to = "noreply@noreply.com";
  const template = "forgetpassword";
  const name = user.name;
  const url = resetLink;

  try {
    await sendEmail(subject, send_to, send_from, reply_to, template, name, url);
    res.status(200).json({ message: "Email Sent" });
  } catch (error) {
    return res.status(500).json({ message: "Email Could Not send" });
  }
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { resetPasswordToken } = req.params;

  const { password } = req.body;

  if (!password) {
    return res.status(404).json({ message: "Password is required" });
  }

  const hashedToken = hashToken(resetPasswordToken);

  const userToken = await Token.findOne({
    passwordResetToken: hashedToken,
    expiresAt: { $gt: Date.now() },
  });

  if (!userToken) {
    return res.status(400).json({ message: "Invalid or expired reset token" });
  }

  const user = await User.findById(userToken.userId);

  user.password = password;
  await user.save();

  res.status(200).json({ message: "Password reset successfully" });
});
