import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import userRoute from "./src/routes/user.routes.js";


dotenv.config(); // Load .env file

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());  
// app.use(express.urlencoded({ extended: true }));

app.use(cors());
app.use(morgan("tiny"));
console.log("MONGODB_URI", process.env.MONGO_URI);       

app.use("/api/v1/user", userRoute);


if (!process.env.MONGO_URI) {
  console.error('Error: MONGO_URI is undefined. Please check your .env file.');
  process.exit(1);
}


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });

// Connect to the database
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('Database Connected.'))
  .catch((err) => {
    console.error('Database Connection Error:', err);
    process.exit(1); // Exit the app if DB connection fails
  });

