import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.config.ts";
import userRoutes from "./routes/user.route.ts";
import userReport from "./routes/report.route.ts"

dotenv.config();

const app = express();


app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/reports",userReport)

app.get("/", (req, res) => {
  res.send("Smart City API is running!");
});

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
