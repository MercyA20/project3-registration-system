import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import { connectToMongo } from "./db.js";

import studentsRouter from "./routes/students.js";
import coursesRouter from "./routes/courses.js";
import facultyRouter from "./routes/faculty.js";
import sectionsRouter from "./routes/sections.js";
import enrollmentsRouter from "./routes/enrollments.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend files from the public folder
app.use(express.static(path.join(__dirname, "../public")));

// API Routes
app.use("/api/students", studentsRouter);
app.use("/api/courses", coursesRouter);
app.use("/api/faculty", facultyRouter);
app.use("/api/sections", sectionsRouter);
app.use("/api/enrollments", enrollmentsRouter);

// Home Route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Health Check
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running!"
  });
});

// Start Server
const PORT = process.env.PORT || 3000;

connectToMongo(
  process.env.MONGO_URL,
  process.env.MONGO_DB
)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  });