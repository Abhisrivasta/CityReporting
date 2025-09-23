import dotenv from "dotenv";
dotenv.config({ override: true });
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.config.ts";
import userRoutes from "./routes/user.route.ts";
import userReport from "./routes/report.route.ts";


const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.static(path.join(__dirname, "../public")));

app.use("/api/users", userRoutes);
app.use("/api/reports", userReport);


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
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
