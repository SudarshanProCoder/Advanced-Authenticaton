import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log("Attempting to connect to database...");
    await mongoose.connect(process.env.MONGO_URL, {});
    console.log("connectsed to database...");
  } catch (error) {
    console.log("MongoDb Not Connected...", error.message);
    process.exit(1);
  }
};

export default connectDB;
