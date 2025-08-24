import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ApiError } from "./utils/ApiError.js";
const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

// IMPORT USERROUTE
import UserRouter from "./routes/user.routes.js";

// ROUTER DECLERATION

app.use("/api/V1/users", UserRouter);


// http://localhost:8000/api/V1/users/register


// Error handling middleware
app.use((err, req, res, next) => { 
  console.error("🔥 Error caught:", err);

  // If error is instance of ApiError, return structured JSON
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json(err.toJSON());
  }

  // For other errors, still return JSON
  return res.status(500).json({
    success: false,
    statusCode: 500,
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});


// app.use("/", (req, res) => {
//   res.status(200).json({
//     success: true,
//     message: "👋 Welcome Developer! Your backend server is running smoothly 🚀",
//     docs: "http://localhost:8000/api-docs", // (optional if you add docs later)
//     status: "✅ OK"
//   });
// });


export { app };
