import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

import { connectDB } from "./db/connectDB.js";

import authRoutes from "./routes/auth.route.js";
import fileRoutes from "./routes/file.route.js";
import attendanceRoutes from "./routes/attendance.route.js";
import todoRoutes from "./routes/todo.routes.js";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? [
        "https://last-minute-scsit.vercel.app",
        "https://lastminutescsit.vercel.app"
      ]
    : ["http://localhost:5173"];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"]
}));
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send('LastMinute SCSIT api running successfully! new deploy');
});

app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/todos", todoRoutes);

app.listen(PORT, () => {
	console.log("Server is running on port: ", PORT);
});