import mongoose from "mongoose";
import bcrypt, { hash } from "bcrypt";
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "please provide your name"],
    },

    email: {
      type: String,
      required: [true, "please enter email"],
      trim: true,
      unique: true,
      match: [
        /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
        "please enter valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please Enter the password!"],
    },
    photo: {
      type: String,
      default: "https://avatars.githubusercontent.com/u/67712314?v=4",
    },
    bio: {
      type: String,
      default: "I am New User",
    },
    role: {
      type: String,
      enum: ["user", "admin", "creator"],
      default: "user",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, minimize: true }
);

UserSchema.pre("save", async function (next) {
  //hash the password using bcrypt

  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);

  //hash the password

  const hashedPassword = await bcrypt.hash(this.password, salt);
  this.password = hashedPassword;

  //call the next middleware

  next();
});
const User = mongoose.model("user", UserSchema);

export default User;
