import asyncHandler from "express-async-handler";
import User from "../../models/auth/user.model.js";
import generateToken from "../../helpers/generateToken.js";
import bcrypt from "bcrypt";
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
