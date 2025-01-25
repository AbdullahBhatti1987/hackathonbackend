import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

dotenv.config(); // Load .env file

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(morgan("tiny"));
// console.log("MONGODB_URI", process.env.MONGO_URI);           // connected hai
console.log("MONGODB_URI", "process.env.MONGO_URI connected");  // sirf console me dekhne kay liye hai


app.get('/api/v1/data', (req, res) => {
    res.json({ message: 'Hello Raza from Backend!' });
  });


// Check if MONGO_URI is defined
if (!process.env.MONGO_URI) {
  console.error('Error: MONGO_URI is undefined. Please check your .env file.');
  process.exit(1); // Exit the app
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

