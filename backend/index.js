import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

import { connectDB } from "./db/connectDB.js";

import authRoutes from "./routes/auth.route.js";
import fileRoutes from "./routes/file.route.js";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors({
    origin: ["https://last-minute-scsit.vercel.app", "https://lastminutescsit-api.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send('LastMinute SCSIT api running successfully! new deploy');
});

app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);

app.use('/api/files', fileRoutes);
app.listen(PORT, () => {
	console.log("Server is running on port: ", PORT);
});