import express from "express";
import dotenv from "dotenv";
// import cors from "cors";
import { connectDB } from "./config/db.config.ts";
import userRoutes from "./routes/user.route.ts";

dotenv.config();

const app = express();

// Middleware
// app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("Smart City API is running!");
});

// Start server after DB connection
const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server", err);
  }
};

startServer();
