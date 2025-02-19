import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./db/connect.js";
import cookieParser from "cookie-parser";
import fs from "node:fs";
import errorHandler from "./src/helpers/errorHandler.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;

//middlewares

app.use(cookieParser());
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(errorHandler);
//routes
const routeFiles = fs.readdirSync("./src/routes");

routeFiles.forEach((file) => {
  // use dynamic import files

  import(`./src/routes/${file}`)
    .then((route) => {
      app.use("/api/v1", route.default);
    })
    .catch((error) => {
      console.log(error.message);
    });
});

let server = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.log("Failed to start server...", error.message);
  }
};

server();
