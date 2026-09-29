import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import studentRoutes from "./routes/studentRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";

const app = express();

// ================= CORS =================

app.use(
    cors({
        origin: [
            "http://localhost:5174",
            "https://nubtkhulnaacbd.vercel.app"
        ],
        credentials: true,
    })
);

// ================= Middleware =================

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));

app.use(cookieParser());

// ================= Test Route =================

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Student Result Management System Backend is Running"
    });
});

// ================= Routes =================

app.use("/api/students", studentRoutes);

app.use("/api/results", resultRoutes);

export default app;