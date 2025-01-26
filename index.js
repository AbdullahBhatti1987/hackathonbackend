if (!process.env.MONGO_URI) {
  console.error("MONGO_URI is not defined in .env");
  process.exit(1);
}

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import morgan from "morgan";



import cityRoute from "./routes/city.routes.js";
import employeeRoute from "./routes/employee.routes.js";
import cityRoute from "./routes/city.routes.js";
import branchRoute from "./routes/branch.routes.js";
import departmentRoute from "./routes/department.routes.js";
import seekerRoute from './routes/seeker.route.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));
console.log("MONGODB_URI", process.env.MONGO_URI);

app.use("/api/v1/employee", employeeRoute);
app.use("/api/v1/city", cityRoute);
app.use("/api/v1/branch", branchRoute);
app.use("/api/v1/department", departmentRoute);
app.use("/api/v1/seeker", seekerRoute);



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
