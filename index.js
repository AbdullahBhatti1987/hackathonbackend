if (!process.env.MONGO_URI) {
  console.error("MONGO_URI is not defined in .env");
  process.exit(1);
}

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import morgan from "morgan";
import studentRoute from "./routes/student.routes.js";
// import authRoute from "./routes/auth.routes.js";
import userRoute from "./routes/user.routes.js";
import courseRoute from "./routes/course.routes.js";
import campusRoute from "./routes/campus.routes.js";
import sectionRoute from "./routes/section.routes.js";
import batchRoute from "./routes/batch.routes.js";
import cityRoute from "./routes/city.routes.js";
import classRoute from "./routes/class.routes.js";
import quizRoute from "./routes/quiz.routes.js";
import assignmentRoute from "./routes/assignments.routes.js";
import userquizRoute from "./routes/userquiz.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));
console.log("MONGODB_URI", process.env.MONGO_URI);

app.use("/api/v1/student", studentRoute);

// Auth Routes
// app.use("/api/v1/auth", authRoute);

// Auth Routes
app.use("/api/v1/user", userRoute);

// Course Routes
app.use("/api/v1/course", courseRoute);

// Class Routes
app.use("/api/v1/class", classRoute);

// City Routes
app.use("/api/v1/section", sectionRoute);

// City Routes
app.use("/api/v1/city", cityRoute);

// Campus Routes
app.use("/api/v1/campus", campusRoute);

// Batch Routes
app.use("/api/v1/batch", batchRoute);

// Quiz Routes
app.use("/api/v1/quiz", quizRoute);

// Assignment Routes
app.use("/api/v1/assignment", assignmentRoute);

// User Quiz Routes
app.use("/api/v1/userquiz", userquizRoute);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Database connected successfully.");
  })
  .catch((error) => {
    console.error("Database connection error:", error.message);
    process.exit(1); // Consider removing this if you want the server to attempt reconnecting
  });
